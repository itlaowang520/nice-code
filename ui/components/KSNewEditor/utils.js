/* eslint-disable react/react-in-jsx-scope */
import { IMAGE_SUFFIX, COMPRESS_FILE_SIZE, MAX_FILE_SIZE } from './constants';
import { getFileSize } from 'ks-cms-utils';
import { message, Modal } from 'antd';
import React, { Fragment } from 'react';

const saveRtfApi = '/system-server/sys/file/save_rtf';
const compressApi = '/system-server/sys/file/compress';
const deleteFileApi = '/system-server/sys/file/delete';

/**
 * 将上传的文件插入到富文本框内
 * @param fileList // 文件url
 * @param editor // 富文本Jodit对象
 * @param selData // 富文本Jodit记录的光标位置
 */
export const insertUploadFilesToEditor = (fileList = [], editor, selData) => {
    selData && editor.selection.restore(selData);
    let error = false,
        fileType = '';
    fileList.forEach((item) => {
        fileType = item.cdnFileName.split('.').pop();
        switch (fileType) {
            case 'mp3':
                const audio = document.createElement('audio');
                audio.setAttribute('class', 'ks-editor-audio');
                audio.src = item.cdnUrl;
                audio.controls = 'controls';
                audio.setAttribute('style', `max-width: 100%; margin: 0 auto; z-index: 2;`);
                // audio.setAttribute('style', `max-width: 100%; height: 54px; z-index: 2;`);
                editor.selection.insertHTML(audio);
                // editor.selection.insertHTML('<br/>');
                break;
            case 'mp4':
                const video = document.createElement('video');
                video.setAttribute('class', 'ks-editor-video');
                video.src = item.cdnUrl;
                video.controls = 'controls';

                new Promise((resolve, reject) => {
                    document.body.appendChild(video);
                    video.onprogress = function() {
                        resolve({ width: this.offsetWidth, height: this.offsetHeight });
                        document.body.removeChild(video);
                    };
                }).then((res) => {
                    video.setAttribute('style', `max-width: 100%; width: ${res.width}px; z-index: 2;`);
                    editor.selection.insertHTML(video);
                    // editor.selection.insertHTML('<br/>');
                });
                break;
            default:
                if (IMAGE_SUFFIX.includes(fileType)) {
                    // editor.selection.insertImage(item.cdnUrl, {maxWidth: '100%'}, 'auto');
                    const img = document.createElement('img');
                    img.setAttribute('class', 'ks-editor-img');
                    img.src = item.cdnUrl;
                    img.setAttribute('style', 'max-width: 100%; width: auto');
                    editor.selection.insertHTML(img);
                    // editor.selection.insertHTML('<br/>');
                    return;
                }
                error = true;
        }
    });

    if (error) {
        editor.events.fire('errorMessage', '暂不支持的文件格式', 'error', 4000);
    }
};

/**
 * 粘贴格式化好的内容时，图片等资源的地址替换
 * @param html // 粘贴前的 html 字符串
 * @param matchImg // 图片url 的 list
 * @param that // KSEditor 组件对象
 * @return {Promise<void>}
 */
