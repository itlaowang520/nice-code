import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import './index.scss';
import { Icon, notification } from 'antd';
// import { getUniqueID } from '../../utils';
import KSDnd from '../KSDnd';
import UploadItem from './../KSUpload/UploadItem';
import SelectModal from './SelectModal';

export default class KSSelectUpload extends React.Component {
    static propTypes = {
        children: PropTypes.node, // 上传按钮
        uploadType: PropTypes.string, // 上传类型 图片：picture-card / 文字：text
        uploadText: PropTypes.string, // 上传图片样式时的文字
        value: PropTypes.array, //
        fileMax: PropTypes.number, // 可上传的最大文件数
        visible: PropTypes.bool, // modal的显示隐藏
        visibleChange: PropTypes.func, // 显隐变更事件
        fileTitle: PropTypes.string, // 搜索title展示
        rowKey: PropTypes.string,
        dataSource: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.bool,
        ]), // 数据集
        pagination: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.bool,
        ]), // 分页信息
        multiple: PropTypes.bool, // multiple/single
        accept: PropTypes.string,
        acceptType: PropTypes.string, // 自定义限制类型
        onSearch: PropTypes.func,
        onChange: PropTypes.func,
        onClick: PropTypes.func, // 点击事件
        upload: PropTypes.object,
        fillName: PropTypes.bool,
        selectDir: PropTypes.bool,
        showKeys: PropTypes.object,
        disabled: PropTypes.bool,
        validators: PropTypes.array,
        isDragable: PropTypes.bool, // 是否可以拖拽
        fileSize: PropTypes.number, // 文件大小
        withSelect: PropTypes.bool, // 不要选择功能
        withUpload: PropTypes.bool, // 不要上传功能
        dndStyle: PropTypes.object, // 拖拽样式
    };
    static defaultProps = {
        withSelect: true,
        withUpload: true,
        value: [],
        rowKey: 'cdnUrl',
        multiple: true,
        uploadType: 'picture-card',
        uploadText: 'Upload',
        dataSource: [],
        validators: [],
        showKeys: {
            thumbUrl: 'cdnUrl',
            name: 'name',
            // duration: 'duration',
            size: 'size',
            createTime: 'createTime'
        },
        isDragable: true,
        dndStyle: {
            height: 104
        }
    };

    state = {
        visible: false, // 选择modal
        fileList: this.props.value || [],
        fileMax: this.props.multiple ? this.props.fileMax || 2 : this.props.fileMax || 1,
    };

    constructor(props) {
        super(props);
        if (!props.withSelect && !props.withUpload) {
            notification.error({
                message: '属性传值有误',
            });
            throw new Error('withSelect 和 withUpload 两个属性不能同时为 false');
        }
    }

    static getDerivedStateFromProps(props) {
        if ('value' in props) {
            let { value, showKeys } = props;
            return {
                fileList: (value && value.map((item) => ({
                    ...item,
                    name: item[showKeys.name],
                    thumbUrl: item[showKeys.thumbUrl],
                    url: item[showKeys.thumbUrl],
                    cdnUrl: item[showKeys.thumbUrl],
                    percent: 100,
                    status: ''
                }))) || []
            };
        }
    }

    /**
     * 点击弹出上传框
     */
    handleClick = () => {
        const { disabled, onClick } = this.props;
        if (!disabled) {
            onClick && onClick(); // 点击事件
            this.setState({
                visible: true
            });
        }
    }

    // 重置状态
    handleReset = () => {
        this.setState({
            visible: false
        });
        if (this.props.visible) {
            this.props.visibleChange && this.props.visibleChange(false);
        }
    }

    /**
     * 搜索事件监听
     */
    handleOnSearch = (searchValue) => {
        this.props.onSearch && this.props.onSearch(searchValue);
    }

    /**
     * 选中事件
     */
    handleSelected = (selectedRows) => {
        const { showKeys } = this.props;
        const { fileMax } = this.state;
        if (selectedRows.length > 0) {
            selectedRows = selectedRows.length > fileMax ? selectedRows.slice(0, fileMax) : selectedRows;
            // 如果是上传而来
            let list = [];
            if ('resource' in selectedRows[0] && selectedRows[0]['resource'] === 'upload') {
                selectedRows.forEach((item) => {
                    let fileItem = {
                        ...item,
                        name: item['name'] || item['fileName'],
                        thumbUrl: item['cdnUrl'],
                        url: item['cdnUrl'],
                        cdnUrl: item['cdnUrl'],
                        percent: 100,
                        status: ''
                    };
                    list.push(fileItem);
                });
            } else { // 如果是选择而来
                selectedRows.forEach((item) => {
                    let fileItem = {
                        ...item,
                        name: item[showKeys.name],
                        thumbUrl: item[showKeys.thumbUrl],
                        url: item[showKeys.thumbUrl],
                        cdnUrl: item[showKeys.thumbUrl],
                        percent: 100,
                        status: ''
                    };
                    list.push(fileItem);
                });
            }
            this.setState({
                fileList: this.state.fileList.concat(list)
            });
            this.props.onChange && this.props.onChange(selectedRows, this.state.fileList.concat(list));
        }
    };

    /**
     * 删除事件
     */
    onRemove = (file) => {
        const { onChange } = this.props;
        let fileList = this.state.fileList;
        const index = fileList.indexOf(file);
        const newFileList = [...fileList];
        const removeItem = newFileList.splice(index, 1);
        this.setState({
            fileList: newFileList
        });
        onChange && onChange(removeItem, newFileList);
    };

    /**
     * 拖拽结束事件
     */
    dragOverHandle = (newList) => {
        const { onChange } = this.props;
        onChange && onChange({}, [...newList]);
    };

    /**
     * 渲染已经上传附件
     */
    renderFileItem = (isAddButton) => {
        const {
            uploadType,
            uploadText,
            children,
            disabled,
        } = this.props;
        const { fileMax, fileList } = this.state;
        /* add 按钮 */
        const uploadBtn = <div className={disabled ? 'add-file add-file-disabled' : 'add-file'}>
            <div className='add-file-center'>
                <Icon type="plus" />
                <div className="ant-upload-text">{uploadText}</div>
            </div>
        </div>;

        let result = [];
        result = fileList.map((file, index) => {
            return (
                <div
                    key={`${file.uid || file.fileId || file.id || file.url}_${index}`}
                    data-source={JSON.stringify(file)}
                >
                    <UploadItem
                        file={file}
                        disabled={this.props.disabled}
                        onRemove={this.onRemove.bind(file)}
                    />
                </div>
            );
        });
        if (isAddButton) {
            /* 上传按钮 */
            result.push(<div
                key={-1}
                data-source={JSON.stringify(-1)}
                className={`ks-upload ks-upload-select ks-upload-select-${uploadType}`}
                onClick={this.handleClick}
            >
                {fileList.length >= fileMax ? null : (children || uploadBtn)}
            </div>);
        }
        return result;
    };

    /* 是否可以拖拽 */
    getDragContent = () => {
        const { isDragable, dndStyle } = this.props;
        const { fileMax, fileList } = this.state;
        if (isDragable && fileList.length) {
            /* 已经上传附件展示 */
            return (
                <KSDnd
                    style={{
                        ...dndStyle,
                    }}
                    dragOver={this.dragOverHandle}
                >
                    {this.renderFileItem(fileList.length < fileMax)}
                </KSDnd>
            );
        } else {
            return (
                <Fragment>
                    {this.renderFileItem(fileList.length < fileMax)}
                </Fragment>
            );
        }
    };

    render() {
        const { fileMax, fileList } = this.state;
        let visible = 'visible' in this.props ? this.props.visible : this.state.visible;
        return (
            <div>
                {
                    this.getDragContent()
                }
                {/* 上传弹框 */}
                {
                    visible && <SelectModal
                        currLen={(fileList && fileList.length) || 0}
                        fileMax={fileMax}
                        fileList={fileList}
                        visible={visible}
                        {...this.props}
                        visibleChangeFunc={this.handleReset}
                        onSearchFunc={this.handleOnSearch}
                        onSelectFunc={this.handleSelected}
                        cancelFunc={this.handleReset}
                    />
                }
            </div>
        );
    }

}
