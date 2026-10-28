const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const source=fs.readFileSync("auth/auth.js","utf8");
const start=source.indexOf("  async function exchangeHandoff(");
const end=source.indexOf("\n  async function handleCallback()",start);
assert.ok(start>=0 && end>start,"exchangeHandoff must exist");
function make(fetchImpl,onSave=()=>{}) {
  return vm.runInNewContext(source.slice(start,end)+";exchangeHandoff",{
    backendBase:()=>"https://backend.test",fetch:fetchImpl,AbortController,
    setTimeout,clearTimeout,saveSession:onSave,Error,JSON
  });
}
test("OAuth handoff returns promptly when backend stalls",async()=>{
  const exchange=make((_url,options)=>new Promise((_resolve,reject)=>{
    options.signal.addEventListener("abort",()=>{
      const error=new Error("aborted");error.name="AbortError";reject(error);
    },{once:true});
  }));
  const begin=Date.now();
  await assert.rejects(exchange("opaque-handoff",15),/AUTH_HANDOFF_TIMEOUT/);
  assert.ok(Date.now()-begin<1000);
});
test("OAuth handoff still saves a valid session",async()=>{
  let saved;
  const exchange=make(async(url,options)=>{
    assert.equal(url,"https://backend.test/api/auth/session-exchange");
    assert.equal(options.credentials,"omit");
    assert.equal(options.method,"POST");
    assert.ok(options.signal);
    assert.equal(JSON.parse(options.body).handoff,"opaque-handoff");
    return {ok:true,json:async()=>({session:"test-session",expires_in:300})};
  },(session,ttl)=>{saved={session,ttl}});
  assert.equal(await exchange("opaque-handoff",100),true);
  assert.deepEqual(saved,{session:"test-session",ttl:300});
});
test("OAuth handoff preserves explicit HTTP errors",async()=>{
  const exchange=make(async()=>({ok:false,status:401,json:async()=>({error:"AUTH_HANDOFF_INVALID"})}));
  await assert.rejects(exchange("invalid",100),/AUTH_HANDOFF_INVALID/);
});

const validateStart=source.indexOf("  async function validate() {");
const validateEnd=source.indexOf("\n  function login()",validateStart);
assert.ok(validateStart>=0 && validateEnd>validateStart,"validate must exist");

function makeSessionCheck(status,code) {
  let token="stale-session";
  const errors=[];
  let clears=0;
  let sent;
  const validate=vm.runInNewContext(
    "let cookieAuthenticated=false;const serverAuth={authenticated:false};"+
      source.slice(validateStart,validateEnd)+";validate",
    {
      getToken:()=>token,
      backendBase:()=>"https://backend.test",
      fetch:async(url,options)=>{
        sent={url,options};
        return {ok:status>=200&&status<300,status,
          json:async()=>status===200?{sessionValid:true}:{error:code}};
      },
      setItem:(key,value)=>errors.push({key,value}),
      removeItem:()=>{},
      clearSessionOnly:()=>{clears++;token="";},
      KEY_ERROR:"betha_bi_auth_error",
      AbortController,setTimeout,clearTimeout,Error,Boolean,JSON
    }
  );
  return {validate,errors,clears:()=>clears,token:()=>token,sent:()=>sent};
}
test("explicit 401 rejects cached session even with a non-local error code",async()=>{
  const x=makeSessionCheck(401,"PLATFORM_HTTP_401");
  assert.equal(await x.validate(),false);
  assert.equal(x.clears(),1);
  assert.equal(x.token(),"");
  assert.equal(x.errors.at(-1).value,"PLATFORM_HTTP_401");
  assert.equal(x.sent().options.credentials,"include");
});
test("explicit 403 cannot open the app using a cached session",async()=>{
  const x=makeSessionCheck(403,"PLATFORM_HTTP_403");
  assert.equal(await x.validate(),false);
  assert.equal(x.clears(),1);
});
test("transient 503 preserves cached session without treating null as a success",async()=>{
  const x=makeSessionCheck(503,"PLATFORM_HTTP_503");
  assert.equal(await x.validate(),true);
  assert.equal(x.clears(),0);
  assert.equal(x.errors.at(-1).value,"PLATFORM_HTTP_503");
});
test("valid server-side session still passes",async()=>{
  const x=makeSessionCheck(200);
  assert.equal(await x.validate(),true);
  assert.equal(x.clears(),0);
});

test("verified Worker cookie discards stale browser token before tenant requests",async()=>{
  let token="stale-browser-session";
  let clears=0;
  let networkChecks=0;
  const validate=vm.runInNewContext(
    "let cookieAuthenticated=false;const serverAuth={authenticated:true};"+
      source.slice(validateStart,validateEnd)+";validate",
    {
      getToken:()=>token,
      clearSessionOnly:()=>{clears++;token="";},
      removeItem:()=>{},
      fetch:async()=>{networkChecks++;throw new Error("unnecessary session-check");},
      KEY_ERROR:"betha_bi_auth_error",
      Error
    }
  );
  assert.equal(await validate(),true);
  assert.equal(clears,1,"stale browser token must be removed when HttpOnly cookie is authoritative");
  assert.equal(token,"","app.js must not send Authorization: Session with a stale token");
  assert.equal(networkChecks,0,"verified Worker cookie does not need an extra session-check");
});

