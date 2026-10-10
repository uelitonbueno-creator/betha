/* node --test tests/multisystem-recovery.test.cjs */
"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {pathToFileURL}=require("node:url");

const helper=()=>import(pathToFileURL(path.join(__dirname,"../backend/multisystem-recovery.mjs")).href);
function scenario(archived,starting=null){
  let summary=starting?{...starting}:null,resetCount=0,reads=[],writes=[];
  const adapters={
    readPage:async page=>{reads.push(page);return archived[page]??null;},
    resetSummary:async()=>{resetCount++;summary={count:0,lastPage:-1};},
    applyPage:async(page,rows)=>{writes.push(page);summary.count+=rows.length;summary.lastPage=page;}
  };
  return {adapters,summary:()=>summary,reads,writes,resets:()=>resetCount};
}

test("reuses a complete summary without touching R2",async()=>{
  const {reconcileArchivedPages}=await helper();
  const data=scenario([], {count:200,lastPage:1});
  const result=await reconcileArchivedPages({
    loaded:200,pages:2,summary:data.summary(),...data.adapters
  });
  assert.deepEqual(result,{complete:true,replayed:0});
  assert.deepEqual(data.reads,[]);
  assert.equal(data.resets(),0);
});

test("backfills archived pages in bounded ticks, resuming after last committed page",async()=>{
  const {reconcileArchivedPages}=await helper();
  const data=scenario([Array(100).fill({}),Array(100).fill({}),Array(100).fill({})]);
  const first=await reconcileArchivedPages({
    loaded:300,pages:3,summary:data.summary(),...data.adapters,batchSize:2
  });
  assert.deepEqual(first,{complete:false,replayed:2});
  assert.equal(data.summary().count,200);
  const second=await reconcileArchivedPages({
    loaded:300,pages:3,summary:data.summary(),...data.adapters,batchSize:2
  });
  assert.deepEqual(second,{complete:true,replayed:1});
  assert.equal(data.summary().count,300);
  assert.deepEqual(data.reads,[0,1,2]);
  assert.equal(data.resets(),1);
});

test("an interrupted backfill resumes without resetting the partial total",async()=>{
  const {reconcileArchivedPages}=await helper();
  const data=scenario([null,Array(100).fill({}),Array(100).fill({})],{count:100,lastPage:0});
  const result=await reconcileArchivedPages({
    loaded:300,pages:3,summary:data.summary(),...data.adapters
  });
  assert.equal(result.complete,true);
  assert.deepEqual(data.reads,[1,2]);
  assert.equal(data.resets(),0);
  assert.equal(data.summary().count,300);
});

test("an inconsistent finished total rebuilds summary only, never the load offset",async()=>{
  const {reconcileArchivedPages}=await helper();
  const data=scenario([Array(100).fill({}),Array(100).fill({})],{count:10,lastPage:1});
  await reconcileArchivedPages({
    loaded:200,pages:2,summary:data.summary(),...data.adapters
  });
  assert.equal(data.resets(),1);
  assert.equal(data.summary().count,200);
  assert.deepEqual(data.reads,[0,1]);
});

test("missing archived page fails safely instead of inventing totals",async()=>{
  const {reconcileArchivedPages}=await helper();
  const data=scenario([Array(100).fill({}),null],null);
  await assert.rejects(
    ()=>reconcileArchivedPages({loaded:200,pages:2,summary:null,...data.adapters}),
    /MULTISYSTEM_ARCHIVED_PAGE_MISSING/
  );
  assert.equal(data.summary().count,100);
  assert.deepEqual(data.writes,[0]);
});

test("archive count and checkpoint inconsistencies are rejected",async()=>{
  const {reconcileArchivedPages}=await helper();
  const data=scenario([Array(30).fill({})]);
  await assert.rejects(
    ()=>reconcileArchivedPages({loaded:100,pages:1,summary:null,...data.adapters}),
    /MULTISYSTEM_ARCHIVE_COUNT_MISMATCH/
  );
  await assert.rejects(
    ()=>reconcileArchivedPages({loaded:100,pages:0,summary:null,...data.adapters}),
    /MULTISYSTEM_CHECKPOINT_INVALID/
  );
});

test("Worker never rewinds the source after field discovery or missing summary",()=>{
  const worker=fs.readFileSync(path.join(__dirname,"../backend/worker.js"),"utf8");
  const body=worker.slice(worker.indexOf("async function advanceMultiSystem("),worker.indexOf("async function runMultiSystemBootstrap("));
  assert.match(body,/reconcileArchivedPages\(/);
  assert.doesNotMatch(body,/shouldRestart|SET status='running',loaded=0,pages=0/);
  assert.match(body,/previous\?\.object_key\|\|multiSystemResourcePrefix/);
});

test("load diagnostics require both tenant authorization and BI admin rights",()=>{
  const worker=fs.readFileSync(path.join(__dirname,"../backend/worker.js"),"utf8");
  const a=worker.indexOf("if(url.pathname==='/api/admin/multisystem-loads'");
  const b=worker.indexOf("if(url.pathname==='/api/admin/sync'",a);
  assert.ok(a>0&&b>a);
  const scope=worker.slice(a,b);
  assert.match(scope,/resolveTenant\(env,getTenantId\(request,url\)\)/);
  assert.match(scope,/authorizeTenant\(request,env,tenant\)/);
  assert.match(scope,/requireTenantConfigAdmin\(auth\)/);
  assert.match(scope,/WHERE tenant_id=\?1/);
  assert.match(scope,/Cache-Control","no-store"/);
  assert.doesNotMatch(scope,/accessToken|userAccess|objectKey/);
});
