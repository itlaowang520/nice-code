import React from 'react';
import { Tooltip, message, Menu, Dropdown } from 'antd';
import PropTypes from 'prop-types';
import './style.scss';
const Fragment = React.Fragment;
const MenuItem = Menu.Item;

export default class KSTableContent extends React.Component {
    static propTypes = {
        maxLength: PropTypes.number,
        content: PropTypes.string,
        rows: PropTypes.number,
        whiteSpace: PropTypes.string,
        link: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.bool
        ]),
        copy: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.bool
        ]),
        tooltip: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.bool
        ])
    }

    // 默认属性值
    static defaultProps = {
        maxLength: 30,
        content: '',
        tooltip: true,
        whiteSpace: 'normal'
    }

    menu = (
        <Menu>
            <MenuItem
                onClick={() => {
                    var textArea = document.createElement('textarea');
                    textArea.value = this.props.content || '';
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    message.success('复制成功');
                }}
            >复制</MenuItem>
        </Menu>
    )

    /**
     * link模式
     * @param  {String} content     未被修改过的内容
     * @param  {Function} linkClick 点击的事件回调 参数 content
     * @param  {Node} node          待被link包裹的node节点
     * @return {Node}               被link包裹后的node节点
     */
    getLinkNode = ({ content, linkClick, node }) => {
        return (
            <a onClick={() => {
                if (linkClick) {
                    linkClick && linkClick(content);
                } else {
                    window.open(content);
                }
            }}>
                {node}
            </a>
        );
    }

    /**
     * copy模式
     * @param  {Node} node          待被link包裹的node节点
     * @return {Node}               被link包裹后的node节点
     */
    getCopyNode = ({ node }) => {
        return (
            <Dropdown overlay={this.menu} trigger={['contextMenu']}>
                {node}
            </Dropdown>
        );
    }

    /**
     * 截取string
     * @param  {String} content   待被修正的字符串
     * @param  {Number} maxLength 显示最大的长度
     * @return {Node}             待展示的节点
     */
    silceContent = ({ content, maxLength, rows, whiteSpace }) => {
        if (rows) {
            return <div
                className="text-content"
                style={{
                    'WebkitLineClamp': `${rows}`,
                    whiteSpace
                }}
            >{content}</div>;
        } else {
            return <span style={{ userSelect: 'none', whiteSpace }}>{content && content.length > maxLength ? content.slice(0, maxLength) + '...' : content}</span>;
        }
    }

    render() {
        const { maxLength, content, link, copy, tooltip, rows, whiteSpace } = this.props;
        const isLink = !!link;
        const isCopy = !!copy;
        const isTooltip = !!tooltip;
        let params = { content, maxLength, rows, whiteSpace },
            node = <span>{this.silceContent({ ...params })}</span>;
        if (isTooltip) {
            node = (
                <Tooltip
                    placement='topLeft'
                    title={content}
                    overlayStyle={{whiteSpace}}
                >
                    {node}
                </Tooltip>
            );
        }
        if (isLink) {
            const linkClick = this.props.link.linkClick;
            node = this.getLinkNode({ ...params, linkClick, node });
        }
        if (isCopy) {
            node = this.getCopyNode({ node });
        }
        return (
            <Fragment>
                {node}
            </Fragment>
        );
    }
}
