const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const worker=fs.readFileSync(path.join(__dirname,"../backend/worker.js"),"utf8");
const app=fs.readFileSync(path.join(__dirname,"../app.js"),"utf8");
const start=worker.indexOf("function multiSystemSampleMeta(");
const end=worker.indexOf("\nfunction multiSystemSortedEntries",start);
assert.ok(start>=0&&end>start,"sample metadata function must exist");
const sampleMeta=vm.runInNewContext(worker.slice(start,end)+"\nmultiSystemSampleMeta;");

test("synthetic fallback metadata is explicit in all three systems",()=>{
  for(const system of ["contabil","compras","folha"]){
    const meta=sampleMeta(system,{rows:[{id:1}],sourceUrl:"local"},[{id:1}]);
    assert.equal(meta.dataMode,"sample");
    assert.equal(meta.sampleMode,true);
    assert.equal(meta.realData,false);
    assert.equal(meta.sampleSystem,system);
    assert.match(meta.warning,/SINTÉTICA/);
  }
});

test("dashboard CSV/TXT export recognizes sample payloads",()=>{
  assert.ok(app.includes('const sampleMode=currentPayload?.meta?.sampleMode===true&&currentPayload?.meta?.realData!==true;'));
  for(const system of ["contabil","compras","folha"]){
    const meta=sampleMeta(system,{rows:[{}]},[{}]);
    const sampleMode=meta.sampleMode===true&&meta.realData!==true;
    const label=sampleMode?"DEMONSTRAÇÃO — DADOS SINTÉTICOS":meta.dataMode==="real-partial"?"DADOS REAIS PARCIAIS":"DADOS REAIS";
    assert.equal(label,"DEMONSTRAÇÃO — DADOS SINTÉTICOS");
  }
});

test("real partial data remains classified as real, not sample",()=>{
  const meta={dataMode:"real-partial",realData:true,sampleMode:false};
  assert.equal(meta.sampleMode===true&&meta.realData!==true,false);
});
