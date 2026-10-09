"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const worker = fs.readFileSync(path.join(__dirname, "..", "backend", "worker.js"), "utf8");
const builder = fs.readFileSync(path.join(__dirname, "..", "custom-panel-builder.js"), "utf8");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

function sliceBetween(source, start, end) {
  const i = source.indexOf(start);
  const j = source.indexOf(end, i + start.length);
  assert.ok(i >= 0 && j > i, "Trecho esperado não localizado: " + start);
  return source.slice(i, j);
}

const catalogCode = sliceBetween(worker, "const CUSTOM_PANEL_SOURCES=", "let customPanelD1SchemaReady=");
const validateCode = sliceBetween(worker, "function validateCustomPanel(", "async function handleCustomPanelRequest(");
const sandbox = {
  panelReadAuthorized(auth, source) {
    if (auth.denied?.includes(source)) throw Error("DATA_RESOURCE_PERMISSION_DENIED");
  }
};
vm.createContext(sandbox);
vm.runInContext(catalogCode + validateCode + "\nthis.validatePanel=validateCustomPanel;this.catalog=CUSTOM_PANEL_SOURCES;", sandbox);

const defaults = {
  config_version: 1, name: "Débitos em aberto por bairro", system: "tributos",
  source: "bi:debitos", dimension: "bairro", measure: "saldo",
  aggregation: "sum", chart: "bar", limit: 20, filters: []
};
const validate = (overrides={}, access={denied:[]}) => sandbox.validatePanel({...defaults, ...overrides}, access);

test("catálogo usa os campos normalizados pelo Worker", () => {
  assert.ok(sandbox.catalog["bi:debitos"].measures.includes("saldo"));
  assert.ok(sandbox.catalog["bi:debitos"].measures.includes("lancado"));
  assert.ok(sandbox.catalog["bi:pagamentos"].measures.includes("pago"));
  assert.ok(sandbox.catalog["bi:pagamentos"].dimensions.includes("pagamento"));
  assert.ok(!sandbox.catalog["bi:debitos"].measures.includes("valorSaldo"));
});

test("salva configuração permitida e preserva o limite Top N", () => {
  const result = validate({limit: 50, filters:[{field:"situacao",operator:"eq",value:"ABERTO"}]});
  assert.equal(result.limit, 50);
  assert.equal(result.filters.length, 1);
  assert.equal(result.config_version, 1);
});

test("rejeita métrica desconhecida ou texto com agregação numérica", () => {
  assert.throws(() => validate({measure:"bairro",aggregation:"sum"}), /CUSTOM_PANEL_FIELD_INVALID/);
  assert.throws(() => validate({measure:"valorSaldo"}), /CUSTOM_PANEL_FIELD_INVALID/);
});

test("rejeita fontes e combinações não autorizadas", () => {
  assert.throws(() => validate({source:"bi:folha-servidores"}), /CUSTOM_PANEL_SOURCE_INVALID/);
  assert.throws(() => validate({}, {denied:["bi:debitos"]}), /DATA_RESOURCE_PERMISSION_DENIED/);
  assert.throws(() => validate({system:"compras"}), /CUSTOM_PANEL_SOURCE_INVALID/);
});

test("rejeita filtros e limites não catalogados", () => {
  assert.throws(() => validate({filters:[{field:"sql",operator:"eq",value:"1"}]}), /CUSTOM_PANEL_FILTER_INVALID/);
  assert.throws(() => validate({filters:[{field:"ano",operator:"execute",value:"1"}]}), /CUSTOM_PANEL_FILTER_INVALID/);
  assert.throws(() => validate({limit:100000}), /CUSTOM_PANEL_LIMIT_INVALID/);
  assert.throws(() => validate({filters:Array.from({length:7},()=>({field:"ano",operator:"eq",value:"2026"}))}), /CUSTOM_PANEL_FILTER_INVALID/);
});

test("isolamento por tenant e usuário nas consultas D1", () => {
  for (const sql of [
    "WHERE tenant_id=?1 AND user_id=?2 AND system=?3",
    "WHERE id=?1 AND tenant_id=?2 AND user_id=?3"
  ]) assert.ok(worker.includes(sql), "Faltando escopo SQL: " + sql);
});

test("a prévia não precisa inicializar D1 e só usa fonte com permissão", () => {
  assert.ok(worker.includes('url.pathname==="/api/custom-panels/preview"?null:await customPanelDb(env)'));
  assert.ok(worker.includes("panelReadAuthorized(auth,source)"));
  assert.ok(worker.includes("const pageCount=Math.min") || worker.includes("pageCount=Math.min"));
});

test("HTML e construtor oferecem entradas de navegação desktop e mobile", () => {
  for(const id of ["customPanelSidebar", "customPanelSidebarItems", "mobileCustomPanelButton"])
    assert.ok(html.includes('id="'+id+'"'));
  assert.ok(builder.includes('request("/api/custom-panels/catalog")'));
  assert.ok(builder.includes('async function loadSidebar('));
  assert.ok(builder.includes("authorizedSources.has(id)"));
});

