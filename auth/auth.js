(() => {
  const cfg = () => (window.BI_CONFIG && window.BI_CONFIG.AUTH) || {};
  const KEY_TOKEN = "betha_bi_user_token";
  const KEY_EXPIRES = "betha_bi_user_token_expires";
  const KEY_VERIFIER = "betha_bi_pkce_verifier";
  const KEY_STATE = "betha_bi_oauth_state";

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

  function buildAuthorizeUrl(verifier, state) {
    const auth = cfg();
    const url = new URL(auth.AUTHORIZE_URL);
    return sha256(verifier).then(hash => {
      url.searchParams.set("response_type", "code");
      url.searchParams.set("client_id", auth.CLIENT_ID);
      url.searchParams.set("redirect_uri", auth.REDIRECT_URI);
      url.searchParams.set("code_challenge_method", "S256");
      url.searchParams.set("code_challenge", base64url(hash));
      url.searchParams.set("state", state);
      url.searchParams.set("bth_ignore_origin", "true");

      const scopes = Array.isArray(auth.SCOPES) ? auth.SCOPES.filter(Boolean) : [];
      if (scopes.length) url.searchParams.set("scope", scopes.join(","));
      if (auth.AUDIENCE) url.searchParams.set("audience", auth.AUDIENCE);
      return url.toString();
    });
  }

  async function exchangeCode(code, state) {
    const expectedState = sessionStorage.getItem(KEY_STATE);
    const verifier = sessionStorage.getItem(KEY_VERIFIER);

    if (!code) throw new Error("AUTHORIZATION_CODE_MISSING");
    if (!state || !expectedState || state !== expectedState) throw new Error("OAUTH_STATE_INVALID");
    if (!verifier) throw new Error("PKCE_VERIFIER_MISSING");

    const backend = String((window.BI_CONFIG && window.BI_CONFIG.BACKEND_URL) || "").replace(/\/$/, "");
    if (!backend) throw new Error("BACKEND_NOT_CONFIGURED");

    const response = await fetch(backend + "/api/auth/exchange", {
      method: "POST",
      headers: {"Content-Type":"application/json","Accept":"application/json"},
      body: JSON.stringify({
        code,
        codeVerifier: verifier,
        state
      })
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.access_token) {
      const detail = payload.detail ? " | " + payload.detail : "";
      throw new Error((payload.error || ("TOKEN_HTTP_" + response.status)) + detail);
    }

    sessionStorage.setItem(KEY_TOKEN, payload.access_token);
    const seconds = Number(payload.expires_in || 0);
    if (seconds > 0) {
      sessionStorage.setItem(KEY_EXPIRES, String(Date.now() + Math.max(0, seconds - 30) * 1000));
    } else {
      sessionStorage.removeItem(KEY_EXPIRES);
    }

    sessionStorage.removeItem(KEY_VERIFIER);
    sessionStorage.removeItem(KEY_STATE);
    return payload;
  }

  async function login() {
    const auth = cfg();
    if (!auth.CLIENT_ID || !auth.REDIRECT_URI || !auth.AUTHORIZE_URL || !auth.TOKEN_URL) {
      throw new Error("AUTH_CONFIG_INCOMPLETE");
    }

    const verifier = randomUrlSafe(48);
    const state = randomUrlSafe(24);

    // Mantemos o PKCE na sessão da janela do BI. Como o login acontece em popup,
    // a página do BI não navega e o verifier/state não são perdidos.
    sessionStorage.setItem(KEY_VERIFIER, verifier);
    sessionStorage.setItem(KEY_STATE, state);

    const target = await buildAuthorizeUrl(verifier, state);
    const width = 1120;
    const height = 760;
    const left = Math.max(0, Math.round((screen.width - width) / 2));
    const top = Math.max(0, Math.round((screen.height - height) / 2));

    const popup = window.open(
      target,
      "betha-bi-login",
      `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (!popup) {
      throw new Error("POPUP_BLOCKED");
    }

    popup.focus();

    return new Promise((resolve, reject) => {
      let settled = false;

      const cleanup = () => {
        window.removeEventListener("message", onMessage);
        clearInterval(closedTimer);
      };

      const finish = (fn, value) => {
        if (settled) return;
        settled = true;
        cleanup();
        try { popup.close(); } catch {}
        fn(value);
      };

      const onMessage = async (event) => {
        if (event.origin !== location.origin) return;
        if (!event.data || event.data.type !== "BETHA_BI_OAUTH_CALLBACK") return;

        try {
          const params = new URLSearchParams(event.data.search || "");
          const fragment = new URLSearchParams(String(event.data.hash || "").replace(/^#/, ""));
          const error = params.get("error") || fragment.get("error");
          if (error) {
            const description = params.get("error_description") || fragment.get("error_description") || "";
            throw new Error(error + (description ? ": " + description : ""));
          }

          const fragmentToken = fragment.get("access_token");
          if (fragmentToken) {
            const stateValue = fragment.get("state");
            const expectedState = sessionStorage.getItem(KEY_STATE);
            if (stateValue && expectedState && stateValue !== expectedState) throw new Error("OAUTH_STATE_INVALID");

            sessionStorage.setItem(KEY_TOKEN, fragmentToken);
            const seconds = Number(fragment.get("expires_in") || fragment.get("expires") || 0);
            if (seconds > 0) {
              sessionStorage.setItem(KEY_EXPIRES, String(Date.now() + Math.max(0, seconds - 30) * 1000));
            }
            sessionStorage.removeItem(KEY_VERIFIER);
            sessionStorage.removeItem(KEY_STATE);
            finish(resolve, {access_token:fragmentToken, implicit:true});
            return;
          }

          const code = params.get("code");
          const stateValue = params.get("state");
          const payload = await exchangeCode(code, stateValue);
          finish(resolve, payload);
        } catch (error) {
          finish(reject, error);
        }
      };

      window.addEventListener("message", onMessage);

      const closedTimer = setInterval(() => {
        if (popup.closed) {
          finish(reject, new Error("LOGIN_WINDOW_CLOSED"));
        }
      }, 600);
    });
  }

  function relayCallbackToOpener() {
    if (!window.opener || window.opener.closed) return false;
    try {
      window.opener.postMessage({
        type: "BETHA_BI_OAUTH_CALLBACK",
        search: location.search,
        hash: location.hash
      }, location.origin);
      setTimeout(() => window.close(), 150);
      return true;
    } catch {
      return false;
    }
  }

  async function handleStandaloneCallback() {
    // Compatibilidade para callback aberto diretamente.
    const params = new URLSearchParams(location.search);
    const fragment = new URLSearchParams(String(location.hash || "").replace(/^#/, ""));
    const error = params.get("error") || fragment.get("error");
    if (error) {
      const description = params.get("error_description") || fragment.get("error_description") || "";
      throw new Error(error + (description ? ": " + description : ""));
    }

    // Fluxo implicit antigo, caso a Betha devolva token no hash.
    const fragmentToken = fragment.get("access_token");
    if (fragmentToken) {
      sessionStorage.setItem(KEY_TOKEN, fragmentToken);
      const seconds = Number(fragment.get("expires_in") || fragment.get("expires") || 0);
      if (seconds > 0) {
        sessionStorage.setItem(KEY_EXPIRES, String(Date.now() + Math.max(0, seconds - 30) * 1000));
      }
      location.replace("../");
      return;
    }

    throw new Error("CALLBACK_WITHOUT_OPENER");
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
    relayCallbackToOpener,
    handleStandaloneCallback
  };
})();