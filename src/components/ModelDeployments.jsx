import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import authHelper from '../helpers/authHelper';
import projectServiceClient from '../helpers/projectServiceClient';
import config from "../config/authconfig.js";
import {Link} from "react-router-dom";
import { Spinner } from "@duke-office-research-informatics/dracs";

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

    handleUpdateScheduleSubmission(updatePayload, errorHandler) {
        projectServiceClient.setSchedule(
            this.state.model.id,
            updatePayload,
            this.handleSuccessfulModelUpdate,
            errorHandler
        );
    }

    handleSuccessfulScheduleUpdate(data) {
        this.setState({
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
                let renderSchedule = this.state.needsSchedule ? <p>No Schedule is Set</p> : <p>Schedule</p>
                renderBody = <div>
                    <Link to={"/models/"+this.props.match.params.modelid}>Model</Link>
                    {renderSchedule}
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
