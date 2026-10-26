const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const worker=fs.readFileSync('backend/worker.js','utf8');

test('real procurement situation chart is sourced from persisted summary',async()=>{
 const start=worker.indexOf('async function buildProcurementDashboard(');
 const end=worker.indexOf('async function buildAccountingSampleDashboard(',start);
 assert.ok(start>=0&&end>start);
 const summaries={
  'processos-administrativos':{resource:'processos-administrativos',count:10,loaded:10,pages:1,loadStatus:'complete',groups:{HOMOLOGADO:7,REVOGADO:3},secondaryGroups:{}},
  fornecedores:{resource:'fornecedores',count:5,loaded:5,pages:1,loadStatus:'complete'}
 };
 const fn=vm.runInNewContext(worker.slice(start,end)+';buildProcurementDashboard',{
  getMultiSystemSummary:async(_env,_tenant,_system,resource)=>summaries[resource],
  buildProcurementSampleDashboard:()=>{throw Error('real data must not fall back to sample')},
  multiSystemSortedEntries:values=>Object.entries(values||{}),
  multiSystemRealMeta:(_system,_items,extra)=>extra
 });
 const result=await fn({}, {id:'paulafreitas'},new URL('https://example.test/?exercicio=2026'));
 assert.deepEqual(Array.from(result.charts['compras-situacao'].labels),['HOMOLOGADO','REVOGADO']);
 assert.deepEqual(Array.from(result.charts['compras-situacao'].datasets[0].data),[7,3]);
 for(const key of ['estimado','homologado','economia'])assert.equal(result.kpis[key],null);
 const catalog=fs.readFileSync('system-catalog.js','utf8');
 assert.ok(catalog.includes('ch("compras-situacao","Processos por situação (histórico importado)"'));
});

test('financial KPIs remain unavailable before complete projections or without period data',()=>{
 assert.ok(worker.includes('const ready=Boolean(finance&&finance.state.status==="complete"&&!finance.state.error&&!unsupportedFilters.length);'));
 const start=worker.indexOf('const empenhado=hasPeriodData');
 const end=worker.indexOf('const creditors=',start);
 assert.ok(start>=0&&end>start);
 assert.ok(worker.slice(start,end).includes(': null;'));
});

test('procurement does not equate contracting form with bidding modality and declares historical scope',async()=>{
 const start=worker.indexOf('async function buildProcurementDashboard(');
 const end=worker.indexOf('async function buildAccountingSampleDashboard(',start);
 assert.ok(start>=0&&end>start);
 const summaries={
  'processos-administrativos':{resource:'processos-administrativos',count:2373,loaded:2373,loadStatus:'complete',groups:{HOMOLOGADO:2127,REVOGADO:246},secondaryGroups:{DIRETA:2373}},
  fornecedores:{resource:'fornecedores',count:9500,loaded:9500,loadStatus:'complete'}
 };
 const fn=vm.runInNewContext(worker.slice(start,end)+';buildProcurementDashboard',{
  getMultiSystemSummary:async(_env,_tenant,_system,resource)=>summaries[resource],
  buildProcurementSampleDashboard:()=>{throw Error('sample must not be used')},
  multiSystemSortedEntries:values=>Object.entries(values||{}),
  multiSystemRealMeta:(_system,_items,extra)=>extra
 });
 for(const year of [2021,2026]){
  const result=await fn({}, {id:'paulafreitas',name:'Paula Freitas'},new URL('https://example.test/?periodo=ano&exercicio='+year));
  assert.equal(result.kpis.processos,2373);
  assert.equal(result.charts['compras-modalidade'],undefined);
  assert.equal(result.charts['compras-situacao'].datasets[0].data.reduce((a,b)=>a+b,0),2373);
  assert.equal(result.meta.periodScope,'historical');
  assert.equal(result.meta.periodFilterApplied,false);
  assert.deepEqual(Array.from(result.meta.unsupportedFilters),['periodo','exercicio']);
  for(const key of ['estimado','homologado','economia'])assert.equal(result.kpis[key],null);
 }
});

