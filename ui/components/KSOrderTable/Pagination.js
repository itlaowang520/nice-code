import React, {Component} from 'react';
import PropTypes, { oneOfType } from 'prop-types';
import KSPagination from '../KSPagination';
import './index.scss';

export default class Pagination extends Component {

    static propTypes = {
        pagination: oneOfType([
            PropTypes.bool,
            PropTypes.object
        ])
    }

    render() {
        const { pagination } = this.props;
        if (!pagination) {
            return null;
        }
        return (
            <div className='order-table-pagination'>
                <KSPagination {...pagination}/>
            </div>
        );
    }
}
