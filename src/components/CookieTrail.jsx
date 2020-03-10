import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import {Link} from "react-router-dom";

class CookieTrail extends Component {
    render() {
        var renderBody;
        let projectName = this.props.match.params.projectName;
        let modelName = this.props.match.params.modelName;
        if (projectName && modelName) {
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