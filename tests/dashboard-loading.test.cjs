const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {webcrypto} = require('node:crypto');

function workerHarness(pageResponse) {
  const values = new Map();
  let requests = 0;
  const context = vm.createContext({
    URL, URLSearchParams, Response, Headers, Request, TextEncoder, TextDecoder,
    AbortController, crypto:webcrypto, setTimeout, clearTimeout,
    console:{warn() {}},
    fetch:async (url) => {
      requests++;
      return pageResponse(new URL(url));
    }
  });
  const source = fs.readFileSync('backend/worker.js','utf8').replace('export default {','const worker = {');
  vm.runInContext(source,context);
  const kv = {
    get:async (key) => values.has(key) ? JSON.parse(values.get(key)) : null,
    put:async (key,value,options) => {
      assert.equal(options.expirationTtl,3600);
      values.set(key,value);
    }
  };
  const tenant = {id:'test',name:'Test',accessToken:'test-token',userAccess:'test-access'};
  function env(prefix,expected={}) {
    return {BI_SESSIONS:kv,BI_DASHBOARD_LOAD:{prefix,expected,cursors:{},hasMore:false,pending:new Map()}};
  }
  return {context,values,tenant,env,requests:()=>requests};
}

function pagedRows(total) {
  return url => {
    const offset=Number(url.searchParams.get('offset'));
    const limit=Number(url.searchParams.get('limit'));
    const count=Math.max(0,Math.min(limit,total-offset));
    const content=Array.from({length:count},(_,i)=>({id:offset+i+1,nome:'Registro',situacao:'ABERTO',vlLancado:10}));
    return new Response(JSON.stringify({content,total,offset,limit,hasNext:offset+count<total}));
  };
}

test('three batches recalculate totals, resume offsets and reuse complete sources',async () => {
  const h=workerHarness(pagedRows(501));
  let expected={};
  let result;
  for (const [index,count] of [250,500,501].entries()) {
    const env=h.env('tenant-A:load-1',expected);
    result=await h.context.safeBethaRows(env,h.tenant,'bi','contribuintes');
    assert.equal(result.loaded,count);
    assert.equal(result.complete,index===2);
    assert.equal(result.hasMore,index!==2);
    expected=env.BI_DASHBOARD_LOAD.cursors;
  }
  assert.equal(result.total,501);
  assert.equal(h.requests(),3);
  await h.context.safeBethaRows(h.env('tenant-A:load-1',expected),h.tenant,'bi','contribuintes');
  assert.equal(h.requests(),3);
});

test('blocks cross the 20-page boundary without losing records',async () => {
  const h=workerHarness(pagedRows(5001));
  let expected={};
  let result;
  for (let i=0;i<21;i++) {
    const env=h.env('tenant-A:large',expected);
    result=await h.context.safeBethaRows(env,h.tenant,'bi','contribuintes');
    expected=env.BI_DASHBOARD_LOAD.cursors;
  }
  assert.equal(result.loaded,5001);
  assert.equal(result.complete,true);
  assert.equal([...h.values.keys()].filter(key=>key.includes(':block:')).length,2);
});

test('tenant scopes isolate cached rows; stale KV cursors are retryable',async () => {
  const h=workerHarness(pagedRows(251));
  await h.context.safeBethaRows(h.env('tenant-A:load'),h.tenant,'bi','contribuintes');
  await assert.rejects(h.context.safeBethaRows(h.env('tenant-B:load',{'bi:contribuintes':1}),h.tenant,'bi','contribuintes'),/DASHBOARD_BATCH_PENDING/);
  const b=await h.context.safeBethaRows(h.env('tenant-B:load'),h.tenant,'bi','contribuintes');
  assert.equal(b.loaded,250);
  assert.equal(h.requests(),2);
});

test('a repeated API page stops pagination and never doubles totals',async () => {
  const h=workerHarness(() => new Response(JSON.stringify({content:[{id:1}],limit:1,hasNext:true})));
  const env=h.env('repeat');
  await h.context.safeBethaRows(env,h.tenant,'bi','contribuintes');
  const result=await h.context.safeBethaRows(h.env('repeat',env.BI_DASHBOARD_LOAD.cursors),h.tenant,'bi','contribuintes');
  assert.equal(result.loaded,1);
  assert.equal(result.complete,false);
  assert.equal(result.truncated,true);
  assert.equal(result.hasMore,false);
});

