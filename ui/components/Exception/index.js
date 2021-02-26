import React, { createElement } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import config from './typeConfig';
import './index.scss';

const Exception = ({ className, linkElement = 'a', type, title, desc, img, actions, ...rest }) => {
    const pageType = type in config ? type : '404';
    const clsString = className ? 'exception ' + className : 'exception';
    return (
        <div className={clsString} {...rest}>
            <div className='imgBlock'>
                <div
                    className='imgEle'
                    style={{ backgroundImage: `url(${img || config[pageType].img})` }}
                />
            </div>
            <div className='content'>
                <h1>{title || config[pageType].title}</h1>
                <div className='desc'>{desc || config[pageType].desc}</div>
                <div className='actions'>
                    {actions ||
                    createElement(
                        linkElement,
                        {
                            to: '/',
                            href: '/',
                        },
                        <Button type="primary">返回首页</Button>
                    )}
                </div>
            </div>
        </div>
    );
};

Exception.propTypes = {
    className: PropTypes.string, // 类名
    linkElement: PropTypes.string, // 标签名
    type: PropTypes.string, // 类型
    title: PropTypes.string, // 标题
    desc: PropTypes.string, // 描述
    img: PropTypes.string, // 背景图
    actions: PropTypes.node, // 跳转节点
};

export default Exception;
