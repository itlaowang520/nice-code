
import React from 'react';
import { connect } from 'kredux';
import { Form, Modal } from 'antd';
import { KSUpload } from 'ks-cms-ui';
import PropTypes from 'prop-types';
const FormItem = Form.Item;
const Confirm = Modal.confirm;

@connect(({ customComponents, loading }) => ({
    customComponents,
    importCustomComponentsLoading: loading.effects['customComponents/importCustomComponents'],
}))
@Form.create()
export default class ImportCustomComponentsModal extends React.PureComponent {
    static propTypes = {
        importCustomComponentsLoading: PropTypes.bool,
        isMobile: PropTypes.bool,
        dispatch: PropTypes.func,
        form: PropTypes.object,
        customComponents: PropTypes.object
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const { importCustomComponentsLoading } = this.props;
        const { importCustomComponentsModalVisible } = this.props.customComponents;
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
                visible={ importCustomComponentsModalVisible }
                title={'导入组件'}
                confirmLoading={ importCustomComponentsLoading }
                onCancel = {() => {
                    this.props.dispatch({
                        type: 'customComponents/setCustomComponentsReducer',
                        payload: {
                            importCustomComponentsModalVisible: false
                        }
                    });
                }}
                onOk={() => {
                    this.props.form.validateFieldsAndScroll({force: true}, (err, fieldsValue) => {
                        if (!err) {
                            Confirm({
                                title: '确认导入？',
                                content: '将会增加自定义组件',
                                onOk: () => {
                                    let formData = new FormData(),
                                        file = fieldsValue.file[0].originFileObj || fieldsValue.file[0];
                                    formData.append('file', file);
                                    this.props.dispatch({
                                        type: 'customComponents/importCustomComponents',
                                        payload: formData
                                    });
                                }
                            });
                        }
                    });
                }}
            >
                <Form layout='horizontal'>
                    <FormItem
                        {...formItemLayout}
                        label="文件"
                    >
                        {getFieldDecorator('file', {
                            rules: [
                                {required: true, message: '请选择文件'}
                            ],
                        })(
                            <KSUpload
                                customRequest={() => null}
                                api={'null'}
                                loading={false}
                                fileMax={1}
                            />
                        )}
                    </FormItem>
                </Form>
            </Modal>
        );
    }
}
