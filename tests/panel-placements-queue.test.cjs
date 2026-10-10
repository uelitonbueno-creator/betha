/* node tests/panel-placements-queue.test.cjs */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../panel-placements.js"),"utf8");
const app=fs.readFileSync(path.join(__dirname,"../app.js"),"utf8");
const start=source.indexOf("async function drainPreviewQueue("),end=source.indexOf("function context(){",start);
assert(start>=0&&end>start,"Personal chart preview scheduler must exist");
const drainPreviewQueue=new Function(source.slice(start,end)+";return drainPreviewQueue;")();
async function testConcurrency(){
 let active=0,maximum=0;
 const values=[];
 await drainPreviewQueue([...Array(12).keys()],3,async value=>{
  active++;maximum=Math.max(maximum,active);
  await new Promise(resolve=>setImmediate(resolve));
  values.push(value);active--;
 },()=>true);
 assert.equal(maximum,3,"No more than three previews may load simultaneously");
 assert.deepEqual(values.slice().sort((a,b)=>a-b),[...Array(12).keys()]);
}
async function testCancellation(){
 let active=true;
 const started=[];
 await drainPreviewQueue([0,1,2,3,4,5],2,async value=>{
  started.push(value);
  active=false;
  await new Promise(resolve=>setImmediate(resolve));
 },()=>active);
 assert(started.length<=2,"Stop scheduling new previews when navigating away");
 assert(started.length>=1);
}
(async()=>{
 await testConcurrency();
 await testCancellation();
 assert.match(source,/window\.addEventListener\("bi-vella-context-changed",refresh\)/,
  "Refresh charts on explicit navigation and tenant selection events");
 const navigation=app.slice(app.indexOf("function navigate(view)"),app.indexOf("function sourceClass(",app.indexOf("function navigate(view)")));
 assert.match(navigation,/dispatchEvent\(new Event\("bi-vella-context-changed"\)\)/);
 const tenant=app.slice(app.indexOf("tenantId = tenant.id;"),app.indexOf("function showTenantSelector(",app.indexOf("tenantId = tenant.id;")));
 assert.match(tenant,/dispatchEvent\(new Event\("bi-vella-context-changed"\)\)/);
 const reorder=source.slice(source.indexOf("async function move(offset){"),source.indexOf("for(const [label,delta]"));
 assert.match(reorder,/if\(moving\|\|/);
 const failed=reorder.slice(reorder.indexOf("}catch(err){"));
 assert.doesNotMatch(failed,/dispatchEvent/,"Do not erase reorder failures with an automatic rerender");
 console.log("Personal chart preview queue, navigation refresh and reorder safety passed.");
})().catch(error=>{console.error(error);process.exitCode=1;});
