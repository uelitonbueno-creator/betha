const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

function loadCatalogs() {
  const window = {};
  const dashboardCode = fs.readFileSync(path.join(ROOT, "dashboard-catalog.js"), "utf8");
  const systemCode = fs.readFileSync(path.join(ROOT, "system-catalog.js"), "utf8");
  new Function("window", dashboardCode)(window);
  new Function("window", systemCode)(window);
  return window;
}

test("BI Vella expõe quatro sistemas com homeView válida", () => {
  const window = loadCatalogs();
  assert.equal(window.BI_SYSTEMS.length, 4);
  assert.deepEqual(window.BI_SYSTEMS.map(item => item.id), ["tributos", "contabil", "compras", "folha"]);
  for (const system of window.BI_SYSTEMS) {
    assert.ok(window.BI_DASHBOARDS[system.homeView], system.id + " sem homeView");
  }
});

test("menus contextuais não apontam para painéis de outro sistema", () => {
  const window = loadCatalogs();
  for (const system of window.BI_SYSTEMS) {
    const routes = [];
    for (const item of system.menu || []) {
      if (item.rota) routes.push(item.rota);
      for (const sub of item.submenus || []) if (sub.rota) routes.push(sub.rota);
    }
    assert.equal(routes[0], system.homeView, system.id + " deve começar em Início/homeView");
    for (const route of routes) {
      const def = window.BI_DASHBOARDS[route];
      assert.ok(def, system.id + " possui rota sem dashboard: " + route);
      const owner = def.system || "tributos";
      assert.equal(owner, system.id, route + " pertence a " + owner + ", não " + system.id);
    }
  }
});

test("painéis complementares multi-sistema estão registrados", () => {
  const window = loadCatalogs();
  const required = [
    "contabil-execucao-orcamentaria", "contabil-empenhos", "contabil-restos",
    "contabil-demonstrativos", "contabil-relatorios",
    "compras-atas", "compras-itens",
    "folha-vinculos", "folha-cargos", "folha-departamentos",
    "folha-beneficios", "folha-despesas"
  ];
  for (const id of required) assert.ok(window.BI_DASHBOARDS[id], "dashboard ausente: " + id);
});


test("menus dos sistemas são diretos e não duplicam Visão Geral", () => {
  const window = loadCatalogs();
  for (const system of window.BI_SYSTEMS) {
    assert.equal(system.menu[0].descricao, "Início");
    assert.equal(system.menu[0].rota, system.homeView);
    assert.equal(system.menu.filter(item => item.descricao === "Início").length, 1);
    assert.equal(system.menu.some(item => Array.isArray(item.submenus) && item.submenus.length), false);
  }
});

test("painéis locais possuem filtros contextuais configurados", () => {
  const window = loadCatalogs();
  const expected = {
    contabil: ["unidade", "status", "fonteRecurso", "credor"],
    compras: ["secretaria", "modalidade", "status", "fornecedor"],
    folha: ["secretaria", "vinculo", "status", "cargo"]
  };
  for (const [system, ids] of Object.entries(expected)) {
    const dashboards = Object.values(window.BI_DASHBOARDS).filter(item => item.system === system);
    assert.ok(dashboards.length, "dashboard ausente para " + system);
    for (const dashboard of dashboards) {
      assert.deepEqual(dashboard.filters.map(item => item.id), ids, dashboard.title + " sem filtros padrão de " + system);
    }
  }
});

test("amostras locais continuam com exatamente 100 registros", () => {
  for (const file of ["contabil-100.json", "compras-100.json", "folha-100.json"]) {
    const doc = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "samples", file), "utf8"));
    assert.equal(doc.recordCount, 100, file + " recordCount");
    assert.equal(doc.rows.length, 100, file + " rows");
  }
});

test("shell do layout possui contexto lateral, cabeçalho e tabelas analíticas", () => {
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  for (const id of [
    "sidebarEntityButton", "sidebarEntityList", "systemRailList",
    "systemHeaderContext", "sampleModeBadge", "primaryDynamicFilters", "tableGrid"
  ]) {
    assert.match(html, new RegExp('id="' + id + '"'), "id ausente: " + id);
  }
  assert.match(html, /menu-bg-color="#0b2842"/);
  assert.match(html, />BI VELLA</);
});

test("frontend não expõe User-Access ou access token em configuração pública", () => {
  const config = fs.readFileSync(path.join(ROOT, "config.js"), "utf8");
  assert.doesNotMatch(config, /User-Access\s*[:=]\s*["'][^"']+["']/i);
  assert.doesNotMatch(config, /accessToken\s*[:=]\s*["'][^"']+["']/i);
});
