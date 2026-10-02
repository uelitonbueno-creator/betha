(() => {
  const cfg = () => window.BI_CONFIG || {};
  const KEY_SESSION = "betha_bi_session";
  const KEY_EXPIRES = "betha_bi_session_expires";
  const KEY_ERROR = "betha_bi_auth_error";
  const LEGACY_KEYS = [
    "betha_bi_dev_session",
    "betha_bi_dev_session_expires",
    "betha_bi_dev_auth_error"
  ];

  function stores() {
    const out = [];
    try { if (window.sessionStorage) out.push(window.sessionStorage); } catch {}
    try { if (window.localStorage) out.push(window.localStorage); } catch {}
    return out;
  }

  function setItem(key, value) {
    let lastError = null;
    for (const store of stores()) {
      try {
        store.setItem(key, String(value));
        return;
      } catch (error) {
        lastError = error;
      }
    }
    if (lastError) throw lastError;
  }

  function getItem(key) {
    for (const store of stores()) {
      try {
        const value = store.getItem(key);
        if (value) return value;
      } catch {}
    }
    return "";
  }

  function removeItem(key) {
    for (const store of stores()) {
      try { store.removeItem(key); } catch {}
    }
  }

  function backendBase() {
    return String(cfg().BACKEND_URL || "").replace(/\/$/, "");
  }

  function clearLegacy() {
    LEGACY_KEYS.forEach(removeItem);
  }

  function clear() {
    removeItem(KEY_SESSION);
    removeItem(KEY_EXPIRES);
    removeItem(KEY_ERROR);
    clearLegacy();
  }

  function clearSessionOnly() {
    removeItem(KEY_SESSION);
    removeItem(KEY_EXPIRES);
    clearLegacy();
  }

  function getToken() {
    const token = getItem(KEY_SESSION);
    const expires = Number(getItem(KEY_EXPIRES) || 0);
    if (!token) return "";

    if (expires && Date.now() >= expires) {
      clearSessionOnly();
      setItem(KEY_ERROR, "APPLICATION_SESSION_EXPIRED");
      return "";
    }

    return token;
  }

  function getError() {
    return getItem(KEY_ERROR);
  }

  function cleanAuthParams() {
    const url = new URL(location.href);
    let changed = false;

    for (const key of ["auth_handoff","auth_return","auth_error"]) {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
        changed = true;
      }
    }

    if (url.hash && /(^#|&)(session|auth_error)=/.test(url.hash)) {
      url.hash = "";
      changed = true;
    }

    if (changed) {
      history.replaceState({}, document.title, url.pathname + url.search + url.hash);
    }
  }

  function saveSession(session, seconds) {
    if (!session) throw new Error("APPLICATION_SESSION_INVALID");

    setItem(KEY_SESSION, session);

    const ttl = Number(seconds || 0);
    if (ttl > 0) {
      const safeSeconds = Math.max(0, ttl - 30);
      setItem(KEY_EXPIRES, Date.now() + safeSeconds * 1000);
    } else {
      removeItem(KEY_EXPIRES);
    }

    removeItem(KEY_ERROR);
    clearLegacy();
  }

  async function exchangeHandoff(handoff) {
    const base = backendBase();
    if (!base) throw new Error("BACKEND_NOT_CONFIGURED");

    const response = await fetch(base + "/api/auth/session-exchange", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      credentials: "omit",
      body: JSON.stringify({handoff})
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.session) {
      const error = new Error(payload.error || ("HTTP_" + response.status));
      error.status = response.status;
      throw error;
    }

    saveSession(payload.session, payload.expires_in);
    return true;
  }

  async function handleCallback() {
    const url = new URL(location.href);
    const queryError = url.searchParams.get("auth_error") || "";
    const handoff = url.searchParams.get("auth_handoff") || "";
    const authReturn = url.searchParams.get("auth_return") || "";

    const rawHash = String(location.hash || "").replace(/^#/, "");
    const hashParams = new URLSearchParams(rawHash);
    const legacySession = hashParams.get("session") || "";
    const hashError = hashParams.get("auth_error") || "";

    const authError = queryError || hashError;

    if (!authError && !handoff && !legacySession && !authReturn) return false;

    cleanAuthParams();

    if (authError) {
      clearSessionOnly();
      setItem(KEY_ERROR, authError);
      return true;
    }

    if (handoff) {
      try {
        await exchangeHandoff(handoff);
      } catch (error) {
        clearSessionOnly();
        setItem(KEY_ERROR, error.message || "AUTH_HANDOFF_INVALID");
      }
      return true;
    }

    if (legacySession) {
      saveSession(legacySession, Number(hashParams.get("expires_in") || 0));
      return true;
    }

    clearSessionOnly();
    setItem(KEY_ERROR, "AUTH_HANDOFF_MISSING");
    return true;
  }

  async function validate() {
    const token = getToken();
    if (!token) return false;

    const base = backendBase();
    if (!base) {
      setItem(KEY_ERROR, "BACKEND_NOT_CONFIGURED");
      return false;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(base + "/api/auth/session-check", {
        headers: {
          "Accept": "application/json",
          "Authorization": "Session " + token
        },
        credentials: "omit",
        signal: controller.signal
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok || payload.sessionValid !== true) {
        const error = new Error(payload.error || ("HTTP_" + response.status));
        error.status = response.status;
        throw error;
      }

      removeItem(KEY_ERROR);
      return true;
    } catch (error) {
      const code = error && error.name === "AbortError"
        ? "AUTH_VALIDATION_TIMEOUT"
        : (error.message || "APPLICATION_SESSION_INVALID");

      setItem(KEY_ERROR, code);

      if (
        error && error.status === 401 &&
        ["APPLICATION_SESSION_INVALID","APPLICATION_SESSION_EXPIRED","USER_TOKEN_REQUIRED"].includes(code)
      ) {
        clearSessionOnly();
        setItem(KEY_ERROR, code);
        return false;
      }

      return Boolean(getToken());
    } finally {
      clearTimeout(timer);
    }
  }

  function login() {
    const base = backendBase();
    if (!base) throw new Error("BACKEND_NOT_CONFIGURED");

    removeItem(KEY_ERROR);
    location.assign(base + "/api/auth/login");
  }

  function logout() {
    clear();
    location.replace(location.pathname + location.search);
  }

  const ready = (async () => {
    await handleCallback();
    return validate();
  })();

  window.BIAuth = {
    ready,
    getToken,
    getError,
    isAuthenticated: () => Boolean(getToken()),
    login,
    logout,
    clear,
    handleCallback
  };
})();
