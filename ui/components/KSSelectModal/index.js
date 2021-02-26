import React, { Fragment } from 'react';
import { Input, Button, Icon, Tooltip } from 'antd';
import PropTypes from 'prop-types';
import SelectModal from './SelectModal';
import UploadModal from './UploadModal';
import { getObjectKey } from 'ks-cms-utils';
import { getSelectedRowKeys, getSelectedRows, mergeData, integrateData } from './utils';
import './index.scss';

export default class KSSelectModal extends React.Component {
    static propTypes = {
        disabled: PropTypes.bool,
        columns: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.bool,
        ]), // 选择modal列表表头来源
        dataSource: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.bool,
        ]), // 选择modal列表数据来源
        pagination: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.bool,
        ]), // 选择modal列表分页配置
        rowKey: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.func,
        ]), // 选择modal列表唯一标示，也是最终获取value的其中一个值 默认 'id'
        loading: PropTypes.bool, // 选择modal列表的loading
        onSearch: PropTypes.func, // 选择modal搜索事件
        onChange: PropTypes.func, // 选中值后的回调事件
        onClick: PropTypes.func, // 点击事件
        onUpload: PropTypes.func, // 上传按钮点击事件
        onClear: PropTypes.func, // 点击清除按钮时的事件
        clearable: PropTypes.bool, // 是否可清除
        title: PropTypes.string, // 选择modal的title参数 默认 '选择'
        searchLabel: PropTypes.string, // 选择modal中 input的placeholder  默认 '名称'
        showKey: PropTypes.string, // 最终想展示的字段
        placeholder: PropTypes.string, // 默认选择input的plaeholder
        visible: PropTypes.bool, // modal的显示隐藏
        visibleChange: PropTypes.func, // 显隐变更事件
        children: PropTypes.node, // 子节点
        multiple: PropTypes.bool, // 是否可以多选
        maxCount: PropTypes.number, // 多选时最多的数量
        value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
            PropTypes.array,
            PropTypes.object
        ]), // 初始值
        upload: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.object
        ]), // 是否需要上传本地资源
        extendUploadProps: PropTypes.object, // KSUpload继承的属性
        tooltip: PropTypes.oneOfType([
            PropTypes.bool,
        ]), // 显示悬浮框
        childrenColumnName: PropTypes.string, // Table子级字段
        componentSize: PropTypes.string
    }

    static defaultProps = {
        disabled: false,
        tooltip: true,
        childrenColumnName: 'children',
        componentSize: 'default'
    }

    /*
    * upload 对象说明
    * upload: {
    *     folderList: PropTypes.array, // 文件夹列表 必传参数
    *     folderkey: PropTypes.string, // 文件夹option key 默认 'dictionaryId'
    *     folderValue: PropTypes.string, // 文件夹option显示字段 默认 'dictionaryName'
    *     fileTypeList: PropTypes.array, // 文件类别列表 必传参数
    *     fileTypekey: PropTypes.string, // 文件类别option key 默认 'dictionaryId'
    *     fileTypeValue: PropTypes.string, // 文件类别option显示字段 默认 'dictionaryName'
    *     fileTypeCode: PropTypes.string, // 默认上传附件类型
    *     folderCode: PropTypes.string, // 默认上传文件夹
    *     uploadAPI: PropTypes.string, // 上传API 必传参数
    *     saveAPI: PropTypes.string // 保存文件API 必传参数
    * }
    *
    * value 对象说明
    * object: {
    *     key: PropTypes.string | PropTypes.number // 默认唯一id
    *     showName: PropTypes.string // 附件上传显示的附件名称 或者 指定回显的字符串
    * }
    */
    state = {
        visible: false, // 选择modal
        uploadVisible: false, // 上传modal
        searchValue: '',
        dataSource: [],
        dataBase: [],
        value: undefined,
        selectedRowKeys: integrateData((this.props.value && getSelectedRowKeys(this.props)) || []),
        selectedRows: (this.props.value && getSelectedRows(this.props, {dataBase: [], selectedRowKeysArray: []})) || [],
        selectedRowKeysArray: integrateData(this.props, (this.props.value && getSelectedRowKeys(this.props)) || []),
        listArray: [],
        isTouch: false,
        selectedRowsList: [],
    }

    // 更新选中状态
    static getDerivedStateFromProps(props, state) {
        const rowKey = props.rowKey || 'id';
        const dataBase = mergeData(props, state);
        if (props.multiple) {
            // 多选
            let rows = getSelectedRows(props, {...state, dataBase}),
                selectedRowKeys = rows.map((item) => getObjectKey(item, rowKey)) || [];
            if (props.extendProps && props.extendProps.rowSelection && props.extendProps.rowSelection.selectedRowKeys) {
                selectedRowKeys = props.extendProps.rowSelection.selectedRowKeys;
            }
            if (!props.value && !state.isTouch) {
                rows = [];
            }
            return {
                selectedRowKeys: selectedRowKeys,
                selectedRows: rows || [],
                selectedRowKeysArray: selectedRowKeys,
                dataSource: props.dataSource,
                value: props.value,
                dataBase
            };
        }
        let obj = getSelectedRows(props, {...state, dataBase})[0],
            selectedRowKeys = [getObjectKey(obj, rowKey)];
        if (props.extendProps && props.extendProps.rowSelection && props.extendProps.rowSelection.selectedRowKeys) {
            selectedRowKeys = props.extendProps.rowSelection.selectedRowKeys;
        }
        return {
            selectedRowKeys: selectedRowKeys,
            selectedRows: [obj],
            selectedRowKeysArray: selectedRowKeys,
            dataSource: props.dataSource,
            value: props.value,
            dataBase
        };
    }

    // 重置状态
    handlerReset() {
        this.setState({
            visible: false,
            uploadVisible: false,
            isTouch: false,
            selectedRowKeys: integrateData((this.props.value && getSelectedRowKeys(this.props)) || []),
            selectedRows: (this.props.value && getSelectedRows(this.props, this.state)) || [],
            selectedRowKeysArray: integrateData((this.props.value && getSelectedRowKeys(this.props)) || [])
        });
        if (this.props.visible) {
            this.props.visibleChange && this.props.visibleChange(false);
        }
    }

    // 修改组件值
    handerChange(object) {
        this.props.onChange(object);
        this.handlerReset();
    }

    // 改变外部state
    handerState(object) {
        this.setState(object);
    }

    // onSearch事件
    handerOnSearch(searchValue) {
        this.props.onSearch && this.props.onSearch(searchValue);
    }

    /**
     * 获取是否展示名称
     * @param  {Node} children 子级
     * @return {Node}
     */
    getTooltip = (children) => {
        const { tooltip } = this.props;
        if (!tooltip) {
            return <Fragment>
                {children}
            </Fragment>;
        } else {
            return <Tooltip placement="topLeft" title={this.getShowName()}>
                {children}
            </Tooltip>;
        }
    }

    /**
     * 获取显示名称
     * @return {String} 显示的名称
     */
    getShowName() {
        const { selectedRows } = this.state;
        const { showKey = 'name', value, multiple } = this.props;
        if (multiple) {
            if (!multiple && value.length > 1) {
                return value[0][showKey] || selectedRows[0][showKey] || null;
            }
            return value && selectedRows.length ? selectedRows.map((item, idx) => (value && value[idx] && value[idx].record && value[idx].record[showKey]) || item[showKey]).filter((item) => item).join('、') : null;
        }
        return value && selectedRows.length ? (value && value.record && value.record[showKey]) || selectedRows[0][showKey] : null;
    }

    handleClick = async() => {
        const { disabled, value, onClick } = this.props;
        if (disabled) {
            return;
        }
        if (onClick) {
            const clickEffect = onClick();
            /* 同步事件 */
            if (clickEffect === false) {
                return;
            } else if (clickEffect && 'then' in clickEffect) {
                // 如果click是个异步事件
                const result = await clickEffect.then();
                if (result === false) {
                    return;
                }
            }
        }
        // let outClickEvent = onClick && onClick();
        // if (outClickEvent === false) {
        //     return;
        // } else if (Object.prototype.toString.call(outClickEvent)) {
        //     let a;
        //     await outClickEvent.then((res) => {
        //         a = res;
        //     });
        //     if (a === false) {
        //         return;
        //     }
        // }
        if (value) {
            this.setState({
                visible: true
            });
        } else {
            this.setState({
                visible: true,
                selectedRowKeys: [],
                selectedRows: []
            });
        }
    };

    handleClickUpload = async() => {
        const { disabled, onUpload } = this.props;
        if (disabled) {
            return;
        }

        if (onUpload) {
            const clickEffect = onUpload();
            /* 同步事件 */
            if (clickEffect === false) {
                return;
            } else if (clickEffect && 'then' in clickEffect) {
                // 如果click是个异步事件
                const result = await clickEffect.then();
                if (result === false) {
                    return;
                }
            }
        }
        this.setState({
            uploadVisible: true
        });
    };

    render() {
        const { uploadVisible } = this.state;
        let visible = 'visible' in this.props ? this.props.visible : this.state.visible;
        const {
            clearable,
            value,
            disabled,
            placeholder,
            upload,
            multiple,
            componentSize
        } = this.props;
        const hasValue = multiple ? value && Boolean(value.length) : Boolean(value);
        const isUpload = Boolean(upload);
        const suffix = clearable && hasValue
            ? <Icon
                type="close-circle"
                onClick={() => {
                    this.handerChange.bind(this, undefined)();
                    this.setState({
                        selectedRowKeys: [],
                        selectedRows: [],
                        selectedRowKeysArray: []
                    });
                    this.props.onClear && this.props.onClear(this.props.value);
                }} />
            : <Icon
                type="search"
                style={{ color: 'rgba(0,0,0,.45)' }}
                onClick={this.handleClick}
            />;
        let inputClassName = 'selectSearch';
        if (isUpload) {
            inputClassName += ' selectModalUpload';
        }
        if (disabled) {
            inputClassName += ' disabled';
        }
        return (
            <Fragment>
                {
                    this.getTooltip((
                        this.props.children && <div
                            onClick={this.handleClick}
                        >{this.props.children}</div>
                    ) || <Input
                        disabled={disabled}
                        readOnly
                        className={inputClassName}
                        placeholder={placeholder}
                        suffix={!disabled && suffix}
                        onClick={this.handleClick}
                        value={this.getShowName()}
                        size={componentSize}
                    />)
                }
                {isUpload && <Button
                    disabled={disabled}
                    className='selectModalUploadButton'
                    shape="circle"
                    size='small'
                    icon='upload'
                    onClick={this.handleClickUpload}
                />}
                {
                    visible && <SelectModal
                        {...this.state}
                        {...this.props}
                        cancelFun={this.handlerReset.bind(this)}
                        onChangeFun={this.handerChange.bind(this)}
                        setStateFun={this.handerState.bind(this)}
                        onSearchFun={this.handerOnSearch.bind(this)}
                    />
                }
                {
                    uploadVisible && <UploadModal
                        {...this.state}
                        {...this.props}
                        cancelFun={this.handlerReset.bind(this)}
                        onChangeFun={this.handerChange.bind(this)}
                        setStateFun={this.handerState.bind(this)}
                    />
                }
            </Fragment>
        );
    }
}
