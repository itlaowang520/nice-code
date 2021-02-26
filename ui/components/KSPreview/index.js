import React from 'react';
import PropTypes from 'prop-types';
import {
    FILE_TYPE, SUPPORT_SUFFIX,
    IMAGE_SUFFIX, AUDIO_SUFFIX, VIDEO_SUFFIX,
    IMAGE_POSTER, AUDIO_POSTER, VIDEO_POSTER,
    SVGA_SUFFIX
} from './constants';
import { Icon, Modal, message } from 'antd';
import KSSvgaPreview from '../KSSvgaPreview';
import { KS_CDN_DOMAIN } from '../../utils/constants';
import './style.scss';

export default class KSPreview extends React.Component {
    static propTypes = {
        previewText: PropTypes.string, // 无缩略图时展示的预览文字
        src: PropTypes.string, // 图片地址
        poster: PropTypes.string, // 海报图
        style: PropTypes.object, // 组件外层div的样式
        className: PropTypes.string, // 给组件外层div增加了类名
        // 是否显示缩略图
        thumbnail: PropTypes.bool,
        children: PropTypes.node, // 要展示的自定义缩略图示标签
        clickAble: PropTypes.bool, // svga是否可点击预览
    };

    static defaultProps = {
        previewText: '预览',
        clickAble: true,
    };

    constructor(props) {
        super(props);
        // 全局变量 image，用来获取预览图片的真实宽高
        this.defaultStyle = { width: 30, height: 30 };
        this.image = new Image();
        this.audio = null;
        this.video = document.createElement('video');
        // 记录上次预览图片的地址
        this.preUrl = undefined;
        this.state = {
            style: { ...this.defaultStyle, ...this.props.style },
            visible: false, // 预览modal是否渲染展示
            ...this.getFileType()
        };
    }

    /**
     * 获取文件类型
     * @return {{fileSuffix: string, fileType: string}}
     */
    getFileType = () => {
        let fileSuffix = this.props.src.split('?').shift().split('.').pop(),
            fileType;

        if (IMAGE_SUFFIX.some((item) => item === fileSuffix)) {
            fileType = FILE_TYPE.IMAGE;
        }
        if (AUDIO_SUFFIX.some((item) => item === fileSuffix)) {
            fileType = FILE_TYPE.AUDIO;
        }
        if (VIDEO_SUFFIX.some((item) => item === fileSuffix)) {
            fileType = FILE_TYPE.VIDEO;
        }
        if (SVGA_SUFFIX.some((item) => item === fileSuffix)) {
            fileType = FILE_TYPE.SVGA;
        }
        return { fileSuffix, fileType };
        // this.setState({fileSuffix, fileType});
    };

    /**
     * 压缩图片
     */
    handleImgCompress(originImgUrl) {
        if (!originImgUrl) { return ''; }
        const { style: { width = 30 } } = this.state;
        if (originImgUrl.includes('.png')) { return originImgUrl; }
        if (KS_CDN_DOMAIN.some((domain) => originImgUrl.includes(domain))) {
            if (!Number(width)) {
                return originImgUrl;
            } else {
                return `${originImgUrl}?x-oss-process=image/quality,q_90/resize,w_${width}`;
            }
        } else {
            return originImgUrl;
        }
    }

    /**
     * 获取展示Node
     * @return {KSPreview.props.children}
     */
    getChildrenNode = () => {
        const { thumbnail, previewText, children } = this.props;
        const { fileType } = this.state;
        let childrenNode;
        // 有子节点，直接渲染子节点
        if (children) {
            childrenNode = children;
        } else if (!thumbnail && fileType === FILE_TYPE.IMAGE) {
            // 无子节点，且 !thumbnail 且是图片
            childrenNode = <a>{previewText}</a>;
        } else {
            const { src, poster } = this.props;
            let thumbnailStyle = this.state.style,
                childImgUrl;
            switch (fileType) {
                case FILE_TYPE.IMAGE:
                    childImgUrl = poster || src || IMAGE_POSTER;
                    childImgUrl = this.handleImgCompress(childImgUrl);
                    break;
                case FILE_TYPE.AUDIO:
                    childImgUrl = poster || AUDIO_POSTER;
                    break;
                case FILE_TYPE.VIDEO:
                    childImgUrl = poster || VIDEO_POSTER;
                    break;
            }
            childrenNode = <img style={{ ...thumbnailStyle }} src={childImgUrl} />;
        }
        return childrenNode;
    };

