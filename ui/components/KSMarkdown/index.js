import React from 'react';
import Remarkable from 'remarkable';
import PropTypes from 'prop-types';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import './index.scss';
const MD = new Remarkable({
    highlight: function(str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlightBlock(lang, str).value;
            } catch (err) {}
        }
        try {
            return hljs.highlightAuto(str).value;
        } catch (err) {}
        return '';
    }
});

export default class KSMarkdown extends React.Component {
    static propTypes = {
        content: PropTypes.string,
        styleName: PropTypes.string
    }
    render() {
        const { content, styleName } = this.props;
        return (
            <div
                className={ styleName ? `markdown-body ${styleName}` : 'markdown-body'}
                dangerouslySetInnerHTML={{
                    __html: MD.render(content)
                }}
            >
            </div>
        );
    }
}