test("cross-origin bearer session remains available without Worker cookie",async()=>{
  const x=makeSessionCheck(200);
  assert.equal(await x.validate(),true);
  assert.equal(x.token(),"stale-session","GitHub Pages bearer flow must remain intact");
  assert.equal(x.clears(),0);
  assert.equal(x.sent().options.headers.Authorization,"Session stale-session");
});

const workerSource=fs.readFileSync("backend/worker.js","utf8");
const sessionRoute='    if (url.pathname==="/api/auth/session-check" && request.method==="GET") {';
const sessionRouteStart=workerSource.indexOf(sessionRoute);
const sessionRouteEnd=workerSource.indexOf('\n    if (url.pathname==="/api/auth/logout"',sessionRouteStart);
test("session-check has one reachable route and validates upstream access",async()=>{
  assert.ok(sessionRouteStart>=0&&sessionRouteEnd>sessionRouteStart);
  assert.equal(workerSource.split(sessionRoute).length-1,1,
    "duplicate session-check handlers can silently bypass upstream validation");
  let calls=0;
  const handler=vm.runInNewContext(
    "(async function(request,env,url){"+
      workerSource.slice(sessionRouteStart,sessionRouteEnd)+"})",
    {
      authTrace:async()=>{},
      getUserToken:async()=>"test-token",
      getUserAccesses:async(token)=>{calls++;assert.equal(token,"test-token");return [{id:1},{id:2}];},
      json:(_req,_env,status,body)=>({status,body}),
      errorResponse:(_req,_env,error)=>({status:error.status||401,error:error.message}),
      Error,Array
    }
  );
  const result=await handler({method:"GET"},{},{pathname:"/api/auth/session-check"});
  assert.equal(result.status,200);
  assert.equal(result.body.sessionValid,true);
  assert.equal(result.body.accessCount,2);
  assert.equal(calls,1);
});
test("upstream Betha 401 must not become sessionValid true",async()=>{
  const handler=vm.runInNewContext(
    "(async function(request,env,url){"+
      workerSource.slice(sessionRouteStart,sessionRouteEnd)+"})",
    {
      authTrace:async()=>{},
      getUserToken:async()=>"revoked-token",
      getUserAccesses:async()=>{const error=new Error("PLATFORM_HTTP_401");error.status=401;throw error;},
      json:(_req,_env,status,body)=>({status,body}),
      errorResponse:(_req,_env,error)=>({status:error.status||500,error:error.message}),
      Error,Array
    }
  );
  const result=await handler({method:"GET"},{},{pathname:"/api/auth/session-check"});
  assert.equal(result.status,401);
  assert.equal(result.error,"PLATFORM_HTTP_401");
});

test("OAuth callback failure is not masked by an anonymous session-check",async()=>{
  const readyStart=source.indexOf("  const ready = (async () => {");
  const readyEnd=source.indexOf("\n  window.BIAuth =",readyStart);
  assert.ok(readyStart>=0&&readyEnd>readyStart);
  let checks=0;
  const ready=vm.runInNewContext(source.slice(readyStart,readyEnd)+";ready",{
    handleCallback:async()=>true,
    getError:()=>"AUTH_HANDOFF_INVALID",
    getToken:()=>"",
    validate:async()=>{checks++;return false;},
    serverAuth:{authenticated:false},
    setItem:()=>{},removeItem:()=>{},KEY_ERROR:"betha_bi_auth_error"
  });
  assert.equal(await ready,false);
  assert.equal(checks,0,"failed OAuth callback must not be overwritten by USER_TOKEN_REQUIRED");
});

test("successful OAuth callback still validates its session",async()=>{
  const readyStart=source.indexOf("  const ready = (async () => {");
  const readyEnd=source.indexOf("\n  window.BIAuth =",readyStart);
  let checks=0;
  const ready=vm.runInNewContext(source.slice(readyStart,readyEnd)+";ready",{
    handleCallback:async()=>true,
    getError:()=>"",
    getToken:()=>"session",
    validate:async()=>{checks++;return true;},
    serverAuth:{authenticated:false},
    setItem:()=>{},removeItem:()=>{},KEY_ERROR:"betha_bi_auth_error"
  });
  assert.equal(await ready,true);
  assert.equal(checks,1);
});

test("login gate exposes safe diagnostic messages without leaking backend errors",()=>{
  const app=fs.readFileSync("app.js","utf8");
  const start=app.indexOf("  function authGateFailureMessage(");
  const end=app.indexOf("\n  if (authRequired && window.BIAuth",start);
  assert.ok(start>=0&&end>start);
  const message=vm.runInNewContext(app.slice(start,end)+";authGateFailureMessage");
  assert.equal(message("USER_TOKEN_REQUIRED"),"");
  assert.equal(message("HTTP_401"),"");
  assert.match(message("AUTH_HANDOFF_INVALID"),/login Betha/);
  assert.match(message("AUTH_HANDOFF_TIMEOUT"),/tempo limite/);
  assert.match(message("PLATFORM_HTTP_403"),/autorização/);
  const secret="token-private-123";
  assert.doesNotMatch(message(secret),/token-private-123/);
});
