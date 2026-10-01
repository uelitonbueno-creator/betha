(() => {
  const cfg = () => window.BI_CONFIG || {};
  const KEY_SESSION = "betha_bi_app_session";
  const KEY_EXPIRES = "betha_bi_app_session_expires";
  const KEY_ERROR = "betha_bi_auth_error";

  function consumeReturn() {
    const hash=new URLSearchParams(String(location.hash || "").replace(/^#/,""));
    const session=hash.get("session");
    const error=hash.get("auth_error");

    if (error) {
      sessionStorage.setItem(KEY_ERROR,error);
      cleanUrl();
      return;
    }

    if (!session) return;

    sessionStorage.setItem(KEY_SESSION,session);
    const seconds=Number(hash.get("expires_in") || 0);
    if (seconds>0) {
      sessionStorage.setItem(KEY_EXPIRES,String(Date.now()+Math.max(0,seconds-30)*1000));
    } else {
      sessionStorage.removeItem(KEY_EXPIRES);
    }
    sessionStorage.removeItem(KEY_ERROR);
    cleanUrl();
  }

  function cleanUrl() {
    history.replaceState({},document.title,location.pathname+location.search);
  }

  function getToken() {
    const token=sessionStorage.getItem(KEY_SESSION) || "";
    const expires=Number(sessionStorage.getItem(KEY_EXPIRES) || 0);
    if (token && expires && Date.now()>=expires) {
      clear();
      return "";
    }
    return token;
  }

  function getError() {
    return sessionStorage.getItem(KEY_ERROR) || "";
  }

  function clear() {
    sessionStorage.removeItem(KEY_SESSION);
    sessionStorage.removeItem(KEY_EXPIRES);
    sessionStorage.removeItem(KEY_ERROR);
  }

  function login() {
    const base=String(cfg().BACKEND_URL || "").replace(/\/$/,"");
    if (!base) throw new Error("BACKEND_NOT_CONFIGURED");
    location.assign(base+"/api/auth/login");
  }

  function logout() {
    clear();
    location.href=new URL("./",location.href).toString();
  }

  consumeReturn();

  window.BIAuth={
    getToken,
    getError,
    isAuthenticated:()=>Boolean(getToken()),
    login,
    logout,
    clear
  };
})();