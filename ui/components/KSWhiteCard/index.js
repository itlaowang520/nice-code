import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import './index.scss';

export default class KSWhiteCard extends React.PureComponent {
    static propTypes = {
        style: PropTypes.object,
        title: PropTypes.node,
        pageTitle: PropTypes.node,
        className: PropTypes.string,
        children: PropTypes.node, // 内容
        actions: PropTypes.node, // 按钮
        isPaved: PropTypes.bool, // 是否铺满整屏
    };

    static defaultProps = {
        className: ''
    }

    getTitle = () => {
        const { title } = this.props;
        if (title) {
            return <div className="whiteCard-title">
                {
                    title
                }
            </div>;
        } else {
            return null;
        }
    };

    getPageTitle = () => {
        const { actions, pageTitle } = this.props;
        let children = pageTitle;
        if (actions) {
            children = <Row>
                <Col span={12} style={{lineHeight: '32px'}}>
                    {children}
                </Col>
                <Col span={12} align='right'>
                    {actions}
                </Col>
            </Row>;
        }
        if (pageTitle) {
            return <div className="whiteCard-page-title">
                {children}
            </div>;
        } else {
            return null;
        }
    };

    render() {
        const { className, isPaved } = this.props;
        const paved = isPaved || false;
        return (
            <div
                className={`${className} ${paved ? 'paved' : ''} whiteCard`}
                style={this.props.style || {}}
            >
                {
                    this.getTitle()
                }
                {
                    this.getPageTitle()
                }
                <div className={this.props.pageTitle ? 'whiteCard-page-content' : 'whiteCard-content'}>
                    {
                        this.props.children
                    }
                </div>
            </div>
        );
    }
}
