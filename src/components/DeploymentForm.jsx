import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Input, Button } from "@duke-office-research-informatics/dracs";

export default class DeploymentForm extends Component {
    constructor(props) {
        super(props);

        //change handlers
        this.handleSubmissionClick = this.handleSubmissionClick.bind(this);
        this.commitShaChange = this.commitShaChange.bind(this);
        this.imageChange = this.imageChange.bind(this);
        this.entryPointChange = this.entryPointChange.bind(this);
        this.argumentsChange = this.argumentsChange.bind(this);

        //initialization
        let deploymentCommitSha = this.props.deployment ? this.props.deployment.commit_sha : '';
        let deploymentImage = this.props.deployment ? this.props.deployment.image: '';
        let deploymentEntrypoint = this.props.deployment ? this.props.deployment.entrypoint : '';
        //arguments come back as an array, and must be submitted as an array
        let deploymentArguments = this.props.deployment ? this.props.deployment.arguments.join(' ') : '';

        this.state = {
            hasError: false,
            commitShaChanged: false,
            commit_sha: deploymentCommitSha,
            imageChanged: false,
            image: deploymentImage,
            entryPointChanged: false,
            entrypoint: deploymentEntrypoint,
            argumentsChanged: false,
            arguments: deploymentArguments,
        };
    }

    commitShaChange(value) {
        this.setState({
            commitShaChanged: true,
            commit_sha: value
        });
    }

    imageChange(value) {
        this.setState({
            imageChanged: true,
            image: value
        });
    }

    entryPointChange(value) {
        this.setState({
            entryPointChanged: true,
            entrypoint: value
        });
    }

    argumentsChange(value) {
        this.setState({
            argumentsChanged: true,
            arguments: value
        });
    }

    handleSubmissionClick() {
        var payload = {}
        if (this.props.deployment) {
            if (!(
                this.state.commitShaChanged || 
                this.state.imageChanged ||
                this.state.entryPointChanged ||
                this.state.argumentsChanged)) {
                return;
            }
            if (this.state.commitShaChanged) {
                payload.commit_sha = this.state.commit_sha;
            }
            if (this.state.imageChanged) {
                payload.image = this.state.image;
            }
            if (this.state.entryPointChanged) {
                payload.entrypoint = this.state.entrypoint;
            }
            if (this.state.argumentsChanged) {
                //arguments come back as an array, and must be submitted as an array
                payload['arguments'] = this.state.arguments.replace(/^\s+|\s+$/g, '').split(' ');
            }
        }
        else {
            if (!(
                this.state.commitShaChanged || 
                this.state.imageChanged ||
                this.state.entryPointChanged
               )) {
                this.setState({
                    hasError: true,
                    error: "invalid submission",
                    errorReason: "required values are missing",
                    errorSuggestion: "set required values"
                })
                return;
            }

            payload.commit_sha = this.state.commit_sha;
            payload.image = this.state.image;
            payload.entrypoint = this.state.entrypoint;
            //arguments come back as an array, and must be submitted as an array
            payload['arguments'] = this.state.arguments.replace(/^\s+|\s+$/g, '').split(' ');

        }
        this.props.onSubmit(this.props.model_id, payload, this.handleSubmissionError);
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
        let title = this.props.deployment ? "Edit Deployment" : "New Deployment";
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
                <Input
                    name="commit_sha"
                    labelText="Commit SHA"
                    required={true}
                    onChange={this.commitShaChange}
                    value={this.state.commit_sha}
                />
                <Input
                    name="image"
                    labelText="Docker Registry Image URL"
                    required={true}
                    onChange={this.imageChange}
                    value={this.state.image}
                />
                <Input
                    name="entrypoint"
                    labelText="Container Entrypoint (arguments are passed to this command)"
                    required={true}
                    onChange={this.entryPointChange}
                    value={this.state.entrypoint}
                />
                <Input
                    name="arguments"
                    labelText="Arguments to Container Entrypoint"
                    helpText="the execution date will be automatically added as the last argument at runtime"
                    required={true}
                    onChange={this.argumentsChange}
                    value={this.state.arguments}
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
