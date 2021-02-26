import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Tooltip } from 'antd';

export default class KSTooltipLabel extends React.Component {
    static propTypes = {
        title: PropTypes.string,
        children: PropTypes.node,
        iconType: PropTypes.string
    }
    static defaultProps = {
        iconType: 'question-circle-o'
    }

    render() {
        const {
            title, iconType
        } = this.props;
        return (
            <span>
                {this.props.children}&nbsp;
                <Tooltip title={title}>
                    <Icon type={iconType} />
                </Tooltip>
            </span>
        );
    }
}
