
/* 格式化图片转化 webp */
export const formatImageUrl = (url) => {
    let result = `${url}?x-oss-process=image/resize,w_${300}`;
    if (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)) {
        /* safari */
        return result;
    } else {
        return `${result}/format,webp`;
    }
};
