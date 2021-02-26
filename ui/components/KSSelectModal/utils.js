import { getObjectKey, isEmptyObject } from 'ks-cms-utils';
import { MATCH_KEY } from './constants';

/**
 * 根据父属性的value值 得到选中的唯一值数组
 * @param  {Object} props // 父属性
 * @return {Array} // 选中的key数组
 */
export const getSelectedRowKeys = (props) => {
    if (props.multiple) {
        return props.value.map((item) => getObjectKey(item));
    }
    let value = props.value && getObjectKey(props.value);
    return [value];
};

/**
 * 根据父属性的value值 得到选中的数据数组
 * @param  {Object} props // 父属性
 * @return {Array}  // 选中的数组列表
 */
export const getSelectedRows = (props, state) => {
    const { dataBase, isTouch, selectedRowKeysArray } = state;
    if (props.multiple) {
        // 多选 暂不支持附件多个上传
        return (isTouch ? selectedRowKeysArray : props.value || []).map((item) => getSelectedRows({
            value: item,
            rowKey: props.rowKey,
            showKey: props.showKey,
            childrenColumnName: props.childrenColumnName,
            dataBase
        }, {
            ...state, isTouch: false
        })[0]);
    }
    let obj = {},
        value = isTouch ? getObjectKey(selectedRowKeysArray[0]) : props.value && getObjectKey(props.value);
    const rowKey = props.rowKey || 'id';
    const showKey = props.showKey || 'name';
    obj[rowKey] = (value || '');
    obj[showKey] = (value || ''); // 如果数据来源里没有就直接显示id
    obj[MATCH_KEY] = false; // 标记没有匹配到数据

    // 兼容之前的老数据， 传入的value = null || undefined || '' || string类型
    if (isEmptyObject(props.value) && isEmptyObject(value)) {
        obj = {};
    } else if (typeof props.value === 'string') {
        obj = findDataInTree(dataBase, {
            children: props.childrenColumnName,
            rowKey: rowKey,
            value: value
        }) || obj;
    }

    // 如果是上传附件 则显示他附件名称
    if (props.value && props.value.showName) {
        obj[showKey] = props.value.showName;
    } else if (dataBase && dataBase.length) {
        // 从数据来源做回显示
        const item = findDataInTree(dataBase, {
            children: props.childrenColumnName,
            rowKey: rowKey,
            value: value,
        });
        //  如果在dataBase中找到，则用dataBase的数据
        if (item) {
            obj = item;
        } else {
            // 如果没有匹配到，且回显以{key, record}的形式回显，则以传入的返回
            if (Object.prototype.toString.call(props.value) === '[object Object]' && 'record' in props.value) {
                obj = props.value.record;
            }
        }
    }
    return [obj];
};

/**
 * 寻找数据
 * @param {Array} dataSource
 * @param {Object} param1
 */
export const findDataInTree = (dataSource, {
    children,
    rowKey,
    value
}) => {
    let result;
    dataSource.forEach((data) => {
        if (!result) {
            if (`${data[rowKey]}` === `${value}`) {
                result = data;
            }
            if (data[children]) {
                let tempResult = findDataInTree(data[children], {
                    children,
                    rowKey,
                    value
                });
                if (tempResult) {
                    result = tempResult;
                }
            }
        }
    });
    return result;
};

/**
 * 合并数据
 * @param  {Object} props 父属性
 * @param  {Object} state stats
 * @return {Array}       合并后的dataSource
 */
export const mergeData = (props, state) => {
    const { dataSource, childrenColumnName } = props;
    const { dataBase } = state;
    const rowKey = props.rowKey || 'id';
    let result = [...dataBase, ...dataSource],
        filterResult = [];
    result.reverse().forEach((item) => {
        let isSame = false,
            prevIndex;
        filterResult.forEach((i, idx) => {
            if (i[rowKey] === item[rowKey]) {
                isSame = true;
                prevIndex = idx;
            }
        });
        if (!isSame) {
            filterResult.push(item);
        } else {
            if (item && item[childrenColumnName]) {
                filterResult[prevIndex] = {
                    ...filterResult[prevIndex],
                    [childrenColumnName]: mergeData({
                        childrenColumnName,
                        dataSource: filterResult[prevIndex][childrenColumnName] || [],
                        rowKey
                    }, {
                        dataBase: item[childrenColumnName] || [],
                    })
                };
            }
        }
    });
    return filterResult;
};

/**
 * 整合数据
 * @param  {[type]} props   [description]
 * @param  {[type]} rowKeys [description]
 * @return {[type]}         [description]
 */
export const integrateData = (props, rowKeys) => {
    const { extendProps = {} } = props;
    const { rowSelection = {} } = extendProps;
    if (rowSelection.selectedRowKeys) {
        return rowSelection.selectedRowKeys;
    }
    return rowKeys;
};
