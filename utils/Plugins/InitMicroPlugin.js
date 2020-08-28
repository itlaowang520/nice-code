import InitBase from './InitBase';
import Router from '../Router';
import { microRequest } from '../Request';

/* 根路由 */
const ROOT_PATH = '/';
/* 路由拼接符号 */
const JOIN_PATH = '/';

/* 注册插件基类 */
export default class InitMicroPlugin extends InitBase {
    type = 'micro';

    constructor(config) {
        super(config);
        this.config = config;
        this.commonFunc = {
            formatterUrl: Router.get('formatterUrl'),
            getRedirect: Router.get('getRedirect'),
            getMicroActiveRule: Router.get('getMicroActiveRule'),
        };
    }

    onEffect = async({ default: configs }) => {
        /* 将请求的权限信息存入redux */
        const { siderResourceList, permissionsList } = this.config.resource;
        const getReSource = (config) => {
            /* 想排除的菜单 */
            const { exceptActiveRule } = config;
            let activeRule = config.activeRule || [],
                newSlidesSource = JSON.parse(JSON.stringify(siderResourceList));
            if (!Array.isArray(activeRule)) { // 若果传入不是数组则处理成数组
                activeRule = [activeRule];
            }
            const mapSource = (data, parentPath = ROOT_PATH) => {
                let tempDataSource = [];
                data.forEach((source) => {
                    const currPath = `${parentPath}${source.path}`;
                    /* 排除个别路由 */
                    if (exceptActiveRule && exceptActiveRule.some((rulePath) => rulePath === currPath)) {
                        return;
                    }
                    /* 当前路径匹配 */
                    /* 当父级路径全匹配，子路由将不进行过滤 */
                    let isFilterChild = true;
                    if (activeRule.some((rulePath) => {
                        if (rulePath === currPath && rulePath !== ROOT_PATH) {
                            isFilterChild = false;
                        }
                        return rulePath.includes(currPath) || rulePath === ROOT_PATH;
                    })) {
                        /* 过滤child */
                        if (isFilterChild && source.children && source.children.length) {
                            source.children = mapSource(source.children, `${currPath}${JOIN_PATH}`);
                        }
                        tempDataSource = [...tempDataSource, source];
                    }
                });
                return tempDataSource;
            };
            newSlidesSource = mapSource(newSlidesSource);
            return newSlidesSource;
        };

        /* 渲染app */
        this.config.render({
            loading: true
        });
        /**
         * 注册微前端应用
         */
        this.config.registerMicroApps(
            configs.map((config) => ({
                ...config,
                activeRule: this.commonFunc.getMicroActiveRule(
                    config.activeRule,
                    config.activeRuleCustomerFun,
                    config.exceptActiveRule,
                ),
                container: '#sub-app-container',
                props: {
                    ...config.props,
                    history: this.config.history,
                    redux: {
                        siderResourceList: getReSource(config),
                        permissionsList
                    }
                },
            })),
            {
                beforeLoad: [],
                beforeMount: [],
                afterUnmount: [],
            },
            { fetch: microRequest }
        );

        /**
         * 重定向
         * 默认取个人权限的第一个菜单当作首页
         */
        let MenuData = this.commonFunc.formatterUrl(siderResourceList), // 格式化菜单
            redirectData = this.commonFunc.getRedirect(MenuData), // 获取有重定向数据
            [redirectUrl = { to: '/' }] = redirectData;

        /**
         * 设置首页路由
         */
        this.config.setDefaultMountApp(`${location.pathname}#${redirectUrl.to}`);

        /**
         * 启动微前端
         */
        this.config.start({
            prefetch: true,
            fetch: microRequest
        });
    }

}
