import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Input, message } from 'antd';
let flag = false; // 是否修改
// eslint-disable-next-line no-useless-escape
const reg = new RegExp('[a-zA-z]+://[^\s]*');
export default class KSInput extends React.Component {

    static propTypes = {
        space: PropTypes.bool, // 是否去掉空格
        placeholder: PropTypes.string,
        value: PropTypes.any,
        onChange: PropTypes.func,
        onPressEnter: PropTypes.func,
        type: PropTypes.string,
        width: PropTypes.string
    }

    static defaultProps = {
        space: true,
        placeholder: '请输入',
        onChange: () => { },
        type: 'default'
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        // 是否修改，保持nextProps.value & prevState.newValue 一致
        if (nextProps.value && !prevState.newValue) {
            return {
                newValue: nextProps.value
            };
        } else if (!nextProps.value && prevState.newValue && flag) {
            return {
                newValue: prevState.newValue
            };
        } else if (nextProps.value && prevState.newValue && flag) {
            return {
                newValue: prevState.newValue
            };
        } else {
            return {
                newValue: nextProps.value
            };
        }
    }

    state = {
        newValue: this.props.value, // 当前input的值
        tooltip: false, // 错误信息提示
    }

    // 设置最新的值，onchange 出去
    setCurrentState = (value) => {
        this.setState({
            newValue: value
        }, () => {
            this.props.onChange(value);
        });
    }

    // 启用去空格功能
    onTrim = () => {
        const { newValue } = this.state;
        let currentValue = newValue;
        if (this.props.space) {
            if (!newValue) {
                return;
            }
            let reg = /(^\s*)|(\s*$)/g;
            currentValue = newValue.replace(reg, '');
        }
        this.setCurrentState(currentValue);
    }

    //  按下回车，之后的操作
    pressEnter = async() => {
        await this.handleBlur();
        await this.props.onPressEnter && this.props.onPressEnter();
    }

    // 设置提示
    handleBlur = () => {
        const { type } = this.props;
        const { tooltip, newValue: value } = this.state;
        switch (type) {
            case 'url':
                if (!reg.test(value) && !tooltip) {
                    message.error('请您输入正确的链接地址！');
                    this.setState({
                        newValue: undefined,
                        tooltip: true
                    });
                    this.setUrlErrorConfig();
                }
                if (reg.test(value)) {
                    this.setState({
                        tooltip: false
                    });
                    this.onTrim();
                }
                break;
            case 'default': this.onTrim(); break;
        }
    }

    // url 验证错误之后的操作
    setUrlErrorConfig = async() => {
        await this.props.onChange(undefined);
        await this.setState({
            tooltip: false
        });
    }

    // 实时输出数据
    handleChangeValue = () => {
        let timers = null; // eslint-disable-line no-unused-vars
        timers = setTimeout(() => {
            this.setCurrentState(this.state.newValue);
        }, 300);
    }

    render() {
        const { newValue } = this.state;
        const { placeholder } = this.props;
        const { space, ...OTHER_PROPS } = this.props;
        const config = {
            placeholder
        };
        const wh = this.props.width || '';
        return (
            <Fragment>
                <Input
                    {...OTHER_PROPS}
                    style={{ width: wh }}
                    allowClear
                    value={newValue}
                    {...config}
                    onBlur={() => {
                        this.handleBlur();
                        flag = false;
                    }}
                    onPressEnter={() => {
                        this.pressEnter();
                    }}
                    onChange={(e) => {
                        // 清空按钮的操作
                        if (!e.currentTarget.value) {
                            this.props.onChange(e.currentTarget.value);
                            this.setState({
                                tooltip: false,
                                newValue: undefined
                            });
                        } else {
                            flag = true;
                            this.setState({
                                newValue: e.currentTarget.value
                            });
                        }
                        this.handleChangeValue();
                    }}
                />
            </Fragment>
        );
    }
}
