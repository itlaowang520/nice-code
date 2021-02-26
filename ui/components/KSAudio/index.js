import React from 'react';

export default class KSAudio extends React.Component {
    render() {
        return (
            <audio controls {...this.props}></audio>
        );
    }
};
