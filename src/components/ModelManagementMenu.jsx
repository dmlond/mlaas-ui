import React, { Component } from 'react';
import {Link} from "react-router-dom";
import { List, SingleLineListItem } from "@duke-office-research-informatics/dracs";

class ModelManagementMenu extends Component {
    render() {
        let modelBaseUri = "/"+this.props.model.project_name+'/'+this.props.model.name;
        return (
            <ul style={{
                "listStyle": "none",
                "margin": 0,
                "padding": 0,
                "display": "inline-flex"
                }}>
                <li>
                    <List>
                        <SingleLineListItem>
                            <Link to={modelBaseUri}>
                                Model Profile
                            </Link>
                        </SingleLineListItem>
                        <SingleLineListItem>
                            <Link to={modelBaseUri+"/schedule"}>
                                Schedule
                            </Link>
                        </SingleLineListItem>
                        <SingleLineListItem>
                            <Link to={modelBaseUri+"/environment"}>
                                Environment
                            </Link> 
                        </SingleLineListItem>
                        <SingleLineListItem>
                            <Link to={modelBaseUri+"/deployments"}>
                                Deployments
                            </Link> 
                        </SingleLineListItem>
                    </List>
                </li>
                <li>
                    {this.props.children}
                </li>
            </ul>
        )
    }
}
export default ModelManagementMenu;
