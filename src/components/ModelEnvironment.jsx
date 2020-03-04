import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import authHelper from '../helpers/authHelper';
import projectServiceClient from '../helpers/projectServiceClient';
import config from "../config/authconfig.js";
import {Link} from "react-router-dom";
import { Spinner } from "@duke-office-research-informatics/dracs";

class ModelEnvironment extends Component {
    constructor(props) {
        super(props);
        this.loadEnvironment = this.loadEnvironment.bind(this);
        this.handleSuccessfulEnvironmentLoad = this.handleSuccessfulEnvironmentLoad.bind(this);
        this.handleFailedEnvironmentLoad = this.handleFailedEnvironmentLoad.bind(this);
        this.handleSetEnvironmentClick = this.handleSetEnvironmentClick.bind(this);
        this.handleCloseSetEnvironment = this.handleCloseSetEnvironment.bind(this);
        this.handleSetEnvironmentSubmission = this.handleSetEnvironmentSubmission.bind(this);
        this.handleSuccessfulEnvironmentUpdate = this.handleSuccessfulEnvironmentUpdate.bind(this);

        this.state = {
            isLoading: true,
            hasError: false,
            setEnvironmentClicked: false,
            schedule: null
        }
    }

    componentDidMount() {
        if (authHelper.isLoggedIn()) {
            this.loadEnvironment();
        }
        else {
            window.location.assign(config.oauth_base_uri+"/authorize?response_type=code&client_id="+config.oauth_client_id+"&state="+window.location.pathname+"&redirect_uri="+window.location.origin+'/login');
        }
    }

    loadEnvironment() {
        let id = this.props.match.params.modelid;
        projectServiceClient.environment(
            id,
            this.handleSuccessfulEnvironmentLoad,
            this.handleFailedEnvironmentLoad
        );
    }

    handleSuccessfulEnvironmentLoad(data) {
        this.setState({
            isLoading: false,
            schedule: data
        });
    }

    handleFailedEnvironmentLoad(errorMessage) {
        if (errorMessage.error.match(/.*not.*found/)) {
            this.setState({
                isLoading: false,
                needsEnvironment: true
            });
        } else {
            this.setState({
                isLoading: false,
                hasError: true,
                error: errorMessage.error,
                errorReason: errorMessage.reason,
                errorSuggestion: errorMessage.suggestion           
            });
        }
    }

    handleSetEnvironmentClick(event) {
        event.preventDefault();
        this.setState({
            setEnvironmentClicked: true
        });
    }

    handleCloseSetEnvironment(event) {
        event.preventDefault();
        this.setState({
            setEnvironmentClicked: false
        });
    }

    handleSetEnvironmentSubmission(updatePayload, errorHandler) {
        projectServiceClient.setEnvironment(
            this.state.model.id,
            updatePayload,
            this.handleSuccessfulModelUpdate,
            errorHandler
        );
    }

    handleSuccessfulEnvironmentUpdate(data) {
        this.setState({
            setEnvironmentClicked: false,
            schedule: data
        });
    }

    render() {
        var renderBody;
    
        if (authHelper.isLoggedIn()) {
            if (this.state.isLoading) {
                renderBody = <div><Spinner /></div>
            }
            else {
                let renderEnvironment = this.state.needsEnvironment ? <p>No Environment is Set</p> : <p>Schedule</p>
                renderBody = <div>
                    <Link to={"/models/"+this.props.match.params.modelid}>Model</Link>
                    {renderEnvironment}
                </div>
            }
        }
        else {
            renderBody = <p></p>
        }
        return (renderBody)
    }    
}

export default withRouter(ModelEnvironment);
