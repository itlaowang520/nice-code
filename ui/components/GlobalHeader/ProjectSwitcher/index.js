import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Drawer, Row, Col, Input } from 'antd';
import KSIcon from '../../KSIcon';
import ProjectCard from '../ProjectCard';
import './style.scss';

const { Search } = Input;

export default class ProjectSwitcher extends Component {
    static propTypes = {
        switchMenu: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.bool
        ]), // 切换系统菜单配置
    }

    state = {
        visible: false,
        isLoaded: false,
        dataSource: [],
    }

    static getDerivedStateFromProps(props, state) {
        const { switchList = [] } = props.switchMenu;
        if (!state.isLoaded && switchList.length) {
            return {
                ...state,
                isLoaded: true,
                dataSource: switchList,
            };
        } else {
            return state;
        }
    }

    /**
     * Drawer显隐切换
     */
    changeVisible = () => this.setState({
        visible: !this.state.visible
    })

    /**
     * 格式化数据源
     * 升级为二维数组
     */
    formatDataSouce = (dataSource, splitNumber = 3) => dataSource.reduce((prev, item) => {
        const lastDatas = prev[prev.length - 1] || [];
        if (lastDatas.length < splitNumber) {
            const index = prev.length ? prev.length - 1 : 0;
            prev[index] = [
                ...(prev[index] || []),
                item
            ];
        } else {
            prev = [
                ...prev,
                [item]
            ];
        }
        return prev;
    }, []);

    render() {
        const { switchMenu = {} } = this.props;
        const { currentSwitch = '未知', switchList = [] } = switchMenu;
        const { dataSource } = this.state;
        const isSwitch = Boolean(switchMenu);
        const projectList = this.formatDataSouce(dataSource);

        if (!isSwitch) return null;

        return <Fragment>
            <span
                className='project-switcher-action project-switcher-account'
                onClick={() => {
                    this.changeVisible();
                }}
            >
                { currentSwitch } <KSIcon type="down" size={'12px'} />
            </span>
            <Drawer
                title={<div className='switcher-title-search'>
                    <div className='switcher-title-text'>
                        切换系统
                    </div>
                    <Search
                        size={'small'}
                        placeholder={'菜单搜索'}
                        onSearch={(value) => {
                            let result = [];
                            if (value) {
                                result = switchList.filter(({name = ''}) => name.includes(value));
                            } else {
                                result = switchList;
                            }
                            this.setState({
                                dataSource: result
                            });
                        }}
                    />
                </div>}
                placement='left'
                closable={false}
                onClose={this.changeVisible}
                visible={this.state.visible}
                width={1000}
                bodyStyle={{
                    overflow: 'auto',
                    height: 'calc(100vh - 74px)',
                    paddingBottom: 0
                }}
            >
                {
                    projectList.map((cols = [], index) => {
                        return (
                            <Row
                                gutter={[12, 8]}
                                key={index}
                            >
                                {
                                    cols.map((data, idx) => {
                                        return (
                                            <Col
                                                span={8}
                                                key={`${index}_${idx}`}
                                            >
                                                <ProjectCard
                                                    item={data}
                                                />
                                            </Col>
                                        );
                                    })
                                }
                            </Row>
                        );
                    })
                }
            </Drawer>
        </Fragment>;
    }
}
