jest.useFakeTimers();
import authHelper from '../../helpers/authHelper';
import authClient from '../../helpers/authClient';
import config from "../../config/authconfig.js";

describe('authHelper', () => {
  const expectedJwt = 'abc123xyz';
  const expectedCurrentUser = 'sheila';
  const expectedJwtStoreKey = "auth-token";
  const expectedJwtExpirationStoreKey = "auth-token-expiration";
  const expectedCurrentUserStoreKey = 'current-user';
  var expectedJwtExpiration;

  var handleSuccess = jest.fn();
  var handleFailure = jest.fn();

  beforeEach(() => {
    sessionStorage.clear();
    handleSuccess.mockClear();
    handleFailure.mockClear();
  });

  describe('.jwt', () => {
    describe('sessionStore does not contain auth-token', () => {
      it('should return null', () => {
        expect(sessionStorage.getItem(expectedJwtStoreKey)).toBeNull();
        expect(authHelper.jwt()).toBeNull();
      });
    });
    describe('sessionStore contains auth-token', () => {
      it('should return the value stored in the sessionStore', () => {
        sessionStorage.setItem(expectedJwtStoreKey, expectedJwt);
        expect(authHelper.jwt()).toEqual(expectedJwt);
      });
    });
  });

  describe('.jwtExpiration', () => {
    describe('sessionStore does not contain auth-token-expiration', () => {
      it('should return null', () => {
        expect(sessionStorage.getItem(expectedJwtExpirationStoreKey)).toBeNull();
        expect(authHelper.jwtExpiration()).toBeNull();
      });
    });
    describe('sessionStore contains auth-token-expiration', () => {
      it('should return the value stored in the sessionStore', () => {
        expectedJwtExpiration = Date.now() + 1000;
        sessionStorage.setItem(expectedJwtExpirationStoreKey, expectedJwtExpiration);
        expect(authHelper.jwtExpiration()).toEqual(expectedJwtExpiration.toString());
      });
    });
  });


  describe('.currentUser', () => {
    describe('sessionStore does not contain current-user', () => {
      it('should return null', () => {
        expect(sessionStorage.getItem(expectedCurrentUserStoreKey)).toBeNull();
        expect(authHelper.currentUser()).toBeNull();
      });
    });
    describe('sessionStore contains auth-token', () => {
      it('should return the value stored in the sessionStore', () => {
        sessionStorage.setItem(expectedCurrentUserStoreKey, expectedCurrentUser);
        expect(authHelper.currentUser()).toEqual(expectedCurrentUser);
      });
    });
  });

  describe('.isLoggedIn', () => {
    describe('sessionStore does not contain auth-token or auth-token-expiration', () => {
      it('should return false', () => {
        expect(sessionStorage.getItem(expectedJwtStoreKey)).toBeNull();
        expect(sessionStorage.getItem(expectedJwtExpirationStoreKey)).toBeNull();
        expect(authHelper.isLoggedIn()).toBeFalsy();
      });
    });

    describe('sessionStore contains auth-token and auth-token-expiration', () => {
      describe('token is expired', () => {
        it('should return false', () => {
          const now = new Date();
          const nowSeconds = Math.round(now.getTime() / 1000)
          expectedJwtExpiration = nowSeconds - 1000;
          sessionStorage.setItem(expectedJwtStoreKey, expectedJwt);
          sessionStorage.setItem(expectedJwtExpirationStoreKey, expectedJwtExpiration);
          let storedToken = sessionStorage.getItem(expectedJwtStoreKey);
          let storedTokenExpiration = parseInt(sessionStorage.getItem(expectedJwtExpirationStoreKey));
          expect(storedToken).toEqual(expectedJwt);
          expect(storedTokenExpiration).toEqual(expectedJwtExpiration);
          expect(storedTokenExpiration).toBeLessThan(nowSeconds);
          expect(authHelper.isLoggedIn()).toBeFalsy();
          expect(sessionStorage.getItem(expectedJwtStoreKey)).toBeNull();
          expect(sessionStorage.getItem(expectedJwtExpirationStoreKey)).toBeNull();
        });
      });

      describe('token is not expired', () => {
        it('should return true', () => {
          expectedJwtExpiration = Date.now() + 1000;
          sessionStorage.setItem(expectedJwtStoreKey, expectedJwt);
          sessionStorage.setItem(expectedJwtExpirationStoreKey, expectedJwtExpiration);
          let storedToken = sessionStorage.getItem(expectedJwtStoreKey);
          let storedTokenExpiration = parseInt(sessionStorage.getItem(expectedJwtExpirationStoreKey));
          expect(storedToken).toEqual(expectedJwt);
          expect(storedTokenExpiration).toEqual(expectedJwtExpiration);
          expect(storedTokenExpiration).not.toBeLessThan(Date.now());
          expect(authHelper.isLoggedIn()).toBeTruthy();
        });
      });
    });
  });

  describe('.accessCodeExists', () => {
    describe('getOauthCodeFromURI returns null', () => {
      it('should be false', () => {
        expect(authHelper.getOauthCodeFromURI()).toBeNull;
        expect(authHelper.accessCodeExists()).toBeFalsy;
      });
    });
    describe('getOauthCodeFromURI returns code', () => {
      it('should be true', () => {
        let originalFunction = authHelper.getOauthCodeFromURI;
        authHelper.getOauthCodeFromURI = jest.fn(() => { expectedJwt });
        expect(authHelper.getOauthCodeFromURI()).not.toBeNull;
        expect(authHelper.accessCodeExists()).toBeTruthy;
        authHelper.getOauthCodeFromURI = originalFunction;
      });
    });
  });

  describe('.getOauthCodeFromURI', () => {
    describe('url parameter code does not exist', () => {
      it('should be null', () => {
        expect(window.location.href.indexOf("?code")).not.toBeGreaterThan(0);
        expect(authHelper.getOauthCodeFromURI()).toBeNull;
      });
    });
    describe('url parameter code exists', () => {
      it('should return the token', () => {
        window.history.pushState({}, 'getOauthCodeFromURI success', `/test.html?code=${expectedJwt}`);
        expect(window.location.href.indexOf("?code")).toBeGreaterThan(0);
        let actualOauthCode = authHelper.getOauthCodeFromURI();
        expect(actualOauthCode).not.toBeNull;
        expect(actualOauthCode).toEqual(expectedJwt);
      });
    });
  });

  describe('.login', () => {
    const origIsLoggedInF = authHelper.isLoggedIn;
    var isLoggedIn = false;
    const { location } = window;
    const mockPath = location.pathname;
    const mockLocation = location.origin+location.pathname;
    const mockedOauthRedirectUrl = `${config.oauth_base_uri}/authorize?response_type=code&client_id=${config.oauth_client_id}&state=login&redirect_uri=`+mockLocation;
    const jwtToken = 'abc123xyz';
    const expiration = 'future';
    const username = 'sheila'
    const timeToLive = '1000';

    beforeEach(() => {
      authHelper.isLoggedIn = jest.fn();
      authHelper.isLoggedIn.mockImplementation(() => {
        return isLoggedIn;
      });
      delete window.location;
      //https://remarkablemark.org/blog/2018/11/17/mock-window-location/
      window.location = { 
        origin: mockLocation,
        pathname: mockPath,
        href: mockLocation,
        assign: jest.fn(),
        replace: jest.fn()
      };
    });
    afterEach(() => {
      authHelper.isLoggedIn = origIsLoggedInF;
      window.locaton = location;
    });

    describe('already logged in', () => {
      it('should call the success handler with true', done => {
        isLoggedIn = true;
        authHelper.login().then(
          handleSuccess,
          handleFailure
        );
        setImmediate(() => {
          expect(handleSuccess).toBeCalledWith(
            true
          );
          done();
        });
      });
    });

    describe('not already logged in', () => {
      const origCodeExistsF = authHelper.accessCodeExists;
      const origGetOauthCodeFromURIF = authHelper.getOauthCodeFromURI;
      const origAuthClientAuthenticateF = authClient.authenticate;
      var expectedCode;
      var codeExists;
      var jwtIsValid;
      const invalidTokenMessage = "token invalid";

      beforeEach(() => {
        isLoggedIn = false;
        authHelper.accessCodeExists = jest.fn();
        authHelper.accessCodeExists.mockImplementation(() => {
          return codeExists;
        });

        authHelper.getOauthCodeFromURI = jest.fn();
        authHelper.getOauthCodeFromURI.mockImplementation(() => {
          return expectedCode;
        });
        authClient.authenticate = jest.fn();
        authClient.authenticate.mockImplementation(
          (c,r,s,f) => {
            if(jwtIsValid) {
              s(jwtToken, username, expiration, timeToLive);
            }
            else {
              f(invalidTokenMessage);
            }
          });
      });
      afterEach(() => {
        authHelper.accessCodeExists = origCodeExistsF;
        authHelper.getOauthCodeFromURI = origGetOauthCodeFromURIF;
        authClient.authenticate = origAuthClientAuthenticateF;
      });
      describe('access code exists', () => {
        expectedCode = 'abc123xyz';
        beforeEach(() => {
          codeExists = true;
        });

        describe('and is a valid jwt', () => {
          it('should call the success handler with true', done => {
            jwtIsValid = true;
            var origJwt = authHelper.jwt;
            authHelper.jwt = jest.fn();
            authHelper.jwt.mockImplementation(() => {
              return jwtToken;
            });
            authHelper.login().then(
              handleSuccess,
              handleFailure
            );
            authHelper.jwt = origJwt;
            setImmediate(() => {
              expect(handleSuccess).toBeCalledWith(
                true
              );
              expect(authClient.authenticate).toBeCalledWith(
                expectedCode,
                window.location.origin+window.location.pathname,
                expect.anything(),
                expect.anything()
              )
              done();
            });
          });

          it('should store the jwtToken and expiration in the sessionStorage', done => {
            jwtIsValid = true;
            authHelper.login().then(
              handleSuccess,
              handleFailure
            );
            setImmediate(() => {
              expect(sessionStorage.setItem).toHaveBeenCalledWith(expectedJwtStoreKey, jwtToken);
              expect(sessionStorage.setItem).toHaveBeenCalledWith(expectedJwtExpirationStoreKey, expect.any(Number));
              done();
            });
          });
        });
        describe('and is not a valid jwt', () => {
          it('should call the failureHandler with the error message', done => {
            jwtIsValid = false;
            let expectedFailureMessage = `Could not get JwtToken: ${invalidTokenMessage}`;
            authHelper.login().then(
              handleSuccess,
              handleFailure
            );
            setImmediate(() => {
              expect(handleFailure).toBeCalledWith(
                expectedFailureMessage
              );
              done();
            });
          });
        });
      });
      describe('access code does not exist', () => {
        expectedCode = undefined;
        beforeEach(() => {
          codeExists = false;
        });

        it('should assign the window location to the oauth url', done => {
          authHelper.login().then(
            handleSuccess,
            handleFailure
          );
          setImmediate(() => {
            expect(window.location.assign).toBeCalledWith(mockedOauthRedirectUrl);
            expect(handleSuccess).toBeCalledWith(
              true
            );
            done();
          });
        });
      });
    });
  });
});
