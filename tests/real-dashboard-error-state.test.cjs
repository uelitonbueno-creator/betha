"use strict";

const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");

test("real dashboard API failure replaces chart loading placeholders with an error state",async()=>{
  const source=fs.readFileSync("app.js","utf8");
  const start=source.indexOf("  async function loadRealMultiSystemDashboard(");
  const end=source.indexOf("  async function loadDashboardData(",start);
  const helperStart=source.indexOf("  function markDashboardChartsUnavailable(",end);
  const helperEnd=source.indexOf("  function setLastUpdated(",helperStart);
  assert.ok(start>=0&&end>start,"real dashboard loader exists");
  assert.ok(helperStart>end&&helperEnd>helperStart,"chart error helper exists");

  const makeChart=()=>({
    title:{textContent:"Carregando dados..."},
    detail:{textContent:"Aguardando resposta das fontes desta visão."},
    querySelector(selector){return selector==="strong"?this.title:this.detail;}
  });
  const charts=[makeChart(),makeChart()];
  const coverage={children:[],replaceChildren(...children){this.children=children;}};
  const status=[];
  const loading=[];
  const refresh=[];
  const context=vm.createContext({
    REAL_MULTI_SYSTEM_HOME_VIEWS:new Set(),
    dashboardLoadGeneration:0,
    tenantId:"paulafreitas",
    currentView:"visao-geral",
    currentSystemId:"tributos",
    currentYear:2026,
    URLSearchParams,
    document:{
      getElementById(id){
        if(id==="periodo")return {value:"ano"};
        if(id==="exercicio")return {value:"2026"};
        if(id==="coverageItems")return coverage;
        return null;
      },
      querySelectorAll(selector){
        assert.equal(selector,"#dashboardView #chartGrid .chart-empty");
        return charts;
      },
      createElement(){return {className:"",textContent:""};}
    },
    currentDashboardFilters:()=>({}),
    api:async()=>{throw new Error("NETWORK_FAILURE");},
    setRefreshBusy:value=>refresh.push(value),
    setDashboardLoading:value=>loading.push(value),
    setStatus:(type,message)=>status.push({type,message}),
    console:{warn(){}},
    renderPayload(){throw new Error("failed dashboard must not render synthetic data");}
  });

  vm.runInContext(source.slice(start,end)+source.slice(helperStart,helperEnd),context);
  await vm.runInContext("loadRealMultiSystemDashboard('visao-geral')",context);

  assert.deepEqual(charts.map(chart=>chart.title.textContent),["Dados indisponíveis","Dados indisponíveis"]);
  assert.ok(charts.every(chart=>chart.detail.textContent.includes("Tente novamente usando ATUALIZAR")));
  assert.ok(charts.every(chart=>!chart.title.textContent.includes("Carregando")));
  assert.deepEqual(Array.from(loading),[true,false]);
  assert.deepEqual(status.at(-1),{
    type:"error",
    message:"Não foi possível consultar os dados reais. Tente novamente; dados sintéticos não serão exibidos como substituição."
  });
  assert.equal(coverage.children.length,1);
  assert.equal(coverage.children[0].textContent,"A consulta falhou antes de receber a cobertura das fontes.");
  assert.deepEqual(Array.from(refresh),[true,false]);
});

test("missing tributary load gets a specific HTTP conflict and leaves no loading placeholders",async()=>{
  const source=fs.readFileSync("app.js","utf8");
  const start=source.indexOf("  async function loadRealMultiSystemDashboard(");
  const end=source.indexOf("  async function loadDashboardData(",start);
  const helperStart=source.indexOf("  function markDashboardChartsUnavailable(",end);
  const helperEnd=source.indexOf("  function setLastUpdated(",helperStart);
  const makeChart=()=>({title:{textContent:"Carregando dados..."},detail:{textContent:"Aguardando"},querySelector(selector){return selector==="strong"?this.title:this.detail;}});
  const charts=[makeChart()];
  const coverage={children:[],replaceChildren(...children){this.children=children;}};
  const status=[];
  const context=vm.createContext({
    REAL_MULTI_SYSTEM_HOME_VIEWS:new Set(),dashboardLoadGeneration:0,tenantId:"paulafreitas",
    currentView:"visao-geral",currentSystemId:"tributos",currentYear:2026,URLSearchParams,
    document:{
      getElementById(id){if(id==="periodo")return {value:"ano"};if(id==="exercicio")return {value:"2026"};if(id==="coverageItems")return coverage;return null;},
      querySelectorAll:()=>charts,
      createElement:()=>({className:"",textContent:""})
    },
    currentDashboardFilters:()=>({}),
    api:async()=>{throw Object.assign(new Error("INITIAL_LOAD_REQUIRED"),{status:409});},
    setRefreshBusy(){},setDashboardLoading(){},setStatus:(type,message)=>status.push({type,message}),
    console:{warn(){}},renderPayload(){throw new Error("failed dashboard must not render another system's data");}
  });
  vm.runInContext(source.slice(start,end)+source.slice(helperStart,helperEnd),context);
  await vm.runInContext("loadRealMultiSystemDashboard('visao-geral')",context);
  assert.equal(charts[0].title.textContent,"Dados indisponíveis");
  assert.match(charts[0].detail.textContent,/Nenhuma carga tributária salva/);
  assert.match(coverage.children[0].textContent,/As cargas dos outros sistemas/);
  assert.deepEqual(status.at(-1),{type:"error",message:"Nenhuma carga tributária foi encontrada para esta entidade. As cargas dos outros sistemas permanecem separadas."});
});

