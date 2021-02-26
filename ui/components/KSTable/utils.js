/*
 * 获取默认宽度
 */
export function getDefaultWidth(column) {
    return column.width || 175;
}

/**
 * 增加序号
 */
export function addSortNumber(dataSource, pagination) {
    let isPagination = !!pagination;
    if (isPagination) {
        // 分页存在
        dataSource = dataSource && dataSource.map((data, idx) => {
            return {
                sortNum: (pagination.current - 1) * pagination.pageSize + idx + 1,
                ...data
            };
        });
    } else {
        // 分页不存在
        dataSource = dataSource && dataSource.map((data, idx) => {
            return {
                sortNum: idx + 1,
                ...data,
            };
        });
    }
    return dataSource;
}

/**
 * 获取所有子集
 * @param  {Array}  array    待被解析的数组
 * @param  {String} children 子集的key  默认为 children
 * @return {Array}           解析完的数组
 */
export function getDataList(array = [], children = 'children') {
    let result = [];
    array.forEach((item) => {
        result.push(item);
        if (item[children]) {
            let childs = getDataList(item[children]);
            result.push(...childs);
        }
    });
    return result;
}

/**
 * 获取元素到达视窗顶部的距离
 * @param  {Object} element 传入的dom元素
 * @return {Number}         计算后的高度
 */
export function getElementTop(element, parent = 'BODY') {
    let actualTop = element.offsetTop,
        current = element.offsetParent;
    while (current !== null) {
        actualTop += current.offsetTop;
        if (current && (current.tagName === parent || current.className.includes(parent))) {
            break;
        } else {
            current = current.offsetParent;
        }
    }
    return actualTop;
}
