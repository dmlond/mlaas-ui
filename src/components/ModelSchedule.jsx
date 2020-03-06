import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import authHelper from '../helpers/authHelper';
import projectServiceClient from '../helpers/projectServiceClient';
import config from "../config/authconfig.js";
import { Spinner, List, SingleLineListItem, Modal, Button, Card, CardHeader, CardBody } from "@duke-office-research-informatics/dracs";
import ModelManagementMenu from "./ModelManagementMenu";
import ScheduleForm from "./ScheduleForm";

class ModelSchedule extends Component {
    constructor(props) {
        super(props);
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
            schedule: null
        }
    }

    componentDidMount() {
        if (authHelper.isLoggedIn()) {
            this.loadSchedule();
        }
        else {
            window.location.assign(config.oauth_base_uri+"/authorize?response_type=code&client_id="+config.oauth_client_id+"&state="+window.location.pathname+"&redirect_uri="+window.location.origin+'/login');
        }
    }

    loadSchedule() {
        let id = this.props.match.params.modelid;
        projectServiceClient.schedule(
            id,
            this.handleSuccessfulScheduleLoad,
            this.handleFailedScheduleLoad
        );
    }

    handleSuccessfulScheduleLoad(data) {
        this.setState({
            isLoading: false,
            needsSchedule: false,
            schedule: data
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
        let modelId = this.props.match.params.modelid;
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
                    renderSchedule = <List>
                        <SingleLineListItem>
                            <h4>Schedule Interval: </h4>{this.state.schedule.schedule_interval}
                        </SingleLineListItem>                        
                        <SingleLineListItem>
                            <h4>Start Date: </h4>{startDate}
                        </SingleLineListItem>
                        <SingleLineListItem>
                            <h4>End Date: </h4>{endDate}
                        </SingleLineListItem>
                        <SingleLineListItem>
                            <h4>Retries: </h4>{this.state.schedule.retries}
                        </SingleLineListItem>
                        <SingleLineListItem>
                            <h4>Retry Delay: </h4>{this.state.schedule.retry_delay}
                        </SingleLineListItem>
                        <SingleLineListItem>
                            <h4>Catchup? </h4>{this.state.schedule.catchup ? 'true' : 'false'}
                        </SingleLineListItem>
                        <SingleLineListItem>
                            <h4>Depends on Past? </h4>{this.state.schedule.depends_on_past ? 'true' : 'false'}
                        </SingleLineListItem>
                    </List>
                }
                renderBody = <div>
                    <Modal
                        active={this.state.updateScheduleClicked}
                        escKeyDown={this.handleCloseUpdateSchedule}
                    >
                        <ScheduleForm
                            schedule={this.state.schedule}
                            model_id={modelId}
                            onCancel={this.handleCloseUpdateSchedule}
                            onSubmit={this.handleUpdateScheduleSubmission}
                        />
                    </Modal>
                    <ModelManagementMenu model_id={modelId}>
                        <Card>
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
