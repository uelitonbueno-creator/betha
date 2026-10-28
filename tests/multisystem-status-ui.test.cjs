/* node --test tests/multisystem-status-ui.test.cjs */
"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const app=fs.readFileSync(path.join(__dirname,"../app.js"),"utf8");
const html=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");
const css=fs.readFileSync(path.join(__dirname,"../style.css"),"utf8");

test("admin has an accessible multi-system status table",()=>{
  for(const id of ["refreshMultiSystemStatusButton","multiSystemLoadMessage","multiSystemLoadRows"]){
    assert.match(html,new RegExp('id="'+id+'"'));
  }
  assert.match(html,/aria-label="Situação das cargas por fonte"/);
  assert.match(css,/\.bi-multisystem-table-scroll\{[^}]*overflow-x:auto/);
});

test("status refresh is read-only, scoped to selected tenant and escaped",()=>{
  const a=app.indexOf("async function refreshMultiSystemLoads(){");
  const b=app.indexOf("document.getElementById('refreshMultiSystemStatusButton').addEventListener(",a);
  assert.ok(a>0&&b>a);
  const fn=app.slice(a,b);
  assert.match(fn,/api\('\/api\/admin\/multisystem-loads\?entity='/);
  assert.match(fn,/encodeURIComponent\(selected\)/);
  assert.match(fn,/form\.elements\.id\.value\.trim\(\)!==selected/);
  assert.match(fn,/cell\.textContent=value/);
  assert.match(fn,/body\.replaceChildren\(\)/);
  assert.doesNotMatch(fn,/\.innerHTML\s*=/);
  assert.doesNotMatch(fn,/method:\s*['"]POST['"]|method:\s*['"]PUT['"]/);
});

test("tenant changes refresh multi-system status without restarting the load",()=>{
  const a=app.indexOf("function resetEntitySettings(record=null)");
  const b=app.indexOf("async function loadEntitySettings()",a);
  const fn=app.slice(a,b);
  assert.match(fn,/if\(record\)\{\s*entitySyncAction\(\);\s*refreshMultiSystemLoads\(\);/);
  assert.match(fn,/multiSystemLoadRows"\)\.replaceChildren\(\)/);
});

test("real multi-system dashboards never display synthetic sample banner",()=>{
  const begin=app.indexOf("function renderOverviewAttention(");
  assert.ok(begin>=0,"executive summary renderer exists");
  const match=app.slice(begin,begin+4000).match(/const sampleMode=([^;]+);/);
  assert.ok(match,"executive summary contains data mode selection");
  const mode=new Function("payload","dashboards","currentView","currentSystemId","REAL_MULTI_SYSTEM_IDS","return ("+match[1]+");");
  const realSystems=new Set(["contabil","compras","folha"]);
  for(const [system,view] of [["contabil","contabil-visao-geral"],["compras","compras-visao-geral"],["folha","folha-visao-geral"]]){
    const dashboards={[view]:{system,localSample:{file:"data/samples/"+system+"-100.json"}}};
    for(const meta of [{realData:true,sampleMode:false},{realData:true,sampleMode:true},{sampleMode:true},{}]){
      assert.equal(mode({meta},dashboards,view,system,realSystems),false,
        system+": a real dashboard must never be classified as a sample");
    }
  }
});

test("load status distinguishes successful sources, failures and pending work",()=>{
  const start=app.indexOf("  function syncSourceProgress(job) {");
  const end=app.indexOf("  async function loadSyntheticHome()",start);
  assert.ok(start>=0 && end>start,"source-level status helpers exist");
  const {syncSourceProgress,syncSourceStatus}=new Function(app.slice(start,end)+";return {syncSourceProgress,syncSourceStatus};")();
  const job={state:"running",completed:3,total:4,rows:120,sources:{
    empenhos:{complete:true,error:null},
    processos:{complete:true,error:null},
    pagamentos:{complete:false,error:"BETHA_HTTP_401"},
    debitos:{complete:false,error:null}
  }};
  assert.deepEqual(syncSourceProgress(job),{succeeded:2,failed:1,pending:1,total:4});
  assert.match(syncSourceStatus(job),/2 de 4 fontes carregadas com sucesso/);
  assert.match(syncSourceStatus(job),/1 com erro/);
  assert.match(syncSourceStatus(job),/1 pendente/);
  assert.doesNotMatch(syncSourceStatus(job),/3 de 4 fontes concluídas/);
  assert.match(app,/status\.textContent=syncSourceStatus\(backgroundJob\)/,"home uses honest source status");
  assert.match(app,/syncSourceStatus\(job\)\+rowCount\+finishedAt/,"admin uses honest source status");
});

test("load status never invents zero success when source details are absent",()=>{
  const start=app.indexOf("  function syncSourceProgress(job) {");
  const end=app.indexOf("  async function loadSyntheticHome()",start);
  const {syncSourceProgress,syncSourceStatus}=new Function(app.slice(start,end)+";return {syncSourceProgress,syncSourceStatus};")();
  assert.equal(syncSourceProgress({state:"running",completed:43,total:44}),null);
  assert.match(syncSourceStatus({state:"running",completed:43,total:44}),/progresso por fonte indisponível/);
  assert.match(syncSourceStatus({state:"completed",total:44}),/confirmação individual das fontes indisponível/);
  assert.match(syncSourceStatus({state:"completed",total:2,sources:{
    a:{complete:true},b:{complete:true}
  }}),/Carga concluída: 2 de 2 fontes carregadas com sucesso/);
  assert.doesNotMatch(app,/job\.completed\+' de '\+job\.total\+' fontes concluídas/);
});

test("public sync status reports successes separately from processed terminal errors",()=>{
  const worker=fs.readFileSync(path.join(__dirname,"../backend/worker.js"),"utf8");
  const start=worker.indexOf("function publicSyncJob(job){");
  const end=worker.indexOf("\nfunction syncErrorCode(",start);
  assert.ok(start>=0 && end>start,"public sync serializer exists");
  const publicSyncJob=new Function(worker.slice(start,end)+";return publicSyncJob;")();
  const serialized=publicSyncJob({state:"running",completed:3,total:4,sources:{
    a:{complete:true},b:{complete:true},c:{error:"BETHA_HTTP_401"},d:{complete:false}
  }});
  assert.equal(serialized.completed,3,"legacy processed count remains backwards compatible");
  assert.equal(serialized.successfulSources,2);
  assert.equal(serialized.failedSources,1);
  assert.equal(serialized.pendingSources,1);
  assert.equal(Object.hasOwn(serialized,"sources"),false,"private source entries must not leak");
  const missing=publicSyncJob({state:"running",completed:43,total:44});
  assert.equal(missing.successfulSources,null,"missing detail is not zero successes");
  assert.equal(missing.failedSources,null);
  assert.equal(missing.pendingSources,null);
});

test("public aggregate counts are used only when valid and consistent",()=>{
  const start=app.indexOf("  function syncSourceProgress(job) {");
  const end=app.indexOf("  async function loadSyntheticHome()",start);
  const {syncSourceProgress,syncSourceStatus}=new Function(app.slice(start,end)+";return {syncSourceProgress,syncSourceStatus};")();
  const aggregate={state:"running",total:44,completed:43,successfulSources:39,failedSources:4,pendingSources:1};
  assert.deepEqual(syncSourceProgress(aggregate),{succeeded:39,failed:4,pending:1,total:44});
  assert.match(syncSourceStatus(aggregate),/39 de 44 fontes carregadas com sucesso/);
  assert.match(syncSourceStatus(aggregate),/4 com erro/);
  assert.match(syncSourceStatus(aggregate),/1 pendente/);
  assert.equal(syncSourceProgress({...aggregate,successfulSources:null}),null);
  assert.equal(syncSourceProgress({...aggregate,pendingSources:0}),null);
});
