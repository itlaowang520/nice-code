import RouterFun from './Router';
import Validator from './Validator';
import Request, { microRequest } from './Request';
import Other from './Other';
import IndexedDb from './Other/indexedDb';
import ObjectFun from './ObjectFun';
import Plugins from './Plugins';
const KsCmsUtils = {
    ...RouterFun,
    ...Other,
    Validator,
    microRequest,
    Request,
    IndexedDb,
    ...ObjectFun,
    ...Plugins
};

module.exports = KsCmsUtils;
