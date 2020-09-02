/**
     * 复制
     */
    copy(content) {
        var textArea = document.createElement('textarea');
        textArea.value = content || '';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        message.success('复制成功');
    }