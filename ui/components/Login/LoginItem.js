import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';
import map from './map';

const FormItem = Form.Item;

function generator({ defaultProps, defaultRules, type }) {
    return (WrappedComponent) => {
        return class BasicComponent extends Component {
            static propTypes = {
                name: PropTypes.string,
                onGetCaptcha: PropTypes.func,
                onChange: PropTypes.func,
                defaultValue: PropTypes.any,
                rules: PropTypes.array,
            };
            static contextTypes = {
                form: PropTypes.object,
                updateActive: PropTypes.func,
            };
            constructor(props) {
                super(props);
                this.state = {
                    count: 0,
                };
            }
            componentDidMount() {
                if (this.context.updateActive) {
                    this.context.updateActive(this.props.name);
                }
            }
            componentWillUnmount() {
                clearInterval(this.interval);
            }
            onGetCaptcha = () => {
                let count = 59;
                this.setState({ count });
                if (this.props.onGetCaptcha) {
                    this.props.onGetCaptcha();
                }
                this.interval = setInterval(() => {
                    count -= 1;
                    this.setState({ count });
                    if (count === 0) {
                        clearInterval(this.interval);
                    }
                }, 1000);
            };
            render() {
                const { getFieldDecorator } = this.context.form;
                const options = {};
                let otherProps = {};
                const { onChange, defaultValue, rules, name, ...restProps } = this.props;
                options.rules = rules || defaultRules;
                if (onChange) {
                    options.onChange = onChange;
                }
                if (defaultValue) {
                    options.initialValue = defaultValue;
                }
                otherProps = restProps || otherProps;
                return (
                    <FormItem>
                        {getFieldDecorator(name, options)(
                            <WrappedComponent {...defaultProps} {...otherProps} />
                        )}
                    </FormItem>
                );
            }
        };
    };
}

const LoginItem = {};
Object.keys(map).forEach((item) => {
    LoginItem[item] = generator({
        defaultProps: map[item].props,
        defaultRules: map[item].rules,
        type: item,
    })(map[item].component);
});

export default LoginItem;
