import React from 'react';
import PropTypes from 'prop-types';
import { ReactSortable } from 'react-sortablejs';

export default class KSDnd extends React.Component {
    static propTypes = {
        type: PropTypes.string,
        children: PropTypes.node,
        className: PropTypes.string,
        style: PropTypes.object,
        dataSource: PropTypes.array,
        dragOver: PropTypes.func
    }
    static defaultProps = {
        dragOver: null,
        dragStart: null,
        className: '',
        style: {},
        dataSource: []
    };

    render() {
        const { style, className, children, dragOver } = this.props;
        let propsStyle = {
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            ...style,
        };
        return (
            <ReactSortable
                style={propsStyle}
                className={className}
                animation={200}
                list={children}
                setList={(result) => {
                    const prevKey = children.reduce((prev, item) => prev + item.key, '');
                    const currentKey = result.reduce((prev, item) => prev + item.key, '');
                    if (prevKey !== currentKey) {
                        const dataSource = result.map((item) => {
                            const { props } = item;
                            const data = props['data-source'] || '{}';
                            if (data !== '-1') {
                                return JSON.parse(data);
                            } else {

                            }
                        }).filter((item) => item);
                        dragOver(dataSource);
                    }
                }}
            >
                {
                    children
                }
            </ReactSortable>
        );
    }
}
