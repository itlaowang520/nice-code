import React, { Fragment } from 'react';
import { Layout } from 'antd';
import PropTypes from 'prop-types';
import DocumentTitle from 'react-document-title';
import kreduxRouter from 'kredux/output/router';
import { parse } from 'qs';
import { ContainerQuery } from 'react-container-query';
import { enquireScreen, unenquireScreen } from 'enquire-js';
import SiderMenuWrapper from '../SiderMenuWrapper';
import GlobalHeader from '../GlobalHeader';
import { matchMenuInfo, getPersonConfig } from './utils';
import {
    getRoutes, getRedirect,
    compareMenuData, formatterUrl,
    getPageTitle, getThanosRouter,
    goto
} from 'ks-cms-utils';
import HisToryTabs from '../HistoryTabs';
import KSGuide from '../KSGuide';
import NotFound from '../Exception/404';
import KSIframe from '../KSIframe';
import defaultLogo from '../../styles/logo.png';
import DrawerNode from './drawerNode';
import './index.scss';
import { query, SETTING_MENU_ITEM, GUIDE_DATA_SOURCE } from './constants';
const ROOT_PATH = '/';
const { Route, Redirect, Switch } = kreduxRouter;
const { Content, Header } = Layout;

let isMobile;
enquireScreen((b) => {
    isMobile = b;
});

let menuDataCache = {}, routerDataCache = [];

