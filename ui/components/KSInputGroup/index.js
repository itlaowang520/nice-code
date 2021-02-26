import React, { Component } from 'react';
import { Input, Button, Icon, message, Row, Col } from 'antd';
import { INITIAL_DATA } from './constants';
import { deepCopy, getRandomId } from './utils';
import PropTypes from 'prop-types';
import './style.scss';

export default class KSInputGroup extends Component {
    static propTypes = {
        onChange: PropTypes.func,
        mode: PropTypes.string, // 样式类型 row-一个一行 inline-行内
    }
    static defaultProps = {
        onChange: () => { },
        mode: 'inline'
    }

    state = {
        inputList: [ // input数组
            {
                ...INITIAL_DATA
            }
        ],
        isTouch: false
    }

    static getDerivedStateFromProps(props, state) {
        const { value } = props;
        const { isTouch } = state;
        if (!isTouch) {
            if (value && value.length) {
                return {
                    inputList: value
                };
            } else {
                return {
                    ...state
                };
            }
        } else {
            return {
                ...state
            };
        }
    };
    // 添加Input
    handleAddInput() {
        let newInputList = deepCopy(this.state.inputList);
        newInputList.push({
            ...INITIAL_DATA,
            key: getRandomId()
        });
        this.updateState(newInputList);
    }
    // 修改input值
    handleInputChange(currData, e) {
        let newInputList = deepCopy(this.state.inputList);
        (newInputList || []).forEach((input) => {
            if (input.key === currData.key) {
                input.value = e.target.value;
            }
        });
        this.updateState(newInputList);
    }
    // 清除input值
    handleClearInput(currData) {
        let newInputList = deepCopy(this.state.inputList);
        (newInputList || []).forEach((input) => {
            if (input.key === currData.key) {
                input.value = '';
            }
        });
        this.updateState(newInputList);
    }
    // 失去焦点检验重复数据
    handleInputBlur(currData) {
        let newInputList = deepCopy(this.state.inputList);
        if (newInputList.some((input) => input.value && input.value === currData.value && input.key !== currData.key)) {
            message.error(`${currData.value}已存在`);
            (newInputList || []).forEach((input) => {
                if (input.value && input.value === currData.value && input.key === currData.key) {
                    input.value = '';
                }
            });
        }
        this.updateState(newInputList);
    }
    // 更新state并返回最新数据
    updateState(newInputList) {
        this.setState({
            inputList: newInputList,
            isTouch: true
        }, () => {
            const { inputList } = this.state;
            this.props.onChange && this.props.onChange(inputList);
        });
    }

    render() {
        const { inputList } = this.state;
        const { mode } = this.props;
        if (mode === 'row') {
            return (
                <Row className="create-input-wrapper-row" type='flex' justify='space-between'>
                    {
                        (inputList || []).map((item) => <Col
                            span={20}
                            className="spec-value"
                            key={item.key}
                        >
                            <Input
                                placeholder={'请输入规格值'}
                                value={item.value}
                                onBlur={this.handleInputBlur.bind(this, item)}
                                onChange={this.handleInputChange.bind(this, item)}
                            ></Input>
                            <Icon
                                type="close-circle"
                                className="close-input-item"
                                onClick={this.handleClearInput.bind(this, item)}
                            />
                        </Col>)
                    }
                    <Col span={3}>
                        <Button
                            style={{ width: '100%' }}
                            className="input-add-button"
                            // className="input-add-button"
                            type="primary"
                            onClick={this.handleAddInput.bind(this)}
                        >
                            <Icon type="plus" />
                        </Button>
                    </Col>
                </Row>
            );
        }
        return (
            <div className='create-input-wrapper'>
                {
                    (inputList || []).map((item) => <div className="spec-value" key={item.key} >
                        <Input
                            placeholder={'请输入规格值'}
                            value={item.value}
                            onBlur={this.handleInputBlur.bind(this, item)}
                            onChange={this.handleInputChange.bind(this, item)}
                        ></Input>
                        <Icon
                            type="close-circle"
                            className="close-input-item"
                            onClick={this.handleClearInput.bind(this, item)}
                        />
                    </div>)
                }
                <Button
                    className="input-add-button"
                    type="primary"
                    onClick={this.handleAddInput.bind(this)}
                >
                    <Icon type="plus" />
                </Button>
            </div>
        );
    }
}
