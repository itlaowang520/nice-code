import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Input, Button, message } from 'antd';
import './index.scss';

export default class KSInputTag extends React.Component {
    static propTypes = {
        value: PropTypes.array,
        onChange: PropTypes.func,
        isDisable: PropTypes.bool, // 是否可以编辑
        isDelete: PropTypes.bool, // 是否开启删除
        max: PropTypes.number, // 最大限制添加
        min: PropTypes.number, // 最小限制
    }
    static defaultProps = {
        isDisable: false,
        isDelete: true,
        value: [],
        min: 0
    }
    state = {
        otherSource: this.props.value, // 回显传递的数据 - 原始数据
        arr: [],
        a: 1,
        isTeach: false, // 是否点击添加
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const { isTeach, arr } = prevState;
        const { min, value } = nextProps;
        if (!isTeach) {
            let newState = null;
            // 默认是否会展示
            if (min > 0 && value.length === 0 && arr.length === 0) {
                let newArr = Array(min).fill(min).map((item, index) => {
                    return { value: '' };
                });
                newState = {
                    arr: [...newArr]
                };
            } else if (min > value.length) {
                let diffe = min - value.length,
                    newArr = Array(diffe).fill(diffe).map((item, index) => {
                        return { value: '' };
                    });
                newState = {
                    arr: [...value, ...newArr]
                };
            } else {
                // 默认没有
                newState = {
                    arr: [...value]
                };
            }
            return newState;
        }
        return null;
    }
    // 抛出
    throwOut = (value) => {
        this.props.onChange && this.props.onChange(value);
    }

    // 设置state中的值
    changeState = () => {
        const addList = [];
        addList.push({ value: '' });
        this.setState({
            isTeach: true,
            arr: [...this.state.arr, ...addList]
        }, () => {
            this.throwOut(this.state.arr);
        });
    }

    // 添加input
    handleAddInput = () => {
        const { arr: otherArr } = this.state;
        if ('max' in this.props) {
            let otherLen = otherArr.length;
            if (otherLen >= Number(this.props.max)) {
                message.warn(`最多添加${this.props.max}条！`);
            } else {
                this.changeState();
            }
        } else {
            this.changeState();
        }
    }
    // 修改组件值
    handleInputChange = (index, e) => {
        const addList = this.state.arr;
        addList[index].value = e.target.value;
        this.setState({
            isTeach: true,
            arr: addList
        }, () => {
            this.throwOut(this.state.arr);
        });
    }
    // 失去焦点 - 判断是否重复
    handleInputBlur = (index, e) => {
        const value = (e && e.target.value) || '';
        let { arr: dataSource } = this.state;
        if (value && dataSource.some((data, idx) => value === data.value && index !== idx)) {
            message.warn(` ${value} 已经存在`);
            dataSource[index] = { value: '' };
            this.setState({
                arr: dataSource
            }, () => {
                this.throwOut(this.state.arr);
            });
        }
    }

    render() {
        let { arr: list } = this.state;
        const { isDelete, min, isDisable } = this.props;
        return (
            <div className="create-input-wrapper">
                {
                    list && list.map((item, index) => (
                        <div className="spec-value" key={index} >
                            <Input
                                allowClear
                                disabled={isDisable}
                                value={item.value}
                                onBlur={this.handleInputBlur.bind(this, index)}
                                onChange={this.handleInputChange.bind(this, index)}
                            ></Input>
                            {
                                isDelete && <Icon
                                    type="close-circle"
                                    className="close-input-item"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (list.length > min) {
                                            list.splice(index, 1);
                                            this.setState({
                                                arr: [...list]
                                            }, () => {
                                                this.throwOut(this.state.arr);
                                            });
                                        } else {
                                            message.warn(`最少为${min}条！不能再删除了。`);
                                        }
                                    }}
                                />
                            }
                        </div>
                    ))
                }
                <Button
                    className="input-add-button"
                    type="primary"
                    onClick={this.handleAddInput}
                >
                    <Icon type="plus" />
                </Button>
            </div>
        );
    }
}
