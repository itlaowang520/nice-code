export const DEFAULT_WIDTH = 175;
export const PADDING = 0;
/**
 * 计算宽度
 * @param {*} columns
 * @param {*} parentWidth
 * @param {*} calcType
 */
export const calcColumns = (columns, parentWidth, calcType) => {
    if (parentWidth) {
        let totalWidth = columns.reduce((prev, {width}) => prev + (width || DEFAULT_WIDTH), 0);
        if (totalWidth < parentWidth) {
            switch (calcType) {
                case 'average':
                    let averageAddWidth = (parentWidth - totalWidth - PADDING * 2) / columns.length;
                    columns.forEach((record, index) => {
                        if (index < columns.length - 1) {
                            record['width'] = (record['width'] || DEFAULT_WIDTH) + averageAddWidth;
                        } else {
                            record['width'] = (record['width'] || DEFAULT_WIDTH) + (parentWidth - totalWidth - (averageAddWidth * columns.length - 1));
                        }
                    });
                    break;
                case 'last':
                default:
                    let lastData = columns[columns.length - 1];
                    lastData['width'] = (lastData['width'] || DEFAULT_WIDTH) + (parentWidth - totalWidth - PADDING * 2);
            }
        }
    }
};

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
