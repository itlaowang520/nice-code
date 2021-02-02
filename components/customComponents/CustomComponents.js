import React, { Fragment } from 'react';
import { connect } from 'kredux';
import { goto } from 'ks-cms-utils';
import PropTypes from 'prop-types';
import { Form, Row, Col, Input, Button, Modal } from 'antd';
import { KSWhiteCard, KSTable } from 'ks-cms-ui';
import { STATE } from 'Src/models/templateMgt/customComponents';
import { isAuth } from 'Src/utils/utils';
import ImportCustomComponentsModal from './ImportCustomComponentsModal';
const FormItem = Form.Item;
const Confirm = Modal.confirm;
const isDeveloper = isAuth('templateMgt_customComponents_developerAuth'); // 是否开发者权限

/**
 * 自定义组件业务模块
 */

/**
 *
 * @type {Redux}
 * @property {Object} customComponents // 自定义组件模块所需的redux对象
 * @property {Object} loading // 全局注入的loading插件
 *
 * @type {Return}
 * @property {Object} customComponents // 自定义组件模块所需的redux对象
 * @property {Boolean} customComponentsListloading // loadCustomComponentsList事件的状态
 *
 * 注入redux
 * @params {Redux}
 * @return {Return}
 */
@connect(({ customComponents, loading }) => ({
    customComponents,
    customComponentsListloading: loading.effects['customComponents/loadCustomComponentsList'],
}))
@Form.create({
    mapPropsToFields(props) {
        return {
            paramKey: Form.createFormField({
                ...props.customComponents.searchCustomComponentsForm.paramKey,
                value: props.customComponents.searchCustomComponentsForm.paramKey.value
            })
        };
    },
    onFieldsChange(props, fields) {
        props.dispatch({
            type: 'customComponents/setCustomComponentsReducer',
            payload: {
                searchCustomComponentsForm: {
                    ...props.customComponents.searchCustomComponentsForm,
                    ...fields
                }
            }
        });
    }
})
export default class CustomComponentsPage extends React.PureComponent {

    static propTypes = {
        customComponents: PropTypes.object, // 自定义组件redux
        customComponentsListloading: PropTypes.bool, // 加载自定义组件列表的状态
        dispatch: PropTypes.func, // 触发redux的方法
        form: PropTypes.object, // Form对象
        isMobile: PropTypes.bool // 是否为移动端
    }

