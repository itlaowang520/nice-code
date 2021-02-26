import React from 'react';
import BraftEditor, { EditorState } from 'braft-editor';
import PropTypes from 'prop-types';
import { Tooltip, Icon } from 'antd';
import { request } from '../../utils';
import 'braft-editor/dist/index.css';
import './index.scss';
import 'braft-extensions/dist/color-picker.css';
import ColorPicker from 'braft-extensions/dist/color-picker';
import { genPercentAdd } from '../KSUpload/utils';
BraftEditor.use(ColorPicker({
    includeEditors: ['editor-with-color-picker'],
    theme: 'light' // 支持dark和light两种主题，默认为dark
}));

const fontSizes = [...Array.from(new Array(50), (v, i) => i)].slice(5);

// const MEDIA_EMPTY_NODE = /<\/div><p><\/p><div/g;
// const MEDIA_NODE = '</div><div';

const helpContent = (
    <div>
        <div style={{margin: '5px 0'}}>帮助 <Icon type='question-circle'/></div>
        <div style={{margin: '5px 0'}}>上传功能: 在媒体中上传附件,然后选择上传完成的附件插入项目即可</div>
        <div style={{margin: '5px 0'}}>换行功能: 在想换行的文本最前面 'shift + 回车' 即可</div>
    </div>
);

export default class KSEditor extends React.PureComponent {
    static propTypes = {
        onChange: PropTypes.func,
        value: PropTypes.string,
        config: PropTypes.object.isRequired,
        contentStyle: PropTypes.object,
        extendControls: PropTypes.array
    }

    progressTimer
    editorRef // 编辑器实例

    state = {
        editorProps: {
            contentStyle: {
                height: 350
            },
            contentFormat: 'html',
            media: {
                pasteImage: true,
                uploadFn: (params) => {
                    let {
                        upload, save,
                        folderCode = 'kms-common',
                        fileTypeCode = '',
                        expectParams = {}
                    } = this.props.config;
                    // 开始progress
                    this.startProgress(params);
                    let fileData = new FormData();
                    fileData.append('file', params.file);
                    // 上传附件
                    request(upload, {
                        method: 'POST',
                        body: fileData
                    }).then((res) => {
                        if (res.code === 0) {
                            let fileType = ''; // 内部判断文件类型
                            if (params.file.type.includes('image')) {
                                fileType = 'image';
                            } else if (params.file.type.includes('audio')) {
                                fileType = 'audio';
                            } else if (params.file.type.includes('video')) {
                                fileType = 'video';
                            } else {
                                fileType = 'attachment';
                            }
                            let postData = {
                                ...expectParams,
                                localPath: res.localPath,
                                folderCode,
                                fileTypeCode: fileTypeCode || fileType
                            };
                            // 保存localPath
                            request(save, {
                                method: 'POST',
                                body: postData
                            }).then((response) => {
                                if (response.code === 0) {
                                    this.clearProgressTimer();
                                    params.success({
                                        url: response.list[0].cdnUrl,
                                    });
                                }
                            }).catch((err) => {
                                this.clearProgressTimer();
                                params.error({
                                    msg: err || '上传错误'
                                });
                            });
                        }
                    }).catch((err) => {
                        this.clearProgressTimer();
                        params.error({
                            msg: err || '上传错误'
                        });
                    });
                }
            }
        },
        editorState: EditorState.createFrom(this.props.value || ''),
        extendControls: [
            'separator',
            {
                key: 'help-editor',
                type: 'component',
                component: <Tooltip title={helpContent}><Icon type='question-circle'/></Tooltip>
            }
        ]
    }

    /**
     * 开始走进度条
     */
    startProgress = (params) => {
        let progress = 0;
        const getPercent = genPercentAdd();
        this.clearProgressTimer();
        this.progressTimer = setInterval(() => {
            progress = getPercent(progress);
            params.progress(progress * 100);
        }, 200);
    }

    /**
     * 清除定时器
     */
    clearProgressTimer = () => {
        clearInterval(this.progressTimer);
    }

    /**
     * 更新组件值
     * @param  {[type]} props [description]
     * @return {[type]}       [description]
     */
    static getDerivedStateFromProps(props, state) {
        if (props.value && props.value !== state.editorState.toHTML()) {
            return {
                editorState: EditorState.createFrom(props.value || '')
            };
        }
        return null;
    }

    // 判断空值
    handleChange(value) {
        this.setState({
            editorState: value
        });
        let result = value.toHTML(),
            resultJson = value.toRAW(true);
        result = result === '<p></p>' ? undefined : result;
        this.props.onChange && this.props.onChange(result, resultJson, value);
    }

    componentWillUnmont() {
        this.clearProgressTimer(); // 清除定时器
    }

    render() {
        let { extendControls } = this.state;
        if ('extendControls' in this.props) {
            extendControls = [].concat(this.props.extendControls, extendControls);
        }
        return (
            <div className='editorContainer'>
                <BraftEditor
                    fontSizes={fontSizes}
                    {...this.state.editorProps}
                    {...this.props}
                    ref={(refs) => {
                        this.editorRef = refs;
                    }}
                    onChange={this.handleChange.bind(this)}
                    value={this.state.editorState}
                    extendControls={extendControls}
                    editorId='editor-with-color-picker'
                />
            </div>
        );
    }
}
