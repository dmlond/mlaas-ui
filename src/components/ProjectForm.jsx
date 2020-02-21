import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Input, Button } from "@duke-office-research-informatics/dracs";

class ProjectForm extends Component {
    constructor(props) {
        super(props);
        this.formChange = this.formChange.bind(this);
        this.handleSubmissionClick = this.handleSubmissionClick.bind(this);
        this.handleSubmissionError = this.handleSubmissionError.bind(this);

        let projectName = this.props.project ? this.props.project.name : '';
        let projectDescription = this.props.project ? this.props.project.description: '';
        this.state = {
            hasError: false,
            name: projectName,
            description: projectDescription
        };
    }

    formChange(value, name) {
        this.setState({
            [name]: value
        });
    }

    handleSubmissionClick() {
        this.props.onSubmit(this.state.name,this.state.description, this.handleSubmissionError);
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
                    onChange={this.formChange}
                    value={this.state.name}
                />
                <Input
                    name="description"
                    labelText="Description"
                    required={true}
                    onChange={this.formChange}
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