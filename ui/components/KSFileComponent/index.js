import React from 'react';
import KSAudio from './KSAudio';
import KSVideo from './KSVideo';
export default function KSFileComponent(props) {
    switch (props.type) {
        case 'audio':
            return <KSAudio {...props}/>;
        case 'video':
            return <KSVideo {...props}/>;
        default:

    }
}
