import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { DatePicker } from 'antd';
import { TIME_FORMAT, START_TIME, TIME_TYPE, END_TIME } from './constants';
const { RangePicker } = DatePicker;
const [START, END] = TIME_TYPE;

export default class KSRangePicker extends React.Component {
    static propTypes = {
        type: PropTypes.array
    }
    static defaultProps = {
        type: [START, END]
    }

    getTime = (type) => {
        let time;
        switch (type) {
            case START:
                time = START_TIME;
                break;
            case END:
                time = END_TIME;
                break;
        }
        return moment(time, TIME_FORMAT);
    }

    getTimeConfig = () => {
        const { type } = this.props;
        return type.map((t) => this.getTime(t));
    }

    render() {
        const props = {
            showTime: { defaultValue: this.getTimeConfig() }
        };
        return (
            <RangePicker
                {...props}
                {...this.props}
            />
        );
    }
};
