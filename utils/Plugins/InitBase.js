/**
 *  注册插件基类
 */
export default class InitBase {
    type = ''; // 类型
    /* 获取类型 */
    getType = () => this.type;

    /* 执行插件 */
    run = () => {}

    /* 副作用 */
    onEffect = () => {}

    /* 执行插件 */
    run = async(modules) => {
        for (let moduleConfig of modules) {
            const module = await this.loadModule(moduleConfig);
            await this.onEffect(module);
        }
    }

    /* 加载模块 */
    loadModule = (moduleConfig) => {
        return new Promise((resolve) => {
            if (typeof moduleConfig === 'function') {
                return resolve(moduleConfig());
            } else if (typeof moduleConfig === 'object') {
                if ('then' in moduleConfig) {
                    return moduleConfig.then((module) => {
                        resolve(module);
                    });
                }
            }
            resolve(moduleConfig);
        });
    }
}
