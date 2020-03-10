import React, { Component } from 'react';
import authHelper from '../helpers/authHelper';
import Models from './Models'

class Home extends Component {
    constructor(props) {
      super(props);
      this.handleAuthenticationSuccess = this.handleAuthenticationSuccess.bind(this);
      this.handleException = this.handleException.bind(this);
      this.state = {
        hasAuthError: false
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
        hasAuthError: true,
        errorMessage: errorMessage});
    }

    render() {
      var renderBody;

      let authErrorMessage = this.state.hasAuthError ? <div>
      <p>Error: {this.state.error}</p>
      <p>Reason: {this.state.errorReason}</p>
      <p>Suggestion: {this.state.errorSuggestion}</p>
      </div> : <div></div>;

      if (authHelper.isLoggedIn()) {
        renderBody = <Models />
      }
      else {
        renderBody = <p>
            This is the Machine Learning @ Duke System. Please login to continue.
          </p>
      }
      return (
        <div>
          {renderBody}
          {authErrorMessage}
        </div>
      )
    }
}

export default Home