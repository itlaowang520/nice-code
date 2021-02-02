import React, { Component } from 'react';
import { Icon } from 'ks-ui';
import './style.scss';
import PropTypes from 'prop-types';

export default class ExtendModal extends Component {

    static propTypes = {
        changeExtendStatus: PropTypes.func,
        navComponentList: PropTypes.any,
    }

    render() {
        const { changeExtendStatus, navComponentList } = this.props;
        return (
            <div className='extend-modal'>
                <div className='extend-modal-top'>
                    <p className='extend-modal-title'>切换楼层</p>
                    <div
                        className='extend-modal-icon'
                        onClick={
                            () => {
                                changeExtendStatus('hidden');
                            }
                        }
                    >
                        <Icon type="i-arrow-fold" style={{ fontSize: '2rem', color: '#999' }}/>
                    </div>
                </div>
                <div className='extend-modal-content'>
                    {
                        navComponentList
                    }
                </div>
            </div>
        );
    }
}
