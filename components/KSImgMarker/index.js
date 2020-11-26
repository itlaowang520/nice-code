import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Slider, Button, Tooltip, Icon,
    Spin, message, Popconfirm
} from 'antd';
import {
    GRAPHICAL_TYPE, RECTANGLE, CIRCULAR,
    MOVE_MODE, LINE_MODE, ERASER_MODE,
    GRAPHICAL_MODE, PUT_MODE, ACTION_TYPE
} from './constants';
import { getURLBase64 } from './utils';
import { CompositePicture } from 'ks-canvas';
import './style.scss';

const MarkPaper = (props) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const wrapRef = useRef(null);
    const translatePointXRef = useRef(0);
    const translatePointYRef = useRef(0);
    const fillStartPointXRef = useRef(0);
    const fillStartPointYRef = useRef(0);
    const canvasHistroyListRef = useRef([]);
    const [lineColor, setLineColor] = useState('#fa4b2a');
    const [fillImageSrc, setFillImageSrc] = useState('');
    const [mouseMode, setMouseMode] = useState(MOVE_MODE);
    const [graphicalType, setGraphicalType] = useState(RECTANGLE);
    const [lineWidth, setLineWidth] = useState(5);
    const [canvasScale, setCanvasScale] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [canvasCurrentHistory, setCanvasCurrentHistory] = useState(0);
    useEffect(() => {
        // props.imgUrl
        setFillImageSrc(props.imgUrl);
        // setFillImageSrc('https://tcdn.kaishustory.com/image/a64c699a-034a-4496-98ec-20b1a7ad4f85_info_w=450_h=450_s=91012.png');
    }, []);

    // 重置变换参数，重新绘制图片
    useEffect(() => {
        setIsLoading(true);
        translatePointXRef.current = 0;
        translatePointYRef.current = 0;
        fillStartPointXRef.current = 0;
        fillStartPointYRef.current = 0;
        setCanvasScale(1);
        fillImage();
    }, [fillImageSrc]);

    // 画布参数变动时，重新监听canvas
    useEffect(() => {
        handleCanvas();
    }, [mouseMode, graphicalType, canvasScale, canvasCurrentHistory]);

    // 监听画笔颜色变化
    useEffect(() => {
        const { current: canvas } = canvasRef;
        const context = canvas && canvas.getContext('2d');
        if (!context) return;

        context.strokeStyle = lineColor;
        context.lineWidth = lineWidth;
        context.lineJoin = 'round';
        context.lineCap = 'round';
    }, [lineWidth, lineColor]);

    // 监听缩放画布
    useEffect(() => {
        const { current: canvas } = canvasRef;
        const { current: translatePointX } = translatePointXRef;
        const { current: translatePointY } = translatePointYRef;
        canvas && (canvas.style.transform = `scale(${canvasScale},${canvasScale}) translate(${translatePointX}px,${translatePointY}px)`);
    }, [canvasScale]);

    useEffect(() => {
        const { current: canvas } = canvasRef;
        const { current: canvasHistroyList } = canvasHistroyListRef;
        const context = canvas && canvas.getContext('2d');
        if (!canvas || !context || canvasCurrentHistory === 0) return;
        context.putImageData(canvasHistroyList[canvasCurrentHistory - 1], 0, 0);
    }, [canvasCurrentHistory]);

    const fillImage = async() => {
        const { current: canvas } = canvasRef;
        const { current: wrap } = wrapRef;
        const context = canvas && canvas.getContext('2d');
        const img = new Image();
        if (!canvas || !wrap || !context) return;
        img.src = await getURLBase64(fillImageSrc);
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;

            // 背景设置为图片，橡皮擦的效果才能出来
            canvas.style.background = `url(${img.src})`;
            // context.drawImage(img, 0, 0);
            context.strokeStyle = lineColor;
            context.lineWidth = lineWidth;
            context.lineJoin = 'round';
            context.lineCap = 'round';
            context.fillStyle = 'rgba(255, 255, 255, 0)';

            // 设置变化基点，为画布容器中央
            canvas.style.transformOrigin = `${wrap && wrap.offsetWidth / 2}px ${wrap && wrap.offsetHeight / 2}px`;
            // 清除上一次变化的效果
            canvas.style.transform = '';
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            canvasHistroyListRef.current = [];
            canvasHistroyListRef.current.push(imageData);
            // canvasCurrentHistoryRef.current = 1
            setCanvasCurrentHistory(1);
            setTimeout(() => { setIsLoading(false); }, 500);
        };
    };

    /**
     * 监听键盘事件
     */
    window.onkeypress = (event) => {
        event.stopPropagation();
        const { altKey, keyCode } = event;
        // window.onkeypress = null;
        if (altKey && keyCode === 174) { // alt + R removal 切换移动工具
            handleMouseModeChange(MOVE_MODE);
        }
        if (altKey && keyCode === 8706) { // alt + D draw 画笔工具
            handleMouseModeChange(LINE_MODE);
        }
        if (altKey && keyCode === 231) { // alt + C draw 橡皮擦工具
            if (canvasCurrentHistory <= 1) {
                message.error('您没有进行任何修改，暂不能使用橡皮擦...');
                return;
            }
            handleMouseModeChange(ERASER_MODE);
        }
        if (altKey && keyCode === 169) { // alt + G graphical 图形工具
            handleMouseModeChange(GRAPHICAL_MODE);
        }
        if (altKey && keyCode === 937) { // alt + Z 撤销工具
            handleRollBack();
        }
    };

    /**
     * 计算画笔位置
     * @param {*}x 鼠标横坐标
     * @param {*} y 鼠标纵坐标
     */
    const generateLinePoint = (x, y) => {
        const { current: canvas } = canvasRef;
        const { current: wrap } = wrapRef;
        const { offsetLeft: OffsetLeft, offsetTop: OffsetTop } = wrap;
        let { left: positionLeft, top: positionTop } = canvas.getBoundingClientRect();
        positionLeft = positionLeft - OffsetLeft;
        positionTop = positionTop - OffsetTop;

        const pointX = (x - positionLeft) / canvasScale;
        const pointY = (y - positionTop) / canvasScale;
        return {
            pointX,
            pointY
        };
    };

    const handleLineMode = (downX, downY) => {
        const { current: canvas } = canvasRef;
        const { current: wrap } = wrapRef;
        const context = canvas && canvas.getContext('2d');
        if (!canvas || !wrap || !context) return;

        const offsetLeft = canvas.offsetLeft;
        const offsetTop = canvas.offsetTop;
        // 减去画布偏移的距离（以画布为基准进行计算坐标）
        downX = downX - offsetLeft;
        downY = downY - offsetTop;

        const { pointX, pointY } = generateLinePoint(downX, downY);
        context.globalCompositeOperation = 'source-over';
        context.beginPath();
        context.moveTo(pointX, pointY);

        canvas.onmousemove = null;
        canvas.onmousemove = (event) => {
            const moveX = event.pageX - offsetLeft;
            const moveY = event.pageY - offsetTop;
            const { pointX, pointY } = generateLinePoint(moveX, moveY);
            context.lineTo(pointX, pointY);
            context.stroke();
        };
        canvas.onmouseup = () => {
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

            // 如果此时处于撤销状态，此时再使用画笔，则将之后的状态清空，以刚画的作为最新的画布状态
            if (canvasCurrentHistory < canvasHistroyListRef.current.length) {
                canvasHistroyListRef.current = canvasHistroyListRef.current.slice(0, canvasCurrentHistory);
            }
            canvasHistroyListRef.current.push(imageData);
            setCanvasCurrentHistory(canvasCurrentHistory + 1);
            context.closePath();
            canvas.onmousemove = null;
            canvas.onmouseup = null;
        };
    };

    const handleMoveMode = (downX, downY) => {
        const { current: canvas } = canvasRef;
        const { current: wrap } = wrapRef;
        const { current: fillStartPointX } = fillStartPointXRef;
        const { current: fillStartPointY } = fillStartPointYRef;
        if (!canvas || !wrap || mouseMode !== 0) return;

        // 为容器添加移动事件，可以在空白处移动图片
        wrap.onmousemove = (event) => {
            const moveX = event.pageX;
            const moveY = event.pageY;

            translatePointXRef.current = fillStartPointX + (moveX - downX);
            translatePointYRef.current = fillStartPointY + (moveY - downY);

            canvas.style.transform = `scale(${canvasScale},${canvasScale}) translate(${translatePointXRef.current}px,${translatePointYRef.current}px)`;
        };

        wrap.onmouseup = (event) => {
            const upX = event.pageX;
            const upY = event.pageY;

            wrap.onmousemove = null;
            wrap.onmouseup = null;

            fillStartPointXRef.current = fillStartPointX + (upX - downX);
            fillStartPointYRef.current = fillStartPointY + (upY - downY);
        };
    };

    // 橡皮擦
    const handleEraserMode = (downX, downY) => {
        const { current: canvas } = canvasRef;
        const { current: wrap } = wrapRef;
        const context = canvas && canvas.getContext('2d');
        if (!canvas || !wrap || !context) return;

        const offsetLeft = canvas.offsetLeft;
        const offsetTop = canvas.offsetTop;
        downX = downX - offsetLeft;
        downY = downY - offsetTop;

        const { pointX, pointY } = generateLinePoint(downX, downY);

        context.beginPath();
        context.moveTo(pointX, pointY);

        canvas.onmousemove = null;
        canvas.onmousemove = (event) => {
            const moveX = event.pageX - offsetLeft;
            const moveY = event.pageY - offsetTop;
            const { pointX, pointY } = generateLinePoint(moveX, moveY);
            context.globalCompositeOperation = 'destination-out';
            context.lineTo(pointX, pointY);
            context.stroke();
        };
        canvas.onmouseup = () => {
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            if (canvasCurrentHistory < canvasHistroyListRef.current.length) {
                canvasHistroyListRef.current = canvasHistroyListRef.current.slice(0, canvasCurrentHistory);
            }
            canvasHistroyListRef.current.push(imageData);
            setCanvasCurrentHistory(canvasCurrentHistory + 1);
            context.closePath();
            canvas.onmousemove = null;
            canvas.onmouseup = null;
        };
    };

    // 画图形
    const handleGraphicalMode = (downX, downY) => {
        const { current: canvas } = canvasRef;
        const { current: wrap } = wrapRef;
        const context = canvas && canvas.getContext('2d');
        if (!canvas || !wrap || !context) return;

        const offsetLeft = canvas.offsetLeft;
        const offsetTop = canvas.offsetTop;
        // 减去画布偏移的距离（以画布为基准进行计算坐标）
        downX = downX - offsetLeft;
        downY = downY - offsetTop;

        const { pointX: startPointX, pointY: startPointY } = generateLinePoint(downX, downY);
        context.globalCompositeOperation = 'source-over';
        switch (graphicalType) {
            case RECTANGLE: // 矩形
                context.beginPath();
                context.moveTo(startPointX, startPointY);
                canvas.onmousemove = null;
                canvas.onmousemove = (event) => {
                    const { current: canvasHistroyList } = canvasHistroyListRef;
                    // 如果此时处于撤销状态，此时再使用画笔，则将之后的状态清空，以刚画的作为最新的画布状态
                    if (canvasCurrentHistory < canvasHistroyListRef.current.length) {
                        canvasHistroyListRef.current = canvasHistroyListRef.current.slice(0, canvasCurrentHistory);
                    }
                    context.putImageData(canvasHistroyList[canvasHistroyList.length - 1], 0, 0); // 每次绘制先清除上一次
                    const moveX = event.pageX - offsetLeft;
                    const moveY = event.pageY - offsetTop;
                    const { pointX, pointY } = generateLinePoint(moveX, moveY);
                    context.beginPath();
                    context.rect(startPointX, startPointY, pointX - startPointX, pointY - startPointY);
                    context.stroke();
                };
                canvas.onmouseup = (event) => {
                    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

                    // 如果此时处于撤销状态，此时再使用画笔，则将之后的状态清空，以刚画的作为最新的画布状态
                    if (canvasCurrentHistory < canvasHistroyListRef.current.length) {
                        canvasHistroyListRef.current = canvasHistroyListRef.current.slice(0, canvasCurrentHistory);
                    }
                    canvasHistroyListRef.current.push(imageData);
                    setCanvasCurrentHistory(canvasCurrentHistory + 1);
                    context.closePath();
                    canvas.onmousemove = null;
                    canvas.onmouseup = null;
                };
                break;
            case CIRCULAR: // 椭圆
                context.beginPath();
                context.moveTo(startPointX, startPointY);
                canvas.onmousemove = null;
                canvas.onmousemove = (event) => {
                    const { current: canvasHistroyList } = canvasHistroyListRef;
                    // 如果此时处于撤销状态，此时再使用画笔，则将之后的状态清空，以刚画的作为最新的画布状态
                    if (canvasCurrentHistory < canvasHistroyListRef.current.length) {
                        canvasHistroyListRef.current = canvasHistroyListRef.current.slice(0, canvasCurrentHistory);
                    }
                    context.putImageData(canvasHistroyList[canvasHistroyList.length - 1], 0, 0); // 每次绘制先清除上一次
                    const moveX = event.pageX - offsetLeft;
                    const moveY = event.pageY - offsetTop;
                    const { pointX, pointY } = generateLinePoint(moveX, moveY);
                    // 椭圆涉及到圆心和半径不能为负
                    if (pointX > startPointX) {
                        if (pointY > startPointY) {
                            context.beginPath();
                            context.ellipse(((pointX - startPointX) / 2) + startPointX, ((pointY - startPointY) / 2) + startPointY, (pointX - startPointX) / 2, (pointY - startPointY) / 2, 0, 0, 2 * Math.PI);
                            context.stroke();
                        } else if (pointY < startPointY) {
                            context.beginPath();
                            context.ellipse(((pointX - startPointX) / 2) + startPointX, (startPointY - (Math.abs(pointY - startPointY) / 2)), Math.abs(pointX - startPointX) / 2, Math.abs(pointY - startPointY) / 2, 0, 0, 2 * Math.PI);
                            context.stroke();
                        }
                    } else if (pointX < startPointX) {
                        if (pointY > startPointY) {
                            context.beginPath();
                            context.ellipse((startPointX - Math.abs((pointX - startPointX) / 2)), ((pointY - startPointY) / 2) + startPointY, Math.abs((pointX - startPointX) / 2), (pointY - startPointY) / 2, 0, 0, 2 * Math.PI);
                            context.stroke();
                        } else if (pointY < startPointY) {
                            context.beginPath();
                            context.ellipse((startPointX - Math.abs((pointX - startPointX) / 2)), (startPointY - (Math.abs(pointY - startPointY) / 2)), Math.abs(pointX - startPointX) / 2, Math.abs(pointY - startPointY) / 2, 0, 0, 2 * Math.PI);
                            context.stroke();
                        }
                    }
                };
                canvas.onmouseup = (event) => {
                    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

                    // 如果此时处于撤销状态，此时再使用画笔，则将之后的状态清空，以刚画的作为最新的画布状态
                    if (canvasCurrentHistory < canvasHistroyListRef.current.length) {
                        canvasHistroyListRef.current = canvasHistroyListRef.current.slice(0, canvasCurrentHistory);
                    }
                    canvasHistroyListRef.current.push(imageData);
                    setCanvasCurrentHistory(canvasCurrentHistory + 1);
                    context.closePath();
                    canvas.onmousemove = null;
                    canvas.onmouseup = null;
                };
                break;
            default:
                break;
        }
    };

    const handlePutMode = (downX, downY) => {
        const { current: canvas } = canvasRef;
        const { current: wrap } = wrapRef;
        const context = canvas && canvas.getContext('2d');
        if (!canvas || !wrap || !context) return;

        const offsetLeft = canvas.offsetLeft;
        const offsetTop = canvas.offsetTop;
        downX = downX - offsetLeft;
        downY = downY - offsetTop;

        const { pointX, pointY } = generateLinePoint(downX, downY);
        context.save();
        context.beginPath();
        context.moveTo(pointX, pointY);

        canvas.onmousemove = null;
        canvas.onmousemove = (event) => {
            const moveX = event.pageX - offsetLeft;
            const moveY = event.pageY - offsetTop;
            const { pointX, pointY } = generateLinePoint(moveX, moveY);
            const isPointInPath = context.isPointInPath(pointX, pointY);
            console.log('isPointInPath', isPointInPath);
            console.log('pointX', pointX);
            console.log('pointY', pointY);
            // context.globalCompositeOperation = 'destination-out';
            // context.lineTo(pointX, pointY);
            // context.stroke();
        };
        canvas.onmouseup = () => {
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            if (canvasCurrentHistory < canvasHistroyListRef.current.length) {
                canvasHistroyListRef.current = canvasHistroyListRef.current.slice(0, canvasCurrentHistory);
            }
            canvasHistroyListRef.current.push(imageData);
            setCanvasCurrentHistory(canvasCurrentHistory + 1);
            context.closePath();
            canvas.onmousemove = null;
            canvas.onmouseup = null;
        };
    };

    /**
     * 控制画布
     */
    const handleCanvas = () => {
        const { current: canvas } = canvasRef;
        const { current: wrap } = wrapRef;
        const context = canvas && canvas.getContext('2d');
        if (!context || !wrap) return;

        // 清除上一次设置的监听，以防获取参数错误
        wrap.onmousedown = null;
        wrap.onmousedown = function(event) {
            const downX = event.pageX;
            const downY = event.pageY;

            switch (mouseMode) {
                case MOVE_MODE:
                    handleMoveMode(downX, downY);
                    break;
                case LINE_MODE:
                    handleLineMode(downX, downY);
                    break;
                case ERASER_MODE:
                    handleEraserMode(downX, downY);
                    break;
                case GRAPHICAL_MODE:
                    handleGraphicalMode(downX, downY);
                    break;
                case PUT_MODE:
                    handlePutMode(downX, downY);
                    break;
                default:
                    break;
            }
        };

        // 鼠标滚轮控制缩放
        wrap.onwheel = null;
        wrap.onwheel = (e) => {
            const { deltaY } = e;
            const newScale = deltaY > 0
                ? (canvasScale * 10 - 0.1 * 10) / 10
                : (canvasScale * 10 + 0.1 * 10) / 10;
            if (newScale < 0.1 || newScale > 2) return;
            setCanvasScale(newScale);
        };
    };

    /**
     * 缩放
     * @param {*} value 缩放比例
     */
    const handleScaleChange = (value) => {
        setCanvasScale(value);
    };

    /**
     * 设置线宽
     * @param {*} value 线宽
     */
    const handleLineWidthChange = (value) => {
        setLineWidth(value);
    };

    /**
     * 设置颜色
     * @param {*} color 颜色
     */
    const handleColorChange = (color) => {
        setLineColor(color);
    };

    /**
     * 模式选择
     * @param {*} event 事件对象
     */
    const handleMouseModeChange = (value) => {
        const { current: canvas } = canvasRef;
        const { current: wrap } = wrapRef;

        setMouseMode(value);

        if (!canvas || !wrap) return;
        switch (value) {
            case MOVE_MODE:
                canvas.style.cursor = 'move';
                wrap.style.cursor = 'move';
                break;
            case LINE_MODE:
                canvas.style.cursor = `url('https://tcdn.kaishustory.com/kstory/pangu/image/9a5ac58a-8c8c-4cbe-b43a-a0472f2927be_info__s=4286.ico') 6 26, pointer`;
                wrap.style.cursor = 'default';
                break;
            case ERASER_MODE:
                canvas.style.cursor = `url('https://tcdn.kaishustory.com/kstory/pangu/image/8206bc98-ecb8-4713-9840-a6e35b574cd4_info__s=4286.ico') 6 26, pointer`;
                wrap.style.cursor = 'default';
                break;
            case GRAPHICAL_MODE:
                canvas.style.cursor = `default`;
                wrap.style.cursor = 'default';
                break;
            default:
                canvas.style.cursor = 'default';
                wrap.style.cursor = 'default';
                break;
        }
    };

    /**
     * 图形类型选择
     */
    const handleGraphicalTypeChange = (value) => {
        setGraphicalType(value);
    };

    /**
     * 处理保存
     */
    const handleSaveClick = async() => {
        const { current: canvas } = canvasRef;
        const drawImg = await combineImg(fillImageSrc, canvas && canvas.toDataURL());
        props.handleSave && props.handleSave(drawImg);
    };

    /**
     * 图片合成
     * @param {*} firstImg 第一张图
     * @param {*} secondImg 第二张图
     */
    const combineImg = (firstImg, secondImg) => {
        const { current: canvas } = canvasRef;
        try {
            return new CompositePicture({
                imgData: {
                    imgLoadType: 'order',
                    imgList: [
                        { // 商品图
                            url: firstImg,
                            width: canvas.width,
                            height: canvas.height,
                        }, { // 商品图标
                            url: secondImg,
                            width: canvas.width,
                            height: canvas.height,
                        }
                    ]
                },
                canvasData: {
                    width: canvas.width,
                    height: canvas.height,
                    containId: 'combineImg'
                },
            }).getBase64().then((res) => {
                return res;
            });
        } catch (e) {
            console.log(e);
        }
    };

    /**
     * undo
     */
    const handleRollBack = () => {
        const isFirstHistory = canvasCurrentHistory === 1;
        if (canvasCurrentHistory === 2) { // 回退到最后一步，如果选中的是橡皮擦，就重置为移动模式
            if (mouseMode === ERASER_MODE) {
                handleMouseModeChange(MOVE_MODE);
            }
        }
        if (isFirstHistory) {
            return;
        }
        setCanvasCurrentHistory(canvasCurrentHistory - 1);
    };

    /**
     * redo
     */
    const handleRollForward = () => {
        const { current: canvasHistroyList } = canvasHistroyListRef;
        const isLastHistory = canvasCurrentHistory === canvasHistroyList.length;
        if (isLastHistory) return;
        setCanvasCurrentHistory(canvasCurrentHistory + 1);
    };

    /**
     * 清空画布历史
     */
    const handleClearCanvasClick = () => {
        const { current: canvas } = canvasRef;
        const context = canvas && canvas.getContext('2d');
        if (!canvas || !context || canvasCurrentHistory === 0) return;

        // 清空画布历史
        canvasHistroyListRef.current = [canvasHistroyListRef.current[0]];
        setCanvasCurrentHistory(1);
        handleMouseModeChange(MOVE_MODE);
        message.success('画布清除成功！');
    };

    return (
        <div className="mark-paper">
            <div className="mark-paper-container" ref={containerRef}>
                <div className="mark-paper-wrap" ref={wrapRef}>
                    <div
                        className="mark-paper-mask"
                        style={{ display: isLoading ? 'flex' : 'none' }}
                    >
                        <Spin
                            tip="图片加载中..."
                            indicator={<Icon type="loading" style={{ fontSize: 36 }} spin />}
                        />
                    </div>
                    <canvas
                        ref={canvasRef}
                    >
                        <p>您的电脑并不能很好的使用这个功能，请换M1</p>
                    </canvas>
                </div>
                <div className="mark-paper-sider">
                    <div>
                        画布操作：<br />
                        <div className="mark-paper-action">
                            <Tooltip title="撤销">
                                <Icon
                                    type="undo"
                                    onClick={handleRollBack}
                                    className={`icon ${canvasCurrentHistory <= 1 && 'disable'}`}
                                />
                            </Tooltip>
                            <Tooltip title="恢复">
                                <Icon type="redo"
                                    onClick={handleRollForward}
                                    className={`icon ${canvasCurrentHistory >= canvasHistroyListRef.current.length && 'disable'}`}
                                />
                            </Tooltip>
                            <Popconfirm
                                title="确定清空画布吗？"
                                onConfirm={handleClearCanvasClick}
                                okText="确定"
                                cancelText="取消"
                            >
                                <Tooltip title="清空">
                                    <Icon type="retweet" className={`icon ${canvasCurrentHistory <= 1 && 'disable'}`} />
                                </Tooltip>
                            </Popconfirm>
                        </div>
                    </div>
                    <div>
                        画布缩放：
                        <Tooltip placement="top" title='可用鼠标滚轮进行缩放'>
                            <Icon type="question-circle" />
                        </Tooltip>
                        <Slider
                            min={0.1}
                            max={2.01}
                            step={0.1}
                            value={canvasScale}
                            tipFormatter={(value) => `${(value).toFixed(2)}`}
                            onChange={handleScaleChange} />
                    </div>
                    <div>
                        画笔大小：
                        <Slider
                            min={1}
                            max={30}
                            value={lineWidth}
                            tipFormatter={(value) => `${value}px`}
                            onChange={handleLineWidthChange} />
                    </div>
                    <div>
                        模式选择：
                        <div className='graphical-container'>
                            {
                                ACTION_TYPE.map(({ VALUE, TOOLTIP, ICON_URL }) => {
                                    if (canvasCurrentHistory <= 1 && VALUE === ERASER_MODE) {
                                        return (<div
                                            key={VALUE}
                                            className={`graphical-icon`}
                                            style={{
                                                cursor: 'not-allowed'
                                            }}
                                        >
                                            <Tooltip title={'您没有进行任何修改，暂不能使用橡皮擦...'}>
                                                <img src={ICON_URL} disabled={true} />
                                            </Tooltip>
                                        </div>);
                                    }
                                    return (<div
                                        key={VALUE}
                                        className={`graphical-icon ${mouseMode === VALUE ? 'graphical-icon-active' : ''}`}
                                        onClick={handleMouseModeChange.bind(this, VALUE)}
                                    >
                                        <Tooltip title={TOOLTIP}>
                                            <img src={ICON_URL} />
                                        </Tooltip>
                                    </div>);
                                })
                            }
                        </div>
                    </div>
                    {
                        mouseMode === GRAPHICAL_MODE && <div>
                            图形：
                            <div className='graphical-container'>
                                {
                                    GRAPHICAL_TYPE.map(({ VALUE, TOOLTIP, ICON_URL }) => (<div
                                        key={VALUE}
                                        className={`graphical-icon ${graphicalType === VALUE ? 'graphical-icon-active' : ''}`}
                                        onClick={handleGraphicalTypeChange.bind(this, VALUE)}
                                    >
                                        <Tooltip title={TOOLTIP}>
                                            <img src={ICON_URL} />
                                        </Tooltip>
                                    </div>))
                                }
                            </div>
                        </div>
                    }
                    <div className="color-picker">
                        颜色选择：
                        <div className="color-picker-container">
                            {['#fa4b2a', '#ffff00', '#ee00ee', '#1890ff', '#333333', '#ffffff'].map((color) => {
                                return (
                                    <Tooltip placement="top" title={color} key={color}>
                                        <div
                                            role="button"
                                            className={`color-picker-wrap ${color === lineColor && 'color-picker-wrap-active'}`}
                                            style={{ background: color }}
                                            onClick={() => handleColorChange(color)}
                                        />
                                    </Tooltip>
                                );
                            })}
                        </div>
                    </div>
                    <Button
                        type="primary"
                        className="mark-paper-sider-save"
                        onClick={handleSaveClick}
                        disabled={isLoading || canvasCurrentHistory <= 1}
                    >
                            保存图片
                    </Button>
                </div>
            </div>
        </div >
    );
};

MarkPaper.propTypes = {
    imgUrl: PropTypes.string,
    handleSave: PropTypes.func
};

export default MarkPaper;
