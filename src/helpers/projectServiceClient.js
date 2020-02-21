import axios from "axios";
import config from "../config/authconfig.js";
import authHelper from "./authHelper.js";

const projectServiceClient = {
    send(payload, processData, handleFailure) {
        payload.headers = {
            Accept: "application/json",
            Authorization: authHelper.jwt()
        };

        axios(payload)
          .then((response) => {
            processData(response.data)
          })
          .catch((error) => {
            handleFailure(error.response.data);
          });
    },

    index(successHandler, failureHandler) {
        var projectIndexUrl = `${config.proxy_uri}${config.projects_endpoint}`
        this.send(
            {
                url: projectIndexUrl,
                method: 'get'
            },
            successHandler,
            failureHandler
        )
    },

    create(newProjectPayload, successHandler, failureHandler) {
        var projectIndexUrl = `${config.proxy_uri}${config.projects_endpoint}`
        this.send(
            {
                url: projectIndexUrl,
                method: 'post',
                data: {
                    project: newProjectPayload
                }
            },
            successHandler,
            failureHandler
        ) 
    },

    show(projectId, successHandler, failureHandler) {
        var projectProfileUrl = `${config.proxy_uri}${config.projects_endpoint}/${projectId}`
        this.send(
            {
                url: projectProfileUrl,
                method: 'get'
            },
            successHandler,
            failureHandler
        )

    },

    update(projectId, projectUpdatePayload, successHandler, failureHandler) {
        var projectProfileUrl = `${config.proxy_uri}${config.projects_endpoint}/${projectId}`
        this.send(
            {
                url: projectProfileUrl,
                method: 'put',
                data: {
                    project: projectUpdatePayload
                }
            },
            successHandler,
            failureHandler
        )
    }
};
export default projectServiceClient;