import React from 'react';
import moment from 'moment';
import { oneOf } from 'prop-types';
import { DatePicker } from 'antd';
import KSRangePicker from './KSRangePicker';
import { TIME_FORMAT, START_TIME, TIME_TYPE, END_TIME } from './constants';
const [START, END] = TIME_TYPE;

export default class KSDatePicker extends React.Component {
    static propTypes = {
        type: oneOf(TIME_TYPE)
    }
    static defaultProps = {
        type: START
    }

    getTimeConfig = () => {
        const { type } = this.props;
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

    render() {
        const props = {
            showTime: { defaultValue: this.getTimeConfig() }
        };
        return (
            <DatePicker
                {...props}
                {...this.props}
            />
        );
    }
};

KSDatePicker.RangePicker = KSRangePicker;
