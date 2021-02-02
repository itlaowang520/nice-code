module.exports = {
    'extends': [
        'stylelint-config-recommended-scss' // 使用 stylelint-config-recommended-scss 规范，该规范基于 stylelint-config-recommended
    ],
    'rules': {
        'no-descending-specificity': null, // 允许高优先级选择器后出现低优先级的选择器
        'unit-whitelist': [ // 可使用的单位
            'px',
            'em',
            'rem',
            '%',
            's',
            'ms',
            'vh',
            'vw',
            'deg'
        ]
    }
};
