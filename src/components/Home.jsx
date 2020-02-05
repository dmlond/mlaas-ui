import React, { Component } from 'react';
import authHelper from '../helpers/authHelper';

class Home extends Component {
    render() {
      if (authHelper.isLoggedIn()) {
        return (
          <div className="App">
            <header className="App-header">
              <p>
                Edit <code>src/App.js</code> and save to reload.
              </p>
              <a
                className="App-link"
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn React
              </a>
            </header>
          </div>  
        )
      }
      else {
        return (
          <div className="App">
            <header className="App-header">
              <p>
                This is the Machine Learning Service @ Duke
              </p>
            </header>
          </div>
        )
      }
    }
}

export default Home