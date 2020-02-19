import authClient from './authClient'

const jwtStoreKey = "auth-token";
const jwtExpirationStoreKey = "auth-token-expiration"
const currentUserStoreKey = "current-user"

const authHelper = {
    isLoggedIn() {
        if(this.jwt() && this.jwtExpiration()) {
            const now = new Date();
            if(parseInt(this.jwtExpiration()) >= Math.round(now.getTime() / 1000)) {
                return true;
            }
            else {
                sessionStorage.clear();
                return false;
            }
        }
        else {
            sessionStorage.clear();
            return false;
        }
    },

    jwt() {
        return sessionStorage.getItem(jwtStoreKey);
    },

    jwtExpiration() {
        return sessionStorage.getItem(jwtExpirationStoreKey);
    },

    currentUser() {
        return sessionStorage.getItem(currentUserStoreKey);
    },

    accessCodeExists() {
        return window.location.href.indexOf("?code") > 0;
    },
    
    authReturnParams() {
        if (window.location.href.indexOf("?code") > 0) {
            var urlParams = new URLSearchParams(window.location.search);
            return urlParams;
        }
    },

    getOauthCodeFromURI() {
        return this.authReturnParams().get('code');
    },

    login() {
        return new Promise((resolve, reject) => {
            authClient.authenticate(
                this.getOauthCodeFromURI(),
                window.location.origin+'/login',
                (jwtToken, username, expiration, timeToLive) => {
                    sessionStorage.setItem(jwtStoreKey, jwtToken);
                    const now = new Date();
                    sessionStorage.setItem(jwtExpirationStoreKey, Math.round(now.getTime() / 1000) + parseInt(timeToLive));
                    sessionStorage.setItem(currentUserStoreKey, username);
                    resolve(true);
                },
                (errorMessage) => {
                    reject("Could not get JwtToken: " + errorMessage);
                }
            );
        });
    },
    logout() {
        sessionStorage.clear();
        window.location.assign("/");
    }
};
export default authHelper;