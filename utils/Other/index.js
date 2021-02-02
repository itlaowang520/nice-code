import { CryptoJS } from 'ks-libs';
import { FORMAT_TYPE } from './constants';
const [TRIM] = FORMAT_TYPE;

/**
 * 内嵌加载iframe onload后删除
 * @param  {String}   url      // 加载的url
 * @param  {Function} callback // 加载后的回调
 * @param  {Number}   time     // 加载成功后延时多久 后再调回调
 */
const loadIframe = (url, callback, time) => {
    let ifr = document.createElement('iframe');
    ifr.src = url;
    ifr.style.width = '0px';
    ifr.style.height = '0px';
    ifr.style.overflow = 'hidden';
    ifr.style.display = 'none';
    ifr.style.position = 'absolute';
    document.body.append(ifr);
    ifr.onload = () => {
        if (time) {
            setTimeout(() => {
                document.body.removeChild(ifr);
                callback();
            }, time);
        } else {
            document.body.removeChild(ifr);
            callback();
        }
    };
};

/**
 * 按顺序加载对应的iframe 结束后回调callback
 * @param  {Array}   urls      // url的数组，按顺序加载对应url
 * @param  {Function} callback // 加载完后的回调函数
 * @param  {[type]}   time     // 加载成功后延时多久 后再调回调
 * @return {Function}          // 执行加载iframe函数
 */
const getUrlInIframe = (urls, callback, time) => {
    let length = urls.length,
        step = 0,
        func = () => {
            loadIframe(urls[step], () => {
                step++;
                if (step < length) {
                    func(urls, callback);
                } else {
                    callback && callback();
                }
            }, time);
        };
    return func;
};
/**
 * 是否为数值类型
 * @param  {Number}  number 被判断的数值
 * @return {Boolean}        [description]
 */
const isNumber = (number) => typeof number === 'number' && isFinite(number);

/**
 * 格式化金钱格式
 * @param  {Number} number   // 被转化的数值
 * @param  {Number} places   // 保留几位小数 默认 保留2位
 * @param  {String} symbol   // 最前面用什么标识符 默认 ''
 * @param  {String} thousand // 千位分隔符 默认 ','
 * @param  {String} decimal  // 小数点分隔符 默认 '.'
 * @return {String}          // 数值转化后的字符串
 */
const formatMoney = (number, places, symbol, thousand, decimal) => {
    const isnumber = isNumber(number); // 是否为数值型
    // 不是数值型直接返回空字符串
    if (!isnumber) {
        return '';
    }
    number = number || 0;
    places = !isNaN(places = Math.abs(places)) ? places : 2;
    symbol = symbol !== undefined ? symbol : '';
    thousand = thousand || ',';
    decimal = decimal || '.';
    let negative = number < 0 ? '-' : '',
        i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + '',
        j;
    j = (j = i.length) > 3 ? j % 3 : 0;
    return symbol + negative + (j ? i.substr(0, j) + thousand : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : '');
};

/**
 * 格式化 百分比
 * @param  {Number} number      // 被转化的数值
 * @param  {Number} total       // 总量 默认 1
 * @param  {String} places      // 保留位数  默认 2位
 * @param  {String} symbol      // 后置符号  默认 %
 * @return {String}             // 转化后的字符串
 */
const formatPercent = (number, total, places, symbol) => {
    const isnumber = isNumber(number); // 是否为数值型
    // 不是数值型直接返回空字符串
    if (!isnumber) {
        return '';
    }
    number = number || 0;
    total = total || 1;
    places = places || 2;
    symbol = symbol || '%';
    let precision = 0.1 ** (places + 1),
        times = 100 / total;
    return `${((number * times) + precision).toFixed(places) || ''}${symbol}`;
};

/**
 * 统一获取对象的key 否则返回其值
 * @param {Object|String}
 * @param {String}  取对象的key 默认为 key
 * @returns {String}
 */
export function getObjectKey(value, key = 'key') {
    if (typeof value === 'object') {
        return value[key];
    }
    return value;
}

