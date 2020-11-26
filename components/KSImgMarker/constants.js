export const MOVE_MODE = 0; // 移动
export const LINE_MODE = 1; // 画笔
export const ERASER_MODE = 2; // 橡皮擦
export const GRAPHICAL_MODE = 3; // 图形
export const PUT_MODE = 4; // 拖动

export const ACTION_TYPE = [
    {
        VALUE: MOVE_MODE,
        LABEL: '移动',
        TOOLTIP: '移动工具 - 快捷键：alt + R',
        ICON_URL: 'https://tcdn.kaishustory.com/kstory/kms-common/image/41e5fd41-bc82-4f7d-adde-244b16b9e73b_info__s=16958.ico'
    },
    {
        VALUE: LINE_MODE,
        LABEL: '画笔',
        TOOLTIP: '画笔工具 - 快捷键：alt + D',
        ICON_URL: 'https://tcdn.kaishustory.com/kstory/kms-common/image/195a6c9b-271a-4200-adf2-725315267618_info__s=16958.ico'
    },
    {
        VALUE: ERASER_MODE,
        LABEL: '橡皮擦',
        TOOLTIP: '橡皮擦工具 - 快捷键：alt + C',
        ICON_URL: 'https://tcdn.kaishustory.com/kstory/kms-common/image/aab8890c-4dbf-4a7a-ad26-5b10be7a22cb_info__s=16958.ico'
    },
    {
        VALUE: GRAPHICAL_MODE,
        LABEL: '图形',
        TOOLTIP: '图形工具 - 快捷键：alt + G',
        ICON_URL: 'https://tcdn.kaishustory.com/kstory/kms-common/image/62c5229c-5d15-4be3-b4c7-1ebe557b7a1e_info__s=16958.ico'
    },
    // {
    //     VALUE: PUT_MODE,
    //     LABEL: '图形变换',
    //     TOOLTIP: '图形变换工具 - 快捷键：alt + M',
    //     ICON_URL: 'https://tcdn.kaishustory.com/kstory/kms-common/image/e9a89963-7673-459c-bd63-786b5b143fb8_info__s=16958.ico'
    // }
];

export const RECTANGLE = 'rectangle'; // 矩形
export const CIRCULAR = 'circular'; // 圆形
// 图形类型
export const GRAPHICAL_TYPE = [
    {
        VALUE: RECTANGLE,
        LABEL: '矩形',
        TOOLTIP: '矩形框',
        ICON_URL: 'https://tcdn.kaishustory.com/kstory/kms-common/image/228d49ac-c047-4b05-82e3-a000d3d22fa3_info__s=16958.ico'
    },
    {
        VALUE: CIRCULAR,
        LABEL: '圆形',
        TOOLTIP: '圆形框',
        ICON_URL: 'https://tcdn.kaishustory.com/kstory/kms-common/image/45130b4a-7e24-4f3f-8128-7bfdddcf752b_info__s=16958.ico'
    }
];
