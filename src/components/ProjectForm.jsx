import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Input, Button } from "@duke-office-research-informatics/dracs";

class ProjectForm extends Component {
    constructor(props) {
        super(props);
        this.nameChange = this.nameChange.bind(this);
        this.descriptionChange = this.descriptionChange.bind(this);
        this.handleSubmissionClick = this.handleSubmissionClick.bind(this);
        this.handleSubmissionError = this.handleSubmissionError.bind(this);

        let projectName = this.props.project ? this.props.project.name : '';
        let projectDescription = this.props.project ? this.props.project.description: '';
        this.state = {
            hasError: false,
            name: projectName,
            description: projectDescription,
            nameChanged: false,
            descriptionChanged: false
        };
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

    handleSubmissionClick() {
        var payload = {}
        if (this.props.project) {
            if (!(this.state.nameChanged || this.state.descriptionChanged)) {
                return;
            }
            if (this.state.nameChanged) {
                payload.name = this.state.name;
            }
            if (this.state.descriptionChanged) {
                payload.description = this.state.description;
            }
        }
        else {
            payload.name = this.state.nameChanged ? this.state.name : "";
            payload.description = this.state.descriptionChanged ? this.state.description : "";
        }
        this.props.onSubmit(payload, this.handleSubmissionError);
    }

    handleSubmissionError(errorMessage) {
        this.setState({
            hasError: true,
            formError: errorMessage.error,
            formErrorReason: errorMessage.reason,
            formErrorSuggestion: errorMessage.suggestion           
        });
    }

    render() {
        let title = this.props.project ? "Edit Project" : "New Project";
        let errorMessage = this.state.hasError ? <div>
            <p>Error: {this.state.formError}</p>
            <p>Reason: {this.state.formErrorReason}</p>
            <p>Suggestion: {this.state.formErrorSuggestion}</p>
        </div> : <div></div>;
    
        let renderBody = <Card
            height="90vw"
            width="90vw"
        >
            <CardHeader title={ title } />
            <CardBody>
                <Input
                    name="name"
                    labelText="Name"
                    requred={true}
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
export default ProjectForm;