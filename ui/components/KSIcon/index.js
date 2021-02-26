import React from 'react';
import { Icon } from 'antd';
import IconTypes from './iconTypes';
import PropTypes from 'prop-types';
// import CmsIconTypes from './cmsIconTypes';

export default class KSIcon extends React.PureComponent {
    static propTypes = {
        color: PropTypes.string,
        size: PropTypes.string,
        style: PropTypes.object,
        type: PropTypes.string
    }
    static defaultProps = {
        size: 'default',
        style: {}
    }
    render() {
        const { color, size } = this.props;
        let fontSize;
        switch (size) {
            case 'large':
                fontSize = '22px';
                break;
            case 'default':
                fontSize = '18px';
                break;
            case 'small':
                fontSize = '14px';
                break;
            default:
                fontSize = size;
        }
        /* if (this.props.type) {
            // 如果该type类型既没有在antd的Icon中，也没有在阿里自定义项目的Icon中则返回，与定义字体大小一直的 红色X 标志
            if (IconTypes.concat(CmsIconTypes).indexOf(this.props.type) === -1) {
                let currentStyle = {color: 'red'};
                if (this.props.style) {
                    currentStyle = {...this.props.style, color: 'red'};
                }
                return <span style={currentStyle}>X</span>;
            } else
            // 如果不在antd的Icon中，则去阿里自定义项目的Icon中找，并作返回
            if (IconTypes.indexOf(this.props.type) === -1) {
                const IconFont = Icon.createFromIconfontCN({
                    scriptUrl: '//at.alicdn.com/t/font_942720_1smz1844j16.js',
                });
                return <IconFont {...this.props} />;
            }
        } */
        // 如果type不在antd的Icon中，则去阿里自定义项目的Icon中找，并作返回
        if (('type' in this.props) && IconTypes.indexOf(this.props.type) === -1) {
            const IconFont = Icon.createFromIconfontCN({
                scriptUrl: '//at.alicdn.com/t/font_942720_tq8tmvq2yd.js',
            });
            return <IconFont {...this.props} style={{ ...this.props.style, color, fontSize }} />;
        }
        // 返回antd的Icon
        return <Icon {...this.props} style={{ ...this.props.style, color, fontSize }} />;
    }
}
