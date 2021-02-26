import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import pathToRegexp from 'path-to-regexp';
import { Layout, Menu, Input } from 'antd';
import { urlToList, getParentUrl, goto } from 'ks-cms-utils';
import KSIcon from '../KSIcon';
import './index.scss';

const { Sider } = Layout;
const { SubMenu } = Menu;
const { Search } = Input;

const MIN_SIDE_WIDTH = 80; // 最小宽度
const MAX_SIDE_WIDTH = 400; // 最大宽度
/**
 * 获取icon
 * @PropTypes { url | string | ReactNode } icon 传入的icon
 * url(包含http)直接显示对应的url图标
 * string 引入antd Icon中的元素
 * ReactNode 直接返回对应的ReactNode
 * @return { ReactNode }
 */
const getIcon = (icon) => {
    // 如果是图片链接 则返回图片
    if (typeof icon === 'string' && icon.indexOf('http') === 0) {
        return <img src={icon} alt="icon" className={`icon sider-menu-item-img`} />;
    }
    // 如果为字符串 则返回该字符串对应的icon
    if (typeof icon === 'string' && icon !== '') {
        return <KSIcon type={icon} />;
    }
    // 如果没有icon 则返回默认的icon
    if (!icon || icon === '') {
        return <KSIcon type="folder" />;
    };
    // 其他情况则直接返回参数自身
    return icon;
};

/**
  * 获取树级结构所有的path
  * @PropTypes { Object } menu 传入的树形menu
  * @return { Array }
  */
export const getFlatMenuKeys = (menu) =>
    menu.reduce((keys, item) => {
        keys.push(item.path);
        if (item.children) {
            return keys.concat(getFlatMenuKeys(item.children));
        }
        return keys;
    }, []);

/**
   * 过滤所有符合路由的menuKey
   * @PropTypes { Array } flatMenuKeys: [/abc, /abc/:id, /abc/:id/info]
   * @PropTypes { Array } paths: [/abc, /abc/11, /abc/11/info]
   * @return { Array }
   */
export const getMenuMatchKeys = (flatMenuKeys, paths) =>
    paths.reduce((matchKeys, path) => (
        matchKeys.concat(
            flatMenuKeys.filter((item) => pathToRegexp(item).test(path))
        )), []);

export default class SiderMenu extends PureComponent {
    static propTypes = {
        menuData: PropTypes.array,
        location: PropTypes.object,
        isMobile: PropTypes.bool,
        onCollapse: PropTypes.func,
        logo: PropTypes.any,
        collapsed: PropTypes.bool,
        title: PropTypes.string,
        onSidebarMenuClick: PropTypes.func, // 自定义菜单点击事件
    }

    state={
        openKeys: Array.from(new Set(getParentUrl(this.props.menuData, urlToList(this.props.location.pathname), null))),
        pathname: this.props.location.pathname,
        menuData: this.props.menuData,
        originMenuData: this.props.menuData,
        isloaded: false,
        sideWidth: 200
    }

    dragRef;
    moveHandle;
    documentMouseUp;

    static getDerivedStateFromProps(props, state) {
        if (state.pathname !== props.location.pathname || !state.isloaded) {
            const newState = {
                ...state,
                openKeys: Array.from(new Set(getParentUrl(props.menuData, urlToList(props.location.pathname), null))),
                pathname: props.location.pathname,
                originMenuData: props.menuData,
            };
            if (!state.isloaded && props.menuData.length) {
                newState.menuData = props.menuData;
                newState.isloaded = true;
            }
            return newState;
        } else {
            return state;
        }
    }

