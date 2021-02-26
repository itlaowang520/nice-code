import React from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import './index.scss';
const { Option } = Select;

export default class KSSelect extends React.Component {
    static propTypes = {
        onChange: PropTypes.func, // 组件变更事件
    }

    render() {
        const props = {
            getPopupContainer: (triggerNode) => {
                return triggerNode.parentNode;
            }
        };
        return (
            <span>
                <Select
                    className='ks-select'
                    {...props}
                    {...this.props}
                />
            </span>
        );
    }
};

KSSelect.Option = Option;
