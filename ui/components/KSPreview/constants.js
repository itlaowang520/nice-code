/**
 * 文件类型
 * @type {{IMAGE: string, AUDIO: string, VIDEO: string}}
 */
export const FILE_TYPE = {
    IMAGE: 'image', // 图片
    AUDIO: 'audio', // 音频
    VIDEO: 'video', // 视频
    SVGA: 'svga', // svga动画
};

// 文档类型 .txt、.doc、.docx、.xls、.xlsx、.ppt、.pptx、 .pdf
// 压缩包 .zip、.rar
export const IMAGE_SUFFIX = ['jpg', 'jpeg', 'png', 'gif']; // jpg、png、jpeg、gif
export const AUDIO_SUFFIX = ['mp3', 'wav', 'ogg']; // wma、mp3
export const VIDEO_SUFFIX = ['mp4', 'ogg', 'webm']; // flv、rmvb、mp4、mvb
export const SVGA_SUFFIX = ['svga']; // svga
export const DOCUMENT_SUFFIX = ['txt', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf']; // 文档类型
export const PAGE_SUFFIX = ['zip', 'rar']; // 压缩包
export const FILE_SUFFIX = ['json', 'js', 'scss', 'lrc']; // 文件

export const SUPPORT_SUFFIX = [].concat(IMAGE_SUFFIX, AUDIO_SUFFIX, VIDEO_SUFFIX, SVGA_SUFFIX); // 支持展示

export const IMAGE_POSTER = 'https://cdn.kaishuhezi.com/kstory/bwmam/image/9de70827-c832-43fd-8740-21fd6efdc984.png';
export const AUDIO_POSTER = 'https://cdn.kaishuhezi.com/kstory/bwmam/image/5b4316fa-195f-4fd2-8eab-2c9713521c78.png';
export const VIDEO_POSTER = 'https://cdn.kaishuhezi.com/kstory/bwmam/image/52f63bf0-8ec2-47a8-a132-ea5c338e84c2.png';
