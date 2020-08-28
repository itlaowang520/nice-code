import pathToRegexp from 'path-to-regexp';
import { parse, stringify } from 'qs';
import Plugins from '../Plugins';
const { InitModelPlugin } = Plugins;
let routerDataCache,
    defaltRouterConfigCache,
    getModelsCache,
    renderCache,
    dynamicCache,
    createElementCache,
    hashHistory;
const [FOLDER_TYPE, MENU_TYPE, RESOURCE_TYPE] = [0, 1, 2];
/**
* 查看dva中是否注册过该modal
*
* @param {object} app // dva的实例
* @param {object} modal // 包含namespace属性的 待注册modal
* @return {array}
*/
function modelNotExisted(app, model) {
    return !app._models.some(({ namespace }) => {
        return namespace === model.substring(model.lastIndexOf('/') + 1);
    });
}

/**
* 异步加载组件
*
* @param {object} app // dva的实例
* @param {array} models // 待注册modal的集合
* @param {func} component // 导入对应component的函数
* @param {func} dynamic // dva提供的异步加载方法，此项目中不引入dva，所以需要外部传入
* @param {func} createElement // React的创建组件的方法，此项目中不引入react，需要外部传入
* @return {object} 异步加载的组件
*/
function dynamicWrapper(app, models, component, dynamic, createElement) {
    return dynamic({
        app,
        models: () =>
            models.filter((model) =>
                modelNotExisted(app, model.namespace)
            ).map((model) => model.model()),
        // add routerData prop
        component: () => {
            if (!routerDataCache) {
                routerDataCache = getRouterData({app});
            }
            return component().then((raw) => {
                const Component = raw.default || raw;
                return (props) =>
                    createElement(Component, {
                        ...props,
                        routerData: routerDataCache,
                    });
            });
        },
    });
}

/**
* 把带有children、path的属性树形结构数组展开成一个key为它的path、值为其自身的健值对
*
* @param {array} menus // 待展开的树形结构数组
* @return {object} 展开后的对象
*/
function getFlatMenuData(menus) {
    let keys = {};
    menus.forEach((item) => {
        if (item.children) {
            keys[item.path] = { ...item };
            keys = { ...keys, ...getFlatMenuData(item.children) };
        } else {
            keys[item.path] = { ...item };
        }
    });
    return keys;
}

/**
* 根据前端路由加载对应组件
*
* @param {object} app // dva的实例
* @param {array} menuList // 待加载组件的树形结构数组
* @param {array} defaltRouterConfig // 默认路由
* @param {func} getModels // 对应组件注册对应model的方法，在各个项目中自己定义。
* @param {func} render // 定义引入组件路径的方法，个项目自己定义
* @param {func} dynamic // dva提供的异步加载方法，此项目中不引入dva，所以需要外部传入
* @param {func} createElement // React的创建组件的方法，此项目中不引入react，需要外部传入
* @return {object} 以路径为key 组件为值的对象
*/
function getRouterData({app, menuList, defaltRouterConfig, getModels, render, dynamic, createElement}) {
    const routerConfig = {};
    defaltRouterConfigCache = defaltRouterConfig = defaltRouterConfig || defaltRouterConfigCache || [];
    getModelsCache = getModels = getModels || getModelsCache;
    renderCache = render = render || renderCache;
    dynamicCache = dynamic = dynamic || dynamicCache;
    createElementCache = createElement = createElement || createElementCache;
    defaltRouterConfig.forEach((config) => {
        routerConfig[config['path']] = {
            component: dynamicWrapper(app, (config['models'] || []), config['component'], dynamic, createElement)
        };
    });

    const menuData = getFlatMenuData(menuList || []);
    if (menuData) {
        Object.keys(menuData).forEach((menu) => {
            // 带参数路由兼容
            let moduleUrl;
            routerConfig[menu] = {};
            if (menuData[menu]['type'] === RESOURCE_TYPE) {
                let tempMenu = menu.split('/:')[0],
                    pathArr = tempMenu.split('/').map((str) => str ? str.substring(0, 1).toUpperCase() + str.substring(1) : '').slice(1),
                    lastPath = pathArr.pop();
                pathArr.push(lastPath);
                moduleUrl = pathArr.join('/');
            } else if (menuData[menu]['type'] === MENU_TYPE) {
                let pathArr = menu.split('/').map((str) => str ? str.substring(0, 1).toUpperCase() + str.substring(1) : '').slice(1),
                    lastPath = pathArr.pop();
                pathArr.push(lastPath);
                pathArr.push(lastPath);
                moduleUrl = pathArr.join('/');
            }
            routerConfig[menu]['component'] = dynamicWrapper(app, getModels(menu), () => render(moduleUrl), dynamic, createElement);
        });
    }
    return routerConfig;
}

