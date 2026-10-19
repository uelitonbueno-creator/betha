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
        return null;
      },
      querySelectorAll(selector){
        assert.equal(selector,"#dashboardView #chartGrid .chart-empty");
        return charts;
      }
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
  assert.deepEqual(Array.from(refresh),[true,false]);
});
