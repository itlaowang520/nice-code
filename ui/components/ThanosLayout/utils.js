import pathToRegexp from 'path-to-regexp';

/* 根据pathname匹配菜单信息 */
export const matchMenuInfo = (routeData, pathname) => {
    const matchKey = Object.keys(routeData).find((key) => pathToRegexp(key).test(pathname));
    return routeData[matchKey] || {};
};
/* 获取个性化配置 */
export const getPersonConfig = () => {
    const getPersonConfig = localStorage.getItem('personConfig');
    return getPersonConfig ? JSON.parse(getPersonConfig) : {};
};
/* 设置个性化配置 */
export const setPersonConfig = (config) => localStorage.setItem('personConfig', JSON.stringify(config));
