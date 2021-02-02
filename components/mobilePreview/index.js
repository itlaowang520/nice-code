import React, { Component } from 'react';
import {
    Row, Col, Select
} from 'antd';
import Data from './data';
import InfoBar from './Components/InfoBar';
import PropTypes from 'prop-types';
import { reSizeRem, initEnsureRem } from './utils';
import './style.scss';

const Option = Select.Option;

export default class KSMobilePreview extends Component {
    static propTypes = {
        children: PropTypes.any, // 组件內的元素
        theme: PropTypes.string, // 主题色
        model: PropTypes.string,
        scaling: PropTypes.string,
        showMobileType: PropTypes.bool, // 手机模型类型
        showMobileScale: PropTypes.bool, // 缩放比例
        handleMolbileTopClick: PropTypes.func, // 顶部点击事件
    };
    static defaultProps = {
        theme: 'gray',
        model: 'iphone6',
        scaling: '80%',
        showMobileType: true,
        showMobileScale: true,
    }

    state = {
        theme: this.props.theme, // 主色调
        model: this.props.model, // 手机型号
        scaling: this.props.scaling, // 缩放比例
    }

    // 处理手机型号
    handleChangeModel = (value) => {
        const { scaling } = this.state;
        reSizeRem(Data[value][scaling].smallWidth);
        this.setState({
            model: value
        });
    };

    // 处理缩放比例
    handleChangeScaling = (value) => {
        const { model } = this.state;
        reSizeRem(Data[model][value].smallWidth);
        this.setState({
            scaling: value
        });
    };

    componentDidMount() {
        initEnsureRem();
    }

    render() {
        const { theme, model, scaling } = this.state;
        let currTheme;
        if (theme in Data) {
            currTheme = Data[theme];
        } else { // 若果传入没有定义的主题，展示默认主题
            currTheme = Data['gray'];
        }
        return (
            <div className="ksui-show-phone" style={{ width: `${Data[model][scaling].largeWidth * 1.2}px` }}>
                {
                    (this.props.showMobileType || this.props.showMobileScale) && <div className = "phone-tool-container">
                        <Row>
                            {
                                this.props.showMobileType && <Col span={12}>
                                    <Select defaultValue={model || 'iphone5'} size='small' onChange={this.handleChangeModel}>
                                        <Option value="iphone5">iPhone 5</Option>
                                        <Option value="iphone6">iPhone 6</Option>
                                    </Select>
                                </Col>
                            }
                            {
                                this.props.showMobileScale && <Col span={12}>
                                    <Select defaultValue={scaling || '100'} size='small' onChange={this.handleChangeScaling}>
                                        <Option value="100%">100%</Option>
                                        <Option value="95%">95%</Option>
                                        <Option value="90%">90%</Option>
                                        <Option value="85%">85%</Option>
                                        <Option value="80%">80%</Option>
                                        <Option value="75%">75%</Option>
                                    </Select>
                                </Col>
                            }
                        </Row>
                    </div>
                }
                <div className = "mobile-show-container">
                    <div className = "following-form" style={{ background: currTheme.mainColor, width: `${Data[model][scaling].largeWidth}px`, height: `${Data[model][scaling].largeHeight}px` }}>
                        <div className = "media-container" style={{ height: `${Data[model][scaling].largeHeight * 0.06}px` }}>
                            <div className = "photo" style={{
                                borderColor: currTheme.auxiliaryColor,
                                marginLeft: `${Data[model][scaling].largeWidth * 0.38}px`,
                            }}/>
                            <div className = "audio-feel">
                                <div className = "feel" style={{background: currTheme.auxiliaryColor}}/>
                                <div className = "audio" style={{
                                    background: currTheme.auxiliaryColor,
                                    width: `${Data[model][scaling].largeWidth * 0.14}px`,
                                }}/>
                            </div>
                        </div>
                        <div className = "content" id = "mobile" style = {{width: `${Data[model][scaling].smallWidth}px`, height: `${Data[model][scaling].smallHeight}px`}}>
                            <InfoBar handleMolbileTopClick={this.props.handleMolbileTopClick}/>
                            <div className="mobile-content">
                                <div className='mobile-content-scroll'>
                                    {
                                        this.props.children
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
