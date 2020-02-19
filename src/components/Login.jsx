import React, { Component } from 'react';
import authHelper from '../helpers/authHelper';

class Login extends Component {
    constructor(props) {
      super(props);
      this.handleAuthenticationSuccess = this.handleAuthenticationSuccess.bind(this);
      this.handleException = this.handleException.bind(this);
      this.state = {
        hasError: false
      };
    }

    componentDidMount() {
        console.log("Login mounted!");
        if (authHelper.accessCodeExists()) {
          authHelper.login().then(
            this.handleAuthenticationSuccess,
            this.handleException
          );
        }
      }
  
      handleAuthenticationSuccess(isSuccessful) {
        console.log("authentication success!");
        window.location.assign(window.location.origin+authHelper.authReturnParams().get('state'));
      }
  
      handleException(errorMessage) {
        this.setState({
          hasError: true,
          errorMessage: errorMessage});
      }
  
      render() {
        var renderBody;
  
        if (this.state.hasError) {
            renderBody = <div>
                <p>
                    Problem Logging In { this.state.errorMessage }
                </p>
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
export default Login;