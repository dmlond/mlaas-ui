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
          .then(processData)
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
            (response) => {
                successHandler(response.data);
            },
            failureHandler
        )
    },

    create(newProjectPayload, successHandler, failureHandler) {
        var projectIndexUrl = `${config.proxy_uri}${config.projects_endpoint}`
        this.send(
            {
                url: projectIndexUrl,
                method: 'post',
                data: newProjectPayload
            },
            (response) => {
                successHandler(response.data);
            },
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
            (response) => {
                successHandler(response.data);
            },
            failureHandler
        )

    },

    update(projectUpdatePayload, successHandler, failureHandler) {
        var projectProfileUrl = `${config.proxy_uri}${config.projects_endpoint}/${projectId}`
        this.send(
            {
                url: projectProfileUrl,
                method: 'put',
                data: projectUpdatePayload
            },
            (response) => {
                successHandler(response.data);
            },
            failureHandler
        )
    }
};
export default projectServiceClient;