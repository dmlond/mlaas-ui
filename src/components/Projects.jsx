import React, { Component } from 'react';
import authHelper from '../helpers/authHelper';
import config from "../config/authconfig.js";

class Projects extends Component {  
    componentDidMount() {
        if (!(authHelper.isLoggedIn())) {
            window.location.assign(config['oauth_base_uri']+"/authorize?response_type=code&client_id="+config['oauth_client_id']+"&state="+window.location.pathname+"&redirect_uri="+window.location.origin+'/login');
        }
    }

    render() {
        var renderBody;

        if (authHelper.isLoggedIn()) {
          renderBody = <p>Projects</p>
        }
        else {
            renderBody = <p></p>
        }
        return (renderBody)
    }
}
export default Projects