import React from 'react';
import PropTypes from 'prop-types';
import { Resizable } from 'react-resizable';
import { Table, Dropdown, Checkbox } from 'antd';
import KSMobileTable from './KSMobileTable';
import KSPagination from '../KSPagination';
import { EditableCell, EditableFormRow } from './KSEditableComponents';
import { getDefaultWidth, addSortNumber, getDataList, getElementTop } from './utils';
import './index.scss';

const ResizeableTitle = (props) => {
    const { onResize, width, ...restProps } = props;

    if (!width) {
        return <th {...restProps} />;
    }

    return (
        <Resizable
            width={width}
            height={0}
            onResize={onResize}
            draggableOpts={{ enableUserSelectHack: false }}
        >
            <th {...restProps} />
        </Resizable>
    );
};

ResizeableTitle.propTypes = {
    onResize: PropTypes.func, // 尺寸变化监听
    width: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]), // 宽度
};

export default class KSTable extends React.PureComponent {
    static propTypes = {
        columns: PropTypes.array, // 表头设置
        dataSource: PropTypes.array, // 数据内容列表
        pagination: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.bool,
        ]), // 是否分页 或者 分页对象(包含分页信息)
        rowKey: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.func,
        ]), // 每一条数据中唯一标识
        loading: PropTypes.bool, // 是否为正在加载状态
        onrowClick: PropTypes.func, // 行点击事件
        isMobile: PropTypes.bool, // 是否为移动端
        filterColumns: PropTypes.bool, // 是否可以选择筛选表头
        autoHeight: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.object,
        ]), // 自动高度配置
        onRow: PropTypes.func, // 行事件
        resizable: PropTypes.bool, // 是否可拖拽列宽
    }

    components = {
        header: {
            cell: ResizeableTitle,
        },
    }

    table // table实例

    state = {
        reRander: 0, // 强制子组件重新rander
        scrollY: null, // 列表纵向滚动
        preHeightDiff: 0, // 高度差
        visible: false, // 下拉框的显隐
        columns: this.props.columns && this.props.columns.map((col) => {
            return {
                ...col,
                checked: true
            };
        }), // 表头列表并增加默认选中字段
    }

    static defaultProps = {
        onRow: () => ({}),
        resizable: true
    }

    // 更新columns
    static getDerivedStateFromProps(props, state) {
        let tempColumns = [...props.columns];
        tempColumns = tempColumns.map((col) => {
            let key = col.dataIndex || String(col.render || '');
            state.columns.forEach((oldCol) => {
                let oldKey = oldCol.dataIndex || String(oldCol.render || '');
                if (key === oldKey) {
                    col.checked = oldCol.checked;
                    if (oldCol['prevWidth'] && oldCol['prevWidth'] === col['width']) {
                        col.width = oldCol.width;
                    } else {
                        col.prevWidth = col.width;
                    }
                }
            });
            if (col.checked === undefined) {
                col.checked = true;
            }
            return col;
        });
        return {
            columns: [...tempColumns]
        };
    }

    /*
    * 设置过滤表头下拉框显隐
    * @params {boolean} flag //是否显示
    */
    setVisible = (flag) => {
        this.setState({
            visible: flag
        });
    }

    /*
    * 增加表头过滤
    * @params {object} props //被增加属性的对象
    * @return 增加后的props
    */
    addTitleFilter = (props) => {
        // 获取下拉框的menu
        let menu = this.getColumns();
        props['title'] = () => {
            return (
                <Dropdown visible={this.state.visible} onVisibleChange={this.setVisible.bind(this)} placement="bottomLeft" overlay={menu} trigger={['click']}>
                    <a onClick={() => {
                        // 打开筛选
                        this.setVisible(true);
                    }}>过滤表头</a>
                </Dropdown>
            );
        };
        // 过滤为选中显示的colunms
        props['columns'] = this.state.columns.filter((col) => col.checked);
        return props;
    }

    /*
    * 根据state中的columns生成下拉菜单
    * @return 返回下拉菜单节点
    */
    getColumns = () => {
        // 生成勾选的item
        let menu = this.state.columns.map((col, idx) => {
                return (
                    <div className='filterMenuLi' key={idx}>
                        {col.title} <Checkbox onChange={(value) => {
                            // 控制对应column的显隐
                            let tempColumns = [...this.state.columns];
                            tempColumns[idx]['checked'] = value.target.checked;
                            this.setState({
                                columns: tempColumns
                            });
                        }} checked={col.checked} />
                    </div>
                );
            }),
            checkedAll, // 全部选中的状态  2 全选 1 半选 0 未选中
            checkeds = this.state.columns.filter((col) => col.checked); // 已经选择的checkbox

        if (checkeds.length === this.props.columns.length) {
            checkedAll = 2;
        } else if (checkeds.length > 0) {
            checkedAll = 1;
        } else {
            checkedAll = 0;
        }

        return (
            <div className='filterMenu'>
                <div className='filterMenuCheckAll'>
                    <div className='filterMenuLi' key={-1}>
                        全部 <Checkbox
                            indeterminate={checkedAll === 1}
                            checked={checkedAll === 2}
                            onChange={(value) => {
                                let tempColumns = [...this.state.columns];
                                if (value.target.checked) {
                                    // 全选
                                    tempColumns.forEach((col) => { col['checked'] = true; });
                                } else {
                                    // 全反选
                                    tempColumns.forEach((col) => { col['checked'] = false; });
                                }
                                // 保存各个columns显示隐藏状态
                                this.setState({
                                    columns: tempColumns
                                });
                            }}
                        />
                    </div>
                </div>
                <div className='filterMenuDivider'></div>
                <div className='filterMenuUl'>
                    {menu}
                </div>
                <div className='filterMenuDivider'></div>
                <div
                    className='filterMenuClose'
                    key={-2}
                    onClick={() => {
                        // 关闭筛选
                        this.setVisible(false);
                    }}
                >
                    <a>关闭</a>
                </div>
            </div>
        );
    }

    getSnapshotBeforeUpdate() {
        return (this.table && this.table.offsetHeight) || 0;
    }

    componentDidUpdate(preProps, preState, snapshot) {
        this.setTableHeight(snapshot);
    }

    componentDidMount() {
        this.setTableHeight(null, true);
        window.onresize = this.setTableHeight.bind(this, null);
    }

    /**
     * 设置table高度并且设置scrollY
     * @param {Number} snapshot rander之前的高度
     * @param {Boolean} isSetState 是否setState
     */
    setTableHeight = (snapshot, isSetState) => {
        if (!this.table) {
            return;
        }
        const autoHeight = 'autoHeight' in this.props ? this.props.autoHeight : true;
        if (autoHeight) {
            const autoHeightType = autoHeight.type || 'normal';
            const bottom = autoHeight.bottom || 0;
            const height = this.getTableHeight(autoHeightType) - bottom;
            this.table.style.height = height + 'px';
            if ((snapshot !== 0 && height >= 0 && (Math.abs(snapshot - height) !== this.state.preHeightDiff)) || isSetState) {
                const isPagination = this.props.pagination;
                const isFilterColumns = this.props.filterColumns;
                let scrollY = height - 37;
                if (isPagination) {
                    scrollY -= 46;
                }
                if (isFilterColumns) {
                    scrollY -= 38;
                }
                this.setState({
                    scrollY,
                    preHeightDiff: Math.abs(snapshot - height)
                });
            }
        } else {
            let tableBody = this.table && this.table.children[0];
            const isPagination = this.props.pagination;
            const height = isPagination ? 44 : 0;
            if (!isPagination) {
                this.table.style.borderBottom = 'none';
            }
            this.table.style.height = (tableBody.offsetHeight || 0) + height + 'px';
        }
    }

    /**
     * 获取列表高度
     * @param  {String} type 列表类型  模态框：modal 父子级：column 正常的用：normal或者不加autoHeight属性
     * @return {Number}      计算后的高度
     */
    getTableHeight = (type) => {
        let height;
        switch (type) {
            case 'modal':
                height = window.innerHeight * 0.5;
                break;
            case 'column':
                const autoHeight = 'autoHeight' in this.props ? this.props.autoHeight : {};
                const newHeight = autoHeight.height || window.innerHeight / 2;
                height = newHeight - ((this.table && getElementTop(this.table, 'colWhiteCard-content')) || 0) - 63;
                break;
            case 'normal':
            default:
                height = window.innerHeight - ((this.table && getElementTop(this.table)) || 0) - 15;
        }
        return height;
    }

    /**
     * 强制刷新组件
     */
    handleRender = () => {
        this.setState({
            reRander: this.state.reRander + 1
        });
    }

    handleResize = (index) => (e, { size }) => {
        this.setState(({ columns }) => {
            const nextColumns = [...columns];
            nextColumns[index] = {
                ...nextColumns[index],
                width: size.width,
            };
            return { columns: nextColumns };
        });
    }

    /**
     * 增加编辑属性
     */
    addEditor = (col, props) => ({
        ...col,
        onCell: (record) => ({
            record,
            editable: col.editable,
            dataIndex: col.dataIndex,
            title: col.title,
            cellSave: props.cellSave,
            updateRender: this.handleRender
        }),
    })
    /**
     * 上下父子级table, type为column时，针对表格行高及间隙做调整，添加了class类
     */
    setColumnsName = (str) => {
        if ('autoHeight' in this.props && this.props.autoHeight.type === 'column') {
            return 'KSTable-column-small-style' + str;
        } else {
            return '';
        }
    }

    render() {
        const { isMobile, filterColumns, dataSource, pagination, onRow } = this.props;
        const isFilterColumns = !!filterColumns;
        let props = {
                ...this.props,
                dataSource: addSortNumber(dataSource, pagination)
            }, doubleRow = !!onRow;
        if (!isMobile) {
            props = {
                size: 'small', // 默认最小列表
                defaultExpandAllRows: true, // 默认展开所有子级
                onExpand: this.handleRender,
                reRander: this.state.reRander,
                ...props,
                onRow: (record, index) => {
                    if (doubleRow) {
                        return {
                            onClick: (event) => {
                                if (props.rowSelection) {
                                    // 增加默认行选中
                                    const { rowKey, dataSource } = props;
                                    const { onChange } = props.rowSelection;
                                    const dataList = getDataList(dataSource);
                                    // 如需点击行 选中 必须增加selectedRowKeys 属性
                                    if (props.rowSelection.type && props.rowSelection.type === 'radio') {
                                        // radio情况
                                        onChange && onChange([record[rowKey]], [record]);
                                    } else {
                                        const { selectedRowKeys = [] } = props.rowSelection;
                                        // checkbox情况
                                        let idx = selectedRowKeys.indexOf(record[rowKey]),
                                            selectKeys = [],
                                            selectRows = [];
                                        if (idx > -1) {
                                            // 已经存在
                                            selectKeys = [...selectedRowKeys];
                                            selectKeys.splice(idx, 1);
                                            selectRows = dataList.filter((data) => selectKeys.includes(data[rowKey]));
                                        } else {
                                            // 不存在
                                            selectKeys = [...selectedRowKeys, record[rowKey]];
                                            selectRows = dataList.filter((data) => selectKeys.includes(data[rowKey]));
                                        }
                                        onChange && onChange(selectKeys, selectRows);
                                    }
                                }
                                this.props.onrowClick && this.props.onrowClick(record, event);
                            },
                            ...this.props.onRow({ ...record }, index)
                        };
                    } else {
                        return {
                            onClick: (event) => {
                                if (props.rowSelection) {
                                    // 增加默认行选中
                                    const { rowKey, dataSource } = props;
                                    const { onChange } = props.rowSelection;
                                    const dataList = getDataList(dataSource);
                                    // 如需点击行 选中 必须增加selectedRowKeys 属性
                                    if (props.rowSelection.type && props.rowSelection.type === 'radio') {
                                        // radio情况
                                        onChange && onChange([record[rowKey]], [record]);
                                    } else {
                                        const { selectedRowKeys = [] } = props.rowSelection;
                                        // checkbox情况
                                        let idx = selectedRowKeys.indexOf(record[rowKey]),
                                            selectKeys = [],
                                            selectRows = [];
                                        if (idx > -1) {
                                            // 已经存在
                                            selectKeys = [...selectedRowKeys];
                                            selectKeys.splice(idx, 1);
                                            selectRows = dataList.filter((data) => selectKeys.includes(data[rowKey]));
                                        } else {
                                            // 不存在
                                            selectKeys = [...selectedRowKeys, record[rowKey]];
                                            selectRows = dataList.filter((data) => selectKeys.includes(data[rowKey]));
                                        }
                                        onChange && onChange(selectKeys, selectRows);
                                    }
                                }
                                this.props.onrowClick && this.props.onrowClick(record, event);
                            },
                        };
                    }
                }, // 增加onrowClick事件
            };

            // 如果有设置过滤表头 增加其属性
            if (isFilterColumns) {
                props = this.addTitleFilter(props);
            }
            // 设置滚动宽度
            let scrollWidth = 0,
                isEditable = false;
            props['columns'] = props['columns'].map((col) => {
                // 增加默认宽度 默认 140
                col['width'] = getDefaultWidth(col);
                // 增加默认样式 cellStyle
                if (col['className']) {
                    if (!col['className'].includes('cellStyle')) {
                        col['className'] = `${col['className']} cellStyle`;
                    }
                } else {
                    col['className'] = 'cellStyle';
                }
                scrollWidth += col['width'];

                // 编辑如果列可编辑则增加属性
                if (col.editable) {
                    isEditable = true;
                    col = this.addEditor(col, props);
                }
                return col;
            });

            // 可编辑table
            if (isEditable) {
                props.components = {
                    body: {
                        row: EditableFormRow,
                        cell: EditableCell
                    }
                };
            }

            // 如果是可拖拽列宽
            if (this.props.resizable) {
                props['columns'] = this.state.columns.map((col, index) => {
                    // 编辑如果列可编辑则增加属性
                    if (col.editable) {
                        isEditable = true;
                        col = this.addEditor(col, props);
                    }
                    return ({
                        ...col,
                        onHeaderCell: (column) => ({
                            width: column.width,
                            onResize: this.handleResize(index),
                        }),
                    });
                });
                props = {
                    ...props,
                    components: {
                        ...this.components,
                        ...(props.components || {}),
                    }
                };
            }

            /**
             * rowSelection兼容问题
             * scrollX的情况下 有rowSelection出现 对不齐的情况
             * 暂时解决办法： 有rowSelection 则给rowSelection 64px的宽度，以防挤压别的columns
             */
            if (props.rowSelection) {
                scrollWidth += 64;
            }

            props['scroll'] = {
                ...props['scroll'],
                x: scrollWidth
            };

            if (this.state.scrollY) {
                props['scroll'] = {
                    ...props['scroll'],
                    y: this.state.scrollY
                };
            }

            return (
                <div
                    className='table-content'
                    ref={(ref) => {
                        this.table = ref;
                    }}
                >
                    <Table
                        key={`table-${props.dataSource && props.dataSource.length}`}
                        {...props}
                        pagination={false}
                        className='KSTable-column-small-style'
                    />
                    {
                        pagination && <div className='table-pagination KSTable-column-small-style-table' >
                            <KSPagination {...pagination}/>
                        </div>
                    }
                </div>
            );
        } else {
            return (
                <KSMobileTable {...props} />
            );
        }
    }
}
