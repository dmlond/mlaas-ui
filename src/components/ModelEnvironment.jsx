import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import authHelper from '../helpers/authHelper';
import projectServiceClient from '../helpers/projectServiceClient';
import config from "../config/authconfig.js";
import { Spinner, Input, ActionButton, IconTrashcan } from "@duke-office-research-informatics/dracs";
import ModelManagementMenu from "./ModelManagementMenu";

class ModelEnvironment extends Component {
    constructor(props) {
        super(props);
        this.loadEnvironment = this.loadEnvironment.bind(this);
        this.handleSuccessfulEnvironmentLoad = this.handleSuccessfulEnvironmentLoad.bind(this);
        this.handleFailedEnvironmentLoad = this.handleFailedEnvironmentLoad.bind(this);
        this.handleSetEnvironmentClick = this.handleSetEnvironmentClick.bind(this);
        this.handleCloseSetEnvironment = this.handleCloseSetEnvironment.bind(this);
        this.handleSetEnvironmentSubmission = this.handleSetEnvironmentSubmission.bind(this);
        this.handleSuccessfulEnvironmentUpdate = this.handleSuccessfulEnvironmentUpdate.bind(this);
        this.environmentKeyChange = this.environmentKeyChange.bind(this);
        this.environmentValueChange = this.environmentValueChange.bind(this);

        this.state = {
            isLoading: true,
            hasError: false,
            setEnvironmentClicked: false,
            focus: "key-0",
            environmentKeys: [],
            environmentValues: [],
            currentEntries: 0
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

    handleSuccessfulEnvironmentLoad(data, extraSettings) {
        let keyList = Object.keys(data);
        let environmentLoad = {
            isLoading: false,
            environment: data,
            environmentKeys: keyList,
            environmentValues: Object.values(data),
            currentEntries: keyList.length
        };
        this.setState(
            {...environmentLoad, ...extraSettings}
        );
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
            this.setState({
                isLoading: false,
                hasError: true,
                error: errorMessage.error,
                errorReason: errorMessage.reason,
                errorSuggestion: errorMessage.suggestion           
            });
        }
    }

    handleSetEnvironmentClick(event) {
        event.preventDefault();
        this.setState({
            setEnvironmentClicked: true
        });
    }

    handleCloseSetEnvironment(event) {
        event.preventDefault();
        this.setState({
            setEnvironmentClicked: false
        });
    }

    handleSetEnvironmentSubmission(updatePayload, errorHandler) {
        projectServiceClient.setEnvironment(
            this.props.match.params.modelid,
            updatePayload,
            this.handleSuccessfulEnvironmentUpdate,
            errorHandler
        );
    }

    handleSuccessfulEnvironmentUpdate(data) {
        this.handleSuccessfulEnvironmentLoad(data, {setEnvironmentClicked: false});
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
                    var kvEntry = <li key={newKVIndex}>
                         <div style={{
                             "margin": 0,
                             "display": "inline-flex"
                         }}>
                             <Input
                                id={"key-"+newKVIndex}
                                autoFocus={"key-"+newKVIndex === this.state.focus}
                                name={"key-"+newKVIndex}
                                placeholder="Input variable key"
                                onChange={this.environmentKeyChange}
                                value={this.state.environmentKeys[newKVIndex] ? this.state.environmentKeys[newKVIndex] : ""}
                             />
                         </div>
                         <div style={{
                             "display": "inline-flex",
                             "marginLeft": 10
                         }}>
                             <Input
                                id={"value-"+newKVIndex}
                                name={"value-"+newKVIndex}
                                autoFocus={"value-"+newKVIndex === this.state.focus}
                                placeholder="Input variable value"
                                onChange={this.environmentValueChange}
                                value={this.state.environmentValues[newKVIndex] ? this.state.environmentValues[newKVIndex] : ""}
                             />
                         </div>
                         <div style={{
                             "display": "inline-flex",
                             "marginLeft": 10
                         }}>
                             <ActionButton
                                onClick={this.removeEnvironmentEntry.bind(this, newKVIndex)}
                            >
                                <IconTrashcan/>
                            </ActionButton>
                        </div>
                     </li>;
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
                    <li>
                        <div style={{
                            "margin": 0,
                            "display": "inline-flex"
                        }}>
                            <Input
                                id={"key-"+newKVIndex}
                                name={"key-"+newKVIndex}
                                autoFocus={"key-"+newKVIndex === this.state.focus}
                                placeholder="Input variable key"
                                onChange={this.environmentKeyChange}
                                value={this.state.environmentKeys[newKVIndex] ? this.state.environmentKeys[newKVIndex] : ""}
                            />
                        </div>
                        <div style={{
                            "display": "inline-flex",
                            "marginLeft": 10
                        }}>
                            <Input
                                id={"value-"+newKVIndex}
                                name={"value-"+newKVIndex}
                                autoFocus={"value-"+newKVIndex === this.state.focus}
                                placeholder="Input variable value"
                                onChange={this.environmentValueChange}
                                value={this.state.environmentValues[newKVIndex] ? this.state.environmentValues[newKVIndex] : ""}
                            />
                        </div>
                    </li>
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
