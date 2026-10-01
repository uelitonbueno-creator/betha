(() => {
  const cfg = () => window.BI_CONFIG || {};
  const KEY_SESSION = "betha_bi_app_session";
  const KEY_EXPIRES = "betha_bi_app_session_expires";
  const KEY_ERROR = "betha_bi_auth_error";
  const KEY_STATUS = "betha_bi_auth_status";

  function storeSet(key,value) {
    let saved=false;
    try { sessionStorage.setItem(key,value); saved=true; } catch {}
    try { localStorage.setItem(key,value); saved=true; } catch {}
    if (!saved) throw new Error("BROWSER_STORAGE_UNAVAILABLE");
  }

  function storeGet(key) {
    try {
      const v=sessionStorage.getItem(key);
      if (v) return v;
    } catch {}
    try {
      const v=localStorage.getItem(key);
      if (v) return v;
    } catch {}
    return "";
  }

  function storeRemove(key) {
    try { sessionStorage.removeItem(key); } catch {}
    try { localStorage.removeItem(key); } catch {}
  }

  function setStatus(value) {
    try { sessionStorage.setItem(KEY_STATUS,value); } catch {}
  }

  function getStatus() {
    try { return sessionStorage.getItem(KEY_STATUS) || ""; } catch { return ""; }
  }

  function consumeReturn() {
    const hash=new URLSearchParams(String(location.hash || "").replace(/^#/,""));
    const session=hash.get("session");
    const error=hash.get("auth_error");

    if (error) {
      storeSet(KEY_ERROR,error);
      setStatus("AUTH_ERROR_RETURNED");
      cleanUrl();
      return;
    }

    if (!session) return;

    try {
      storeSet(KEY_SESSION,session);
      const seconds=Number(hash.get("expires_in") || 0);
      if (seconds>0) {
        storeSet(KEY_EXPIRES,String(Date.now()+Math.max(0,seconds-30)*1000));
      } else {
        storeRemove(KEY_EXPIRES);
      }
      storeRemove(KEY_ERROR);
      setStatus("SESSION_RECEIVED");
    } catch(error) {
      try { storeSet(KEY_ERROR,error.message || "SESSION_STORAGE_FAILED"); } catch {}
      setStatus("SESSION_STORAGE_FAILED");
    }

    cleanUrl();
  }

  function cleanUrl() {
    history.replaceState({},document.title,location.pathname+location.search);
  }

  function getToken() {
    const token=storeGet(KEY_SESSION);
    const expires=Number(storeGet(KEY_EXPIRES) || 0);
    if (token && expires && Date.now()>=expires) {
      clear();
      return "";
    }
    return token;
  }

  function getError() {
    return storeGet(KEY_ERROR);
  }

  function clear() {
    [KEY_SESSION,KEY_EXPIRES,KEY_ERROR,KEY_STATUS].forEach(storeRemove);
  }

  async function validate() {
    const session=getToken();
    if (!session) return false;

    const base=String(cfg().BACKEND_URL || "").replace(/\/$/,"");
    if (!base) {
      storeSet(KEY_ERROR,"BACKEND_NOT_CONFIGURED");
      return false;
    }

    try {
      const response=await fetch(base+"/api/auth/session-check",{
        headers:{
          "Accept":"application/json",
          "Authorization":"Session "+session
        }
      });
      const payload=await response.json().catch(()=>({}));
      if (!response.ok || !payload.sessionValid) {
        throw new Error(payload.error || ("SESSION_CHECK_HTTP_"+response.status));
      }
      storeRemove(KEY_ERROR);
      setStatus("SESSION_VALIDATED");
      return true;
    } catch(error) {
      storeSet(KEY_ERROR,error.message || "SESSION_VALIDATION_FAILED");
      setStatus("SESSION_VALIDATION_FAILED");
      storeRemove(KEY_SESSION);
      storeRemove(KEY_EXPIRES);
      return false;
    }
  }

  function login() {
    const base=String(cfg().BACKEND_URL || "").replace(/\/$/,"");
    if (!base) throw new Error("BACKEND_NOT_CONFIGURED");
    storeRemove(KEY_ERROR);
    setStatus("LOGIN_STARTED");
    location.assign(base+"/api/auth/login");
  }

  function logout() {
    clear();
    location.href=new URL("./",location.href).toString();
  }

  consumeReturn();
  const ready=validate();

  window.BIAuth={
    ready,
    getToken,
    getError,
    getStatus,
    isAuthenticated:()=>Boolean(getToken()),
    login,
    logout,
    clear
  };
})();