    componentDidMount() {
        this.documentMouseUp = document.addEventListener('mouseup', (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (this.moveHandle) {
                window.removeEventListener('mousemove', this.moveHandle);
                const sideLayoutDom = document.querySelector('.sider.ant-layout-sider');
                const width = sideLayoutDom.style.width.split('px').shift();
                const { onCollapse, collapsed } = this.props;
                /**
                 * 如果为最小宽度 则进行侧边栏缩起
                 * 如果不为最小宽度 则进行侧边栏展开
                 */
                if (!collapsed && (width - 0) === MIN_SIDE_WIDTH) {
                    onCollapse && onCollapse(!collapsed);
                } else if (collapsed && width > MIN_SIDE_WIDTH) {
                    onCollapse && onCollapse(!collapsed);
                }
                this.setState({
                    sideWidth: width - 0,
                });
                this.moveHandle = null;
            }
        });
    }

    componentWillUnmount() {
        /* 删除监听 */
        if (this.documentMouseUp) {
            window.removeEventListener('mousemove', this.documentMouseUp);
            this.documentMouseUp = null;
        }
    }
    //     /**
    //    * Convert pathname to openKeys
    //    * /list/search/articles = > ['list','/list/search']
    //    * @param  props
    //    */
    //     getDefaultCollapsedSubMenus(props) {
    //         const { location: { pathname }, menuData } = props || this.props;
    //         return this.getParentUrl(menuData, urlToList(pathname), null);
    //     }
    /**
   * 判断是否是http链接.返回 Link 或 a
   * Judge whether it is http link.return a or Link
   * @memberof SiderMenu
   */
    getMenuItemPath = (item) => {
        const { onSidebarMenuClick } = this.props;
        const itemPath = this.conversionPath(item.path);
        const icon = getIcon(item.icon);
        const { target, name } = item;
        // Is it a http link
        // if (/^\/https?:\/\//.test(itemPath)) {
        //     return (
        //         <a href={itemPath} target={target}>
        //             {icon}
        //             <span>{name}</span>
        //         </a>
        //     );
        // }
        if (onSidebarMenuClick) {
            return (
                <a
                    onClick={() => {
                        onSidebarMenuClick(itemPath, this.props.location, name, target);
                    }}
                >
                    <div className="menu-display">
                        {icon}
                        <div>{name}</div>
                        {
                            item.openInNewTab && <img
                                src={'https://tcdn.kaishustory.com/kstory/activity_flow/image/a8cca281-6b32-45e3-9b7c-bc6b83320480_info_w=200_h=200_s=4330.png'}
                                className="menu-display-icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSidebarMenuClick(itemPath, this.props.location, name, target, 'open');
                                }}
                            />
                        }
                    </div>
                </a>
            );
        }
        return (
            <a
                target={target}
                onClick={() => {
                    goto.push(itemPath);
                    this.props.isMobile && this.props.onCollapse(true);
                }}
            >
                {icon}
                <span>{name}</span>
            </a>
        );
    };
    /**
   * get SubMenu or Item
   */
    getSubMenuOrItem = (item) => {
        if (item.children && item.children.some((child) => child.name && !child.hideInMenu)) {
            const childrenItems = this.getNavMenuItems(item.children);
            // 当无子菜单时就不展示菜单
            if (childrenItems && childrenItems.length > 0) {
                return (
                    <SubMenu
                        title={
                            <span>
                                {getIcon(item.icon)}
                                <span>{item.name}</span>
                            </span>
                        }
                        key={item.path}
                    >
                        {childrenItems}
                    </SubMenu>
                );
            }
            return null;
        } else if (!item.hideInMenu) {
            return <Menu.Item key={item.path}>{this.getMenuItemPath(item)}</Menu.Item>;
        } else {
            return null;
        }
    };

    /**
   * 获得菜单子节点
   * @memberof SiderMenu
   */
    getNavMenuItems = (menusData) => {
        if (!menusData) {
            return [];
        }
        return menusData
            .filter((item) => item.name && !item.hideInMenu)
            .map((item) => this.getSubMenuOrItem(item))
            .filter((item) => item);
    };
    // Get the currently selected menu
    getSelectedMenuKeys = () => {
        const { location: { pathname } } = this.props;
        const { menuData } = this.state;
        return getMenuMatchKeys(getFlatMenuKeys(menuData), urlToList(pathname));
    };
    // conversion Path
    // 转化路径
    conversionPath = (path) => {
        if (path && (path.includes('http') || path.includes('https'))) {
            return path;
        } else {
            return `/${path || ''}`.replace(/\/+/g, '/');
        }
    };

    isMainMenu = (key) => this.state.menuData.some((item) => key && (item.key === key || item.path === key))

    handleOpenChange = (openKeys) => {
        const lastOpenKey = openKeys[openKeys.length - 1];
        const moreThanOne = openKeys.filter((openKey) => this.isMainMenu(openKey)).length > 1;
        this.setState({
            openKeys: moreThanOne ? [lastOpenKey] : [...openKeys],
        });
    };

    /**
     * 根据 搜索词 进行数据过滤
     * @param {string} keyword // 搜索次
     * @param {array} dataSource // 资源🌲
     */
    filterByKeyword = (keyword, dataSource) => {
        return dataSource.map((menu) => {
            const { name, children = [] } = menu;
            const tempChildren = this.filterByKeyword(keyword, children);
            const isMatch = name.includes(keyword);
            if (!isMatch && !tempChildren.length) {
                return false;
            }
            return {
                ...menu,
                children: isMatch ? children : tempChildren
            };
        }).filter((menu) => menu);
    }

    getMoving = (originEventX) => {
        const _this = this;
        return function(currtEven) {
            const { sideWidth } = _this.state;
            const sideLayoutDom = document.querySelector('.sider.ant-layout-sider');
            let width = sideWidth + currtEven.pageX - originEventX;
            if (width < MIN_SIDE_WIDTH) {
                width = MIN_SIDE_WIDTH;
            } else if (width > MAX_SIDE_WIDTH) {
                width = MAX_SIDE_WIDTH;
            }
            sideLayoutDom.style.maxWidth = `${width}px`;
            sideLayoutDom.style.minWidth = `${width}px`;
            sideLayoutDom.style.width = `${width}px`;

            /**
             * 如果不为最小宽度 则进行侧边栏展开
             */
            const { onCollapse, collapsed } = _this.props;
            if (collapsed && width > MIN_SIDE_WIDTH) {
                onCollapse && onCollapse(!collapsed);
            }
        };
    }

    render() {
        const { logo, collapsed, onCollapse, title } = this.props;
        const { openKeys, menuData, originMenuData, sideWidth } = this.state;
        // Don't show popup menu when it is been collapsed
        const menuProps = collapsed
            ? {}
            : {
                openKeys,
            };
        // if pathname can't match, use the nearest parent's key
        let selectedKeys = this.getSelectedMenuKeys();
        if (!selectedKeys.length && openKeys.length) {
            selectedKeys = [openKeys[openKeys.length - 1]];
        }
        return (
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                breakpoint="lg"
                onCollapse={onCollapse}
                width={sideWidth}
                className='sider'
            >
                <div className='side-logo' key="logo">
                    <a to="/">
                        <img src={logo} alt="logo" />
                        <h1>{title}</h1>
                    </a>
                </div>
                <div className='side-search'>
                    <Search
                        size={'small'}
                        placeholder={'菜单搜索'}
                        onSearch={(value) => {
                            this.setState({
                                menuData: this.filterByKeyword(value, originMenuData)
                            });
                        }}
                    />
                </div>
                <div className='menu-content'>
                    <Menu
                        key="Menu"
                        theme="dark"
                        mode="inline"
                        inlineIndent='12'
                        {...menuProps}
                        className='sideUl'
                        onOpenChange={this.handleOpenChange}
                        selectedKeys={selectedKeys}
                    >
                        {this.getNavMenuItems(menuData)}
                    </Menu>
                </div>
                <div
                    ref={(ref) => {
                        this.dragRef = ref;
                    }}
                    className='drag-menu-line'
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const originEventX = e.pageX;
                        const originEventY = e.pageY;
                        this.moveHandle = this.getMoving(originEventX, originEventY);
                        window.addEventListener('mousemove', this.moveHandle);
                    }}
                >
                </div>
            </Sider>
        );
    }
}
