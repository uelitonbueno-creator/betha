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
        assert.equal(selector,"#dashboardView [data-chart] .chart-empty");
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
    clearRealDashboardSnapshot(){},
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
    console:{warn(){}},clearRealDashboardSnapshot(){},
    renderPayload(){throw new Error("failed dashboard must not render another system's data");}
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

test("production subpanels never read local synthetic files or expose sample badges",async()=>{
  const source=fs.readFileSync("app.js","utf8");
  const subpanelStart=source.indexOf("  function showRealSubpanelUnavailable(");
  const dispatchEnd=source.indexOf("  function setRefreshBusy(",subpanelStart);
  const sampleStart=source.indexOf("  async function loadLocalSampleDashboard(");
  const sampleEnd=source.indexOf("  async function loadRealMultiSystemDashboard(",sampleStart);
  assert.ok(subpanelStart>0&&dispatchEnd>subpanelStart&&sampleStart>0&&sampleEnd>sampleStart);
  for(const [system,view] of [
    ["contabil","contabil-despesa"],
    ["compras","compras-processos"],
    ["folha","folha-mensal"]
  ]){
    const statuses=[],charts=[],coverage=[],loads=[];
    const badge={hidden:false};
    const context=vm.createContext({
      HOME_VIEW:"inicio",DEFAULT_VIEW:"visao-geral",
      REAL_MULTI_SYSTEM_HOME_VIEWS:new Set(["contabil-visao-geral","compras-visao-geral","folha-visao-geral"]),
      REAL_MULTI_SYSTEM_IDS:new Set(["contabil","compras","folha"]),
      dashboards:{[view]:{system,localSample:{file:"data/samples/"+system+"-100.json"}}},
      currentSystemId:system,currentView:view,dashboardLoadGeneration:0,
      document:{getElementById:id=>id==="sampleModeBadge"?badge:null},
      setRefreshBusy:value=>loads.push(["refresh",value]),
      setDashboardLoading:value=>loads.push(["loading",value]),
      markDashboardChartsUnavailable:message=>charts.push(message),
      markDashboardCoverageUnavailable:message=>coverage.push(message),
      setLastUpdated:value=>loads.push(["updated",value]),
      clearRealDashboardSnapshot(){},
      setStatus:(type,message)=>statuses.push({type,message}),
      loadRealMultiSystemDashboard:()=>{throw Error("Unexpected home loader");},
      loadApiPanelDashboard:()=>{throw Error("Unexpected API loader");},
      currentSystemInfo:()=>({homeView:"contabil-visao-geral"}),
      fetch:()=>{throw Error("SYNTHETIC_FETCH_FORBIDDEN");}
    });
    vm.runInContext(source.slice(subpanelStart,dispatchEnd),context);
    await vm.runInContext("loadDashboardData("+JSON.stringify(view)+")",context);
    assert.equal(badge.hidden,true,system+": sample badge visible");
    assert.equal(statuses.at(-1).type,"error",system+": no error state");
    assert.match(statuses.at(-1).message,/Nenhuma amostra sintética/);
    assert.match(charts.at(-1),/fonte real homologada/);
    assert.match(coverage.at(-1),/Nenhum dado sintético/);
    assert.ok(loads.some(item=>item[0]==="loading"&&item[1]===false));
    // Direct invocation is also guarded against future routing regressions.
    vm.runInContext(source.slice(sampleStart,sampleEnd),context);
    // The separate snapshot-reset regression tests the helper with a full DOM.
    vm.runInContext("clearRealDashboardSnapshot=()=>{}",context);
    await vm.runInContext("loadLocalSampleDashboard("+JSON.stringify(view)+")",context);
    assert.equal(statuses.length,2,system+": direct sample loader must be blocked");
  }
  assert.match(source,/if\(REAL_MULTI_SYSTEM_IDS\.has\(currentSystemId\)&&payload\?\.meta\?\.realData!==true\)/,
    "renderPayload must reject unverified synthetic or cached payloads");
});


test("real dashboard refresh clears stale KPIs, charts, tables and CSV snapshot before fetching",async()=>{
  const source=fs.readFileSync("app.js","utf8");
  const start=source.indexOf("  function clearRealDashboardSnapshot(");
  const end=source.indexOf("  async function loadRealMultiSystemDashboard(",start);
  const loadEnd=source.indexOf("  function showRealSubpanelUnavailable(",end);
  assert.ok(start>0&&end>start&&loadEnd>end);
  const kpis=[{textContent:"R$ 100,00"},{textContent:"42"}];
  const empties=[{hidden:true},{hidden:true}];
  const tables={hidden:false,children:["old"],replaceChildren(){this.children=[];}};
  const heading={hidden:false};
  const attention={children:["old"],replaceChildren(){this.children=[];}};
  const executive={children:["primary chart card"]};
  let destroyed=0,updated="old",apiSawCleared=false;
  const context=vm.createContext({
    currentPayload:{meta:{realData:true},kpis:{empenhado:100}},
    dashboardLoadGeneration:0,tenantId:"paulafreitas",currentView:"contabil-visao-geral",
    currentSystemId:"contabil",currentYear:2026,URLSearchParams,
    document:{
      querySelectorAll(selector){
        if(selector==="#kpiGrid [data-value]")return kpis;
        if(selector==="#dashboardView [data-chart] .chart-empty")return empties;
        throw Error("Unexpected selector: "+selector);
      },
      getElementById(id){
        if(id==="tableGrid")return tables;
        if(id==="tableSectionHeading")return heading;
        if(id==="overviewAttention")return attention;
        if(id==="overviewExecutive")return executive;
        if(id==="periodo")return {value:"ano"};
        if(id==="exercicio")return {value:"2026"};
        return null;
      }
    },
    destroyCharts(){destroyed++;},
    setLastUpdated:value=>{updated=value;},
    currentDashboardFilters:()=>({}),
    setRefreshBusy(){},setDashboardLoading(){},setStatus(){},
    api:async()=>{
      apiSawCleared=vm.runInContext("currentPayload===null",context)&&kpis.every(x=>x.textContent==="—")&&empties.every(x=>x.hidden===false)&&tables.children.length===0;
      throw Error("NETWORK_FAILURE");
    },
    markDashboardChartsUnavailable(){},markDashboardCoverageUnavailable(){},
    console:{warn(){}}
  });
  vm.runInContext(source.slice(start,loadEnd),context);
  await vm.runInContext("loadRealMultiSystemDashboard('contabil-visao-geral')",context);
  assert.equal(apiSawCleared,true,"stale dashboard was visible during refresh");
  assert.equal(vm.runInContext("currentPayload",context),null,"stale payload must not be exportable");
  assert.equal(destroyed,1);
  assert.equal(updated,null);
  assert.equal(tables.hidden,true);
  assert.equal(heading.hidden,true);
  assert.equal(attention.children.length,0);
  assert.deepEqual(executive.children,["primary chart card"],"primary chart must survive refresh");
});