/**
* 根据前端路由加载对应组件
*
* @param {array} menuList // 待加载组件的树形结构数组
* @param {func} getModels // 对应组件注册对应model的方法，在各个项目中自己定义。
* @param {func} render // 定义引入组件路径的方法，个项目自己定义
* @param {func} dynamic // dva提供的异步加载方法，此项目中不引入dva，所以需要外部传入
* @return {object} 以路径为key 组件为值的对象
*/
function getThanosRouter({ menuList, getModels, render, dynamic }) {
    const routerConfig = {};
    getModelsCache = getModels = getModels || getModelsCache;
    renderCache = render = render || renderCache;
    dynamicCache = dynamic = dynamic || dynamicCache;
    const menuData = getFlatMenuData(menuList || []);
    if (menuData) {
        Object.keys(menuData).forEach((menu) => {
            const config = preReplaceReducerHandle(getModels(menu)); // 路由对应获取配置
            // 带参数路由兼容
            let moduleUrl,
                lastPath,
                componentConfig;
            /* 没有component 则认为需要帮助自动解析模块， 进行开始路径匹配 */
            if (!config.component) {
                routerConfig[menu] = {};
                if (menuData[menu]['type'] === RESOURCE_TYPE) {
                // let tempMenu = menu.split('/:')[0],
                    let tempMenuDatas = menu.split('/').filter((path) => !path.startsWith(':')),
                        pathArr = tempMenuDatas.map((str) => str ? str.substring(0, 1).toUpperCase() + str.substring(1) : '').slice(1);
                    lastPath = pathArr.pop();
                    pathArr.push(lastPath);
                    moduleUrl = pathArr.join('/');
                } else if (menuData[menu]['type'] === MENU_TYPE) {
                    let pathArr = menu.split('/').map((str) => str ? str.substring(0, 1).toUpperCase() + str.substring(1) : '').slice(1);
                    lastPath = pathArr.pop();
                    // pathArr.push(lastPath);
                    pathArr.push(lastPath);
                    moduleUrl = pathArr.join('/');
                }
            }

            if (config.component) {
                /* 如果有component配置 则组件和redux的list都取配置中的 */
                componentConfig = config;
            } else if (moduleUrl) {
                /* 如果没有component配置 则用之前moduleUrl的路径， getModels里的配置就全是redux的list */
                componentConfig = {
                    component: () => {
                        return new Promise((resolve) => {
                            let errors = [],
                                compoents = [
                                    () => render(moduleUrl),
                                    () => render(moduleUrl + '/' + lastPath)
                                ];
                            for (let i = 0; i < 2; i++) {
                                let importComponent = compoents[i];
                                importComponent().then(resolve).catch((err) => {
                                    if (err.toString().includes('Error: Cannot find module')) {
                                        errors.push(err);
                                    } else {
                                        throw new Error(err);
                                    }
                                    if (errors.length > 1) {
                                        throw new Error(`${moduleUrl}/index.js`);
                                    }
                                });
                            }
                        });
                    },
                    modelList: config
                };
            }
            /* 如果没有componentConfig配置 就没有模块和redux的加载 */
            if (componentConfig) {
                routerConfig[menu] = routerConfig[menu] || {};
                routerConfig[menu] = {
                    ...routerConfig[menu],
                    menu: menuData[menu],
                    component: dynamic({
                        ...componentConfig,
                        modelList: componentConfig.modelList.map((modelConfig) => {
                            if (typeof modelConfig === 'object' && 'model' in modelConfig) {
                                return modelConfig.model;
                            } else {
                                return modelConfig;
                            }
                        })
                    })
                };
            }
        });
    }
    return routerConfig;
}

/**
 * 将url解析成数组 /system/user => ['/system', '/system/user']
 * @PropTypes { string } url 待被解析的字符串
 * @return { array } // 解析后的数组
 */
