(() => {
  const cfg = () => (window.BI_CONFIG && window.BI_CONFIG.AUTH) || {};
  const KEY_TOKEN = "betha_bi_user_token";
  const KEY_EXPIRES = "betha_bi_user_token_expires";
  const KEY_STATE = "betha_bi_oauth_state";
  const KEY_RETURN = "betha_bi_return_url";

  function randomState(size = 24) {
    const bytes = new Uint8Array(size);
    crypto.getRandomValues(bytes);
    let binary = "";
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
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
    sessionStorage.removeItem(KEY_STATE);
    sessionStorage.removeItem(KEY_RETURN);
  }

  function login(returnUrl = location.href) {
    const auth = cfg();
    if (!auth.CLIENT_ID || !auth.REDIRECT_URI || !auth.AUTHORIZE_URL) {
      throw new Error("AUTH_CONFIG_INCOMPLETE");
    }

    const state = randomState();
    sessionStorage.setItem(KEY_STATE, state);
    sessionStorage.setItem(KEY_RETURN, returnUrl);

    const url = new URL(auth.AUTHORIZE_URL);
    url.searchParams.set("client_id", auth.CLIENT_ID);
    url.searchParams.set("response_type", "token");
    url.searchParams.set("redirect_uri", auth.REDIRECT_URI);
    url.searchParams.set("state", state);
    url.searchParams.set("bth_ignore_origin", "true");

    const scopes = Array.isArray(auth.SCOPES) ? auth.SCOPES.filter(Boolean) : [];
    if (scopes.length) url.searchParams.set("scopes", scopes.join(","));

    // Redirecionamento integral. Se o usuário já possuir sessão Betha,
    // a autenticação pode ser concluída sem exibir novamente o formulário.
    try {
      window.top.location.href = url.toString();
    } catch {
      window.location.href = url.toString();
    }
  }

  function handleCallback() {
    const query = new URLSearchParams(location.search);
    const fragment = new URLSearchParams(String(location.hash || "").replace(/^#/,""));

    const error = query.get("error") || fragment.get("error");
    if (error) {
      const description = query.get("error_description") || fragment.get("error_description") || "";
      throw new Error(error + (description ? ": " + description : ""));
    }

    const accessToken = fragment.get("access_token");
    if (!accessToken) {
      throw new Error("ACCESS_TOKEN_MISSING");
    }

    const returnedState = fragment.get("state") || query.get("state");
    const expectedState = sessionStorage.getItem(KEY_STATE);
    if (expectedState && returnedState && returnedState !== expectedState) {
      throw new Error("OAUTH_STATE_INVALID");
    }

    sessionStorage.setItem(KEY_TOKEN, accessToken);

    const seconds = Number(fragment.get("expires_in") || fragment.get("expires") || 0);
    if (seconds > 0) {
      sessionStorage.setItem(KEY_EXPIRES, String(Date.now() + Math.max(0, seconds - 30) * 1000));
    } else {
      sessionStorage.removeItem(KEY_EXPIRES);
    }

    sessionStorage.removeItem(KEY_STATE);

    let returnUrl = sessionStorage.getItem(KEY_RETURN) || "../";
    sessionStorage.removeItem(KEY_RETURN);

    // Nunca reaproveitar uma URL externa como destino.
    try {
      const destination = new URL(returnUrl, location.origin);
      if (destination.origin !== location.origin) returnUrl = "../";
    } catch {
      returnUrl = "../";
    }

    location.replace(returnUrl);
  }

  function logout() {
    clear();
    location.reload();
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