import React, { Fragment } from 'react';
import { Form, Modal, Tabs, message } from 'antd';
import PropTypes from 'prop-types';
import SelectFile from './SelectFile';
import UploadFile from './UploadFile';
import { getFileSize } from 'ks-cms-utils';
import { filterFile, SELECT_VALIDATE_TYPE, IMAGE_COMPRESS_SIZE } from '../KSUpload/utils';
import { request } from '../../utils';
import './index.scss';

const TabPane = Tabs.TabPane;

@Form.create()
export default class SelectModal extends React.Component {
    static propTypes = {
        form: PropTypes.object,
        title: PropTypes.string, // 搜索title展示
        rowKey: PropTypes.string,
        fileMax: PropTypes.number, // 可上传的最大文件数
        currLen: PropTypes.number, // 当前文件数
        visible: PropTypes.bool, // 选择模态框的显隐值
        visibleChangeFunc: PropTypes.func,
        cancelFunc: PropTypes.func, // 关闭选择模态框的事件
        dataSource: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.bool,
        ]), // 数据集
        pagination: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.bool,
        ]), // 分页信息
        multiple: PropTypes.bool, // multiple/single
        fileList: PropTypes.array,
        fileTitle: PropTypes.string, // 搜索title展示
        uploadText: PropTypes.string,
        accept: PropTypes.string,
        acceptType: PropTypes.string, // 自定义限制类型
        onSearchFunc: PropTypes.func,
        onSelectFunc: PropTypes.func,
        upload: PropTypes.object,
        fillName: PropTypes.bool,
        selectDir: PropTypes.bool,
        showKeys: PropTypes.object,
        validators: PropTypes.array,
        fileSize: PropTypes.number, // 文件大小
        withSelect: PropTypes.bool, // 是否需要选择功能
        withUpload: PropTypes.bool, // 是否需要上传功能
    };

    state = {
        searchValue: '',
        selectedRows: [],
        selectedList: [],
        surplusCount: this.props.fileMax,
        loading: false,
        activeKey: this.props.withSelect ? '1' : '2'
    };

    handleOk = async() => {
        const { selectedRows, activeKey } = this.state;
        const { form: {validateFieldsAndScroll}, selectDir } = this.props;
        validateFieldsAndScroll(async(err, values) => {
            if (!err) {
                // 本地上传Tab
                if (activeKey === '2') {
                    // kms 端的上传操作
                    if (selectDir) {
                        let postData = {
                                folderCode: values.folderCode,
                                fileTypeCode: values.fileTypeCode,
                                localPath: []
                            },
                            compressList = [];
                        if (values['fileList']) {
                            /* 遍历上传附件，并且检测是否需要压缩附件 */
                            values['fileList'].forEach((file, index) => {
                                if (file.response && file.response.code === 0) {
                                    postData.localPath.push(file.response.localPath);
                                    const fileType = file.type.split('/').shift();
                                    if (fileType === 'image' && file.size > IMAGE_COMPRESS_SIZE) {
                                        compressList.push({
                                            ...file,
                                            fileIndex: index
                                        });
                                    }
                                }
                            });
                        }
                        if (postData['localPath'].length) {
                            postData['localPath'] = postData['localPath'].join(',');
                        } else {
                            message.warn('上传的附件有异常');
                            return;
                        }
                        this.setState({
                            loading: true
                        });
                        /* 附件最终保存接口 */
                        let response = await request(this.props.upload.saveAPI, {
                            method: 'POST',
                            body: postData
                        }).catch(() => {
                            this.setState({
                                loading: false
                            });
                        });
                        await this.setState({
                            loading: false
                        });
                        if (response && response.code === 0 && response.list) {
                            /* 如果有需要压缩的附件，进行压缩 */
                            if (compressList.length) {
                                message.warn(`检测到资源超出${getFileSize(IMAGE_COMPRESS_SIZE)}，正在压缩请稍等`);
                                let compressResponse = await request(this.props.upload.compressAPI, {
                                    method: 'POST',
                                    body: compressList.map(({fileIndex}) => ({fileId: response.list[fileIndex].fileId}))
                                }).catch(() => {
                                    this.setState({
                                        loading: false
                                    });
                                });

                                /* 压缩后替换原本资源的链接 */
                                compressList.forEach(({ fileIndex }, index) => {
                                    const url = compressResponse.list[index]['compressCdnUrl'] || compressResponse.list[index]['originalUrl'];
                                    const fileName = url.split('/').pop();
                                    response.list[fileIndex] = {
                                        ...response.list[fileIndex],
                                        cdnUrl: url,
                                        cdnFileName: fileName
                                    };
                                });
                                message.success(`压缩完成`);
                            }

                            for (let i = 0; i < response.list.length; i++) {
                                selectedRows.push({
                                    ...response.list[i],
                                    resource: 'upload'
                                });
                            }
                        }
                    } else {
                        // pop 商家前台的上传操作
                        if (values.fileList && values.fileList.length) {
                            this.setState({
                                loading: true
                            });
                            for (let i = 0; i < values.fileList.length; i++) {
                                let formData = new FormData();
                                formData.append('file', values.fileList[i].originFileObj || values.fileList[i]);
                                formData.append('folder', this.props.upload.folderCode);
                                formData.append('name', values.fileName || values.fileList[i].name);
                                let response = await request(this.props.upload.uploadAPI, {
                                    method: 'POST',
                                    body: formData
                                }).catch(() => {
                                    this.setState({
                                        loading: false
                                    });
                                });
                                if (response && (response.code === 0 || response.code === 200)) {
                                    selectedRows.push({
                                        ...response.data,
                                        resource: 'upload'
                                    });
                                }
                            }
                            await this.setState({
                                loading: false
                            });
                        }
                    }
                } else {
                    let error = await this.filterErrorDatas(selectedRows);
                    if (error) {
                        return;
                    }
                }

                if (!selectedRows.length) {
                    message.warn('请选择或上传一条数据');
                    return;
                }
                this.props.onSelectFunc && this.props.onSelectFunc(selectedRows);
                this.props.visibleChangeFunc && this.props.visibleChangeFunc(false);
            }
        });
    };

    /**
     * 过滤附件
     * @param  {Array} fileDatas [description]
     */
    filterErrorDatas = async(fileDatas) => {
        const { validators } = this.props;
        let i = 0;
        for (; i < fileDatas.length; i++) {
            let { isPass, message: errorMsg } = await filterFile(fileDatas[i], validators, SELECT_VALIDATE_TYPE, {
                ...this.props,
                rateImgSize: true
            });
            if (!isPass) {
                message.warn(`当次选择的文件中 第${i + 1}个 ${errorMsg}`);
                return !isPass;
            }
        }
        return false;
    };

    handleCheck = (selectedRow) => {
        const { multiple } = this.props;
        const rowKeyValue = selectedRow[this.props.rowKey]; // 当前被选中的item
        let {selectedList, selectedRows} = this.state;
        if (multiple) {
            if (selectedList.includes(rowKeyValue)) {
                selectedRows = selectedRows.filter((item) => item[this.props.rowKey] !== rowKeyValue);
                selectedList = selectedList.filter((item) => item !== rowKeyValue);
                this.setState({
                    selectedRows: [...selectedRows],
                    selectedList: [...selectedList]
                });
            } else {
                this.setState({
                    selectedRows: [
                        ...selectedRows,
                        selectedRow
                    ],
                    selectedList: [
                        ...selectedList,
                        rowKeyValue
                    ]
                });
            }
        } else {
            this.setState({
                selectedRows: [selectedRow],
                selectedList: [rowKeyValue]
            });
        }
    };

    handleSetState = (object) => {
        this.setState(object);
    };

    handleOnSearch = () => {
        this.props.onSearchFunc && this.props.onSearchFunc(this.state.searchValue);
    };

    callback = (key) => {
        this.setState({
            selectedRows: [],
            selectedList: [],
            activeKey: key
        });
        this.props.form.setFieldsValue({fileList: undefined, fileName: undefined});
    };

    /**
     * 根据自定义附件类型获取accept
     * @return {String} accept
     */
    getAccept = () => {
        let { acceptType, accept } = this.props;
        /* 如果有配置则优先以配置为准 */
        if (accept) {
            return accept;
        }
        // 文件类型的优先级最高，如果文件类型已经确定，则接收的文件后缀也就确定了
        switch (`${acceptType}`) {
            case 'image':
                accept = '.png,.jpeg,.jpg,.gif';
                break;
            case 'audio':
                accept = '.mp3,.wav,.flac,.ape,.m4a';
                break;
            case 'video':
                accept = '.mp4,.rmvb,.3gp,.flv,.avi';
                break;
            case 'pdf':
                accept = '.pdf';
                break;
            default:
        }
        return accept;
    };

    render() {
        const {
            visible,
            fileTitle,
            cancelFunc,
            rowKey,
            showKeys,
            dataSource,
            pagination,
            multiple,
            form,
            validators,
            upload,
            fillName,
            selectDir,
            uploadText,
            withSelect,
            withUpload
        } = this.props;
        const { selectedList, surplusCount, activeKey, loading } = this.state;
        return (
            <Modal
                width={900}
                visible={visible}
                confirmLoading={loading}
                onCancel={() => {
                    cancelFunc && cancelFunc();
                }}
                onOk={this.handleOk}
            >
                <Tabs activeKey={activeKey} onChange={this.callback}>
                    {
                        withSelect && <TabPane tab={`我的${fileTitle}`} key="1">
                            <SelectFile
                                rowKey={rowKey}
                                pagination={pagination}
                                dataSource={dataSource}
                                multiple={multiple}
                                showKeys={showKeys}
                                fileTitle={fileTitle}
                                selectedList={selectedList}
                                accept={this.getAccept()}
                                setStateFunc={this.handleSetState}
                                onSearchFunc={this.handleOnSearch}
                                onCheckedFunc={this.handleCheck}
                            />
                        </TabPane>
                    }
                    {
                        withUpload && <TabPane forceRender={true} tab={`本地${fileTitle}上传`} key="2">
                            <Fragment>
                                {
                                    this.state.activeKey === '2' && <UploadFile
                                        form={form}
                                        fillName={fillName}
                                        validators={validators}
                                        selectDir={selectDir}
                                        upload={upload}
                                        uploadText={uploadText}
                                        multiple={multiple}
                                        fileMax={surplusCount}
                                        accept={this.getAccept()}
                                        fileTitle={fileTitle}
                                        {...this.props}
                                    />
                                }
                            </Fragment>
                        </TabPane>
                    }
                </Tabs>
                {/* <div className="warm-tips">注：暂不支持文件的即选择又上传功能，选择后或者上传后列表会强制清空</div> */}
            </Modal>
        );
    }
}
