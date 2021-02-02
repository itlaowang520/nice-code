import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Checkbox } from 'antd';
import { KSWhiteCard } from 'ks-cms-ui';
export default class NewLabelManagerPage extends React.PureComponent {

    static propTypes = {
        newLabelManager: PropTypes.object, // 新标签管理redux
        newLabelManagerListloading: PropTypes.bool, // 加载新标签管理列表的状态
        dispatch: PropTypes.func, // 触发redux的方法
        form: PropTypes.object, // Form对象
        isMobile: PropTypes.bool // 是否为移动端
    }

    state = {
        checkedGridList: [],
        gridList: [
            {
                id: 1,
                title: '视频',
                imgSrc: 'https://tcdn.kaishustory.com/kstory/activity/image/cebb3fac-5a60-4bb6-9057-2aa89c00b388.png',
                checked: false
            },
            {
                id: 2,
                title: '音乐',
                imgSrc: 'https://tcdn.kaishustory.com/kstory/activity/image/2121f823-a672-4b9e-b373-d817ede3f912.png',
                checked: false
            },
            {
                id: 3,
                title: '三国',
                imgSrc: 'https://tcdn.kaishustory.com/kstory/activity/image/3b9b4f92-0fe0-4d2b-b99c-1486f87991c8.png',
                checked: false
            },
            {
                id: 4,
                title: '历史',
                imgSrc: 'https://tcdn.kaishustory.com/kstory/activity/image/5f8f2672-1e3b-4c41-b537-ba2f34762cb9.png',
                checked: false
            },
            {
                id: 5,
                title: '教育',
                imgSrc: 'https://tcdn.kaishustory.com/kstory/activity/image/cebb3fac-5a60-4bb6-9057-2aa89c00b388.png',
                checked: false
            },
            {
                id: 6,
                title: '游戏',
                imgSrc: 'https://tcdn.kaishustory.com/kstory/activity/image/2121f823-a672-4b9e-b373-d817ede3f912.png',
                checked: false
            },
            {
                id: 7,
                title: '代码',
                imgSrc: 'https://tcdn.kaishustory.com/kstory/activity/image/3b9b4f92-0fe0-4d2b-b99c-1486f87991c8.png',
                checked: false
            },
            {
                id: 8,
                title: '舞蹈',
                imgSrc: 'https://tcdn.kaishustory.com/kstory/activity/image/5f8f2672-1e3b-4c41-b537-ba2f34762cb9.png',
                checked: false
            },
            {
                id: 9,
                title: '饮食',
                imgSrc: 'https://tcdn.kaishustory.com/kstory/activity/image/5f8f2672-1e3b-4c41-b537-ba2f34762cb9.png',
                checked: false
            },
        ]
    };

    GridItem = (dataList = []) => {
        return <Row type='flex' justify='space-around'>
            {
                dataList && dataList.length && dataList.map((item, index) => {
                    return <Col
                        key={item.id}
                        span={7}
                        style={{position: 'relative', cursor: 'pointer', marginBottom: '10px'}}
                        onClick={
                            () => {
                                const { checkedGridList } = this.state;
                                let newGridList = [
                                    ...this.state.gridList
                                ];
                                newGridList[index].checked = !newGridList[index].checked;
                                if (checkedGridList.length < 5) {
                                    this.setState({
                                        gridList: newGridList,
                                    }, () => {
                                        this.setState({
                                            checkedGridList: this.state.gridList.filter((item) => item.checked)
                                        });
                                    });
                                } else {
                                    if (item.checked) {
                                        newGridList.find((item) => item.id === checkedGridList[checkedGridList.length - 1].id).checked = !newGridList.find((item) => item.id === checkedGridList[checkedGridList.length - 1].id).checked;
                                    }
                                    this.setState({
                                        gridList: newGridList,
                                    }, () => {
                                        this.setState({
                                            checkedGridList: this.state.gridList.filter((item) => item.checked)
                                        });
                                    });
                                }
                            }
                        }
                    >
                        <img style={{width: '80%', height: '80%'}} src={item.imgSrc} />
                        <div>{item.title}</div>
                        <Checkbox style={{position: 'absolute', right: '3px', top: '3px'}} checked={item.checked} />
                    </Col>;
                })
            }
        </Row>;
    }

    render() {
        return (
            <KSWhiteCard
                title="grid"
            >
                {this.GridItem(this.state.gridList)}
            </KSWhiteCard>
        );
    }
}
