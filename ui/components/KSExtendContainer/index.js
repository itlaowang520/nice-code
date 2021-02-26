import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Row, Col, Icon } from 'antd';
import KSDndContainer from '../KSDndContainer';
import { compareMenuData } from 'ks-cms-utils';
import './style.scss';

const { Item: FormItem } = Form;
/**
 * 搜索表单布局
 * @type {Object}
 */
const FORM_LAYOUT = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
    }
};
export default class KSExtendContainer extends Component {

    static propTypes = {
        form: PropTypes.object, // Form对象
        formKey: PropTypes.string, // 表单字段
        sortKey: PropTypes.string, // 排序字段
        components: PropTypes.array, // 组件配置
        isBorder: PropTypes.bool, // 是展示边框
        minLength: PropTypes.number, // 最少组数
        maxLength: PropTypes.number, // 最大组数
        initialValue: PropTypes.array, // 初始值
        isDnd: PropTypes.bool, // 是否支持拖拽
        isExtend: PropTypes.bool, // 是否可加减
        label: PropTypes.string, // 标签
    }

    id = 0;

    static defaultProps = {
        components: [],
        formKey: 'ksExtendValues',
        sortKey: '__keys',
        isBorder: true,
        minLength: 1,
        maxLength: 10,
        initialValue: [], // 初始数据
        isDnd: true,
        isExtend: true,
        label: '模块'
    }

    componentDidMount() {
        const { form, minLength, sortKey } = this.props;
        const { setFieldsValue } = form;
        const initialList = [...new Array(minLength).keys()].map((_, idx) => idx);
        this.id = initialList.length;
        setFieldsValue({
            [sortKey]: initialList
        });
    }

    componentDidUpdate(prevProps) {
        if (!compareMenuData(prevProps.initialValue, this.props.initialValue)) {
            const { initialValue, formKey, sortKey, components } = this.props;
            const { setFieldsValue } = this.props.form;
            const keyList = initialValue.map((_, idx) => this.id + idx);
            setFieldsValue({
                [sortKey]: keyList
            }, () => {
                // `${formKey}[${id}].${key}`;
                let setFieldsObject = keyList.reduce((prev, id, index) => {
                    const data = initialValue[index];
                    components.forEach(({key, defaultValue}) => {
                        prev[`${formKey}[${id}].${key}`] = (data[key] || data[key] === 0) ? data[key] : defaultValue;
                    });
                    return prev;
                }, {});
                setFieldsValue(setFieldsObject);
            });
            this.id = this.id + initialValue.length;
        }
    }

    /**
     * 添加结构
     */
    handleAdd(index) {
        const { form, maxLength, formKey, sortKey, components } = this.props;
        const { setFieldsValue, getFieldValue } = form;
        let keyDatas = getFieldValue(sortKey);
        if (keyDatas.length >= maxLength) { return; }
        keyDatas.splice(index + 1, 0, this.id++);
        setFieldsValue({
            [sortKey]: keyDatas,
        }, () => {
            const keyDatas = getFieldValue(sortKey);
            let setFieldsObject = keyDatas.reduce((prev, id) => {
                components.forEach(({ key, defaultValue }) => {
                    let newValue = getFieldValue(`${formKey}[${id}].${key}`);
                    if (defaultValue && newValue === defaultValue) {
                        prev[`${formKey}[${id}].${key}`] = defaultValue;
                    }
                });
                return prev;
            }, {});
            setFieldsValue(setFieldsObject);
        });
    }

    /**
     * 删除结构
     */
    handleDelete(index) {
        const { form, sortKey } = this.props;
        const { setFieldsValue, getFieldValue } = form;
        let oldKeyList = getFieldValue(sortKey);
        oldKeyList.splice(index, 1);
        setFieldsValue({
            [sortKey]: oldKeyList,
        });
    }

