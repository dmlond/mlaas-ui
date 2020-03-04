import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Input, Checkbox, Button, Dropdown } from "@duke-office-research-informatics/dracs";

class ModelForm extends Component {
    constructor(props) {
        super(props);
        this.nameChange = this.nameChange.bind(this);
        this.projectChange = this.projectChange.bind(this);
        this.descriptionChange = this.descriptionChange.bind(this);
        this.isPublicChange = this.isPublicChange.bind(this);
        this.gitRepoChange = this.gitRepoChange.bind(this);
        this.gitDeployUserChange = this.gitDeployUserChange.bind(this);
        this.gitDeployPasswordChange = this.gitDeployPasswordChange.bind(this);
        this.handleSubmissionClick = this.handleSubmissionClick.bind(this);
        this.handleSubmissionError = this.handleSubmissionError.bind(this);

        let modelProjectId = this.props.model ? this.props.model.project_id : '';
        let modelName = this.props.model ? this.props.model.name : '';
        let modelDescription = this.props.model ? this.props.model.description: '';
        let gitRepositoryUrl = this.props.model ? this.props.model.git_repository_url: '';
        let isPubliclyAvailable = this.props.model ? this.props.model.is_publicly_available : false;
        let gitDeployUser = this.props.model ? this.props.model.git_deploy_user: '';
        let gitDeployPassword = this.props.model ? this.props.model.git_deploy_password: '';
        this.state = {
            hasError: false,
            name: modelName,
            description: modelDescription,
            project_id: modelProjectId,
            git_repository_url: gitRepositoryUrl,
            is_publicly_available: isPubliclyAvailable,
            git_deploy_user: gitDeployUser,
            git_deploy_password: gitDeployPassword,
            nameChanged: false,
            descriptionChanged: false,
            gitRepositoryUrlChanged: false,
            isPubliclyAvailableChanged: false,
            gitDeployUserChanged: false,
            gitDeployPasswordChanged: false
        };
    }

    projectChange(value) {
        this.setState({
            project_id: value
        });
    }

    nameChange(value) {
        this.setState({
            nameChanged: true,
            name: value
        });
    }

    descriptionChange(value) {
        this.setState({
            descriptionChanged: true,
            description: value
        });
    }

    isPublicChange() {
        let value = this.state.is_publicly_available ? false : true;
        this.setState({
            isPubliclyAvailableChanged: true,
            is_publicly_available: value
        });
    }

    gitRepoChange(value) {
        this.setState({
            gitRepositoryUrlChanged: true,
            git_repository_url: value
        });
    }

    gitDeployUserChange(value) {
        this.setState({
            gitDeployUserChanged: true,
            git_deploy_user: value
        });
    }
    
    gitDeployPasswordChange(value) {
        this.setState({
            gitDeployPasswordChanged: true,
            git_deploy_password: value
        });
    }

    handleSubmissionClick() {
        var payload = {}
        if (this.props.model) {
            if (!(
                this.state.nameChanged || 
                this.state.descriptionChanged ||
                this.state.isPubliclyAvailableChanged ||
                this.state.gitRepositoryUrlChanged ||
                this.state.gitDeployUserChanged ||
                this.state.gitDeployPasswordChanged)) {
                return;
            }
            if (this.state.nameChanged) {
                payload.name = this.state.name;
            }
            if (this.state.descriptionChanged) {
                payload.description = this.state.description;
            }
            if (this.state.isPubliclyAvailableChanged) {
                payload.is_publicly_available = this.state.is_publicly_available;
            }
            if (this.state.gitRepositoryUrlChanged) {
                payload.git_repository_url = this.state.git_repository_url;
            }
            if (this.state.gitDeployUserChanged) {
                payload.git_deploy_user = this.state.git_deploy_user;
            }
            if (this.state.gitDeployPasswordChanged) {
                payload.git_deploy_password = this.state.git_deploy_password;
            }
        }
        else {
            if (!(
                this.state.nameChanged || 
                this.state.descriptionChanged ||
                this.state.gitRepositoryUrlChanged ||
                (this.state.is_publicly_available && !(
                    this.state.gitDeployUserChanged ||
                    this.state.gitDeployPasswordChanged)
                )
               )) {
                this.setState({
                    hasError: true,
                    error: "invalid submission",
                    errorReason: "required values are missing",
                    errorSuggestion: "set required values"
                })
                return;
            }

            payload.name = this.state.name;
            payload.description = this.state.description;
            payload.is_publicly_available = this.state.is_publicly_available;
            payload.git_repository_url = this.state.git_repository_url;
            payload.git_deploy_user = this.state.git_deploy_user;
            payload.git_deploy_password = this.state.git_deploy_password;
        }
        this.props.onSubmit(this.state.project_id, payload, this.handleSubmissionError);
    }

    handleSubmissionError(errorMessage) {
        this.setState({
            hasError: true,
            error: errorMessage.error,
            errorReason: errorMessage.reason,
            errorSuggestion: errorMessage.suggestion           
        });
    }

    render() {
        let title = this.props.model ? "Edit Model" : "New Model";
        let projectElement = this.props.model ? <h4>ProjectID: {this.props.model.project_id}</h4> :                         <Dropdown
            label="Project ID"
            required={true}
            labelKey="name"
            onChange={this.projectChange}
            source={this.props.userProjects}
            value={this.state.project_id}
            valueKey="id"
            allowBlank={false}
        />

        let errorMessage = this.state.hasError ? <div>
            <p>Error: {this.state.error}</p>
            <p>Reason: {this.state.errorReason}</p>
            <p>Suggestion: {this.state.errorSuggestion}</p>
        </div> : <div></div>;
    
        let renderBody = <Card
            height="40vw"
            width="90vw"
        >
            <CardHeader title={ title } />
            <CardBody>
                { projectElement }
                <Input
                    name="name"
                    labelText="Name"
                    required={true}
                    onChange={this.nameChange}
                    value={this.state.name}
                />
                <Input
                    name="description"
                    labelText="Description"
                    required={true}
                    onChange={this.descriptionChange}
                    value={this.state.description}
                />
                <Input
                    name="git_repository_url"
                    labelText="Git Repository Url"
                    required={true}
                    onChange={this.gitRepoChange}
                    value={this.state.git_repository_url}
                />
                <Checkbox
                    name="is_publicly_available"
                    label="Repository is Public"
                    onChange={this.isPublicChange}
                    checked={this.state.is_publicly_available}
                    value={this.state.is_publicly_available}
                />
                <div id="deployment_credentials" hidden={this.state.is_publicly_available}>
                    <Input
                        name="git_deploy_user"
                        labelText="Git Deployment User"
                        required={!this.state.is_publicly_available}
                        onChange={this.gitDeployUserChange}
                        value={this.state.git_deploy_user}
                    />
                    <Input
                        name="git_deploy_password"
                        labelText="Git Deployment Password"
                        required={!this.state.is_publicly_available}
                        onChange={this.gitDeployPasswordChange}
                        value={this.state.git_deploy_password}
                    />
                </div>
                {errorMessage}
                <Button
                    onClick={this.props.onCancel}
                    label="Cancel"
                />
                <Button
                    onClick={this.handleSubmissionClick}
                    label="Submit"
                />
            </CardBody>
        </Card>
        return (
            renderBody
        )
    }
}
export default ModelForm;