/* node tests/panel-builder-d1.test.cjs — no external services */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const worker=fs.readFileSync(path.join(__dirname,"../backend/worker.js"),"utf8");
const start=worker.indexOf("async function handlePanelDrafts(");
const end=worker.indexOf("\nexport default {",start);
assert(start>=0&&end>start,"Worker route was moved");
const rows=[];
const database={
 prepare(sql){
  return {bind(...args){
   const scope=row=>row.tenant_id===args[args.length-3]&&row.system_id===args[args.length-2]&&row.owner_id===args[args.length-1];
   return {
    async all(){
     if(sql.includes("WHERE tenant_id=? AND system_id=? AND owner_id=? AND view_id=?")){
      return {results:rows.filter(row=>row.tenant_id===args[0]&&row.system_id===args[1]&&row.owner_id===args[2]&&row.view_id===args[3]).map(row=>({id:row.id}))};
     }
     return {results:rows.filter(row=>row.tenant_id===args[0]&&row.system_id===args[1]&&row.owner_id===args[2]).map(row=>({
      id:row.id,title:row.title,definition_json:row.definition_json,view_id:row.view_id,sort_order:row.sort_order,created_at:"2026-10-09",updated_at:"2026-10-09"
     }))};
    },
    async run(){
     if(sql.startsWith("INSERT")){
      rows.push({id:args[0],tenant_id:args[1],system_id:args[2],owner_id:args[3],title:args[4],definition_json:args[5],view_id:args[6],sort_order:args[7]});
      return {meta:{changes:1}};
     }
     if(sql.startsWith("DELETE")){
      const i=rows.findIndex(row=>row.id===args[0]&&scope(row));
      if(i<0)return {meta:{changes:0}};
      rows.splice(i,1);return {meta:{changes:1}};
     }
     if(sql.startsWith("UPDATE")&&sql.includes("SET title=")){
      const row=rows.find(row=>row.id===args[4]&&row.tenant_id===args[5]&&row.system_id===args[6]&&row.owner_id===args[7]);
      if(!row)return {meta:{changes:0}};
      [row.title,row.definition_json,row.view_id,row.sort_order]=args.slice(0,4);
      return {meta:{changes:1}};
     }
     if(sql.startsWith("UPDATE")&&sql.includes("SET sort_order=")){
      const row=rows.find(row=>row.id===args[1]&&row.tenant_id===args[2]&&row.system_id===args[3]&&row.owner_id===args[4]&&row.view_id===args[5]);
      if(!row)return {meta:{changes:0}};
      row.sort_order=args[0];return {meta:{changes:1}};
     }
     throw new Error("Unexpected SQL: "+sql);
    }
   };
  }};
 },
 async batch(commands){return Promise.all(commands.map(command=>command.run()));}
};
let seq=0;
const context={
 resolveTenant:async(_env,id)=>({id}),
 getTenantId:request=>request.headers.get("X-Tenant-Id"),
 authorizeTenant:async request=>({userId:request.headers.get("X-User-Id"),access:{admin:request.headers.get("X-Admin")==="yes"}}),
 permissionViewsForAccess:()=>[],
 validatePanelDraftPayload:input=>input.definition,
 authorizePanelDefinition:async()=>{},
 ensurePanelDraftSchema:async()=>{},
 json:(_req,_env,status,body)=>({status,body}),
 errorResponse:(_req,_env,error)=>({status:403,body:{error:error.message}}),
 crypto:{randomUUID:()=>String(++seq).padStart(8,"0")+"-1111-4111-8111-111111111111"},
 console
};
vm.createContext(context);
vm.runInContext(worker.slice(start,end),context);
// Testa a configuração real, que possui somente AUTH_DB.
const env={AUTH_DB:database};
async function call(method,tenant,user,uri,body){
 const req=new Request("https://bi.example"+uri,{method,headers:{"X-Tenant-Id":tenant,"X-User-Id":user,"X-Admin":"yes",...(body?{"Content-Type":"application/json"}:{})},...(body?{body:JSON.stringify(body)}:{})});
 return context.handlePanelDrafts(req,env,new URL(req.url));
}
const url="/api/panel-drafts?system=contabil";
const def={title:"Test chart",sourceId:"cache:contabil:empenhos",type:"bar",dimension:"ano",measures:[{field:"valor",aggregation:"sum"}],filters:[]};
(async()=>{
 const a=await call("POST","municipio-a","alice",url,{definition:def,viewId:"contabil-empenhos",sortOrder:1});
 assert.equal(a.status,201);
 const b=await call("POST","municipio-a","alice",url,{definition:{...def,title:"Second"},viewId:"contabil-empenhos",sortOrder:2});
 assert.equal(b.status,201);
 const id=a.body.id,second=b.body.id;
 assert.equal((await call("GET","municipio-a","alice",url)).body.items.length,2);
 assert.equal((await call("GET","municipio-a","alice","/api/panel-drafts?system=contabilidade")).body.items.length,2,
  "Legacy accounting alias must resolve to the canonical 'contabil' system");
 assert.equal((await call("GET","municipio-a","alice","/api/panel-drafts?system=unknown")).status,400);
 assert.equal((await call("GET","municipio-b","alice",url)).body.items.length,0);
 assert.equal((await call("GET","municipio-a","bob",url)).body.items.length,0);
 assert.equal((await call("POST","municipio-a","alice","/api/panel-drafts/reorder?system=contabil",{viewId:"contabil-empenhos",ids:[second,id]})).status,200);
 assert.equal(rows.find(r=>r.id===id).sort_order,2);
 assert.equal((await call("POST","municipio-a","alice","/api/panel-drafts/reorder?system=contabil",{viewId:"contabil-empenhos",ids:[id]})).status,409);
 assert.equal((await call("PUT","municipio-a","alice","/api/panel-drafts/"+id+"?system=contabil",{definition:{...def,title:"Edited"},viewId:"contabil-empenhos",sortOrder:2})).status,200);
 assert.equal(rows.find(r=>r.id===id).title,"Edited");
 assert.equal((await call("DELETE","municipio-a","bob","/api/panel-drafts/"+id+"?system=contabil")).status,404);
 assert.equal((await call("DELETE","municipio-b","alice","/api/panel-drafts/"+id+"?system=contabil")).status,404);
 assert.equal((await call("DELETE","municipio-a","alice","/api/panel-drafts/"+id+"?system=contabil")).status,200);
 assert.equal((await call("GET","municipio-a","alice",url)).body.items.length,1);
 const noView=await call("POST","municipio-a","alice","/api/panel-drafts/reorder?system=contabil",{viewId:"contabil-empenhos",ids:[second,second]});
 assert.equal(noView.status,400,"Duplicate panel ids must be rejected");
 const unknown=await call("POST","municipio-a","alice","/api/panel-drafts/reorder?system=contabil",{viewId:"contabil-empenhos",ids:["00000000-1111-4111-8111-111111111999"]});
 assert.equal(unknown.status,409,"Reordering unknown drafts must be rejected");
 assert.equal((await call("GET","municipio-a","bob",url)).body.items.length,0,"No cross-user leakage");
 assert.equal((await call("GET","municipio-b","alice",url)).body.items.length,0,"No cross-tenant leakage");
 console.log("Panel D1 mock CRUD, isolation and reorder passed");
})().catch(error=>{console.error(error);process.exitCode=1;});