test("Worker maps a missing initial load to HTTP 409",()=>{
  const worker=fs.readFileSync("backend/worker.js","utf8").replace(/\r\n/g,"\n");
  const start=worker.indexOf("function errorResponse(request,env,error) {");
  const end=worker.indexOf("\n\n\nconst PANEL_PREVIEW_FIELDS",start);
  assert.ok(start>=0&&end>start,"Worker error response handler exists");
  const handler=vm.runInNewContext(worker.slice(start,end)+";errorResponse",{
    json:(_request,_env,status,body)=>({status,body})
  });
  const result=handler({}, {}, new Error("INITIAL_LOAD_REQUIRED"));
  assert.equal(result.status,409);
  assert.equal(result.body.error,"INITIAL_LOAD_REQUIRED");
});

test("real dashboard builders fail closed when D1 has no source instead of loading synthetic samples",async()=>{
  const worker=fs.readFileSync("backend/worker.js","utf8");
  const cases=[
    ["buildAccountingDashboard","buildProcurementDashboard","buildAccountingSampleDashboard"],
    ["buildProcurementDashboard","buildAccountingSampleDashboard","buildProcurementSampleDashboard"],
    ["buildPayrollDashboard","buildPayrollSampleDashboard","buildPayrollSampleDashboard"]
  ];
  for(const [name,next,sampleName] of cases){
    const start=worker.indexOf("async function "+name+"(");
    const end=worker.indexOf("async function "+next+"(",start+1);
    assert.ok(start>=0&&end>start,name+" source range");
    const context={
      getMultiSystemSummary:async()=>null,
      [sampleName]:()=>{throw Error("SYNTHETIC_SAMPLE_FORBIDDEN");},
      URL
    };
    const fn=vm.runInNewContext(worker.slice(start,end)+";"+name,context);
    await assert.rejects(
      ()=>fn({}, {id:"paulafreitas",name:"Paula Freitas"},new URL("https://example.test/?exercicio=2026")),
      error=>error.message==="INITIAL_LOAD_REQUIRED",
      name+" must report missing real data"
    );
  }
});


test("D1 summary must match its ingestion checkpoint before financial aggregates can be shown",async()=>{
  const source=fs.readFileSync("backend/worker.js","utf8");
  const start=source.indexOf("async function getMultiSystemSummary(");
  const end=source.indexOf("function multiSystemResourcePrefix(",start);
  assert.ok(start>=0&&end>start);
  const fn=vm.runInNewContext(source.slice(start,end)+";getMultiSystemSummary",{
    emptyMultiSystemSummary:(_system,resource)=>({resource,monthly:{},groups:{}}),
    parseMultiSystemFieldProfile:()=>({selected:["id"]})
  });
  const load={status:"complete",loaded:3,pages:1,updated_at:"2026-10-27T07:00:00Z"};
  const fakeDb=(summaryRow,checkpoint)=>({
    prepare(sql){return {bind(){return {async first(){
      return sql.includes("LEFT JOIN")?summaryRow:checkpoint;
    }}}}}
  });
  const stale={summary_json:JSON.stringify({resource:"empenhos",count:2,monthly:{"2026-01":1000},groups:{x:2}}),...load};
  const recovered=await fn({AUTH_DB:fakeDb(stale,load)},"paulafreitas","contabil","empenhos");
  assert.equal(recovered.summaryMissing,true);
  assert.equal(recovered.count,3);
  assert.equal(recovered.loadStatus,"complete");
  assert.equal(Object.keys(recovered.monthly).length,0);
  assert.equal(Object.keys(recovered.groups).length,0);
  const matching={...stale,summary_json:JSON.stringify({resource:"empenhos",count:3,monthly:{"2026-01":1000}})};
  const real=await fn({AUTH_DB:fakeDb(matching,load)},"paulafreitas","contabil","empenhos");
  assert.equal(real.summaryMissing,undefined);
  assert.equal(real.monthly["2026-01"],1000);
  const orphan=await fn({AUTH_DB:fakeDb({...matching,status:null,loaded:null},null)},"paulafreitas","contabil","empenhos");
  assert.equal(orphan,null);
});
