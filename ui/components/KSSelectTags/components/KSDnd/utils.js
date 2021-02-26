/**
 * 将px转成数值型
 * @param {string | number} data
 */
export const toNumber = (data) => {
    const dataType = typeof data;
    if (dataType === 'string') {
        if (data.includes('px')) {
            return data.replace(/px/g, '') - 0;
        }
    } else {
        return data - 0;
    }
};
