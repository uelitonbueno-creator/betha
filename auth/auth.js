(() => {
  const cfg = () => (window.BI_CONFIG && window.BI_CONFIG.AUTH) || {};
  const KEY_TOKEN = "betha_bi_user_token";
  const KEY_EXPIRES = "betha_bi_user_token_expires";
  const AUTH_ERROR = "betha_bi_auth_error";

  function randomState(size = 24) {
    const bytes = new Uint8Array(size);
    crypto.getRandomValues(bytes);
    let binary = "";
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
  }

  function getToken() {
    const token = sessionStorage.getItem(KEY_TOKEN) || "";
    const expires = Number(sessionStorage.getItem(KEY_EXPIRES) || 0);

    if (!token) return "";

    if (expires && Date.now() >= expires) {
      clear();
      return "";
    }

    return token;
  }

  function getError() {
    return sessionStorage.getItem(AUTH_ERROR) || "";
  }

  function clearError() {
    sessionStorage.removeItem(AUTH_ERROR);
  }

  function clear() {
    sessionStorage.removeItem(KEY_TOKEN);
    sessionStorage.removeItem(KEY_EXPIRES);
    sessionStorage.removeItem(AUTH_ERROR);
    sessionStorage.removeItem("betha_bi_oauth_state");
  }

  function consumeReturn() {
    const query = new URLSearchParams(location.search);
    const hash = new URLSearchParams(String(location.hash || "").replace(/^#/,""));

    const accessToken = hash.get("access_token");
    const error = hash.get("error") || query.get("error");

    if (error) {
      const description = hash.get("error_description") || query.get("error_description") || "";
      sessionStorage.setItem(AUTH_ERROR, error + (description ? ": " + description : ""));
      cleanUrl();
      return false;
    }

    if (accessToken) {
      const expectedState = sessionStorage.getItem("betha_bi_oauth_state") || "";
      const returnedState = hash.get("state") || query.get("state") || "";

      if (expectedState && returnedState && expectedState !== returnedState) {
        sessionStorage.setItem(AUTH_ERROR, "OAUTH_STATE_INVALID");
        cleanUrl();
        return false;
      }

      sessionStorage.setItem(KEY_TOKEN, accessToken);

      const expires = Number(hash.get("expires_in") || hash.get("expires") || 0);
      if (expires > 0) {
        sessionStorage.setItem(KEY_EXPIRES, String(Date.now() + Math.max(0, expires - 30) * 1000));
      } else {
        sessionStorage.removeItem(KEY_EXPIRES);
      }

      sessionStorage.removeItem("betha_bi_oauth_state");
      clearError();
      cleanUrl();
      return true;
    }

    if (query.has("session_state")) {
      sessionStorage.setItem(
        AUTH_ERROR,
        "A Betha concluiu o login, mas não retornou access_token no fragmento."
      );
    }

    return false;
  }

  function cleanUrl() {
    const url = new URL(location.href);
    url.hash = "";
    ["session_state","state","error","error_description"].forEach(k => url.searchParams.delete(k));
    history.replaceState({}, document.title, url.pathname + (url.search ? url.search : ""));
  }

  function login() {
    const auth = cfg();

    if (!auth.CLIENT_ID || !auth.REDIRECT_URI || !auth.AUTHORIZE_URL) {
      throw new Error("AUTH_CONFIG_INCOMPLETE");
    }

    clearError();

    const state = randomState();
    sessionStorage.setItem("betha_bi_oauth_state", state);

    const url = new URL(auth.AUTHORIZE_URL);
    url.searchParams.set("client_id", auth.CLIENT_ID);
    url.searchParams.set("response_type", "token");
    url.searchParams.set("redirect_uri", auth.REDIRECT_URI);
    url.searchParams.set("scopes", (auth.SCOPES || []).join(","));
    url.searchParams.set("state", state);

    location.assign(url.toString());
  }

  function logout() {
    clear();
    location.href = new URL("./", location.href).toString();
  }

  consumeReturn();

  window.BIAuth = {
    getToken,
    getError,
    isAuthenticated: () => Boolean(getToken()),
    login,
    logout,
    clear
  };
})();