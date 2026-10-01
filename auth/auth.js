(() => {
  const cfg = () => (window.BI_CONFIG && window.BI_CONFIG.AUTH) || {};
  const KEY_TOKEN = "betha_bi_user_token";
  const KEY_EXPIRES = "betha_bi_user_token_expires";
  const COOKIE_STATE = "betha_bi_oauth_state";
  const COOKIE_VERIFIER = "betha_bi_pkce_verifier";
  const AUTH_ERROR = "betha_bi_auth_error";

  function base64url(bytes) {
    let binary = "";
    const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    for (const b of arr) binary += String.fromCharCode(b);
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function randomUrlSafe(size = 32) {
    const bytes = new Uint8Array(size);
    crypto.getRandomValues(bytes);
    return base64url(bytes);
  }

  async function sha256(text) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  }

  function setCookie(name, value, maxAge = 600) {
    document.cookie =
      encodeURIComponent(name) + "=" + encodeURIComponent(value) +
      "; Max-Age=" + maxAge +
      "; Path=/betha/" +
      "; SameSite=Lax; Secure";
  }

  function getCookie(name) {
    const prefix = encodeURIComponent(name) + "=";
    for (const part of document.cookie.split(";")) {
      const item = part.trim();
      if (item.startsWith(prefix)) return decodeURIComponent(item.slice(prefix.length));
    }
    return "";
  }

  function deleteCookie(name) {
    document.cookie =
      encodeURIComponent(name) + "=; Max-Age=0; Path=/betha/; SameSite=Lax; Secure";
  }

  function getToken() {
    const token = sessionStorage.getItem(KEY_TOKEN);
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

  function setError(message) {
    sessionStorage.setItem(AUTH_ERROR, String(message || "AUTH_ERROR"));
  }

  function clearError() {
    sessionStorage.removeItem(AUTH_ERROR);
  }

  function clear() {
    sessionStorage.removeItem(KEY_TOKEN);
    sessionStorage.removeItem(KEY_EXPIRES);
    clearError();
    deleteCookie(COOKIE_STATE);
    deleteCookie(COOKIE_VERIFIER);
  }

  async function login() {
    const auth = cfg();
    if (!auth.CLIENT_ID || !auth.REDIRECT_URI || !auth.AUTHORIZE_URL) {
      throw new Error("AUTH_CONFIG_INCOMPLETE");
    }

    clearError();

    const verifier = randomUrlSafe(48);
    const state = randomUrlSafe(24);
    const challenge = base64url(await sha256(verifier));

    setCookie(COOKIE_VERIFIER, verifier, 600);
    setCookie(COOKIE_STATE, state, 600);

    const url = new URL(auth.AUTHORIZE_URL);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", auth.CLIENT_ID);
    url.searchParams.set("redirect_uri", auth.REDIRECT_URI);
    url.searchParams.set("scope", (auth.SCOPES || []).join(","));
    url.searchParams.set("code_challenge", challenge);
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set("state", state);
    url.searchParams.set("bth_ignore_origin", "true");

    try {
      window.top.location.href = url.toString();
    } catch {
      window.location.href = url.toString();
    }
  }

  async function exchangeCallbackIfPresent() {
    const params = new URLSearchParams(location.search);
    const oauthError = params.get("error");
    const code = params.get("code");

    if (oauthError) {
      const description = params.get("error_description") || "";
      setError(oauthError + (description ? ": " + description : ""));
      cleanCallbackUrl();
      return false;
    }

    if (!code) return false;

    const returnedState = params.get("state") || "";
    const expectedState = getCookie(COOKIE_STATE);
    const verifier = getCookie(COOKIE_VERIFIER);

    if (!expectedState || !returnedState || expectedState !== returnedState) {
      setError("OAUTH_STATE_INVALID");
      cleanCallbackUrl();
      return false;
    }

    if (!verifier) {
      setError("PKCE_VERIFIER_MISSING");
      cleanCallbackUrl();
      return false;
    }

    const backend = String((window.BI_CONFIG && window.BI_CONFIG.BACKEND_URL) || "").replace(/\/$/, "");
    if (!backend) {
      setError("BACKEND_NOT_CONFIGURED");
      cleanCallbackUrl();
      return false;
    }

    try {
      const response = await fetch(backend + "/api/auth/exchange", {
        method: "POST",
        headers: {"Content-Type":"application/json","Accept":"application/json"},
        body: JSON.stringify({
          code,
          codeVerifier: verifier,
          state: returnedState
        })
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.access_token) {
        throw new Error(
          (payload.error || ("TOKEN_HTTP_" + response.status)) +
          (payload.detail ? " | " + payload.detail : "")
        );
      }

      sessionStorage.setItem(KEY_TOKEN, payload.access_token);

      const seconds = Number(payload.expires_in || 0);
      if (seconds > 0) {
        sessionStorage.setItem(KEY_EXPIRES, String(Date.now() + Math.max(0, seconds - 30) * 1000));
      } else {
        sessionStorage.removeItem(KEY_EXPIRES);
      }

      clearError();
      deleteCookie(COOKIE_STATE);
      deleteCookie(COOKIE_VERIFIER);
      cleanCallbackUrl();
      return true;
    } catch (error) {
      setError(error.message || String(error));
      cleanCallbackUrl();
      return false;
    }
  }

  function cleanCallbackUrl() {
    const clean = new URL(location.href);
    ["code","state","error","error_description"].forEach(k => clean.searchParams.delete(k));
    clean.hash = "";
    history.replaceState({}, document.title, clean.pathname + (clean.search ? clean.search : ""));
  }

  function logout() {
    clear();
    location.href = new URL("./", location.href).toString();
  }

  const ready = exchangeCallbackIfPresent();

  window.BIAuth = {
    ready,
    getToken,
    getError,
    isAuthenticated: () => Boolean(getToken()),
    login,
    logout,
    clear
  };
})();