/**
 * 去左右空格
 * @param  {String} s 待被处理字符串
 * @return {String}   去掉前后空格的字符串
 */
export function trim(s) {
    return s && s.replace(/(^\s*)|(\s*$)/g, '');
}

/**
 * encrypt                    aes加密
 * @param  {string} param     需要加密的数据字符串
 * @return {string}           返回加密后的字符串
 */
export function encrypt(param) {
    let key = CryptoJS.SHA256('kams'),
        iv = CryptoJS.enc.Hex.parse('0000000000000000'),
        encrypted = CryptoJS.AES.encrypt(param, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
    return encrypted.toString();
};
/**
 * decrypt                  aes 解密
 * @param  {string} param   加密后的字符串
 * @return {string}         解密后的字符串
 */
export function decrypt(param) {
    let key = CryptoJS.SHA256('kams'),
        iv = CryptoJS.enc.Hex.parse('0000000000000000'),
        decrypted;
    try {
        decrypted = CryptoJS.AES.decrypt(param.replace(/\n/g, ''), key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }).toString(CryptoJS.enc.Utf8);
    } catch (e) {
        console.error(e);
        decrypted = JSON.stringify({});
    }
    return decrypted;
};

/**
 * 设置缓存 加密存储
 * @param {String} key   存储的key
 * @param {String| Object} value 被存储的值
 */
export function setSessionStorage(key, value) {
    let tempKey = encrypt(JSON.stringify(key));
    sessionStorage.setItem(tempKey, encrypt(JSON.stringify(value)));
}

/**
 * 获取缓存 解密存储
 * @param  {String} key   存储的key
 * @return {String | Object}  取出存储的值
 */
export function getSessionStorage(key) {
    let tempKey = encrypt(JSON.stringify(key)),
        storage = sessionStorage.getItem(tempKey);
    if (storage) {
        storage = JSON.parse(decrypt(storage));
    }
    return storage;
}

/**
 * 设置缓存 加密存储
 * @param {String} key   存储的key
 * @param {String| Object} value 被存储的值
 */
export function setLocalStorage(key, value) {
    let tempKey = encrypt(JSON.stringify(key));
    localStorage.setItem(tempKey, encrypt(JSON.stringify(value)));
}

/**
 * 获取缓存 解密存储
 * @param  {String} key   存储的key
 * @return {String | Object}  取出存储的值
 */
export function getLocalStorage(key) {
    let tempKey = encrypt(JSON.stringify(key)),
        storage = localStorage.getItem(tempKey);
    if (storage) {
        storage = JSON.parse(decrypt(storage));
    }
    return storage;
}

/**
 * 下载类型
 * @param  {String} url   下载url
 * @param  {String} type  下载类型
 * @param  {String} title 下载名称
 */
export function download(url, type, title) {
    if (!url || !type) {
        console.warn('url, type 有传入错误', url, type);
        return;
    }
    let fileTitle = '';
    if (title) {
        fileTitle = title;
    } else {
        fileTitle = url.split('/').pop();
    }
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
    xhr.onload = function(e) {
        if (this.status === 200) {
            var blob = new Blob([this.response], {
                type: type
            });
            let aElement = document.createElement('a');
            document.body.appendChild(aElement);
            let url = window.URL.createObjectURL(blob);
            aElement.href = url;
            aElement.download = fileTitle;
            aElement.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(aElement);
        }
    };
}

/**
 * 生成SKU
 * @param  {Array} skus    规格数组
 * @param  {Object} option 名称代理配置
 * @return {Object}        SKU列表及表头
 */
export function generatorSKU(skus, option) {
    const defaultOption = {
        id: 'id',
        name: 'name',
        children: 'children',
        subId: 'id',
        subValue: 'value'
    };
    let dataSource = [],
        totalCount = skus.reduce((prev, {children}) => {
            const length = children && children.length;
            return prev * length;
        }, 1);
    dataSource = cartesianProduct(skus, dataSource, totalCount, {...defaultOption, option}).prevDatas;
    const firstItem = (dataSource && dataSource[0]) || {};
    return {
        dataSource,
        columns: Object.keys(firstItem).filter((key) => key.includes('spec_title_')).map((key) => ({title: firstItem[key], dataIndex: key}))
    };
};

