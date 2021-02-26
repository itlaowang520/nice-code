import React from 'react';

export default class KSAudio extends React.Component {

    render() {
        return (
            <audio>
                <source src={this.props.src}></source>
            </audio>
        );
    }
}
