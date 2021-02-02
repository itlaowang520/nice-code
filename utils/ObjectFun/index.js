
/**
 * 去掉对象中无值的key
 * @param obj
 * @returns {*}
 */
export const deleteObjectEmptyKey = (obj) => {
    Object.keys(obj).forEach((key) => {
        if (obj[key] === '' || obj[key] === undefined) {
            delete obj[key];
        }
    });
    return obj;
};

/* 判断是否是空对象 */
export const isEmptyObject = (obj) => {
    // 空数组返回 true
    if (Array.isArray(obj)) {
        return !obj.length;
    }
    if (Object.prototype.toString.call(obj) === '[object Object]') {
        for (let t in obj) {
            return false;
        }
        return true;
    }
    return !obj;
};

export default {
    deleteObjectEmptyKey,
    isEmptyObject
};
