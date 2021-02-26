import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Tooltip, Progress } from 'antd';
import { getUrl } from '../../utils';
import './index.scss';
import KSPreview from '../KSPreview';
export default class UploadItem extends React.Component {
    static propTypes = {
        file: PropTypes.object,
        onRemove: PropTypes.func,
        disabled: PropTypes.bool,
    }

    /**
     * 根据file的状态获取对应类名
     * @param  {Object} file // 附件
     * @return {String}     // 类名
     */
    getFileClassName(file) {
        switch (`${file.status}`) {
            case 'error':
                return 'file file-error';
            default:
                return 'file';
        }
    }

    render() {
        const { file, onRemove, disabled } = this.props;
        const fileClassName = this.getFileClassName(file);
        const isUploading = file.status === 'uploading';
        const fileUrl = getUrl(file.thumbUrl || file.url);
        const urlSuffix = fileUrl.split('.').pop().toLowerCase();
        return (
            <Tooltip
                title={file.name}
                mouseEnterDelay={0.6}
                placement='bottom'
                align={{offset: [0, -10]}}
            >
                <div className={fileClassName}>
                    <div className='file-info'>
                        {
                            !['svga'].includes(urlSuffix) && <div>
                                <div className='file-mask'></div>
                                <div className='file-action'>
                                    <Icon type='eye' onClick={() => {
                                        window.open(file.url, '_blank');
                                    }}/>
                                </div>
                            </div>
                        }
                        {
                            !['svga'].includes(urlSuffix)
                                ? <img className='file-thumbnail' src={fileUrl} alt={file.name} />
                                : <div
                                    className='file-thumbnail'
                                >
                                    <KSPreview
                                        src={fileUrl}
                                        thumbnail
                                        id={file.fileId}
                                        style={{
                                            width: '100%',
                                            height: '80%'
                                        }}
                                    />
                                </div>
                        }
                    </div>
                    {/*
                        file.name && <div className='file-name'>
                            <Tooltip placement='bottomLeft' title={file.name}>
                                <a href={file.url} target='_blank' rel='noopener noreferrer'>{file.name}</a>
                            </Tooltip>
                        </div>
                    */}
                    {
                        !disabled && <div
                            className='file-delete'
                            onClick={() => {
                                onRemove && onRemove(file);
                            }}
                        >
                            <Icon type='close'/>
                        </div>
                    }
                    {
                        isUploading && <div className='file-uploading'>
                            <div className='file-progress'>
                                <Progress
                                    showInfo={false}
                                    percent={file.percent}
                                    strokeWidth={5}
                                />
                            </div>
                            <div className='file-uploading-mask'></div>
                        </div>
                    }
                </div>
            </Tooltip>
        );
    }
}
