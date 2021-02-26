import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { DEFAULT_WIDTH } from './utils';

export default class Title extends Component {

    static propTypes = {
        columns: PropTypes.array, // 表头设置
        parentWidth: PropTypes.number, // 父级宽度
        calcType: PropTypes.string, // 计算类型
    }

    render() {
        let { columns } = this.props;
        return (
            <thead>
                <tr>
                    {
                        columns && columns.map(({title, width}) => {
                            return (
                                <th
                                    style={{minWidth: width || DEFAULT_WIDTH}}
                                    key={title}
                                >{title}</th>
                            );
                        })
                    }
                </tr>
            </thead>
        );
    }
}
