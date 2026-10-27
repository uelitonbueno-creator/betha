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
