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
    },

    models(search, successHandler, failureHandler) {
        var modelIndexUrl = `${config.proxy_uri}/api/v1/ai_models`
        if (search) {
            this.send(
                {
                    url: modelIndexUrl,
                    method: 'get',
                    params: search
                },
                successHandler,
                failureHandler
            )
        }
        else {
            this.send(
                {
                    url: modelIndexUrl,
                    method: 'get'
                },
                successHandler,
                failureHandler
            )            
        }
    },

    model(modelId, successHandler, failureHandler) {
        var modelProfileUrl = `${config.proxy_uri}/api/v1/ai_models/${modelId}`
        this.send(
            {
                url: modelProfileUrl,
                method: 'get'
            },
            successHandler,
            failureHandler
        )

    },

    createModel(projectId, newModelPayload, successHandler, failureHandler) {
        var projectIndexUrl = `${config.proxy_uri}/api/v1/projects/${projectId}/ai_models`
        this.send(
            {
                url: projectIndexUrl,
                method: 'post',
                data: {
                    ai_model: newModelPayload
                }
            },
            successHandler,
            failureHandler
        ) 
    },

    updateModel( modelId, modelUpdatePayload, successHandler, failureHandler) {
        var modelProfileUrl = `${config.proxy_uri}/api/v1/ai_models/${modelId}`
        this.send(
            {
                url: modelProfileUrl,
                method: 'put',
                data: {
                    ai_model: modelUpdatePayload
                }
            },
            successHandler,
            failureHandler
        )
    },
};
export default projectServiceClient;