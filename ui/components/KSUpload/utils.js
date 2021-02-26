import { byteLen } from 'ks-utils';
import { getFileSize } from 'ks-cms-utils';
import { Modal } from 'antd';
const { confirm } = Modal;

/**
 * 转化file格式
 * @param  {Object} file // 文件
 * @return {Object}      转化后的文件
 */
export function fileToObject(file) {
    return {
        ...file,
        lastModified: file.lastModified,
        lastModifiedDate: file.lastModifiedDate,
        name: file.name,
        size: file.size,
        type: file.type,
        uid: file.uid,
        percent: 0,
        originFileObj: file
    };
}

/**
 * 生成Progress percent: 0.1 -> 0.98
 * @return {Func} // 增长进度条函数
 */
export function genPercentAdd() {
    let k = 0.1;
    const i = 0.01;
    const end = 0.98;
    return function(s) {
        let start = s;
        if (start >= end) {
            return start;
        }

        start += k;
        k = k - i;
        if (k < 0.001) {
            k = 0.001;
        }
        return start;
    };
}

/**
 * 文件名称字符长度
 * @type {Number}
 */
export const FILE_NAME_BYTE_LENGTH = 128;
/**
 * 默认文件最大为 2GB
 */
export const FILE_DEFAULT_SIZE = 2 * 1024 * 1024 * 1024;
/**
 * 默认文件最大为 100M
 */
export const MEDIA_DEFAULT_SIZE = 100 * 1024 * 1024;
/**
 * 默认图片最大为 1M
 */
export const IMAGE_DEFAULT_SIZE = 1 * 1024 * 1024;
/**
 * 压缩图片限制为 400KB
 */
export const IMAGE_COMPRESS_SIZE = 400 * 1024;
/**
 * 选择框校验类型
 */
export const SELECT_VALIDATE_TYPE = 'select';
/**
 * 上传校验类型
 */
export const UPLOAD_VALIDATE_TYPE = 'upload';
/**
 * 校验类型
 */
export const PASS_ERROR_MSG_TYPE = 'noErrMsg';
/**
 * 默认公共文件校验
 * @type {Array}
 */
export const COMMON_VALIDATORS = [
    {
        validator: (file) => {
            let { name, fileName } = file;
            name = name || fileName;
            if (name.includes('.')) {
                let splits = name.split('.');
                name = splits.slice(0, splits.length - 1).join('');
            }
            return byteLen(name) < FILE_NAME_BYTE_LENGTH;
        },
        message: '文件名称过长, 请变更文件名称'
    },
];

/**
 * 默认上传文件校验
 * @type {Array}
 */
export const UPLOAD_VALIDATORS = [
    {
        validator: async(file, props) => {
            const { forceFileSize } = props;
            const fileType = file.type.split('/').shift();
            const size = getMaxFileSize(file, props);
            const s = file.size || file.fileSize;
            const checkSize = forceFileSize || MEDIA_DEFAULT_SIZE;
            if (['video', 'audio'].includes(fileType) && s > checkSize) {
                return new Promise((resolve) => {
                    confirm({
                        content: '系统检测到该文件过大，建议在文件系统中上传(自动压缩)，是否继续此操作?',
                        onOk: () => {
                            resolve(true);
                        },
                        onCancel: () => {
                            resolve(PASS_ERROR_MSG_TYPE);
                        }
                    });
                });
            } else {
                return s ? (s / size) < 1 : true;
            }
        },
        message: (file, props) => {
            const size = getMaxFileSize(file, props);
            return `文件不可超出${getFileSize(size)}`;
        }
    }
];

/**
 * 获取文件最大大小限制
 * @param {File} file
 * @param {Object} props
 */
const getMaxFileSize = (file, props) => {
    const fileType = file.type.split('/').shift();
    const { fileSize, forceFileSize } = props;
    let defaultSize = FILE_DEFAULT_SIZE;
    switch (fileType) {
        case 'image':
            defaultSize = IMAGE_DEFAULT_SIZE;
            break;
    }
    if (forceFileSize) {
        return forceFileSize;
    }
    return (fileSize && fileSize < defaultSize) ? fileSize : defaultSize;
};

/**
 * 根据类型获取增加不同校验
 * @param {string} type
 */
const getDefaultValidators = (type) => {
    let result = [...COMMON_VALIDATORS];
    switch (type) {
        case UPLOAD_VALIDATE_TYPE:
            result = [
                ...result,
                ...UPLOAD_VALIDATORS
            ];
    }
    return result;
};

/**
 * 过滤文件(根据筛选条件过滤文件)
 * @type {Object}
 */
export const filterFile = async(file, validators = [], type, props) => {
    const mergeValidators = [...getDefaultValidators(props.rateImgSize ? type : ''), ...validators];
    let isPass = true;
    for (let { validator, message: tempMsg } of mergeValidators) {
        let message = tempMsg;
        /* message 支持 function类型 */
        if (typeof tempMsg === 'function') {
            message = tempMsg(file, props);
        }
        const result = await validator(file, props);
        /* 同步事件 */
        if (result === false || result === PASS_ERROR_MSG_TYPE) {
            return {
                isPass: result,
                message
            };
        } else if (typeof result === 'object' && 'then' in result) {
            // 如果click是个异步事件
            const rst = await result.then();
            if (rst === false || result === PASS_ERROR_MSG_TYPE) {
                return {
                    isPass: rst,
                    message
                };
            }
        }
    }
    return {
        isPass
    };
};
