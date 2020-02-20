jest.mock('axios');
jest.useFakeTimers();

import axios from 'axios';
import projectServiceClient from '../../helpers/projectServiceClient';
import authHelper from '../../helpers/authHelper';
import config from "../../config/authconfig.js";

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

    function spyProjectServiceClientSend() {
      beforeEach(() => {
        projectServiceClient.send = jest.fn();
        projectServiceClient.send.mockImplementation(origSend);
      });
      afterEach(() => {
        projectServiceClient.send = origSend;
      });
    }

    function testProjectServiceApi(expectedSendPath, expectedSendMethod, sendCall, extraPayload, ...sendArguments) {
      describe('expected Project Service API interaction', () => {
          let expectedApiSendUrl = `${process.env.REACT_APP_PROXY_URI}${expectedSendPath}`;

          spyProjectServiceClientSend();

          it('is expected to call the correct project-service api url', done => {
              let expectedSendPayload = {
                  url: expectedApiSendUrl,
                  method: expectedSendMethod,
                  headers: {
                    Accept: "application/json",
                    Authorization: fakeJwt
                  }
              };
              if (extraPayload != null) {
                  for (var attrname in extraPayload) {
                    expectedSendPayload[attrname] = extraPayload[attrname];
                  }
              }
              sendCall(...sendArguments, () => {}, () => {});

              setImmediate(() => {
                  expect(projectServiceClient.send).toBeCalledWith(
                    expectedSendPayload,
                    expect.anything(),
                    expect.anything()
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
      let expectedProjectServicePath = config['projects_endpoint'];
      let expectedProjectServiceSendMethod = 'get'

      function subject(s,f) {
          projectServiceClient.index(s,f);
      }

      testProjectServiceApi(expectedProjectServicePath, expectedProjectServiceSendMethod, subject);
    });

    describe('.create', () => {
        
    });

    describe('.show', () => {

    });

    describe('.update', () => {

    });
});