test('procurement frontend labels unfiltered historical results',()=>{
 const app=fs.readFileSync('app.js','utf8');
 assert.match(app,/periodScope==="historical"&&payload\?\.meta\?\.periodFilterApplied===false/);
 assert.match(app,/HISTÓRICO COMPLETO — filtro não aplicado/);
 assert.doesNotMatch(worker.slice(worker.indexOf('async function buildProcurementDashboard('),worker.indexOf('async function buildAccountingSampleDashboard(')),/charts\["compras-modalidade"\]/);
});


test('real procurement reports all ignored filters without leaking values',async()=>{
 const start=worker.indexOf('async function buildProcurementDashboard(');
 const end=worker.indexOf('async function buildAccountingSampleDashboard(',start);
 const summaries={
  'processos-administrativos':{resource:'processos-administrativos',count:2,loaded:2,loadStatus:'complete',groups:{HOMOLOGADO:2},secondaryGroups:{}},
  fornecedores:{resource:'fornecedores',count:1,loaded:1,loadStatus:'complete'}
 };
 const fn=vm.runInNewContext(worker.slice(start,end)+';buildProcurementDashboard',{
  getMultiSystemSummary:async(_env,_tenant,_system,resource)=>summaries[resource],
  buildProcurementSampleDashboard:()=>{throw Error('unexpected sample')},
  multiSystemSortedEntries:values=>Object.entries(values||{}),
  multiSystemRealMeta:(_system,_items,extra)=>extra
 });
 const url=new URL('https://example.test/?tenant=paulafreitas&periodo=ano&exercicio=2026&unidade=123&fonte=propria');
 const result=await fn({}, {id:'paulafreitas'},url);
 assert.deepEqual(Array.from(result.meta.unsupportedFilters),['periodo','exercicio','unidade','fonte']);
 assert.equal(result.meta.periodFilterApplied,false);
 assert.equal(result.kpis.estimado,null);
 const app=fs.readFileSync('app.js','utf8');
 assert.ok(app.includes('FILTROS IGNORADOS'));
 assert.ok(app.includes('escapeHtml(ignoredFilters.join(", "))'));
});

test('procurement aggregation never uses object descriptions as month keys',async()=>{
 const start=worker.indexOf('function multiSystemSimpleValue(');
 const end=worker.indexOf('async function getMultiSystemSummary(',start);
 assert.ok(start>=0&&end>start);
 const update=vm.runInNewContext(worker.slice(start,end)+';updateMultiSystemSummary');
 let saved=null;
 const db={prepare(sql){return {bind(...args){return {
  async first(){return null;},
  async run(){if(sql.startsWith('INSERT'))saved=JSON.parse(args[3]);}
 };}}}};
 await update({AUTH_DB:db},{id:'paulafreitas'},'compras',{resource:'processos-administrativos'},0,[
  {id:1,objeto:'PNEUS ESCOLARES',situacao:'HOMOLOGADO',formaContratacao:'DIRETA'},
  {id:2,objeto:'ALIMENTOS',situacao:'REVOGADO',data:'2026-10-12'},
  {id:3,objeto:'MATERIAL',situacao:'HOMOLOGADO',data:'31/12/2025'},
  {id:4,objeto:'SERVIÇOS',situacao:'HOMOLOGADO',data:'sem data válida'}
 ]);
 assert.equal(saved.count,4);
 assert.equal(saved.groups.HOMOLOGADO,3);
 assert.deepEqual(Object.keys(saved.monthly).sort(),['2025-12','2026-10']);
 assert.equal(saved.monthly['2025-12'],1);
 assert.equal(saved.monthly['2026-10'],1);
 assert.equal(saved.monthly['PNEUS ESCOLARES'],undefined);
});