test("fragmented dashboard aggregation never turns null or empty metrics into zero",()=>{
  const source=fs.readFileSync("app.js","utf8");
  const start=source.indexOf("  function mergeDashboardPart(");
  const end=source.indexOf("  function ",start+12);
  assert.ok(start>=0&&end>start,"dashboard merge helper exists");
  const merge=vm.runInNewContext(source.slice(start,end)+";mergeDashboardPart");
  const part=(kpis,data)=>({
    kpis,charts:{monthly:{labels:["Jan","Fev","Mar","Abr"],datasets:[{label:"Valor",data}]}},
    meta:{sourceRows:{},sourceTotals:{},sourceAudit:{}}
  });
  const target={};
  merge(target,part({total:100,partial:10,validZero:0},[0,100,null,""]));
  merge(target,part({total:null,partial:5,validZero:0},[0,null,5,7]));
  merge(target,part({total:10,partial:3,validZero:0},[0,7,9,4]));
  assert.equal(target.kpis.total,null,"a missing fragment must invalidate the total");
  assert.equal(target.kpis.partial,18,"fully validated fragments still add");
  assert.equal(target.kpis.validZero,0,"a validated zero must remain zero");
  assert.deepEqual(Array.from(target.charts.monthly.datasets[0].data),[0,null,null,null],
    "null, empty and missing values must not become synthetic zeros");
  const another={};
  merge(another,part({total:null},[null,0,1,2]));
  merge(another,part({total:20},[5,0,3,4]));
  assert.equal(another.kpis.total,null,"a later valid fragment cannot restore an invalid total");
  assert.equal(another.charts.monthly.datasets[0].data[0],null);
});

test("KPI, chart drill-down and detailed currency preserve unavailable values",()=>{
  const source=fs.readFileSync("app.js","utf8");
  const extract=(start,end)=>{
    const a=source.indexOf(start),b=source.indexOf(end,a+start.length);
    assert.ok(a>=0&&b>a,start+" must exist");
    return source.slice(a,b);
  };
  const ctx=vm.createContext({
    escapeHtml:value=>String(value),
    datasetAllowedForKpi:()=>true
  });
  vm.runInContext(
    extract("  function formatValue(","  function destroyCharts(")+
    extract("  function valueDisplay(","  function sourceOriginHtml(")+
    extract("  function formatDetailCell(","  function detailPageTable("),ctx
  );
  const formatValue=vm.runInContext("formatValue",ctx);
  const valueDisplay=vm.runInContext("valueDisplay",ctx);
  const detail=vm.runInContext("formatDetailCell",ctx);
  for(const invalid of [null,undefined,"","  ",false,NaN,Infinity]){
    assert.equal(formatValue(invalid,"currency"),"—","KPI currency must not invent zero");
    assert.equal(formatValue(invalid,"percent"),"—","KPI percent must not invent zero");
    assert.equal(valueDisplay(invalid,"currency"),"—","chart cell must not invent zero");
  }
  for(const invalid of [null,undefined,"","  ",false,NaN]){
    assert.equal(detail(invalid,"currency"),"—","detail currency must not invent zero");
  }
  assert.match(formatValue(0,"currency"),/0,00/,"valid zero remains visible");
  assert.equal(formatValue(0,"percent"),"0%");
  assert.match(detail(0,"currency"),/0,00/);

  const chartSeriesTable=vm.runInContext("chartSeriesTable",ctx);
  const chartDef={title:"Empenhos mensais"};
  const make=data=>({labels:["Jan","Fev"],datasets:[{label:"Valor",data}],format:"currency"});
  const incomplete=chartSeriesTable(chartDef,make([100,null]));
  assert.match(incomplete,/<tfoot>[\\s\\S]*?<th>—<\\/th>/,"incomplete total must be unavailable");
  assert.doesNotMatch(incomplete,/detail-percent/,"partial series must not imply validated percentages");
  const complete=chartSeriesTable(chartDef,make([100,0]));
  assert.match(complete,/<tfoot>[\\s\\S]*?100,00/,"complete total must remain available");
  assert.match(complete,/detail-percent/,"complete series may show validated percentages");
  const short=chartSeriesTable(chartDef,make([100]));
  assert.match(short,/<tfoot>[\\s\\S]*?<th>—<\\/th>/,"missing label must invalidate total");
});
