import { DATA_TYPE_CONSTANT } from './constants';
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
};

/** 处理最终数据
     * @param pendingData 待处理数据
     * @param otherData 附加数据
     * @returns resultData 处理完的数据
     */
const save = (pendingData) => {
    let copyData = deepCopy(pendingData);
    // 逐层处理数据
    const progressiveHandle = (data) => {
        let resultData = {};
        data.forEach((item) => {
            let currType = item.type;
            switch (currType) {
                case DATA_TYPE_CONSTANT.STRING:
                    // console.log('itemValue', item.value);
                    if (item.value && item.value.key) {
                        resultData[item.key] = item.value.record.cdnUrl;
                    } else {
                        resultData[item.key] = item.value;
                    }
                    // resultData[item.key] = item.value.key || item.value;
                    break;
                case DATA_TYPE_CONSTANT.NUMBER:
                    resultData[item.key] = item.value;
                    break;
                case DATA_TYPE_CONSTANT.ARRAY:
                    if (item.child && item.child.length) {
                        // console.log('progressiveHandle(item.child)', progressiveHandle(item.child));
                        resultData[item.key] = Object.values(progressiveHandle(item.child));
                    }
                    break;
                case DATA_TYPE_CONSTANT.OBJECT:
                    if (item.child && item.child.length) {
                        resultData[item.key] = progressiveHandle(item.child);
                    }
                    break;
            }
        });
        return resultData;
    };
    let result = progressiveHandle(copyData);
    return result;
};

// 筛数据
const filterData = (data) => {
    if (!Object.keys(data).length) { return; }
    let currData = deepCopy(data);
    const progressivefilter = (data) => {
        data.forEach((item, index) => {
            if (item.value.key) {
                if (['image', 'audio', 'vedio'].includes(item.valueType)) {
                    item.value = {
                        key: item.value.record.cdnUrl,
                        record: {
                            fileId: item.value.record.fileId,
                            fileName: item.value.record.fileName,
                            cdnUrl: item.value.record.cdnUrl,
                        }
                    };
                }
            } else if (item.child && item.child.length) {
                progressivefilter(item.child);
            }
        });
    };
    progressivefilter(currData);
    return currData;
};

/** 获取本地json数据
    * @param path 路径
    * @returns Promise 获取到的数据
    */
const getGeneraterData = (path) => {
    try {
        return new Promise((resolve, reject) => {
            fetch(`./src/pages/TemplateMgt/CustomComponents/generaterData/${path}.json`)
                .then((res) => {
                    return res.json();
                })
                .then((data) => {
                    let response = data;
                    resolve(response);
                });
        });
    } catch (e) {
        console.log('e', e);
    }
};

const isJSON = (str) => {
    if (typeof str === 'string') {
        try {
            let obj = JSON.parse(str);
            if (typeof obj === 'object' && obj) {
                return true;
            } else {
                return false;
            }
        } catch (e) {
            console.log('error：' + str + '!!!' + e);
            return false;
        }
    }
    console.log('It is not a string!');
};

export {
    getRandomId,
    deepCopy,
    save,
    filterData,
    getGeneraterData,
    isJSON
};