test('a failed source preserves previous rows and remains partial',async () => {
  let failing=false;
  const page=pagedRows(251);
  const h=workerHarness(url=>failing?new Response('{}',{status:403}):page(url));
  const env=h.env('failure');
  await h.context.safeBethaRows(env,h.tenant,'bi','contribuintes');
  failing=true;
  const result=await h.context.safeBethaRows(h.env('failure',env.BI_DASHBOARD_LOAD.cursors),h.tenant,'bi','contribuintes');
  assert.equal(result.loaded,250);
  assert.equal(result.complete,false);
  assert.equal(result.errorStatus,403);
  assert.equal(result.hasMore,false);
});

test('every secondary dashboard builds with progressive source loading',async () => {
  const h=workerHarness(pagedRows(0));
  const catalogContext={window:{}};
  vm.runInNewContext(fs.readFileSync('dashboard-catalog.js','utf8'),catalogContext);
  const views=Object.keys(catalogContext.window.BI_DASHBOARDS).filter(view=>view!=='visao-geral');
  assert.equal(views.length,15);
  for (const view of views) {
    const env=h.env('catalog:'+view);
    const builder=h.context.dashboardBuilder(view);
    assert.ok(builder,view);
    const payload=await builder(env,h.tenant,new URL('https://test/api/dashboard/'+view+'?exercicio=2026'));
    assert.equal(payload.view,view);
    assert.ok(payload.meta.sourceAudit,view);
    assert.equal(env.BI_DASHBOARD_LOAD.hasMore,false,view);
  }
});

test('completeness reports percentages and handles an empty source',()=>{
  const h=workerHarness(pagedRows(0));
  const fields=[{label:'E-mail',paths:['email']},{label:'Telefone',paths:['telefone']}];
  const chart=h.context.completenessChart([{id:1,email:'a@test'},{id:2,email:' ',telefone:'123'}],fields);
  assert.deepEqual(Array.from(chart.datasets[0].data),[50,50]);
  assert.deepEqual(Array.from(h.context.completenessChart([],fields).datasets[0].data),[0,0]);
});

function clientHarness(responses,isActive) {
  const rendered=[];
  const saved=[];
  const calls=[];
  const context=vm.createContext({
    crypto:webcrypto,URLSearchParams,
    setTimeout:callback=>{callback();return 1;},
    api:async (path)=>{calls.push(path);return responses.shift();},
    renderPayload:payload=>rendered.push(payload),
    saveDashboardCache:(view,payload,state)=>saved.push(state),setStatus() {},isActive
  });
  const source=fs.readFileSync('app.js','utf8');
  vm.runInContext(source.slice(source.indexOf('  async function loadDashboardProgressively'),source.indexOf('  async function loadDashboardData')),context);
  return {context,rendered,saved,calls};
}

test('client replaces cumulative payloads and marks incomplete data as partial',async () => {
  const partial={meta:{sourceAudit:{contribuintes:{loaded:250,complete:false}}},loading:{hasMore:true,cursor:{'bi:contribuintes':1}}};
  const complete={meta:{sourceAudit:{contribuintes:{loaded:251,complete:true}}},loading:{hasMore:false}};
  const h=clientHarness([partial,complete],()=>true);
  const result=await h.context.loadDashboardProgressively('contribuintes',new URLSearchParams(),()=>true);
  assert.equal(result,complete);
  assert.deepEqual(h.saved,['partial','complete']);
  assert.equal(new URL('https://test'+h.calls[1]).searchParams.get('cursor'),JSON.stringify(partial.loading.cursor));
});

test('client ignores a response after navigation or filter changes',async () => {
  let active=true;
  const h=clientHarness([],()=>active);
  h.context.api=async ()=>{active=false;return {meta:{sourceAudit:{}},loading:{hasMore:false}};};
  const result=await h.context.loadDashboardProgressively('obras',new URLSearchParams(),()=>active);
  assert.equal(result,null);
  assert.equal(h.rendered.length,0);
  assert.equal(h.saved.length,0);
});
