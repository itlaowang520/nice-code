import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './index.scss';

/**
 * 交换数组中的索引1和索引2的位置
 * @param {数组} arr
 * @param {索引1} index1
 * @param {索引2} index2
 */
const swap = function(arr, index1, index2) {
    const result = arr;

    [result[index1], result[index2]] = [result[index2], result[index1]];

    return result;
};

/**
 * 获取到有索引值的父节点
 * @param {当前节点} element
 */
const getRealParent = function(element) {
    if (!element) return element;

    if (element.className === 'ks-grid-dnd-item') {
        return element;
    } else {
        return getRealParent(element.parentNode);
    }
};

/**
 * 网格拖拽排序组件
 */
export default class KSGridDnd extends Component {

    static propTypes = {
        sortKey: PropTypes.string, // 用于排序的字段 默认使用index
        value: PropTypes.array, // 数据源
        column: PropTypes.number, // 列数
        width: PropTypes.number, // 指定宽度
        maxWidth: PropTypes.number, // 最大宽度
        minWidth: PropTypes.number, // 最小宽度
        margin: PropTypes.number, // 区块间隔
        onRender: PropTypes.func, // 每个item显示的渲染方法
        onChange: PropTypes.func // 顺序发生改变触发的回调
    }

    static getDerivedStateFromProps(nextProps) {
        // Should be a controlled component.
        if ('value' in nextProps) {
            return {
                dataSource: nextProps.value || []
            };
        }
        return null;
    }

    constructor(props) {
        super(props);

        this.state = {
            dataSource: props.value
        };

        this.isDrag = false;
        this.startIndex = 0;
        this.endIndex = 0;
    }

    componentDidMount() {
        this.setStyle();

        document.addEventListener('mousemove', this.handleDragMove);
        document.addEventListener('mouseup', this.handleDragEnd);
    }

    componentWillUnmount() {
        document.removeEventListener('mousemove', this.handleDragMove);
        document.removeEventListener('mouseup', this.handleDragEnd);
    }

    setStyle() {
        const { column, width, margin = 0 } = this.props;
        let { minWidth, maxWidth } = this.props;

        // 如果指定了宽度，则最小、最大宽度设置无效
        if (width) {
            minWidth = width;
            maxWidth = width;
        }

        const containerWidth = document.querySelector('.ks-grid-dnd-container').clientWidth;
        let itemWidth = Math.floor(parseInt((containerWidth - column * margin) / column, 10));

        this.wrapperStyle = {};

        // 设置间距
        this.itemStyle = {
            marginLeft: margin / 2,
            marginRight: margin / 2,
            marginTop: margin / 2,
            marginBottom: margin / 2
        };

        // 如果计算的itemWidth不在合理的区间，动态修改wrapper的宽度，使flex: 1的显示效果合理
        if (itemWidth > maxWidth) {
            this.itemStyle.width = maxWidth;
            this.wrapperStyle.width = column * (maxWidth + margin);
        } else if (itemWidth < minWidth) {
            this.itemStyle.width = minWidth;
            this.wrapperStyle.width = column * (minWidth + margin);
        } else {
            this.itemStyle.width = itemWidth;
            this.wrapperStyle.width = containerWidth;
        }

        // 因为样式属性只需要计算一次，所以不放在state里面
        this.forceUpdate();
    }

    handleDragStart = (e) => {
        e.preventDefault();
        this.startNode = e.currentTarget;
        this.startIndex = this.startNode.dataset.index;
        this.startX = e.pageX;
        this.startY = e.pageY;
        this.isDrag = true;

        this.movingNode = this.startNode.cloneNode(true);
        this.movingNode.className = 'ks-grid-dnd-moving-node';
        this.startNode.appendChild(this.movingNode);
    }

    handleDragMove = (e) => {
        e.preventDefault();
        if (!this.isDrag) return;

        this.moveX = e.pageX;
        this.moveY = e.pageY;

        this.movingNode.style.left = `${this.moveX - this.startX}px`;
        this.movingNode.style.top = `${this.moveY - this.startY}px`;
    }

    handleDragEnd = (e) => {
        if (!this.isDrag) {
            return;
        }

        this.startNode.removeChild(this.movingNode);
        this.isDrag = false;

        const {x, y} = {
            x: e.clientX,
            y: e.clientY
        };

        const element = document.elementFromPoint(x, y);
        const realParent = getRealParent(element);

        if (!realParent) {
            this.isDrag = false;
            return;
        }

        this.endIndex = realParent.dataset.index;

        if (this.startIndex !== this.endIndex) {
            const { onChange } = this.props;
            const dataSource = swap(this.state.dataSource, this.startIndex, this.endIndex);

            this.setState({
                dataSource
            });

            if (onChange) {
                onChange(dataSource);
            }
        }
    }

    render() {
        const { dataSource } = this.state;
        const { sortKey, onRender } = this.props;

        return (
            <div className="ks-grid-dnd-container">
                <ul className="ks-grid-dnd-wrapper" style={this.wrapperStyle}>
                    {dataSource.map((item, index) => {
                        let key;

                        if (item[sortKey]) {
                            key = item[sortKey];
                        } else {
                            key = index;
                        }

                        return (
                            <li
                                key={`ks-grid-dnd-item-${key}`}
                                className="ks-grid-dnd-item"
                                style={this.itemStyle}
                                onMouseDown={this.handleDragStart}
                                data-index={index}
                            >
                                {
                                    onRender(item, index)
                                }
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }
}