    /**
     * 重新排序
     * @param {Array} list 需要重新排序的数组
     * @param {number} startIndex 旧的位置index
     * @param {number} endIndex 新的位置index
     */
    reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    }

    /**
     * 拖拽处理数据
     */
    handleDrag(sourceIndex, targetIndex) {
        const { form, sortKey } = this.props;
        const { setFieldsValue, getFieldValue } = form;
        let keyList = getFieldValue(sortKey);
        keyList = this.reorder(
            keyList,
            sourceIndex,
            targetIndex
        );
        setFieldsValue({
            [sortKey]: keyList
        });
    }
    /**
     * 校验匹配规则
     */
    checkCondition(sourceValue, symbol, targetValue) {
        switch (symbol) {
            case '===':
                return sourceValue === targetValue;
            case '!==':
                return sourceValue !== targetValue;
            case '>':
                return sourceValue > targetValue;
            case '<':
                return sourceValue < targetValue;
            case '>=':
                return sourceValue >= targetValue;
            case '<=':
                return sourceValue <= targetValue;
            case 'includes':
                return sourceValue && sourceValue.includes(targetValue);
        }
    }

    render() {
        const {
            form, formKey, components,
            isBorder, minLength, sortKey,
            isDnd, isExtend, label
        } = this.props;
        const { getFieldDecorator, getFieldValue } = form;
        getFieldDecorator(sortKey, { initialValue: [] });
        const keyList = getFieldValue(sortKey);
        if (!isDnd) { // 如果不支持拖砖
            return <div>
                {
                    keyList.map((id, index) => {
                        return <Row
                            key={`${index}_${id}`}
                            className='ksExtendContainer'
                            type='flex'
                            justify='space-between'
                            align='middle'
                            style={{
                                border: isBorder ? '' : 'none'
                            }}
                        >
                            <div className='ksExtendContainer-label'>{ `${label} ${index + 1}` }</div>
                            <Col span={18}>
                                {
                                    components.map(({ label, key, rules, condition, component, render, defaultValue, extra }) => {
                                        if (render) { return render(); }
                                        const currKey = `${formKey}[${id}].${key}`;
                                        if (condition) {
                                            let otherCondition = true;
                                            if ('custom' in condition) {
                                                otherCondition = !!condition.custom;
                                            }
                                            if (!this.checkCondition(getFieldValue(`${formKey}[${id}].${condition.key}`), condition.symbol, condition.value) || !otherCondition) {
                                                return null;
                                            }
                                        }
                                        return (<FormItem
                                            key={key}
                                            label={label}
                                            extra={extra}
                                            {...FORM_LAYOUT}
                                        >
                                            {
                                                getFieldDecorator(currKey, {
                                                    rules: [...rules],
                                                    initialValue: defaultValue
                                                })(
                                                    component
                                                )
                                            }
                                        </FormItem>);
                                    })
                                }
                            </Col>
                            {
                                isExtend && <Col span={5} align='right'>
                                    <Icon
                                        type="plus-circle"
                                        style={{fontSize: '18px'}}
                                        theme="twoTone"
                                        twoToneColor="#108ee9"
                                        onClick={this.handleAdd.bind(this, index)}
                                    />
                                    {
                                        keyList.length > minLength && <Icon
                                            className='mar-l-4'
                                            type="minus-circle"
                                            style={{fontSize: '18px'}}
                                            theme="twoTone"
                                            twoToneColor="#eb2f96"
                                            onClick={this.handleDelete.bind(this, index)}
                                        />
                                    }
                                </Col>
                            }
                        </Row>;
                    })
                }
            </div>;
        }
        return (
            <div>
                <KSDndContainer
                    id='ksDndContainer'
                    dataSource={keyList}
                    onRender={(id, index) => {
                        return <Row
                            key={`${index}_${id}`}
                            className='ksExtendContainer'
                            type='flex'
                            justify='space-between'
                            align='middle'
                            style={{
                                border: isBorder ? '' : 'none'
                            }}
                        >
                            <div className='ksExtendContainer-label'>{ `${label} ${index + 1}` }</div>
                            <Col span={18}>
                                {
                                    components.map(({ label, key, rules, condition, component, render, defaultValue, extra }) => {
                                        if (render) { return render(); }
                                        const currKey = `${formKey}[${id}].${key}`;
                                        if (condition) {
                                            let otherCondition = true;
                                            if ('custom' in condition) {
                                                otherCondition = !!condition.custom;
                                            }
                                            if (!this.checkCondition(getFieldValue(`${formKey}[${id}].${condition.key}`), condition.symbol, condition.value) || !otherCondition) {
                                                return null;
                                            }
                                        }
                                        return (<FormItem
                                            key={key}
                                            label={label}
                                            extra={extra}
                                            {...FORM_LAYOUT}
                                        >
                                            {
                                                getFieldDecorator(currKey, {
                                                    rules: [...rules],
                                                    initialValue: defaultValue
                                                })(
                                                    component
                                                )
                                            }
                                        </FormItem>);
                                    })
                                }
                            </Col>
                            <Col span={5} align='right'>
                                <Icon
                                    type="plus-circle"
                                    style={{fontSize: '18px'}}
                                    theme="twoTone"
                                    twoToneColor="#108ee9"
                                    onClick={this.handleAdd.bind(this, index)}
                                />
                                {
                                    keyList.length > minLength && <Icon
                                        className='mar-l-4'
                                        type="minus-circle"
                                        style={{fontSize: '18px'}}
                                        theme="twoTone"
                                        twoToneColor="#eb2f96"
                                        onClick={this.handleDelete.bind(this, index)}
                                    />
                                }
                            </Col>
                        </Row>;
                    }}
                    onDragStart = {() => { }}
                    onDragEnd={(_, result) => {
                        this.handleDrag(result.source.index, result.destination.index);
                    }}
                />
            </div>
        );
    }
}
