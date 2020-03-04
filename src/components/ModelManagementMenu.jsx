import React, { Component } from 'react';
import {Link} from "react-router-dom";
import { List, SingleLineListItem } from "@duke-office-research-informatics/dracs";

class ModelManagementMenu extends Component {
    render() {
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
                            <Link to={"/models/"+this.props.model_id}>
                                Model Profile
                            </Link>
                        </SingleLineListItem>
                        <SingleLineListItem>
                            <Link to={"/models/"+this.props.model_id+"/schedule"}>
                                Schedule
                            </Link>
                        </SingleLineListItem>
                        <SingleLineListItem>
                            <Link to={"/models/"+this.props.model_id+"/environment"}>
                                Environment
                            </Link> 
                        </SingleLineListItem>
                        <SingleLineListItem>
                            <Link to={"/models/"+this.props.model_id+"/deployments"}>
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
