(() => {
  const cfg = () => window.BI_CONFIG || {};
  const KEY_SESSION = "betha_bi_dev_session";
  const KEY_EXPIRES = "betha_bi_dev_session_expires";
  const KEY_ERROR = "betha_bi_dev_auth_error";

  function setItem(key,value) {
    sessionStorage.setItem(key,value);
  }

  function getItem(key) {
    return sessionStorage.getItem(key) || "";
  }

  function removeItem(key) {
    sessionStorage.removeItem(key);
  }

  function getToken() {
    const token=getItem(KEY_SESSION);
    const expires=Number(getItem(KEY_EXPIRES) || 0);
    if (!token) return "";
    if (expires && Date.now()>=expires) {
      clear();
      return "";
    }
    return token;
  }

  function getError() {
    return getItem(KEY_ERROR);
  }

  function clear() {
    removeItem(KEY_SESSION);
    removeItem(KEY_EXPIRES);
    removeItem(KEY_ERROR);
  }

  async function validate() {
    const token=getToken();
    if (!token) return false;

    const base=String(cfg().BACKEND_URL || "").replace(/\/$/,"");
    if (!base) return false;

    try {
      const response=await fetch(base+"/api/dev/session-check",{
        headers:{
          "Accept":"application/json",
          "Authorization":"DevSession "+token
        }
      });
      const payload=await response.json().catch(()=>({}));
      if (!response.ok || !payload.sessionValid) throw new Error(payload.error || "DEV_SESSION_INVALID");
      removeItem(KEY_ERROR);
      return true;
    } catch(error) {
      clear();
      setItem(KEY_ERROR,error.message || "DEV_SESSION_INVALID");
      return false;
    }
  }

  async function login(username,password) {
    const base=String(cfg().BACKEND_URL || "").replace(/\/$/,"");
    if (!base) throw new Error("BACKEND_NOT_CONFIGURED");

    const response=await fetch(base+"/api/dev/login",{
      method:"POST",
      headers:{
        "Accept":"application/json",
        "Content-Type":"application/json"
      },
      body:JSON.stringify({username,password})
    });

    const payload=await response.json().catch(()=>({}));
    if (!response.ok || !payload.session) {
      throw new Error(payload.error || ("HTTP_"+response.status));
    }

    setItem(KEY_SESSION,payload.session);
    const seconds=Number(payload.expires_in || 0);
    if (seconds>0) {
      setItem(KEY_EXPIRES,String(Date.now()+Math.max(0,seconds-30)*1000));
    }
    removeItem(KEY_ERROR);
    return true;
  }

  function logout() {
    clear();
    location.reload();
  }

  const ready=validate();

  window.BIAuth={
    ready,
    getToken,
    getError,
    isAuthenticated:()=>Boolean(getToken()),
    login,
    logout,
    clear
  };
})();