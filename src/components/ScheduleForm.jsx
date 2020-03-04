import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Input, Checkbox, Button } from "@duke-office-research-informatics/dracs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

class ScheduleForm extends Component {
    constructor(props) {
        super(props);
        this.startDateChange = this.startDateChange.bind(this);
        this.endDateChange = this.endDateChange.bind(this);
        this.scheduleIntervalChange = this.scheduleIntervalChange.bind(this);
        this.retriesChange = this.retriesChange.bind(this);
        this.retryDelayChange = this.retryDelayChange.bind(this);
        this.catchupChange = this.catchupChange.bind(this);
        this.dependsOnPastChange = this.dependsOnPastChange.bind(this);
        this.handleSubmissionClick = this.handleSubmissionClick.bind(this);
        this.handleSubmissionError = this.handleSubmissionError.bind(this);

        let modelStartDate = this.props.schedule ? this.props.schedule.start_date : '';
        let modelEndDate = this.props.schedule ? this.props.schedule.end_date : '';
        let scheduleInterval = this.props.schedule ? this.props.schedule.schedule_interval : '';
        let retries = this.props.schedule ? this.props.schedule.retries : 0;
        let retryDelay = this.props.schedule ? this.props.schedule.retry_delay : 0;
        let catchup = this.props.schedule ? this.props.schedule.catchup : false;
        let dependsOnPast = this.props.schedule ? this.props.schedule.depends_on_past : false;
        this.state = {
            hasError: false,
            schedule_interval: scheduleInterval,
            start_date: modelStartDate ? new Date(modelStartDate) : null,
            end_date: modelEndDate ? new Date(modelEndDate) : null,
            retries: retries,
            retry_delay : retryDelay,
            catchup: catchup,
            depends_on_past: dependsOnPast
        };
    }

    startDateChange(value) {
        this.setState({
            start_date: value
        });
    }

    endDateChange(value) {
        this.setState({
            end_date: value
        });
    }

    scheduleIntervalChange(value) {
        this.setState({
            schedule_interval: value
        });
    }

    retriesChange(value) {
        this.setState({
            retries: value
        });
    }

    retryDelayChange(value) {
        this.setState({
            retry_delay : value
        });
    }
    
    catchupChange() {
        let value = this.state.catchup ? false : true;
        this.setState({
            catchup: value
        });
    }

    dependsOnPastChange() {
        let value = this.state.depends_on_past ? false : true;
        this.setState({
            depends_on_past: value
        });
    }

    handleSubmissionClick() {
        var payload = {}
        if (!(this.state.schedule_interval)) {
            this.setState({
                hasError: true,
                error: "invalid submission",
                errorReason: "required values are missing",
                errorSuggestion: "set required values"
            })
            return;
        }

        payload.schedule_interval = this.state.schedule_interval;
        payload.start_date  = this.state.start_date;
        payload.end_date = this.state.end_date;
        payload.retries  = this.state.retries;
        payload.retry_delay  = this.state.retry_delay;
        payload.catchup = this.state.catchup;
        payload.depends_on_past = this.state.depends_on_past;
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
        let title = this.props.schedule ? "Edit Schedule" : "New Schedule";

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
                    name="schedule_interval"
                    labelText="Schedule Interval"
                    onChange={this.scheduleIntervalChange}
                    value={this.state.schedule_interval}
                />
                <h4>Start Date</h4>
                <DatePicker
                    selected={this.state.start_date}
                    onChange={this.startDateChange}
                    showTimeSelect
                    timeIntervals={15}
                    timeCaption="time"
                    dateFormat="Pp"
                />
                <h4>End Date</h4>
                <DatePicker
                    selected={this.state.end_date}
                    onChange={this.endDateChange}
                    showTimeSelect
                    timeIntervals={15}
                    timeCaption="time"
                    dateFormat="Pp"
                />
                <Input
                    name="retries"
                    labelText="Number of Retries to Attempt"
                    onChange={this.retriesChange}
                    value={this.state.retries}
                />
                <Input
                    name="retry_delay"
                    labelText="delay between retries (seconds)"
                    onChange={this.retryDelayChange}
                    value={this.state.retry_delay}
                />
                <Checkbox
                    name="catchup"
                    label="Attempt all intervals within the specified time range"
                    onChange={this.catchupChange}
                    checked={this.state.catchup}
                    value={this.state.catchup}
                />
                <Checkbox
                    name="depends_on_past"
                    label="Do not run attempt of previous attempt fails"
                    onChange={this.dependsOnPastChange}
                    checked={this.state.depends_on_past}
                    value={this.state.depends_on_past}
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
export default ScheduleForm;