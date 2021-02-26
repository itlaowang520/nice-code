import React from 'react';
import PropTypes from 'prop-types';
import { Pagination } from 'antd';
import './index.scss';

export default class KSPagination extends React.Component {
    static propTypes = {
        onChange: PropTypes.func // 变更分页函数
    }

    /**
     * 展示总条数
     * @return {String} 返回展示的总条数
     */
    getTotal = (total, range) => `总共 ${total} 条`;

    /**
     * 分页数量变化监听
     * @param  {Number} current 当前页数
     * @param  {Number} size    变更后的分页数量
     */
    handelSizeChange = (current, size) => {
        // 强制当前页至为 1
        this.props.onChange(1, size, 'sizeChange');
    }
    render() {
        let props = {
            showQuickJumper: true,
            showSizeChanger: true,
            pageSizeOptions: ['10', '30', '50', '100'],
            defaultPageSize: 10,
            showTotal: this.getTotal,
            onShowSizeChange: this.handelSizeChange,
            ...this.props
        };
        delete props.size;
        return (
            <Pagination {...props}/>
        );
    }
};