test('accounting ignores no unsupported dimensions silently',async()=>{
 const start=worker.indexOf('async function buildAccountingDashboard('),end=worker.indexOf('async function buildProcurementDashboard(',start);
 const summaries={empenhos:{resource:'empenhos',count:2,loaded:2,loadStatus:'complete',monthly:{'2026-01':100,'2026-02':200},groups:{'Credor A':300}},'movimentacoes-receitas':{resource:'movimentacoes-receitas',count:1,loaded:1,loadStatus:'complete'},'movimentacoes-despesas':{resource:'movimentacoes-despesas',count:1,loaded:1,loadStatus:'complete'},credores:{resource:'credores',count:2,loaded:2,loadStatus:'complete'}};
 const fn=vm.runInNewContext(worker.slice(start,end)+';buildAccountingDashboard',{getMultiSystemSummary:async(_e,_t,_s,r)=>summaries[r],buildAccountingSampleDashboard:()=>{throw Error('sample')},multiSystemMonthlyEntries:(s,p,y)=>Object.entries(s.monthly||{}).filter(([k])=>p==='todos'||k.startsWith(String(y)+'-')),multiSystemMonthLabel:k=>k,multiSystemSortedEntries:o=>Object.entries(o||{}),multiSystemRealMeta:(_s,_a,e)=>e});
 const url='https://example.test/?tenant=paulafreitas&periodo=ano&exercicio=2026';
 const valid=await fn({},{id:'paulafreitas'},new URL(url));
 assert.equal(valid.kpis.empenhado,300);
 assert.equal(valid.charts['execucao-mensal'].labels.length,2);
 const filtered=await fn({},{id:'paulafreitas'},new URL(url+'&unidade=123&fonte=propria'));
 assert.equal(filtered.kpis.empenhado,null);
 assert.equal(filtered.charts['execucao-mensal'].labels.length,0);
 assert.deepEqual(Array.from(filtered.meta.unsupportedFilters),['unidade','fonte']);
 assert.equal(filtered.meta.periodScope,'mixed');
 assert.equal(filtered.meta.periodFilterApplied,false);
 assert.equal(filtered.kpis.credores,2);
 assert.equal((await fn({},{id:'paulafreitas'},new URL('https://example.test/?exercicio=2027'))).kpis.empenhado,null);
 assert.ok(fs.readFileSync('app.js','utf8').includes('const ignoredFilters=Array.isArray(payload?.meta?.unsupportedFilters)'));
});

test('group chart helper preserves true zero and rejects unknown amounts',()=>{
 const start=worker.indexOf('function multiSystemSortedEntries(');
 const end=worker.indexOf('function multiSystemMonthlyEntries(',start);
 assert.ok(start>=0&&end>start);
 const sorted=vm.runInNewContext(worker.slice(start,end)+';multiSystemSortedEntries');
 const values=sorted({HOMOLOGADO:2,ZERO:0,UNKNOWN:null,BAD:'5',INVALID:NaN});
 assert.deepEqual(Array.from(values,([key,value])=>[key,value]),[['HOMOLOGADO',2],['ZERO',0]]);
});

test('procurement marks legacy non-date monthly keys unavailable without mutating source data',async()=>{
 const start=worker.indexOf('async function buildProcurementDashboard(');
 const end=worker.indexOf('async function buildAccountingSampleDashboard(',start);
 const monthly={'AQUISICAO DE PNEUS':1,'OUTRO OBJETO':2};
 const summaries={
  'processos-administrativos':{resource:'processos-administrativos',count:3,loaded:3,loadStatus:'complete',groups:{HOMOLOGADO:3},monthly},
  fornecedores:{resource:'fornecedores',count:1,loaded:1,loadStatus:'complete'}
 };
 const fn=vm.runInNewContext(worker.slice(start,end)+';buildProcurementDashboard',{
  getMultiSystemSummary:async(_env,_tenant,_system,resource)=>summaries[resource],
  buildProcurementSampleDashboard:()=>{throw Error('sample fallback forbidden')},
  multiSystemSortedEntries:values=>Object.entries(values||{}),
  multiSystemRealMeta:(_system,_items,extra)=>extra
 });
 const result=await fn({}, {id:'paulafreitas'},new URL('https://example.test/?exercicio=2026'));
 assert.equal(result.meta.monthlySeriesStatus,'unavailable-invalid-month-keys');
 assert.equal(result.meta.invalidMonthlyKeyCount,2);
 assert.equal(result.charts['compras-situacao'].datasets[0].data[0],3);
 assert.equal(Object.keys(monthly).length,2);
 for(const key of ['estimado','homologado','economia'])assert.equal(result.kpis[key],null);
});

