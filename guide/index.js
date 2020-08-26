import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { mask, versionTransform } from './utils';
import { getLocalStorage, setLocalStorage } from 'ks-cms-utils';
import './style.scss';

const KS_CMS_UI_CONFIG_KEY = 'ks-cms-ui';

export default class KSGuide extends Component {
    static propTypes = {
        dataSource: PropTypes.array,
        version: PropTypes.string, // 版本号
    }

    state = {
        index: 0
    }

    componentDidMount() {
        const { version } = this.props;
        const { version: originVersion = '' } = getLocalStorage(KS_CMS_UI_CONFIG_KEY) || {};
        if (versionTransform(version) > versionTransform(originVersion)) {
            const { dataSource } = this.props;
            if (dataSource.length) {
                this.next(this.state.index);
            }
        }
    }

    /**
     * 下一步
     * @param {number} index
     */
    next = (index) => {
        const { dataSource } = this.props;
        const { selector = '' } = (dataSource[index] || {});
        /* 如果查找对应元素不存在的话则心就跟 */
        if (document.querySelector(selector)) {
            mask(dataSource[index]);
            this.setState({
                index
            });
        } else {
            /* 如果是最后一个元素 则直接结束 */
            const { dataSource } = this.props;
            if (index === dataSource.length - 1) {
                this.finish();
            } else {
                this.next(index + 1);
            }
        }
    }

    /**
     * 结束
     */
    finish = () => {
        setLocalStorage(KS_CMS_UI_CONFIG_KEY, {
            version: this.props.version
        });
    }

    render() {
        const { dataSource } = this.props;
        const { index } = this.state;
        return (
            <div id='mask' className='guide-mask'>
                <div className='guide-mask-tip'>
                    <span
                        id="mask-desc"
                        className="mask-tip-desc"
                    ></span>
                    {
                        !!dataSource.length && index !== dataSource.length - 1 && <button
                            id="mask-btn-next"
                            className="mask-tip-btn"
                            onClick={() => {
                                this.next(index + 1);
                            }}
                        >下一步</button>
                    }
                    <button
                        id="mask-btn-ignore"
                        className="mask-tip-btn mar-l-4"
                        onClick={() => {
                            mask();
                            this.finish();
                        }}
                    >朕已阅</button>
                </div>
            </div>
        );
    }
}
