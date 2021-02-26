import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SketchPicker } from 'react-color';
import { findParent } from './utils';
import './index.scss';

export default class KSColorPicker extends Component {
    static propTypes = {
        value: PropTypes.string,
        onChange: PropTypes.func
    }

    state={
        visible: false,
    }

    handleOnChange = ({hex}) => {
        const { onChange } = this.props;
        onChange && onChange(hex);
        this.handleHideClick();
    }

    handleBodyClick = (e) => {
        if (!findParent('ks-color-picker-container', e.target) && !findParent('ks-color-picker', e.target)) {
            this.handleHideClick();
        }
    }

    handleShowClick = (e) => {
        this.setState({
            visible: true
        });
        document.body.addEventListener('click', this.handleBodyClick);
    }

    handleHideClick = () => {
        this.setState({
            visible: false
        });
        document.body.removeEventListener('click', this.handleBodyClick);
    }

    componentWillUnmount() {
        document.body.removeEventListener('click', this.handleBodyClick);
    }

    render() {
        const { visible } = this.state;
        const { value } = this.props;
        return (
            <div className='ks-color-picker'>
                <div
                    className='color-show-container'
                    style={{ backgroundColor: value }}
                    onClick={this.handleShowClick}
                ></div>
                {
                    visible && <div className='ks-color-picker-container'>
                        <SketchPicker
                            color={value}
                            className='color-picker'
                            onChange={this.handleOnChange}
                        />
                    </div>
                }
            </div>
        );
    }
}
