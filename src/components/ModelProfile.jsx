import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import authHelper from '../helpers/authHelper';
import projectServiceClient from '../helpers/projectServiceClient';
import config from "../config/authconfig.js";
import { Modal, Button, Spinner, Card, CardHeader, CardBody } from "@duke-office-research-informatics/dracs";
import ModelForm from './ModelForm';
import ModelManagementMenu from "./ModelManagementMenu";
import CookieTrail from "./CookieTrail";

class ModelProfile extends Component {
    constructor(props) {
        super(props);
        this.loadModel = this.loadModel.bind(this);
        this.handleSuccessfulModelLoad = this.handleSuccessfulModelLoad.bind(this);
        this.handleFailedModelLoad = this.handleFailedModelLoad.bind(this);
        this.handleUpdateModelClick = this.handleUpdateModelClick.bind(this);
        this.handleCloseUpdateModel = this.handleCloseUpdateModel.bind(this);
        this.handleUpdateModelSubmission = this.handleUpdateModelSubmission.bind(this);
        this.handleSuccessfulModelUpdate = this.handleSuccessfulModelUpdate.bind(this);

        this.state = {
            isLoading: true,
            hasError: false,
            updateModelClicked: false,
            model: null
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

    handleSuccessfulModelLoad(data) {
        this.setState({
            isLoading: false,
            model: data
        });
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

    handleUpdateModelClick(event) {
        event.preventDefault();
        this.setState({
            updateModelClicked: true
        });
    }

    handleCloseUpdateModel(event) {
        event.preventDefault();
        this.setState({
            updateModelClicked: false
        });
    }

    handleUpdateModelSubmission(updatePayload, errorHandler) {
        projectServiceClient.updateModel(
            this.state.model.id,
            updatePayload,
            this.handleSuccessfulModelUpdate,
            errorHandler
        );
    }

    handleSuccessfulModelUpdate(data) {
        this.setState({
            updateModelClicked: false,
            model: data
        });
    }

    scheduleClicked(event) {
        event.preventDefault();
    }

    environmentClicked(event) {
        event.preventDefault();
    }

    deploymentsClicked(event) {
        event.preventDefault();
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
            else if (this.state.hasError) {
                renderBody = <div>{errorMessage}</div>
            }
            else {
                renderBody = <div>
                    <Modal
                        active={this.state.updateModelClicked}
                        escKeyDown={this.handleCloseUpdateModel}
                    >
                        <ModelForm
                            model={this.state.model}
                            onCancel={this.handleCloseUpdateModel}
                            onSubmit={this.handleUpdateModelSubmission}
                        />
                    </Modal>
                    <ModelManagementMenu model_id={this.state.model.id}>
                        <CookieTrail />
                        <Card>
                            <CardHeader title={ this.state.model.name } >
                                <Button 
                                    label="Edit" 
                                    onClick={this.handleUpdateModelClick}
                                />
                            </CardHeader>
                            <CardBody>
                                <p>{ this.state.model.description }</p>
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
};
export default withRouter(ModelProfile);