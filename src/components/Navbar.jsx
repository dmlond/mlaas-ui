import React, { Component } from 'react';
import config from "../config/authconfig.js";
import authHelper from '../helpers/authHelper';
import {Link} from "react-router-dom";
import { AppHeader, Dropdown, IconMenu, ActionButton, IconLogout } from "@duke-office-research-informatics/dracs";

class Navbar extends Component {
    handleLogout() {
        authHelper.logout();
    }
    render() {
        if (authHelper.isLoggedIn()){
            let navigationMenu = <div style={{"display":"inline-flex", "margin":0,"padding": 0}}><Link to="/">Home </Link><div style={{"marginLeft":10}}><Link to="/projects">Projects</Link></div><div style={{"marginLeft":10}}></div><Link to="/models">Models</Link></div>
            return (
            <div>
                <AppHeader
                    width="calc(100% - 32px)"
                    backgroundColor="rgba(74,144,226,1)"
                    childrenLeft={navigationMenu}
                    childrenRight={
                        <Dropdown
                              buttonLabel={<IconMenu />}
                              menuPosition="right"
                              label="Actions"
                              type="button"
                              onBlur={null}
                              onItemBlur={null}
                              onClick={null}
                              onItemClick={null}
                              onFocus={null}
                              onItemFocus={null}
                              onMouseDown={null}
                              onMouseEnter={null}
                              onMouseLeave={null}
                              onMouseUp={null}
                              onTouchStart={null}
                              onTouchEnd={null}
                            >
                                <p>
                                    { authHelper.currentUser() }
                                </p>
                                <ActionButton
                                    onClick={this.handleLogout}
                                >   
                                    <IconLogout /><p>Logout</p>
                                </ActionButton>
                            </Dropdown>
                        } 
                />
            </div>
            )
        }
        else {
            const authUrl = config['oauth_base_uri']+"/authorize?response_type=code&client_id="+config['oauth_client_id']+"&state="+window.location.pathname+"&redirect_uri="+window.location.origin+'/login';
            return (
                <div>
                    <AppHeader 
                        childrenLeft={<a href={ authUrl }>Login </a>}
                    />
                </div>
            )
        }
    }
}

export default Navbar;