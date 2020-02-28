jest.mock('axios');
jest.useFakeTimers();

import axios from 'axios';
import projectServiceClient from '../../helpers/projectServiceClient';
import authHelper from '../../helpers/authHelper';

describe('projectServiceClient', () => {
    var shouldSucceed = true;
    var expectedError = {error: {message: 'Exception'}};
    var expectedFailureResponse = {
      response: {
        data: expectedError
      }
    };
    var expectedData = {name:"name",description:"description"};
    var expectedSuccessResponse = {
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
        data: expectedData
    };
    const fakeJwt = "abc.123.xyz";
    const origAuthHelperJwt = authHelper.jwt;

    function mocked_response() {
        return new Promise((resolve, reject) => {
          process.nextTick(function() {
            if (shouldSucceed) {
              resolve(expectedSuccessResponse);
            } else {
              reject(expectedFailureResponse);              
            }
          });
        });
    }
    axios.mockImplementation(mocked_response);

    const origSend = projectServiceClient.send;
    var handleSuccess = jest.fn();
    var handleFailure = jest.fn();
    beforeEach(() => {
      authHelper.jwt = jest.fn();      
      authHelper.jwt.mockImplementation(() => {
        return fakeJwt;
      });

      handleSuccess.mockClear();
      handleFailure.mockClear();
    });
    afterEach(() => {
      authHelper.jwt = origAuthHelperJwt;
    });

    function testProjectServiceApi(expectedSendPath, expectedSendMethod, testedMethod, extraPayload, ...sendArguments) {
      describe('expected Project Service API interaction', () => {
          beforeEach(() => {
            projectServiceClient.send = jest.fn();
          });
          afterEach(() => {
            projectServiceClient.send = origSend;
          });
  
          it('is expected to call the correct project-service api url', done => {
              let expectedApiSendUrl = `${process.env.REACT_APP_PROXY_URI}${expectedSendPath}`;
              let expectedSendPayload = {
                  url: expectedApiSendUrl,
                  method: expectedSendMethod
              };
              if (extraPayload != null) {
                  for (var attrname in extraPayload) {
                    expectedSendPayload[attrname] = extraPayload[attrname];
                  }
              }
              testedMethod(...sendArguments, handleSuccess, handleFailure);

              setImmediate(() => {
                  expect(projectServiceClient.send).toBeCalledWith(
                    expectedSendPayload,
                    handleSuccess,
                    handleFailure
                  );
                  done();
              });
          });
      });
    }
    
    describe('.send', () => {
        describe('with success', () => {
            let payload = {
              url: 'https://test.url',
              method: 'get'
            };
      
            it('is expected to take a payload and success function, add authentication header, make the request, and process the response with the success function', done => {
              shouldSucceed = true;
              projectServiceClient.send(payload, handleSuccess, handleFailure);
              setImmediate(() => {
                expect(handleSuccess).toBeCalledWith(
                  expectedData
                );
                expect(payload.headers.Authorization).toEqual(fakeJwt);
                done();
              });
            });
          });
      
          describe('with failure', () => {
            let payload = {
              url: 'https://test.url',
              method: 'put',
              data: {foo: "bar"}
            };
      
            it('is expected to take a payload and failure function, add authentication header, make the request, and process the error.data with the failure function', done => {
              shouldSucceed = false;
              projectServiceClient.send(payload, handleSuccess, handleFailure);
              setImmediate(() => {
                expect(handleFailure).toBeCalledWith(
                  expectedError
                );
                expect(authHelper.jwt).toBeCalled();
                expect(payload.headers.Authorization).toEqual(fakeJwt);
                done();
              });
            });
          });
    });

    describe('.projects', () => {
      let expectedProjectServicePath = '/api/v1/projects';
      let expectedProjectServiceSendMethod = 'get'

      function subject(s,f) {
          projectServiceClient.projects(s,f);
      }

      testProjectServiceApi(expectedProjectServicePath, expectedProjectServiceSendMethod, subject);
    });

    describe('.createProject', () => {
      let expectedProjectServicePath = '/api/v1/projects';
      let expectedProjectServiceSendMethod = 'post';
      let newProjectPayload = {
        name: "newProject",
        description: "Test Project Creation"
      };
      let expectedExtraPayload = {
        data: {
          project: newProjectPayload
        }
      };
      function subject(p, s,f) {
          projectServiceClient.createProject(p, s,f);
      }

      testProjectServiceApi(expectedProjectServicePath, expectedProjectServiceSendMethod, subject, expectedExtraPayload, newProjectPayload);        
    });

    describe('.project', () => {
      let expectedProjectId = "abc-123-xyz";
      let expectedProjectServicePath = '/api/v1/projects'+"/"+expectedProjectId;
      let expectedProjectServiceSendMethod = 'get'

      function subject(i, s,f) {
          projectServiceClient.project(i, s,f);
      }

      testProjectServiceApi(expectedProjectServicePath, expectedProjectServiceSendMethod, subject, {}, expectedProjectId);
    });

    describe('.updateProject', () => {
      let expectedProjectId = "abc-123-xyz";
      let expectedProjectServicePath = '/api/v1/projects'+"/"+expectedProjectId;
      let expectedProjectServiceSendMethod = 'put';
      let updateProjectPayload = {
        description: "Test Project Creation"
      };
      let expectedExtraPayload = {
        data: {
          project: updateProjectPayload
        }
      };

      function subject(i, p, s,f) {
          projectServiceClient.updateProject(i, p, s,f);
      }

      testProjectServiceApi(expectedProjectServicePath, expectedProjectServiceSendMethod, subject, expectedExtraPayload, expectedProjectId, updateProjectPayload);
    });

    describe('.models', () => {
      let expectedProjectServicePath = '/api/v1/ai_models';
      let expectedProjectServiceSendMethod = 'get'

      function subject(search,s,f) {
        projectServiceClient.models(search,s,f);
      }

      describe('without search.project_id', () => {
        let expectedSearch = null;
    
        testProjectServiceApi(expectedProjectServicePath, expectedProjectServiceSendMethod, subject, {}, expectedSearch); 
      });

      describe('with search.project_id', () => {
        let expectedProjectId = "abc-123-xyz";
        let expectedSearch = {
          project_id: expectedProjectId
        };
        let expectedExtraPayload = {
          params: expectedSearch
        };
    
        testProjectServiceApi(expectedProjectServicePath, expectedProjectServiceSendMethod, subject, expectedExtraPayload, expectedSearch);
      });
    });

    describe('.model', () => {
      let expectedModelId = "abc-123-xyz";
      let expectedProjectServicePath = '/api/v1/ai_models'+"/"+expectedModelId;
      let expectedProjectServiceSendMethod = 'get'

      function subject(i, s,f) {
          projectServiceClient.model(i, s,f);
      }

      testProjectServiceApi(expectedProjectServicePath, expectedProjectServiceSendMethod, subject, {}, expectedModelId);
    });

    describe('.updateModel', () => {
      let expectedModelId = "abc-123-xyz";
      let expectedProjectServicePath = '/api/v1/ai_models'+"/"+expectedModelId;
      let expectedProjectServiceSendMethod = 'put';
      let updateModelPayload = {
        description: "Test Model Creation"
      };
      let expectedExtraPayload = {
        data: {
          ai_model: updateModelPayload
        }
      };

      function subject(i, p, s,f) {
          projectServiceClient.updateModel(i, p, s,f);
      }

      testProjectServiceApi(expectedProjectServicePath, expectedProjectServiceSendMethod, subject, expectedExtraPayload, expectedModelId, updateModelPayload);
    });

    describe('.createModel', () => {
      let expectedProjectId = "abc-123-xyz";
      let expectedProjectServicePath = '/api/v1/projects/'+expectedProjectId+'/ai_models';
      let expectedProjectServiceSendMethod = 'post';
      let newModelPayload = {
        ai_model: {
          name: "newModel",
          description: "Test Model Creation"
        }
      };
      let expectedExtraPayload = {
        data: {
          ai_model: newModelPayload
        }
      };
      function subject(pid, p, s,f) {
          projectServiceClient.createModel(pid, p, s,f);
      }

      testProjectServiceApi(expectedProjectServicePath, expectedProjectServiceSendMethod, subject, expectedExtraPayload, expectedProjectId, newModelPayload);        
    });

    describe('.schedule', () => {
      let expectedModelId = "abc-123-xyz";
      let expectedProjectServicePath = '/api/v1/ai_models'+"/"+expectedModelId+'/schedule';
      let expectedProjectServiceSendMethod = 'get'

      function subject(mid,s,f) {
          projectServiceClient.schedule(mid,s,f);
      }

      testProjectServiceApi(expectedProjectServicePath, expectedProjectServiceSendMethod, subject, {}, expectedModelId);
    });

    describe('.applySchedule', () => {
      let expectedModelId = "abc-123-xyz";
      let expectedProjectServicePath = '/api/v1/ai_models'+"/"+expectedModelId+'/schedule';
      let expectedProjectServiceSendMethod = 'post';
      let scedulePayload = {
        schedule_interval: "0 1 * * *"
      };
      let expectedExtraPayload = {
        data: {
          schedule: scedulePayload
        }
      };
      function subject(mid, p, s,f) {
          projectServiceClient.applySchedule(mid, p, s,f);
      }

      testProjectServiceApi(expectedProjectServicePath, expectedProjectServiceSendMethod, subject, expectedExtraPayload, expectedModelId, scedulePayload);        
    });
});