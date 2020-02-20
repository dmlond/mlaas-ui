import React, { Component } from 'react';
import authHelper from '../helpers/authHelper';
import projectServiceClient from '../helpers/projectServiceClient';
import config from "../config/authconfig.js";
import { List, DoubleLineListItem } from "@duke-office-research-informatics/dracs";

class Projects extends Component {
    constructor(props) {
        super(props);
        this.loadProjects = this.loadProjects.bind(this);
        this.handleSuccessfulProjectLoad = this.handleSuccessfulProjectLoad.bind(this);
        this.handleFailedProjectLoad = this.handleFailedProjectLoad.bind(this);
        this.state = {
            projects: []
        };
    }

    componentDidMount() {
        if (!(authHelper.isLoggedIn())) {
            window.location.assign(config['oauth_base_uri']+"/authorize?response_type=code&client_id="+config['oauth_client_id']+"&state="+window.location.pathname+"&redirect_uri="+window.location.origin+'/login');
        }
        this.loadProjects();
    }

    loadProjects() {
        projectServiceClient.index(
            this.handleSuccessfulProjectLoad,
            this.handleFailedProjectLoad
        );
    }

    handleSuccessfulProjectLoad(data) {
        this.setState({
            projects: data
        });
    }

    handleFailedProjectLoad(errorMessage) {
        this.setState({
            hasError: true,
            errorMessage: errorMessage
        });
    }

    handleProjectSelection(projectid, event) {
        window.location.assign(window.location.origin+'/projects/'+projectid);
    }

    render() {
        var renderBody;

        if (authHelper.isLoggedIn()) {
          renderBody = <div>
              <p>Projects:</p>
              <List>
                { this.state.projects.map(project => {
                    return(
                        <DoubleLineListItem 
                            key={project.id}
                            lineOne={project.name}
                            lineTwo={project.description}
                            clickable={true}
                            onClick={this.handleProjectSelection.bind(this,project.id)}
                        />
                    );                    
                })} 
              </List>
          </div>
        }
        else {
            renderBody = <p></p>
        }
        return (renderBody)
    }
}
export default Projects