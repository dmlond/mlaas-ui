import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import authHelper from '../helpers/authHelper';
import projectServiceClient from '../helpers/projectServiceClient';
import config from "../config/authconfig.js";
import { Spinner, Card, CardHeader, CardBody } from '@duke-office-research-informatics/dracs';
import CookieTrail from './CookieTrail';
import ModelManagementMenu from './ModelManagementMenu';

class DeploymentProfile extends Component {
    constructor(props) {
        super(props);
        this.loadModel = this.loadModel.bind(this);
        this.handleSuccessfulModelLoad = this.handleSuccessfulModelLoad.bind(this);
        this.handleFailedModelLoad = this.handleFailedModelLoad.bind(this);
        this.loadDeployment = this.loadDeployment.bind(this);
        this.handleSuccessfulLoad = this.handleSuccessfulLoad.bind(this);
        this.handleFailedLoad = this.handleFailedLoad.bind(this);

        this.state = {
            isLoading: true,
            hasError: false,
            deployment: null
        };
    }

    componentDidMount() {
        if (authHelper.isLoggedIn()) {
            this.loadModel();
        }
        else {
            window.location.assign(config.oauth_base_uri+"/authorize?response_type=code&client_id="+config.oauth_client_id+"&state="+window.location.pathname+"&redirect_uri="+window.location.origin+'/login');
        }
    }

    loadModel() {
        let projectName = this.props.match.params.projectName;
        let modelName = this.props.match.params.modelName;
        projectServiceClient.model(
            projectName,
            modelName,
            this.handleSuccessfulModelLoad,
            this.handleFailedModelLoad
        );
    }

    handleSuccessfulModelLoad(model) {
        this.setState({
            model: model
        });
        this.loadDeployment();
    }

    handleFailedModelLoad(errorMessage) {
        this.setState({
            isLoading: false,
            hasError: true,
            error: errorMessage.error,
            errorReason: errorMessage.reason,
            errorSuggestion: errorMessage.suggestion           
        });
    }

    loadDeployment() {
        let modelid = this.state.model.id;
        let id = this.props.match.params.deploymentid;
        projectServiceClient.deployment(
            modelid,
            id,
            this.handleSuccessfulLoad,
            this.handleFailedLoad
        );
    }

    handleSuccessfulLoad(data) {
        this.setState({
            isLoading: false,
            deployment: data
        });
    }

    handleFailedLoad(errorMessage) {
        this.setState({
            isLoading: false,
            hasError: true,
            error: errorMessage.error,
            errorReason: errorMessage.reason,
            errorSuggestion: errorMessage.suggestion           
        });
    }

    render() {
        var renderBody;
        let errorMessage = this.state.hasError ? <div>
            <p>Error: {this.state.error}</p>
            <p>Reason: {this.state.errorReason}</p>
            <p>Suggestion: {this.state.errorSuggestion}</p>
        </div> : <div></div>;

        if (authHelper.isLoggedIn()) {
            if (this.state.isLoading) {
                renderBody = <div><Spinner /></div>
            }
            else {
                let deploymentProfile = <ul style={{
                    "listStyle": "none"
                }}>
                    <li>
                        <div style={{
                            "display": "inline-flex"    
                        }}>
                            <h4>Image:</h4>
                        </div>
                        <div style={{
                            "display": "inline-flex",
                            "marginLeft": 10
                        }}>
                            {this.state.deployment.image}
                        </div>
                    </li>
                    <li>
                        <div style={{
                                "display": "inline-flex"
                        }}>
                            <h4>Entrypoint:</h4>
                        </div>
                        <div style={{
                            "display": "inline-flex",
                            "marginLeft": 10
                        }}>
                            {this.state.deployment.entrypoint}
                        </div>
                    </li>
                    <li>
                        <div style={{
                            "display": "inline=flex"
                        }}>
                            <h4>Arguments:</h4>
                        </div>
                        <div style={{
                            "display": "inline=flex",
                            "marginLeft": 10
                        }}>
                            {this.state.deployment.arguments.join(' ')}
                        </div>
                    </li>
                </ul>
                renderBody = <ModelManagementMenu model={this.state.model}>
                    <CookieTrail />
                    <Card
                        height="40vw"
                        width="70vw"
                    >
                        <CardHeader title={"Commit "+this.state.deployment.commit_sha} />
                        <CardBody>
                            {deploymentProfile}
                            {errorMessage}
                        </CardBody>
                    </Card>
                </ModelManagementMenu>
            }
        }
        else {
            renderBody = <p></p>
        }
        return (renderBody)
    }
}
export default  withRouter(DeploymentProfile);