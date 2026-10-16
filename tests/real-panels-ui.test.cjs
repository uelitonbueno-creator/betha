const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const app=fs.readFileSync('app.js','utf8');
test('all three system homes request real data before fallback',()=>{
 const line=app.split('\n').find(line=>line.includes('const REAL_MULTI_SYSTEM_HOME_VIEWS'));
 const views=vm.runInNewContext(line.replace('const REAL_MULTI_SYSTEM_HOME_VIEWS =',''));
 for(const view of ['contabil-visao-geral','compras-visao-geral','folha-visao-geral']) assert.ok(views.has(view));
});
test('attention metrics distinguish unavailable money from validated zero',()=>{
 const start=app.indexOf('  function attentionMetric(');
 const end=app.indexOf('\n  function ',start+10);
 const metric=vm.runInNewContext(app.slice(start,end)+';attentionMetric');
 for(const value of [null,undefined,'']) assert.ok(Number.isNaN(metric(value)));
 assert.equal(metric(0),0);assert.equal(metric(123.45),123.45);
 const attention=app.slice(app.indexOf('  function renderOverviewAttention('),app.indexOf('  function sourceKeyCandidates('));
 assert.doesNotMatch(attention,/Number\(kpis\./);
});
test('accounting uses all persisted sources without inventing financial metrics',async()=>{
 const source=fs.readFileSync('backend/worker.js','utf8');
 const start=source.indexOf('async function buildAccountingDashboard(');
 const end=source.indexOf('async function buildProcurementDashboard(',start);
 const fixtures={empenhos:{resource:'empenhos',count:3,monthly:{'2026-01':10},groups:{},loadStatus:'complete'},'movimentacoes-receitas':{resource:'movimentacoes-receitas',count:7,loadStatus:'running'},'movimentacoes-despesas':{resource:'movimentacoes-despesas',count:11,loadStatus:'running'},credores:{resource:'credores',count:5,loadStatus:'complete'}};
 const fn=vm.runInNewContext(source.slice(start,end)+';buildAccountingDashboard',{
 getMultiSystemSummary:async(env,tenant,system,resource)=>{assert.equal(tenant,'paulafreitas');return fixtures[resource]},
 multiSystemMonthlyEntries:s=>Object.entries(s.monthly),multiSystemSortedEntries:()=>[],multiSystemMonthLabel:k=>k,
 multiSystemRealMeta:(system,items,extra)=>({sources:items.map(x=>x.resource),...extra})
 });
 const result=await fn({}, {id:'paulafreitas'},new URL('https://example.test/?exercicio=2026'));
 assert.equal(result.kpis.empenhado,10);assert.equal(result.kpis.credores,5);
 for(const key of ['pago','liquidado','arrecadado'])assert.equal(result.kpis[key],null);
 assert.equal(result.meta.sources.length,4);assert.equal(result.tables[0].rows.length,4);
});

test('tables do not turn unavailable or incomplete tributary chart placeholders into money',()=>{
 assert.match(app,/\["error","unavailable","partial"\]\.includes\(state.kind\)/);
});
test('persisted overview is read-only and requires the ordinary tenant permission',()=>{
 const worker=fs.readFileSync('backend/worker.js','utf8');
 const start=worker.indexOf('async function buildPersistedTributaryOverview('),end=worker.indexOf('async function buildOverviewDashboard(',start);
 const body=worker.slice(start,end);
 assert.match(body,/SELECT payload FROM bi_durable_kv WHERE cache_key=\?1/);assert.match(body,/readOnly:true/);
 assert.doesNotMatch(body,/fetchBethaRows|advanceSync|beginSync|\.put\(|\.run\(/);
 assert.match(worker,/requireViewPermission\(auth,view\)/);
 assert.match(app,/if\(view===\"visao-geral\"\)params.set\(\"persisted\",\"1\"\)/);
});
test('persisted overview reads exact D1 scope when KV metadata is absent',async()=>{
 const worker=fs.readFileSync('backend/worker.js','utf8');const start=worker.indexOf('async function buildPersistedTributaryOverview('),end=worker.indexOf('async function buildOverviewDashboard(',start);
 const jobId='1fd2b449-ffe0-440d-9c1c-df6f219b17e0';
 const records={'scope:config':{activeJob:jobId},['scope:job:'+jobId]:{startedAt:'2026-10-01T00:00:00Z',sources:{'bi:contribuintes':{loaded:5865,pages:6,complete:true}}}};
 const env={AUTH_DB:{prepare(sql){return {bind(key){assert.ok(key.startsWith('scope:'));return {first:async()=>sql.includes('SELECT updated_at')?{updated_at:'2026-10-16T19:00:00Z'}:records[key]?{payload:JSON.stringify(records[key])}:null}}}}},BI_SESSIONS:{get:async()=>null}};
 const fn=vm.runInNewContext(worker.slice(start,end)+';buildPersistedTributaryOverview',{syncScope:async()=>'scope',sha256Hex:async()=> 'unused'});
 const result=await fn(env,{id:'paulafreitas'},new URL('https://example.test/?periodo=ano&exercicio=2026'));
 assert.equal(result.kpis.contribuintes,5865);assert.equal(result.kpis.arrecadado,null);assert.equal(result.meta.sourceJobId,jobId);assert.equal(result.meta.updatedAt,'2026-10-16T19:00:00Z');
});
test('accounting schema inspector requires configuration admin and returns types only',()=>{
 const worker=fs.readFileSync('backend/worker.js','utf8');const start=worker.indexOf('async function inspectAccountingFields('),end=worker.indexOf('async function runMultiSystemBootstrap(',start);const code=worker.slice(start,end);
 assert.match(code,/source,0,1,\[\]/);assert.match(code,/fields.push\(\{path,type:/);assert.doesNotMatch(code,/rows:page.rows|\.put\(|UPDATE bi_multisystem/);
 assert.match(worker,/requireTenantConfigAdmin\(auth\);\s*if\(url.searchParams.get\("inspect"\)===\"contabil\"\)/);
});
test('real dashboard CSV uses actual payload provenance even on a sample-capable screen',()=>{
 const start=app.indexOf('  function exportDashboardDelimited('),end=app.indexOf('  async function fetchDetailExport(',start);
 const code=app.slice(start,end);let exported='';
 const context={currentPayload:{meta:{realData:true,sampleMode:false,dataMode:'real-partial',updatedAt:'2026-10-16'}},dashboards:{'folha-visao-geral':{localSample:true,title:'Folha'}},currentView:'folha-visao-geral',currentSystemId:'folha',entityLabel:'Paula Freitas',tenantId:'paulafreitas',showToast:()=>{},dashboardExportRows:()=>[{tipo:'Indicador',item:'Bruto',valor:'—',fonte:'BETHA'}],exportContextLabel:()=>({summary:'2026'}),currentSystemInfo:()=>({name:'Folha'}),csvEscape:value=>String(value??''),safeFilePart:v=>v,downloadBlob:text=>{exported=text},document:{getElementById:()=>({})}};
 const fn=vm.runInNewContext(code+';exportDashboardDelimited',context);fn(';','csv');
 assert.match(exported,/DADOS REAIS PARCIAIS/);assert.doesNotMatch(exported,/AMOSTRA LOCAL|DADOS DE TESTE/);assert.match(exported,/Atualização da fonte;2026-10-16/);
});
test('legacy tributary keys keep current tenant and service credentials and do not scan the store',async()=>{
 const worker=fs.readFileSync('backend/worker.js','utf8');const start=worker.indexOf('async function buildPersistedTributaryOverview('),end=worker.indexOf('async function buildOverviewDashboard(',start);
 const tenant={id:'paulafreitas',entityId:'1158',databaseId:'656',userAccess:'fixture-service',accessToken:'fixture-token'};const jobId='1fd2b449-ffe0-440d-9c1c-df6f219b17e0';
 const records={'bi-sync:v1:legacy:config':{activeJob:jobId},['bi-sync:v1:legacy:job:'+jobId]:{sources:{'bi:imoveis':{loaded:2098,complete:true}}}};
 const env={AUTH_DB:{prepare(sql){assert.match(sql,/WHERE cache_key=\?1/);return {bind(key){return {first:async()=>sql.includes('SELECT updated_at')?{updated_at:'2026-10-16'}:records[key]?{payload:JSON.stringify(records[key])}:null}}}}},BI_SESSIONS:{get:async()=>null}};
 const fn=vm.runInNewContext(worker.slice(start,end)+';buildPersistedTributaryOverview',{syncScope:async()=>'bi-sync:v1:current',sha256Hex:async text=>{const args=JSON.parse(text);assert.equal(args[0],tenant.id);assert.equal(args[3],tenant.userAccess);assert.equal(args[4],tenant.accessToken);return args[1]===null&&args[2]===null?'legacy':'current'}});
 const result=await fn(env,tenant,new URL('https://example.test/'));assert.equal(result.meta.scopeCompatibility,'legacy-context-same-credentials');assert.equal(result.kpis.imoveis,2098);
});
test('validated accounting fields enrich future pages without rewinding historical loads',()=>{
 const worker=fs.readFileSync('backend/worker.js','utf8');
 assert.match(worker,/validatedAdditionalFields:\["dataMovimentacao","valorArrecadado"\]/);
 const start=worker.indexOf('async function loadMultiSystemIncrementalResource('),end=worker.indexOf('function multiSystemStateNeedsWork(',start);const code=worker.slice(start,end);
 assert.match(code,/source.validatedAdditionalFields/);assert.match(code,/Math.max\(0,Number\(state\?\.loaded\)\|\|0\)/);assert.doesNotMatch(code,/resetMultiSystemSummary|DELETE FROM/);
});
