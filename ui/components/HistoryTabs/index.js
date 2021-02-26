import React, { Component } from 'react';
import { Tabs } from 'antd';
import PropTypes from 'prop-types';
import './style.scss';

const { TabPane } = Tabs;

export default class HisToryTabs extends Component {
    static propTypes = {
        global: PropTypes.object,
        dispatch: PropTypes.func,
        handleHisToryTabsChange: PropTypes.func,
        HisToryTabsList: PropTypes.array,
        hisToryTabsActiveKey: PropTypes.string,
        handleHisToryTabsRemove: PropTypes.func
    }

    onChange = (activeKey) => {
        this.props.handleHisToryTabsChange(activeKey);
    }

    onEdit = (targetKey, action) => {
        this[action](targetKey);
    }

    remove = (targetKey) => {
        this.props.handleHisToryTabsRemove && this.props.handleHisToryTabsRemove(targetKey);
    }

    render() {
        const { HisToryTabsList = [], hisToryTabsActiveKey } = this.props;
        const HisToryTabsListLength = HisToryTabsList.length;
        return (
            <div className='historyTabs-container'>
                {
                    HisToryTabsListLength ? <Tabs
                        hideAdd
                        type="editable-card"
                        onChange={this.onChange}
                        activeKey={hisToryTabsActiveKey}
                        onEdit={this.onEdit}
                    >
                        {
                            HisToryTabsList.map(({name, path}) => <TabPane
                                tab={name}
                                key={path}
                                closable={HisToryTabsListLength !== 1}
                            />)
                        }
                    </Tabs> : null
                }
            </div>
        );
    }
}
