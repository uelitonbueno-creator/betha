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
