/* Execute with: node tests/panel-builder-filters.test.cjs */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const core=require("../panel-builder-core.js");
const sourceCode=fs.readFileSync(path.join(__dirname,"../panel-builder-samples.js"),"utf8");
const sample=JSON.parse(fs.readFileSync(path.join(__dirname,"../data/samples/compras-100.json"),"utf8"));
const window={BIPanelBuilderCore:core};
const fetch=async url=>{
 assert.equal(url,"data/samples/compras-100.json");
 return {ok:true,json:async()=>sample};
};
new Function("window","fetch",sourceCode)(window,fetch);
const api=window.BIPanelSampleBuilder;
const catalog=api.catalog("compras");
const selected=catalog[0];
assert(selected.fields.some(f=>f.id==="status"&&f.filterable===true));
assert(!selected.fields.some(f=>f.id==="valorHomologado"&&f.filterable===true));
const first=sample.rows[0];
const definition={
 title:"Processos por modalidade",sourceId:"sample:compras",type:"bar",
 dimension:"modalidade",measures:[{field:"*",aggregation:"count"}],
 filters:[{field:"status",op:"eq",value:String(first.status)}]
};
(async()=>{
 const suggestions=await api.filterValues("compras","status");
 assert.equal(suggestions.mode,"sample");
 assert(suggestions.values.includes(String(first.status)));
 assert(suggestions.values.length<=40);
 await assert.rejects(api.filterValues("compras","valorHomologado"),/Campo de filtro não autorizado/);
 const result=await api.preview(definition,"compras");
 const matching=sample.rows.filter(row=>row.status===first.status);
 assert.equal(result.scanned,100);
 assert.equal(result.mode,"sample");
 assert.equal(result.rows.reduce((sum,row)=>sum+row.values[0],0),matching.length);
 assert.deepEqual(result.rows,core.aggregate(sample.rows,definition,catalog,{tenantId:"sample-only",systemId:"compras"}));
 await assert.rejects(api.preview({...definition,filters:[{field:"forbidden",op:"eq",value:"x"}]},"compras"),/Filtro não autorizado/);
 await assert.rejects(api.preview({...definition,sourceId:"cache:compras:processos-administrativos"},"compras"),/Fonte de amostra indisponível/);
 console.log("Panel builder sample filters passed.");
})().catch(error=>{console.error(error);process.exitCode=1;});