export function urlToList(url) {
    const urllist = url.split('/').filter((i) => i);
    return urllist.map((urlItem, index) => {
        return `/${urllist.slice(0, index + 1).join('/')}`;
    });
}

/**
 * Get router routing configuration
 * { path:{name,...param}}=>Array<{name,path ...param}>
 * @param {string} path
 * @param {routerData} routerData
 */
export function getRoutes(path, routerData) {
    let routes = Object.keys(routerData).filter(
        (routePath) => routePath.indexOf(path) === 0 && routePath !== path
    );
    // Replace path to '' eg. path='user' /user/name => name
    routes = routes.map((item) => item.replace(path, ''));
    // Get the route to be rendered to remove the deep rendering
    const renderArr = getRenderArr(routes);
    // Conversion and stitching parameters
    const renderRoutes = renderArr.map((item) => {
        // const exact = !routes.some((route) => route !== item && getRelation(route, item) === 1);
        return {
            exact: true,
            ...routerData[`${path}${item}`],
            key: `${path}${item}`,
            path: `${path}${item}`,
        };
    });
    return renderRoutes;
}

function getRenderArr(routes) {
    let renderArr = [];
    renderArr.push(routes[0]);
    for (let i = 1; i < routes.length; i += 1) {
        // let isAdd = false;
        // 是否包含
        // isAdd = renderArr.every((item) => getRelation(item, routes[i]) === 3);
        // 去重
        renderArr = renderArr.filter((item) => getRelation(item, routes[i]) !== 1);
        // if (isAdd) {
        renderArr.push(routes[i]);
        // }
    }
    return renderArr;
}

function getRelation(str1, str2) {
    if (str1 === str2) {
        console.warn('Two path are equal!'); // eslint-disable-line
    }
    const arr1 = str1.split('/');
    const arr2 = str2.split('/');
    if (arr2.every((item, index) => item === arr1[index])) {
        return 1;
    } else if (arr1.every((item, index) => item === arr2[index])) {
        return 2;
    }
    return 3;
}

/**
 * 完全对比两个对象
 *
 * @param {object} o1 被替换的key
 * @param {object} o2 替换的key
 * @return {boolean}
 */
/* eslint-disable*/
export function compareObject(a, b, aStack, bStack) {
    var toString = Object.prototype.toString;

    function isFunction(obj) {
        return toString.call(obj) === '[object Function]';
    };

    function deepEq(a, b, aStack, bStack) {
        // a 和 b 的内部属性 [[class]] 相同时 返回 true
        var className = toString.call(a);
        if (className !== toString.call(b)) return false;

        switch (className) {
            case '[object RegExp]':
            case '[object String]':
                return '' + a === '' + b;
            case '[object Number]':
                if (+a !== +a) return +b !== +b;
                return +a === 0 ? 1 / +a === 1 / b : +a === +b;
            case '[object Date]':
            case '[object Boolean]':
                return +a === +b;
        }

        let areArrays = className === '[object Array]';
        // 不是数组
        if (!areArrays) {
            // 过滤掉两个函数的情况
            if (typeof a !== 'object' || typeof b !== 'object') return false;

            let aCtor = a.constructor,
                bCtor = b.constructor;
            // aCtor 和 bCtor 必须都存在并且都不是 Object 构造函数的情况下，aCtor 不等于 bCtor， 那这两个对象就真的不相等啦
            if (aCtor !== bCtor && !(isFunction(aCtor) && aCtor instanceof aCtor && isFunction(bCtor) && bCtor instanceof bCtor) && ('constructor' in a && 'constructor' in b)) {
                return false;
            }
        }

        aStack = aStack || [];
        bStack = bStack || [];
        let length = aStack.length;

        // 检查是否有循环引用的部分
        while (length--) {
            if (aStack[length] === a) {
                return bStack[length] === b;
            }
        }

        aStack.push(a);
        bStack.push(b);

        // 数组判断
        if (areArrays) {
            length = a.length;
            if (length !== b.length) return false;
            while (length--) {
                if (!compareObject(a[length], b[length], aStack, bStack)) return false;
            }
        } else {
            let keys = Object.keys(a),
                key;
            length = keys.length;

            if (Object.keys(b).length !== length) return false;
            while (length--) {
                key = keys[length];
                if (!(b.hasOwnProperty(key) && compareObject(a[key], b[key], aStack, bStack))) return false;
            }
        }

        aStack.pop();
        bStack.pop();
        return true;
    }

    // === 结果为 true 的区别出 +0 和 -0
    if (a === b) return a !== 0 || 1 / a === 1 / b;

    // typeof null 的结果为 object ，这里做判断，是为了让有 null 的情况尽早退出函数
    if (a === null || b === null) return false;

    // 判断 NaN
    if (a !== a) return b !== b;

    // 判断参数 a 类型，如果是基本类型，在这里可以直接返回 false
    let type = typeof a;
    if (type !== 'function' && type !== 'object' && typeof b !== 'object') return false;

    // 更复杂的对象使用 deepEq 函数进行深度比较
    return deepEq(a, b, aStack, bStack);
}

