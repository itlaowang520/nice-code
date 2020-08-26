import React from 'react';
import { connect } from 'kredux';
import { goto } from 'ks-cms-utils';
import PropTypes from 'prop-types';
import { Form, Input, Button, Row, Col, Icon, Select, InputNumber, Radio, Tooltip, DatePicker } from 'antd';
import { KSWhiteCard, KSContainer, KSColorPicker } from 'ks-cms-ui';
import { titleFormItemLayout, remarkFormItemLayout, formItemLayout, DATA_TYPE_ALL, DATA_TYPE_CONSTANT, initFormData } from './constants';
import { getRandomId, deepCopy, save, filterData } from './utils';
import './style.scss';
import { isAuth } from 'Src/utils/utils';
import { BizSelectModal } from 'Src/components';
import JsonView from './components/jsonView';
import moment from 'moment';
import GeneraterModal from './components/generaterModal';

const FormItem = Form.Item;
const Option = Select.Option;

const RadioGroup = Radio.Group;
const isDeveloper = isAuth('templateMgt_customComponents_developerAuth'); // 是否开发者权限

@connect(({ customComponents, loading }) => ({
    customComponents,
    saveCustomComponentsLoading: loading.effects['customComponents/createCustomComponents'],
    updateCustomComponentsLoading: loading.effects['customComponents/updateCustomComponents'],
}))
@Form.create()
export default class CustomComponentsModal extends React.PureComponent {

    static propTypes = {
        customComponents: PropTypes.object, // 自定义组件redux
        saveCustomComponentsLoading: PropTypes.bool, // 加载createCustomComponents的状态
        updateCustomComponentsLoading: PropTypes.bool, // 加载updateCustomComponents的状态
        dispatch: PropTypes.func, // 触发redux的方法
        form: PropTypes.object, // Form对象
        match: PropTypes.object, // 路由传参
    }

    state = {
        visible: false, // JSON预览
        viewJson: {}, // json对象
        customArr: [ // 数据
            {
                id: getRandomId(),
                layer: 1, // 层级
                child: [], // 子节点
                key: '', // 键名
                value: '', // 值
                valueType: '', // 值类型
                remark: '', // 字段含义
                type: undefined, // 当前节点类型
            }
        ]
    }

    componentDidMount() {
        this.feedback(); // 回显数据
    }
    // 处理数据回显
    feedback = () => {
        const { id: currId } = this.props.match.params;
        if (currId > 0) {
            this.props.dispatch({
                type: 'customComponents/getCustomComponents',
                payload: currId
            }).then(
                () => {
                    const { customComponentsInfo } = this.props.customComponents;
                    const { templateContent: { initialData } } = customComponentsInfo;
                    if (initialData.length) {
                        this.setState({
                            customArr: initialData
                        });
                    }
                }
            );
        }
    }

    // 更新state
    stateUp = (newState) => {
        this.setState({
            customArr: newState
        });
    }

    // 处理表单变化---数据双向绑定
    handleFormChange = (currId, formName, formValue) => {
        // console.log('formName', formName);
        // console.log('formValue', formValue);
        return new Promise((resolve, reject) => {
            let currData = deepCopy(this.state.customArr);
            // 逐级查找，对点赋值
            const progressiveSearch = (data) => {
                data.forEach((item) => {
                    if (item.id === currId) { // 找到对应层级数据进行赋值
                        item[formName] = formValue;
                    } else if (item.child && item.child.length) {
                        progressiveSearch(item.child);
                    }
                });
            };
            progressiveSearch(currData);
            this.stateUp(currData);
            resolve();
        }).catch((e) => {
            console.log('e', e);
        });
    }

    // 移除节点数据
    removeNode = (Removedata) => {
        let currData = deepCopy(this.state.customArr);
        // 找到对应的节点，执行删除
        const progressiveRemove = (data) => {
            data.forEach((item, index) => {
                if (item.id === Removedata.id) {
                    data.splice(index, 1);
                } else if (item.child && item.child.length) {
                    progressiveRemove(item.child);
                }
            });
        };
        progressiveRemove(currData);
        this.stateUp(currData);
    }
    // 添加同级节点
    addSameLevelNode = (currNode) => {
        let currData = deepCopy(this.state.customArr);
        // 找到对应节点，添加同级节点
        const progressiveAddSame = (data) => {
            data.forEach((item, index) => {
                if (item.id === currNode.id) {
                    data.splice(index + 1, 0, {
                        id: getRandomId(),
                        ...initFormData,
                        layer: item.layer
                    });
                } else if (item.child && item.child.length) {
                    progressiveAddSame(item.child);
                }
            });
        };
        progressiveAddSame(currData);
        this.stateUp(currData);
    }