    state = {
        // 列表表头
        columns: [
            {
                title: '序号',
                dataIndex: 'sortNum',
                width: 50,
            },
            {
                title: '组件ID',
                dataIndex: 'defineTemplateId',
                width: 100,
            },
            {
                title: '组件名称',
                dataIndex: 'defineTemplateName',
                width: 100
            },
            {
                title: '组件标识',
                dataIndex: 'templateFlag',
                width: 100
            },
            {
                title: '操作',
                width: 100,
                render: (text, record) => {
                    return (
                        <div>
                            <a onClick={(e) => {
                                e.stopPropagation();
                                goto.push('/templateMgt/customComponents/cuCustomComponentsPage/' + record.defineTemplateId);
                            }}>编辑</a>
                            {
                                isDeveloper && <Fragment>
                                    <span className='tiny-delimiter'>|</span>
                                    <a
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            Confirm({
                                                title: '复制',
                                                content: '确认复制?',
                                                onOk: () => {
                                                    this.props.dispatch({
                                                        type: 'customComponents/copyCustomComponents',
                                                        payload: record.defineTemplateId
                                                    });
                                                }
                                            });
                                        }}>复制</a>
                                    <span className='tiny-delimiter'>|</span>
                                    <a
                                        style={{
                                            color: '#f50'
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            Confirm({
                                                title: '删除',
                                                content: '确认删除?',
                                                onOk: () => {
                                                    this.props.dispatch({
                                                        type: 'customComponents/deleteCustomComponents',
                                                        payload: record.defineTemplateId
                                                    });
                                                }
                                            });
                                        }}>删除</a>
                                    <span className='tiny-delimiter'>|</span>
                                    <a onClick={(e) => {
                                        e.stopPropagation();
                                        Confirm({
                                            title: '导出',
                                            content: '确认导出?',
                                            onOk: () => {
                                                this.props.dispatch({
                                                    type: 'customComponents/exportCustomComponents',
                                                    payload: [record.defineTemplateId]
                                                });
                                            }
                                        });
                                    }}>导出</a>
                                </Fragment>
                            }
                        </div>
                    );
                }
            }
        ]
    };

    componentDidMount() {
        // 初始化redux
        this.props.dispatch({
            type: 'customComponents/setCustomComponentsReducer',
            payload: {...STATE}
        });
        this.loadCustomComponentsList();
    }

    /**
     * 加载自定义组件列表
     */
    loadCustomComponentsList() {
        this.props.dispatch({
            type: 'customComponents/loadCustomComponentsList',
        });
    }

    /**
     * 列表多选事件
     * @params {Array} selectedRowKeys // 已经选择的rowKey数组
     * @params {Array} selectedRows // 已经选择的record数组
     */
    onChange(selectedRowKeys, selectedRows) {
        this.props.dispatch({
            type: 'customComponents/setCustomComponentsReducer',
            payload: {
                selectedRowKeys: selectedRowKeys
            }
        });
    }

    /**
     * 翻页事件监听
     * @params {Number} page // 想跳转的页数
     * @params {Number} pageSize // 每页条数
     */
    onPageChange = (page, pageSize) => {
        this.props.dispatch({
            type: 'customComponents/setCustomComponentsReducer',
            payload: {
                searchCustomComponentsForm: {
                    ...this.props.customComponents.searchCustomComponentsForm,
                    page,
                    limit: pageSize
                }
            }
        });
        this.loadCustomComponentsList();
    }

    /**
     * 查询并重置页数
     * 重置页数page为1
     */
    searchResetPage() {
        this.props.dispatch({
            type: 'customComponents/setCustomComponentsReducer',
            payload: {
                searchCustomComponentsForm: {
                    ...this.props.customComponents.searchCustomComponentsForm,
                    page: 1
                }
            }
        });
        this.loadCustomComponentsList();
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const { customComponentsListloading } = this.props;
        const { customComponentsList, searchCustomComponentsForm, selectedRowKeys, importCustomComponentsModalVisible } = this.props.customComponents;
        return (
            <KSWhiteCard>
                <Form>
                    <Row>
                        <Col span={6}>
                            <FormItem>
                                {
                                    getFieldDecorator('paramKey')(
                                        <Input
                                            style={{
                                                width: '100%'
                                            }}
                                            placeholder='自定义组件名称'
                                            onPressEnter={() => {
                                                this.searchResetPage();
                                            }}
                                        />
                                    )
                                }
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem>
                                <Button
                                    onClick={() => {
                                        this.searchResetPage();
                                    }}
                                    className='mar-l-4'
                                >查询</Button>
                                <Button
                                    onClick={() => {
                                        // 清空customComponentsInfo
                                        goto.push('/templateMgt/customComponents/cuCustomComponentsPage/-1');
                                    }}
                                    type='primary'
                                    className='mar-l-4'
                                >新增</Button>
                                {
                                    isDeveloper && <Fragment>
                                        <Button
                                            disabled={!selectedRowKeys.length}
                                            onClick={() => {
                                                Confirm({
                                                    title: '批量导出',
                                                    content: '确认导出?',
                                                    onOk: () => {
                                                        this.props.dispatch({
                                                            type: 'customComponents/exportCustomComponents',
                                                            payload: selectedRowKeys
                                                        });
                                                    }
                                                });
                                            }}
                                            className='mar-l-4'
                                        >批量导出</Button>
                                        <Button
                                            onClick={() => {
                                                this.props.dispatch({
                                                    type: 'customComponents/setCustomComponentsReducer',
                                                    payload: {
                                                        importCustomComponentsModalVisible: true,
                                                    }
                                                });
                                            }}
                                            className='mar-l-4'
                                        >导入</Button>
                                    </Fragment>
                                }
                            </FormItem>
                        </Col>
                    </Row>
                    <KSTable
                        columns={this.state.columns}
                        dataSource={customComponentsList}
                        rowKey='defineTemplateId'
                        loading={customComponentsListloading}
                        isMobile={this.props.isMobile}
                        pagination={{
                            current: searchCustomComponentsForm.page,
                            pageSize: searchCustomComponentsForm.limit,
                            total: searchCustomComponentsForm.total,
                            onChange: this.onPageChange
                        }}
                        rowSelection={{
                            selectedRowKeys: selectedRowKeys,
                            onChange: this.onChange.bind(this)
                        }}
                    />
                </Form>
                {
                    importCustomComponentsModalVisible && <ImportCustomComponentsModal />
                }
            </KSWhiteCard>
        );
    }
}
