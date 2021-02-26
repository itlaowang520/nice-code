import React, { Fragment } from 'react';
import {Form, Input, message, Select} from 'antd';
import PropTypes from 'prop-types';
import KSUpload from '../KSUpload';
import './index.scss';

const FormItem = Form.Item;
const Option = Select.Option;

export default class UploadFile extends React.Component {
    static propTypes = {
        form: PropTypes.object,
        fileMax: PropTypes.number, // 可上传的最大文件数
        multiple: PropTypes.bool, // 是否可以进行批量上传
        handleOk: PropTypes.func,
        fileTitle: PropTypes.string, // 搜索title展示
        uploadText: PropTypes.string,
        accept: PropTypes.string,
        upload: PropTypes.object,
        fillName: PropTypes.bool,
        selectDir: PropTypes.bool,
        validators: PropTypes.array,
        fileSize: PropTypes.number, // 文件大小
    };

    handleClick = () => {
        if (!this.props.fileMax) {
            message.warn('文件已达上限，不能再上传');
        }
    }

    render() {
        const {
            fileMax,
            multiple,
            accept,
            fileTitle,
            upload,
            fillName,
            selectDir,
            uploadText,
            validators,
            fileSize,
            form: { getFieldDecorator, getFieldValue }
        } = this.props;
        const {
            uploadAPI, folderList, fileTypeList, castBeforeUpload,
            fileTypeCode, folderCode,
            folderkey = 'dictionaryCode',
            folderValue = 'dictionaryName',
            fileTypekey = 'dictionaryCode',
            fileTypeValue = 'dictionaryName'
        } = upload;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 19 },
            },
        };
        // // kms 需要自动上传
        // const beforeUpload = selectDir ? {} : { castBeforeUpload: () => false };
        const fileLength = (getFieldValue('fileList') && getFieldValue('fileList').length) || 0;
        const extra = fileLength < fileMax
            ? `点击“+”选择${fileTitle}${accept ? `，暂时只支持${accept.replace(/\./g, '').replace(/,/g, '，')}` : ''}文件格式`
            : '';
        return (
            <Fragment>
                <div className="upload-file-wrapper">
                    <Form>
                        <FormItem
                            className="extra-info"
                            wrapperCol = {{
                                xs: { span: 24 },
                                sm: { span: 18, offset: 4 }
                            }}
                        >
                            {/* <div className="file-format-info">{`点击“+”选择${fileTitle}${type ? `，暂时只支持的文件格式有${type}。` : '。'}`}</div> */}
                            {/* <div className="file-length-info">{`本次可支持上传${fileMax}份${fileTitle}！`}</div> */}
                        </FormItem>
                        {
                            fillName && <FormItem
                                {...formItemLayout}
                                label={`${fileTitle}名称`}
                            >
                                {
                                    getFieldDecorator('fileName', {
                                        rules: [
                                            {required: true, message: `请输入${fileTitle}名称`},
                                            {
                                                validator: (rule, value, callback) => {
                                                    if (value && value.length > 20) {
                                                        callback(new Error('名称最长不能超过20个字'));
                                                    }
                                                    callback();
                                                }
                                            }
                                        ]
                                    })(
                                        <Input
                                            placeholder={`请输入${fileTitle}名称`}
                                        />
                                    )
                                }
                            </FormItem>
                        }
                        {
                            selectDir && <FormItem
                                {...formItemLayout}
                                label="文件夹"
                            >
                                {getFieldDecorator('folderCode', {
                                    rules: [
                                        {required: true, message: '请选择文件夹'}
                                    ],
                                    initialValue: folderCode
                                })(
                                    <Select placeholder='文件夹'>
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
                        }
                        {
                            selectDir && <FormItem
                                {...formItemLayout}
                                label="文件类别"
                            >
                                {getFieldDecorator('fileTypeCode', {
                                    rules: [
                                        {required: true, message: '请选择文件类别'}
                                    ],
                                    initialValue: fileTypeCode
                                })(
                                    <Select placeholder='文件类别'>
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
                        }
                        <FormItem
                            {...formItemLayout}
                            label={`本地${fileTitle}`}
                            style={{marginBottom: 0}}
                            extra={extra}
                        >
                            {
                                getFieldDecorator('fileList', {
                                    // valuePropName: 'fileList',
                                    // getValueFromEvent: this.normFile,
                                    rules: [
                                        {required: true, message: `请选择${fileTitle}上传`}
                                    ]
                                })(
                                    <KSUpload
                                        castBeforeUpload={castBeforeUpload}
                                        // {...beforeUpload}
                                        uploadText={uploadText}
                                        multiple={multiple}
                                        validators={validators}
                                        fileMax={multiple === false ? 1 : fileMax}
                                        accept={accept}
                                        api={uploadAPI}
                                        fileSize={fileSize}
                                    />
                                )
                            }
                        </FormItem>
                    </Form>
                </div>
            </Fragment>
        );
    }
}
