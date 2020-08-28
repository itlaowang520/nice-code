import { checkPass } from '../Router';

/**
 * 邮箱
 * @param {*} s
 */
export function isEmail(rule, value, callback) {
    if (!value) {
        callback();
    }
    if (/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(value)) { // eslint-disable-line
        callback();
    } else {
        callback(rule.message);
    }
}

/**
 * 手机号码
 * @param {*} s
 */
export function isMobile(rule, value, callback) {
    if (!value) {
        callback();
    }
    if (/^(1[3456789]\d{9})$/.test(value)) {
        callback();
    } else {
        callback(rule.message);
    }
}

/**
 * 电话号码
 * @param {*} s
 */
export function isPhone(rule, value, callback) {
    if (!value) {
        callback();
    }
    if (/^([0-9]{3,4}-)?[0-9]{7,8}$/.test(value)) {
        callback();
    } else {
        callback(rule.message);
    }
}

/**
 * URL地址
 * @param {*} s
 */
/* eslint-disable*/
export function isURL(rule, value, callback) {
    if (!value) {
        callback();
    }
    const reg = new RegExp('[a-zA-z]+://[^\s]*');
    if (reg.test(value)) {
        callback();
    } else {
        callback(rule.message);
    }
}


/**
 * 密码复杂度校验
 * @param {*} s
 */
export function pwdCheck(rule, value, callback) {
    if (!value || value === '') {
        callback();
    }
    value = checkPass(value);
    if (value > 1) {
        callback();
    } else {
        callback(rule.message);
    }
}

/**
 * 附件上传校验
 */
export function uploadingCheck(rules, values, callback) {
    if (!values) {
        callback();
    }
    if (values && Array.isArray(values) && values.some((value) => value.status === 'uploading')) {
        callback(rules.message);
    } else {
        callback();
    }
}

/**
 * 附件上传失败校验
 */
export function uploadErrorCheck(rules, values, callback) {
    if (!values) {
        callback();
    }
    if (values && Array.isArray(values) && values.some((value) => value.status === 'error')) {
        callback(rules.message);
    } else {
        callback();
    }
}

/**
 * 校验非负整数
 */
export function nonnegativeInterger(rule, value, callback) {
    if (!value) {
        callback()
    }
    let reg = /(^[1-9]+\d*$)|(^0$)/;
    if (!reg.test(value)) {
        callback(rule.message);
    } else {
        callback();
    }
}

/**
 * 检查价格
 * @param  {[type]}   rules    [description]
 * @param  {[type]}   value    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
export function checkPrice(rules, value, callback) {
    let priceReg = /^(\d+|\d+\.\d{1,2})$/;
    if (!value) {
        callback();
        return;
    }
    if (priceReg.test(value)) {
        callback();
    } else {
        callback(rules.message);
    }
};

export default {
    isEmail,
    isMobile,
    isPhone,
    isURL,
    pwdCheck,
    uploadingCheck,
    uploadErrorCheck,
    nonnegativeInterger,
    checkPrice
};