test('real procurement shows independently counted source coverage and exportable table without invented amounts',async()=>{
 const start=worker.indexOf('async function buildProcurementDashboard(');
 const end=worker.indexOf('async function buildAccountingSampleDashboard(',start);
 const summaries={
  'processos-administrativos':{resource:'processos-administrativos',count:2373,loaded:2373,pages:24,loadStatus:'complete',groups:{HOMOLOGADO:2127,REVOGADO:246}},
  fornecedores:{resource:'fornecedores',count:9500,loaded:9500,pages:95,loadStatus:'complete'}
 };
 const fn=vm.runInNewContext(worker.slice(start,end)+';buildProcurementDashboard',{
  getMultiSystemSummary:async(_env,_tenant,_system,resource)=>summaries[resource],
  buildProcurementSampleDashboard:()=>{throw Error('must use real data')},
  multiSystemSortedEntries:values=>Object.entries(values||{}),
  multiSystemRealMeta:(_system,_items,extra)=>extra
 });
 const result=await fn({}, {id:'paulafreitas'},new URL('https://example.test/?periodo=ano&exercicio=2026'));
 assert.deepEqual(Array.from(result.charts['compras-fontes'].labels),['Processos administrativos','Fornecedores']);
 assert.deepEqual(Array.from(result.charts['compras-fontes'].datasets[0].data),[2373,9500]);
 const coverage=result.tables.find(table=>table.id==='compras-cobertura-real');
 assert.ok(coverage);
 assert.equal(coverage.rows.length,2);
 assert.deepEqual(Array.from(coverage.rows.map(row=>row.values[0])),[2373,9500]);
 assert.match(coverage.subtitle,/não aplicam filtro de exercício/);
 assert.equal(result.meta.periodFilterApplied,false);
 for(const metric of ['estimado','homologado','economia'])assert.equal(result.kpis[metric],null);
 const catalog=fs.readFileSync('system-catalog.js','utf8');
 assert.ok(catalog.includes('ch("compras-fontes","Registros importados por fonte","bar"'));
});


test('source completeness requires every configured resource, not just completed summaries',()=>{
 const start=worker.indexOf('function multiSystemRealMeta(');
 const end=worker.indexOf('async function buildAccountingDashboard(',start);
 assert.ok(start>=0&&end>start);
 const configured={
  contabil:[{resource:'empenhos'},{resource:'movimentacoes-receitas'},{resource:'movimentacoes-despesas'},{resource:'credores'}],
  compras:[{resource:'processos-administrativos'},{resource:'fornecedores'}],
  folha:[{resource:'matriculas'},{resource:'funcionarios-cargos'},{resource:'remuneracoes'}]
 };
 const fn=vm.runInNewContext(worker.slice(start,end)+';multiSystemRealMeta',{MULTISYSTEM_BOOTSTRAP_SOURCES:configured});
 const partial=fn('contabil',[{resource:'empenhos',loaded:10,count:10,loadStatus:'complete',fieldsProfile:{selected:['id','valor']}}]);
 assert.equal(partial.sourceAudit.contabil.complete,false);
 assert.equal(partial.dataMode,'real-partial');
 assert.deepEqual(Array.from(partial.sourceAudit.contabil.missingResources),['movimentacoes-receitas','movimentacoes-despesas','credores']);
 assert.deepEqual(Array.from(partial.realSources.filter(item=>item.status==='missing').map(item=>item.resource)),['movimentacoes-receitas','movimentacoes-despesas','credores']);
 assert.equal(partial.sourceAudit.contabil.fieldCoverageVerified,false);
 const complete=fn('compras',[
  {resource:'processos-administrativos',loaded:2373,loadStatus:'complete'},
  {resource:'fornecedores',loaded:9500,loadStatus:'complete'}
 ]);
 assert.equal(complete.sourceAudit.compras.complete,true);
 assert.equal(complete.dataMode,'real');
 assert.equal(complete.realSources.filter(item=>item.status==='missing').length,0);
 const failed=fn('folha',[
  {resource:'matriculas',loaded:1634,loadStatus:'complete'},
  {resource:'funcionarios-cargos',loaded:1032,loadStatus:'error'},
  {resource:'remuneracoes',loaded:98904,loadStatus:'complete'}
 ]);
 assert.equal(failed.sourceAudit.folha.complete,false);
});

