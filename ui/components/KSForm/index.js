import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import create from './create';

export default class KSForm extends Component {
    static propTypes = {
        children: PropTypes.node
    }
    render() {
        return <Fragment>
            {
                this.props.children
            }
        </Fragment>;
    }
}

KSForm.create = create;
