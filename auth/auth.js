(() => {
  const cfg = () => (window.BI_CONFIG && window.BI_CONFIG.AUTH) || {};
  const KEY_TOKEN = "betha_bi_user_token";
  const KEY_EXPIRES = "betha_bi_user_token_expires";
  const KEY_VERIFIER = "betha_bi_pkce_verifier";
  const KEY_STATE = "betha_bi_oauth_state";
  const KEY_RETURN = "betha_bi_return_url";

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

  function clear() {
    sessionStorage.removeItem(KEY_TOKEN);
    sessionStorage.removeItem(KEY_EXPIRES);
    sessionStorage.removeItem(KEY_VERIFIER);
    sessionStorage.removeItem(KEY_STATE);
  }

  async function login(returnUrl = location.href) {
    const auth = cfg();
    if (!auth.CLIENT_ID || !auth.REDIRECT_URI || !auth.AUTHORIZE_URL) {
      throw new Error("AUTH_CONFIG_INCOMPLETE");
    }

    const verifier = randomUrlSafe(48);
    const challenge = base64url(await sha256(verifier));
    const state = randomUrlSafe(24);

    sessionStorage.setItem(KEY_VERIFIER, verifier);
    sessionStorage.setItem(KEY_STATE, state);
    sessionStorage.setItem(KEY_RETURN, returnUrl);

    const url = new URL(auth.AUTHORIZE_URL);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", auth.CLIENT_ID);
    url.searchParams.set("redirect_uri", auth.REDIRECT_URI);
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set("code_challenge", challenge);
    url.searchParams.set("state", state);

    const scopes = Array.isArray(auth.SCOPES) ? auth.SCOPES.filter(Boolean) : [];
    if (scopes.length) url.searchParams.set("scope", scopes.join(","));
    if (auth.AUDIENCE) url.searchParams.set("audience", auth.AUDIENCE);

    // Aplicações Betha podem ser abertas dentro de um container/iframe.
    // O login da Betha deve assumir a janela principal para não ser bloqueado por frame.
    url.searchParams.set("bth_ignore_origin", "true");

    const target = url.toString();
    try {
      window.top.location.href = target;
    } catch {
      window.location.href = target;
    }
  }

  async function handleCallback() {
    const auth = cfg();
    const params = new URLSearchParams(location.search);
    const error = params.get("error");
    if (error) throw new Error(error + (params.get("error_description") ? ": " + params.get("error_description") : ""));

    const code = params.get("code");
    const state = params.get("state");
    const expectedState = sessionStorage.getItem(KEY_STATE);
    const verifier = sessionStorage.getItem(KEY_VERIFIER);

    if (!code) throw new Error("AUTHORIZATION_CODE_MISSING");
    if (!state || !expectedState || state !== expectedState) throw new Error("OAUTH_STATE_INVALID");
    if (!verifier) throw new Error("PKCE_VERIFIER_MISSING");

    const body = new URLSearchParams();
    body.set("grant_type", "authorization_code");
    body.set("client_id", auth.CLIENT_ID);
    body.set("code_verifier", verifier);
    body.set("code", code);
    body.set("redirect_uri", auth.REDIRECT_URI);

    const response = await fetch(auth.TOKEN_URL, {
      method: "POST",
      headers: {"Content-Type": "application/x-www-form-urlencoded"},
      body
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.access_token) {
      throw new Error(payload.error_description || payload.error || ("TOKEN_HTTP_" + response.status));
    }

    sessionStorage.setItem(KEY_TOKEN, payload.access_token);
    const seconds = Number(payload.expires_in || payload.expires || 0);
    if (seconds > 0) {
      sessionStorage.setItem(KEY_EXPIRES, String(Date.now() + Math.max(0, seconds - 30) * 1000));
    } else {
      sessionStorage.removeItem(KEY_EXPIRES);
    }

    sessionStorage.removeItem(KEY_VERIFIER);
    sessionStorage.removeItem(KEY_STATE);

    const returnUrl = sessionStorage.getItem(KEY_RETURN) || "../";
    sessionStorage.removeItem(KEY_RETURN);
    location.replace(returnUrl);
  }

  function logout() {
    clear();
    location.href = new URL("./", location.href).toString();
  }

  window.BIAuth = {
    getToken,
    isAuthenticated: () => Boolean(getToken()),
    login,
    logout,
    clear,
    handleCallback
  };
})();