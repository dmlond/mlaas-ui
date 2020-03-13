import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import authHelper from '../helpers/authHelper';
import projectServiceClient from '../helpers/projectServiceClient';
import config from "../config/authconfig.js";
import { Spinner, Modal, Button, Card, CardHeader, CardBody } from "@duke-office-research-informatics/dracs";
import ModelManagementMenu from "./ModelManagementMenu";
import ScheduleForm from "./ScheduleForm";
import CookieTrail from './CookieTrail';

class ModelSchedule extends Component {
    constructor(props) {
        super(props);
        this.loadModel = this.loadModel.bind(this);
        this.handleSuccessfulModelLoad = this.handleSuccessfulModelLoad.bind(this);
        this.handleFailedModelLoad = this.handleFailedModelLoad.bind(this);
        this.loadSchedule = this.loadSchedule.bind(this);
        this.handleSuccessfulScheduleLoad = this.handleSuccessfulScheduleLoad.bind(this);
        this.handleFailedScheduleLoad = this.handleFailedScheduleLoad.bind(this);
        this.handleUpdateScheduleClick = this.handleUpdateScheduleClick.bind(this);
        this.handleCloseUpdateSchedule = this.handleCloseUpdateSchedule.bind(this);
        this.handleUpdateScheduleSubmission = this.handleUpdateScheduleSubmission.bind(this);
        this.handleSuccessfulScheduleUpdate = this.handleSuccessfulScheduleUpdate.bind(this);

        this.state = {
            isLoading: true,
            hasError: false,
            updateScheduleClicked: false,
            schedule: null,
            model: null
        }
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

    handleSuccessfulModelLoad(model) {
        this.setState({
            model: model
        });
        this.loadSchedule();
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

    loadSchedule() {
        projectServiceClient.schedule(
            this.state.model.id,
            this.handleSuccessfulScheduleLoad,
            this.handleFailedScheduleLoad
        );
    }

    handleSuccessfulScheduleLoad(schedule) {
        this.setState({
            isLoading: false,
            needsSchedule: false,
            schedule: schedule
        });
    }

    handleFailedScheduleLoad(errorMessage) {
        if (errorMessage.error.match(/.*not.*found/)) {
            this.setState({
                isLoading: false,
                needsSchedule: true
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

    handleUpdateScheduleClick(event) {
        event.preventDefault();
        this.setState({
            updateScheduleClicked: true
        });
    }

    handleCloseUpdateSchedule(event) {
        event.preventDefault();
        this.setState({
            updateScheduleClicked: false
        });
    }

    handleUpdateScheduleSubmission(modelId, updatePayload, errorHandler) {
        projectServiceClient.setSchedule(
            modelId,
            updatePayload,
            this.handleSuccessfulScheduleUpdate,
            errorHandler
        );
    }

    handleSuccessfulScheduleUpdate(data) {
        this.setState({
            isLoading: false,
            needsSchedule: false,
            updateScheduleClicked: false,
            schedule: data
        });
    }

    render() {
        var renderBody;
        if (authHelper.isLoggedIn()) {
            if (this.state.isLoading) {
                renderBody = <div><Spinner /></div>
            }
            else {
                var setScheduleButtonLabel;
                var renderSchedule;
                if (this.state.needsSchedule) {
                    setScheduleButtonLabel = "Set Schedule";
                    renderSchedule = <p>No Schedule is Set</p>
                }
                else {        
                    setScheduleButtonLabel = "Edit Schedule"
                    let startDate = this.state.schedule.start_date ? 
                      new Date(this.state.schedule.start_date).toLocaleString() : 
                      null;
                    let endDate = this.state.schedule.end_date ? 
                    new Date(this.state.schedule.end_date).toLocaleString() : 
                    null;

                    renderSchedule =  <ul style={{
                        "listStyle": "none"
                    }}>
                        <li>
                            <p><b>Schedule Interval:</b> {this.state.schedule.schedule_interval}</p>
                        </li>                        
                        <li>
                            <p><b>Start Date:</b> {startDate}</p>
                        </li>
                        <li>
                            <p><b>End Date:</b> {endDate}</p>
                        </li>
                        <li>
                            <p><b>Retries:</b> {this.state.schedule.retries ? this.state.schedule.retries : 0}</p>
                        </li>
                        <li>
                            <p><b>Retry Delay:</b> {this.state.schedule.retry_delay ? this.state.schedule.retry_delay : 0}</p>
                        </li>
                        <li>
                            <p><b>Stop future runs on failure?</b> {this.state.schedule.depends_on_past ? 'true' : 'false'}</p>
                        </li>
                    </ul>
                }
                let errorMessage = this.state.hasError ? <div>
                    <p>Error: {this.state.error}</p>
                    <p>Reason: {this.state.errorReason}</p>
                    <p>Suggestion: {this.state.errorSuggestion}</p>
                </div> : <div></div>;
                renderBody = <div>
                    <Modal
                        active={this.state.updateScheduleClicked}
                        escKeyDown={this.handleCloseUpdateSchedule}
                    >
                        <ScheduleForm
                            schedule={this.state.schedule}
                            model_id={this.state.model.id}
                            onCancel={this.handleCloseUpdateSchedule}
                            onSubmit={this.handleUpdateScheduleSubmission}
                        />
                    </Modal>
                    <ModelManagementMenu model={this.state.model}>
                        <div style={{"margin":"0 20px"}}>
                            <CookieTrail />
                            <Card
                                height="40vw"
                                width="70vw"
                            >
                                <CardHeader title="Schedule:" >
                                    <Button 
                                        label={setScheduleButtonLabel} 
                                        onClick={this.handleUpdateScheduleClick}
                                    />
                                </CardHeader>
                                <CardBody>
                                    {renderSchedule}
                                    {errorMessage}
                                </CardBody>
                            </Card>
                        </div>
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

export default withRouter(ModelSchedule);
