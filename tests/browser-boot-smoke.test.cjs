const test=require("node:test");
const assert=require("node:assert/strict");
const {spawnSync}=require("node:child_process");
const fs=require("node:fs");

function chromeBinary(){
  for(const name of ["google-chrome","google-chrome-stable","chromium","chromium-browser"]){
    const x=spawnSync("which",[name],{encoding:"utf8"});
    if(x.status===0) return x.stdout.trim();
  }
  return "";
}
test("candidate checkout renders a visible login gate in headless Chromium",()=>{
  const chrome=chromeBinary();
  assert.ok(chrome,"Chrome/Chromium is required for browser smoke");
  const run=spawnSync(chrome,[
    "--headless=new","--no-sandbox","--disable-gpu","--disable-dev-shm-usage",
    "--no-first-run","--no-default-browser-check","--virtual-time-budget=22000",
    "--dump-dom","http://127.0.0.1:8765/"
  ],{encoding:"utf8",timeout:55000,maxBuffer:20*1024*1024});
  assert.equal(run.status,0,"Chromium failed: "+String(run.stderr).slice(-1200));
  const html=run.stdout;
  assert.ok(html.includes("BI Vella"),"Application HTML missing");
  const gate=html.match(/<div id="authGate"[^>]*>/);
  assert.ok(gate,"Authentication gate missing");
  assert.ok(!gate[0].includes(" hidden"),"Authentication gate remained hidden after startup");
  const login=html.match(/<a id="loginButton"[^>]*>/);
  assert.ok(login,"Login button missing");
  assert.ok(login[0].includes("https://betha-bi-api.ueliton-bueno.workers.dev/api/auth/login"),"Login URL not initialized");
});
