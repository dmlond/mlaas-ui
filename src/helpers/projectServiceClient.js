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

    projects(successHandler, failureHandler) {
        var projectIndexUrl = `${config.proxy_uri}/api/v1/projects`
        this.send(
            {
                url: projectIndexUrl,
                method: 'get'
            },
            successHandler,
            failureHandler
        )
    },

    createProject(newProjectPayload, successHandler, failureHandler) {
        var projectIndexUrl = `${config.proxy_uri}/api/v1/projects`
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

    project(projectId, successHandler, failureHandler) {
        var projectProfileUrl = `${config.proxy_uri}/api/v1/projects/${projectId}`
        this.send(
            {
                url: projectProfileUrl,
                method: 'get'
            },
            successHandler,
            failureHandler
        )

    },

    updateProject(projectId, projectUpdatePayload, successHandler, failureHandler) {
        var projectProfileUrl = `${config.proxy_uri}/api/v1/projects/${projectId}`
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