import React, { Fragment, Component, isValidElement } from 'react';
import PropTypes from 'prop-types';
import { Form, Row, Col } from 'antd';
import KSIcon from '../KSIcon';
import { findFormNode } from './utils';
import './style.scss';

const FormItem = Form.Item;

/**
 * 搜索表单布局
 * @type {Object}
 */
const SEARCH_FORM_TITLE_LAYOUT = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
    }
};
/**
 * 搜索表单布局
 * @type {Object}
 */
const SEARCH_FORM_LAYOUT = {
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 24 },
    }
};

export default class KSSearchForm extends Component {
    static propTypes = {
        form: PropTypes.object,
        col: PropTypes.number, // 列宽 max：24
        components: PropTypes.array, // 搜索项列表
        actions: PropTypes.oneOfType([
            PropTypes.node,
            PropTypes.object
        ]), // 按钮节点
        defaultExtend: PropTypes.bool, // 默认展开|闭合
        size: PropTypes.oneOf(['small']), // 如果表单内的所有表单组件均添加了size='small'属性，则加上该属性可改变行间距
        extend: PropTypes.bool, // 展开|闭合状态
        onExtend: PropTypes.func, // 切换展开事件回掉
        bottom: PropTypes.number, // formItem 的 marginBottom 数量
    };

    static defaultProps = {
        form: {
            getFieldDecorator: (key) => (component) => component
        },
        col: 8,
        defaultExtend: true,
        bottom: 6
    };

    state = {
        extend: this.props.defaultExtend
    };

    /**
     * 渲染 searchItem 表单
     * @param item 表单所需数据对象
     * @param hide 根据 extend 判断是否显示
     * @return {*}
     */
    renderSearchItem = (item, hide) => {
        const { form, col, bottom } = this.props;
        const { getFieldDecorator } = form;
        const { col: itemCol, render } = item;
        if (render) {
            return render();
        } else {
            let formLayout = SEARCH_FORM_LAYOUT,
                className = '';
            if (item.title) {
                formLayout = SEARCH_FORM_TITLE_LAYOUT;
                className = 'has-title';
            }
            return <Col key={item.key} span={itemCol || col}>
                <FormItem
                    {...formLayout}
                    style={{marginBottom: bottom}}
                    label={item.title}
                    className={hide ? `${className} hide-item` : className}
                >
                    {
                        getFieldDecorator(item.key, (item.options || {}))(item.component)
                    }
                </FormItem>
            </Col>;
        }
    };

    getExtendProp = () => {
        return 'extend' in this.props ? this.props.extend : this.state.extend;
    };

    /**
     * 根据展开状态获取名称
     */
    getExtend = (extend) => {
        if (extend) {
            return {
                name: '收起',
                type: 'up'
            };
        } else {
            return {
                name: '展开',
                type: 'down'
            };
        }
    };

    /**
     * 获取 按钮 节点
     * @param showExtend => 是否需要展开/收起
     * @param colSpan => action 的 col 所占的 span 数
     * @param className => action 的 FormItem 的类名
     * @return {*}
     */
    getActionsNode = (showExtend, colSpan, className) => {
        const { actions, bottom, onExtend } = this.props;
        const extend = this.getExtendProp();
        const { name, type } = this.getExtend(extend);
        const actionNode = isValidElement(actions) || Array.isArray(actions) ? actions : actions.component;
        let align = 'right';
        if ('align' in actions) {
            align = actions['align'];
        } else if (!showExtend && colSpan < 24) {
            align = 'left';
        }
        return (
            <Col
                span={actions.col || (24 - colSpan) || 24}
                align={align}
            >
                <FormItem
                    className={className}
                    style={{
                        marginBottom: bottom,
                    }}
                >
                    {
                        showExtend && <span>
                            <a
                                className='more'
                                onClick={() => {
                                    this.setState({
                                        extend: !extend
                                    });
                                    onExtend && onExtend(!extend);
                                }}
                            >{name}<KSIcon size='12px' type={type}/></a>
                        </span>
                    }
                    {actionNode}
                </FormItem>
            </Col>
        );
    };

    getFormWapper = () => {
        const result = findFormNode(this.ref);
        return result ? Fragment : Form;
    }

    renderSearchForm = () => {
        const {components, col} = this.props;
        let splitIndex = [], // 存放 span 数大于 24 后的第一个 formItem 的 index 索引
            colSpan = 0;
        components.forEach((item, index) => {
            // 累加 span 数
            colSpan += (item.col || col);
            // 记录 span 数大于 24 后的第一个 item 的 index
            if (colSpan > 24) {
                splitIndex.push(index);
                colSpan = (item.col || col);
            }
        });
        let showExtend = splitIndex.length > 0, // 是否需要收起/展开
            fillGroup,
            lastGroup;

        if (showExtend) {
            fillGroup = components.slice(0, splitIndex[splitIndex.length - 1]);
            lastGroup = components.slice(splitIndex[splitIndex.length - 1]);
        } else {
            fillGroup = [];
            lastGroup = components;
        }

        const extend = this.getExtendProp();
        const hidden = showExtend && !extend;
        const actionClassName = !extend && splitIndex.length > 0 ? 'extend-more' : '';
        // const actionSpan = 24 - Math.ceil((24 / col) * lastGroup.length);
        let curSpan = 0;

        return (
            <Fragment>
                {
                    fillGroup.length > 0 && <Row gutter={4}>
                        {
                            fillGroup.map((item) => {
                                // 第一行不隐藏
                                if (curSpan < 24) {
                                    curSpan += (item.col || col);
                                    return this.renderSearchItem(item, false);
                                } else {
                                    return this.renderSearchItem(item, hidden);
                                }
                            })
                        }
                    </Row>
                }
                <Row gutter={4}>
                    {
                        lastGroup.map((item) => this.renderSearchItem(item, hidden))
                    }
                    {
                        this.getActionsNode(showExtend, colSpan, actionClassName)
                    }
                </Row>
            </Fragment>
        );
    };

    render() {
        const { size } = this.props;
        const FormWapper = this.getFormWapper();
        return (
            <div
                ref={(ref) => {
                    this.ref = ref;
                }}
                className={`ks-search-form ${size === 'small' ? ' ks-search-form-sm' : ''}`}
            >
                <FormWapper>
                    { this.renderSearchForm() }
                </FormWapper>
            </div>
        );
    }
};
