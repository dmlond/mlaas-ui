import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import authHelper from '../helpers/authHelper';
import projectServiceClient from '../helpers/projectServiceClient';
import config from "../config/authconfig.js";
import { Modal, Spinner, Card, CardHeader, CardBody, Button, List, DoubleLineListItem } from "@duke-office-research-informatics/dracs";
import ModelManagementMenu from "./ModelManagementMenu";
import DeploymentForm from "./DeploymentForm";

class ModelDeployments extends Component {
    constructor(props) {
        super(props);
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
            this.loadDeployments();
        }
        else {
            window.location.assign(config.oauth_base_uri+"/authorize?response_type=code&client_id="+config.oauth_client_id+"&state="+window.location.pathname+"&redirect_uri="+window.location.origin+'/login');
        }
    }

    loadDeployments() {
        let id = this.props.match.params.modelid;
        projectServiceClient.deployments(
            id,
            this.handleSuccessfulDeploymentLoad,
            this.handleFailedDeploymentLoad
        );
    }

    handleSuccessfulDeploymentLoad(data) {
        this.setState({
            isLoading: false,
            deployments: data
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
        let modelid = this.props.match.params.modelid;
        window.location.assign(window.location.origin+'/models/'+modelid+'/deployments/'+id);
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

    handleDeploymentSubmission(modelid, payload, errorHandler) {
        projectServiceClient.createDeployment(
            modelid,
            payload,
            this.handleSuccessfulDeploymentCreation,
            errorHandler
        );
    }

    handleSuccessfulDeploymentCreation(data) {
        const deploymentList = this.state.deployments.concat(data);
        this.setState({
            newDeploymentClicked: false,
            deployments: deploymentList
        });
    }

    render() {
        let modelId = this.props.match.params.modelid;
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
                        return(
                            <DoubleLineListItem 
                                key={deployment.id}
                                lineOne={deployment.id}
                                lineTwo={deployment.commit_sha}
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
                            model_id={modelId}
                            onCancel={this.handleCloseNewDeployment}
                            onSubmit={this.handleDeploymentSubmission}
                        />
                    </Modal>
                    <ModelManagementMenu model_id={modelId}>
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