test('month keys reject impossible dates without changing valid historical competencies',()=>{
 const start=worker.indexOf('function multiSystemMonthKey(');
 const end=worker.indexOf('\nfunction emptyMultiSystemSummary(',start);
 assert.ok(start>=0&&end>start);
 const parse=vm.runInNewContext(worker.slice(start,end)+';multiSystemMonthKey');
 const valid=[
  ['2026-10-20','2026-10'],
  ['2026-10-20T23:59:00-03:00','2026-10'],
  ['31/12/2025','2025-12'],
  ['29/02/2024','2024-02'],
  ['2026-10','2026-10']
 ];
 const invalid=['2026-13-01','2026-00-01','2026-02-30','29/02/2025','31/11/2026','PNEUS ESCOLARES'];
 for(const [input,expected] of valid)assert.equal(parse(input),expected,input);
 for(const input of invalid)assert.equal(parse(input),null,input);
});


test('real coverage distinguishes missing resources, failed sources and active ingestion',()=>{
 const start=worker.indexOf('function multiSystemRealMeta(');
 const end=worker.indexOf('async function buildAccountingDashboard(',start);
 assert.ok(start>=0&&end>start);
 const configured={compras:[{resource:'processos-administrativos'},{resource:'fornecedores'}]};
 const meta=vm.runInNewContext(worker.slice(start,end)+';multiSystemRealMeta',{MULTISYSTEM_BOOTSTRAP_SOURCES:configured});
 const missing=meta('compras',[{resource:'processos-administrativos',count:2,loaded:2,loadStatus:'complete'}]);
 assert.match(missing.warning,/fontes obrigatórias ausentes/);
 const failed=meta('compras',[
  {resource:'processos-administrativos',count:2,loaded:2,loadStatus:'complete'},
  {resource:'fornecedores',count:0,loaded:0,loadStatus:'error',error:'BETHA_HTTP_401'}
 ]);
 assert.match(failed.warning,/fontes com falha de ingestão/);
 assert.equal(failed.sourceAudit.compras.complete,false);
 const running=meta('compras',[
  {resource:'processos-administrativos',count:2,loaded:2,loadStatus:'complete'},
  {resource:'fornecedores',count:1,loaded:1,loadStatus:'running'}
 ]);
 assert.match(running.warning,/carga incremental em andamento/);
 const complete=meta('compras',[
  {resource:'processos-administrativos',count:2,loaded:2,loadStatus:'complete'},
  {resource:'fornecedores',count:1,loaded:1,loadStatus:'complete'}
 ]);
 assert.equal(complete.warning,null);
});

test('D1 summary lookup isolates tenant in both summary and load status join',async()=>{
 const start=worker.indexOf('async function getMultiSystemSummary(');
 const end=worker.indexOf('function multiSystemResourcePrefix(',start);
 assert.ok(start>=0&&end>start);
 const fn=vm.runInNewContext(worker.slice(start,end)+';getMultiSystemSummary',{
  parseMultiSystemFieldProfile:()=>({selected:['id'],discoveryDone:false})
 });
 const rows={
  'paulafreitas:compras:processos-administrativos':{summary_json:JSON.stringify({count:2373,resource:'processos-administrativos'}),status:'complete',loaded:2373,pages:24,http_status:200},
  'agudosdosul:compras:processos-administrativos':{summary_json:JSON.stringify({count:3,resource:'processos-administrativos'}),status:'error',loaded:0,pages:0,http_status:403,error:'BETHA_HTTP_403'}
 };
 const env={AUTH_DB:{prepare(sql){
  const summaryQuery=sql.includes('FROM bi_multisystem_summaries');
  if(summaryQuery){
   assert.match(sql,/s\.tenant_id=\?1/);
   assert.match(sql,/l\.tenant_id=s\.tenant_id/);
   assert.match(sql,/l\.system=s\.system/);
   assert.match(sql,/l\.resource=s\.resource/);
  }else{
   assert.match(sql,/FROM bi_multisystem_loads/);
   assert.match(sql,/tenant_id=\?1/);
   assert.match(sql,/system=\?2/);
   assert.match(sql,/resource=\?3/);
  }
  return {bind(tenant,system,resource){return {first:async()=>summaryQuery?(rows[tenant+':'+system+':'+resource]||null):null};}};
 }}};
 const paula=await fn(env,'paulafreitas','compras','processos-administrativos');
 const agudos=await fn(env,'agudosdosul','compras','processos-administrativos');
 assert.equal(paula.count,2373);
 assert.equal(paula.loadStatus,'complete');
 assert.equal(paula.error,null);
 assert.equal(agudos.loadStatus,'error');
 assert.equal(agudos.httpStatus,403);
 assert.equal(await fn(env,'terceiro','compras','processos-administrativos'),null);
});


