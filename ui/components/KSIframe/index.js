import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { parse } from 'qs';
export default class KSIframe extends Component {

    static propTypes = {
        location: PropTypes.object
    }

    state = {
        width: document.documentElement.querySelector('.layoutContent').offsetWidth,
        height: document.documentElement.querySelector('.layoutContent').offsetHeight
    }

    componentDidMount() {
        window.addEventListener('resize', () => {
            this.setState({
                width: document.documentElement.querySelector('.layoutContent').offsetWidth,
                height: document.documentElement.querySelector('.layoutContent').offsetHeight
            });
        });
    }

    componentWillUnmount() {
        window.removeEventListener('resize', () => {});
    }

    render() {
        const { width, height } = this.state;
        const iframeLink = (parse(this.props.location.search.substring(1)) || {}).iframeLink;
        return (
            <div>
                <iframe
                    id="external-frame"
                    ref={(ref) => {
                        this.iframeRef = ref;
                    }}
                    src={iframeLink}
                    width={width}
                    height={height}
                    style={{ border: 'medium none' }}
                ></iframe>
            </div>
        );
    }
}