// 将数组 看是否完全一样
export function compareMenuData(MenuData, menuDataCache) {
    if (MenuData.length === menuDataCache.length) {
        return MenuData.every((menu, index) => compareObject(menu, menuDataCache[index]));
    } else {
        return false;
    }
}


/**
 * 根据菜单取得重定向地址.
 */
export function getRedirect(item, children = 'children', path = 'path') {
    let redirectData = [];
    if (item && item.length) {
        item.forEach((subItem) => {
            if (subItem && subItem.children && subItem.children.length && subItem.type < MENU_TYPE) {
                if (subItem.children[0] && subItem.children[0].path) {
                    redirectData.push({
                        from: '' + subItem.path,
                        to: '' + subItem.children[0].path,
                        fromType: subItem.type,
                        toType: subItem.children[0].type
                    });
                    let temp = getRedirect(subItem.children);
                    redirectData = [...redirectData, ...temp];
                }
            } else {
                redirectData.push({
                    from: '/',
                    to: `${subItem.path}`
                });
            }
        });
    }
    redirectData = redirectData.filter((item) => !(item.toType === FOLDER_TYPE))
    return redirectData;
};

/**
* 把带有children、path的属性树形结构数组重新整理path路径。
*
* @param {array} data // 待整理的树形结构数组
* @param {string} parentPath // 父级路径
* @return {array} 整理后的数组
*/
export function formatterUrl(data, parentPath = '/') {
    return data.map((item) => {
        let { path } = item;
        if (!isUrl(path)) {
            path = path ? item.path : '';
        }
        const result = {
            ...item,
            name: item.name,
            path: path === '' ? `${parentPath}${item.id}_${item.name}` : path.indexOf('/') === 0 ? path : `${parentPath}${path}`
        };
        if (item.children) {
            result.children = formatterUrl(item.children, `${result.path || ''}/`);
        }
        return result;
    });
}

/**
 * 是否匹配为URL
 *
 * @param {string}  校验的string
 * @return {boolean} 是否匹配为URL
 */

/* eslint no-useless-escape:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/g;
export function isUrl(path) {
    return reg.test(path);
}

/**
* 获取当前title， 根据当前路径配不同的title
*
* @param {object} routerData // 所有路由的map集合
* @param {object} location // window的location对象，包含uri信息
* @return {string} 整理后的title
*/
export function getPageTitle(routerData, location, title = '') {
    const { pathname, hostname } = window.location;
    let currRouterData = null;
    // match params path
    Object.keys(routerData).forEach((key) => {
        if (pathToRegexp(key).test(pathname)) {
            currRouterData = routerData[key];
        }
    });
    if (currRouterData && currRouterData.name) {
        title = `${currRouterData.name} - ${title}`;
    }
    let prefix = '';
    switch (hostname) {
        case 'kms.kaishustory.com':
        case 'pop.kaishustory.com':
            break;
        case 'g.kms.kaishustory.com':
        case 'g.pop.kaishustory.com':
            prefix = 'gamma-';
            break;
        case 't.kms.kaishustory.com':
        case 't.pop.kaishustory.com':
            prefix = '测试-';
            break;
        default:
            prefix = '开发-';
            break;
    }
    return `${prefix}${title}`;
}

