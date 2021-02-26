export const findFormNode = (ref) => {
    if (!ref) {
        return false;
    } else {
        if (ref.nodeName === 'FORM' && ref.className.includes('ant-form')) {
            return true;
        } else if (ref.nodeName === 'MAIN' && ref.className.includes('layoutContent')) {
            return false;
        } else {
            return findFormNode(ref.parentElement);
        }
    }
};
