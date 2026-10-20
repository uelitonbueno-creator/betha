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
