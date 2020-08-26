import React from 'react';
import './style.scss';
import PropTypes from 'prop-types';
export default class InfoBar extends React.Component {
    static propTypes = {
        handleMolbileTopClick: PropTypes.func, // 手机模型顶部点击事件回调
    }
    constructor(props) {
        super(props);
        const myDate = new Date();
        this.state = {
            hour: myDate.getHours() === 12 ? 12 : myDate.getHours() % 12,
            minutes: myDate.getMinutes(),
            timeFlag: myDate.getHours() < 12 ? '上午' : '下午'
        };
    };

    componentDidMount() {
        this.timeHandle();
        this.intervalTime = setInterval(() => {
            this.timeHandle();
        }, 1000);
    };
    componentWillUnmount() {
        clearInterval(this.intervalTime);
    };
    timeHandle = () => {
        let myDate = new Date(),
            hour = myDate.getHours() === 12 ? 12 : myDate.getHours() % 12,
            minutes = myDate.getMinutes(),
            timeFlag = myDate.getHours() < 12 ? '上午' : '下午';
        this.setState({
            hour: hour,
            minutes: minutes,
            timeFlag: timeFlag
        });
    };

    render() {
        const { hour, minutes, timeFlag } = this.state;
        const { handleMolbileTopClick } = this.props;
        return (
            <div className = "mobile-info-bar-activity">
                <div className = "mobile-info-bar-left">
                    <img src = "https://tcdn.kaishustory.com//kstory/activity_flow/image/b4affe2e-02f6-494f-9984-ebc902b42644.png" className = "xinhao"/>
                    <span>凯叔前端</span>
                    <img src = "https://tcdn.kaishustory.com//kstory/activity_flow/image/6c9d0b4d-aaf1-4645-b262-d361a0539807.png" className = "wifi"/>
                </div>
                <div className = "mobile-info-bar-right">
                    <span>80%</span>
                    <img src = "https://tcdn.kaishustory.com//kstory/activity_flow/image/2e8de0c5-56e2-4e72-ac78-08d3634aa001.png" className = "wifi"/>
                </div>
                <div
                    onClick={
                        () => {
                            handleMolbileTopClick && handleMolbileTopClick();
                        }
                    }
                    style={{
                        cursor: handleMolbileTopClick ? 'pointer' : ''
                    }}
                    className="mobile-info-bar-center">
                    {timeFlag}{hour}:{minutes < 10 ? `0${minutes}` : minutes}
                </div>
            </div>
        );
    }
}
