import React, { Component, Fragment } from 'react';
import { Modal, Button } from 'antd';
import KSTable from '../KSTable';
import KSImgPreview from '../KSImgPreview';
import { getFileSize } from 'ks-cms-utils';
import './fileListModal.scss';

export default class FileListModal extends Component {
    state = {
        columns: [
            {
                title: '图片链接',
                dataIndex: 'rtfUrl',
                width: 100,
                render: (url) => url && <KSImgPreview
                    src={url}
                >
                    <img style={{maxHeight: '50px', maxWidth: '100px'}} src={`${url}?x-oss-process=image/quality,q_70/format,webp/resize,w_150`}/>
                </KSImgPreview>
            },
            {
                title: '大小',
                dataIndex: 'originalSize',
                width: 80,
                render: (text) => text && getFileSize(text)
            }
        ],
        dataSource: [],
        visible: false
    }

    onSelectChange = (keys) => {
        this.setState({
            selectedRowKeys: keys
        });
    }

    asyncSetState = (state) => new Promise((resolve) => {
        this.setState(state, () => {
            resolve();
            this.forceUpdate();
        });
    })

    render() {
        const { visible, columns, dataSource } = this.state;
        return (
            <Modal
                wrapClassName={'fileListModal-container'}
                title={'超出大小列表'}
                size={'small'}
                visible={visible}
                closable={false}
                okButtonProps={{
                    size: 'small'
                }}
                cancelButtonProps={{
                    size: 'small'
                }}
                // onOk={() => {
                //     this.setState({
                //         visible: false
                //     });
                // }}
                // onCancel={() => {
                //     this.setState({
                //         visible: false
                //     });
                // }}
                footer={
                    <Fragment>
                        <Button
                            size={'small'}
                            onClick={() => {
                                this.setState({
                                    visible: false
                                });
                            }}
                        >
                            关闭
                        </Button>
                    </Fragment>
                }
            >
                <KSTable
                    autoHeight={false}
                    columns={columns}
                    dataSource={dataSource}
                    rowKey={'rtfUrl'}
                    pagination={false}
                />
            </Modal>
        );
    }
}
