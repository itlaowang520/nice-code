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
        index: 0,
        pointDataSource: [], // 提示操作
        settingVisible: false, // 显示个性化配置
    }

    componentDidMount() {
        const { version, dataSource } = this.props;
        const { version: originVersion = '' } = getLocalStorage(KS_CMS_UI_CONFIG_KEY) || {};
        // 当前版本大于本地存储的版本，则显示1.5.5的引导
        if (versionTransform(version) > versionTransform(originVersion)) {
            const temp = dataSource.slice(dataSource.length - 1);
            this.setState({
                pointDataSource: temp
            }, () => {
                this.setState({
                    settingVisible: true
                }, () => {
                    mask(temp[0], { topSting: '100px' });
                });
            });
        } else if (versionTransform(version) === versionTransform(originVersion)) {
            this.finish();
        } else {
            this.setState({
                pointDataSource: dataSource
            }, () => {
                if (dataSource.length) {
                    this.next(this.state.index);
                }
            });
        }
    }

    /**
     * 下一步
     * @param {number} index
     */
    next = (index) => {
        const { pointDataSource } = this.state;
        const { selector = '' } = (pointDataSource[index] || {});
        /* 如果查找对应元素不存在的话则心就跟 */
        if (document.querySelector(selector)) {
            mask(pointDataSource[index]);
            this.setState({
                index
            });
        } else {
            /* 如果是最后一个元素 则直接结束 */
            if (index === pointDataSource.length - 1) {
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
        this.setState({
            settingVisible: false
        });
    }

    render() {
        // const { dataSource } = this.props;
        const { index, pointDataSource: dataSource, settingVisible } = this.state;
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
                {
                    settingVisible && <div
                        className="instructions-wrappper"
                    >
                        <div className="instructions-image">
                            <img src="https://tcdn.kaishustory.com/kstory/kms-common/image/4f1952bf-1751-4984-9e08-f0056d7b7975_info_w=107_h=92_s=4433.png"></img>
                        </div>
                    </div>
                }
            </div>
        );
    }
}
