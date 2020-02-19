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
      window.location.assign(window.location.origin+authHelper.authReturnParams().get('state'));
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
            <p>
              Welcome to ML@Duke!
            </p>
        </div>
      }
      else {
        if (this.state.hasError) {
          renderBody = <div className="App">
                  <p>
                    Problem Logging In { this.state.errorMessage }
                  </p>
              </div>
        }
        else {
          renderBody = <div className="App">
                <p>
                  This is the Machine Learning @ Duke System. Please login to continue.
                </p>
            </div>
        }
      }
      return (
        renderBody
      )
    }
}

export default Home