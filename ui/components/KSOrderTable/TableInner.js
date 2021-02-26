import React, {Component, Fragment} from 'react';
import PropTypes, { oneOf, oneOfType } from 'prop-types';
import { Empty } from 'antd';
import { calcColumns, DEFAULT_WIDTH } from './utils';
import './index.scss';

export default class TableInner extends Component {

    static propTypes = {
        columns: PropTypes.array, // 表头设置
        parentWidth: PropTypes.number, // 父级宽度
        calcType: oneOf([
            'average',
            'last'
        ]),
        dataSource: PropTypes.array, // 列表数据
        loading: PropTypes.bool, // 加载loading
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
        calcType: 'average'
    }

    render() {
        const {
            dataSource, columns, calcType,
            parentWidth, beforeRender, afterRender,
            childrenNode
        } = this.props;
        calcColumns(columns, parentWidth, calcType);
        const isRenderChildren = columns.some(({children}) => !!children);
        return (
            <tbody className='order-table-body'>
                {
                    !dataSource.length && <tr>
                        <td colSpan={columns.length}>
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                        </td>
                    </tr>
                }
                {
                    !!dataSource.length && dataSource.map((record, index) => {
                        const childrens = record[childrenNode];
                        const afterRenderNode = afterRender && afterRender(record, index);

                        return (
                            <Fragment key={index}>
                                {
                                    beforeRender && <tr style={{background: '#e8f5ff'}}>
                                        <td colSpan={columns.length}>
                                            {beforeRender(record, index)}
                                        </td>
                                    </tr>
                                }
                                {
                                    !isRenderChildren && <tr className={afterRenderNode ? '' : 'order-table-tr-border-btm'}>
                                        {
                                            columns && columns.map(({title, dataIndex, width, render}, idx) => {
                                                return (
                                                    <td
                                                        style={{minWidth: width || DEFAULT_WIDTH}}
                                                        key={title}
                                                    >
                                                        {
                                                            !!render && render(record[dataIndex], record, index)
                                                        }
                                                        {
                                                            !render && record[dataIndex]
                                                        }
                                                    </td>
                                                );
                                            })
                                        }
                                    </tr>
                                }
                                {
                                    isRenderChildren && childrens.map((child, idx) => {
                                        return <tr
                                            key={`${index}_${idx}`}
                                            className={!afterRenderNode && idx === childrens.length - 1 ? 'order-table-tr-border-btm' : ''}
                                        >
                                            {
                                                columns && columns.map(({title, dataIndex, width, render, children}) => {
                                                    if (!children && idx > 0) {
                                                        return null;
                                                    }
                                                    let data = record,
                                                        renderFunc = render,
                                                        dataInd = dataIndex,
                                                        params = [data[dataInd], data, index];
                                                    if (children) {
                                                        data = child;
                                                        renderFunc = children.render;
                                                        dataInd = children.dataIndex;
                                                        params = [data[dataInd], data, record, idx];
                                                    }
                                                    return (
                                                        <td
                                                            style={{minWidth: width || DEFAULT_WIDTH}}
                                                            key={title}
                                                            valign='top'
                                                            rowSpan={(!children && idx === 0) ? childrens.length : null}
                                                        >
                                                            {
                                                                !!renderFunc && renderFunc(...params)
                                                            }
                                                            {
                                                                !renderFunc && data[dataInd]
                                                            }
                                                        </td>
                                                    );
                                                })
                                            }
                                        </tr>;
                                    })
                                }

                                {
                                    afterRenderNode && <tr className='order-table-tr-border-btm'>
                                        <td colSpan={columns.length}>
                                            {afterRenderNode}
                                        </td>
                                    </tr>
                                }
                            </Fragment>
                        );
                    })
                }
            </tbody>
        );
    }
}