export default class ThanosLayout extends React.PureComponent {
    static propTypes = {
        collapsed: PropTypes.bool, // 是否收缩菜单
        userMenuData: PropTypes.array, // 个人信息菜单数组
        customerUser: PropTypes.node, // 个人信息菜单数组
        dataSource: PropTypes.array, // 菜单数据来源 树形数组
        currentUser: PropTypes.object, // 当前登陆人信息
        location: PropTypes.object, // location对象
        match: PropTypes.object, // route上的match对象，包含当前路由信息
        switchMenu: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.bool
        ]), // 切换系统菜单配置
        onCollapse: PropTypes.func, // 收缩菜单事件
        onMenuClick: PropTypes.func, // 个人信息菜单点击事件
        hideMenu: PropTypes.bool, // 隐藏菜单
        hideHeader: PropTypes.bool, // 隐藏头部
        hideContent: PropTypes.bool, // 隐藏内容
        customerContent: PropTypes.node, // 自定义内容
        onSidebarMenuClick: PropTypes.func, // 自定义菜单点击事件
        defaltRouterConfig: PropTypes.array, // 默认路由配置
        getModels: PropTypes.func, // 获取路径对应model配置
        render: PropTypes.func, // 获取模块的方法
        title: PropTypes.string, // 标题
        pageTitle: PropTypes.string, // 页面标题
        logo: PropTypes.any, // logo
        defaultAvatar: PropTypes.any, // 默认头像
        dynamic: PropTypes.func, // 异步加载方法
        mode: PropTypes.string, // 内容区模式 normal-常规 | menuTab-菜单页签 | pageTab-页面页签
        history: PropTypes.object,
        setCustom: PropTypes.bool, // 是否设置自定义
    }

    static defaultProps = {
        hideMenu: false,
        hideHeader: false,
        hideContent: false,
        mode: 'normal',
        setCustom: true
    }

    constructor(props) {
        super(props);
        let bodyNode = document.getElementsByTagName('body')[0];
        bodyNode.className = 'body-scrollStyle';
        this.modeConfig = getPersonConfig().setting;
        const { mode: modePros } = this.props;
        if (this.modeConfig && this.modeConfig.tags) {
            this.state.mode = this.modeConfig.tags;
        } else {
            this.state.mode = modePros;
        }
    }

    listener; // history监听

    state = {
        isMobile, // @PropTypes { boolean } isMobile 是否为移动端 根据宽度来定义
        baseHisToryList: [], // 历史页签列表
        hisToryTabsActiveKey: '', // 当前激活的页签
        isTouch: false, // 是否进行过操作
        isLoaded: false,
        settingVisible: false, // 自定义设置
        mode: this.props.mode
    };

    componentDidMount() {
        // 监听屏幕宽度
        this.enquireHandler = enquireScreen((mobile) => {
            this.setState({
                isMobile: mobile,
            });
        });
        const { history } = this.props;
        /* history监听 */
        this.listener = history.listen(this.handlePathChange);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.location.pathname === nextProps.location.pathname) {
            const { location: { pathname = '' } } = nextProps;
            if (pathname !== '' || pathname !== ROOT_PATH) {
                /* 初始化当前路由tab */
                this.handlePathChange(this.props.location);
            }
        }
    }

    componentDidUpdate() {
        const { location: { pathname = '' } } = this.props;
        /* routerData有数据之后，需要重新匹配下没有名称的tab */
        if (Object.keys(routerDataCache).length && !this.state.isLoaded && pathname !== ROOT_PATH) {
            this.setState({
                isLoaded: true,
                baseHisToryList: this.completionTabName(this.state.baseHisToryList)
            });
        }
    }

    componentWillUnmount() {
        // 取消监听屏幕宽度
        unenquireScreen(this.enquireHandler);
        /* 卸载history监听 */
        this.listener();
    }

    /**
    * 补全名称
    * 当前tab 如果没有name属性的会根据 routerData和pathname匹配菜单信息 拿到姓名
    */
    completionTabName = (dataSource, pathname) => {
        const { location: { pathname: defaultPathname } } = this.props;
        return dataSource.map((item) => {
            if (!item.name) {
                return {
                    ...item,
                    name: (matchMenuInfo(routerDataCache, pathname || defaultPathname).menu || {}).name
                };
            } else {
                return item;
            }
        });
    }

    /* 合并tablist */
    mergeTabList = (newTab) => {
        const { baseHisToryList } = this.state;
        let result = baseHisToryList;
        const index = baseHisToryList.findIndex(({ path }) => path === newTab.path);
        if (index < 0) {
            result.push(newTab);
        }
        return result.filter(({ path }) => path !== ROOT_PATH);
    }

    /* path变更监听事件 */
    handlePathChange = (location) => {
        const { pathname } = location;
        const pathType = (matchMenuInfo(routerDataCache, pathname).menu || {}).type;
        const { mode } = this.state;
        if (mode === 'menuTab') {
            if (pathType === 1) { // 只保存菜单级别
                this.setState({
                    baseHisToryList: this.completionTabName(this.mergeTabList({
                        path: pathname,
                        name: ''
                    }), pathname),
                    hisToryTabsActiveKey: pathname
                });
            }
        } else if (mode === 'pageTab') {
            this.setState({
                baseHisToryList: this.completionTabName(this.mergeTabList({
                    path: pathname,
                    name: ''
                }), pathname),
                hisToryTabsActiveKey: pathname
            });
        }
    }
    // layout 高度重置 model： 页签
    resetLayoutHeight = (mode) => {
        if ((mode === 'menuTab' || mode === 'pageTab') && this.state.baseHisToryList.length) {
            return 'calc(100vh - 76px)';
        } else {
            return 'calc(100vh - 46px)';
        }
    }

    /* 内容渲染 */
    getContent = ({ dataSource, match, MenuData, redirectData, location }) => {
        const { customerContent, getModels, render, dynamic } = this.props;
        const { mode } = this.state;
        let queryString = {};
        /* 增加queryString参数 */
        if (location.search) {
            queryString = parse(location.search.split('?').pop());
        }

        if (customerContent) {
            return customerContent;
        }
        let routerData;
        if (compareMenuData(MenuData, menuDataCache)) {
            // 没变化 从缓存读取
            routerData = routerDataCache;
        } else {
            routerData = getThanosRouter({
                render,
                dynamic,
                getModels,
                menuList: MenuData,
            });
        }
        // cache MenuData 缓存
        menuDataCache = MenuData;
        routerDataCache = routerData;
        return <Content
            className='layoutContent'
            style={{
                height: this.resetLayoutHeight(mode),
                margin: 0
            }}
        >
            <Fragment>
                {
                    dataSource && dataSource.length > 0 && <Switch>
                        {getRoutes(match.path, routerData)
                            .filter((item) => {
                                return item.menu && item.menu.type !== 0;
                            })
                            .map((item) => {
                                const Component = item.component;
                                return (
                                    <Route
                                        key={item.key}
                                        path={item.path}
                                        render={(props) => (Component ? <Component isMobile={this.state.isMobile || false} {...props} {...item} match={{ ...props.match, queryString }} /> : this.props.render(props))}
                                        exact={item.exact}
                                    />
                                );
                            })}
                        <Redirect exact from="/" to={redirectData.length ? redirectData[0].to : '/user/login'} />
                        <Route
                            path='/iframe'
                            exact
                            render={(props) => (<KSIframe
                                {...props}
                            />)}
                        />
                        <Route render={NotFound} />
                    </Switch>
                }
            </Fragment>
        </Content>;
    }

    /**
     * 默认点击菜触发的回调函数
     * @param {String} path 路径
     * @param {Object} location location信息
     * @param {String} name 菜单名称
     * @param {String} target
     * @param {String} jumpType 跳转方式 open - 打开新页面
     */
    defaultOnSidebarMenuClick = (path, location, name, target, jumpType) => {
        if (/^\/https?:\/\//.test(path)) {
            if (jumpType === 'open') {
                window.open(`${window.location.origin}${window.location.pathname}#/iframe?iframeLink=${path.substring(1)}`);
            } else {
                goto.push(`/iframe?iframeLink=${path.substring(1)}`);
            }
        } else {
            if (jumpType === 'open') {
                window.open(`${window.location.origin}${window.location.pathname}#${path}`);
            } else {
                goto.push(path); // 跳转
            }
        }
    }

    // 页签改变回调，更新当前激活页签，页面跳转
    handleHisToryTabsChange = (activeKey) => {
        goto.push(activeKey);
    }

    // 删除页签
    handleHisToryTabsRemove = (targetKey) => {
        const { baseHisToryList, hisToryTabsActiveKey } = this.state;
        let currIndex = (baseHisToryList || []).findIndex(({ path }) => path === targetKey),
            newHisToryTabs = (baseHisToryList || []).filter((item, idx) => idx !== currIndex);
        /* 如果不是当前选中则直接渲染过滤的数据 */
        if (hisToryTabsActiveKey !== targetKey) {
            this.setState({
                baseHisToryList: newHisToryTabs,
            });
        } else {
            let gotoPath = '';
            if (currIndex === baseHisToryList.length - 1) { // 如果删的是最后一个,删完跳到新数组的最后一个
                gotoPath = newHisToryTabs[newHisToryTabs.length - 1].path;
            } else { // 如果不是最后一个，删完跳它后一个
                gotoPath = baseHisToryList[currIndex + 1].path;
            }
            this.setState({
                baseHisToryList: newHisToryTabs,
                hisToryTabsActiveKey: gotoPath
            }, () => {
                goto.push(gotoPath);
            });
        }
    }
    render() {
        const {
            currentUser, collapsed, match,
            location, dataSource, onCollapse,
            onMenuClick, userMenuData, customerUser,
            title, pageTitle,
            logo, defaultAvatar,
            switchMenu, hideMenu, hideHeader,
            hideContent, onSidebarMenuClick
        } = this.props;
        const { settingVisible, mode } = this.state;
        let MenuData = formatterUrl(dataSource), // 格式化菜单
            redirectData = getRedirect(MenuData), // 获取有重定向数据
            layout,
            newUserMenuData;
        if (this.props.setCustom) {
            newUserMenuData = userMenuData.slice();
            newUserMenuData.splice(-1, 0, SETTING_MENU_ITEM);
        } else {
            newUserMenuData = userMenuData;
        }
        layout = (
            <Layout>
                {
                    !hideMenu && <SiderMenuWrapper
                        logo={logo || defaultLogo}
                        title={title}
                        menuData={MenuData}
                        collapsed={collapsed}
                        location={location}
                        isMobile={this.state.isMobile}
                        onCollapse={onCollapse}
                        onSidebarMenuClick={onSidebarMenuClick || this.defaultOnSidebarMenuClick}
                    />
                }
                <Layout>
                    {
                        !hideHeader && <Header
                            style={{
                                padding: 0,
                                height: '46px',
                                lineHeight: '46px'
                            }}
                        >
                            <GlobalHeader
                                logo={logo || defaultLogo}
                                defaultAvatar={defaultAvatar}
                                currentUser={currentUser}
                                collapsed={collapsed}
                                customerUser={customerUser}
                                userMenuData={newUserMenuData}
                                isMobile={this.state.isMobile}
                                onCollapse={onCollapse}
                                onMenuClick={(e) => {
                                    if (e.key === 'setting') {
                                        this.setState({
                                            settingVisible: true
                                        });
                                    } else {
                                        onMenuClick(e);
                                    }
                                }}
                                switchMenu={switchMenu}
                            />
                        </Header>
                    }
                    {
                        mode === 'menuTab' || mode === 'pageTab' ? <HisToryTabs
                            HisToryTabsList={this.state.baseHisToryList}
                            hisToryTabsActiveKey={this.state.hisToryTabsActiveKey}
                            handleHisToryTabsChange={this.handleHisToryTabsChange}
                            handleHisToryTabsRemove={this.handleHisToryTabsRemove}
                        /> : null
                    }
                    {
                        !hideContent && this.getContent({
                            dataSource,
                            match,
                            MenuData,
                            redirectData,
                            location
                        })
                    }
                    <KSGuide
                        version={'1.5.5'}
                        dataSource={GUIDE_DATA_SOURCE}
                    />
                </Layout>
            </Layout>
        );
        return (
            <div>
                <DocumentTitle title={getPageTitle({}, location, pageTitle || title)}>
                    <ContainerQuery query={query}>
                        {(params) => {
                            let screen = Object.keys(params).find((key) => params[key]) || '';
                            return <div className={`${screen}`}>{layout}</div>;
                        }}
                    </ContainerQuery>
                </DocumentTitle>
                <DrawerNode
                    settingVisible={settingVisible}
                    onCloseSetting={(value) => {
                        this.setState({
                            settingVisible: value
                        });
                    }}
                />
            </div>
        );
    }
}
