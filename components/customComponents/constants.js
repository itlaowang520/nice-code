const titleFormItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
    }
};

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
    }
};

const remarkFormItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
    }
};

// 数据类型
const DATA_TYPE_ALL = [
    {
        key: 'string',
        value: 'String'
    },
    {
        key: 'number',
        value: 'Number'
    },
    {
        key: 'array',
        value: 'Array'
    },
    {
        key: 'object',
        value: 'Object'
    }
];

// 初始化数据
const initFormData = {
    parentType: '', // 父节点类型
    child: [], // 子节点
    key: '', // 键名
    value: '', // 值
    remark: '', // 字段含义
    type: undefined, // 当前节点类型
};

// 数据类型常量
const DATA_TYPE_CONSTANT = {
    STRING: 'string',
    NUMBER: 'number',
    ARRAY: 'array',
    OBJECT: 'object',
};

export {
    titleFormItemLayout,
    remarkFormItemLayout,
    formItemLayout,
    DATA_TYPE_ALL,
    DATA_TYPE_CONSTANT,
    initFormData
};
