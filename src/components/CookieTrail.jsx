import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import {Link} from "react-router-dom";

class CookieTrail extends Component {
    render() {
        var renderBody;
        let projectName = this.props.match.params.projectName;
        let modelName = this.props.match.params.modelName;
        if (projectName && modelName) {
            let deploymentId = this.props.match.params.deploymentid;
            let deploymentsPointer = '';
            let deploymentsLink = '';
            if (deploymentId) {
                deploymentsPointer = <div style={{"marginLeft":5}}>
                    >
                </div>
                deploymentsLink = <div style={{"marginLeft":5}}>
                    <Link to={"/"+projectName+"/"+modelName+'/deployments'}>deployments</Link>
                </div>
            }

            let currentPath = window.location.pathname.split('/').pop();            
            let currentLink = '';
            let currentPointer = '';
            if (currentPath === modelName) {
                currentPointer = <div style={{"marginLeft":5}}>
                    >
                </div>

                currentLink = <div style={{"marginLeft":5}}>
                    <Link to={window.location.pathname}>profile</Link>
                </div>
            }
            else if (currentPath === deploymentId) {
                currentPointer = <div style={{"marginLeft":5}}>
                    >
                </div>
                currentLink = <div style={{"marginLeft":5}}>
                    <Link to={window.location.pathname}>profile</Link>
                </div>
            }
            else {
                currentPointer = <div style={{"marginLeft":5}}>
                    >
                </div>
                currentLink = <div style={{"marginLeft":5}}>
                    <Link to={window.location.pathname}>{currentPath}</Link>
                </div>
            }
            renderBody = <div style={{"display":"inline-flex", "marginLeft": 5}}>
                <div style={{"display":"inline-flex", "margin":0,"padding": 0}}>
                    <Link to={"/"+projectName}>{projectName}</Link>
                </div>
                <div style={{"marginLeft":5}}>
                    >
                </div>
                <div style={{"marginLeft":5}}>
                    <Link to={"/"+projectName+"/"+modelName}>{modelName}</Link>
                </div>
                {deploymentsPointer}
                {deploymentsLink}
                {currentPointer}
                {currentLink}
            </div>
        }
        else {
            renderBody = <div></div>
        }

        return (
            renderBody
        )
    }
}

export default withRouter(CookieTrail);