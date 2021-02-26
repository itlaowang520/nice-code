import React from 'react';
import { Drawer, Form, Button, Radio, Tabs, message } from 'antd';
import PropTypes from 'prop-types';
import { getPersonConfig, setPersonConfig } from './utils';
import { request } from '../../utils';
import { isEmptyObject } from 'ks-cms-utils';
import './index.scss';
import { TAGS, MODEL, CLOSE_IMG_SRC } from './constants';
const { TabPane } = Tabs;
const RadioGroup = Radio.Group;

const requestPatch = window.location.origin; // 当前项目的环境
const api = '/permission-server/sys/user/update-profile'; // 更新用户配置
let timer = null;
export default class DrawerNode extends React.PureComponent {
    static propTypes = {
        settingVisible: PropTypes.bool, // 是否打开个性化配置抽屉
        onCloseSetting: PropTypes.func, // 关闭抽屉
    }
    constructor(props) {
        super(props);
        this.localPersonConfig = getPersonConfig().setting;
        this.localFollows = getPersonConfig().follows;
        if (!isEmptyObject(this.localPersonConfig)) {
            this.state.params.label = this.localPersonConfig.label;
            this.state.params.tags = this.localPersonConfig.tags;
        }
    }
    state = {
        showResultsVisible: false, // 显示结果visible
        params: {
            label: null,
            tags: null
        }, // 配置项参数
        dataSource: [], // 效果展示
    };

    resultsShow = (type) => {
        return <span style={{ color: '#1890ff', display: 'inline-block', cursor: 'pointer' }}
            onClick={() => {
                switch (type) {
                    case 'label':
                        this.setState({
                            dataSource: TAGS
                        });
                        break;
                    case 'tags':
                        this.setState({
                            dataSource: MODEL
                        });
                        break;
                }
                this.setState({
                    showResultsVisible: true
                });
            }}>效果展示</span>;
    }

    render() {
        const { params: { label, tags }, dataSource } = this.state;
        const { settingVisible, onCloseSetting } = this.props;
        return <Drawer
            title="用户个性化配置"
            placement="right"
            visible={settingVisible}
            width={520}
            onClose={() => {
                onCloseSetting(false);
                this.setState({
                    showResultsVisible: false
                });
            }}
            destroyOnClose={true}
            drawerStyle={this.state.showResultsVisible ? { backgroundColor: 'rgba(99,96,96,0.65)' } : {}}
        >
            <Form hideRequiredMark layout="vertical">
                <Form.Item label={<span>是否需要根据标签分类展示系统  {this.resultsShow('label')}</span>}>
                    <RadioGroup
                        value={label}
                        onChange={(e) => {
                            this.setState({
                                params: {
                                    ...this.state.params,
                                    label: e.target.value
                                }
                            })
                        }}
                    >
                        {
                            TAGS.map(({ label, value }, index) => {
                                return <Radio value={value} key={index} className={this.state.showResultsVisible ? 'drawer-input-color-wrraaer' : ''}>{label}</Radio>;
                            })
                        }
                    </RadioGroup>
                </Form.Item>
                <Form.Item label={<span>是否需要展示页签  {this.resultsShow('tags')}</span>}>
                    <RadioGroup
                        value={tags}
                        onChange={(e) => {
                            this.setState({
                                params: {
                                    ...this.state.params,
                                    tags: e.target.value
                                }
                            })
                        }}
                    >
                        {
                            MODEL.map(({ label, value }, index) => {
                                return <Radio value={value} key={index} className={this.state.showResultsVisible ? 'drawer-input-color-wrraaer' : ''}>{label}</Radio>;
                            })
                        }
                    </RadioGroup>
                </Form.Item>
                <div className="form-submit-wrapper">
                    <Button onClick={() => {
                        onCloseSetting(false)
                    }} style={{ marginRight: 8 }}>
                        取消
                    </Button>
                    <Button onClick={() => {
                        const { params } = this.state;
                        let postData = {
                            setting: { label: params.label, tags: params.tags }
                        };
                        if (!isEmptyObject(this.localFollows)) {
                            postData = { ...postData, follows: { ...this.localFollows } };
                        }
                        request(`${requestPatch}${api}`, {
                            method: 'POST',
                            body: postData
                        }).then((res) => {
                            if (res.code === 0) {
                                message.success('个性化配置保存成功！系统将会在3秒之后自动刷新。', 3);
                                setPersonConfig(postData);
                                onCloseSetting(false);
                                clearTimeout(timer);
                                timer = setTimeout(() => {
                                    window.location.reload();
                                }, 3000);
                            }
                        }).catch((err) => {
                            message.error(err || '保存失败，请重试或联系技术人员。');
                        });
                    }} type="primary">
                        保存
                    </Button>
                </div>
            </Form>
            {
                this.state.showResultsVisible && <div className="results-show-dialog">
                    <div className="results-show-dialog-close"><span onClick={() => {
                        this.setState({
                            showResultsVisible: false
                        });
                    }}><img src={CLOSE_IMG_SRC} /></span></div>
                    <Tabs className="results-show-dialog-image-tabs">
                        {
                            dataSource.map(({ title, src, text }, index) => {
                                return <TabPane tab={title} key={index}>
                                    <div className="results-show-dialog-image"><img src={src} /></div>
                                    <div className="results-show-dialog-text">{text}</div>
                                </TabPane>;
                            })
                        }
                    </Tabs>
                </div>
            }
            <div className="drawer-page-footer">
                <h5>致各位小伙伴:</h5>
                <p>
                    如有定制化的需求可联系技术部小伙伴<span>黑马</span>，欢迎大家提出建议与想法，合理的意见将会经过消化进行输出。
                </p>
            </div>
        </Drawer >
    }
}