import React, { Component } from 'react';
import { Switch, Route } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Projects from "./components/Projects";
import Navbar from "./components/Navbar";

class App extends Component {
  render () {
    return (
      <main>
        <Navbar />
        <Switch>
          <Route path="/" component={Home} exact />
          <Route path="/login" component={Login} exact />
          <Route path="/projects" component={Projects} exact />
        </Switch>
      </main>
    )
  }
}

export default App;