/**
 * 笛卡尔积计算
 * @param  {Array} specs       未生成SKU的规格数组
 * @param  {Array} prevDatas   之前数据
 * @param  {Number} totalCount SKU总数量
 * @param  {Object} option     名称代理配置
 * @return {Object}            返回结果及剩余规格数组
 */
const cartesianProduct = (specs, prevDatas, totalCount, option) => {
    const {
        id,
        name,
        children,
        subId,
        subValue
    } = option;
    // 定义结果及剩余规格
    let result = [],
        specResult = [];
    if (specs.length >= 1) {
        // 提取第一个规格数组 以及剩余规格数组
        const [beginItem, ...remains] = specs;
        const childrens = beginItem[children] && beginItem[children].filter((child) => child[subId] || child[subValue]);
        if (childrens && childrens.length) {
            if (prevDatas.length) {
                prevDatas.forEach((oldItem) => {
                    childrens.forEach((child) => {
                        result.push({
                            [`spec_title_${beginItem[id]}`]: beginItem[name],
                            [`spec_value_${beginItem[id]}`]: child[subValue],
                            ...oldItem,
                        });
                    });
                });
            } else {
                result = childrens.map((child) => {
                    return {
                        [`spec_title_${beginItem[id]}`]: beginItem[name],
                        [`spec_value_${beginItem[id]}`]: child[subValue],
                    };
                });
            }
            let {
                specs: tempSpecResult,
                prevDatas: tempPrevDatas
            } = cartesianProduct(remains, result, totalCount, option);
            if (tempPrevDatas.length === totalCount) {
                result = tempPrevDatas;
            } else {
                result = [...result, ...tempPrevDatas];
            }
            specResult = [...specResult, ...tempSpecResult];
        }
    }
    return {
        specs: specResult,
        prevDatas: result
    };
};

/**
 * 生成随机码
 */
const getUniqueID = () => {
    return Math.random().toString(36).substring(2);
};

/**
 * 附件大小单位
 * @type {Object}
 */
const fileSizeUnits = {
    0: 'B',
    1: 'KB',
    2: 'MB',
    3: 'GB',
    4: 'TB',
    5: 'PB',
    6: 'EB',
    7: 'ZB',
    8: 'YB',
    9: 'BB',
    10: 'NB',
    11: 'DB',
    12: 'CB'
};

/**
 * 转换文件大小
 * @param  {Number} size      文件的字节大小
 * @param  {Number} [level=0] [description]
 * @return {String}           文件大小
 */
export function getFileSize(size, level = 0) {
    size = Number(size);
    if (isNaN(size)) {
        return 'NAN';
    }
    if (!size) {
        return '0b';
    }
    if (size >= 1024) {
        let lSize = size / 1024;
        return getFileSize(lSize, ++level);
    } else {
        size = size.toFixed(2);
        let floatSize = size.split('.');
        if (floatSize.length > 1) {
            // 格式化后，小数点后边全是0
            if (Number(floatSize[1]) === 0) {
                return `${floatSize[0]}${fileSizeUnits[level]}`;
            }
            // 格式化后，小数点最后一位是0
            if (Number(floatSize[1]) % 10 === 0) {
                return `${floatSize[0]}.${floatSize[1] / 10}${fileSizeUnits[level]}`;
            }
        }
        return `${size}${fileSizeUnits[level]}`;
    }
};

/**
 * 删除子级
 */
export function deleteListChildren(
    dataSource = [],
    { children = 'children' } = {}
) {
    dataSource = dataSource || [];
    return dataSource.map((data) => {
        if (children in data) {
            if (!data[children] || !data[children].length) {
                delete data[children];
            } else {
                data[children] = deleteListChildren(data[children]);
            }
        }
        return data;
    });
}

/**
 * 格式化文本
 * @param {string} string
 * @param {string} type
 */
