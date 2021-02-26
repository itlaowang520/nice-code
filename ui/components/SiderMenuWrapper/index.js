import 'rc-drawer-menu/assets/index.css';
import React from 'react';
import DrawerMenu from 'rc-drawer-menu';
import PropTypes from 'prop-types';
import SiderMenu from './SiderMenu';

/**
 * 菜单，根据isMobile的状态返回不同的菜单
 * @PropTypes { boolean } isMobile 是否是手机端
 * @PropTypes { boolean } collapsed 是否横向收起展开菜单
 */

const SiderMenuWrapper = (props) =>
    props.isMobile ? (
        <DrawerMenu
            parent={null}
            level={null}
            iconChild={null}
            open={!props.collapsed}
            onMaskClick={() => {
                props.onCollapse(true);
            }}
            width="256px"
        >
            <SiderMenu {...props} collapsed={props.isMobile ? false : props.collapsed} />
        </DrawerMenu>
    ) : (
        <SiderMenu {...props} />
    );

export default SiderMenuWrapper;

SiderMenuWrapper.propTypes = {
    isMobile: PropTypes.bool,
    collapsed: PropTypes.bool,
    onCollapse: PropTypes.func
};