/**
 * 数组转化 树形数组
 *
 * @typedef {Object} attrParams
 * @property {number} rootId Top parentId
 * @property {string} id 当前Id
 * @property {string} parentId 父级Id
 *
 * @param {Array} 转化的数组
 * @type {attrParams}
 * @return {Array}  返回树形数组
 */
export function toTreeData(data, attributes) {
    let resData = [...data], tree = [];
    function run(chiArr) {
        if (resData.length !== 0) {
            for (let i = 0; i < chiArr.length; i++) {
                for (let j = 0; j < resData.length; j++) {
                    if (chiArr[i][attributes.id] === resData[j][attributes.parentId]) {
                        chiArr[i]['children'] = chiArr[i]['children'] || [];
                        chiArr[i].children.push(resData[j]);
                        resData.splice(j, 1);
                        j--;
                    }
                }
                if (chiArr[i].children) {
                    run(chiArr[i].children);
                }
            }
        }
    }

    for (let i = 0; i < resData.length; i++) {
        if (resData[i][attributes.parentId] === attributes.rootId) {
            tree.push(resData[i]);
            resData.splice(i, 1);
            i--;
        } else if (data.every((res) => res[attributes.id] !== resData[i][attributes.parentId])) {
            tree.push(resData[i]);
            resData.splice(i, 1);
            i--;
        }
    }
    run(tree);
    return tree;
}

/**
 * 找出 全选 半选节点
 *
 * @typedef {Object} attrParams
 * @property {string} id 当前Id
 * @property {string} parentId 父级Id
 *
 * @typedef {Object} arrParams
 * @property {Array} checkedKeys 全选节点
 * @property {Array} halfCheckedKeys 半选节点
 *
 * @param {Array} list 全选半选 所有节点
 * @param {Array} treeList 树形数组
 * @type {attrParams}
 * @return {arrParams}
 */
export function findCheck(list, treeList, attributes) {
    list = list.map((id) => '' + id);
    let checkedKeys = [], halfCheckedKeys = [];
    treeList.forEach((node) => {
        // 先看当前节点有没有在数组里
        if (list.includes('' + node[attributes['id']])) {
            // 如果有children 遍历子节点   否则没有 加入checkKeys
            if (node['children'] && node['children'].length > 0) {
                let allChildrenCheck = node['children'].every((child) => list.includes(child[attributes['id']]));
                if (allChildrenCheck) {
                    checkedKeys.push(node[attributes['id']]);
                } else {
                    halfCheckedKeys.push(node[attributes['id']]);
                }
                let temp = findCheck(list, node['children'], attributes);
                checkedKeys = [...checkedKeys, ...temp.checkedKeys];
                halfCheckedKeys = [...halfCheckedKeys, ...temp.halfCheckedKeys];
            } else {
                checkedKeys.push(node[attributes['id']]);
            }
        }
    });
    return { checkedKeys, halfCheckedKeys };
}

/**
 * 树结构替换Key
 *
 * @param {Array} datalist 树结构
 * @param {string} oldKey 被替换的key
 * @param {string} newKey 替换的key
 * @param {string} children 子级对应的key
 * @return {Array}
 */
export function replaceKey(datalist, oldKey, newKey, children = 'children') {
    let placeList = [...datalist];
    placeList.forEach((data) => {
        if (data[children]) {
            data[children] = replaceKey(data[children], oldKey, newKey, children);
        }
        let keys = Object.keys(data);
        if (keys.includes(oldKey)) {
            data[newKey] = data[oldKey];
            delete data[oldKey];
        }
    });
    return placeList;
}

/**
* 密码校验复杂强度
*
* @param {string} txt
* @return {number} level  0 不通过、 1 底、 2 中、 3 高
*/
export function checkPass(txt) {
    if (!txt || !txt.length) {
        return 0;
    }
    if (txt.length < 6) {
        return 0;
    }
    var level = 0;
    if (txt.match(/([a-z])+/)) {
        level++;
    }
    if (txt.match(/([0-9])+/)) {
        level++;
    }
    if (txt.match(/([A-Z])+/)) {
        level++;
    }
    if (txt.match(/[^a-zA-Z0-9]+/)) {
        level++;
    }
    level = level === 4 ? 3 : level;
    return level
}

