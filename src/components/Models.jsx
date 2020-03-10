import React, { Component } from 'react';
import authHelper from '../helpers/authHelper';
import projectServiceClient from '../helpers/projectServiceClient';
import ModelForm from './ModelForm';
import {Link} from "react-router-dom";
import config from "../config/authconfig.js";
import { Modal, List, DoubleLineListItem, Card, CardHeader, CardBody, Button, Spinner, Dropdown, ActionButton, IconCancel, Tooltip } from "@duke-office-research-informatics/dracs";

class Models extends Component {
    constructor(props) {
        super(props);
        this.loadModels = this.loadModels.bind(this);
        this.projectChange = this.projectChange.bind(this);
        this.clearProjectFilter = this.clearProjectFilter.bind(this);
        this.loadUserProjects = this.loadUserProjects.bind(this);
        this.handleSuccessfulUserProjectLoad = this.handleSuccessfulUserProjectLoad.bind(this);
        this.handleFailedUserProjectLoad = this.handleFailedUserProjectLoad.bind(this);
        this.handleSuccessfulModelLoad = this.handleSuccessfulModelLoad.bind(this);
        this.handleFailedModelLoad = this.handleFailedModelLoad.bind(this);
        this.handleNewModelClick = this.handleNewModelClick.bind(this);
        this.handleCloseNewModel = this.handleCloseNewModel.bind(this);
        this.handleModelSubmission = this.handleModelSubmission.bind(this);
        this.handleSuccessfulModelCreation = this.handleSuccessfulModelCreation.bind(this);

        this.state = {
            isLoading: true,
            hasError: false,
            modelCreationHasError: false,
            newModelClicked: false,
            models: [],
            userProjects: [{name:"",value:""}]
        };
    }

    componentDidMount() {
        if (authHelper.isLoggedIn()) {
            this.loadUserProjects();
        }
        else {
            window.location.assign(config['oauth_base_uri']+"/authorize?response_type=code&client_id="+config['oauth_client_id']+"&state="+window.location.pathname+"&redirect_uri="+window.location.origin+'/login');
        }
    }

    loadUserProjects() {
        projectServiceClient.projects(
            this.handleSuccessfulUserProjectLoad,
            this.handleFailedUserProjectLoad
        );
    }

    handleSuccessfulUserProjectLoad(data) {
        if (data.length < 1) {
            this.setState({
                isLoading: false,
                needsProject: true
            });
        } else {
            this.setState({
                userProjects: data
            });
            let projectId = this.props.project ? this.props.project.id : null;
            this.loadModels(projectId);
        }
    }

    handleFailedUserProjectLoad(errorMessage) {
        this.setState({
            isLoading: false,
            hasError: true,
            error: errorMessage.error,
            errorReason: errorMessage.reason,
            errorSuggestion: errorMessage.suggestion           
        });
    }

    loadModels(projectId) {
        projectServiceClient.models(
            {project_id: projectId},
            this.handleSuccessfulModelLoad,
            this.handleFailedModelLoad
        );
    }

    handleSuccessfulModelLoad(data) {
        this.setState({
            isLoading: false,
            models: data
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

    handleModelSelection(model) {
        window.location.assign(window.location.origin+'/'+model.project_name+'/'+model.name);
    }

    handleNewModelClick(event) {
        event.preventDefault();
        this.setState({
            newModelClicked: true
        });
    }

    handleCloseNewModel(event) {
        event.preventDefault();
        this.setState({
            newModelClicked: false
        });
    }

    handleModelSubmission(projectId, newModelPayload, errorHandler) {
        projectServiceClient.createModel(
            projectId,
            newModelPayload,
            this.handleSuccessfulModelCreation,
            errorHandler
        );
    }

    handleSuccessfulModelCreation(model) {
        if (this.props.project && model.project_id !== this.props.project.id) {
            window.location.assign(window.location.origin+'/'+model.project_name)
            return;
        }
        const modelList = this.state.models.concat(model);
        this.setState({
            newModelClicked: false,
            models: modelList
        });
    }

    projectChange(value) {
        this.setState({
            project_id: value
        });
        this.loadModels(value);
    }

    clearProjectFilter() {
        this.setState({
            project_id: null
        });
        this.loadModels(null);
    }
    render() {
        var renderBody;

        let errorMessage = this.state.hasError ? <div>
            <p>Error: {this.state.error}</p>
            <p>Reason: {this.state.errorReason}</p>
            <p>Suggestion: {this.state.errorSuggestion}</p>
        </div> : <div></div>;
        if (this.state.isLoading) {
            renderBody = <div><Spinner /></div>
        }
        else if (this.state.needsProject) {
            renderBody = <Card
                height="90vw"
                width="90vw"
            >
                <CardHeader title="You need to create a project before you can create a model" />
                <CardBody>
                    <Link to="/projects">Projects</Link>
                </CardBody>
            </Card>
        }
        else {  
            let CancelToolTip = Tooltip(ActionButton);

            var renderProjectFilter;
            var projectModelForm = <ModelForm
                onCancel={this.handleCloseNewModel}
                onSubmit={this.handleModelSubmission}
                userProjects={this.state.userProjects}
                selectedProjectId={this.props.project ? this.props.project.id : null}
            />

            if (this.props.project) {
                renderProjectFilter = '';
            }
            else {
                renderProjectFilter = <div style={{"display":"inline-flex"}}>
                    <CancelToolTip
                        onClick={this.clearProjectFilter}
                        tooltip='Clear Project Filter'
                    >
                        <IconCancel/>
                    </CancelToolTip>
                    <Dropdown
                        label="Filter by Project"
                        labelKey="name"
                        onChange={this.projectChange}
                        source={this.state.userProjects}
                        value={this.state.project_id}
                        valueKey="id"
                    />
                </div>
            }
            renderBody = <div>
                <Modal
                    active={this.state.newModelClicked}
                    escKeyDown={this.handleCloseNewModel}
                >
                    {projectModelForm}
                </Modal>
                <Card>
                    <CardHeader title="Models">
                        {renderProjectFilter}
                        <Button 
                            label="New Model" 
                            onClick={this.handleNewModelClick}
                        />
                    </CardHeader>
                    <CardBody>
                        <List>
                            { this.state.models.map(model => {
                                return(
                                    <DoubleLineListItem 
                                        key={model.id}
                                        lineOne={model.name}
                                        lineTwo={model.description}
                                        clickable={true}
                                        onClick={this.handleModelSelection.bind(this,model)}
                                    />
                                );                    
                            })} 
                        </List>
                        {errorMessage}
                    </CardBody>
                </Card>
            </div>
        }
        return (renderBody)
    }
}
export default Models