import React, { Component } from 'react';
import { renderToString } from 'react-dom/server';
import PropTypes from 'prop-types';
import { Spin } from 'antd';
import { Jodit } from 'jodit';
import FileListModal from './FileListModal';
import 'jodit/build/jodit.min.css';
import './style.scss';
import { checkOriginImg, insertUploadFilesToEditor, getFileUrl, addClassToMediaTag } from './utils';
import { IMAGE_SUFFIX, AUDIO_SUFFIX, VIDEO_SUFFIX, MODE } from './constants';

const saveApi = '/system-server/sys/file/save';
const uploadApi = '/system-server/sys/file/fileUpload';
const [PC_DICT, MOBILE_DICT] = MODE;
const {key: PC} = PC_DICT;
const {key: MOBILE} = MOBILE_DICT;

// 支持上传的文件类型
export const SUPPORT_SUFFIX = [].concat(IMAGE_SUFFIX, AUDIO_SUFFIX, VIDEO_SUFFIX);

export const UPLOAD_CONFIG = {
    folderCode: 'kms-rich-text',
    fileTypeCode: 'image'
};

let that;

/**
 * 富文本组件
 */

export default class KSNewEditor extends Component {
    static propTypes = {
        value: PropTypes.string,
        onChange: PropTypes.func,
        onRef: PropTypes.func,
        request: PropTypes.func,
        // 基本配置
        config: PropTypes.object,
        // 自定义按钮
        extraButtons: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            tooltip: PropTypes.string,
            iconURL: PropTypes.string,
            popup: PropTypes.func,
            exec: PropTypes.func,
        })),
        // // jodit 的事件
        // events: PropTypes.object,
        uploadConfig: PropTypes.shape({
            // 当前项目上传文件时所在的文件夹code
            folderCode: PropTypes.string,
            // 当前项目上传文件时所在的文件类型code
            fileTypeCode: PropTypes.string,
        }),
        // 外链转内链接口回调成功的外部回调
        getLoadStatus: PropTypes.func,
        handleImageBtnClick: PropTypes.func,
        mode: PropTypes.string, // 模式
        disabled: PropTypes.bool, // 是否禁用
    };

    modelRef; // 弹窗ref

    static defaultProps = {
        uploadConfig: {
            folderCode: 'kms-rich-text',
            fileTypeCode: 'image'
        },
        mode: PC,
        request: () => {},
        onRef: () => {},
        getLoadStatus: () => {},
        onChange: () => {},
        handleImageBtnClick: () => {},
    };

    constructor(props) {
        super(props);
        that = this;
        this.editor = React.createRef();
        this.state = {
            mode: this.props.mode,
            firstGetValue: true,
            selData: undefined,
            loading: false, // 外链转内链接口回调成功
            uploadConfig: this.getUploadConfig(),
            config: {
                useAceEditor: false,
                sourceEditor: 'area',
                // readonly: true // 只读
                language: 'zh_cn', // 语言
                // showCharsCounter: false, // 是否显示字数
                toolbarAdaptive: false, // 禁止不同大小显示器上button的展示不同
                placeholder: '请输入...',
                // toolbarSticky: true, // 该值默认为true
                // toolbarStickyOffset: 10, sticky定位时距离上边距的大小
                toolbarButtonSize: 'small', // 工具栏按钮大小
                spellcheck: false, // 拼写检查
                // userSearch: false, // 是否使用内部搜索功能，此属性不管用，jodit的bug
                disablePlugins: 'search', // 是否使用内部搜索功能
                enter: 'div', // 回车换行添加的标签
                height: 500, // 默认高度
                // editHTMLDocumentMode: true, // 可以拖动改变图片宽高
                useSplitMode: true, // 是否启用分布式布局
                defaultMode: '1', // WYSIWYG 所见即所得模式
                askBeforePasteFromWord: false,
                askBeforePasteHTML: false,
                // 配合paste事件使用的属性：修复第一次粘贴时不会走完整的paste事件流程(不走processPaste)
                processPasteHTML: false,
                processPasteFromWord: false,
                insertImageAsBase64URI: true,
                allowResizeY: false, // 禁止拖拽改变高度，默认值为true，allowResizeX 默认值为false
                buttons: [
                    'undo', 'redo', '|',
                    // 'source', '|',
                    'font', 'fontsize', 'brush', 'paragraph', '|',
                    'bold', 'strikethrough', 'underline', 'italic', 'eraser', '|',
                    // 'superscript',
                    // 'subscript',
                    // '|',
                    'ul', 'ol', '|',
                    'outdent', 'indent', 'align', '|',
                    // 'file',
                    // 'video',
                    // 'table',
                    // 'link',
                    'image', '|',
                    'selectall', 'cut', 'copy', 'paste', 'copyformat', '|',
                    'hr',
                    'fullsize',
                    // 'symbol',
                    // 'print',
                    // 'about'
                ],
                // 上传相关配置
                uploader: {
                    url: saveApi,
                    format: 'json',
                    contentType: function() {
                        return 'application/json';
                    },
                    filesVariableName: function() { return 'files'; }, // 对应下边所有上传相关钩子函数的data中文件的字段名
                    buildData: async function(data) {
                        that.setCurrentLoading(true);
                        let files = data.getAll('files'),
                            error = false;
                        files.forEach((file) => {
                            if (!SUPPORT_SUFFIX.includes(file.type.split('/').pop())) {
                                error = true;
                            }
                        });
                        if (error) {
                            throw new Error('暂不支持的文件格式');
                        }
                        let localPath = [];
                        for (let item of files) {
                            let file = new FormData();
                            file.append('file', item);
                            const response = await that.props.request(uploadApi, {
                                method: 'post',
                                body: file
                            });
                            if (response && response.code === 0) {
                                localPath.push(response.localPath);
                            }
                        }
                        return {
                            localPath: localPath.toString(),
                            ...that.getUploadConfig(),
                        };
                    },
                    queryBuild: function(data) {
                        // 必须得有此处得return，否则buildData返回得数据不能正常传入接口
                        return JSON.stringify(data);
                    },
                    isSuccess: function(resp) {
                        return resp.list;
                    },
                    // getMessage: function (resp) {
                    //     return resp.msg;
                    // },
                    process: function(resp) {
                        // 此处返回的数据回走到defaultHandlerSuccess中
                        return {
                            files: resp.list || [],
                            error: resp.error,
                            msg: resp.msg
                        };
                    },
                    defaultHandlerSuccess: function(resp) {
                        that.insertFilesToEditor(resp.files, this.jodit);
                    },
                    error: function(e) {
                        this.jodit.events.fire('errorMessage', e.message, 'error', 4000);
                        that.setCurrentLoading(false);
                    },
                },
                events: {
                    beforePaste: () => {
                        const target = event.clipboardData || window.clipboardData || event.originalEvent.clipboardData;
                        if (!target) {
                            console.error('没有粘贴板数据event', target);
                            return;
                        }
                        let pastedText = addClassToMediaTag(target.getData('text/html')),
                            matchImg = getFileUrl(pastedText);
                        // 有链接图片时走return，否则放行
                        if (matchImg.length) {
                            that.setCurrentLoading(true);
                            checkOriginImg(pastedText, matchImg, this);
                            // 通过将该方法return false拦截当前的paste事件
                            return false;
                        }
                    },
                    change: (value) => {
                        this.props.onChange(value);
                    },
                },
                controls: {
                    image: {
                        exec: () => {
                            const selData = this.editor.current.selection.save();
                            this.setState({ selData });
                            this.props.handleImageBtnClick();
                        }
                    },
                },
                extraButtons: [
                    {
                        name: 'mode',
                        tooltip: '预览模式',
                        exec: () => {
                            this.changeModel();
                        },
                        update: (button) => {
                            const DICT = this.findOtherModeDict(this.props.mode);
                            if (button) {
                                const mode = button.text['data-mode'];
                                if (mode !== DICT.key) {
                                    button.text['data-mode'] = DICT.key;
                                    button.text.innerHTML = renderToString(<img
                                        style={{width: '16px'}}
                                        src={DICT.url}
                                    />);
                                }
                            }
                        },
                        // 已废弃，改用update
                        // getLabel: (editor, btn, button) => {
                        //     const DICT = this.findOtherModeDict(this.props.mode);
                        //     if (button) {
                        //         const mode = button.textBox['data-mode'];
                        //         if (mode !== DICT.key) {
                        //             button.textBox['data-mode'] = DICT.key;
                        //             button.textBox.innerHTML = renderToString(<img
                        //                 style={{width: '16px'}}
                        //                 src={DICT.url}
                        //             />);
                        //         }
                        //     }
                        // },
                    },
                ]
            }
        };
    }

    /**
     * 切换模式
     */
    changeModel = () => {
        const { mode } = this.state || {};
        this.setState({
            mode: mode === MOBILE ? PC : MOBILE
        }, () => {
            if (mode === MOBILE) {
                document.querySelector('.jodit-container').style.width = null;
            } else {
                document.querySelector('.jodit-container').style.width = '375px';
            }
        });
    }

    /**
     * 获取模式icon
     */
    findOtherModeDict = (defaultModel) => {
        const mode = (this.state || {}).mode || defaultModel;
        switch (mode) {
            case PC:
                return MOBILE_DICT;
            case MOBILE:
                return PC_DICT;
        }
    }

    setCurrentLoading = (loading) => {
        this.props.getLoadStatus(loading);
        this.setState({
            loading
        });
    };

    /**
     * 获取uploadConfig
     * @return {{folderCode: (String|string), fileTypeCode: (String|string)}}
     */
    getUploadConfig = () => {
        const config = this.props.uploadConfig;
        return {
            folderCode: config.folderCode || UPLOAD_CONFIG.folderCode,
            fileTypeCode: config.fileTypeCode || UPLOAD_CONFIG.fileTypeCode,
        };
    };

    /**
     * 将上传的文件插入到富文本框内
     * @param fileList // 文件url
     * @param editor // 富文本Jodit对象
     * @param selData // 富文本Jodit记录的光标位置
     */
    insertFilesToEditor = (fileList, editor, selData) => {
        if (!editor) {
            editor = this.editor.current;
            selData = this.state.selData;
        }
        insertUploadFilesToEditor(fileList, editor, selData);
        that.setCurrentLoading(false);
    };

    async componentDidMount() {
        this.props.onRef(this);
        let { config = {}, extraButtons = [], value } = this.props;
        this.editor.current = Jodit.make(
            this.editor.current,
            {
                ...this.state.config,
                ...config,
                extraButtons: [...this.state.config.extraButtons, ...extraButtons]
            }
        );
        if (value) {
            const newValue = addClassToMediaTag(value);
            // 为了处理老数据中图片等外链没有替换成功的问题，需要对初始值做替换
            const matchImg = getFileUrl(newValue);
            // 有链接图片时走return，否则放行
            if (matchImg.length) {
                this.setCurrentLoading(true);
                await checkOriginImg(newValue, matchImg, this);
            } else {
                this.editor.current.value = newValue;
            }
        }

        // this.editor.current.value = value;
        this.setState({firstGetValue: false});
    }

    static getDerivedStateFromProps(props, state) {
        if (!state.firstGetValue && that.editor && that.editor.current && (that.editor.current.value !== props.value || !that.editor.current.value)) {
            if (props.value === undefined) {
                that.editor.current.value = '';
                that.editor.current && that.editor.current.selection && that.editor.current.selection.remove();
            } else {
                that.editor.current.value = props.value;
            }
        }
        return null;
    }

    render() {
        const { disabled } = this.props;
        return <Spin spinning={this.state.loading}>
            <textarea disabled={disabled} ref={this.editor} />
            <FileListModal
                ref={(ref) => {
                    this.modelRef = ref;
                }}
            />
        </Spin>;
    }
}
