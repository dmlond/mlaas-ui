import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import authHelper from '../helpers/authHelper';
import projectServiceClient from '../helpers/projectServiceClient';
import config from "../config/authconfig.js";
import { Modal, Button, Spinner, Card, CardHeader, CardBody } from "@duke-office-research-informatics/dracs";
import ProjectForm from './ProjectForm';
import Models from './Models'

class ProjectProfile extends Component {
    constructor(props) {
        super(props);
        this.loadProject = this.loadProject.bind(this);
        this.handleSuccessfulProjectLoad = this.handleSuccessfulProjectLoad.bind(this);
        this.handleFailedProjectLoad = this.handleFailedProjectLoad.bind(this);
        this.handleUpdateProjectClick = this.handleUpdateProjectClick.bind(this);
        this.handleCloseUpdateProject = this.handleCloseUpdateProject.bind(this);
        this.handleUpdateProjectSubmission = this.handleUpdateProjectSubmission.bind(this);
        this.handleSuccessfulProjectUpdate = this.handleSuccessfulProjectUpdate.bind(this);

        this.state = {
            isLoading: true,
            projectUpdateHasError: false,
            updateProjectClicked: false,
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
        let projectName = this.props.match.params.projectName;
        projectServiceClient.project(
            projectName,
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
            error: errorMessage.error,
            errorReason: errorMessage.reason,
            errorSuggestion: errorMessage.suggestion
        });
    }

    handleUpdateProjectClick(event) {
        event.preventDefault();
        this.setState({
            updateProjectClicked: true
        });
    }

    handleCloseUpdateProject(event) {
        event.preventDefault();
        this.setState({
            updateProjectClicked: false
        });
    }

    handleUpdateProjectSubmission(updateProjectPayload, errorHandler) {
        projectServiceClient.updateProject(
            this.state.project.id,
            updateProjectPayload,
            this.handleSuccessfulProjectUpdate,
            errorHandler
        );
    }

    handleSuccessfulProjectUpdate(data) {
        this.setState({
            updateProjectClicked: false,
            project: data
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
                renderBody = <div>
                    <Modal
                        active={this.state.updateProjectClicked}
                    >
                        <ProjectForm
                            project={this.state.project}
                            onCancel={this.handleCloseUpdateProject}
                            onSubmit={this.handleUpdateProjectSubmission}
                        />
                    </Modal>
                    <Card>
                        <CardHeader title={ this.state.project.name } >
                            <Button 
                                label="Edit" 
                                onClick={this.handleUpdateProjectClick}
                            />
                        </CardHeader>
                        <CardBody>
                            <Models project={this.state.project } />
                        </CardBody>
                        {errorMessage}
                    </Card>
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