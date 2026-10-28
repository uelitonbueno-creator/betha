const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const app=fs.readFileSync('app.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const helperStart=app.indexOf('  async function waitForBethaAppRegistration(');
const helperEnd=app.indexOf('\n  if (authRequired &&',helperStart);
function helper(registry){
  assert.ok(helperStart>0&&helperEnd>helperStart,'boot helper must be present');
  return vm.runInNewContext(app.slice(helperStart,helperEnd)+';waitForBethaAppRegistration',{
    window:{customElements:registry},setTimeout,clearTimeout,Promise
  });
}
test('registered Betha component is accepted immediately',async()=>{
  const f=helper({get:()=>({}),whenDefined:()=>Promise.resolve()});
  assert.equal(await f(5),true);
});
test('unreachable component loader never blocks the dashboard indefinitely',async()=>{
  const f=helper({get:()=>undefined,whenDefined:()=>new Promise(()=>{})});
  const start=Date.now();
  assert.equal(await f(10),false);
  assert.ok(Date.now()-start<1000);
});
test('missing or failing component registry degrades safely',async()=>{
  assert.equal(await helper(undefined)(5),false);
  assert.equal(await helper({whenDefined:()=>Promise.reject(Error('CDN'))})(5),false);
});
function guardFixture({appHidden=true,authHidden=true,tenantHidden=true}={}){
  const script=html.match(/<script id="bi-vella-startup-guard">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script,'index must contain native startup guard');
  let callback;
  const note={textContent:''},auth={hidden:authHidden,querySelector:()=>note},tenant={hidden:tenantHidden};
  const login={href:''},app={};
  const nodes={bethaApp:app,authGate:auth,tenantGate:tenant,loginButton:login};
  vm.runInNewContext(script,{
    window:{BI_CONFIG:{BACKEND_URL:'https://backend.example'},setTimeout:fn=>{callback=fn}},
    document:{getElementById:id=>nodes[id]},
    getComputedStyle:()=>({display:appHidden?'none':'block'}),
    console:{warn:()=>{}}
  });
  assert.equal(typeof callback,'function');callback();
  return {auth,tenant,note,login};
}
test('startup watchdog reveals safe login fallback on blank screen',()=>{
  const x=guardFixture();assert.equal(x.auth.hidden,false);
  assert.match(x.note.textContent,/inicialização/i);
  assert.equal(x.login.href,'https://backend.example/api/auth/login');
});
test('startup watchdog does not override visible app or tenant selection',()=>{
  assert.equal(guardFixture({appHidden:false}).auth.hidden,true);
  assert.equal(guardFixture({tenantHidden:false}).auth.hidden,true);
});
