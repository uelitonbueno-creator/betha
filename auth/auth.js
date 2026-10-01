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

  function sha256(text) {
    const utf8 = unescape(encodeURIComponent(text));
    const words = [];
    const bitLength = utf8.length * 8;

    for (let i = 0; i < utf8.length; i++) {
      words[i >> 2] = (words[i >> 2] || 0) | (utf8.charCodeAt(i) << (24 - (i % 4) * 8));
    }

    words[bitLength >> 5] = (words[bitLength >> 5] || 0) | (0x80 << (24 - bitLength % 32));
    words[(((bitLength + 64) >> 9) << 4) + 15] = bitLength;

    const K = [
      0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
      0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
      0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
      0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
      0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
      0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
      0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
      0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
    ];

    const H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    const rotr = (x,n) => (x >>> n) | (x << (32-n));

    for (let i = 0; i < words.length; i += 16) {
      const w = new Array(64);
      for (let t = 0; t < 16; t++) w[t] = words[i+t] | 0;
      for (let t = 16; t < 64; t++) {
        const s0 = rotr(w[t-15],7) ^ rotr(w[t-15],18) ^ (w[t-15] >>> 3);
        const s1 = rotr(w[t-2],17) ^ rotr(w[t-2],19) ^ (w[t-2] >>> 10);
        w[t] = (w[t-16] + s0 + w[t-7] + s1) | 0;
      }

      let [a,b,c,d,e,f,g,h] = H;
      for (let t = 0; t < 64; t++) {
        const S1 = rotr(e,6) ^ rotr(e,11) ^ rotr(e,25);
        const ch = (e & f) ^ (~e & g);
        const temp1 = (h + S1 + ch + K[t] + w[t]) | 0;
        const S0 = rotr(a,2) ^ rotr(a,13) ^ rotr(a,22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (S0 + maj) | 0;
        h=g; g=f; f=e; e=(d+temp1)|0; d=c; c=b; b=a; a=(temp1+temp2)|0;
      }

      H[0]=(H[0]+a)|0; H[1]=(H[1]+b)|0; H[2]=(H[2]+c)|0; H[3]=(H[3]+d)|0;
      H[4]=(H[4]+e)|0; H[5]=(H[5]+f)|0; H[6]=(H[6]+g)|0; H[7]=(H[7]+h)|0;
    }

    const out = new Uint8Array(32);
    H.forEach((v,i) => {
      out[i*4] = (v >>> 24) & 255;
      out[i*4+1] = (v >>> 16) & 255;
      out[i*4+2] = (v >>> 8) & 255;
      out[i*4+3] = v & 255;
    });
    return out;
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

  function login() {
    const auth = cfg();
    if (!auth.CLIENT_ID || !auth.REDIRECT_URI || !auth.AUTHORIZE_URL) {
      throw new Error("AUTH_CONFIG_INCOMPLETE");
    }

    clearError();

    const verifier = randomUrlSafe(48);
    const state = randomUrlSafe(24);
    const challenge = base64url(sha256(verifier));

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

    const target = url.toString();

    // Executa a navegação ainda dentro do clique do usuário.
    // _top funciona tanto em página normal quanto se o BI for aberto em container/iframe.
    const navigated = window.open(target, "_top");
    if (!navigated) {
      window.location.assign(target);
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

    if (!code) {
      // Se a Betha retornou do login mas não propagou o authorization code,
      // não falhar silenciosamente.
      if (params.has("session_state") && getCookie(COOKIE_STATE)) {
        setError("OAUTH_RETURN_WITHOUT_CODE");
      }
      return false;
    }

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