jest.useFakeTimers();
import authHelper from '../../helpers/authHelper';
import authClient from '../../helpers/authClient';

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
        expect(sessionStorage.clear).toHaveBeenCalled();
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
        let originalFunction = authHelper.getOauthCodeFromURI;
        authHelper.getOauthCodeFromURI = jest.fn();
        expect(authHelper.getOauthCodeFromURI()).toBeNull;
        expect(authHelper.accessCodeExists()).toBeFalsy;
        authHelper.getOauthCodeFromURI = originalFunction;
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
        let fakeAuthParams = {};
        fakeAuthParams.get = jest.fn((key) => { return null; });
        let origAuthReturnParams = authHelper.authReturnParams;
        authHelper.authReturnParams = jest.fn(() => { return fakeAuthParams; });
        expect(authHelper.getOauthCodeFromURI()).toBeNull;
        expect(fakeAuthParams.get).toHaveBeenCalledWith('code');
        authHelper.authReturnParams = origAuthReturnParams;
      });
    });
    describe('url parameter code exists', () => {
      it('should return the token', () => {
        let fakeAuthParams = {};
        fakeAuthParams.get = jest.fn((key) => { return expectedJwt; });
        let origAuthReturnParams = authHelper.authReturnParams;
        authHelper.authReturnParams = jest.fn(() => { return fakeAuthParams });
        expect(authHelper.authReturnParams()).toEqual(fakeAuthParams);

        let actualOauthCode = authHelper.getOauthCodeFromURI();
        expect(actualOauthCode).not.toBeNull;
        expect(actualOauthCode).toEqual(expectedJwt);
        expect(fakeAuthParams.get).toHaveBeenCalledWith('code');
        authHelper.authReturnParams = origAuthReturnParams;
      });
    });
  });

  describe('.login', () => {
    const origGetOauthCodeFromURIF = authHelper.getOauthCodeFromURI;
    const origAuthClientAuthenticateF = authHelper.authenticate;
    const jwtToken = 'abc123xyz';
    const expiration = 'future';
    const username = 'sheila'
    const timeToLive = '1000';
    var expectedCode;
    var jwtIsValid;
    const invalidTokenMessage = "token invalid";
    beforeEach(() => {
      authHelper.getOauthCodeFromURI = jest.fn(() => { return expectedCode; });
      authClient.authenticate = jest.fn((c,r,s,f) => {
        if(jwtIsValid) {
          s(jwtToken, username, expiration, timeToLive);
        }
        else {
          f(invalidTokenMessage);
        }
      });
    });
    afterEach(() => {
      authHelper.getOauthCodeFromURI = origGetOauthCodeFromURIF;
      authClient.authenticate = origAuthClientAuthenticateF;
    });

    describe('with a valid code', () => {
      it('should call the success handler with true', done => {
        jwtIsValid = true;
        var origJwt = authHelper.jwt;
        authHelper.jwt = jest.fn(() => {
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
            window.location.origin+'/login',
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
    describe('called with an invalid code', () => {
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

  describe('.logout', () => {
    const { location } = window;
    beforeEach(() => {
      //https://remarkablemark.org/blog/2018/11/17/mock-window-location/
      delete window.location;
      window.location = { 
        assign: jest.fn()
      };
    });
    afterEach(() => {
      window.locaton = location;
    });
    it('should clear the session and redirect to /', () => {
      authHelper.logout();
      expect(sessionStorage.clear).toHaveBeenCalled();
      expect(window.location.assign).toHaveBeenCalledWith('/');
    });
  });
});
