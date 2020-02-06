import config from "../config/authconfig.js";
import authClient from './authClient'

const jwtStoreKey = "auth-token";
const jwtExpirationStoreKey = "auth-token-expiration"
const currentUserStoreKey = "current-user"

const authHelper = {
    isLoggedIn() {
        if(this.jwt() && this.jwtExpiration()) {
            if(parseInt(this.jwtExpiration()) >= Date.now()) {
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
        this.accessCode = this.getOauthCodeFromURI();
        return this.accessCode != null;
    },
    
    getOauthCodeFromURI() {
        if (window.location.href.indexOf("?code") > 0) {
            var urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('code');
        }
    },

    login() {
        return new Promise((resolve, reject) => {
            if (this.isLoggedIn()) {
                resolve(true);
            }
            else {
                if(this.accessCodeExists()) {
                    authClient.authenticate(
                        this.accessCode,
                        window.location.origin+'/login',
                        (jwtToken, username, expiration, timeToLive) => {
                            sessionStorage.setItem(jwtStoreKey, jwtToken);
                            sessionStorage.setItem(jwtExpirationStoreKey, Date.now() + timeToLive);
                            sessionStorage.setItem(currentUserStoreKey, username);
                            window.location.replace("?");
                            if (typeof window.history.replaceState == 'function') {
                                history.replaceState({}, '', window.location.href);
                            }
                            resolve(true);
                        },
                        (errorMessage) => {
                            reject("Could not get JwtToken: " + errorMessage);
                        }
                    );
                }
                else {
                    var dukeOauthUrl = `${config['oauth_base_uri']}/authorize?response_type=code&client_id=${config['oauth_client_id']}&state=login&redirect_uri=`+window.location.origin+'/login'
                    window.location.assign(dukeOauthUrl);
                    resolve(true);
                }
            }
        });
    }
};
export default authHelper;