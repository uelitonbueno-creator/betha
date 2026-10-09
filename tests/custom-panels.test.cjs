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
