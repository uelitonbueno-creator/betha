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
