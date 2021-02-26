export default (params, value) => {
    return params.reduce((prev, { saveKey, removeKey }) => {
        const { [removeKey]: REMOVE_KEY = [], ...OTHER_VALUE } = prev;
        return {
            ...OTHER_VALUE,
            [saveKey]: REMOVE_KEY && REMOVE_KEY.map((id) => OTHER_VALUE[saveKey][id])
        };
    }, value);
};