    /**
     * 获取播放按钮
     * @return {*}
     */
    getPlayerBtn = () => {
        if (this.state.fileType === FILE_TYPE.IMAGE) {
            return null;
        }
        return <span className='player-icon icon-play'></span>;
    };

    /**
     * 根据文件类型获取弹框中的内容Node
     * @return {*}
     */
    getModalContent = () => {
        const { src } = this.props;
        switch (this.state.fileType) {
            case FILE_TYPE.IMAGE:
                return <img style={{ width: '100%' }} src={src} />;
            case FILE_TYPE.VIDEO:
                return <video
                    controls
                    autoPlay
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                    // type={`video/${this.state.fileSuffix}`}
                    src={src}
                >
                    您的浏览器暂不支持该视频
                </video>;
        }
    };

    // getChildrenNodeParentStyle = () => {
    //     const { thumbnail, children } = this.props;
    //     let w = '30px',
    //         style = {
    //             width: w,
    //             height: w
    //         };
    //     // 如果 thumbnail 是bool值，或者
    //     if ((children && !children.props.style) || typeof thumbnail === 'boolean') {
    //         return style;
    //     }
    //
    //     if (children && children.props.style) {
    //         const { width = '30px', height = '30px' } = children.props.style;
    //         return { width, height };
    //     }
    //
    //     if (typeof thumbnail !== 'boolean') {
    //         return thumbnail;
    //     }
    //     return style;
    // };

    /**
     * 获取弹框中的预览样式
     * @param url
     */
    handleStyle = (url, e) => {
        switch (this.state.fileType) {
            case FILE_TYPE.IMAGE:
                this.handleImageWidth(url);
                break;
            case FILE_TYPE.VIDEO:
                this.audioPause();
                this.handleVideoStyle(url);
                break;
        }
    };

    /**
     * 获取当前预览图片的实际宽度属性，以此初始化预览modal的宽度
     * @param url {string} 当前预览图片的地址
     */
    handleImageWidth = (url) => {
        let image = this.image,
            // 可展示图片预览图的最大宽度
            bodyWidth = document.body.offsetWidth * 6 / 10;
        // 如果当前地址与上次的地址一样，则只作宽度属性的改变
        if (url === this.preUrl) {
            this.setStyleState({
                width: image.width,
                bodyWidth
            });
        } else { // 否则，预示着预览图片是第一次加载，故需有个延迟处理
            image.src = url;
            this.preUrl = url;
            image.onload = () => {
                this.setStyleState({
                    width: image.width,
                    bodyWidth
                });
            };
        }
    };

    /**
     * 设置预览modal的宽度
     * @param width {number} 图片的实际宽度
     * @param bodyWidth {number} 预览modal的最大宽度
     * @param height {number} 预览modal的最大高度
     */
    setStyleState = ({ width, bodyWidth }) => {
        // 图片实际宽度
        let style = { width };
        // 当图片实际宽度 > 可以显示当最大宽度时，对弹框宽度进行计算
        if (!width || width > bodyWidth) {
            style.width = bodyWidth;
        }
        this.setState(style);
    };

    /**
     * 获取当前预览视频的实际宽度属性，以此初始化预览modal的宽度
     * @param url {string} 当前预览视频的地址
     */
    handleVideoStyle = (url) => {
        if (url === this.preUrl) {
            return;
        }
        new Promise((resolve, reject) => {
            let video = this.video;
            video.onprogress = function() {
                resolve({ width: this.offsetWidth, height: this.offsetHeight });
                // this.src = 'about:blank';
                document.body.removeChild(video);
            };
            // video.autoplay = true;
            video.src = url;
            document.body.appendChild(video);
        }).then((res) => {
            let bodyHeight = document.body.offsetHeight * 7 / 10,
                bodyWidth = document.body.offsetWidth * 6 / 10,
                style = {},
                wRate = res.width / bodyWidth,
                hRate = res.height / bodyHeight;

            // 以宽为准放缩视频
            if (wRate > 1 && wRate > hRate) {
                style.width = bodyWidth;
                style.height = (res.height / res.width) * bodyWidth;
                if (style.height > bodyHeight) {
                    style.height = bodyHeight;
                    style.width = (res.width / res.height) * bodyHeight;
                }
            } else if (hRate > 1) {
                // 以高为准放缩视频
                style.width = (res.width / res.height) * bodyHeight;
                style.height = bodyHeight;
                if (style.width > bodyWidth) {
                    style.width = bodyWidth;
                    style.height = (res.height / res.width) * bodyWidth;
                }
            } else {
                style = {
                    width: 'auto',
                    height: 'auto',
                };
            }
            this.preUrl = url;
            this.setState(style);
        });
    };

