// 客户端宽度定义
export const query = {
    'screen-xs': {
        maxWidth: 575,
    },
    'screen-sm': {
        minWidth: 576,
        maxWidth: 767,
    },
    'screen-md': {
        minWidth: 768,
        maxWidth: 991,
    },
    'screen-lg': {
        minWidth: 992,
        maxWidth: 1199,
    },
    'screen-xl': {
        minWidth: 1200,
    },
};
// 是否需要进行分类
export const TAGS = [
    {
        label: '是',
        value: 'true',
        title: '有标签分类页面效果',
        src: 'https://tcdn.kaishustory.com/kstory/kms-common/image/6cca2426-a571-4998-857f-46f24a356423_info_w=2334_h=1569_s=1349653.jpg',
        text: '标签分类：根据对应的业务方向对系统进行分类展示。'
    },
    {
        label: '否',
        value: 'false',
        title: '无标签分类页面效果',
        src: 'https://tcdn.kaishustory.com/kstory/kms-common/image/cda8ee66-d29d-45fa-ae51-7be46cce84b9_info_w=2327_h=1570_s=2227355.jpg',
        text: '无标签分类：不区分业务方向依次展示。'
    }
];
// 页签配置
export const MODEL = [
    {
        label: '无页签',
        value: 'normal',
        title: '无页签效果',
        src: 'https://tcdn.kaishustory.com/kstory/kms-common/image/b05e0fdf-0502-451e-a35b-50cb5a6e6ff2_info_w=1105_h=539_s=111197.png',
        text: ''
    },
    {
        label: '菜单页签',
        value: 'menuTab',
        title: '菜单页签效果',
        src: 'https://tcdn.kaishustory.com/kstory/kms-common/image/746fdfa0-4b20-4bed-90b2-6ceb10367476_info_w=1101_h=565_s=116112.png',
        text: '菜单页签：点击过的菜单会展示在页面顶部，只展示菜单级别的页签。点击页签可以跳转到对应的菜单，可以删除菜单页签。'
    },
    {
        label: '页面页签',
        value: 'pageTab',
        title: '页面页签效果',
        src: 'https://tcdn.kaishustory.com/kstory/kms-common/image/746fdfa0-4b20-4bed-90b2-6ceb10367476_info_w=1101_h=565_s=116112.png',
        text: '页面页签：点击过的每个页面会展示在页面顶部。点击页签可以跳转到对应的页面，可以删除页签。'
    }
];

// 右上角配置
export const SETTING_MENU_ITEM = {
    name: '个性化设置',
    icon: 'setting',
    key: 'setting'
};
// 关闭图片
export const CLOSE_IMG_SRC = 'https://cdn.kaishuhezi.com/kstory/activity_flow/image/dc6e6181-e0a4-43b0-bb21-5183845da95b.png';

// 操作指南提示
export const GUIDE_DATA_SOURCE = [
    {
        selector: '.sider .side-search .ant-input-search',
        desc: '增加了系统内的菜单模糊搜索，点击搜索、键入回车后进行搜索'
    },
    {
        selector: '.sider .drag-menu-line',
        desc: '增加了菜单缩放功能'
    },
    {
        selector: '.ant-layout-header .header .project-switcher-action',
        desc: '修改切换项目为抽屉式，并且以悬浮交互改为点击交互，防止误操作'
    },
    {
        selector: '.header .account',
        desc: '以悬浮交互改为点击交互，防止误操作'
    },
    {
        selector: '.instructions-wrappper .instructions-image',
        desc: '增加了个性化配置,来定制化你的操作吧',
    }
];
