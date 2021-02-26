import React from 'react';
import {Row, Input, Form, Empty} from 'antd';
import PropTypes from 'prop-types';
import FileItem from './FileItem';
import KSPagination from '../KSPagination';
import './index.scss';

const Search = Input.Search;
const FormItem = Form.Item;

export default class SelectFile extends React.Component {
    static propTypes = {
        rowKey: PropTypes.string,
        selectedList: PropTypes.array,
        multiple: PropTypes.bool,
        fileTitle: PropTypes.string, // 搜索title展示
        dataSource: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.bool,
        ]), // 数据集
        pagination: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.bool,
        ]), // 分页信息
        onCheckedFunc: PropTypes.func,
        searchValue: PropTypes.string,
        setStateFunc: PropTypes.func,
        onSearchFunc: PropTypes.func,
        showKeys: PropTypes.object,
        accept: PropTypes.string,
        onSubmit: PropTypes.func,
    }

    state = {
        selectedList: [],
    }

    handleClick = (selectedRow) => {
        this.props.onCheckedFunc && this.props.onCheckedFunc(selectedRow);
    }
    onDblClickFunc = async(selectedRow) => {
        await this.props.onCheckedFunc && this.props.onCheckedFunc(selectedRow);
        await this.props.onSubmit && this.props.onSubmit();
    }

    /**
     * 查看是否被禁用
     * @return {[type]} [description]
     */
    getDisabled = (item) => {
        const { accept, rowKey } = this.props;
        if (accept) {
            const acceptList = accept.split(',');
            if (acceptList && acceptList.length) {
                let url = item[rowKey] || item.cdnUrl || item.url || '';
                for (let i = 0; i < acceptList.length; i++) {
                    if (`.${(url + '').split('.').pop()}` === acceptList[i]) {
                        return false;
                    }
                }
                return true;
            }
        } else {
            return false;
        }
    }

    render() {
        const {
            rowKey,
            showKeys,
            selectedList,
            multiple,
            fileTitle,
            pagination,
            dataSource,
            searchValue,
            setStateFunc,
            onSearchFunc
        } = this.props;
        return (
            <div className="select-file-wrapper">
                <Form layout="inline" className="file-list-search-form">
                    <FormItem>
                        <Search
                            placeholder={`请输入${fileTitle}名称`}
                            onChange={(e) => {
                                setStateFunc({
                                    searchValue: e.target.value
                                });
                            }}
                            onSearch={() => {
                                onSearchFunc(searchValue);
                            }}
                        />
                    </FormItem>
                </Form>
                <Row gutter={16} style={{height: '350px', overflowY: 'auto', margin: '0', border: '1px solid #e6e6e6', padding: '10px 2px 0'}}>
                    {
                        dataSource.length ? dataSource.map((item, index) => {
                            return (
                                <FileItem
                                    key={item.fileId || index}
                                    rowKey={rowKey}
                                    fileInfo={item}
                                    showKeys={showKeys}
                                    selectedList={selectedList}
                                    multiple={multiple}
                                    disabled={this.getDisabled(item)}
                                    onClickFunc={this.handleClick}
                                    onDblClickFunc={this.onDblClickFunc}
                                />
                            );
                        }
                        ) : <Empty description={`暂无${fileTitle}数据`} style={{marginTop: '60px'}} />
                    }
                </Row>
                {
                    pagination && <div className="file-pagination">
                        <KSPagination {...pagination} />
                    </div>
                }
            </div>
        );
    }
}
