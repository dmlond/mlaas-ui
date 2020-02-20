import React, { Component } from 'react';
import { Switch, Route } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Projects from "./components/Projects";
import ProjectProfile from "./components/ProjectProfile";
import Navbar from "./components/Navbar";

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
        </Switch>
      </main>
    )
  }
}

export default App;
