import { numtwo } from 'ks-utils';

export function mask(params) {
    var mask = document.querySelector('#mask');

    if (!params) {
        mask.style.display = 'none';
        return;
    }

    const { selector, desc } = params;

    /** **************   获取要cover的元素基本信息   ****************/
    const ele = document.querySelector(selector);
    const offsetWidth = ele.offsetWidth;
    const offsetHeight = ele.offsetHeight;
    const offsetLeft = getElementPosition(ele, 'offsetLeft', undefined);
    const offsetTop = getElementPosition(ele, 'offsetTop', undefined);

    /** **************   获取屏幕大小，包含滚动区域   ****************/
    const scrollWidth = document.body.scrollWidth;
    const scrollHeight = document.body.scrollHeight;

    /** **************   为Mask设置css   ****************/
    mask.style.display = 'block';
    mask.style.width = scrollWidth + 'px';
    mask.style.height = scrollHeight + 'px';
    mask.style.borderLeftWidth = offsetLeft + 'px';
    mask.style.borderRightWidth = (scrollWidth - offsetWidth - offsetLeft) + 'px';
    mask.style.borderTopWidth = offsetTop + 'px';
    mask.style.borderBottomWidth = (scrollHeight - offsetHeight - offsetTop) + 'px';

    /** **************** 动态设置位置 ****************************/
    const tipEle = document.querySelector('.guide-mask-tip');
    if (scrollWidth - offsetWidth - offsetLeft < 200) {
        tipEle.style.left = '-60px';
    } else {
        tipEle.style.left = '60px';
    }
    tipEle.style.top = '75px';

    // if (scrollHeight - offsetHeight - offsetTop < 200) {
    //     tipEle.style.top = '-75px';
    // } else {
    //     tipEle.style.top = '75px';
    // }

    /** **************   为Mask设置desc   ****************/
    const maskDesc = document.querySelector('#mask-desc');
    maskDesc.innerHTML = desc;
};

/**
 * 获取元素到达视窗顶部的距离
 * @param  {Object} element 传入的dom元素
 * @return {Number}         计算后的高度
 */
export function getElementPosition(element, attr = 'offsetLeft', parent = 'BODY') {
    let actualTop = element[attr],
        current = element.offsetParent;
    while (current !== null) {
        actualTop += current[attr];
        if (current && (current.tagName === parent || current.className.includes(parent))) {
            break;
        } else {
            current = current.offsetParent;
        }
    }
    return actualTop;
}

/**
 * 转换版本号
 * @param {string} version //
 */
export function versionTransform(version) {
    if (typeof version !== 'string') {
        return version;
    }
    let arr = version.split('.');
    if (arr.length < 3) {
        arr.push('0');
    }
    arr = arr.map((item) => numtwo(item));
    return Number(arr.join('')) || 0;
}
