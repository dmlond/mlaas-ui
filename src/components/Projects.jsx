import React, { Component } from 'react';
import authHelper from '../helpers/authHelper';
import projectServiceClient from '../helpers/projectServiceClient';
import ProjectForm from './ProjectForm';

import config from "../config/authconfig.js";
import { Modal, List, DoubleLineListItem, Card, CardHeader, CardBody, Button, Spinner } from "@duke-office-research-informatics/dracs";

class Projects extends Component {
    constructor(props) {
        super(props);
        this.loadProjects = this.loadProjects.bind(this);
        this.handleSuccessfulProjectLoad = this.handleSuccessfulProjectLoad.bind(this);
        this.handleFailedProjectLoad = this.handleFailedProjectLoad.bind(this);
        this.handleNewProjectClick = this.handleNewProjectClick.bind(this);
        this.handleCloseNewProject = this.handleCloseNewProject.bind(this);
        this.handleProjectSubmission = this.handleProjectSubmission.bind(this);
        this.handleSuccessfulProjectCreation = this.handleSuccessfulProjectCreation.bind(this);

        this.state = {
            isLoading: true,
            hasError: false,
            newProjectClicked: false,
            projects: []
        };
    }

    componentDidMount() {
        if (authHelper.isLoggedIn()) {
            this.loadProjects();
        } else {
            window.location.assign(config['oauth_base_uri']+"/authorize?response_type=code&client_id="+config['oauth_client_id']+"&state="+window.location.pathname+"&redirect_uri="+window.location.origin+'/login');
        }
    }

    loadProjects() {
        projectServiceClient.projects(
            this.handleSuccessfulProjectLoad,
            this.handleFailedProjectLoad
        );
    }

    handleSuccessfulProjectLoad(data) {
        this.setState({
            isLoading: false,
            projects: data
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

    handleProjectSelection(projectid) {
        window.location.assign(window.location.origin+'/projects/'+projectid);
    }

    handleNewProjectClick(event) {
        event.preventDefault();
        this.setState({
            newProjectClicked: true
        });
    }

    handleCloseNewProject(event) {
        event.preventDefault();
        this.setState({
            newProjectClicked: false
        });
    }

    handleProjectSubmission(newProjectPayload, errorHandler) {
        projectServiceClient.createProject(
            newProjectPayload,
            this.handleSuccessfulProjectCreation,
            errorHandler
        );
    }

    handleSuccessfulProjectCreation(data) {
        const projectList = this.state.projects.concat(data);
        this.setState({
            newProjectClicked: false,
            projects: projectList
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
                        active={this.state.newProjectClicked}
                        escKeyDown={this.handleCloseNewProject}
                    >
                        <ProjectForm
                            onCancel={this.handleCloseNewProject}
                            onSubmit={this.handleProjectSubmission}
                        />
                    </Modal>
                    <Card>
                        <CardHeader title="Projects">
                            <Button 
                                label="New Project" 
                                onClick={this.handleNewProjectClick}
                            />
                        </CardHeader>
                        <CardBody>
                            <List>
                                { this.state.projects.map(project => {
                                    return(
                                        <DoubleLineListItem 
                                            key={project.id}
                                            lineOne={project.name}
                                            lineTwo={project.description}
                                            clickable={true}
                                            onClick={this.handleProjectSelection.bind(this,project.id)}
                                        />
                                    );                    
                                })} 
                            </List>
                            {errorMessage}
                        </CardBody>
                    </Card>
                </div>
            }
        }
        else {
            renderBody = <p></p>
        }
        return (renderBody)
    }
}
export default Projects