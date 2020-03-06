import React, { Component } from 'react';
import { Switch, Route } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Projects from "./components/Projects";
import ProjectProfile from "./components/ProjectProfile";
import Models from "./components/Models";
import ModelProfile from "./components/ModelProfile";
import ModelSchedule from "./components/ModelSchedule";
import ModelEnvironment from "./components/ModelEnvironment";
import ModelDeployments from "./components/ModelDeployments";
import Navbar from "./components/Navbar";
import DeploymentProfile from "./components/DeploymentProfile";

class App extends Component {
  render () {
    return (
      <main>
        <Navbar />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/projects" component={Projects} />
          <Route path="/projects/:projectid" component={ProjectProfile} />
          <Route exact path="/models" component={Models} />
          <Route path="/models/:modelid/schedule" component={ModelSchedule} />
          <Route path="/models/:modelid/environment" component={ModelEnvironment} />
          <Route path="/models/:modelid/deployments/:deploymentid" component={DeploymentProfile} />
          <Route path="/models/:modelid/deployments" component={ModelDeployments} />
          <Route path="/models/:modelid" component={ModelProfile} />
        </Switch>
      </main>
    )
  }
}

export default App;
