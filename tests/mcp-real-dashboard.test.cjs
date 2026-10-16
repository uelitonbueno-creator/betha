const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const source = fs.readFileSync('backend/worker.js','utf8');
function section(name) {
  const start = source.indexOf('async function '+name+'(');
  assert.ok(start >= 0, name+' exists');
  const next = source.indexOf('\nasync function ',start+1);
  return source.slice(start,next<0?source.length:next);
}
for(const [name,builder] of [['mcpAccountingExecution','buildAccountingDashboard'],['mcpProcurementSummary','buildProcurementDashboard'],['mcpPayrollSummary','buildPayrollDashboard']]) {
  test(name+' preserves real metadata and null metrics',()=>{
    const body=section(name);
    assert.match(body,new RegExp('await '+builder+'\\('));
    assert.match(body,/\.\.\.mcpDashboardMeta\(body\)/);
    assert.doesNotMatch(body,/dataMode:\s*["']sample["']/);
    assert.doesNotMatch(body,/Number\(body\.kpis/);
  });
}
test('metric helper preserves null and unavailable values',()=>{
  const start=source.indexOf('function mcpDashboardMetric(');
  const end=source.indexOf('\nfunction ',start+1);
  assert.ok(start>=0);
  const helper=source.slice(start,end);
  const fn=new Function(helper+'; return mcpDashboardMetric;')();
  assert.equal(fn({kpis:{bruto:null}},'bruto'),null);
  assert.equal(fn({kpis:{}},'bruto'),null);
  assert.equal(fn({kpis:{bruto:0}},'bruto'),0);
  assert.equal(fn({kpis:{bruto:123.45}},'bruto'),123.45);
});
test('accounting maps validated empenhado field',()=>{
  assert.match(section('mcpAccountingExecution'),/despesaEmpenhada:mcpDashboardMetric\(body,"empenhado"\)/);
});
