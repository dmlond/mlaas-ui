import React, { Component } from 'react';
import authHelper from '../helpers/authHelper';

class Home extends Component {
    constructor(props) {
      super(props);
      this.handleAuthenticationSuccess = this.handleAuthenticationSuccess.bind(this);
      this.handleException = this.handleException.bind(this);
      this.state = {
        hasError: false
      };
    }

    componentDidMount() {
      if (authHelper.accessCodeExists()) {
        authHelper.login().then(
          this.handleAuthenticationSuccess,
          this.handleException
        );
      }
    }

    handleAuthenticationSuccess(isSuccessful) {
      //nothing to do
    }

    handleException(errorMessage) {
      this.setState({
        hasError: true,
        errorMessage: errorMessage});
    }

    render() {
      var renderBody;

      if (authHelper.isLoggedIn()) {
        renderBody = <div className="App">
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
      }
      else {
        if (this.state.hasError) {
          renderBody = <div className="App">
                <header className="App-header">
                  <p>
                    Problem Logging In { this.state.errorMessage }
                  </p>
                </header>
              </div>
        }
        else {
          renderBody = <div className="App">
              <header className="App-header">
                <p>
                  Welcome to Machine Learning @ Duke
                </p>
              </header>
            </div>
        }
      }
      return (
        renderBody
      )
    }
}

export default Home