import React from 'react';
import { Layout } from 'antd';
import './index.scss';
import PropTypes from 'prop-types';

const { Sider, Content } = Layout;

export default class KSLayout extends React.PureComponent {
    static propTypes = {
        config: PropTypes.object,
        sider: PropTypes.node,
        content: PropTypes.node,
        siderTitle: PropTypes.node,
        contentTitle: PropTypes.node,
        modalMode: PropTypes.bool,
        drag: PropTypes.bool,
    }
    static defaultProps = {
        drag: false
    };
    state = {
        initWidth: 180
    }
    dragNode = null;
    flag = false;
    initScreenX = undefined;
    removeListener = null;
    componentDidMount() {
        if (this.props.drag) {
            this.removeListener = this.addListener();
        }
    }
    /**
     * 鼠标事件监听
     * @return {Function}
     */
    addListener() {
        let that = this;
        document.addEventListener('mouseup', this.onMouseUp);
        this.dragNode.addEventListener('mousedown', (e) => {
            e.preventDefault();
            that.flag = true;
            that.initScreenX = e.screenX;
            document.addEventListener('mousemove', this.onMouseMove);
        });
        return () => {
            document.removeEventListener('mouseup', (e) => {});
            this.dragNode.removeEventListener('remove', (e) => {});
        };
    }
    /**
     * 松开鼠标
     */
    onMouseUp = () => {
        document.removeEventListener('mousemove', this.onMouseMove);
        this.flag = false;
    };
    /**
     * 鼠标move
     * @param event
     */
    onMouseMove = (event) => {
        if (this.flag && this.initScreenX) {
            const {initWidth} = this.state;
            if (event.screenX - this.initScreenX >= 0) {
                window.requestAnimationFrame(() => {
                    this.setState({
                        initWidth: initWidth < 180 ? 180 : event.screenX - this.initScreenX + 180
                    });
                });
            } else {
                window.requestAnimationFrame(() => {
                    this.setState({
                        initWidth: (initWidth - (this.initScreenX - event.screenX)) < 180 ? 180 : (initWidth - (this.initScreenX - event.screenX))
                    });
                });
            }
        }
    };
    componentWillUnmount() {
        this.removeListener && this.removeListener();
    }
    render() {
        const {
            modalMode, config,
            siderTitle, sider,
            contentTitle, content, drag
        } = this.props;
        const {initWidth} = this.state;
        return (
            <Layout className={modalMode ? 'modalLayout' : 'layout'} style={{background: '#ffffff'}}>
                <Sider
                    theme='light'
                    width={initWidth}
                    { ...config }
                    className='layoutSider'
                >
                    {
                        siderTitle && <div className='layoutTitle'>{ siderTitle }</div>
                    }
                    <div className={siderTitle ? 'sider-content-title' : 'sider-content'}>
                        { sider }
                    </div>
                </Sider>
                {drag ? <div className="sider-drag-line" ref={(el) => { this.dragNode = el; }} style={{left: `${initWidth}px`}}/> : null}
                <Content>
                    {
                        contentTitle && <div className='layoutTitle'>{ contentTitle }</div>
                    }
                    { content }
                </Content>
            </Layout>
        );
    }
}
