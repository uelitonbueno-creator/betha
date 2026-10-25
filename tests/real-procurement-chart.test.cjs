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
