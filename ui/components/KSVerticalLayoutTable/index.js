import React from 'react';
import PropTypes from 'prop-types';
import KSTable from './../KSTable';
import KSColumnLayout from './../KSColumnLayout';
// import './index.scss';

export default class KSVerticalLayoutTable extends React.PureComponent {
    static propTypes = {
        upTitle: PropTypes.node,
        downTitle: PropTypes.node, // 下节点title
        upProps: PropTypes.object,
        downProps: PropTypes.object,
    }

    state = {
        vNum: window.innerHeight / 2
    }

    render() {
        const { vNum } = this.state;
        const {
            upTitle,
            downTitle,
            upProps,
            downProps
        } = this.props;
        return (
            <KSColumnLayout
                upTitle={upTitle}
                downTitle={downTitle}
                onResize={(newVNum) => {
                    if (newVNum <= 246) {
                        newVNum = 246;
                    }
                    this.setState({
                        vNum: newVNum
                    });
                }}
                upNode={(
                    <KSTable
                        autoHeight={{
                            type: 'column',
                            height: vNum,
                            layout: 'up'
                        }}
                        {...upProps}
                    />
                )}
                downNode={(
                    <KSTable
                        autoHeight={{
                            type: 'column',
                            height: window.innerHeight - vNum,
                            layout: 'down'
                        }}
                        {...downProps}
                    />
                )}
            />
        );
    }
}