/**
* 过滤菜单 把type为2 或者type不为2且有path的resource保存下来
*
* @param {array} array
* @return {array}
*/
export function filterMenu(array) {
    return array.filter((item) => {
        if (item.children) {
            item.children = filterMenu(item.children);
        }
        if (item.type !== 2) {
            return true;
        } else if (item.type === 2 && item.path) {
            item.hideInMenu = true;
            return true;
        }
        return false;
    });
}

/**
* 获取树形结构所有节点的所需的属性整合到一个数组中
*
* @param {array} array // 待被解析的树形数组
* @param {string} children // 子节点的字段 默认为children
* @param {string} code // 获取属性字典 默认为code
* @return {Array}
*/
export function getCodes(array, children = 'children', code = 'code') {
    return array.reduce((pre, item) => {
        pre.push(item[code]);
        if (item[children]) {
            pre = [...pre, ...getCodes(item[children], children, code)];
        }
        return pre;
    }, []).filter((code) => code);
}

/**
* Convert pathname to openKeys
* /list/search/articles = > ['list','/list/search']
* @param  props
*/
export function getParentUrl(childrens, urls, parent) {
    let tempurls = [];
    childrens.forEach((child) => {
        if (urls.includes(child.path)) {
            if (parent) {
                tempurls.push(parent.path);
            }
            tempurls.push(child.path);
        }
        if (child.children) {
            let childurls = getParentUrl(child.children, urls, child);
            tempurls = [
                ...tempurls,
                ...childurls
            ];
        }
    });
    return tempurls;
}

/**
 * 树形数组排序
 * @param  {Array} dataSource 树形数组
 * @param  {Params} config    参数
 * @return {Array}            排序后的数组
 *
 * @typedef {Object} config
 * @param  {String} children  子集字段  默认 children
 * @param  {String} sort      排序字段  默认 sort
 */
export function sortTreeData(dataSource, config) {
    let children = (config && config['children']) || 'children',
        sort = (config && config['sort']) || 'sort';
    dataSource.forEach((data) => {
        if (data[children]) {
            data[children] = sortTreeData(data[children], {children, sort});
        }
    });
    dataSource.sort((a, b) => a[sort] - b[sort]);
    return dataSource;
}

/**
 * 插件注册方法
 * @param  {Object | Array} plugins 待注入的插件
 * @param  {Object} params 注册的属性
 */
export function register(plugin, params) {
    if (Array.isArray(plugin)) {
        plugin.forEach((plu) => plu && register(plu, params));
    }
    plugin.Init && plugin.Init(params);
}

/**
 * 注册路由方法
 * @param  {Object | Array} plugins 待注入的插件
 * @param  {Object} params 注册的属性
 */
export function registerHistoy(history) {
    hashHistory = history;
}

/**
 * 路由跳转方法
 * @param {*}
 */
export const goto = {
    go: (url, options = {}) => {
        hashHistory.go(gotoFormatUrl(url, options));
    },
    push: (url, options = {}) => {
        hashHistory.push(gotoFormatUrl(url, options));
    },
    goback: (url, options = {}) => {
        hashHistory.goback(gotoFormatUrl(url, options));
    },
    replace: (url, options = {}) => {
        hashHistory.replace(gotoFormatUrl(url, options));
    }
};

/* 统一格式化跳转路由 */
const gotoFormatUrl = (url, options) => {
    const { queryString, params } = options;
        /* params方式增加路由参数 */
        if (params) {
            url = paramsToUrl(url, params);
        }
        /* queryString方式增加路由参数 */
        if (queryString) {
            url = queryStringToUrl(url, queryString)
        }
    return url;
}

/* params方式增加路由参数 */
const paramsToUrl = (url, params, joinCode = '/') => {
    if (Array.isArray(params)) {
        url = [url, ...params].join(joinCode);
    } else {
        console.error('params must be array in goto arguments');
    }
    return url;
}

/* queryString方式增加路由参数 */
const queryStringToUrl = (url, config, splitCode = '?') => {
    let option = {},
        tempUrl = url;
    if (url.includes(splitCode)) {
        const urlSplitDatas = url.split(splitCode);
        option = {
            ...option,
            ...parse(urlSplitDatas.pop())
        };
        tempUrl = urlSplitDatas.join(splitCode);
    }
    option = {
        ...option,
        ...config,
    };

    return `${url}${splitCode}${stringify(option)}`
}

/**
 * 统一更换reducer参数
 * @param {promise} modelPromise 
 */