export const checkOriginImg = async(html, matchImg, that) => {
    let response;
    // 替换外链URL
    response = await that.props.request(saveRtfApi, {
        method: 'POST',
        body: matchImg.map((item) => item.split(/(\?)/).shift())
    }, true);
    if (!response || (response && response.code !== 0)) {
        message.error('替换资源出现问题，请稍后重试');
        that.setCurrentLoading(false);
        return;
    }
    const result = response.list || [];
    let messageInfo = null,
        overStepArr = result.filter(({ originalSize, originalUrl }) => {
            if (originalSize > MAX_FILE_SIZE) {
                messageInfo = <Fragment>{messageInfo}<p>资源地址：{originalUrl}</p></Fragment>;
                return originalUrl;
            }
        });
    // 检测是否有超出1M的资源 如果有则需要人为操作，并且删除替换的资源
    if (overStepArr.length > 0) {
        Modal.info({
            title: `检测到文本中的资源超出${getFileSize(MAX_FILE_SIZE)}，请先自行压缩后，再进行操作！`,
            content: (<div style={{maxHeight: '400px', overflow: 'hidden', overflowY: 'scroll'}}>{messageInfo.props.children}</div>),
            onOk() {}
        });
        await that.props.request(deleteFileApi, {
            method: 'POST',
            body: result.map(({ fileId }) => fileId)
        });
        that.setCurrentLoading(false);
        return false;
    }
    // if (result.some(({ originalSize }) => originalSize > MAX_FILE_SIZE)) {
    //     message.error(`检测到文本中的资源超出${getFileSize(MAX_FILE_SIZE)}，请先自行处理`);
    //     await that.props.request(deleteFileApi, {
    //         method: 'POST',
    //         body: result.map(({ fileId }) => fileId)
    //     });
    //     that.setCurrentLoading(false);
    // }

    // 检测是否有需要压缩的资源(大小在400KB-1M之间)
    let maxFileList = [], // 超出图片限制
        normalFieList = []; // 未超出图片限制
    result.forEach((file, index) => {
        const { originalSize } = file;
        if (originalSize > COMPRESS_FILE_SIZE) {
            maxFileList.push({
                ...file,
                fileIndex: index
            });
        } else {
            normalFieList.push({
                ...file,
                fileIndex: index
            });
        }
    });

    // 如果有需要压缩的资源则进行压缩并替换， 如果没有压缩资源则直接替换
    if (maxFileList.length) {
        message.warn(`检测到文本中的资源超出${getFileSize(COMPRESS_FILE_SIZE)}，正在压缩请稍等`);
        let compressRes;
        try {
            compressRes = await that.props.request(compressApi, {
                method: 'POST',
                body: maxFileList.map(({ fileId }) => ({ fileId }))
            });
        } catch (err) {
            message.error('压缩资源出现问题，请稍后重试');
            that.setCurrentLoading(false);
        }
        const compressResult = compressRes.list.map((file, index) => ({ ...file, fileIndex: maxFileList[index].fileIndex }));
        let replaceResult = [];
        normalFieList.forEach((file) => {
            replaceResult[file.fileIndex] = file.rtfUrl;
        });
        compressResult.forEach((file) => {
            replaceResult[file.fileIndex] = file.compressCdnUrl;
        });
        replaceUrlInHtml(html, matchImg, replaceResult, that);
        message.success('资源压缩完成');
    } else {
        replaceUrlInHtml(html, matchImg, result.map(({ rtfUrl }) => rtfUrl), that);
    }
};

/* 替换富文本中url */
export const replaceUrlInHtml = (html, matchImg, dataSource, that) => {
    matchImg.forEach((item, index) => {
        html = html.replace(item, dataSource[index]);
    });
    // 为了处理老数据中图片等外链没有替换成功的问题，需要对初始值做替换
    if (that.state.firstGetValue) {
        that.editor.current.value = html;
    } else {
        that.editor.current.selection.insertHTML(html);
    }
    that.setCurrentLoading(false);
};

/**
 * 获取链接图片
 * @param html
 * @return {Array}
 * 匹配：
 * src="http://****" | src="https://****"
 * url="http://****" | url="https://****"
 * src(&quot;http://****&quot;) | src(&quot;https://****&quot;)
 * url(&quot;http://****&quot;) | url(&quot;https://****&quot;)
 */
export const getFileUrl = (html) => {
    let reg = /(src|url)(="|\(&quot;)http(s)?:\/\/[^"\f\n\r\t\v]*[^"\f\n\r\t\v]*("|&quot;\))/g,
        matchImg = (html.match(reg) || []).map((item) => {
            if (!/(kaishu|kaishustory|kstory)/g.test(item)) {
                return item.split(/(src|url)(="|\(&quot;)/).pop().split(/("|&quot;\))/).shift();
            }
        }).filter((it) => it);
    return matchImg;
};

/**
 * 给 img,video,audio 三种媒体标签添加类名
 * @param html
 * @return {*}
 */
export const addClassToMediaTag = (html) => {
    let reg = /<(img|video|audio).*?>/g,
        mediaTag = (html.match(reg) || []).map((item) => {
            let tagName = item.match(/img|video|audio/)[0];
            // 判断是否包含类属性
            if (item.includes(' class="')) {
                // 判断是否包含指定类名
                if (!/ks-editor-(img|video|audio)/g.test(item)) {
                    return {
                        originItem: item,
                        newItem: item.replace(' class="', ` class="ks-editor-${tagName} `)
                    };
                }
            } else {
                return {
                    originItem: item,
                    newItem: item.replace(`<${tagName} `, `<${tagName} class="ks-editor-${tagName}"`)
                };
            }
        }).filter((it) => it);
    mediaTag.forEach((item) => {
        html = html.replace(item.originItem, item.newItem);
    });
    return html;
};
