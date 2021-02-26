import React from 'react';

export default class KSVideo extends React.Component {
    render() {
        return (
            <video>
                <source src={this.props.src}></source>
            </video>
        );
    }
}
