import React from 'react';
import PropTypes from 'prop-types';
import './index.scss';
import { Icon } from 'antd';

export default class KSMobileTableRow extends React.PureComponent {

    static propTypes = {
        columns: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.bool,
        ]),
        data: PropTypes.object,
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
        isMobile: PropTypes.bool,
        isChild: PropTypes.bool
    }
    state = {
        isHidden: true
    }
    render() {
        const {
            columns,
            data,
            // onChange,
            // pagination,
            rowKey,
            // loading
        } = this.props;

        let blodColumns = columns && columns.length ? columns.filter((col) => col.alwaysShow) : [],
            normalColumns = columns && columns.length ? columns.filter((col) => !col.alwaysShow) : [];
        blodColumns = blodColumns.length ? blodColumns : columns && columns.length ? [columns[0]] : [];
        return (
            <div className={`tableRow ${this.props.isChild ? 'tableMarR' : ''}`}>
                {
                    blodColumns && blodColumns.map((col, idx) => {
                        return (
                            <div className={`${this.state.isHidden ? '' : 'bottomBoldLine'} colBold`} key={`${data[rowKey]}Bold_${idx}`}>
                                {col.title} : {col['render'] ? col.render(data[col['dataIndex']], data) : data[col['dataIndex']]}
                            </div>
                        );
                    })
                }
                {
                    !this.state.isHidden && normalColumns && normalColumns.map((col, idx) => {
                        return (
                            <div className='bottomLine' key={`${data[rowKey]}_${idx}`}>
                                {col.title} : {col['render'] ? col.render(data[col['dataIndex']], data) : data[col['dataIndex']]}
                            </div>
                        );
                    })
                }
                {
                    !this.state.isHidden && data.children && data.children.map((child) => {
                        return (
                            <KSMobileTableRow key={`child_${data[rowKey]}`} isChild={true} {...this.props} data={child}/>
                        );
                    })
                }
                <div
                    className='toggleIcon'
                    onClick={() => {
                        this.setState({
                            isHidden: !this.state.isHidden
                        });
                    }}
                >
                    <Icon
                        className={`iconPosCenter ${this.state.isHidden ? 'rotateIcon0' : 'rotateIcon180'}`}
                        type='down'
                        theme="outlined"/>
                </div>
            </div>
        );
    }
}
