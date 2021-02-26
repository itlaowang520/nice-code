// 生成随机不重复id
const getRandomId = () => {
    return Math.random().toString(36).substring(2);
};
// 深度拷贝
const deepCopy = function(obj) {
    let object;
    // 深度复制数组
    if (Object.prototype.toString.call(obj) === '[object Array]') {
        object = [];
        for (let i = 0; i < obj.length; i++) {
            object.push(deepCopy(obj[i]));
        }
        return object;
    }
    // 深度复制对象
    if (Object.prototype.toString.call(obj) === '[object Object]') {
        object = {};
        for (let p in obj) {
            const value = obj[p];
            if (typeof value === 'object') {
                object[p] = deepCopy(value);
            } else {
                object[p] = value;
            }
        }
        return object;
    }
    return obj;
};
export {
    getRandomId,
    deepCopy
};
