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

    describe('.index', () => {
      let expectedProjectServicePath = '/api/v1/projects';
      let expectedProjectServiceSendMethod = 'get'

      function subject(s,f) {
          projectServiceClient.index(s,f);
      }

      testProjectServiceApi(expectedProjectServicePath, expectedProjectServiceSendMethod, subject);
    });

    describe('.create', () => {
      let expectedProjectServicePath = '/api/v1/projects';
      let expectedProjectServiceSendMethod = 'post';
      let newProjectPayload = {
        project: {
        name: "newProject",
          description: "Test Project Creation"
        }
      };
      let expectedExtraPayload = {
        data: {
          project: newProjectPayload
        }
      };
      function subject(p, s,f) {
          projectServiceClient.create(p, s,f);
      }

      testProjectServiceApi(expectedProjectServicePath, expectedProjectServiceSendMethod, subject, expectedExtraPayload, newProjectPayload);        
    });

    describe('.show', () => {
      let expectedProjectId = "abc-123-xyz";
      let expectedProjectServicePath = '/api/v1/projects'+"/"+expectedProjectId;
      let expectedProjectServiceSendMethod = 'get'

      function subject(i, s,f) {
          projectServiceClient.show(i, s,f);
      }

      testProjectServiceApi(expectedProjectServicePath, expectedProjectServiceSendMethod, subject, {}, expectedProjectId);
    });

    describe('.update', () => {
      let expectedProjectId = "abc-123-xyz";
      let expectedProjectServicePath = '/api/v1/projects'+"/"+expectedProjectId;
      let expectedProjectServiceSendMethod = 'put';
      let updateProjectPayload = {
        project: {
          description: "Test Project Creation"
        }
      };
      let expectedExtraPayload = {
        data: {
          project: updateProjectPayload
        }
      };

      function subject(i, p, s,f) {
          projectServiceClient.update(i, p, s,f);
      }

      testProjectServiceApi(expectedProjectServicePath, expectedProjectServiceSendMethod, subject, expectedExtraPayload, expectedProjectId, updateProjectPayload);
    });
});