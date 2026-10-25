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
test('provenance fallback recovers only the same tenant and entity after credential rotation',async()=>{
 const {DatabaseSync}=require('node:sqlite');const db=new DatabaseSync(':memory:');
 db.exec('CREATE TABLE bi_durable_kv(cache_key TEXT PRIMARY KEY,payload TEXT,updated_at TEXT)');
 const add=(scope,provenance,count,stamp)=>db.prepare('INSERT INTO bi_durable_kv VALUES (?,?,?)').run(scope+':job:11111111-1111-1111-1111-111111111111',JSON.stringify({id:'11111111-1111-1111-1111-111111111111',provenance,sources:{'bi:imoveis':{loaded:count,complete:true}}}),stamp);
 add('bi-sync:v1:valid',{tenantId:'paulafreitas',entityId:'1158',databaseId:'656'},20,'2026-10-01');
 add('bi-sync:v1:other-tenant',{tenantId:'other',entityId:'1158',databaseId:'656'},999,'2026-10-03');
 add('bi-sync:v1:other-entity',{tenantId:'paulafreitas',entityId:'999',databaseId:'656'},888,'2026-10-04');
 const worker=fs.readFileSync('backend/worker.js','utf8'),start=worker.indexOf('async function buildPersistedTributaryOverview('),end=worker.indexOf('async function buildOverviewDashboard(',start);
 const fn=vm.runInNewContext(worker.slice(start,end)+';buildPersistedTributaryOverview',{syncScope:async()=>'bi-sync:v1:new-credentials',sha256Hex:async()=>'absent',parseJsonObject:()=>({})});
 const env={AUTH_DB:{prepare(sql){return {bind(...args){return {first:async()=>db.prepare(sql).get(...args)}}}}}};
 const result=await fn(env,{id:'paulafreitas'},new URL('https://example.test/'),{context:{entity:'1158',database:'656'}});
 assert.equal(result.kpis.imoveis,20);assert.equal(result.meta.readOnly,true);
 db.exec("DELETE FROM bi_durable_kv WHERE cache_key LIKE 'bi-sync:v1:valid:%'");
 await assert.rejects(()=>fn(env,{id:'paulafreitas'},new URL('https://example.test/'),{context:{entity:'1158',database:'656'}}),/INITIAL_LOAD_REQUIRED/);
 db.close();
});

test('payroll competence coverage flags future months and rejects invalid dates',()=>{
 const source=fs.readFileSync('backend/worker.js','utf8');
 const start=source.indexOf('async function buildPayrollDashboard(');
 const end=source.indexOf('async function buildPayrollSampleDashboard(',start);
 assert.ok(start>=0&&end>start,'real payroll dashboard builder exists');
 const builder=source.slice(start,end);
 assert.match(builder,/competenceCoverage,/);
 assert.match(builder,/sourceCompleteness:"not-verified"/);
 const match=builder.match(/futureCompetence:([^\n]+),\n\s+sourceCompleteness:"not-verified"/);
 assert.ok(match,'future competence expression exists');
 const evaluate=competence=>vm.runInNewContext(match[1],{row:{competence}});
 assert.equal(evaluate('9999-12'),true);
 assert.equal(evaluate('2000-01'),false);
 assert.equal(evaluate('2026-13'),false);
 assert.equal(evaluate('invalid'),false);
});


test('real chart accepts legitimate zero but rejects null, undefined and NaN',()=>{
 const start=app.indexOf('      const hasData=chartData &&');
 const end=app.indexOf(';\n      if (hasData)',start);
 assert.ok(start>=0&&end>start,'chart data detector exists');
 const expression=app.slice(start+'      const hasData='.length,end);
 const hasData=(data)=>Boolean(vm.runInNewContext(expression,{chartData:data,chartDef:{apiPanel:false}}));
 for(const value of [0,'0',12.5])assert.equal(hasData({labels:['Jan'],datasets:[{data:[value]}]}),true);
 for(const value of [null,undefined,NaN,Infinity,'', '   ',false])assert.equal(hasData({labels:['Jan'],datasets:[{data:[value]}]}),false);
});

test('real dashboard refresh errors take precedence over missing indicators',()=>{
 const start=app.indexOf('  function renderChartEmptyState(');
 const end=app.indexOf('  function summaryCellDisplay(',start);
 assert.ok(start>=0&&end>start,'chart empty state renderer exists');
 const strong={textContent:''},span={textContent:''};
 const empty={hidden:true,querySelector:selector=>selector==='strong'?strong:span};
 const card={querySelector:()=>empty};
 const context={document:{querySelector:()=>card},cssEscape:x=>x,
   chartSourceState:()=>({kind:'loaded',detail:'loaded'}),displayChartDefinition:x=>x,
   friendlySourceErrorDetail:()=> 'HTTP 500',hasRecentLoadActivity:()=>false};
 const render=vm.runInNewContext(app.slice(start,end)+';renderChartEmptyState',context);
 render({id:'receita-mensal',source:'contabil',apiPanel:false},{meta:{realData:true,refreshError:'HTTP 500'},charts:{}});
 assert.equal(strong.textContent,'Resumo não atualizado');
 assert.equal(span.textContent,'HTTP 500');
 render({id:'receita-mensal',source:'contabil',apiPanel:false},{meta:{realData:true},charts:{}});
 assert.equal(strong.textContent,'Indisponível — aguardando validação');
});

