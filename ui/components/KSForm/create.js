import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';
import { ANTD_FORM_API_KEYS } from './constants';
import { compose, DEFAULT_HANDLER } from './utils';
import { mergeMiddleware, replaceMiddleware } from './middleware';

export default (config) => (HOC) => {
    /* 保留Form.create 支持的参数 */
    let formConfig = ANTD_FORM_API_KEYS.reduce((prev, key) => {
        if (config && config[key]) {
            prev[key] = config[key];
        }
        return prev;
    }, {});
    /* 依旧使用Form.create */
    return Form.create(formConfig)(
        class extends Component {
            static propTypes = {
                form: PropTypes.object
            }

            resultHandle = DEFAULT_HANDLER;

            constructor(props) {
                super(props);
                this.handleDealConfig(config);
            }

            /**
             * 统一处理配置， 对应配置增加对应中间件解析
             * @param {object} config //配置
             */
            handleDealConfig = (config = {}) => {
                let resultMiddleWare = [];
                const { merge, replace } = config;
                merge && resultMiddleWare.push({
                    handler: mergeMiddleware,
                    params: merge
                });
                replace && resultMiddleWare.push({
                    handler: replaceMiddleware,
                    params: replace
                });
                this.resultHandle = compose(resultMiddleWare);
            };

            /**
             * 重写部分Form校验方法
             * @param  {...any} ARGS 参数
             */
            validateFieldsAndScroll = (...ARGS) => {
                try {
                    const { validateFieldsAndScroll } = this.props.form;
                    ARGS = ARGS.map((arg) => {
                        if (typeof arg === 'function') {
                            return (err, fieldsValue) => {
                                const tempFieldsValue = this.resultHandle(JSON.parse(JSON.stringify(fieldsValue)));
                                arg(err, tempFieldsValue);
                            };
                        } else {
                            return arg;
                        }
                    });
                    validateFieldsAndScroll(...ARGS);
                } catch (e) {
                    console.log(e);
                }
            }

            render() {
                return <HOC
                    {...this.props}
                    form={{
                        ...this.props.form,
                        validateFieldsAndScroll: this.validateFieldsAndScroll
                    }}
                />;
            }
        }
    );
};
