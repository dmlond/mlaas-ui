import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import authHelper from '../helpers/authHelper';
import projectServiceClient from '../helpers/projectServiceClient';
import config from "../config/authconfig.js";
import { Spinner, Input, ActionButton, IconTrashcan, Button } from "@duke-office-research-informatics/dracs";
import ModelManagementMenu from "./ModelManagementMenu";

class ModelEnvironment extends Component {
    constructor(props) {
        super(props);
        this.loadEnvironment = this.loadEnvironment.bind(this);
        this.handleSuccessfulEnvironmentLoad = this.handleSuccessfulEnvironmentLoad.bind(this);
        this.handleFailedEnvironmentLoad = this.handleFailedEnvironmentLoad.bind(this);
        this.environmentKeyChange = this.environmentKeyChange.bind(this);
        this.environmentValueChange = this.environmentValueChange.bind(this);
        this.newEntry = this.newEntry.bind(this);
        this.submitEnvironment = this.submitEnvironment.bind(this);
        this.toggleShowValues = this.toggleShowValues.bind(this);

        this.state = {
            isLoading: true,
            hasError: false,
            focus: "key-0",
            environmentKeys: [],
            environmentValues: [],
            currentEntries: 0,
            showValues: true,
            valueType: "text",
            showValuesLabel: "Hide Values"
        }
    }

    componentDidMount() {
        if (authHelper.isLoggedIn()) {
            this.loadEnvironment();
        }
        else {
            window.location.assign(config.oauth_base_uri+"/authorize?response_type=code&client_id="+config.oauth_client_id+"&state="+window.location.pathname+"&redirect_uri="+window.location.origin+'/login');
        }
    }

    loadEnvironment() {
        let id = this.props.match.params.modelid;
        projectServiceClient.environment(
            id,
            this.handleSuccessfulEnvironmentLoad,
            this.handleFailedEnvironmentLoad
        );
    }

    handleSuccessfulEnvironmentLoad(data) {
        let newEnvironment = data.variables;
        let keyList = Object.keys(newEnvironment);
        if (keyList.length > 0) {
            this.setState({
                isLoading: false,
                environmentKeys: keyList,
                environmentValues: Object.values(newEnvironment),
                currentEntries: keyList.length,
                showValues: false,
                valueType: "password",
                showValuesLabel: "Reveal Values"
            });
        }
        else {
            this.setState({
                isLoading: false,
                environmentValues: [],
                environmentKeys: [],
                currentEntries: 0
            });
        }
    }

    handleFailedEnvironmentLoad(errorMessage) {
        if (errorMessage.error.match(/.*not.*found/)) {
            this.setState({
                isLoading: false,
                environmentValues: [],
                environmentKeys: [],
                currentEntries: 0
            });
        } else {
            this.handleFailedEnvironmentUpdate(errorMessage)
        }
    }

    handleFailedEnvironmentUpdate(errorMessage) {
        this.setState({
            isLoading: false,
            hasError: true,
            error: errorMessage.error,
            errorReason: errorMessage.reason,
            errorSuggestion: errorMessage.suggestion           
        });
    }

    environmentKeyChange(value, key) {
        let index = parseInt(key.split('-')[1]);
        var keyList = this.state.environmentKeys;
        keyList[index] = value;

        this.setState({
            environmentKeys: keyList,
            focus: key,
            currentEntries: (this.state.currentEntries < index + 1) ? index + 1 : this.state.currentEntries
        })
    }

    environmentValueChange(value, key) {
        let index = parseInt(key.split('-')[1]);
        var valueList = this.state.environmentValues;
        valueList[index] = value;

        this.setState({
            environmentValues: valueList,
            focus: key,
            currentEntries: (this.state.currentEntries < index + 1) ? index + 1 : this.state.currentEntries
        })
    }

    removeEnvironmentEntry(index) {
        var keyList = this.state.environmentKeys;
        keyList.splice(index,1);
        var valueList = this.state.environmentValues;
        valueList.splice(index,1);
        this.setState({
            environmentKeys: keyList,
            environmentValues: valueList,
            currentEntries: this.state.currentEntries - 1
        });
    }

