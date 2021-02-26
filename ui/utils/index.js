import { Request } from 'ks-cms-utils';
import { notification } from 'antd';
import { audioIcon, pdfIcon, videoIcon, fileIcon } from './constants';

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
 * 检查返回值状态码
 *
 * @param {response||response.json()} 状态码和返回code的双重判断
 * @return {response||error}
 */
function checkStatus(response) {
    /**
     * status 可能是状态码 可能是返回code
     * @type {number}
     */
    let status = response.status || response.code;
    if ((status >= 200 && status < 300) || status === 0) {
        return response;
    }
    const errortext = response.statusText || response.msg;
    if (status !== 401) {
        notification.error({
            message: `请求错误 ${status}`, // : ${response.url}
            description: errortext,
        });
    }
    const error = new Error(errortext);
    error.name = status;
    error.response = response;
    throw error;
}

export function request(url, option) {
    return Request(url, option)
        .then(checkStatus)
        .then((response) => response.json())
        .then(checkStatus);
}

/**
 * fileInfo[showKeys.thumbUrl]
 * @param  {[type]} url [description]
 * @return {[type]}     [description]
 */
export function getUrl(url) {
    if (!url) return '';
    if (url.startsWith('blob:') || url.startsWith('data:')) return url;
    let urlSuffix = url.split('.').pop().toLowerCase();
    if (['mp3', 'wav', 'ape', 'flac'].includes(urlSuffix)) {
        // 音频
        return audioIcon;
    } else if (['pdf'].includes(urlSuffix)) {
        return pdfIcon;
    } else if (['mp4', '3gp', 'flv', 'avi'].includes(urlSuffix)) {
        // 视频
        return videoIcon;
    } else if (['png', 'jpg', 'jpeg', 'gif', 'svga'].includes(urlSuffix)) {
        // 图片
        return url;
    } else {
        // other attachment
        return fileIcon;
    }
}

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
}
// 生成随机码
export const getUniqueID = () => {
    return Math.random().toString(36).substring(2);
};
