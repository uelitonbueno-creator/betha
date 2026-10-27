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