    submitEnvironment(event) {
        event.preventDefault();
        var environment = {};
        for (let curIndex = 0; curIndex < this.state.environmentKeys.length; curIndex++) {
            let thisKey = this.state.environmentKeys[curIndex];
            if (thisKey){
                let thisValue = this.state.environmentValues[curIndex];
                environment[thisKey] = thisValue;
            }
        }
        projectServiceClient.setEnvironment(
            this.props.match.params.modelid,
            environment,
            this.handleSuccessfulEnvironmentLoad,
            this.handleFailedEnvironmentUpdate
        );
    }

    toggleShowValues(event) {
        event.preventDefault();
        let showValues = !this.state.showValues;
        if (showValues) {
            this.setState({
                showValues: showValues,
                valueType: "text",
                showValuesLabel: "Hide Values"
            });
        }
        else {
            this.setState({
                showValues: showValues,
                valueType: "password",
                showValuesLabel: "Reveal Values"
            });
        }
    }

    newEntry(index, withTrashcan) {
        if (withTrashcan){
            return (
                <li key={index}>
                    <div style={{
                        "margin": 0,
                        "display": "inline-flex"
                    }}>
                        <Input
                            id={"key-"+index}
                            autoFocus={"key-"+index === this.state.focus}
                            name={"key-"+index}
                            placeholder="Input variable key"
                            onChange={this.environmentKeyChange}
                            value={this.state.environmentKeys[index] ? this.state.environmentKeys[index] : ""}
                        />
                    </div>
                    <div style={{
                        "display": "inline-flex",
                        "marginLeft": 10
                    }}>
                        <Input
                            id={"value-"+index}
                            type={("value-"+index === this.state.focus || !this.state.environmentValues[index]) ? "text" : this.state.valueType}
                            readOnly={("value-"+index === this.state.focus || !this.state.environmentValues[index]) ? false : !this.state.showValues}
                            name={"value-"+index}
                            autoFocus={"value-"+index === this.state.focus}
                            placeholder="Input variable value"
                            onChange={this.environmentValueChange}
                            value={this.state.environmentValues[index] ? this.state.environmentValues[index] : ""}
                        />
                    </div>
                    <div style={{
                        "display": "inline-flex",
                        "marginLeft": 10
                    }}>
                        <ActionButton
                            onClick={this.removeEnvironmentEntry.bind(this, index)}
                        >
                            <IconTrashcan/>
                        </ActionButton>
                    </div>
                </li>
            )
        }
        else {
            return (
                <li key={index}>
                    <div style={{
                        "margin": 0,
                        "display": "inline-flex"
                    }}>
                        <Input
                            id={"key-"+index}
                            autoFocus={"key-"+index === this.state.focus}
                            name={"key-"+index}
                            placeholder="Input variable key"
                            onChange={this.environmentKeyChange}
                            value={this.state.environmentKeys[index] ? this.state.environmentKeys[index] : ""}
                        />
                    </div>
                    <div style={{
                        "display": "inline-flex",
                        "marginLeft": 10
                    }}>
                        <Input
                            id={"value-"+index}
                            name={"value-"+index}
                            autoFocus={"value-"+index === this.state.focus}
                            placeholder="Input variable value"
                            onChange={this.environmentValueChange}
                            value={this.state.environmentValues[index] ? this.state.environmentValues[index] : ""}
                        />
                    </div>
                </li>
            )
        }
    }

    render() {
        let modelId = this.props.match.params.modelid;
        var renderBody;
    
        if (authHelper.isLoggedIn()) {
            if (this.state.isLoading) {
                renderBody = <div><Spinner /></div>
            }
            else {
                var newKVIndex = 0;
                var kvEntries = [...Array(this.state.currentEntries).keys()].map(() => {
                    var kvEntry = this.newEntry(newKVIndex, true);
                     newKVIndex = newKVIndex + 1;
                     return (
                         kvEntry
                     );
                });
         
                var renderEnvironment = <ul 
                    style={{
                        "listStyle": "none"
                }}>
                    {kvEntries}
                    {this.newEntry(newKVIndex)}
                    <div style={{
                        "margin": 0,
                        "display": "inline-flex"
                    }}>
                        <Button
                            label="Submit"
                            onClick={this.submitEnvironment}
                        />
                    </div>
                    <div style={{
                        "display": "inline-flex",
                        "marginLeft": 10
                    }}>
                        <Button
                            label={this.state.showValuesLabel}
                            onClick={this.toggleShowValues}
                        />
                    </div>
                </ul>

                renderBody = <div>
                    <ModelManagementMenu model_id={modelId}>
                        {renderEnvironment}
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

export default withRouter(ModelEnvironment);
