import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import authHelper from '../helpers/authHelper';
import projectServiceClient from '../helpers/projectServiceClient';
import config from "../config/authconfig.js";
import { Modal, Spinner, Card, CardHeader, CardBody, Button, List, DoubleLineListItem } from "@duke-office-research-informatics/dracs";
import ModelManagementMenu from "./ModelManagementMenu";
import DeploymentForm from "./DeploymentForm";
import CookieTrail from './CookieTrail';

class ModelDeployments extends Component {
    constructor(props) {
        super(props);
        this.loadModel = this.loadModel.bind(this);
        this.handleSuccessfulModelLoad = this.handleSuccessfulModelLoad.bind(this);
        this.handleFailedModelLoad = this.handleFailedModelLoad.bind(this);
        this.loadDeployments = this.loadDeployments.bind(this);
        this.handleSuccessfulDeploymentLoad = this.handleSuccessfulDeploymentLoad.bind(this);
        this.handleFailedDeploymentLoad = this.handleFailedDeploymentLoad.bind(this);
        this.handleDeploymentSelection = this.handleDeploymentSelection.bind(this);
        this.handleNewDeploymentClick = this.handleNewDeploymentClick.bind(this);
        this.handleCloseNewDeployment = this.handleCloseNewDeployment.bind(this);
        this.handleDeploymentSubmission = this.handleDeploymentSubmission.bind(this);
        this.handleSuccessfulDeploymentCreation = this.handleSuccessfulDeploymentCreation.bind(this);

        this.state = {
            isLoading: true,
            hasError: false,
            newDeploymentClicked: false,
            deployments: []
        }
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
        this.loadDeployments();
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

    loadDeployments() {
        projectServiceClient.deployments(
            this.state.model.id,
            this.handleSuccessfulDeploymentLoad,
            this.handleFailedDeploymentLoad
        );
    }

    handleSuccessfulDeploymentLoad(deployments) {
        this.setState({
            isLoading: false,
            deployments: deployments
        });
    }

    handleFailedDeploymentLoad(errorMessage) {
        this.setState({
            isLoading: false,
            hasError: true,
            error: errorMessage.error,
            errorReason: errorMessage.reason,
            errorSuggestion: errorMessage.suggestion           
        });
    }

    handleDeploymentSelection(id) {
        let projectName = this.props.match.params.projectName;
        let modelName = this.props.match.params.modelName;
        window.location.assign(window.location.origin+'/'+projectName+'/'+modelName+'/deployments/'+id);
    }

    handleNewDeploymentClick(event) {
        event.preventDefault();
        this.setState({
            newDeploymentClicked: true
        });
    }

    handleCloseNewDeployment(event) {
        event.preventDefault();
        this.setState({
            newDeploymentClicked: false
        });
    }

    handleDeploymentSubmission(payload, errorHandler) {
        projectServiceClient.createDeployment(
            this.state.model.id,
            payload,
            this.handleSuccessfulDeploymentCreation,
            errorHandler
        );
    }

    handleSuccessfulDeploymentCreation(deployment) {
        const deploymentList = this.state.deployments.concat(deployment);
        this.setState({
            newDeploymentClicked: false,
            deployments: deploymentList
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
                let renderDeployments = <List>
                    { this.state.deployments.map(deployment => {
                        let deploymentSummary = <div>{deployment.entrypoint} {deployment.arguments.join(' ')}</div>
                        return(
                            <DoubleLineListItem 
                                key={deployment.id}
                                lineOne={deployment.commit_sha}
                                lineTwo={deploymentSummary}
                                clickable={true}
                                onClick={this.handleDeploymentSelection.bind(this,deployment.id)}
                            />
                        );                    
                    })} 
                </List>

                renderBody = <div>
                    <Modal
                        active={this.state.newDeploymentClicked}
                        escKeyDown={this.handleCloseNewDeployment}
                    >
                        <DeploymentForm
                            onCancel={this.handleCloseNewDeployment}
                            onSubmit={this.handleDeploymentSubmission}
                        />
                    </Modal>
                    <ModelManagementMenu model={this.state.model}>
                        <CookieTrail />
                        <Card>
                            <CardHeader title="Deployments:" >
                                <Button 
                                    label="New Deployment" 
                                    onClick={this.handleNewDeploymentClick}
                                />
                            </CardHeader>
                            <CardBody>
                                {renderDeployments}
                                {errorMessage}
                            </CardBody>
                        </Card>
                    </ModelManagementMenu>
                </div>
            }
        }
        else {
            renderBody = <p></p>
        }
        return (renderBody)
    }    
}

export default withRouter(ModelDeployments);
