const test=require('node:test');
const assert=require('node:assert/strict');
const {DatabaseSync}=require('node:sqlite');
function database(){
 const sql=new DatabaseSync(':memory:');
 const wrapper={prepare(text){return {bind(...args){return {run:async()=>sql.prepare(text).run(...args),first:async()=>sql.prepare(text).get(...args),all:async()=>({results:sql.prepare(text).all(...args)}),_run:()=>sql.prepare(text).run(...args)}},run:async()=>sql.prepare(text).run()}},async batch(items){sql.exec('BEGIN');try{for(const s of items)s._run();sql.exec('COMMIT')}catch(e){sql.exec('ROLLBACK');throw e}}};
 return {db:wrapper,sql};
}
const api=import('../backend/payroll-projection.mjs');
const row=(id,competencia='2026-01',totalBruto=100.25)=>({id,competencia,totalBruto,totalDesconto:10.25,valorLiquido:90,matricula:{id:12}});
const page=(number,rows,tenantId='paulafreitas')=>({tenantId,system:'folha',resource:'remuneracoes',page:number,rows});
function options(db,pages){return {db,tenantId:'paulafreitas',pageCount:pages.length,sourceComplete:true,pageKey:i=>i,bucket:{get:async i=>pages[i]?{text:async()=>JSON.stringify(pages[i])}:null},batchSize:1}}
test('money preserves null and legitimate zero; rejects booleans and locale ambiguity',async()=>{const {payrollMoneyCents:m,payrollCompetence:c}=await api;for(const x of [null,undefined,'',true,'1.234,56',{}])assert.equal(m(x),null);assert.equal(m(0),0);assert.equal(m('100.25'),10025);assert.equal(c('2026-01-01'), '2026-01');assert.equal(c('2026-13'),null);});
test('archive projection resumes, deduplicates remuneration IDs and isolates tenants',async()=>{
 const {advancePayrollProjection:advance,readPayrollProjection:read}=await api;const {db,sql}=database();const pages=[page(0,[row(1),row(2)]),page(1,[row(2),row(3,'2025-12',0)])];const args=options(db,pages);
 assert.equal((await advance(args)).nextPage,1);
 let value=await read(db,'paulafreitas',new Set(['2026-01']));assert.equal(value.gross,200.5);assert.equal(value.state.status,'partial');
 assert.equal((await advance(args)).complete,true);
 value=await read(db,'paulafreitas',null);assert.equal(value.records,3);assert.equal(value.gross,200.5);assert.equal(value.state.rows_seen,4);
 await advance(args);assert.equal((await read(db,'paulafreitas',null)).gross,200.5);
 assert.equal(await read(db,'other',null),null);
 assert.equal(sql.prepare('SELECT COUNT(*) n FROM bi_payroll_values').get().n,3);
});
test('invalid tenant page cannot advance projection or write financial rows',async()=>{const {advancePayrollProjection:advance}=await api;const {db,sql}=database();await assert.rejects(advance(options(db,[page(0,[row(1)],'other')])),/SCOPE_INVALID/);assert.equal(sql.prepare('SELECT COUNT(*) n FROM bi_payroll_values').get().n,0);assert.equal(sql.prepare('SELECT next_page FROM bi_payroll_projection').get().next_page,0);});
test('missing competence or money never produces fictitious totals',async()=>{const {advancePayrollProjection:advance,readPayrollProjection:read}=await api;const {db}=database();await advance(options(db,[page(0,[row(1,'2026-01',null)])]));let result=await read(db,'paulafreitas',null);assert.equal(result.gross,null);assert.equal(result.net,90);const second=database();await advance(options(second.db,[page(0,[row(1,null)])]));result=await read(second.db,'paulafreitas',null);assert.equal(result.gross,null);assert.equal(result.unknownCompetence,1);});
test('projection failure preserves import tables and records recoverable error',async()=>{const {advancePayrollProjection:advance}=await api;const {db,sql}=database();sql.exec('CREATE TABLE bi_multisystem_loads(loaded INTEGER,pages INTEGER); INSERT INTO bi_multisystem_loads VALUES(98904,990)');await assert.rejects(advance({...options(db,[null]),pageCount:1}),/PAGE_MISSING/);assert.deepEqual({...sql.prepare('SELECT * FROM bi_multisystem_loads').get()},{loaded:98904,pages:990});});
