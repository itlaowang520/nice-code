import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';
import LoginItem from './LoginItem';
import LoginTab from './LoginTab';
import LoginSubmit from './LoginSubmit';
import './index.scss';

class Login extends Component {
    static defaultProps = {
        className: '',
        defaultActiveKey: '',
        onTabChange: () => {},
        onSubmit: () => {},
    };
    static propTypes = {
        className: PropTypes.string,
        defaultActiveKey: PropTypes.string,
        onTabChange: PropTypes.func,
        onSubmit: PropTypes.func,
        children: PropTypes.node,
        form: PropTypes.object
    };
    static childContextTypes = {
        tabUtil: PropTypes.object,
        form: PropTypes.object,
        updateActive: PropTypes.func,
    };
    state = {
        type: this.props.defaultActiveKey,
        tabs: [],
        active: {},
    };
    getChildContext() {
        return {
            tabUtil: {
                addTab: (id) => {
                    this.setState({
                        tabs: [...this.state.tabs, id],
                    });
                },
                removeTab: (id) => {
                    this.setState({
                        tabs: this.state.tabs.filter((currentId) => currentId !== id),
                    });
                },
            },
            form: this.props.form,
            updateActive: (activeItem) => {
                const { type, active } = this.state;
                if (active[type]) {
                    active[type].push(activeItem);
                } else {
                    active[type] = [activeItem];
                }
                this.setState({
                    active,
                });
            },
        };
    }
    onSwitch = (type) => {
        this.setState({
            type,
        });
        this.props.onTabChange(type);
    };
    handleSubmit = (e) => {
        e.preventDefault();
        const { active, type } = this.state;
        const { form } = this.props;
        const activeFileds = active[type];
        form.validateFields(activeFileds, { force: true }, (err, values) => {
            this.props.onSubmit(err, values);
        });
    };
    render() {
        const { className, children } = this.props;
        return (
            <div className={`${className || ''} login`}>
                <Form onSubmit={this.handleSubmit}>
                    {[...children]}
                </Form>
            </div>
        );
    }
}

Login.Tab = LoginTab;
Login.Submit = LoginSubmit;
Object.keys(LoginItem).forEach((item) => {
    Login[item] = LoginItem[item];
});

export default Form.create()(Login);
