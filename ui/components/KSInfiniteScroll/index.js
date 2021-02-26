import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InfiniteScroll from './components/InfiniteScroll';
import './style.scss';

export default class KSInfiniteScroll extends Component {
    static propTypes = {
        children: PropTypes.node.isRequired,
        hasMore: PropTypes.bool,
        isReverse: PropTypes.bool,
        loadMore: PropTypes.func.isRequired,
        threshold: PropTypes.number,
        style: PropTypes.object,
        className: PropTypes.string,
    };

    static defaultProps = {
        hasMore: false,
        threshold: 200,
        isReverse: false,
    };

    getProps = () => {
        return {
            initialLoad: false,
            useWindow: false,
            ...this.props
        };
    }

    render() {
        const renderProps = this.getProps();
        delete renderProps.style;
        const { className = '', style = {} } = this.props;
        return (
            <div
                className={`ks-infinite-scroll-container ${className}`}
                style={{
                    ...style
                }}
            >
                <InfiniteScroll
                    {...renderProps}
                />
            </div>
        );
    }
}
