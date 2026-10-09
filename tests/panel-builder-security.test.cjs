/* node tests/panel-builder-security.test.cjs
   Tests the exact Worker authorization/validation functions in an isolated VM.
   Does not call Betha, D1, or R2 in production. */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const worker=fs.readFileSync(path.join(__dirname,"../backend/worker.js"),"utf8");
function extract(start,end){
 const a=worker.indexOf(start),b=worker.indexOf(end,a+start.length);
 assert(a>=0&&b>a,"Worker contract changed: "+start);
 return worker.slice(a,b);
}
const snippet=[
 extract("const PANEL_CACHED_SOURCES=","function panelPreviewCatalog("),
 extract("function validatePanelDraftPayload(","async function authorizePanelDefinition("),
 extract("async function authorizePanelDefinition(","async function handlePanelDrafts(")
].join("\n");
const dbRows=[
 {resource:"empenhos",loaded:250,pages:3,status:"running",fields_json:JSON.stringify({selected:["ano","valor","situacao"]})},
 {resource:"movimentacoes-receitas",loaded:100,pages:1,status:"running",fields_json:JSON.stringify({selected:["ano","valor"]})}
];
const scope={
 parseMultiSystemFieldProfile:raw=>JSON.parse(raw),
 permissionViewsForAccess:access=>access.views||[],
 multiSystemSimpleValue:v=>v,
 multiSystemPageObjectKey:(tenant,sys,res,page)=>[tenant,sys,res,page].join("/"),
 PANEL_PREVIEW_FIELDS:{},
 requireDataPermission:()=>{throw new Error("denied");},
 BI_SYNC_RAW:null,
 console
};
vm.createContext(scope);
vm.runInContext(snippet,scope);
const tenant={id:"entity-a"};
const auth={access:{views:["contabil-empenhos"]}};
const env={
 AUTH_DB:{prepare:()=>({bind:()=>({all:async()=>({results:dbRows})})})},
 BI_SYNC_RAW:{get:async key=>({json:async()=>({tenantId:"entity-a",system:"contabil",resource:"empenhos",rows:[{ano:"2026",valor:100},{ano:"2026",valor:50}]})})}
};
const def={title:"Empenhos por ano",sourceId:"cache:contabil:empenhos",type:"bar",dimension:"ano",measures:[{field:"valor",aggregation:"sum"}],filters:[]};
(async()=>{
 const sources=await scope.cachedPanelSources(env,tenant,auth,"contabil");
 assert.deepEqual(Array.from(sources,x=>x.id),["cache:contabil:empenhos"],"No access to unrelated accounting resource");
 const result=await scope.previewCachedPanel(env,tenant,auth,"contabil",def);
 assert.equal(result.scanned,6);
 assert.equal(result.rows[0].values[0],450);
 await scope.authorizePanelDefinition(env,tenant,auth,"contabil",scope.validatePanelDraftPayload({definition:def}));
 await assert.rejects(()=>scope.authorizePanelDefinition(env,tenant,auth,"contabil",{...def,dimension:"cpf",measures:def.measures}),/PANEL_FIELD_NOT_ALLOWED/);
 await assert.rejects(()=>scope.previewCachedPanel(env,tenant,auth,"compras",def),/PANEL_SOURCE_NOT_ALLOWED/);
 assert.equal(scope.validatePanelDraftPayload({definition:{...def,sourceId:"sample:contabil"}}),undefined);
})().then(()=>console.log("Panel cache authorization tests passed")).catch(error=>{console.error(error);process.exitCode=1;});