test('missing or malformed D1 summary preserves real source coverage and never uses synthetic sample',async()=>{
 const start=worker.indexOf('async function getMultiSystemSummary(');
 const end=worker.indexOf('function multiSystemResourcePrefix(',start);
 assert.ok(start>=0&&end>start);
 const getter=vm.runInNewContext(worker.slice(start,end)+';getMultiSystemSummary',{
  emptyMultiSystemSummary:(system,resource)=>({system,resource,count:0,monthly:{},groups:{},secondaryGroups:{}}),
  parseMultiSystemFieldProfile:()=>({selected:['id'],discoveryDone:false})
 });
 for(const raw of [null,'{malformed']){
  const env={AUTH_DB:{prepare(sql){
   return {bind(tenant,system,resource){
    assert.equal(tenant,'paulafreitas');
    assert.equal(system,'compras');
    assert.equal(resource,'processos-administrativos');
    return {first:async()=>sql.includes('FROM bi_multisystem_summaries')?(raw?{summary_json:raw}:null):{status:'complete',loaded:2373,pages:24,updated_at:'2026-10-09'}};
   }};
  }}};
  const actual=await getter(env,'paulafreitas','compras','processos-administrativos');
  assert.equal(actual.count,2373);
  assert.equal(actual.loaded,2373);
  assert.equal(actual.summaryMissing,true);
  assert.equal(actual.loadStatus,'complete');
  const metaStart=worker.indexOf('function multiSystemRealMeta(');
  const metaEnd=worker.indexOf('async function buildAccountingDashboard(',metaStart);
  const metadata=vm.runInNewContext(worker.slice(metaStart,metaEnd)+';multiSystemRealMeta',{
   MULTISYSTEM_BOOTSTRAP_SOURCES:{compras:[{resource:'processos-administrativos'},{resource:'fornecedores'}]}
  });
  const state=metadata('compras',[actual,{resource:'fornecedores',count:9500,loaded:9500,loadStatus:'complete'}]);
  assert.equal(state.dataMode,'real-partial');
  assert.deepEqual(Array.from(state.sourceAudit.compras.missingSummaries),['processos-administrativos']);
  assert.equal(state.realSources[0].summaryAvailable,false);
  const builderStart=worker.indexOf('async function buildProcurementDashboard(');
  const builderEnd=worker.indexOf('async function buildAccountingSampleDashboard(',builderStart);
  const builder=vm.runInNewContext(worker.slice(builderStart,builderEnd)+';buildProcurementDashboard',{
   getMultiSystemSummary:async(_env,_tenant,_system,resource)=>resource==='processos-administrativos'?actual:null,
   buildProcurementSampleDashboard:()=>{throw Error('synthetic sample forbidden when real load exists')},
   multiSystemSortedEntries:values=>Object.entries(values||{}),
   multiSystemRealMeta:metadata
  });
  const payload=await builder({}, {id:'paulafreitas',name:'Paula Freitas'},new URL('https://example.test/?exercicio=2026'));
  assert.equal(payload.kpis.processos,2373);
  assert.equal(payload.kpis.estimado,null);
  assert.equal(payload.meta.dataMode,'real-partial');
  assert.deepEqual(Array.from(payload.charts['compras-fontes'].datasets[0].data),[2373]);
 }
});
