/* node tests/panel-builder-schema.test.cjs
 * Exercises the exact Worker lazy migration with in-memory D1 method mocks.
 */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const worker=fs.readFileSync(path.join(__dirname,"../backend/worker.js"),"utf8");
const start=worker.indexOf("const PANEL_DRAFT_SCHEMA_TASKS=");
const end=worker.indexOf("async function handlePanelDrafts(",start);
assert(start>=0&&end>start,"Panel D1 schema initialization missing");
const context={};
vm.createContext(context);
vm.runInContext(worker.slice(start,end),context);
const ensure=context.ensurePanelDraftSchema;
assert.equal(typeof ensure,"function");
function fakeD1(legacy=false){
 const columns=new Set(legacy?["id","tenant_id","system_id","owner_id","title","definition_json","created_at","updated_at"]:[]);
 const calls=[];
 return {columns,calls,prepare(sql){
  calls.push(sql);
  return {
   async run(){
    if(sql.startsWith("CREATE TABLE")&&!columns.size){
     for(const name of ["id","tenant_id","system_id","owner_id","title","definition_json","view_id","sort_order","created_at","updated_at"])columns.add(name);
    }
    if(sql.startsWith("ALTER TABLE")){
     const match=sql.match(/ADD COLUMN (\w+)/);
     assert(match,"Invalid migration SQL");
     columns.add(match[1]);
    }
    return {meta:{changes:1}};
   },
   async all(){assert(sql.startsWith("PRAGMA table_info"));return {results:[...columns].map(name=>({name}))};}
  };
 }};
}
(async()=>{
 const fresh=fakeD1(false);
 await ensure(fresh);
 assert(fresh.columns.has("view_id")&&fresh.columns.has("sort_order"));
 const executed=fresh.calls.length;
 await ensure(fresh);
 assert.equal(fresh.calls.length,executed,"Same D1 binding should migrate once per Worker isolate");
 const legacy=fakeD1(true);
 await ensure(legacy);
 assert(legacy.columns.has("view_id")&&legacy.columns.has("sort_order"),"Legacy schema should upgrade");
 assert.equal(legacy.calls.filter(sql=>sql.startsWith("ALTER TABLE")).length,2);
 const indexed=legacy.calls.filter(sql=>sql.startsWith("CREATE INDEX"));
 assert.equal(indexed.length,3,"All panel indexes must exist");
 console.log("Panel D1 lazy migration: new and legacy databases verified.");
})().catch(error=>{console.error(error);process.exitCode=1;});
