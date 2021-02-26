import React from 'react';
import { Col, Icon } from 'antd';
import PropTypes from 'prop-types';
import './index.scss';
import {
    getUrl,
    getFileSize
} from '../../utils';
import KSPreview from '../KSPreview';
import KSTableContent from '../KSTableContent';
import { SUPPORT_SUFFIX } from '../KSPreview/constants';
let count = 0, timer = null;
export default class FileItem extends React.Component {
    static propTypes = {
        rowKey: PropTypes.string,
        multiple: PropTypes.bool,
        disabled: PropTypes.bool,
        fileInfo: PropTypes.object,
        selectedList: PropTypes.array,
        onClickFunc: PropTypes.func,
        showKeys: PropTypes.object,
        onDblClickFunc: PropTypes.func,
    }

    /**
     * 选中附件点击事件监听
     * @param  {[type]} selectedRow [description]
     */
    handleClick = (selectedRow) => {
        if (this.props.disabled) return;
        count += 1;
        clearTimeout(timer);
        timer = setTimeout(() => {
            if (count === 1) {
                this.props.onClickFunc && this.props.onClickFunc(selectedRow);
            } else if (count === 2) {
                this.props.onDblClickFunc && this.props.onDblClickFunc(selectedRow);
            }
            count = 0;
        }, 300);
    }

    render() {
        const {
            rowKey,
            fileInfo,
            showKeys,
            selectedList,
            multiple,
            disabled
        } = this.props;
        const fileUrl = getUrl(fileInfo[showKeys.thumbUrl]);
        const urlSuffix = fileUrl.split('.').pop().toLowerCase();
        // const cdnUrl = fileInfo.cdnUrl;
        return (
            <Col xl={12} sm={24}>
                <div
                    className={`file-item ${disabled ? 'file-item-disabled' : ''} ${multiple ? 'multiple' : 'single'} ${selectedList && selectedList.includes(fileInfo[rowKey]) ? 'selected' : ''}`}
                    title={fileInfo[showKeys.name] ? fileInfo[showKeys.name] : ''}
                    onClick={() => { this.handleClick(fileInfo); }}
                >
                    <div>
                        {
                            !(SUPPORT_SUFFIX.includes(urlSuffix))
                                ? <Icon type="file-exclamation" theme="twoTone" className="file-item-file-exclamation"/>
                                : <div
                                    className="file-item-img"
                                >
                                    <KSPreview
                                        src={fileUrl}
                                        thumbnail
                                        id={fileInfo.fileId}
                                        style={{
                                            width: '55px',
                                            height: '55px'
                                        }}
                                    />
                                </div>
                        }
                    </div>
                    <div className="file-item-info">
                        <div className="file-title-info">
                            <KSTableContent content={fileInfo[showKeys.name] ? `${fileInfo[showKeys.name]}` : ''} copy={true} rows={1}/>
                            {/* <span className="title">
                                {fileInfo[showKeys.name] ? fileInfo[showKeys.name] : ''}
                            </span> */}
                            {/* <span className="duration float-right">
                                {fileInfo[showKeys.duration] ? fileInfo[showKeys.duration] : ''}
                            </span> */}
                        </div>
                        <div className="file-additional-info">
                            <span className="date">
                                {fileInfo[showKeys.createTime] ? fileInfo[showKeys.createTime] : ''}
                            </span>
                            <span className="size float-right">
                                {fileInfo[showKeys.size] ? getFileSize(fileInfo[showKeys.size]) : ''}
                            </span>
                        </div>
                    </div>
                </div>
            </Col>
        );
    }
};
