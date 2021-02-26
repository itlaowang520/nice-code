import React from 'react';
import { Layout } from 'antd';
import PropTypes from 'prop-types';
import DocumentTitle from 'react-document-title';
import kreduxRouter from 'kredux/output/router';
import { ContainerQuery } from 'react-container-query';
import { enquireScreen, unenquireScreen } from 'enquire-js';
import SiderMenuWrapper from '../SiderMenuWrapper';
import GlobalHeader from '../GlobalHeader';
import NotFound from '../Exception/404';
import defaultLogo from '../../styles/logo.png';
import './index.scss';
import {
    getRoutes, getRedirect,
    compareMenuData, formatterUrl,
    getPageTitle, getRouterData
} from 'ks-cms-utils';
const { createElement } = React;
const { Content, Header } = Layout;
const { Route, Redirect, Switch } = kreduxRouter;
const query = {
    'screen-xs': {
        maxWidth: 575,
    },
    'screen-sm': {
        minWidth: 576,
        maxWidth: 767,
    },
    'screen-md': {
        minWidth: 768,
        maxWidth: 991,
    },
    'screen-lg': {
        minWidth: 992,
        maxWidth: 1199,
    },
    'screen-xl': {
        minWidth: 1200,
    },
}; // 客户端宽度定义

let isMobile;
enquireScreen((b) => {
    isMobile = b;
});

let menuDataCache = {}, routerDataCache = [];

export default class BasicLayout extends React.PureComponent {
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
        app: PropTypes.object, // 应用实例化
        defaltRouterConfig: PropTypes.array, // 默认路由配置
        getModels: PropTypes.func, // 获取路径对应model配置
        render: PropTypes.func, // 获取模块的方法
        title: PropTypes.string, // 标题
        logo: PropTypes.any, // logo
        defaultAvatar: PropTypes.any, // 默认头像
        dynamic: PropTypes.func, // 异步加载方法
        onMenuClick: PropTypes.func, //
    }
    state = {
        isMobile, // @PropTypes { boolean } isMobile 是否为移动端 根据宽度来定义
    };

    componentDidMount() {
        // 监听屏幕宽度
        this.enquireHandler = enquireScreen((mobile) => {
            this.setState({
                isMobile: mobile,
            });
        });
    }

    componentWillUnmount() {
        // 取消监听屏幕宽度
        unenquireScreen(this.enquireHandler);
    }

    render() {
        const {
            currentUser,
            collapsed,
            match,
            location,
            dataSource,
            onCollapse,
            onMenuClick,
            userMenuData,
            customerUser,
            app,
            defaltRouterConfig,
            getModels,
            render,
            title,
            logo,
            defaultAvatar,
            dynamic,
            switchMenu
        } = this.props;

        let MenuData = formatterUrl(dataSource), // 格式化菜单
            redirectData = getRedirect(MenuData), // 获取有重定向数据
            layout,
            routerData;
        if (compareMenuData(MenuData, menuDataCache)) {
            // 没变化 从缓存读取
            routerData = routerDataCache;
        } else {
            routerData = getRouterData({
                app,
                render,
                dynamic,
                getModels,
                createElement,
                defaltRouterConfig,
                menuList: MenuData,
            });
        }
        // cache MenuData 缓存
        menuDataCache = MenuData;
        routerDataCache = routerData;
        layout = (
            <Layout>
                <SiderMenuWrapper
                    logo={ logo || defaultLogo }
                    title={title}
                    menuData={MenuData}
                    collapsed={collapsed}
                    location={location}
                    isMobile={this.state.isMobile}
                    onCollapse={onCollapse}
                />
                <Layout>
                    <Header
                        style={{
                            padding: 0,
                            height: '46px',
                            lineHeight: '46px'
                        }}
                    >
                        <GlobalHeader
                            logo={ logo || defaultLogo }
                            defaultAvatar={defaultAvatar}
                            currentUser={currentUser}
                            collapsed={collapsed}
                            customerUser={customerUser}
                            userMenuData={userMenuData}
                            isMobile={this.state.isMobile}
                            onCollapse={onCollapse}
                            onMenuClick={onMenuClick}
                            switchMenu={switchMenu}
                        />
                    </Header>
                    <Content className='layoutContent'>
                        {
                            dataSource && dataSource.length > 0 && <Switch>
                                {getRoutes(match.path, routerData).map((item) => {
                                    const Component = item.component;
                                    return (
                                        <Route
                                            key={item.key}
                                            path={item.path}
                                            render={(props) => (Component ? <Component isMobile={this.state.isMobile || false} {...props} {...item} /> : this.props.render(props))}
                                            exact={item.exact}
                                        />
                                    );
                                })}
                                <Redirect exact from="/" to={redirectData.length ? redirectData[0].to : '/user/login'} />
                                <Route render={NotFound} />
                            </Switch>
                        }
                    </Content>
                </Layout>
            </Layout>
        );
        return (
            <DocumentTitle title={getPageTitle(routerData, location, title)}>
                <ContainerQuery query={query}>
                    {(params) => {
                        let screen = Object.keys(params).find((key) => params[key]) || '';
                        return <div className={`${screen}`}>{layout}</div>;
                    }}
                </ContainerQuery>
            </DocumentTitle>
        );
    }
}
