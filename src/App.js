import React, { Component } from 'react';
import { Switch, Route } from "react-router-dom"
import Home from "./components/Home"
import Navbar from "./components/Navbar"

class App extends Component {
  render () {
    return (
      <main>
        <Navbar />
        <Switch>
          <Route path="/" component={Home} exact />
        </Switch>
      </main>
    )
  }
}

export default App;
