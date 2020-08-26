import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Icon } from 'antd';
import './index.scss';

export default class KSImgPreview extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            width: 10, // 预览modal的最小默认宽度
            visible: false // 预览modal是否渲染展示
        };
    }
    static propTypes = {
        imgPreviewText: PropTypes.string, // 无缩略图时展示的预览文字
        text: PropTypes.string, // 无缩略图时展示的预览文字
        imgPreviewUrl: PropTypes.string, // 图片地址
        src: PropTypes.string, // 图片地址
        style: PropTypes.object, // 组件外层div的样式
        className: PropTypes.string, // 给组件外层div增加了类名
        // 是否显示缩略图
        thumbnail: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.object
        ]),
        children: PropTypes.node // 要展示的自定义缩略图示标签
    }
    static defaultProps = {
        imgPreviewText: '预览',
    }

    // 全局变量 image，用来获取预览图片的真实宽高
    image = new Image();
    // 记录上次预览图片的地址
    preImgUrl = undefined;

    /**
     * 组件数据更新时调用的生命周期方法
     * 此处作用：当visible变化时，对预览modal作初始化动作
     * @param nextProps
     * @param nextState
     * @param nextContext
     */
    componentDidUpdate(prevProps, prevState) {
        if (prevState.visible === this.state.visible) {
            return;
        }
        // 当visible变为true时，初始化预览modal，同时添加resize事件
        if (this.state.visible) {
            let imgUrl = prevProps.imgPreviewUrl || prevProps.src;
            this.handleImage(imgUrl);
            window.onresize = () => {
                this.handleImage(imgUrl);
            };
        } else {
            window.onresize = null;
        }
    }

    /**
     * 获取当前预览图片的实际宽度属性，以此初始化预览modal的宽度
     * @param imgUrl {string} 当前预览图片的地址
     */
    handleImage = (imgUrl) => {
        let image = this.image,
            // 可展示图片预览图的最大宽度
            bodyWidth = document.body.offsetWidth * 6 / 10;
        // 如果当前地址与上次的地址一样，则只作宽度属性的改变
        if (imgUrl === this.preImgUrl) {
            this.setWidthState({
                width: image.width,
                bodyWidth
            });
        } else { // 否则，预示着预览图片是第一次加载，故需有个延迟处理
            image.src = imgUrl;
            this.preImgUrl = imgUrl;
            image.onload = () => {
                this.setWidthState({
                    width: image.width,
                    bodyWidth
                });
            };
        }
    }

    /**
     * 设置预览modal的宽度
     * @param width {number} 图片的实际宽度
     * @param bodyWidth {number} 预览modal的最大宽度
     */
    setWidthState({width, bodyWidth}) {
        // 当图片实际宽度 > 可以显示当最大宽度时，对弹框宽度进行计算
        if (width > bodyWidth) {
            this.setState({width: bodyWidth});
        } else {
            // 否则 展示图片实际宽度
            this.setState({width});
        }
    }

    /**
     * 改变预览modal框的显隐
     */
    changeVisible = async(e) => {
        e.stopPropagation();

        this.setState({
            visible: !this.state.visible
        });
    }

    /**
     * 获取预览组件的初始展示节点
     * 以children优先级最高，展示传入的children节点内容
     * 如果没有children，则判断thumbnail是否为true，为true则内部动作完成缩略图的展示渲染
     * 否则以文字提示的形式渲染展示
     * @returns {*} Node节点
     */
    getContainerNode() {
        const { imgPreviewUrl, src, thumbnail, text, imgPreviewText } = this.props;
        let { children } = this.props;
        if (children) {
            return <div onClick={this.changeVisible}>{children}</div>;
        } else if (thumbnail) {
            let thumbnailStyle = typeof thumbnail === 'boolean' ? {width: '30px', height: '30px'} : thumbnail;
            return (
                <div onClick={this.changeVisible}>
                    <img style={{...thumbnailStyle, cursor: 'pointer'}} src={imgPreviewUrl || src} />
                </div>
            );
        } else {
            return <a onClick={this.changeVisible}>{text || imgPreviewText}</a>;
        }
    }

    render() {
        let containerNode = this.getContainerNode();
        const { style, className, imgPreviewUrl, src } = this.props;
        let props = {
            style,
            className
        };
        return (
            <div {...props}>
                {
                    containerNode
                }
                {
                    this.state.visible && <Modal
                        wrapClassName="image-preview-modal-wrap"
                        className="image-preview-modal"
                        closable={false}
                        visible={true}
                        onCancel={this.changeVisible}
                        width={this.state.width}
                        bodyStyle={{padding: '5px'}}
                        style={{ minWidth: '10px' }}
                        footer={null}
                    >
                        <div className='modal-close-btn' onClick={this.changeVisible}>
                            <Icon type='close' />
                        </div>
                        <img style={{ width: '100%' }} src={src || imgPreviewUrl} />
                    </Modal>
                }
            </div>
        );
    }
}
