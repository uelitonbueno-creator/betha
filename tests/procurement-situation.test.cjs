const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const {pathToFileURL} = require("node:url");
const path = require("node:path");

const load = () => import(pathToFileURL(path.resolve("backend/procurement-situation.mjs")).href);
const row = (id,situacao) => ({id,situacao});
const page = (tenantId,index,rows) => ({
  tenantId,system:"compras",resource:"processos-administrativos",
  page:index,offset:index*100,fields:["id","objeto","situacao","formaContratacao"],rows
});
const fixture = (tenantId,pages,extra={}) => {
  const calls=[];
  const objects=new Map(pages.map((p,i)=>[`page-${i}.json`,p]));
  for(const [key,value] of Object.entries(extra)) objects.set(key,value);
  const bucket={async get(key){
    calls.push(key);
    const obj=objects.get(key);
    return obj?{async json(){return obj}}:null;
  }};
  return {bucket,calls,pageKey:i=>`page-${i}.json`};
};

test("R2 complete pages recover real situation counts, ignoring an orphan duplicate page",async()=>{
  const {readProcurementSituationCounts}=await load();
  const tenant="test-procurement-unique-a";
  const f=fixture(tenant,[
    page(tenant,0,[row("1","HOMOLOGADO"),row("2","REVOGADO")]),
    page(tenant,1,[row("3","HOMOLOGADO")])
  ],{"page-2.json":page(tenant,2,[row("3","")])});
  const result=await readProcurementSituationCounts({
    ...f,tenantId:tenant,summary:{pages:2,count:3,loadStatus:"complete"}
  });
  assert.equal(result.status,"complete");
  assert.deepEqual(result.groups,{HOMOLOGADO:2,REVOGADO:1});
  assert.equal(result.rows,3);
  assert.deepEqual(f.calls.sort(),["page-0.json","page-1.json"]);
});

test("R2 reconstruction rejects missing, duplicate, incomplete or mismatched archives",async()=>{
  const {readProcurementSituationCounts}=await load();
  const cases=[
    {tenant:"test-procurement-b",pages:[page("test-procurement-b",0,[row("1","HOMOLOGADO")])],summary:{pages:2,count:2,loadStatus:"complete"}},
    {tenant:"test-procurement-c",pages:[page("test-procurement-c",0,[row("1","HOMOLOGADO"),row("1","REVOGADO")])],summary:{pages:1,count:2,loadStatus:"complete"}},
    {tenant:"test-procurement-d",pages:[page("wrong-tenant",0,[row("1","HOMOLOGADO")])],summary:{pages:1,count:1,loadStatus:"complete"}},
    {tenant:"test-procurement-e",pages:[page("test-procurement-e",0,[row("1","HOMOLOGADO")])],summary:{pages:1,count:2,loadStatus:"complete"}},
    {tenant:"test-procurement-f",pages:[page("test-procurement-f",0,[row("1","HOMOLOGADO")])],summary:{pages:1,count:1,loadStatus:"partial"}},
    {tenant:"test-procurement-g",pages:[page("test-procurement-g",0,[row("1","")])],summary:{pages:1,count:1,loadStatus:"complete"}}
  ];
  for(const x of cases){
    const f=fixture(x.tenant,x.pages);
    const result=await readProcurementSituationCounts({...f,tenantId:x.tenant,summary:x.summary});
    assert.equal(result.status,"unavailable",x.tenant);
    assert.deepEqual(result.groups,{},x.tenant);
  }
});

test("R2 situation chart uses recovered groups when persisted summary has none",async()=>{
  const worker=fs.readFileSync("backend/worker.js","utf8");
  const start=worker.indexOf("async function buildProcurementDashboard(");
  const end=worker.indexOf("async function buildAccountingSampleDashboard(",start);
  assert.ok(start>=0&&end>start);
  const summaries={
    "processos-administrativos":{resource:"processos-administrativos",count:3,loaded:3,pages:1,loadStatus:"complete",groups:{},monthly:{}},
    fornecedores:{resource:"fornecedores",count:2,loaded:2,loadStatus:"complete"}
  };
  let called=false;
  const fn=vm.runInNewContext(worker.slice(start,end)+";buildProcurementDashboard",{
    getMultiSystemSummary:async(_e,_t,_s,r)=>summaries[r],
    buildProcurementSampleDashboard:()=>{throw Error("Synthetic fallback forbidden")},
    multiSystemSortedEntries:o=>Object.entries(o||{}),
    multiSystemPageObjectKey:(_t,_s,_r,p)=>"page-"+p,
    readProcurementSituationCounts:async()=>{called=true;return {status:"complete",groups:{HOMOLOGADO:2,REVOGADO:1}}},
    multiSystemRealMeta:(_s,_a,extra)=>extra
  });
  const result=await fn({BI_SYNC_RAW:{}},{id:"paulafreitas",name:"Paula Freitas"},new URL("https://example.test/?exercicio=2026"));
  assert.equal(called,true);
  assert.equal(result.meta.situationChartSource,"r2-validated-pages");
  assert.deepEqual(Array.from(result.charts["compras-situacao"].datasets[0].data),[2,1]);
  assert.equal(result.tables.find(x=>x.id==="compras-situacao-real").rows.length,2);
  for(const key of ["estimado","homologado","economia"]) assert.equal(result.kpis[key],null);
});

test("missing archive reports unavailable chart, never invents zeros",async()=>{
  const worker=fs.readFileSync("backend/worker.js","utf8");
  const start=worker.indexOf("async function buildProcurementDashboard(");
  const end=worker.indexOf("async function buildAccountingSampleDashboard(",start);
  const fn=vm.runInNewContext(worker.slice(start,end)+";buildProcurementDashboard",{
    getMultiSystemSummary:async(_e,_t,_s,r)=>r==="processos-administrativos"?{resource:r,count:3,loaded:3,pages:1,loadStatus:"complete",groups:{},monthly:{}}:null,
    multiSystemSortedEntries:o=>Object.entries(o||{}),
    readProcurementSituationCounts:async()=>({status:"unavailable",reason:"ARCHIVE_PAGE_MISSING",groups:{}}),
    multiSystemPageObjectKey:()=>"",
    multiSystemRealMeta:(_s,_a,extra)=>extra
  });
  const result=await fn({BI_SYNC_RAW:{}},{id:"paulafreitas"},new URL("https://example.test/"));
  assert.equal(result.charts["compras-situacao"],undefined);
  assert.equal(result.meta.situationChartError,"ARCHIVE_PAGE_MISSING");
  assert.match(result.meta.chartUnavailableReasons["compras-situacao"],/validar/);
});
