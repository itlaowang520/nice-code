import InitBase from './InitBase';

export default class InitModelPlugin extends InitBase {
    /* 注册<model>类型 */
    type = 'model';
    constructor(props) {
        super(props);
        const { app } = props;
        this.app = app;
    }

    /* 副作用 注册<model>事件 */
    onEffect = ({ default: model }) => this.app.model(model);
}
