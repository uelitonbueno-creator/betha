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

  function setItem(key, value) {
    sessionStorage.setItem(key, String(value));
  }

  function getItem(key) {
    return sessionStorage.getItem(key) || "";
  }

  function removeItem(key) {
    sessionStorage.removeItem(key);
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

  function cleanCallbackUrl() {
    if (!location.hash) return;
    history.replaceState({}, document.title, location.pathname + location.search);
  }

  function handleCallback() {
    const raw = String(location.hash || "").replace(/^#/, "");
    if (!raw) return false;

    const params = new URLSearchParams(raw);
    const session = params.get("session") || "";
    const authError = params.get("auth_error") || "";

    if (!session && !authError) return false;

    if (authError) {
      clearSessionOnly();
      setItem(KEY_ERROR, authError);
      cleanCallbackUrl();
      return true;
    }

    const seconds = Number(params.get("expires_in") || 0);
    setItem(KEY_SESSION, session);

    if (seconds > 0) {
      const safeSeconds = Math.max(0, seconds - 30);
      setItem(KEY_EXPIRES, Date.now() + safeSeconds * 1000);
    } else {
      removeItem(KEY_EXPIRES);
    }

    removeItem(KEY_ERROR);
    clearLegacy();
    cleanCallbackUrl();
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
        throw new Error(payload.error || ("HTTP_" + response.status));
      }

      removeItem(KEY_ERROR);
      return true;
    } catch (error) {
      clearSessionOnly();
      setItem(
        KEY_ERROR,
        error && error.name === "AbortError"
          ? "AUTH_VALIDATION_TIMEOUT"
          : (error.message || "APPLICATION_SESSION_INVALID")
      );
      return false;
    } finally {
      clearTimeout(timer);
    }
  }

  function login() {
    const base = backendBase();
    if (!base) throw new Error("BACKEND_NOT_CONFIGURED");

    removeItem(KEY_ERROR);

    // Fluxo obrigatório: mesma aba, sem popup e sem nova janela.
    location.assign(base + "/api/auth/login");
  }

  function logout() {
    clear();
    location.replace(location.pathname + location.search);
  }

  handleCallback();
  const ready = validate();

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