export const formatString = (string, type) => {
    if (!type) {
        throw new Error('请传入类型');
    }
    switch (type) {
        case TRIM:
            let reg = /(^\s*)|(\s*$)/g;
            return string.replace(reg, '');
        default:
            return string;
    }
};

/**
 * 比较两个值
 * @param {string} condition // 比较符号
 * @param {string | number} rv // 期望值/参考值/被比较值
 * @param {number} value // 比较值
 * @return {boolean}
 */
export const numberCompare = (condition, rv, value) => {
    switch (condition) {
        case '=':
            return value === +rv;
        case '<':
            return value < +rv;
        case '>':
            return value > +rv;
        case '<=':
            return value <= +rv;
        case '>=':
            return value >= +rv;
        case '!=':
            return value !== +rv;
    }
};

/**
 * 数字金额转大写
 * @param {Nmber} num 金额
 */
export const moneyToCapital = (num) => {
    let fuhao = '',
        text = num + '';
    if (text.indexOf('-') > -1) {
        num = text.replace('-', '');
        fuhao = '负';
    }
    let money1 = Number(num),
        monee = Math.round(money1 * 100).toString(10),
        leng = monee.length,
        monval = '';
    for (let i = 0; i < leng; i++) {
        monval = monval + toUpper(monee.charAt(i)) + toMon(leng - i - 1);
    }
    return fuhao + repaceAcc(monval);
};
// 将数字转为大写的中文字
function toUpper(a) {
    switch (a) {
        case '0':
            return '零';
        case '1':
            return '壹';
        case '2':
            return '贰';
        case '3':
            return '叁';
        case '4':
            return '肆';
        case '5':
            return '伍';
        case '6':
            return '陆';
        case '7':
            return '柒';
        case '8':
            return '捌';
        case '9':
            return '玖';
        default:
            return '';
    }
}
function toMon(a) {
    if (a > 10) {
        a = a - 8;
        return (toMon(a));
    }
    switch (a) {
        case 0:
            return '分';
        case 1:
            return '角';
        case 2:
            return '元';
        case 3:
            return '拾';
        case 4:
            return '佰';
        case 5:
            return '仟';
        case 6:
            return '万';
        case 7:
            return '拾';
        case 8:
            return '佰';
        case 9:
            return '仟';
        case 10:
            return '亿';
    }
}
function repaceAcc(Money) {
    Money = Money.replace('零分', '');
    Money = Money.replace('零角', '零');
    let yy,
        outmoney;
    outmoney = Money;
    yy = 0;
    while (true) {
        let lett = outmoney.length;
        outmoney = outmoney.replace('零元', '元');
        outmoney = outmoney.replace('零万', '万');
        outmoney = outmoney.replace('零亿', '亿');
        outmoney = outmoney.replace('零仟', '零');
        outmoney = outmoney.replace('零佰', '零');
        outmoney = outmoney.replace('零零', '零');
        outmoney = outmoney.replace('零拾', '零');
        outmoney = outmoney.replace('亿万', '亿零');
        outmoney = outmoney.replace('万仟', '万零');
        outmoney = outmoney.replace('仟佰', '仟零');
        yy = outmoney.length;
        if (yy === lett) {
            break;
        }
    }
    yy = outmoney.length;
    if (outmoney.charAt(yy - 1) === '零') {
        outmoney = outmoney.substring(0, yy - 1);
    }
    yy = outmoney.length;
    if (outmoney.charAt(yy - 1) === '元') {
        outmoney = outmoney + '整';
    }
    return outmoney;
}

export default {
    loadIframe,
    getUrlInIframe,
    formatMoney,
    formatPercent,
    formatString,
    isNumber,
    getObjectKey,
    trim,
    encrypt,
    decrypt,
    setSessionStorage,
    getSessionStorage,
    download,
    setLocalStorage,
    getLocalStorage,
    generatorSKU,
    getUniqueID,
    getFileSize,
    deleteListChildren,
    numberCompare,
    moneyToCapital
};
