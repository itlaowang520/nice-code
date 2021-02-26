import React from 'react';
import ReactEcharts from 'echarts-for-react';
import PropTypes from 'prop-types';

export default class KSCharts extends React.Component {
    static propTypes = {
        option: PropTypes.object
    }
    render() {
        return (
            <div>
                <ReactEcharts
                    {...this.props}
                    option={this.props.option}
                />
            </div>
        );
    }
}
