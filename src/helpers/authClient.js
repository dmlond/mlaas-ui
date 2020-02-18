import axios from "axios";
import config from "../config/authconfig.js";

const authClient = {
    send(payload, processData, handleFailure) {
        axios(payload)
          .then(processData)
          .catch((error) => {
            handleFailure(error.response.data);
          })
    },

    authenticate(code, redirect_uri, handleAuthentication, handleAuthenticationFailure) {
        var authUrl = `${config.proxy_uri}${config.auth_service_endpoint}`
        this.send(
            {
                url: authUrl,
                method: 'post',
                headers: {Accept: "application/json"},
                data: {
                    code: code,
                    redirect_uri: redirect_uri
                }
            },
            (response) => {
                var thisData = response.data;
                handleAuthentication(thisData.api_token, thisData.username, thisData.expires_on, thisData.time_to_live);
            },
            handleAuthenticationFailure
        )

    } 
};
export default authClient;