    // 添加下级节点
    addNextLevelNode = (currNode) => {
        let currData = deepCopy(this.state.customArr);
        // 找到对应节点，添加同级节点
        const progressiveAddNext = (data) => {
            data.forEach((item, index) => {
                if (item.id === currNode.id) {
                    item.child.push({
                        id: getRandomId(),
                        ...initFormData,
                        layer: item.layer + 1
                    });
                } else if (item.child && item.child.length) {
                    progressiveAddNext(item.child);
                }
            });
        };
        progressiveAddNext(currData);
        this.stateUp(currData);
    }

    // 关闭JSON预览弹层
    onClose = () => {
        this.setState({
            visible: false
        });
    }

    // 处理生成模版
    handleGenerater(generaterData) {
        let currData = [],
            layer = 0;
        const progressiveGenrate = (data) => {
            layer++; // 这里还存在问题，如果层级深的话，取值不对
            return Object.entries(data).map((item, index) => {
                switch (Object.prototype.toString.call(item[1])) {
                    case '[object Object]':
                        return {
                            id: getRandomId(),
                            ...initFormData,
                            layer: layer,
                            type: 'object',
                            key: item[0],
                            child: progressiveGenrate(item[1])
                        };
                    case '[object Array]':
                        return {
                            id: getRandomId(),
                            ...initFormData,
                            layer: layer,
                            type: 'array',
                            key: item[0],
                            child: progressiveGenrate(item[1])
                        };
                    case '[object Number]':
                        return {
                            id: getRandomId(),
                            ...initFormData,
                            layer: layer,
                            type: 'number',
                            key: item[0],
                        };
                    case '[object String]':
                        return {
                            id: getRandomId(),
                            ...initFormData,
                            layer: layer,
                            type: 'string',
                            key: item[0]
                        };
                }
            });
        };
        currData = progressiveGenrate(JSON.parse(generaterData));
        this.setState({
            customArr: currData
        });
    }

    // 内容渲染
    contentRender = (data) => {
        let currType = data.type,
            currId = data.id,
            childComponent;
        switch (currType) {
            case DATA_TYPE_CONSTANT.STRING:
                childComponent = <div>
                    <FormItem
                        {...formItemLayout}
                        label="字段类型"
                    >
                        <RadioGroup
                            value={data.valueType}
                            disabled={!isDeveloper}
                            onChange={
                                async(e) => {
                                    await this.handleFormChange(currId, 'value', '');
                                    await this.handleFormChange(currId, 'valueType', e.target.value);
                                }
                            }
                        >
                            <Radio value={'input'}>文本</Radio>
                            <Radio value={'image'}>图片</Radio>
                            <Radio value={'audio'}>音频</Radio>
                            <Radio value={'video'}>视频</Radio>
                            <Radio value={'time'}>时间</Radio>
                            <Radio value={'color'}>颜色</Radio>
                        </RadioGroup>
                    </FormItem>
                    {
                        data.valueType === 'input' && <FormItem
                            {...formItemLayout}
                            label="字段值"
                        >
                            <Input
                                placeholder='请输入文字'
                                value={data.value}
                                onChange={
                                    (e) => {
                                        this.handleFormChange(currId, 'value', e.target.value);
                                    }
                                }
                            />
                        </FormItem>
                    }
                    {
                        data.valueType === 'time' && <FormItem
                            {...formItemLayout}
                            label="字段值"
                        >
                            <DatePicker
                                placeholder='请选择时间'
                                value={data.value ? moment(data.value) : null}
                                showTime
                                format="YYYY-MM-DD HH:mm:ss"
                                onChange={
                                    (value) => {
                                        this.handleFormChange(currId, 'value', Number(moment(value).format('x')));
                                    }
                                }
                            />
                        </FormItem>
                    }
                    {
                        data.valueType === 'color' && <FormItem
                            {...formItemLayout}
                            label="字段值"
                        >
                            <KSColorPicker
                                placeholder='请选择颜色'
                                value={data.value}
                                onChange={
                                    (value) => {
                                        this.handleFormChange(currId, 'value', value);
                                    }
                                }
                            />
                        </FormItem>
                    }
                    {
                        data.valueType && (data.valueType === 'image' || data.valueType === 'audio' || data.valueType === 'video') && <FormItem
                            {...formItemLayout}
                            label="字段值"
                        >
                            <BizSelectModal
                                type={data.valueType}
                                value={data.value}
                                onChange={
                                    (value) => {
                                        this.handleFormChange(currId, 'value', value);
                                    }
                                }
                            />
                        </FormItem>
                    }
                </div>;
                break;
            case DATA_TYPE_CONSTANT.NUMBER:
                childComponent = <FormItem
                    {...formItemLayout}
                    label="字段值"
                >
                    <InputNumber
                        placeholder='请输入数字'
                        style={{ width: '100%' }}
                        value={data.value}
                        onChange={
                            (value) => {
                                this.handleFormChange(currId, 'value', value);
                            }
                        }
                    />
                </FormItem>;
                break;
        }
        if (currType === DATA_TYPE_CONSTANT.STRING || currType === DATA_TYPE_CONSTANT.NUMBER) {
            return <div>{childComponent}</div>;
        }
    }

