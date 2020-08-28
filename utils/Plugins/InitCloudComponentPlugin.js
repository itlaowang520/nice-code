import InitBase from './InitBase';
import Router from '../Router';

export default class InitCloudComponentPlugin extends InitBase {
    /* 注册<云组件>类型 */
    type = 'cloudComponent';
    constructor(props) {
        super(props);
        this.params = props || {};
        this.register = Router.get('register');
    }

    /* 副作用 注册<云组件>事件 */
    onEffect = ({ default: component }) => this.register([component], this.params)

}
