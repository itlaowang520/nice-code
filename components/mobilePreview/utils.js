import Data from './data';
// 改变手机尺寸
export const reSizeRem = (modelWidth = 320) => {
    // let documentElement = document.documentElement;
    // documentElement.style.fontSize = 8.533 * (modelWidth / 320) + 'px';
    let documentElement = document.documentElement,
        resizeEvent = 'orientationchange' in window
            ? 'orientationchange'
            : 'resize';
    const resizeHandle = () => {
        const clientWidth = documentElement.clientWidth;
        if (!clientWidth) {
            return;
        }
        if (modelWidth >= 320 && modelWidth <= 375) {
            documentElement.style.fontSize = 8.533 * (modelWidth / 320) + 'px';
        } else {
            documentElement.style.fontSize = 10 * (modelWidth / 375) + 'px';
        }
    };

    if (!document.addEventListener) {
        return Promise.resolve();
    }

    window.addEventListener(resizeEvent, resizeHandle, false);
    document.addEventListener('DOMContentLoaded', resizeHandle, false);
    resizeHandle();
};

// /**
//  * initRem 初始化rem标准
//  * @return {Promise<*>}
//  */
// const initRem = () => {
//     return Promise.resolve();
// };

/**
 * 初始化固定rem
 */
export const initEnsureRem = (width = 320) => {
    let model = localStorage.getItem('ks-ui-doc-phone-model') || 'iphone6', // 手机型号
        scaling = localStorage.getItem('ks-ui-doc-phone-scaling') || '80%';// 缩放比例
    reSizeRem(Data[model][scaling].smallWidth);
};