test('ingestion completion is not indicator validation',()=>{
 const start=app.indexOf('  function realSourceValidationStatus(');
 const end=app.indexOf('  function renderSourceProvenance(',start);
 assert.ok(start>=0&&end>start,'source validation status helper exists');
 const status=vm.runInNewContext(app.slice(start,end)+';realSourceValidationStatus');
 const complete=status({realSources:[{status:'complete'}],unavailableMetrics:['pago','arrecadado']});
 assert.equal(complete.ingestion,'CONCLUÍDA (ingestão)');
 assert.equal(complete.indicators,'PARCIAL (2 indisponíveis)');
 const partial=status({realSources:[{status:'partial'}]});
 assert.equal(partial.ingestion,'PARCIAL (ingestão)');
 assert.equal(partial.indicators,'NÃO COMPROVADA');
 const noEvidence=status({realSources:[{status:'complete'}]});
 assert.equal(noEvidence.indicators,'NÃO COMPROVADA');
 const sourceUI=app.slice(end,app.indexOf('  function formatValue(',end));
 assert.match(sourceUI,/validationStatus=realSourceValidationStatus/);
 assert.match(sourceUI,/escapeHtml\(validationStatus.ingestion\)/);
 assert.match(sourceUI,/escapeHtml\(validationStatus.indicators\)/);
});

test('accounting monthly table uses only validated D1 summary months and obeys filters',async()=>{
  const worker=fs.readFileSync('backend/worker.js','utf8');
  const helperStart=worker.indexOf('function multiSystemMonthlyEntries(');
  const helperEnd=worker.indexOf('function multiSystemRealMeta(',helperStart);
  const start=worker.indexOf('async function buildAccountingDashboard(');
  const end=worker.indexOf('async function buildProcurementDashboard(',start);
  assert.ok(helperStart>=0&&helperEnd>helperStart&&start>=0&&end>start);
  const fixtures={
    empenhos:{resource:'empenhos',count:5,loadStatus:'complete',groups:{},monthly:{'2026-01':10,'2026-02':20,'2026-13':900,'bad-key':500,'2026-03':null,'2026-04':'7'}},
    'movimentacoes-receitas':{resource:'movimentacoes-receitas',count:7,loadStatus:'complete'},
    'movimentacoes-despesas':{resource:'movimentacoes-despesas',count:10,loadStatus:'complete'},
    credores:{resource:'credores',count:3,loadStatus:'complete'}
  };
  const fn=vm.runInNewContext(worker.slice(helperStart,helperEnd)+'\n'+worker.slice(start,end)+'\n;buildAccountingDashboard',{
    getMultiSystemSummary:async(_env,tenant,system,resource)=>{
      assert.equal(tenant,'paulafreitas');assert.equal(system,'contabil');return fixtures[resource];
    },
    multiSystemSortedEntries:()=>[],
    multiSystemRealMeta:(_system,_items,extra)=>extra,
    buildAccountingSampleDashboard:()=>{throw Error('real data must not fall back to sample')}
  });
  const valid=await fn({}, {id:'paulafreitas',name:'Paula Freitas'},new URL('https://test.local/?periodo=ano&exercicio=2026'));
  const table=valid.tables.find(item=>item.id==='contabil-empenhos-mensais-reais');
  assert.ok(table);
  assert.equal(table.totalRows,2);
  assert.deepEqual(Array.from(table.rows,row=>row.values[0]),[10,20]);
  assert.deepEqual(Array.from(valid.charts['execucao-mensal'].datasets[0].data),[10,20]);
  assert.equal(valid.kpis.empenhado,30);
  const otherYear=await fn({}, {id:'paulafreitas'},new URL('https://test.local/?periodo=ano&exercicio=2025'));
  assert.equal(otherYear.kpis.empenhado,null);
  assert.equal(otherYear.tables.some(item=>item.id==='contabil-empenhos-mensais-reais'),false);
  const unsupported=await fn({}, {id:'paulafreitas'},new URL('https://test.local/?periodo=ano&exercicio=2026&unidade=123'));
  assert.equal(unsupported.kpis.empenhado,null);
  assert.equal(unsupported.tables.some(item=>item.id==='contabil-empenhos-mensais-reais'),false);
});
