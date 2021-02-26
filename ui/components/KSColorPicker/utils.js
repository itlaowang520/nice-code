export const findParent = (className, element) => {
    // const classNames = (element.className || '').split(' ');
    const classNames = (typeof element.className !== 'string' ? '' : element.className).split(' ');
    let result = classNames.some((name) => className === name);
    if (!result && element.parentElement && element.parentElement !== document.body) {
        result = findParent(className, element.parentElement);
    }
    return result;
};
