import React, { Component, isValidElement } from 'react';
import PropTypes, { oneOfType } from 'prop-types';
import { Row, Col, Form } from 'antd';
import KSIcon from '../KSIcon';
import './index.scss';
const FormItem = Form.Item;

/**
 * 搜索表单布局
 * @type {Object}
 */
export const SEARCH_FORM_LAYOUT = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
    }
};

export default class KSSearchForm extends Component {
    static propTypes = {
        form: PropTypes.object,
        col: PropTypes.number, // 列宽 max：24
        components: PropTypes.array, // 搜索项列表
        actions: oneOfType([
            PropTypes.node,
            PropTypes.object
        ]), // 按钮节点
        defaultExtend: PropTypes.bool, // 默认展开|闭合
        extend: PropTypes.bool, // 展开|闭合状态
        onExtend: PropTypes.func, // 切换展开事件回掉
        bottom: PropTypes.number, // formItem的marginBottom 数量
        split: PropTypes.number, // 分割数
    }

    static defaultProps = {
        col: 7,
        split: 3,
        bottom: 6,
        form: {
            getFieldDecorator: (key) => (component) => component
        },
        defaultExtend: true
    }

    state = {
        extend: this.props.defaultExtend
    }

    renderSearchItem = (item, hide) => {
        const { form, col, bottom } = this.props;
        const { getFieldDecorator } = form;
        const { col: itemCol, render } = item;
        if (render) {
            return render();
        } else {
            if (!item.title) {
                SEARCH_FORM_LAYOUT.wrapperCol.sm = 24;
            } else {
                SEARCH_FORM_LAYOUT.wrapperCol.sm = 16;
            }
            return <Col key={item.key} span={itemCol || col}>
                <FormItem
                    {...SEARCH_FORM_LAYOUT}
                    style={{marginBottom: bottom}}
                    label={item.title}
                    className={hide ? 'hide-item' : ''}
                >
                    {
                        getFieldDecorator(item.key, (item.options || {}))(item.component)
                    }
                </FormItem>
            </Col>;
        }
    }

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
    }

    /**
     * 渲染搜索布局
     */
    renderSeachForm = () => {
        const { components, split, actions, col, onExtend, bottom } = this.props;
        let actionNode = isValidElement(actions) || Array.isArray(actions) ? actions : actions.component;
        if (!components.length) {
            return <Row type='flex' justify='end' style={{marginBottom: '5px'}}>
                {actionNode}
            </Row>;
        }

        let dataSource = components.reduce((prev, record) => {
                let length = prev.length,
                    lastItem = prev[length - 1];
                if (lastItem && lastItem.length < split) {
                    lastItem.push(record);
                } else {
                    prev.push([record]);
                }
                return prev;
            }, []),
            lastGroup,
            actionStyle = {},
            isExtend = components.length > split,
            extend = 'extend' in this.props ? this.props.extend : this.state.extend;

        /* 计算最后一行 及 数量 */
        if (dataSource[dataSource.length - 1].length === split) {
            lastGroup = [];
        } else {
            lastGroup = dataSource.pop();
        }
        const remainder = lastGroup.length % split; // 余数

        /* 组件重写 align */
        if ('align' in actions) {
            actionStyle = {
                ...actionStyle,
                textAlign: actions['align'],
            };
        } else if (!dataSource.length && remainder <= split - 1) {
            actionStyle = {
                ...actionStyle,
                textAlign: 'left',
            };
        }

        const { name, type } = this.getExtend(extend);
        return <div className='kssearchform'>
            {
                dataSource.map((group, index) => {
                    return <Row key={index} className={isExtend && index > 0 && !extend ? 'extend' : ''} gutter={4}>
                        {
                            group.map((item) => this.renderSearchItem(item, isExtend && index > 0 && !extend))
                        }
                    </Row>;
                })
            }
            <Row gutter={4}>
                {
                    lastGroup.map((item) => this.renderSearchItem(item, isExtend && !extend))
                }
                <Col
                    span={actions.col || (isExtend && !extend ? col * split : col * (split - remainder))}
                    align={'right'}
                    style={actionStyle}
                >
                    <FormItem
                        className={!extend && remainder > 0 && dataSource.length > 0 ? 'extend-more' : ''}
                        style={{
                            marginBottom: bottom,
                        }}
                    >
                        {
                            isExtend && <span>
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
            </Row>
        </div>;
    }

    render() {
        return (
            <div>
                {this.renderSeachForm()}
            </div>
        );
    }
}
