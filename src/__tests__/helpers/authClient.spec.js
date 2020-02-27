jest.mock('axios');
jest.useFakeTimers();

import axios from 'axios';
import authClient from '../../helpers/authClient';

describe('authClient', () => {
    var shouldSucceed = true;
    var expectedError = {error: {message: 'Exception'}};
    var expectedFailureResponse = {
      response: {
        data: expectedError
      }
    };
  
    var expectedSuccessResponse = {
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    };
  
    function mocked_response() {
      return new Promise((resolve, reject) => {
        process.nextTick(function() {
          if (!shouldSucceed) {
            reject(expectedFailureResponse);
          } else {
            resolve(expectedSuccessResponse);
          }
        });
      });
    }
    axios.mockImplementation(mocked_response);

    const origSend = authClient.send;
    function spyAuthClientSend() {
      beforeEach(() => {
        authClient.send = jest.fn();
        authClient.send.mockImplementation(origSend);
      });
      afterEach(() => {
        authClient.send = origSend;
      });
    }

    function testAuthServiceApi(expectedSendPath, expectedSendMethod, sendCall, extraPayload, ...sendArguments) {
        describe('expected Auth Service API interaction', () => {
            let expectedApiSendUrl = `${process.env.REACT_APP_PROXY_URI}${expectedSendPath}`;

            spyAuthClientSend();

            it('is expected to call the correct auth-service api url', done => {
                let expectedSendPayload = {
                    url: expectedApiSendUrl,
                    method: expectedSendMethod
                };
                if (extraPayload != null) {
                    for (var attrname in extraPayload) {
                      expectedSendPayload[attrname] = extraPayload[attrname];
                    }
                }
                sendCall(...sendArguments, () => {}, () => {});

                setImmediate(() => {
                    expect(authClient.send).toBeCalledWith(
                      expectedSendPayload,
                      expect.anything(),
                      expect.anything()
                    );
                    done();
                });
            });
        });
    }
    
    var handleSuccess = jest.fn();
    var handleFailure = jest.fn();
    beforeEach(() => {
        handleSuccess.mockClear();
        handleFailure.mockClear();
    });

    describe('.send', () => {
        describe('with success', () => {
          let payload = {
            url: 'https://test.url',
            method: 'get'
          };
    
          it('is expected to take a payload and success function, make the request, and process the response with the success function', done => {
            expectedSuccessResponse['data'] = {name: 'Bob'};
            shouldSucceed = true;
            authClient.send(payload, handleSuccess, handleFailure);
            setImmediate(() => {
              expect(handleSuccess).toBeCalledWith(
                expectedSuccessResponse
              );
              done();
            });
          });
        });
    
        describe('with failure', () => {
          let payload = {
            url: 'https://test.url',
            method: 'put'
          };
    
          it('is expected to take a payload and failure function, make the request, and process the error.data with the failure function', done => {
            shouldSucceed = false;
            authClient.send(payload, handleSuccess, handleFailure);
            setImmediate(() => {
              expect(handleFailure).toBeCalledWith(
                expectedError
              );
              done();
            });
          });
        });
    });
      
    describe('.authenticate', () => {
        let oauthCode = 'abc123xyz';
        let expectedRedirect = window.location.href;
        let expectedAuthServicePath = '/api/v1/authentication';
        let expectedAuthServiceSendMethod = 'post'
        let authServicePayload = {
            data: {
                code: oauthCode,
                redirect_uri: expectedRedirect
            },
            headers: {
              Accept: "application/json"
            }
        };

        function subject(c,r,s,f) {
            authClient.authenticate(c,r,s,f);
        }

        testAuthServiceApi(expectedAuthServicePath, expectedAuthServiceSendMethod, subject, authServicePayload, oauthCode, expectedRedirect);

        describe('with success', () => {
            it('is expected to take the code, redirect, and success function, request the jwt token, and pass the token, username, time_to_live, and expiry to the success function', done => {
                let expectedToken = 'abcdefghij';
                let expectedExpiration = '12345';
                let expectedUser = 'sheila';
                let expectedTtl = '5000';
                expectedSuccessResponse['data'] = {
                    api_token: expectedToken,
                    username: expectedUser,
                    expires_on: expectedExpiration,
                    time_to_live: expectedTtl
                };
        
                shouldSucceed = true;
                authClient.authenticate(oauthCode, expectedRedirect, handleSuccess, handleFailure);
                setImmediate(() => {
                    expect(handleSuccess).toBeCalledWith(
                        expectedToken,
                        expectedUser,
                        expectedExpiration,
                        expectedTtl
                    );
                    done();
                });
            });
        });
    
        describe('with failure', () => {
            it('is expected to take the code, redirect, and failure function, request the jwt token, and process the error.data with the failure function', done => {
                shouldSucceed = false;
                authClient.authenticate(oauthCode, expectedRedirect, handleSuccess, handleFailure);
                setImmediate(() => {
                    expect(handleFailure).toBeCalledWith(
                        expectedError
                    );
                    done();
                });
            });
        });
    });
});