import React from 'react';
import PropTypes from 'prop-types';
import './index.scss';
import KSMobileTableRow from './KSMobileTableRow';
import KSPagination from '../KSPagination';
import { Spin } from 'antd';

export default class KSMobileTable extends React.PureComponent {
    static propTypes = {
        columns: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.bool,
        ]),
        dataSource: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.bool,
        ]),
        onChange: PropTypes.func,
        pagination: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.bool,
        ]),
        rowKey: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.func,
        ]),
        loading: PropTypes.bool,
        onrowClick: PropTypes.func,
        isMobile: PropTypes.bool
    }
    render() {
        const {
            columns,
            dataSource,
            onChange,
            pagination,
            rowKey,
            loading
        } = this.props;
        const props = {
            columns,
            onChange,
            pagination,
            rowKey,
            loading,
        };
        return (
            <div className='KSMobileTable'>
                {
                    loading && <div className='mobileTableLoading'>
                        <div className='positionCenter'>
                            <Spin/>
                        </div>
                    </div>
                }
                {
                    dataSource && dataSource.map((data) => {
                        return (
                            <KSMobileTableRow key={`row_${data[rowKey]}`} {...props} data={data}/>
                        );
                    })
                }
                {
                    pagination && <KSPagination style={{margin: '4px 0', float: 'right'}} {...pagination}/>
                }
            </div>
        );
    }
}
