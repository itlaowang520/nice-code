import React from 'react';
import { Icon } from 'antd';
import PropTypes from 'prop-types';
import './index.scss';
export default class KSContainer extends React.PureComponent {
    static propTypes = {
        expand: PropTypes.bool,
        defaultExpand: PropTypes.bool,
        title: PropTypes.node,
        children: PropTypes.node,
        onToggle: PropTypes.func,
        iconToggle: PropTypes.bool, // 只能点击icon触发展开或折起
    }
    constructor(props) {
        super(props);
        this.state = {
            expand: 'expand' in this.props ? this.props.expand : 'defaultExpand' in this.props ? this.props.defaultExpand : true
        };
    }

    static getDerivedStateFromProps(props, state) {
        if ('expand' in props) {
            return {
                expand: props.expand
            };
        } else {
            return null;
        }
    }

    render() {
        const { title, onToggle, iconToggle } = this.props;
        return (
            <div className='ks-container'>
                <div
                    className={this.state.expand ? 'ks-container-title' : 'ks-container-title title-hidden'}
                    onClick={() => {
                        if (iconToggle) { return; };
                        if (!('expand' in this.props)) {
                            this.setState({expand: !this.state.expand});
                        }
                        onToggle && onToggle(!this.state.expand);
                    }}
                >
                    { title }
                    <a className='toggle'>
                        <Icon
                            type="up-circle-o"
                            className={this.state.expand ? 'search-form-right-icon' : 'search-form-right-icon expand'}
                            onClick={() => {
                                if (!('expand' in this.props) && iconToggle) {
                                    this.setState({expand: !this.state.expand});
                                }
                                onToggle && onToggle(!this.state.expand);
                            }}
                        />
                    </a>
                </div>
                <div className={this.state.expand ? 'container' : 'container hidden'}>
                    {React.Children.toArray(this.props.children)}
                </div>
            </div>
        );
    }
}
