import React from 'react';

/**
 * 计算锚点高度
 * @param that
 * @returns {number[]}
 */
function countAnchorsHeight(that) {
    let anchorArray = [that.header.offsetHeight];
    for (let i = 0; i < that.state.contentArray.length; i++) {
        anchorArray.push(that.state.contentArray[i] + anchorArray[i]);
    }
    anchorArray.pop();
    for (let i = 0; i < anchorArray.length; i++) {
        if (i !== 0) {
            anchorArray[i] = anchorArray[i] - that.nav.offsetHeight + that.nav.offsetHeight;
        }
    }
    return anchorArray;
}
/**
 * 标签切换
 * @param that
 * @param tabIndex  标签id
 */
function handleTab(that, tabIndex) {
    if (that.state.tabIndex !== tabIndex) {
        that.setState({
            tabIndex
        });
    }
}
/**
 * 控制是否吸顶
 * @param that
 * @param isFixed
 */
function handleFixed(that, isFixed) {
    if (that.state.isFixed !== isFixed) {
        that.setState({
            isFixed
        });
    }
}
/**
 * 锚地滚动控制tab切换   这边处理的可能有问题 内容的高度太短会出现bug
 * @param that
 * @param scrollTop
 * @param anchorsNum
 */
function handleAnchor(that, scrollTop, anchorsNum) {
    const anchorArray = countAnchorsHeight(that);
    let clientHeight = document.documentElement.clientHeight - that.nav.offsetHeight;
    for (let i = 0; i < anchorsNum; i++) {
        if (scrollTop >= anchorArray[i] && anchorArray[i + 1] > scrollTop) {
            // 若果内容区域达不到可视高度处理
            if (that.state.contentArray[i] < document.documentElement.clientHeight) {
                if (document.getElementById(`anchor${i}`).getBoundingClientRect().top <= clientHeight) {
                    handleTab(that, i);
                }
            } else {
                handleTab(that, i);
            }
        }
    }
    // 对最后一个锚点特殊处理
    if (document.getElementById(`anchor${anchorsNum - 1}`).getBoundingClientRect().top <= clientHeight) {
        handleTab(that, anchorsNum - 1);
    }
}
const anchor = {
    /**
     * 标签点击事件
     * @param tabIndex 标签id
     * @param that this
     */
    tabClick: (that, tabIndex) => {
        let anchorElement = document.getElementById(`anchor${tabIndex}`);
        // 锚点滚动
        if (anchorElement) {
            anchorElement.scrollIntoView({block: 'start', behavior: 'smooth'});
        }
    },
    /**
     * 生成锚点
     * @param that
     * @returns {锚点dom}
     */
    creatAnchorsDiv: (that) => {
        return countAnchorsHeight(that).map((item, index) => {
            return (<div key={item} id={'anchor' + index} style={{
                position: 'absolute',
                top: item
            }}></div>);
        });
    },
    /**
     * 滑动事件
     * @param that
     * @param scrollTop 滚动距离
     */
    onPageScroll: (that, scrollTop) => {
        const headerOffsetHeigth = that.header.offsetHeight;
        handleAnchor(that, scrollTop, that.state.contentArray.length);
        // 控制吸顶
        if (that.currentScrollTop - scrollTop < 0) {
            // 下滑
            if (scrollTop > headerOffsetHeigth) {
                handleFixed(that, true);
            } else {
                handleFixed(that, false);
            }
        } else {
            // 上滑
            if (scrollTop <= headerOffsetHeigth) {
                handleFixed(that, false);
            } else {
                handleFixed(that, true);
            }
        }
        that.currentScrollTop = scrollTop;
    }
};
module.exports = anchor;
