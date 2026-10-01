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

  function consumeTokenFromLocation() {
    const query = new URLSearchParams(location.search);
    const fragment = new URLSearchParams(String(location.hash || "").replace(/^#/, ""));

    const accessToken = fragment.get("access_token") || query.get("access_token");
    const error = fragment.get("error") || query.get("error");

    if (error) {
      const description = fragment.get("error_description") || query.get("error_description") || "";
      sessionStorage.setItem("betha_bi_auth_error", error + (description ? ": " + description : ""));
    }

    if (!accessToken) return false;

    const returnedState = fragment.get("state") || query.get("state");
    const expectedState = sessionStorage.getItem(KEY_STATE);

    // Valida state quando o contexto original ainda está disponível.
    if (expectedState && returnedState && returnedState !== expectedState) {
      sessionStorage.setItem("betha_bi_auth_error", "OAUTH_STATE_INVALID");
      return false;
    }

    sessionStorage.setItem(KEY_TOKEN, accessToken);

    const seconds = Number(
      fragment.get("expires_in") || query.get("expires_in") ||
      fragment.get("expires") || query.get("expires") || 0
    );
    if (seconds > 0) {
      sessionStorage.setItem(KEY_EXPIRES, String(Date.now() + Math.max(0, seconds - 30) * 1000));
    } else {
      sessionStorage.removeItem(KEY_EXPIRES);
    }

    sessionStorage.removeItem(KEY_STATE);
    sessionStorage.removeItem(KEY_RETURN);
    sessionStorage.removeItem("betha_bi_auth_error");

    // Remove token da barra de endereços sem recarregar.
    const clean = location.pathname + location.search.replace(/([?&])(access_token|token_type|expires_in|expires|state)=[^&]*/g, "$1").replace(/[?&]$/,"");
    history.replaceState({}, document.title, clean || location.pathname);
    return true;
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
    const fragment = new URLSearchParams(String(location.hash || "").replace(/^#/, ""));

    const error = query.get("error") || fragment.get("error");
    const accessToken = fragment.get("access_token") || query.get("access_token");

    if (!accessToken && !error) {
      throw new Error("ACCESS_TOKEN_MISSING");
    }

    // A página principal recebe o retorno OAuth diretamente no fragmento.
    // Isso evita depender do storage da página callback.
    const out = new URLSearchParams();

    if (accessToken) {
      out.set("access_token", accessToken);
      const tokenType = fragment.get("token_type") || query.get("token_type");
      const expiresIn = fragment.get("expires_in") || query.get("expires_in") || fragment.get("expires") || query.get("expires");
      const state = fragment.get("state") || query.get("state");
      if (tokenType) out.set("token_type", tokenType);
      if (expiresIn) out.set("expires_in", expiresIn);
      if (state) out.set("state", state);
    } else {
      out.set("error", error);
      const description = query.get("error_description") || fragment.get("error_description");
      if (description) out.set("error_description", description);
    }

    location.replace("../#" + out.toString());
  }

  function logout() {
    clear();
    location.reload();
  }

  // Se o OAuth retornou para a página principal, consome o token antes
  // de qualquer decisão de interface.
  consumeTokenFromLocation();

  window.BIAuth = {
    getToken,
    isAuthenticated: () => Boolean(getToken()),
    login,
    logout,
    clear,
    consumeTokenFromLocation,
    handleCallback
  };
})();