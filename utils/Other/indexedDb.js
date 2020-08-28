/**
 * 本地数据库
 */
export default class IndexedDB {
    constructor(config) {
        const {name, version, objstore} = config;
        this.name = name;
        this.version = version;
        this.indexDB = window.indexedDB ||
            window.webkitIndexedDB ||
            window.mozIndexedDB ||
            window.msIndexedDB;
        this.objstore = {
            keypath: 'id',
            ...objstore
        };
    }

    /**
     * 查看是否支持indexeddb
     */
    static isSupports = () => {
        const indexeddb = window.indexedDB ||
        window.webkitIndexedDB ||
        window.mozIndexedDB ||
        window.msIndexedDB;
        return !!indexeddb;
    }

    /**
     * 打开数据库
     */
    async open() {
        return new Promise((resolve, reject) => {
            const request = this.indexDB.open(this.name, this.version);

            request.onerror = (e) => {
                // console.log('打开数据库失败');
                reject(new Error({type: 'error'}));
            };

            // 打开数据库成功
            request.onsuccess = (e) => {
                // console.log('打开成功');
                resolve({type: 'success', db: e.target.result});
            };

            // 第一次打开成功后或者版本有变化自动执行以下事件：一般用于初始化数据库。
            request.onupgradeneeded = (e) => {
                let objStore;
                const { result: db } = e.target;
                if (!db.objectStoreNames.contains(this.objstore.name)) {
                    objStore = db.createObjectStore(this.objstore.name, {keyPath: this.objstore.keypath, autoIncerment: true});
                    // get其实是这个keyPath的值
                    // objStore.createIndex
                    this.objstore.columns.forEach(({key}) => {
                        objStore.createIndex(key, key, {unique: false});
                    });
                }
                // console.log('升级数据库');
                resolve(e);
            };
        });
    }

    // 返回当前数据库的实体，之后的函数使用这个
    async getDb() {
        return new Promise((resolve, reject) => {
            let request = this.indexDB.open(this.name, this.version);
            request.onsuccess = (e) => {
                // 我在第一次open的
                resolve(e.target.result);
            };
            request.onerror = (e) => {
                reject(new Error({type: 'error'}));
            };
        });
    }

    // 关掉数据库
    async close() {
        return this.getDb().then((e) => {
            e.close().then((e) => {
                console.log('1');
            });
            return {type: 'success'};
        });
    }

    // 获取文档(表)
    async transaction(writeable = false) {
        let mode = writeable ? 'readwrite' : 'readonly';
        return this.getDb().then((db) => {
            const store = db.transaction([this.objstore.name], mode).objectStore(this.objstore.name);
            return store;
        });
    }

    // 新增
    async add(value) {
        return this.transaction('readwrite').then((store) => {
            let re = [];
            for (let i = 0; i < value.length; i++) {
                let pr = new Promise((resolve, reject) => {
                    const request = store.add(value[i]);
                    request.onsuccess = (e) => {
                        resolve(('ok'));
                    };
                    request.onerror = (e) => {
                        reject(new Error('插入失败'));
                    };
                });
                re.push(pr);
            }
            return Promise.all(re);
        });
    }

    // 删除
    async deleteIndex(index) {
        // 首先要确认数据库里面有这个数据
        return new Promise((resolve, reject) => {
            this.transaction('readwrite').then((e) => {
                const re = e.delete(index);
                re.onsuccess = () => {
                    resolve({type: 'success'});
                };

                re.onerror = () => {
                    reject(new Error({type: 'error'}));
                };
            });
        });
    }

    // 更新
    async update(record) {
        // 首先要确认数据库里面有这个数据
        return new Promise((resolve, reject) => {
            this.transaction('readwrite').then((e) => {
                const re = e.put(record);
                re.onsuccess = (event) => {
                    resolve({type: 'success'});
                };
                re.onerror = () => {
                    reject(new Error({type: 'error'}));
                };
            });
        });
    }

    // 查询所有
    async readAll() {
        return new Promise((resolve, reject) => {
            // 其实这个还是每次打开一次，并不是定义的时候就打开，然后把打开那个值存起来。不过其实总的都是open，只不过是open一次还是open几次的区别罢了
            this.transaction().then((e) => {
                let re = [];
                e.openCursor().onsuccess = (e) => {
                    let cursor = e.target.result;
                    if (cursor) {
                        re.push(cursor.value);
                        cursor.continue();
                    } else {
                        resolve({typpe: 'success', result: re});
                    }
                };
                e.openCursor().onerror = (e) => {
                    reject(new Error({type: 'error'}));
                };
            });
        });
    }

    // 查询单个
    async readId(index) {
        return new Promise((resolve) => {
            this.getDb().then(async(e) => {
                const transaction = await this.transaction();
                let re = transaction.get(index);
                re.onsuccess = (e) => {
                    resolve(e.target.result);
                };
                re.onerror = (e) => {
                    console.log(e);
                };
            });
        });
    }
}

/**
 * how to use
 *
 */
// const indexdb = new IndexedDB({
//     name: 'test', // 数据库名称
//     version: 1, // 版本名称
//     objstore: { // 相关配置
//         name: 'activityJson', // 文档名称
//         columns: [ // 文档强制表结构
//             {
//                 key: 'name'
//             },
//             {
//                 key: 'age'
//             }
//         ]
//     }
// });

// indexdb.open().then(async(e) => {
// // insert
// indexdb.add([{name: 'li5', age: 20, email: '842323422@qq.com', id: 1}, {name: 'li4', id: 2}])
// // readall
// const allList = await indexdb.readAll();
// console.log('allList', allList);
// const single = await indexdb.readId(1);
// console.log('single', single);
// indexdb.readAll().then((e) => {
//     console.log('e', e);
// });
