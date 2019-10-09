import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import anchor from './utils';
import { Icon } from 'ks-ui';
import './style.scss';
import Swiper from 'react-id-swiper';
import ExtendModal from './extendModal/index';
export default class Anchor extends React.Component {
    static propTypes = {
        header: PropTypes.any, // 导航以上的页面元素
        footer: PropTypes.any, // 吸顶之外的元素
        children: PropTypes.array,
        navStyle: PropTypes.object, // navContainerStyle 导航栏样式、navContentStyle 导航栏字体样式、navActiveStyle 导航栏被选中字体样式
        isSlide: PropTypes.bool, // 是否支持左右滑动
        isExtend: PropTypes.bool, // 是否支持点击展开
    };
    static defaultProps = {
        navStyle: {

        }
    };

    constructor(props) {
        super(props);
        this.state = {
            tabIndex: 0,
            isFixed: false,
            scrollTop: 0,
            contentArray: [],
            extendStatus: 'hidden', // 展开状态，默认hidden
        };
    };
    // 监听页面滚动
    addScrollEvent = () => {
        let handleScroll = () => { anchor.onPageScroll(this, window.scrollY); };
        window.addEventListener('scroll', handleScroll);
        return function() {
            window.removeEventListener('scroll', handleScroll);
        };
    }
    // 获取内容区域高度
    getcontentArray =() => {
        let anchorClass = document.getElementsByClassName('anchor-content'), contentArray = [];
        for (let i = 0; i < anchorClass.length; i++) {
            contentArray.push(anchorClass[i].offsetHeight);
        }
        this.setState({
            contentArray: contentArray,
        }, () => {
            this.remoevScrollEvent = this.addScrollEvent();
        });
    }
    componentDidMount() {
        setTimeout(() => { this.getcontentArray(); }, 300);
    }
    componentWillUnmount() {
        this.remoevScrollEvent && this.remoevScrollEvent();
    }

    changeExtendStatus = (extendStatus) => {
        this.setState({
            extendStatus
        });
    }
    render() {
        const { isFixed, tabIndex, extendStatus } = this.state;
        const { header, footer, navStyle, isExtend, isSlide } = this.props;
        let swiperParams = {
            slidesPerView: 3.5,
            // spaceBetween: 10,
        };
        const navComponents = (
            <Fragment>
                {
                    React.Children.map(this.props.children, (element, index) => {
                        return (
                            <div
                                className='extend-modal-item'
                                onClick={() => {
                                    anchor.tabClick(this, index);
                                    this.changeExtendStatus('hidden');
                                }}
                                style={index === tabIndex ? {...navStyle.navActiveStyle} : {...navStyle.navContentStyle}}
                            >
                                {index === tabIndex ? <div className='current'><Icon type="i-buy-member" style={{ fontSize: '2rem', color: navStyle.navActiveStyle.color }}/></div> : null}
                                {element.props.name}
                            </div>
                        );
                    })
                }
            </Fragment>
        );
        return (
            <div className="anchor-page" onScrollY={(e) => { this.onPageScroll(e); }}>
                {/* 锚点 */}
                {this.header ? anchor.creatAnchorsDiv(this) : null}
                <div ref={(node) => { this.header = node; }}>
                    {header}
                </div>
                {/* nav部分 */}
                <div className='placeholder'>
                    <div
                        id={isFixed ? 'nav-fix' : 'nav'}
                        ref={(node) => { this.nav = node; }}
                        style={{ ...navStyle.navContainerStyle }}
                    >
                        {
                            extendStatus === 'show' &&
                            <ExtendModal
                                changeExtendStatus={this.changeExtendStatus}
                                navComponentList={navComponents}
                            />
                        }
                        {
                            // 是否支持滑动，支持就渲染一个Swiper，不支持直接告辞
                            isSlide ? <Fragment>
                                <Swiper
                                    {...swiperParams}
                                >
                                    {
                                        React.Children.map(this.props.children, (element, index) => {
                                            return (
                                                <div
                                                    onClick={() => { anchor.tabClick(this, index); }}
                                                    style={index === tabIndex ? {...navStyle.navActiveStyle} : {...navStyle.navContentStyle}}
                                                    className='nav-content'
                                                >
                                                    {
                                                        index === tabIndex ? <div className='current'>
                                                            <Icon type="i-buy-member" style={{ fontSize: '2rem', color: navStyle.navActiveStyle.color }} />
                                                        </div> : null
                                                    }
                                                    {element.props.name}
                                                </div>
                                            );
                                        })
                                    }
                                </Swiper>
                            </Fragment> : <Fragment>
                                {
                                    React.Children.map(this.props.children, (element, index) => {
                                        return (
                                            <div
                                                onClick={() => { anchor.tabClick(this, index); }}
                                                style={index === tabIndex ? {...navStyle.navActiveStyle} : {...navStyle.navContentStyle}}
                                                className='nav-content'
                                            >
                                                {
                                                    index === tabIndex ? <div className='current'>
                                                        <Icon type="i-buy-member" style={{ fontSize: '2rem', color: navStyle.navActiveStyle.color }} />
                                                    </div> : null
                                                }
                                                {element.props.name}
                                            </div>
                                        );
                                    })
                                }
                            </Fragment>
                        }
                        {
                            // 是否支持展开，支持就渲染一个小Icon，不支持直接告辞
                            isExtend ? <div
                                className='extend'
                                style={{ backgroundColor: navStyle.navContainerStyle.backgroundColor }}
                                onClick={
                                    () => {
                                        this.changeExtendStatus('show');
                                    }
                                }
                            >
                                <Icon type="i-arrow-unfold" style={{ fontSize: '2rem', color: '#999' }}/>
                            </div> : null
                        }
                    </div>
                </div>
                {/* 内容区 */}
                {
                    React.Children.map(this.props.children, (element) => {
                        return (React.createElement('div', { className: 'anchor-content' }, <React.Fragment>{element}</React.Fragment>));
                    })
                }
                {/* footer区 */}
                <div>
                    {footer}
                </div>
            </div>
        );
    }
};
