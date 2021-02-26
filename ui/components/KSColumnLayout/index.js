import React from 'react';
import PropTypes from 'prop-types';
import './index.scss';

export default class KSColumnLayout extends React.PureComponent {
    static propTypes = {
        upTitle: PropTypes.node,
        downTitle: PropTypes.node, // 下节点title
        upNode: PropTypes.node,
        downNode: PropTypes.node,
        onResize: PropTypes.func,
        minVNum: PropTypes.number,
        onDrag: PropTypes.func, // 开始拖拽事件
        onDrop: PropTypes.func, // 结束拖拽事件
        onMove: PropTypes.func, // 拖拽中事件
        minHeight: PropTypes.number, // 最小高度
    }

    static defaultProps = {
        minHeight: 100
    }

    state = {
        isVResize: false,
        isDraged: false,
        upContainerHeight: ''
    };

    upContainer; // 上边table容器

    /* 开始拖拽 */
    onDrag = (e) => {
        const { onDrag, onDrop, onMove, minHeight } = this.props;
        const { clientY: startClientY } = e;
        const originUpContainerHeight = this.upContainer.offsetHeight;
        onDrag && onDrag();
        document.onmousemove = (moveEvent) => {
            const { clientY: currentClientY } = moveEvent;
            const upHeight = originUpContainerHeight + currentClientY - startClientY;
            const upContainerHeight = upHeight < minHeight ? minHeight : upHeight;
            this.setState({
                isDraged: true,
                upContainerHeight
            });
            onMove && onMove(upContainerHeight);
        };
        document.onmouseup = () => {
            onDrop && onDrop(this.state.upContainerHeight);
            document.onmousemove = null;
            document.onmouseup = null;
        };
    }

    render() {
        const { upContainerHeight } = this.state;
        return (
            <div
                className='colContainer'
            >
                <div
                    className='colWhiteCard up'
                    ref={(ref) => { this.upContainer = ref; }}
                    style={{ height: (upContainerHeight || `calc(50% - ${5}px)`) }}
                >
                    {
                        this.props.upTitle && <div className='colWhiteCard-title'>
                            { this.props.upTitle }
                        </div>
                    }
                    <div className='colWhiteCard-content'>
                        {
                            this.props.upNode
                        }
                    </div>
                </div>
                <div
                    className="colWhiteCard-divider"
                    draggable={false}
                    onMouseDown={this.onDrag}
                />
                <div className='colWhiteCard down'>
                    {
                        this.props.downTitle && <div className='colWhiteCard-title'>
                            { this.props.downTitle }
                        </div>
                    }
                    <div className='colWhiteCard-content'>
                        {
                            this.props.downNode
                        }
                    </div>
                </div>
            </div>
        );
    }
}
