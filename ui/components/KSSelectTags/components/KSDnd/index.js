import React from 'react';
import PropTypes from 'prop-types';
import { HEIGHT, WIDTH, COL_NUM } from './constants';
import { toNumber } from './utils';

export default class KSDnd extends React.Component {
    static propTypes = {
        time: PropTypes.number,
        moveStop: PropTypes.func,
        type: PropTypes.string,
        children: PropTypes.node,
        className: PropTypes.string,
        style: PropTypes.object,
        onRefs: PropTypes.func,
        colNumber: PropTypes.number, // 一行排多少个
    }
    static defaultProps = {
        clickElement: null,
        dragElement: null,
        dragOver: null,
        dragStart: null,
        time: 200,
        moveStop: null,
        type: 'ease-out',
        className: '',
        style: {}
    };

    state = {
        childrenNode: [],
        zIndex: 1,
        aPos: []
    };

    /**
     * 移动监听
     */
    move = (obj, json) => {
        let optional = {},
            start = {},
            dis = {};
        optional.time = this.props.time;
        optional.moveStop = this.props.moveStop;
        optional.type = this.props.type;

        for (var key in json) {
            start[key] = parseFloat(this.getStyle(obj, key));
            dis[key] = json[key] - start[key];
        }

        let count = Math.round(optional.time / 30),
            n = 0;

        clearInterval(obj.timer);
        obj.timer = setInterval(function() {
            n++;
            // 办事
            for (var key in json) {
                let cur, a;
                switch (
                    optional.type // 计算运动到哪
                ) {
                    case 'linear': // 匀速
                        cur = start[key] + (n * dis[key]) / count;
                        break;
                    case 'ease-in': // 加速
                        a = n / count;
                        cur = start[key] + dis[key] * (a * a * a); // 加速
                        break;
                    case 'ease-out': // 减速
                        a = 1 - n / count;
                        cur = start[key] + dis[key] * (1 - a * a * a); // 减速
                        break;
                }
                if (key === 'opacity') {
                    obj.style.opacity = cur;
                    obj.style.filter = 'alpha(opacity:' + cur * 100 + ')';
                } else {
                    obj.style[key] = cur + 'px';
                }
            }
            if (n === count) {
                // 停止条件
                clearInterval(obj.timer);
                optional.moveStop && optional.moveStop();
            }
        }, 30);
    };

    getStyle = (obj, attr) =>
        obj.currentStyle
            ? obj.currentStyle[attr]
            : getComputedStyle(obj, false)[attr];

    collTest = (obj1, obj2) => {
        let l1 = obj1.offsetLeft,
            t1 = obj1.offsetTop,
            r1 = l1 + obj1.offsetWidth,
            b1 = t1 + obj1.offsetHeight,
            l2 = this.state.aPos[obj2.index].left,
            t2 = this.state.aPos[obj2.index].top,
            r2 = l2 + obj2.offsetWidth,
            b2 = t2 + obj2.offsetHeight;

        if (r1 < l2 || b1 < t2 || l1 > r2 || t1 > b2) {
            // 没碰到的情况
            return false;
        }

        return true;
    };

    getDis = (obj1, obj2) => {
        let a = obj1.offsetLeft - this.state.aPos[obj2.index].left,
            b = obj1.offsetTop - this.state.aPos[obj2.index].top;
        return Math.sqrt(a * a + b * b);
    };

    findNearest = (obj) => {
        var iMin = 99999999999999,
            iMinIndex = -1;

        const aLi = this.state.childrenNode;

        for (let i = 0; i < aLi.length; i++) {
            if (this.collTest(obj, aLi[i])) {
                // 如果碰撞到了，计算 与碰撞aLi[i]之间的  直线 距离
                let dis = this.getDis(obj, aLi[i]);
                if (iMin > dis) {
                    iMin = dis;
                    iMinIndex = i;
                }
            }
        }

        if (iMinIndex === -1) {
            return null;
        }
        return aLi[iMinIndex];
    };

