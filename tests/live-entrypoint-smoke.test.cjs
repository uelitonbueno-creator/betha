const test=require("node:test");
const assert=require("node:assert/strict");
const vm=require("node:vm");

const FRONT="https://uelitonbueno-creator.github.io/betha/";
const WORKER="https://betha-bi-api.ueliton-bueno.workers.dev";
const ORIGIN="https://uelitonbueno-creator.github.io";
async function read(url,options={}) {
  const response=await fetch(url,{...options,signal:AbortSignal.timeout(15000)});
  return response;
}
test("public GitHub Pages serves BI Vella entrypoint",async()=>{
  const response=await read(FRONT);
  assert.equal(response.status,200,"Pages HTML HTTP status");
  const html=await response.text();
  for(const marker of ['id="bethaApp"','id="authGate"','src="app.js']) {
    assert.ok(html.includes(marker),"Pages missing "+marker);
  }
});
test("published app and auth scripts are JavaScript, not error pages",async()=>{
  for(const path of ["app.js","auth/auth.js"]) {
    const response=await read(FRONT+path);
    assert.equal(response.status,200,path+" HTTP status");
    const source=await response.text();
    assert.ok(source.length>1000,path+" unexpectedly short");
    assert.doesNotThrow(()=>new vm.Script(source,{filename:path}),path+" JS syntax");
  }
});
test("production Worker health and cross-origin access are available",async()=>{
  const response=await read(WORKER+"/api/health",{headers:{Origin:ORIGIN}});
  assert.equal(response.status,200,"Worker health HTTP status");
  const payload=await response.json();
  assert.equal(payload.ok,true,"Worker health payload");
  const allow=response.headers.get("access-control-allow-origin");
  assert.ok([ORIGIN,"*"].includes(allow),"Worker CORS origin missing");
});
test("production tenant API does not expose tenants anonymously",async()=>{
  const response=await read(WORKER+"/api/me/tenants",{headers:{Origin:ORIGIN}});
  assert.ok([401,403].includes(response.status),"Unexpected anonymous tenant status "+response.status);
});

// Read-only production check: the public login route must reach Betha OAuth.
// Never follow the redirect or capture a user credential in CI logs.
test("production Betha login route redirects to configured OAuth provider",async()=>{
  const response=await read(WORKER+"/api/auth/login",{redirect:"manual"});
  assert.equal(response.status,302,"OAuth login must redirect, not render an error page");
  const location=response.headers.get("location");
  assert.ok(location,"OAuth redirect Location missing");
  const authorize=new URL(location);
  assert.equal(authorize.origin,"https://plataforma-oauth.betha.cloud","unexpected OAuth provider");
  assert.equal(authorize.pathname,"/auth/oauth2/authorize");
  assert.equal(authorize.searchParams.get("response_type"),"code");
  assert.ok(authorize.searchParams.get("client_id"),"OAuth client ID missing");
  assert.ok(authorize.searchParams.get("state"),"OAuth state missing");
  const callback=new URL(authorize.searchParams.get("redirect_uri"));
  assert.equal(callback.origin,WORKER,"OAuth callback origin mismatch");
  assert.equal(callback.pathname,"/api/auth/callback");
});

// The OAuth callback redirects to the Worker origin, NOT to GitHub Pages.
// A healthy /api/health is insufficient if this same-origin HTML proxy fails.
test("production OAuth landing serves the same-origin application shell",async()=>{
  const response=await read(WORKER+"/",{headers:{Accept:"text/html"}});
  assert.equal(response.status,200,"Worker OAuth landing HTML HTTP status");
  assert.equal(response.headers.get("x-bi-front-proxy"),"cloudflare-worker",
    "OAuth landing must be served by the Worker frontend proxy");
  const html=await response.text();
  for(const marker of ['id="bethaApp"','id="authGate"','window.__BI_SERVER_AUTH=','src="auth/auth.js','src="app.js']) {
    assert.ok(html.includes(marker),"Worker OAuth landing missing "+marker);
  }
  assert.match(html,/window\.__BI_SERVER_AUTH=\{"authenticated":false/,
    "anonymous Worker landing must not claim an authenticated session");
});
test("production same-origin frontend scripts load as JavaScript",async()=>{
  for(const path of ["/auth/auth.js","/app.js"]) {
    const response=await read(WORKER+path);
    assert.equal(response.status,200,"Worker-proxied "+path+" HTTP status");
    const source=await response.text();
    assert.ok(source.length>1000,"Worker-proxied "+path+" unexpectedly short");
    assert.doesNotThrow(()=>new vm.Script(source,{filename:path}),
      "Worker-proxied "+path+" must be valid JavaScript");
  }
});


// Exercise the *published* OAuth landing in an actual browser, not just fetch
// and JavaScript syntax. This is anonymous and never handles Betha credentials.
// It catches a blank page caused by script startup, HTML proxy, or asset loading.
test("production Worker OAuth landing shows usable anonymous login in Chromium", {timeout:75000}, () => {
  const {spawnSync}=require("node:child_process");
  let chrome="";
  for(const candidate of ["google-chrome","google-chrome-stable","chromium","chromium-browser"]){
    const found=spawnSync("which",[candidate],{encoding:"utf8"});
    if(found.status===0){chrome=found.stdout.trim();break;}
  }
  assert.ok(chrome,"Chrome/Chromium required for production browser smoke");
  const run=spawnSync(chrome,[
    "--headless=new","--no-sandbox","--disable-gpu",
    "--disable-dev-shm-usage","--no-first-run",
    "--no-default-browser-check","--virtual-time-budget=24000",
    "--dump-dom",WORKER+"/"
  ],{encoding:"utf8",timeout:65000,maxBuffer:16*1024*1024});
  assert.equal(run.status,0,"Chromium failed: "+String(run.stderr).slice(-1000));
  const html=String(run.stdout||"");
  assert.ok(html.includes("BI Vella"),"Worker landing did not render BI Vella");
  const gate=html.match(/<div id="authGate"[^>]*>/);
  assert.ok(gate,"Worker login gate is missing");
  assert.ok(!/\\bhidden(?:\\s|>|=)/.test(gate[0]),
    "Worker login gate remained hidden (possible blank screen)");
  const login=html.match(/<a id="loginButton"[^>]*>/);
  assert.ok(login,"Worker login button is missing");
  assert.ok(login[0].includes(WORKER+"/api/auth/login"),
    "Worker login button points to the wrong origin");
  assert.ok(html.includes('id="bethaApp"'),"Worker app shell is missing");
});
