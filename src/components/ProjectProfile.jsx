import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import authHelper from '../helpers/authHelper';
import projectServiceClient from '../helpers/projectServiceClient';
import config from "../config/authconfig.js";
import { Spinner } from "@duke-office-research-informatics/dracs";

class ProjectProfile extends Component {
    constructor(props) {
        super(props);
        this.loadProject = this.loadProject.bind(this);
        this.handleSuccessfulProjectLoad = this.handleSuccessfulProjectLoad.bind(this);
        this.handleFailedProjectLoad = this.handleFailedProjectLoad.bind(this);
        this.state = {
            isLoading: true,
            project: null
        };
    }

    componentDidMount() {
        if (authHelper.isLoggedIn()) {
            this.loadProject();
        }
        else {
            window.location.assign(config.oauth_base_uri+"/authorize?response_type=code&client_id="+config.oauth_client_id+"&state="+window.location.pathname+"&redirect_uri="+window.location.origin+'/login');
        }
    }

    loadProject() {
        let id = this.props.match.params.projectid;
        console.log("Loading Project "+id);
        projectServiceClient.show(
            id,
            this.handleSuccessfulProjectLoad,
            this.handleFailedProjectLoad
        );
    }

    handleSuccessfulProjectLoad(data) {
        this.setState({
            isLoading: false,
            project: data
        });
    }

    handleFailedProjectLoad(errorMessage) {
        this.setState({
            isLoading: false,
            hasError: true,
            errorMessage: errorMessage
        });
    }

    render() {
        var renderBody;
        if (authHelper.isLoggedIn()) {
            if (this.state.isLoading) {
                renderBody = <div><Spinner /></div>
            }
            else if (this.state.hasError) {
                renderBody = <div>
                    <p>Error: { this.state.errorMessage.error }</p>
                </div>  
            }
            else {
                renderBody = <div>
                    <p>Id: { this.state.project.id }</p>
                    <p>Name: { this.state.project.name }</p>
                    <p>Description: { this.state.project.description }</p>
                </div>
            }
        }
        else {
            renderBody = <p></p>
        }
        return (renderBody)
    }
};
export default withRouter(ProjectProfile);