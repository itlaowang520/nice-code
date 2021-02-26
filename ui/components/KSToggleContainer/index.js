import React, { Component } from 'react';
import { Divider, Icon } from 'antd';
import PropTypes from 'prop-types';
import './style.scss';

export default class KSToggleContainer extends Component {
    static propTypes = {
        children: PropTypes.node,
        expand: PropTypes.bool,
        defaultExpand: PropTypes.bool,
        openText: PropTypes.string,
        closeText: PropTypes.string,
    }

    static defaultProps = {
        openText: '展开',
        closeText: '收起'
    }

    state = {
        expand: 'expand' in this.props
            ? this.props.expand
            : 'defaultExpand' in this.props
                ? this.props.defaultExpand
                : true
    }

    render() {
        const { children, openText, closeText } = this.props;
        return (
            <div className='ksToggleContainer'>
                <Divider>
                    <a
                        className='ksToggleContainer-text'
                        onClick={() => {
                            this.setState({expand: !this.state.expand});
                        }}
                    >
                        { !this.state.expand ? openText : closeText }
                        <Icon
                            type="up"
                            className={this.state.expand ? 'ksToggleContainer-icon' : 'ksToggleContainer-icon ksToggleContainer-expand'}
                        />
                    </a>
                </Divider>
                <div className={`${this.state.expand ? '' : 'ksToggleContainer-hidden'}`}>
                    {
                        children
                    }
                </div>
            </div>
        );
    }
}
