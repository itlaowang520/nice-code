import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Icon, Spin } from 'antd';
import { Downloader, Parser, Player } from 'svga.lite';
import './style.scss';
import { getUniqueID } from '../../utils';
export default class KSSvgaPreview extends Component {
    static propTypes = {
        src: PropTypes.string,
        style: PropTypes.object, // 组件外层div的样式
        clickAble: PropTypes.bool, // 是否可点击预览
    }
    static defaultProps = {
        style: {
            width: 30,
            height: 30
        },
    }
    player;

    id = getUniqueID();

    state = {
        visible: false,
        width: 200,
        modalLoading: false
    }

    componentDidMount() {
        this.syncSvga('player', `#ks-svga-canvas-${this.id}`);
    }

    /**
     * 播放
     */
    syncSvga = async(player, canvasId) => {
        if (this[player]) {
            return;
        }
        const { src: svgaUrl } = this.props;
        const downloader = new Downloader();
        // 默认调用 WebWorker 线程解析
        const parser = new Parser();
        // #canvas 是 HTMLCanvasElement
        this[player] = new Player(canvasId);
        const fileData = await downloader.get(svgaUrl);
        const svgaData = await parser.do(fileData);
        this[player].set({
            loop: 0,
        });
        await this[player].mount(svgaData);
        this[player].start(); // 开始播放动画
        this.setState({
            width: this[player].container.offsetWidth + 10
        });
    }
    /**
     * 改变预览modal框的显隐
     */
    changeVisible = async(e) => {
        e.stopPropagation();
        if (!this.props.clickAble) { return; }
        this.setState({
            visible: !this.state.visible,
        }, () => {
            const { visible } = this.state;
            if (visible) {
                this.setState({
                    modalLoading: true
                });
                setTimeout(() => {
                    this.syncSvga('previewPlayer', `#ks-svga-canvas-preview-${this.id}`);
                    this.setState({
                        modalLoading: false
                    });
                });
            } else {
                // this.player.clear(); // 清除动画，解决播放叠加问题
                // this.syncSvga(`#ks-svga-canvas-${id}`);
            }
        });
    }

    render() {
        const { visible, width, modalLoading } = this.state;
        const { style } = this.props;
        return (
            <div>
                <canvas
                    id={`ks-svga-canvas-${this.id}`}
                    style={{
                        ...style,
                        cursor: 'pointer'
                    }}
                    onClick={this.changeVisible}
                ></canvas>
                <Modal
                    wrapClassName="image-preview-modal-wrap"
                    closable={false}
                    visible={visible}
                    width={width}
                    onCancel={this.changeVisible}
                    bodyStyle={{ padding: '5px' }}
                    style={{ minWidth: '10px' }}
                    footer={null}
                >
                    <Spin spinning={modalLoading}>
                        <div className='modal-close-btn' onClick={this.changeVisible}>
                            <Icon type='close' />
                        </div>
                        <canvas
                            id={`ks-svga-canvas-preview-${this.id}`}
                        ></canvas>
                    </Spin>
                </Modal>
            </div>
        );
    }
}
