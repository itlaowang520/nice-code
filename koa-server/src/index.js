import Koa from 'koa';
import router from './routers';
import { initDatabase } from './models';
import bodyParser from 'koa-bodyparser';
import databaseConfig from './models/config';
import cors from 'koa2-cors';
import logger from './utils/logger';

const port = 3000;
const app = new Koa();

process.on('unhandledRejection', (err) => {
    logger.error(err);
});

app.use(cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'token', 'X-Requested-With']
}));
app.use((context, next) => {
    logger.info(`${context.method} ${context.href} ${context.headers['content-type']} ${context.headers['user-agent']} ${context.headers.token || ''}`);
    return next();
});
app.use(async(context, next) => {
    try {
        await next();
    } catch (error) {
        // 错误处理
        logger.error(`${error.stack}`);
        context.status = 200;
        context.body = {
            errcode: error.code || -1,
            result: {
                message: error.message
            }
        };
    }
});

// 解析 Request Body
app.use(bodyParser({
    jsonLimit: '50mb',
    enableTypes: ['json', 'form', 'multipart']
}));

// 载入 router
app.use(router.routes());
app.use(router.allowedMethods());

// 返回响应头 'Content-Type' 固定为 'application/json'
app.use((context, next) => {
    if (context.body) {
        if (context.body.errcode === undefined) {
            context.body = {
                errcode: 0,
                result: context.body
            };
        }
        // 返回数据为 json 格式
        context.set('Content-Type', 'application/json');
        context.body = JSON.stringify(context.body);
    }
    return next();
});

// 初始化数据库
initDatabase(databaseConfig)
    .then(startServer)
    .catch((err) => {
        logger.error(err);
    });

function startServer() {
    app.listen(port, () => {
        logger.info(`server listening on ${port}...`);
    });
}
