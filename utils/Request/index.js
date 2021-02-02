import { stringify } from 'qs';
import { fetch } from 'whatwg-fetch';

/**
 * 异步请求
 * @param  {String} url     // 请求地址
 * @param {Option} options // 配置
 * @return {Promise}        // 返回promise对象
 *
 * @typedef {Object} Option
 * @property {String} method // 请求方式  默认不传为get
 * @property {Object} body // 请求体
 */
export default function request(url, options) {
    const defaultOptions = {
        mode: 'cors',
        credentials: 'include',
        headers: {},
        noHeader: true
    };
    let newOptions = { ...defaultOptions, ...options };
    switch (`${newOptions.method}`) {
        case 'post':
        case 'POST':
            newOptions.method = 'POST';
            break;
        case 'get':
        case 'GET':
            newOptions.method = 'GET';
            break;
        default:
    }
    if (newOptions.method === 'POST' || newOptions.method === 'PUT') {
        if (!(newOptions.body instanceof FormData)) {
            newOptions.headers = {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
                ...newOptions.headers,
            };
            newOptions.body = JSON.stringify(newOptions.body);
        } else {
            // newOptions.body is FormData
            if (newOptions.noHeader) {
                delete newOptions.headers;
            }
        }
    } else if (newOptions.method === 'GET') {
        if (newOptions.body) {
            url = `${url}?${stringify(newOptions.body)}`;
        }
        const { method, headers } = newOptions;
        newOptions = {
            method,
            headers
        };
    }
    delete newOptions.noHeader;
    return fetch(url, newOptions);
}

/**
 * @param {string} url // dasdf
 */
export const microRequest = (url) =>
    fetch(url, {
        referrerPolicy: 'origin-when-cross-origin',
    });
