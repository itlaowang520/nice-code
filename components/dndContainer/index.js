import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import PropTypes from 'prop-types';

export default class DndContainer extends React.PureComponent {

    static propTypes = {
        droppableId: PropTypes.string, // 唯一拖拽id
        direction: PropTypes.oneOf(['vertical', 'horizontal']), // 拖拽方向
        interval: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // 子组件间隔
        dataSource: PropTypes.array, // 需要排序的数据源
        onRender: PropTypes.func,
        onDragStart: PropTypes.func, // 拖拽开始事件
        onDragEnd: PropTypes.func // 拖拽结束事件
    }

    static defaultProps = {
        droppableId: 'drappable',
        direction: 'vertical',
        interval: 0,
        onDragStart: () => { },
        onDropEnd: () => { },
    }

    /**
     * 重新排序
     * @param {Array} list 需要重新排序的数组
     * @param {number} startIndex 旧的位置index
     * @param {number} endIndex 新的位置index
     */
    reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    }

    /**
     * 处理开始拖拽事件
     */
    handleDragStart = () => {
        this.props.onDragStart();
    }

    /**
     * 处理结束拖拽事件
     */
    handleDragEnd = (result) => {
        if (!result.destination) {
            return;
        }
        const dataSource = this.reorder(
            this.props.dataSource,
            result.source.index,
            result.destination.index
        );

        this.props.onDragEnd(dataSource, result);
    }

    render() {
        const { dataSource, direction, droppableId, interval, onRender } = this.props;
        return (
            <DragDropContext
                onDragEnd={this.handleDragEnd}
                onDragStart={this.handleDragStart}
            >
                <Droppable droppableId={droppableId} direction={direction}>
                    {
                        (provided, snapshot) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={`drappable-container ${snapshot.isDraggingOver ? 'draggingOver' : ''}`}
                            >
                                <React.Fragment>
                                    {
                                        dataSource.map((dataItem, index) => (
                                            <Draggable
                                                key={index}
                                                index={index}
                                                draggableId={`${droppableId}-${index}`}
                                            >
                                                {
                                                    (provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`draggable-container ${snapshot.isDragging ? 'isDragging' : ''}`}
                                                            style={{
                                                                display: `${direction === 'vertical' ? 'block' : 'inline-block'}`,
                                                                marginBottom: interval,
                                                                ...provided.draggableProps.style,
                                                            }}
                                                        >
                                                            {onRender(dataItem, index)}
                                                        </div>
                                                    )
                                                }
                                            </Draggable>
                                        ))
                                    }
                                    {provided.placeholder}
                                </React.Fragment>
                            </div>
                        )
                    }
                </Droppable>
            </DragDropContext>
        );
    }
}
