import React from 'react';
import { connect } from 'kredux';
import { Form, Modal, Input, message } from 'antd';
import PropTypes from 'prop-types';
import { isJSON } from './../utils';
const FormItem = Form.Item;
const { TextArea } = Input;

@connect(({ customComponents, loading }) => ({
    customComponents,
}))
@Form.create()
export default class GeneraterModal extends React.Component {
    static propTypes = {
        form: PropTypes.object,
        dispatch: PropTypes.func,
        customComponents: PropTypes.object,
        handleGenerater: PropTypes.func
    }
    state = {
        envList: []
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const { generaterModalVisiable } = this.props.customComponents;
        const { handleGenerater } = this.props;
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
                visible={ generaterModalVisiable }
                title='请输入json'
                onCancel = {() => {
                    this.props.dispatch({
                        type: 'customComponents/setCustomComponentsReducer',
                        payload: {
                            generaterModalVisiable: false
                        }
                    });
                }}
                onOk={() => {
                    this.props.form.validateFieldsAndScroll({force: true}, (err, fieldsValue) => {
                        if (!err) {
                            let postData = {
                                jsonData: fieldsValue.jsonData
                            };
                            if (!isJSON(postData.jsonData)) { message.error('json格式错误！'); return; }
                            this.props.dispatch({
                                type: 'customComponents/setCustomComponentsReducer',
                                payload: {
                                    generaterModalVisiable: false
                                }
                            });
                            handleGenerater(postData.jsonData);
                            console.log('postData', postData);
                        }
                    });
                }}
            >
                <Form layout='horizontal'>
                    <FormItem
                        {...formItemLayout}
                        label="json数据"
                    >
                        {getFieldDecorator('jsonData', {
                            rules: [
                                {required: true, message: '请填写Json数据'},
                            ],
                        })(
                            <TextArea
                                autoSize={{ minRows: 6 }}
                                placeholder='请填写Json数据'
                            />
                        )}
                    </FormItem>
                </Form>
            </Modal>
        );
    }
}
