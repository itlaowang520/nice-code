import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Descriptions } from 'antd';

const { Item } = Descriptions;

/**
 * 信息展示组件
 */
export default class KSInfoCard extends Component {

    static propTypes = {
        columns: PropTypes.array,
        data: PropTypes.object,
    }

    render() {
        const { columns, data } = this.props;
        return (
            <Descriptions bordered column={1}>
                {
                    columns && columns.map((column, index) => {
                        const { title, dataIndex, render } = column;
                        let content = data[dataIndex];
                        if (render) {
                            content = render(data[dataIndex], data);
                        }
                        return (
                            <Item key={index} label={title} span={3}>
                                {content}
                            </Item>
                        );
                    })
                }
            </Descriptions>
        );
    }
}
