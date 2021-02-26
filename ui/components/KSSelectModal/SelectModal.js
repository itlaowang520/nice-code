import React from 'react';
import { Input, Modal, Form, Row, Col, Button, message } from 'antd';
import PropTypes from 'prop-types';
import KSTable from '../KSTable';
import { getSelectedRows } from './utils';
import { MATCH_KEY } from './constants';
import './index.scss';
const FormItem = Form.Item;

export default class SelectModal extends React.Component {
    static propTypes = {
        columns: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.bool,
        ]), // 表头信息
        dataSource: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.bool,
        ]), // 数据集
        pagination: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.bool,
        ]), // 分页信息
        rowKey: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.func,
        ]), // 数据唯一值
        loading: PropTypes.bool, // 列表是否加载中
        title: PropTypes.string, // 搜索title展示
        searchLabel: PropTypes.string, // 默认搜索框的placeholder值
        showKey: PropTypes.string, // 选中后显示的值
        placeholder: PropTypes.string, // 默认展示框的placeholder
        value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
            PropTypes.array,
            PropTypes.object
        ]), // 组件值
        onChange: PropTypes.func, // 变更回调
        selectedRowKeys: PropTypes.array, // 选中的key数组
        selectedRows: PropTypes.array, // 选中的数据数组
        visible: PropTypes.bool, // 选择模态框的显隐值
        searchValue: PropTypes.string, // 内部高级搜索的值
        cancelFun: PropTypes.func, // 关闭选择模态框的事件
        onChangeFun: PropTypes.func, // 修改组件值事件
        setStateFun: PropTypes.func, // 设置State事件
        onSearchFun: PropTypes.func, // 默认搜索事件
        multiple: PropTypes.bool, // 是否可以多选
        selectNode: PropTypes.oneOfType([
            PropTypes.node,
            PropTypes.bool,
        ]),
        selectedRowKeysArray: PropTypes.array,
        dataBase: PropTypes.array,
        isTouch: PropTypes.bool, // 是否选择过
        listArray: PropTypes.array,
        selectedRowsList: PropTypes.array,
        extendProps: PropTypes.object,
        onRow: PropTypes.func,
        childrenColumnName: PropTypes.string,
        maxCount: PropTypes.number, // 最多选中数量
    }

    render() {
        const {
            selectedRows,
            searchValue,
            visible,
            rowKey = 'id',
            showKey = 'name',
            title = '选择',
            searchLabel = '名称',
            cancelFun,
            onChangeFun,
            setStateFun,
            onSearchFun,
            selectNode,
            multiple,
            selectedRowKeysArray,
            dataSource,
            listArray,
            dataBase,
            selectedRowsList,
            extendProps = {},
            childrenColumnName,
            onRow,
            maxCount
        } = this.props;
        let isSelectNode = selectNode === false,
            isMultiple = Boolean(multiple);
        const { rowSelection = {} } = extendProps;
        return (
            <Modal
                title={title}
                visible={visible}
                onCancel={() => {
                    cancelFun();
                }}
                width='75%'
                onOk={() => {
                    if (isMultiple) {
                        if (selectedRowKeysArray.length < 1) {
                            message.error('请选择一个选项');
                        } else {
                            // 多选
                            let result = selectedRowKeysArray.map((key) => {
                                let record = getSelectedRows({
                                    value: key,
                                    rowKey,
                                    showKey,
                                    childrenColumnName
                                }, {
                                    dataBase,
                                    selectedRowKeysArray
                                })[0];
                                if (MATCH_KEY in record && !record[MATCH_KEY]) {
                                    (this.props.value || []).forEach((val) => {
                                        if (typeof val === 'object' && 'record' in val && val.key === key) {
                                            record = val.record;
                                        }
                                    });
                                }
                                return {
                                    key: record[rowKey],
                                    record
                                };
                            });
                            setStateFun({
                                visible: false
                            });
                            onChangeFun(result);
                        }
                    } else {
                        if (selectedRowKeysArray.length === 1 && !selectedRowKeysArray[0]) {
                            message.error('请选择一个选项');
                        } else {
                            setStateFun({
                                visible: false
                            });
                            // 单选
                            onChangeFun({
                                key: selectedRows[0][rowKey],
                                record: selectedRows[0]
                            });
                        }
                    }
                }}
            >
                {
                    isSelectNode ? '' : (
                        (typeof selectNode === 'undefined' || typeof selectNode === 'boolean') ? <Row>
                            <Col span={4}>
                                <FormItem>
                                    <Input
                                        allowClear
                                        onChange={(e) => {
                                            setStateFun({
                                                searchValue: e.target.value
                                            });
                                        }}
                                        onPressEnter={() => {
                                            onSearchFun(searchValue);
                                        }}
                                        placeholder={searchLabel}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={4} className='mar-l-4'>
                                <FormItem>
                                    <Button
                                        onClick={() => {
                                            onSearchFun(searchValue);
                                        }}
                                    >
                                        搜索
                                    </Button>
                                </FormItem>
                            </Col>
                        </Row> : { ...selectNode }
                    )
                }
                <KSTable
                    {...extendProps}
                    columns={this.props.columns}
                    dataSource={this.props.dataSource}
                    pagination={this.props.pagination}
                    rowKey={this.props.rowKey || 'id'}
                    loading={this.props.loading}
                    autoHeight={{
                        type: 'modal'
                    }}
                    rowSelection={{
                        ...rowSelection,
                        selectedRowKeys: selectedRowKeysArray,
                        onChange: (selectedRowKeys, selectedRows) => {
                            const { onChange } = rowSelection;
                            let tempSelectedRowKeys = [];
                            if (multiple) {
                                if (maxCount && selectedRowKeys.length > maxCount) {
                                    message.warn(`选项不能超过${maxCount}个`);
                                    return;
                                }
                                for (let item of dataSource) {
                                    for (let rec of selectedRowKeys) {
                                        if (item[rowKey] === rec) {
                                            listArray.push(item);
                                        }
                                    }
                                }
                                for (let i = 0; i < listArray.length; i++) {
                                    let flag = true;
                                    for (let j = 0; j < selectedRowsList.length; j++) {
                                        if (listArray[i][rowKey] === selectedRowsList[j][rowKey]) {
                                            flag = false;
                                        };
                                    };
                                    if (flag) {
                                        selectedRowsList.push(listArray[i]);
                                    };
                                };
                                for (let i = 0; i < selectedRowsList.length; i++) {
                                    let any = selectedRowKeys.includes(selectedRowsList[i][rowKey]);
                                    if (!any) {
                                        selectedRowsList.splice(i, 1);
                                    }
                                };
                                onChange && onChange([...selectedRowKeys], [...selectedRowsList]);
                                if (rowSelection.selectedRowKeys) {
                                    tempSelectedRowKeys = rowSelection.selectedRowKeys;
                                } else {
                                    tempSelectedRowKeys = selectedRowKeys;
                                }
                                setStateFun({
                                    selectedRowKeys: [...selectedRowKeysArray],
                                    selectedRows: [...selectedRowsList],
                                    selectedRowKeysArray: [...tempSelectedRowKeys],
                                    isTouch: true
                                });
                            } else {
                                onChange && onChange([...selectedRowKeys], [...selectedRows]);
                                setStateFun({
                                    selectedRowKeysArray: [...selectedRowKeys],
                                    selectedRowKeys: [...selectedRowKeys],
                                    selectedRows: [...selectedRows],
                                    isTouch: true
                                });
                            }
                        },
                        type: isMultiple ? 'checkbox' : 'radio'
                    }}
                    onRow={onRow || ((record) => {
                        return {
                            onDoubleClick: () => {
                                // const { onChange } = rowSelection;
                                // if (rowSelection.selectedRowKeys) {
                                //     selectedRowKeys = rowSelection.selectedRowKeys;
                                // }
                                if (multiple) {
                                    setStateFun({
                                        selectedRowKeys: [record[rowKey]] || [record['id']],
                                        selectedRows: [{ ...record[rowKey] }],
                                        selectedRowKeysArray: [record[rowKey]] || [record['id']],
                                        visible: false
                                    });
                                    onChangeFun([
                                        {
                                            key: record[rowKey] || [record['id']],
                                            record: record
                                        }
                                    ]);
                                } else {
                                    setStateFun({
                                        selectedRowKeys: [record[rowKey]] || [record['id']],
                                        selectedRows: [{ ...record[rowKey] }],
                                        visible: false
                                    });
                                    onChangeFun({
                                        key: record[rowKey] || [record['id']],
                                        record: record
                                    });
                                }
                            },
                        };
                    })}
                />
            </Modal>
        );
    }
}