test("motor paginado soma blocos sucessivos sem enviar registros brutos", async () => {
  const engineCode=sliceBetween(worker,"function customPanelDimensionValue(","async function handleCustomPanelRequest(");
  const runtime={
    panelNumber(value){return value==null||value===""?null:Number(value);},
    normalizePanelRow(row){return row;},
    syncConfig:async()=>({latestJob:"aa000000-0000-0000-0000-000000000000"}),
    syncJob:async()=>({sources:{"bi:debitos":{pages:15,complete:true}},finishedAt:"2026-10-09T15:00:00Z"}),
    syncScope:async()=>"test-scope",
    json(_request,_env,status,body){return {status,body};},
    Error,Number,Map,Object,Math,Date,String,Array
  };
  const pages=new Map();
  for(let p=0;p<15;p++)pages.set("test-scope:rows:aa000000-0000-0000-0000-000000000000:bi:debitos:"+p,[
    {bairro:"Centro",ano:"2026",saldo:10},{bairro:"Centro",ano:"2026",saldo:null},
    {bairro:"Sul",ano:"2025",saldo:20}
  ]);
  const env={BI_SESSIONS:{get:async key=>pages.get(key)||null}};
  vm.createContext(runtime);
  vm.runInContext(engineCode+"\nthis.queryBatch=customPanelQueryBatch;",runtime);
  const config={...defaults,filters:[{field:"ano",operator:"eq",value:"2026"}]};
  const first=await runtime.queryBatch({},env,{},config,{});
  assert.equal(first.status,200);
  assert.equal(first.body.total.sum,120);
  assert.equal(first.body.total.count,12);
  assert.equal(first.body.scanned,36);
  assert.equal(first.body.groups.length,1);
  assert.ok(first.body.cursor);
  assert.equal(first.body.groups[0].label,"Centro");
  const second=await runtime.queryBatch({},env,{},config,{cursor:first.body.cursor});
  assert.equal(second.body.cursor,null);
  assert.equal(second.body.sourceComplete,true);
  assert.equal(first.body.total.sum+second.body.total.sum,150);
  assert.equal(first.body.loaded+second.body.loaded,15);
  assert.ok(!Object.hasOwn(first.body,"rows"),"Endpoint só devolve agregados por categoria");
});

test("consulta paginada rejeita cursor inválido e não declara carga parcial como completa", async () => {
  const engineCode=sliceBetween(worker,"function customPanelDimensionValue(","async function handleCustomPanelRequest(");
  let completed=false;
  const runtime={
    panelNumber(value){return value==null?null:Number(value);},
    normalizePanelRow(row){return row;},
    syncConfig:async()=>({latestJob:"bb000000-0000-0000-0000-000000000000"}),
    syncJob:async()=>({sources:{"bi:debitos":{pages:1,complete:completed}}}),
    syncScope:async()=>"scope",
    json(_request,_env,status,body){return {status,body};},
    Error,Number,Map,Object,Math,Date,String,Array
  };
  const env={BI_SESSIONS:{get:async()=>[{bairro:"Centro",saldo:1}]}};
  vm.createContext(runtime);
  vm.runInContext(engineCode+"\nthis.queryBatch=customPanelQueryBatch;",runtime);
  await assert.rejects(runtime.queryBatch({},env,{},defaults,{cursor:{jobId:"invalido",nextPage:0,snapshotPages:1}}),/CUSTOM_PANEL_CURSOR_INVALID/);
  const partial=await runtime.queryBatch({},env,{},defaults,{});
  assert.equal(partial.body.sourceComplete,false);
  completed=true;
  const complete=await runtime.queryBatch({},env,{},defaults,{});
  assert.equal(complete.body.sourceComplete,true);
});

test("agrupamentos de pagamento respeitam mês, dia, ano e ordem cronológica", () => {
  const timeCode=sliceBetween(worker,"function customPanelDimensionValue(","function customPanelNewAggregate()");
  const runtime={panelDate:v=>new Date(v),panelNumber:v=>v==null?null:Number(v)};
  vm.createContext(runtime);
  vm.runInContext(timeCode+"\nthis.dimension=customPanelDimensionValue;this.matches=customPanelRowMatches;this.sortRows=customPanelSortRows;",runtime);
  const record={pagamento:"2026-10-09T12:00:00Z"};
  assert.equal(runtime.dimension(record,"pagamento:mes"),"2026-10");
  assert.equal(runtime.dimension(record,"pagamento:dia"),"2026-10-09");
  assert.equal(runtime.dimension(record,"pagamento:ano"),"2026");
  assert.ok(runtime.matches(record,[{field:"pagamento:mes",operator:"gte",value:"2026-09"}]));
  assert.equal(runtime.matches(record,[{field:"pagamento:mes",operator:"lt",value:"2026-09"}]),false);
  const ordered=runtime.sortRows([{label:"2026-03",value:100},{label:"2026-10",value:20},{label:"2026-06",value:40}],"pagamento:mes",2);
  assert.equal(ordered[0].label,"2026-06");
  assert.equal(ordered[1].label,"2026-10");
});

test("débitos e pagamentos aceitam contagem real de registros", () => {
  assert.ok(sandbox.catalog["bi:debitos"].measures.includes("count"));
  assert.ok(sandbox.catalog["bi:pagamentos"].measures.includes("count"));
  assert.equal(validate({measure:"count",aggregation:"count"}).aggregation,"count");
  assert.throws(()=>validate({measure:"count",aggregation:"sum"}),/CUSTOM_PANEL_AGGREGATION_INVALID/);
});
