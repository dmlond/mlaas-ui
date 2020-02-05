import React, { Component } from 'react';
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
            return (
                <div>
                    <Link to="/login">Login </Link>
                </div>
            )
        }
    }
}

export default Navbar;