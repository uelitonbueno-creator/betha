/* node tests/panel-builder-kpi.test.cjs
 * Validates cached KPI aggregation against the actual Worker implementation.
 */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const worker=fs.readFileSync(path.join(__dirname,"../backend/worker.js"),"utf8");
const from=worker.indexOf("const PANEL_CACHED_SOURCES=");
const to=worker.indexOf("function panelPreviewCatalog(",from);
assert(from>=0&&to>from,"Cached preview source moved");
const scope={
 parseMultiSystemFieldProfile:JSON.parse,
 permissionViewsForAccess:access=>access.views||[],
 multiSystemSimpleValue:value=>value,
 multiSystemPageObjectKey:(tenant,system,resource,page)=>[tenant,system,resource,page].join("/")
};
vm.createContext(scope);
vm.runInContext(worker.slice(from,to),scope);
const records=[
 {ano:"2025",situacao:"PAGO",valor:100},
 {ano:"2026",situacao:"ABERTO",valor:50},
 {ano:"2026",situacao:"PAGO",valor:30}
];
const env={
 AUTH_DB:{prepare:()=>({bind:()=>({all:async()=>({results:[{
  resource:"empenhos",status:"success",loaded:3,pages:1,
  fields_json:JSON.stringify({selected:["ano","situacao","valor"]})
 }]})})})},
 BI_SYNC_RAW:{get:async key=>key==="entity-a/contabil/empenhos/0"?{
  json:async()=>({tenantId:"entity-a",system:"contabil",resource:"empenhos",rows:records})
 }:null}
};
const tenant={id:"entity-a"},auth={access:{views:["contabil-empenhos"]}};
const definition={title:"Valor total",sourceId:"cache:contabil:empenhos",dimension:"ano",
 type:"kpi",measures:[{field:"valor",aggregation:"sum"}],filters:[]};
(async()=>{
 const total=await scope.previewCachedPanel(env,tenant,auth,"contabil",definition);
 assert.equal(total.scanned,3);
 assert.equal(total.partial,true);
 assert.equal(total.rows.length,1,"KPI must not be grouped by year");
 assert.equal(total.rows[0].dimension,"Total");
 assert.equal(total.rows[0].values[0],180);
 const filtered=await scope.previewCachedPanel(env,tenant,auth,"contabil",{
  ...definition,filters:[{field:"situacao",op:"eq",value:"PAGO"}]
 });
 assert.equal(filtered.rows.length,1);
 assert.equal(filtered.rows[0].values[0],130);
 const avg=await scope.previewCachedPanel(env,tenant,auth,"contabil",{
  ...definition,measures:[{field:"valor",aggregation:"avg"}]
 });
 assert.equal(avg.rows[0].values[0],60,"Average must weight all rows, not group averages");
 const count=await scope.previewCachedPanel(env,tenant,auth,"contabil",{
  ...definition,measures:[{field:"*",aggregation:"count"}]
 });
 assert.equal(count.rows[0].values[0],3);
 const bar=await scope.previewCachedPanel(env,tenant,auth,"contabil",{...definition,type:"bar"});
 assert.equal(bar.rows.length,2,"Ordinary charts must keep their dimensions");
 assert(worker.includes('const dim=d.type==="kpi"?"Total":row[d.dimension]'),
 "Betha preview must also aggregate KPI into one total");
 const builder=fs.readFileSync(path.join(__dirname,"../panel-builder-ui.js"),"utf8");
 const placements=fs.readFileSync(path.join(__dirname,"../panel-placements.js"),"utf8");
 assert(builder.includes('if(definition.type==="kpi")'),"Editor must render numeric KPI");
 assert(placements.includes('if(def.type==="kpi")'),"Saved panel must render numeric KPI");
 console.log("KPI totals, average, count, filters and UI paths passed.");
})().catch(err=>{console.error(err);process.exitCode=1;});