    /**
     * 设置预览modal的宽度
     * @param width {number} 图片的实际宽度
     * @param bodyWidth {number} 预览modal的最大宽度
     * @param height {number} 预览modal的最大高度
     */
    setStyleState = ({ width, bodyWidth }) => {
        // 图片实际宽度
        let style = { width };
        // 当图片实际宽度 > 可以显示当最大宽度时，对弹框宽度进行计算
        if (!width || width > bodyWidth) {
            style.width = bodyWidth;
        }
        this.setState(style);
    };

    /**
     * 音频播放事件
     * @param e
     */
    audioPlay = (e) => {
        const playAudio = this.audioPause();
        if (this.audio !== playAudio) {
            let el;
            if (e.target.className.includes('player-icon')) {
                el = e.target;
            } else {
                el = e.target.nextSibling;
            }
            this.audio.load();
            this.audio.play();
            el.className = el.className.replace('icon-play', 'icon-pause');
        }
    };

    /**
     * 音频暂停事件
     * @return {Element || undefined}
     */
    audioPause = () => {
        const audios = document.getElementsByTagName('audio');
        const pauseIcons = document.getElementsByClassName('icon-pause');
        // 没有正在播放的音频，则直接 return 即可
        if (!pauseIcons.length) {
            return;
        }
        Array.from(pauseIcons).forEach((item) => { item.className = item.className.replace('icon-pause', 'icon-play'); });
        const playAudio = Array.from(audios).find((item) => !item.paused);
        playAudio && playAudio.pause();
        return playAudio;
    };

    /**
     * 点击
     * @param e
     */
    handlePreview = (e) => {
        const { fileType, fileSuffix } = this.state;
        if (!SUPPORT_SUFFIX.includes(fileSuffix)) {
            message.warn(`暂不支持 .${fileSuffix} 类型的文件预览`);
            return;
        }

        switch (fileType) {
            case FILE_TYPE.IMAGE:
            case FILE_TYPE.VIDEO:
                this.changeVisible(e);
                break;
            case FILE_TYPE.AUDIO:
                this.audioPlay(e);
                break;
        }
    };

    /**
     * 弹框显隐
     */
    changeVisible = (e) => {
        this.setState({
            visible: !this.state.visible
        }, () => {
            if (this.state.visible) {
                let url = this.props.src;
                this.handleStyle(url, e);
                // window.onresize = () => {
                //     this.handleStyle(url);
                // };
            } else {
                // window.onresize = null;
            }
        });
    };

    render() {
        const { style, fileType } = this.state;
        const { className, src, clickAble } = this.props;
        let props = {
                style,
                className
            },
            svgaProps = {
                src,
                style,
                clickAble,
                className,
            };
        if (fileType === FILE_TYPE.SVGA) {
            return <KSSvgaPreview
                {...svgaProps}
            />;
        }
        return (
            <div
                {...props}
                className='preview-wrap'
            >
                <div
                    onClick={this.handlePreview}
                    className='thumbnail-wrap'
                    style={style}
                >
                    {this.getChildrenNode()}
                    {this.getPlayerBtn()}
                </div>
                {
                    this.state.visible && <Modal
                        wrapClassName="preview-modal-wrap"
                        className="preview-modal"
                        closable={false}
                        visible={true}
                        onCancel={this.changeVisible}
                        width={this.state.width}
                        bodyStyle={{ height: this.state.height }}
                        style={{ minWidth: '10px' }}
                        footer={null}
                    >
                        <div className='modal-close-btn' onClick={this.changeVisible}>
                            <Icon type='close' />
                        </div>
                        {
                            this.getModalContent()
                        }
                    </Modal>
                }
                {
                    this.state.fileType === FILE_TYPE.AUDIO && <audio
                        ref={(ref) => { this.audio = ref; }}
                        src={src}
                    // type={`audio/${this.state.fileSuffix}`}
                    >
                        您的浏览器暂不支持该音频
                    </audio>
                }
            </div>
        );
    }
}
