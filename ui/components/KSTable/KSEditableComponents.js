import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Icon } from 'antd';
const FormItem = Form.Item;
const EditableContext = React.createContext();

/**
 * 列表行
 * @param {Object} form  form对象
 * @param {Number} index 下标
 * @param {Object} props 默认父属性
 */
const EditableRow = ({ form, index, ...props }) => (
    <EditableContext.Provider value={form}>
        <tr {...props} />
    </EditableContext.Provider>
);

EditableRow.propTypes = {
    form: PropTypes.object,
    index: PropTypes.number,
};

/**
 * form包裹后的组件
 * @type {ReactNode}
 */
export const EditableFormRow = Form.create()(EditableRow);

/**
 * 表格组件
 * @type {ReactNode}
 */
export class EditableCell extends React.Component {
    static propTypes = {
        editable: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.object,
        ]),
        updateRender: PropTypes.func,
        record: PropTypes.object,
        cellSave: PropTypes.func,
        dataIndex: PropTypes.string,
        title: PropTypes.string,
        index: PropTypes.number,
    }

    state = {
        editing: false,
    }

    componentDidMount() {
        if (this.props.editable) {
            document.addEventListener('click', this.handleClickOutside, true);
        }
    }

    componentWillUnmount() {
        if (this.props.editable) {
            document.removeEventListener('click', this.handleClickOutside, true);
        }
    }

    /**
     * 变更编辑状态
     */
    toggleEdit = () => {
        const editing = !this.state.editing;
        const { updateRender } = this.props;
        // 变更编辑状态强制更新父组件
        updateRender && updateRender();
        this.setState({ editing }, () => {
            if (editing) {
                this.input.focus();
            }
        });
    }

    /**
     * 点击目标外事件监听
     * @param  {Object} e // 默认点击事件
     */
    handleClickOutside = (e) => {
        const { editing } = this.state;
        if (editing && this.cell !== e.target && !this.cell.contains(e.target)) {
            this.save();
        }
    }

    /**
     * 保存事件
     */
    save = () => {
        const { record, cellSave, dataIndex } = this.props;
        this.form.validateFields((error, values) => {
            if (error) {
                return;
            }
            this.toggleEdit();
            let newRecord = {
                    ...record,
                    ...values
                },
                isChanged = false;
            Object.keys(newRecord).forEach((key) => {
                if (newRecord[key] !== record[key]) {
                    isChanged = true;
                }
            });
            if (isChanged) {
                if (newRecord.sortNum) {
                    delete newRecord.sortNum;
                }
                cellSave && cellSave(newRecord, dataIndex);
            }
        });
    }

    render() {
        const { editing } = this.state;
        const {
            editable,
            dataIndex,
            title,
            record,
            index,
            cellSave,
            updateRender,
            ...restProps
        } = this.props;
        return (
            <td ref={(node) => (this.cell = node)} {...restProps}>
                {editable ? (
                    <EditableContext.Consumer>
                        {(form) => {
                            this.form = form;
                            // 默认为必填
                            let rules = editable && editable.rules ? editable.rules : [{
                                required: true,
                                message: `${title}不能为空`,
                            }];
                            return (
                                editing ? (
                                    <FormItem style={{ margin: 0 }}>
                                        {form.getFieldDecorator(dataIndex, {
                                            rules: rules,
                                            initialValue: record[dataIndex],
                                        })(
                                            <Input
                                                ref={(node) => (this.input = node)}
                                                onPressEnter={this.save}
                                            />
                                        )}
                                    </FormItem>
                                ) : (
                                    <div>
                                        <Icon
                                            type="edit"
                                            className="editable-cell-value-wrap"
                                            onClick={this.toggleEdit}
                                            style={{paddingRight: 10}}
                                            title="编辑"
                                        />
                                        <span
                                            style={{ paddingRight: 24 }}
                                        >
                                            {restProps.children}
                                        </span>
                                    </div>
                                )
                            );
                        }}
                    </EditableContext.Consumer>
                ) : restProps.children}
            </td>
        );
    }
}
