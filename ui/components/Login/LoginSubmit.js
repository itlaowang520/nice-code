import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from 'antd';
import './index.scss';

const FormItem = Form.Item;

const LoginSubmit = ({ className, ...rest }) => {
    const clsString = `${className || ''} submit`;
    return (
        <FormItem>
            <Button size="large" className={clsString} type="primary" htmlType="submit" {...rest} />
        </FormItem>
    );
};

LoginSubmit.propTypes = {
    className: PropTypes.string, // 类名
};

export default LoginSubmit;