    // 层级渲染
    onRender = (dataList) => {
        return (dataList || []).map((data) => {
            const { id: currId } = data;
            return (
                <Row
                    key={currId}
                    className={'mar-t-4'}
                >
                    <KSContainer
                        iconToggle
                        title={
                            <Row type='flex' justify='start'>
                                <Col span={2}>
                                    <FormItem
                                        className={'clear-formitem-margin'}
                                    >
                                        {
                                            `第${data.layer}层级`
                                        }
                                    </FormItem>
                                </Col>
                                <Col span={5}>
                                    <FormItem
                                        className={'clear-formitem-margin'}
                                        {...titleFormItemLayout}
                                        label="键名"
                                    >
                                        <Input
                                            value={data.key}
                                            placeholder='请输入字段键名'
                                            disabled={!isDeveloper}
                                            onChange={
                                                (e) => {
                                                    this.handleFormChange(currId, 'key', e.target.value);
                                                }
                                            }
                                        />
                                    </FormItem>
                                </Col>
                                <Col span={7}>
                                    <FormItem
                                        className={'clear-formitem-margin'}
                                        {...remarkFormItemLayout}
                                        label="含义"
                                    >
                                        <Tooltip
                                            trigger={['focus', 'hover']}
                                            title={data.remark}
                                            placement="topLeft"
                                            overlayClassName="numeric-input"
                                        >
                                            <Input
                                                value={data.remark}
                                                placeholder='请输入含义'
                                                disabled={!isDeveloper}
                                                onChange={
                                                    (e) => {
                                                        this.handleFormChange(currId, 'remark', e.target.value);
                                                    }
                                                }
                                            />
                                        </Tooltip>
                                    </FormItem>
                                </Col>
                                <Col span={5}>
                                    <FormItem
                                        className={'clear-formitem-margin'}
                                        {...titleFormItemLayout}
                                        label="数据类型"
                                    >
                                        <Select
                                            style={{ width: '100%' }}
                                            placeholder='选择数据类型'
                                            disabled={!isDeveloper}
                                            value={data.type}
                                            onChange={
                                                async(value) => {
                                                    await this.handleFormChange(currId, 'value', '');
                                                    await this.handleFormChange(currId, 'type', value);
                                                }
                                            }
                                        >
                                            {
                                                DATA_TYPE_ALL.map(({ key, value }) =>
                                                    <Option key={key} value={key}>{value}</Option>
                                                )
                                            }
                                        </Select>
                                    </FormItem>
                                </Col>
                                <Col span={5} style={{ textAlign: 'right' }}>
                                    <FormItem
                                        className={'clear-formitem-margin'}
                                    >
                                        {
                                            isDeveloper && <Button
                                                type='primary'
                                                size='small'
                                                onClick={this.addSameLevelNode.bind(this, data)}
                                            >添加同级</Button>
                                        }
                                        {
                                            (data.type === DATA_TYPE_CONSTANT.OBJECT || data.type === DATA_TYPE_CONSTANT.ARRAY || !data.type) && isDeveloper && <Button
                                                className='mar-l-4'
                                                type='primary'
                                                size='small'
                                                onClick={this.addNextLevelNode.bind(this, data)}
                                            >添加下级</Button>
                                        }
                                        {
                                            isDeveloper && <Button
                                                className='mar-l-4'
                                                type='danger'
                                                size='small'
                                                onClick={this.removeNode.bind(this, data)}
                                            >移除</Button>
                                        }
                                    </FormItem>
                                </Col>
                            </Row>
                        }
                    >
                        {
                            this.contentRender(data)
                        }
                        {
                            data.child && data.child.length ? this.onRender(data.child) : null
                        }
                    </KSContainer>
                </Row>
            );
        });
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const { saveCustomComponentsLoading, updateCustomComponentsLoading } = this.props;
        const { customComponentsInfo, generaterModalVisiable } = this.props.customComponents;
        const { customArr, viewJson, visible } = this.state;
        return (
            <KSWhiteCard
                pageTitle={(
                    <div>
                        <Form>
                            <Row>
                                <Col span={5}>
                                    <FormItem
                                        className={'clear-formitem-margin'}
                                        {...formItemLayout}
                                        label="组件名称"
                                    >
                                        {getFieldDecorator(`defineTemplateName`, {
                                            rules: [
                                                {required: true, message: '请填写组件名称'}
                                            ],
                                            initialValue: customComponentsInfo.defineTemplateName
                                        })(
                                            <Input
                                                placeholder='请输入组件名称'
                                                disabled={!isDeveloper}
                                            />
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={5}>
                                    <FormItem
                                        className={'clear-formitem-margin'}
                                        {...formItemLayout}
                                        label="组件标识"
                                    >
                                        {getFieldDecorator(`templateFlag`, {
                                            rules: [
                                                {required: true, message: '请填写组件标识'}
                                            ],
                                            initialValue: customComponentsInfo.templateFlag
                                        })(
                                            <Input
                                                placeholder='请输入组件标识'
                                                disabled={!isDeveloper}
                                            />
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={5}>
                                    <FormItem
                                        className={'clear-formitem-margin'}
                                        {...formItemLayout}
                                        label="是否页面中"
                                    >
                                        {getFieldDecorator(`isInPage`, {
                                            rules: [
                                                {required: true, message: '请选择组件位置'}
                                            ],
                                            initialValue: customComponentsInfo.isInPage
                                        })(
                                            <Select
                                            // style={{ width: '100%' }}
                                                placeholder='组件位置'
                                                disabled={!isDeveloper}
                                            >
                                                <Option value={0}>否</Option>
                                                <Option value={1}>是</Option>
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={9} style={{ textAlign: 'right' }}>
                                    {
                                        isDeveloper && <Button
                                            type='primary'
                                            ghost
                                            onClick={
                                                () => {
                                                    this.props.dispatch({
                                                        type: 'customComponents/setCustomComponentsReducer',
                                                        payload: {
                                                            generaterModalVisiable: true
                                                        }
                                                    });
                                                }
                                                // async() => {
                                                //     const generaterData = await getGeneraterData('demo'); // 获取json数据
                                                //     if (!Object.keys(generaterData).length) { message.error('空数据'); return; }
                                                //     this.handleGenerater(generaterData);
                                                // }
                                            }
                                        >
                                            Generater
                                        </Button>
                                    }
                                    {
                                        isDeveloper && <Button
                                            className='mar-l-4'
                                            type='primary'
                                            ghost
                                            onClick={() => {
                                                this.props.form.validateFieldsAndScroll({force: true}, (err, fieldsValue) => {
                                                    if (!err) {
                                                        let formData = {
                                                                defineTemplateId: customComponentsInfo.defineTemplateId,
                                                                ...fieldsValue
                                                            },
                                                            saveData = save(customArr),
                                                            viewData = {
                                                                ...formData,
                                                                ...saveData,
                                                            };
                                                        this.setState({
                                                            visible: true,
                                                            viewJson: viewData
                                                        });
                                                    }
                                                });
                                            }}><Icon type="eye" />
                                        Json预览
                                        </Button>
                                    }
                                    <Button
                                        type='primary'
                                        className='mar-l-4'
                                        loading={ saveCustomComponentsLoading || updateCustomComponentsLoading }
                                        onClick={() => {
                                            this.props.form.validateFieldsAndScroll({force: true}, (err, fieldsValue) => {
                                                if (!err) {
                                                    let formData = {
                                                            defineTemplateId: customComponentsInfo.defineTemplateId,
                                                            ...fieldsValue
                                                        },
                                                        saveData = save(customArr),
                                                        postData = {
                                                            ...formData,
                                                            templateContent: {
                                                                ...saveData,
                                                                initialData: filterData(customArr)
                                                            },
                                                        };
                                                    this.props.dispatch({
                                                        type: formData.defineTemplateId ? 'customComponents/updateCustomComponents' : 'customComponents/createCustomComponents',
                                                        payload: postData
                                                    });
                                                }
                                            });
                                        }}
                                    ><Icon type="form" />保存</Button>
                                    <Button
                                        className='mar-l-4'
                                        onClick={() => {
                                            goto.push('/templateMgt/customComponents');
                                        }}><Icon type="rollback" />
                                        返回
                                    </Button>

                                </Col>
                            </Row>
                        </Form>
                    </div>
                )}
            >
                {
                    this.onRender(customArr)
                }
                {/* JSON实时预览 */}
                <JsonView viewJson={
                    {
                        templateContent: {
                            ...viewJson

                        }
                    }
                } onClose={this.onClose} visible={visible} />
                { // 通过json生成格式
                    generaterModalVisiable && <GeneraterModal handleGenerater={this.handleGenerater.bind(this)} />
                }
            </KSWhiteCard>
        );
    }
}
