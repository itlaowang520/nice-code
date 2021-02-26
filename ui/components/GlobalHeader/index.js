import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Menu, Icon, Dropdown, Avatar, Divider } from 'antd';
import { goto } from 'ks-cms-utils';
import ProjectSwitcher from './ProjectSwitcher';
import './index.scss';
import defaultAva from '../../styles/defaultAvatar.jpg';

export default class GlobalHeader extends PureComponent {
    static propTypes = {
        collapsed: PropTypes.bool,
        onCollapse: PropTypes.func,
        isMobile: PropTypes.bool,
        logo: PropTypes.string,
        onMenuClick: PropTypes.func,
        userMenuData: PropTypes.array,
        customerUser: PropTypes.node,
        switchMenu: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.bool
        ]), // 切换系统菜单配置
        currentUser: PropTypes.object,
        defaultAvatar: PropTypes.any
    }
    toggle = () => {
        const { collapsed, onCollapse } = this.props;
        onCollapse(!collapsed);
    };

    getRightMenu = (menu) => {
        const { currentUser = {}, customerUser, defaultAvatar } = this.props;
        if (customerUser) {
            return <span>
                {customerUser}
            </span>;
        } else {
            return <span>
                <Dropdown trigger={['click']} overlay={menu}>
                    <span className='action account'>
                        <Avatar size="small" className='avatar' src={(currentUser && currentUser.avatar) || defaultAvatar || defaultAva} />
                        <span className='name'>{currentUser.username}</span>
                    </span>
                </Dropdown>
            </span>;
        }
    };

    render() {
        const {
            collapsed,
            isMobile,
            logo,
            onMenuClick,
            userMenuData,
            switchMenu,
        } = this.props;

        const menu = (
            <Menu className='menu' selectedKeys={[]} onClick={onMenuClick}>
                {
                    userMenuData && userMenuData.map((menu, idx) => {
                        if (idx === userMenuData.length - 1) {
                            if (idx === 0) {
                                return ([
                                    <Menu.Item key={menu.key}>
                                        {
                                            menu.icon && <Icon type={menu.icon} />
                                        }
                                        {menu.name}
                                    </Menu.Item>
                                ]);
                            } else {
                                return ([
                                    <Menu.Divider key={idx}/>,
                                    <Menu.Item key={menu.key}>
                                        {
                                            menu.icon && <Icon type={menu.icon} />
                                        }
                                        {menu.name}
                                    </Menu.Item>
                                ]);
                            }
                        }
                        return (
                            <Menu.Item key={menu.key} className={menu.key === 'setting'? 'dropdown-menu-setting' :''}>
                                {
                                    menu.icon && <Icon type={menu.icon} />
                                }
                                {menu.name}
                            </Menu.Item>
                        );
                    })
                }
            </Menu>
        );

        return (
            <div className='header'>
                {isMobile && [
                    <a
                        onClick={() => {
                            goto.push('/');
                        }}
                        className='logo'
                        key="logo"
                    >
                        <img src={logo} alt="logo" width="32" />
                    </a>,
                    <Divider type="vertical" key="line" />
                ]
                }
                <Icon
                    className='trigger'
                    type={collapsed ? 'menu-unfold' : 'menu-fold'}
                    onClick={this.toggle}
                />
                <ProjectSwitcher switchMenu={switchMenu}/>
                <div className='right'>
                    { this.getRightMenu(menu) }
                </div>
            </div>
        );
    }
}
