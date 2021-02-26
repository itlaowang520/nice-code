import React, { Component } from 'react';
import { Tooltip, Button, Tag, Icon } from 'antd';
import PropTypes from 'prop-types';
import KSDnd from './components/KSDnd';
import './style.scss';

export default class KSSelectTags extends Component {
    DndRef;

    static propTypes = {
        onChange: PropTypes.func, // 变化监听
        value: PropTypes.array, // 初始值
        showTagKey: PropTypes.string, // 展示在tag中的字段
        tagColor: PropTypes.string, // tag颜色
        node: PropTypes.node,
        disabled: PropTypes.bool, // 是否可编辑
    }

    static defaultProps = {
        showTagKey: 'name',
        tagColor: 'geekblue',
        node: <Button
            type='primary'
        >添加</Button>
    }

    static getDerivedStateFromProps(props, state) {
        const { value } = props;
        const { oldList } = state;
        if (JSON.stringify(value) !== JSON.stringify(oldList)) {
            return {
                dataList: value,
                oldList: value
            };
        }
        return null;
    }

    state = {
        dataList: [],
        oldList: []
    }

    componentDidMount() {
        const { disabled } = this.props;
        if (disabled) return;
        this.dndReRender();
    }

    /**
     * 更新组件值
     */
    updateChange() {
        const { dataList } = this.state;
        this.props.onChange && this.props.onChange(dataList);
    }

    /**
     * 处理选择内容改变回调
     */
    handleChange(value) {
        this.setState({
            dataList: value
        }, () => {
            this.dndReRender();
            this.updateChange();
        });
    }

    /**
     * 处理标签管理回调
     */
    handleDelete(removedKey) {
        this.setState({
            dataList: this.state.dataList.filter((data) => data.key !== removedKey)
        }, () => {
            this.dndReRender();
            this.updateChange();
        });
    }

    /**
     * 拖拽结束回调
     */
    dragOverHandle = (newList) => {
        this.setState({
            dataList: newList
        });
        this.updateChange();
        this.dndReRender();
    }

    /**
     * 强制重新渲染拖拽
     */
    dndReRender = () => {
        this.DndRef.reRender();
        setTimeout(() => {
            this.DndRef.setConfig();
        }, 200);
    }

    componentDidUpdate() {
        const { disabled } = this.props;
        if (!disabled) {
            this.dndReRender();
        }
    }

    render() {
        const { dataList } = this.state;
        const {
            showTagKey, tagColor, node, disabled
        } = this.props;
        if (disabled) {
            return <div>
                <div className='bizSelectTags-disabled-container'>
                    {
                        (dataList || []).map((data) => <div
                            key={data.key}
                            data-source={JSON.stringify(data)}
                            className='dnd-item'
                        >
                            <Tooltip title={data.record[showTagKey]}>
                                <Tag
                                    className='bizSelectTags-tagsContainer-item'
                                    style={{
                                        cursor: disabled ? 'pointer' : ''
                                    }}
                                    color={tagColor}
                                    closable={!disabled}
                                    onClose={this.handleDelete.bind(this, data.key)}
                                >
                                    {data.record[showTagKey]}
                                </Tag>
                            </Tooltip>
                        </div>)
                    }
                </div>
                <div style={{ display: 'inline-block' }}>
                    {node}
                </div>
            </div>;
        }
        return (
            <div>
                <KSDnd
                    style={{
                        width: 110,
                        height: 40
                    }}
                    colNumber={5}
                    dragOver={this.dragOverHandle}
                    onRefs={(ref) => {
                        this.DndRef = ref;
                    }}
                >
                    {
                        (dataList || []).map((data) => <div
                            key={data.key}
                            data-source={JSON.stringify(data)}
                            className='dnd-item'
                        >
                            <Tooltip title={data.record[showTagKey]}>
                                <Tag
                                    className='bizSelectTags-tagsContainer-item'
                                    color={tagColor}
                                >
                                    <div className='bizSelectTags-tagsContainer-text'>{data.record[showTagKey]}</div>
                                    <Icon
                                        type="close-circle"
                                        theme="twoTone"
                                        twoToneColor="#eb2f96"
                                        className='bizSelectTags-tagsContainer-close'
                                        onClick={this.handleDelete.bind(this, data.key)}
                                    />
                                </Tag>
                            </Tooltip>
                        </div>)
                    }
                </KSDnd>
                <div style={{ display: 'inline-block' }}>
                    {node}
                </div>
            </div>
        );
    }
}
