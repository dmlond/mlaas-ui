import React, { Component } from 'react';
import config from "../config/authconfig.js";
import authHelper from '../helpers/authHelper';
import {Link} from "react-router-dom";

class Navbar extends Component {
    render() {
        if (authHelper.isLoggedIn()){
            return (
            <div>
                <Link to="/">Home </Link>
            </div>
            )
        }
        else {
            const authUrl = `${config.oauth_base_uri}/authorize?response_type=code&client_id=${config.oauth_client_id}&state=login&redirect_uri=`+window.location.href
            return (
                <div>
                    <a href={ authUrl }>Login </a>
                </div>
            )
        }
    }
}

export default Navbar;