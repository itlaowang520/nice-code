import React from 'react';
import { Form, Modal, Select, notification } from 'antd';
import { request } from '../../utils';
import PropTypes from 'prop-types';
import KSUpload from '../KSUpload';
const FormItem = Form.Item;
const Option = Select.Option;

@Form.create()
export default class UploadModal extends React.PureComponent {
    static propTypes = {
        cancelFun: PropTypes.func,
        onChangeFun: PropTypes.func,
        setStateFun: PropTypes.func,
        uploadVisible: PropTypes.bool,
        upload: PropTypes.object,
        extendUploadProps: PropTypes.object,
        form: PropTypes.object,
    }
    state = {
        loading: false
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        const { loading } = this.state;
        const { cancelFun, onChangeFun, setStateFun, uploadVisible, upload, extendUploadProps = {} } = this.props;
        const { expectParams = {} } = extendUploadProps;
        const { uploadAPI, saveAPI, folderList, fileTypeList,
            fileTypeCode, folderCode,
            disabledFolder = false, disabledFileType = false,
            folderkey = 'dictionaryCode',
            folderValue = 'dictionaryName',
            fileTypekey = 'dictionaryCode',
            fileTypeValue = 'dictionaryName'
        } = upload;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 5 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 18 },
            }
        };
        return (
            <Modal
                visible={ uploadVisible }
                title={'上传文件'}
                confirmLoading={ loading }
                width='60%'
                onCancel = {() => {
                    cancelFun();
                }}
                onOk={() => {
                    this.props.form.validateFieldsAndScroll({force: true}, (err, fieldsValue) => {
                        if (!err) {
                            let postData = {
                                ...expectParams,
                                ...fieldsValue,
                            };
                            if (postData['files'] && postData['files'].length && postData['files'][0].response && postData['files'][0].response.code === 0) {
                                postData['localPath'] = postData['files'][0].response.localPath;
                                delete postData['files'];
                            }
                            this.setState({loading: true});
                            // 上传文件
                            request(saveAPI, {
                                method: 'POST',
                                body: postData
                            }).then((response) => {
                                this.setState({loading: false});
                                if (response.code === 0) {
                                    if (response.list && response.list.length) {
                                        let onchangeData = {
                                            key: response['list'][0]['fileId'],
                                            showName: response['list'][0]['fileName'],
                                            record: response['list'][0]
                                        };
                                        onChangeFun(onchangeData);
                                        setStateFun({uploadVisible: false});
                                    }
                                } else {
                                    this.setState({loading: false});
                                    notification.error({
                                        message: `上传失败`, // : ${response.url}
                                        description: response.msg
                                    });
                                }
                            }).catch(() => {
                                this.setState({loading: false});
                            });
                        }
                    });
                }}
            >
                <Form layout='horizontal'>
                    <FormItem
                        {...formItemLayout}
                        label="文件夹"
                    >
                        {getFieldDecorator('folderCode', {
                            rules: [
                                {required: true, message: '请选择文件夹'}
                            ],
                            initialValue: folderCode || undefined
                        })(
                            <Select allowClear placeholder='文件夹' disabled={!!folderCode && disabledFolder}>
                                {
                                    folderList && folderList.map((folder) => {
                                        return (
                                            <Option key={folder[folderkey]} value={`${folder[folderkey]}`}>{folder[folderValue]}</Option>
                                        );
                                    })
                                }
                            </Select>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="文件类别"
                    >
                        {getFieldDecorator('fileTypeCode', {
                            rules: [
                                {required: true, message: '请选择文件类别'}
                            ],
                            initialValue: fileTypeCode !== 'file' ? fileTypeCode : undefined
                        })(
                            <Select allowClear placeholder='文件类别' disabled={(!!fileTypeCode && fileTypeCode !== 'file') && disabledFileType}>
                                {
                                    fileTypeList && fileTypeList.map((type) => {
                                        return (
                                            <Option key={type[fileTypekey]} value={`${type[fileTypekey]}`}>{type[fileTypeValue]}</Option>
                                        );
                                    })
                                }
                            </Select>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="文件上传"
                    >
                        {getFieldDecorator('files', {
                            rules: [
                                {required: true, message: '请上传文件'}
                            ],
                        })(
                            <KSUpload
                                {...extendUploadProps}
                                api={uploadAPI}
                            />
                        )}
                    </FormItem>
                </Form>
            </Modal>
        );
    }
}
