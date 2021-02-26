import React from 'react';
import PropTypes from 'prop-types';
import {Icon, message, Upload} from 'antd';
import UploadItem from './UploadItem';
import { fileToObject, filterFile, genPercentAdd, UPLOAD_VALIDATE_TYPE, PASS_ERROR_MSG_TYPE } from './utils';
import { audioIcon, fileIcon, pdfIcon, videoIcon } from '../../utils/constants';
import './index.scss';

export default class KSUpload extends React.PureComponent {
    static propTypes = {
        onChange: PropTypes.func,
        fileMax: PropTypes.number, // 最多支持上传个数 默认只能上传1个
        value: PropTypes.array, // 默认显示的文件列表
        headers: PropTypes.object, // 请求头设置
        uploadText: PropTypes.string, // 自定义显示上传文字
        api: PropTypes.string, // upload的url设置
        accept: PropTypes.string, // 可以上传的文件类型
        castBeforeUpload: PropTypes.func, // 自定义上传事件
        disabled: PropTypes.bool, // 禁止使用上传
        children: PropTypes.node,
        validators: PropTypes.array,
        customerError: PropTypes.bool, // 上传自定义报错
        loading: PropTypes.bool, // 是否展示loading
        fileSize: PropTypes.number, // 文件大小
        forceFileSize: PropTypes.number, //
        rateImgSize: PropTypes.bool, // 是否限制图片大小
    };

    static defaultProps = {
        loading: true,
        rateImgSize: true,
    };

    state = {
        fileList: this.props.value || [],
        fileMax: this.props.fileMax || 1,
        exceptMsgList: []
    };

    progressTimer; // 进度条定时器

    static getDerivedStateFromProps(props) {
        if ('fileList' in props) {
            return {
                fileList: props.fileList || []
            };
        } else if ('value' in props) {
            return {
                fileList: props.value || []
            };
        } else {
            return {
                fileList: []
            };
        }
    }

    componentWillUnmont() {
        this.clearProgressTimer();
    }

    /**
     * 清除进度条定时器
     */
    clearProgressTimer() {
        clearInterval(this.progressTimer);
    }

    /**
     * onStart
     * @return {[type]} [description]
     */
    onStart(file) {
        const { loading } = this.props;
        const targetItem = fileToObject(file);
        if (loading) {
            targetItem.status = 'uploading';
        }
        const nextFileList = this.state.fileList.concat();
        const fileIndex = nextFileList.findIndex(({ uid }) => uid === targetItem.uid);
        if (fileIndex === -1) {
            nextFileList.push(targetItem);
        } else {
            nextFileList[fileIndex] = targetItem;
        }

        this.onChange(nextFileList);

        if (!window.FormData) {
            this.autoUpdateProgress(targetItem);
        }
    }

    /**
     * 自动增长进度条
     * @param  {Object} file // 正在上传的附件
     */
    autoUpdateProgress(file) {
        const getPercent = genPercentAdd();
        let curPercent = 0;
        this.clearProgressTimer();
        this.progressTimer = setInterval(() => {
            curPercent = getPercent(curPercent);
            this.onProgress({
                percent: curPercent * 100,
            }, file);
        }, 200);
    }

    /**
     * 修改当前上传文件的进度
     * @param  {Number} percent 当前文件的进度
     * @param  {[type]} file    当前文件
     */
    onProgress = ({percent}, file) => {
        const fileList = [...this.state.fileList];
        const idx = fileList.indexOf(file);
        if (idx === -1) {
            return;
        }
        fileList[idx].percent = percent;
        this.onChange([...fileList]);
    }

    /**
     * 修改state中的fileList和onChange fileList
     * @param  {Array} fileList // 附件列表
     */
    onChange(fileList) {
        const { onChange } = this.props;
        const { fileMax } = this.state;
        let tempFileList = [...fileList];
        tempFileList = tempFileList.filter((file) => 'url' in file);
        tempFileList = tempFileList.splice(0, fileMax);
        this.setState({
            fileList: [...tempFileList]
        });
        onChange && onChange([...tempFileList]);
    }

    render() {
        const { children, uploadText, customerError, validators } = this.props;
        const { fileMax } = this.state;
        const uploadButton = (
            <div className='add-file'>
                <div className='add-file-center'>
                    <Icon type="plus" />
                    <div className="ant-upload-text">{ uploadText || 'Upload'}</div>
                </div>
            </div>
        );
        const props = {
            action: this.props.api,
            headers: {
                ...this.props.headers
            },
            multiple: this.state.fileMax > 1,
            onRemove: (file) => {
                const { fileList } = this.state;
                const index = fileList.indexOf(file);
                const newFileList = [...fileList];
                newFileList.splice(index, 1);
                this.onChange(newFileList);
            },
            beforeUpload: async(file, files) => {
                return new Promise(async(resolve, reject) => {
                    let { isPass, message: errorMsg } = await filterFile(file, validators, UPLOAD_VALIDATE_TYPE, this.props);
                    if (!isPass || isPass === PASS_ERROR_MSG_TYPE) {
                        let index = files.indexOf(file),
                            prefix = customerError ? '' : `当次上传文件中的 第${index + 1}个 `;
                        if (isPass !== PASS_ERROR_MSG_TYPE) {
                            message.warn(`${prefix}${errorMsg}`);
                        }
                        return reject(new Error(`${prefix}${errorMsg}`));
                    }

                    if (file.type.includes('image')) {
                        file.url = URL.createObjectURL(file);
                    } else if (file.type.includes('audio')) {
                        file.url = URL.createObjectURL(file);
                        file.thumbUrl = audioIcon;
                    } else if (file.type.includes('video')) {
                        file.url = URL.createObjectURL(file);
                        file.thumbUrl = videoIcon;
                    } else if (file.type.includes('pdf')) {
                        file.url = URL.createObjectURL(file);
                        file.thumbUrl = pdfIcon;
                    } else {
                        file.url = URL.createObjectURL(file);
                        file.thumbUrl = fileIcon;
                    }
                    let tempFileList = [...this.state.fileList, file];
                    tempFileList = tempFileList.slice(0, fileMax);
                    this.onChange(tempFileList);
                    if (this.props.castBeforeUpload) {
                        const result = await this.props.castBeforeUpload(file);
                        if (!result) {
                            reject(file);
                            return;
                        }
                    }
                    resolve(file);
                });
            },
            onStart: this.onStart.bind(this),
            fileList: this.state.fileList,
            showUploadList: false,
            listType: 'picture-card',
            // disabled: !!this.state.fileList.length
        };
        return (
            <div className="ks-upload">
                {
                    Boolean(this.state.fileList.length) && this.state.fileList.map((file) => {
                        return (
                            <UploadItem
                                key={file.uid}
                                file={file}
                                onRemove={props.onRemove}
                                disabled={this.props.disabled}
                            />
                        );
                    })
                }
                {
                    !this.props.disabled && <Upload
                        {...props}
                        {...this.props}
                        onChange={({ file, fileList }) => {
                            this.onChange(fileList);
                        }}
                    >
                        {/* <div className={styles.drag}>
                            <p className="ant-upload-drag-icon">
                                <Icon type="inbox" />
                            </p>
                            <p className="ant-upload-text">点击或者拖拽文件到这里</p>
                        </div> */}
                        {
                            this.state.fileList.length >= fileMax ? null : (children || uploadButton)
                        }
                    </Upload>
                }
            </div>
        );
    }
}
