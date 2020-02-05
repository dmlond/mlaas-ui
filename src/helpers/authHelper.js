const jwtStoreKey = "auth-token";

const authHelper = {
    isLoggedIn() {
        if(this.jwt()) {
            return true;
        }
        else {
            sessionStorage.clear();
            return false;
        }
    },

    jwt() {
        return sessionStorage.getItem(jwtStoreKey);
    },
};
export default authHelper;