export const replaceReducerParams = (dataSource) => dataSource
    .map((item) => {
        if (typeof item === 'object') {
            return item.model;
        } else if (typeof item === 'function') {
            return item;
        } else { 
            return () => {};
        }
    })
    .map((modelPromise) => () => new Promise((resolve) => {
        modelPromise().then((response) => {
            const { reducers = {}, namespace } = response.default;
            Object.keys(reducers).forEach((key) => {
                if (key === 'setReducers') {
                    return;
                }
                if (!reducers[key]['isRewrite']) {
                    const reducerFunc = reducers[key];
                    reducers[key] = (payload, getState) => {
                        return reducerFunc(getState()[namespace], { payload });
                    };
                    reducers[key]['isRewrite'] = true;
                }
            });
            resolve({ ...response });
        });
    }))

/**
 * 兼容老项目中 config配置
 * @param {array} dataSource 
 */
export const preReplaceReducerHandle = (moduleConfig) => {
    if (Array.isArray(moduleConfig)) {
        return replaceReducerParams(moduleConfig);
    } else {
        return {
            ...moduleConfig,
            modelList: replaceReducerParams(moduleConfig.modelList)
        };
    }
}

/**
 * 微前端 - 根据location中的hash值以及传入的前缀来进行匹配，如果匹配上则返回true，否则返回false
 * @param {string | array} routerPrefix // 系统url前缀
 * @param {func} customerUrlHandle // 自定义匹配方式
 * @param {string | array} exceptRouter // 自定义匹配方式
 */
export const getMicroActiveRule = (routerPrefix, customerUrlHandle, exceptRouter) => (location) => {
    if (!location.hash) {
        return false;
    }
    if (customerUrlHandle) {
        return customerUrlHandle(location);
    }
    const url =
        location.hash &&
        location.hash
            .split('#')
            .filter((str, idx) => idx > 0)
            .join('');
    if (exceptRouter) {
        if (!Array.isArray(exceptRouter)) {
            exceptRouter = [exceptRouter];
        }
        return exceptRouter.every((route) => !url.startsWith(route));
    }
    /* 可以传数组 */
    if (Array.isArray(routerPrefix)) {
        return routerPrefix.some((route) => { 
            return url.split('/').indexOf(route.split('/')[1]) > -1;
        });
    } else {
        return url.startsWith(routerPrefix);
    }
};

/**
 * 初始化事件配置
 * @param {array} configs // 注册配置
 * @param {object} params // 注册入参
 * @param {array} plugins // 插件集
 */
export const initAppConfig = async({ 
    configs = {},
    params = {},
    plugins = []
} = {}) => {
    /* 合并插件集 */
    const DEFAULT_PLUGINS = [new InitModelPlugin(params)];
    plugins = [
        ...DEFAULT_PLUGINS,
        ...plugins
    ];

    for(let plugin of plugins) {
        const type = plugin.getType(); // 获取插件类型
        const effectHandles = configs[type] || []; // 获取插件需要解析的模块
        await plugin.run(effectHandles); // 运行插件
    }
}

/**
 * 检查当前url是否符合当前人的权限内 返回 boolean
 * @param {Array} dataSource // 个人权限
 * @param {Object} location // window location对象
 */
export const checkCurrPath = (dataSource, location = window.location) => {
    let routerMap = getFlatMenuData(formatterUrl(dataSource)),
        params = location.hash.split('#').pop().split('?').shift(),
        routes = Object.keys(routerMap);
    return routes.every((rout) => !pathToRegexp(rout).test(params));
};

const DefaultExport = {
    modelNotExisted, dynamicWrapper, getFlatMenuData,
    getRouterData, getThanosRouter, getPageTitle,
    isUrl, formatterUrl, getRedirect,
    compareMenuData, compareObject, getRelation,
    getRenderArr, getRoutes, urlToList,
    toTreeData, findCheck, replaceKey,
    checkPass, filterMenu, getCodes,
    getParentUrl, sortTreeData, register,
    registerHistoy, goto, replaceReducerParams,
    preReplaceReducerHandle,
    initAppConfig, getMicroActiveRule, 
    checkCurrPath, 
    /* 防止循环依赖 */
    get: (key) => DefaultExport[key]
};

export default DefaultExport;
