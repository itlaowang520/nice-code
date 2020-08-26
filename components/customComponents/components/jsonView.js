import React from 'react';
import { Drawer } from 'antd';
import ReactJson from 'react-json-view';
import PropTypes from 'prop-types';
const JsonView = ({ visible, onClose, viewJson }) => {
    return (
        <Drawer
            title="Json预览"
            placement="right"
            width={640}
            closable={false}
            onClose={onClose}
            visible={visible}
        >
            <ReactJson src={viewJson}
                iconStyle={'square'}
                enableClipboard={true}
                name={null} // 根节点的名称

            />
        </Drawer>
    );
};
JsonView.propTypes = {
    visible: PropTypes.bool,
    onClose: PropTypes.func,
    viewJson: PropTypes.object
};
export default JsonView;
