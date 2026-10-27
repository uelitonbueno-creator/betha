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
