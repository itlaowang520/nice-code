import React, {Component} from 'react';
import PropTypes, { oneOfType, oneOf } from 'prop-types';
import { Spin } from 'antd';
import Title from './Title';
import Pagination from './Pagination';
import TableInner from './TableInner';
import { calcColumns, addSortNumber } from './utils';

import './index.scss';

export default class KSOrderTable extends Component {
    static propTypes = {
        columns: PropTypes.array, // 表头设置
        dataSource: PropTypes.array, // 列表数据
        loading: PropTypes.bool, // 加载列表的状态
        pagination: oneOfType([
            PropTypes.bool,
            PropTypes.object
        ]),
        calcType: oneOf([
            'average',
            'last'
        ]),
        beforeRender: oneOfType([
            PropTypes.node,
            PropTypes.func
        ]), // 每条数据之前渲染节点
        afterRender: oneOfType([
            PropTypes.node,
            PropTypes.func
        ]), // 每条数据之前渲染节点
        childrenNode: oneOfType([
            PropTypes.string
        ]), // 子节点字段名称
    }

    static defaultProps = {
        calcType: 'average',
        childrenNode: 'children'
    }

    tableRef

    render() {
        let {
            columns, dataSource, pagination,
            loading, calcType, beforeRender,
            afterRender, childrenNode
        } = this.props;
        const parentWidth = this.tableRef && this.tableRef.offsetWidth;
        dataSource = addSortNumber(dataSource, pagination);
        calcColumns(columns, parentWidth, calcType);
        return (
            <div className='order-table' ref={(ref) => {
                this.tableRef = ref;
            }}>
                <Spin spinning={loading}>
                    <table>
                        <Title
                            columns={columns}
                        />
                        <TableInner
                            columns={columns}
                            dataSource={dataSource}
                            loading={loading}
                            beforeRender={beforeRender}
                            afterRender={afterRender}
                            childrenNode={childrenNode}
                        />
                    </table>
                </Spin>
                <Pagination pagination={pagination}/>
            </div>
        );
    }
}