    drag = (obj) => {
        const _this = this;
        let optional = {},
            timer;
        obj.onmousedown = function(ev) {
        /* 防止连续点击 从而获取position 为 NaN */
            if (timer) {
                return;
            }
            timer = setTimeout(() => {
                timer = clearTimeout(timer);
            }, 100);

            let dataSource = Array.from(_this.ref.children).map((DOM) => {
                const { dataset = {} } = DOM;
                const { source } = dataset;
                return JSON.parse(source);
            });
            const { dragStart } = _this.props;
            const { dataset = {} } = obj;
            const { source } = dataset;
            if (`${source}` === '-1') {
                return;
            }
            optional.clickElement = _this.props.clickElement || null;
            optional.clickElement && optional.clickElement(obj);
            optional.prevDataSource = dataSource.filter((source) => `${source}` !== '-1');
            dragStart && dragStart();
            // optional.time = this.props.time || 300;
            // optional.moveStop = this.props.moveStop || null;
            // optional.type = this.props.type||'ease-out';
            var oEvent = ev || event,
                disX = oEvent.clientX - obj.offsetLeft,
                disY = oEvent.clientY - obj.offsetTop,
                oldIndex = _this.getSortNum(obj);
            // obj.style.zIndex = zIndex++;
            _this.setState({ zIndex: _this.state.zIndex + 1 });
            obj.style.zIndex = _this.state.zIndex;
            clearInterval(obj.timer);

            document.onmousemove = function(ev) {
                var oEvent = ev || event;
                obj.style.left = oEvent.clientX - disX + 'px';
                obj.style.top = oEvent.clientY - disY + 'px';

                // 拖拽过程的api
                optional.dragElement = _this.props.dragElement || null;
                optional.dragElement && optional.dragElement(obj);

                //  查找最近并碰撞 如果碰撞到了，返回被碰撞元素
                let oNear = _this.findNearest(obj);
                if (oNear && obj !== oNear) {
                    let n = obj.index,
                        m = oNear.index,
                        aLi = _this.state.childrenNode;

                    if (n < m) {
                        for (let i = 0; i < aLi.length; i++) {
                            // n < m  [n+1,m]--
                            if (aLi[i].index >= n + 1 && aLi[i].index <= m) {
                                aLi[i].index--;
                                _this.move(
                                    aLi[i],
                                    _this.state.aPos[aLi[i].index]
                                );
                            }
                        }
                    } else if (n > m) {
                        for (let i = 0; i < aLi.length; i++) {
                            // n > m  [m,n-1]++
                            if (aLi[i].index >= m && aLi[i].index <= n - 1) {
                                aLi[i].index++;
                                _this.move(
                                    aLi[i],
                                    _this.state.aPos[aLi[i].index]
                                );
                            }
                        }
                    }

                    obj.index = m;
                }
            };

            document.onmouseup = function() {
                // drag 结束 的 api
                document.onmousemove = null;
                document.onmouseup = null;
                obj.releaseCapture && obj.releaseCapture();
                _this.move(obj, _this.state.aPos[obj.index]);
                let dataSource = Array.from(_this.ref.children).map((DOM) => {
                        const { dataset = {} } = DOM;
                        const {source} = dataset;
                        return JSON.parse(source);
                    }),
                    currentItem = dataSource[oldIndex];
                const { dragOver } = _this.props;
                /* 拖拽后不能和最后一个按钮交换 */
                // if (obj.index === dataSource.length - 1) {
                //     dragOver && dragOver(optional.prevDataSource);
                //     _this.reRender();
                //     setTimeout(() => {
                //         _this.setConfig();
                //     }, 200);
                //     return;
                // }
                // dataSource = dataSource.filter((source) => `${source || ''}` !== '-1');
                if (!currentItem) { return; } // 解决删除后元素后快速点击无法获取到正确dom问题
                dataSource.splice(oldIndex, 1);
                dataSource.splice(obj.index, 0, currentItem);
                /* 如果排序前后一致则不向外输出 */
                if (obj.index - oldIndex === 0) {
                    return;
                }
                dragOver && dragOver(dataSource);
            };

            obj.setCapture && obj.setCapture();
            return false;
        };
    };

    getSortNum = (node) => {
        const { style: { width = WIDTH, height = HEIGHT }, colNumber = COL_NUM } = this.props;
        const { style = {} } = node;
        let { left = 0, top = 0 } = style;
        left = left.replace(/px/g, '') - 0;
        top = top.replace(/px/g, '') - 0;
        // return Math.floor(top / HEIGHT) * COL_NUM + Math.floor(left / (WIDTH - 2));
        return Math.floor(top / height) * colNumber + Math.floor(left / (width - 2));
    }

    componentDidMount() {
        this.props.onRefs && this.props.onRefs(this);
        this.setConfig();
    }

    /**
     * 设置拖砖
     */
    setConfig = () => {
        const parent = this.ref;
        // parent.style.width = this.props.width + "px";
        let aLi = (parent || {}).children || [],
            aPos = [];
        // 布局转换 把他转化为 浮动 元素
        for (let i = 0; i < aLi.length; i++) {
            aPos.push({ left: aLi[i].offsetLeft, top: aLi[i].offsetTop });
            aLi[i].style.left = aPos[i].left + 'px';
            aLi[i].style.top = aPos[i].top + 'px';
        }
        for (var i = 0; i < aLi.length; i++) {
            aLi[i].style.position = 'absolute';
            aLi[i].style.margin = 0;
            aLi[i].index = i;
        }
        // 2.批量拖拽
        for (let i = 0; i < aLi.length; i++) {
            this.drag(aLi[i]);
        }
        if (parent) {
            this.setState({
                childrenNode: aLi,
                aPos
            });
        }
    }

    /**
     * 重新渲染
     */
    reRender = () => {
        const parent = this.ref;
        let aLi = (parent || {}).children || [];
        // 布局转换
        for (let i = 0; i < aLi.length; i++) {
            aLi[i].style.left = 'auto';
            aLi[i].style.top = 'auto';
            aLi[i].style.position = 'inherit';
            aLi[i].style.margin = '0';
        }
    }

    render() {
        const { style, className, children, colNumber = COL_NUM } = this.props;
        const childrenLength = children.length;
        const rowLength = Math.ceil(childrenLength / colNumber);
        let propsStyle = {
            ...style,
            display: 'flex',
            flexWrap: 'wrap',
            width: (childrenLength < colNumber ? childrenLength : colNumber) * (toNumber(style.width) || WIDTH),
            height: rowLength * (toNumber(style.height) || HEIGHT)
        };
        return (
            <div
                ref={(ref) => {
                    this.ref = ref;
                }}
                style={propsStyle}
                className={className}
            >
                {this.props.children}
            </div>
        );
    }
}
