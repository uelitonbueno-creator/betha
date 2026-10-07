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

test("homes de Contabilidade, Compras e Folha possuem duas tabelas executivas", () => {
  const window = loadCatalogs();
  for (const id of ["contabil-visao-geral", "compras-visao-geral", "folha-visao-geral"]) {
    const dashboard = window.BI_DASHBOARDS[id];
    assert.ok(dashboard, "dashboard ausente: " + id);
    assert.equal(dashboard.summaryTables.length, 2, id + " deve ter duas tabelas executivas");
    for (const table of dashboard.summaryTables) {
      assert.ok(table.title, id + " possui tabela sem título");
      assert.ok(table.group, id + " possui tabela sem agrupamento");
      assert.ok(Array.isArray(table.columns) && table.columns.length >= 2, id + " possui tabela sem colunas");
    }
  }
});

test("tabelas executivas locais mantêm chave de agrupamento para drill-down", () => {
  const window = loadCatalogs();
  const samples = {
    contabil: JSON.parse(fs.readFileSync(path.join(ROOT, "data", "samples", "contabil-100.json"), "utf8")),
    compras: JSON.parse(fs.readFileSync(path.join(ROOT, "data", "samples", "compras-100.json"), "utf8")),
    folha: JSON.parse(fs.readFileSync(path.join(ROOT, "data", "samples", "folha-100.json"), "utf8"))
  };
  for (const id of ["contabil-visao-geral", "compras-visao-geral", "folha-visao-geral"]) {
    const dashboard = window.BI_DASHBOARDS[id];
    const row = samples[dashboard.system].rows[0];
    for (const table of dashboard.summaryTables) {
      assert.ok(Object.prototype.hasOwnProperty.call(row, table.group), id + " não possui campo de drill " + table.group);
    }
  }
});

test("frontend registra interação acessível para drill-down das tabelas executivas", () => {
  const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  assert.match(app, /summary-table-row-drill/);
  assert.match(app, /openLocalSampleSummaryDetail/);
  assert.match(app, /\["Enter"," "\]/);
  assert.match(app, /AMOSTRA LOCAL · SEM CONSUMO DA API/);
});

test("KPIs e gráficos das amostras usam drill-down local sem consultar detalhe remoto", () => {
  const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  assert.match(app, /if\(def\.localSample\)\{openLocalSampleKpiDetail\(kpi\);return;\}/);
  assert.match(app, /if\(dashboards\[currentView\]\?\.localSample\)\{openLocalSampleChartDetail\(chartDef,selected\);return;\}/);
  const kpiStart = app.indexOf("function openLocalSampleKpiDetail");
  const chartStart = app.indexOf("function openLocalSampleChartDetail");
  const remoteStart = app.indexOf("function openKpiDetail");
  assert.ok(kpiStart >= 0 && chartStart >= 0 && remoteStart > chartStart);
  const localBlock = app.slice(kpiStart, remoteStart);
  assert.doesNotMatch(localBlock, /loadDetailRecords\(/);
  assert.match(localBlock, /localSampleDetailTable/);
  assert.match(localBlock, /AMOSTRA LOCAL · SEM CONSUMO DA API/);
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
    "systemHeaderContext", "sampleModeBadge", "primaryDynamicFilters", "tableGrid",
    "mobileContextBar", "mobileEntitySelect", "mobileSystemSelect", "mobilePanelSelect"
  ]) {
    assert.match(html, new RegExp('id="' + id + '"'), "id ausente: " + id);
  }
  assert.match(html, /menu-bg-color="#0b2842"/);
  assert.match(html, />BI VELLA</);
});

test("navegação móvel mantém contexto Entidade → Sistema → Painel sincronizado", () => {
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const css = fs.readFileSync(path.join(ROOT, "style.css"), "utf8");

  for (const id of ["mobileEntitySelect", "mobileSystemSelect", "mobilePanelSelect"]) {
    assert.match(html, new RegExp('id="' + id + '"'));
  }
  assert.match(app, /function syncMobileContextSelectors\(\)/);
  assert.match(app, /mobileEntitySelect\?\.addEventListener\("change"/);
  assert.match(app, /mobileSystemSelect\?\.addEventListener\("change"/);
  assert.match(app, /mobilePanelSelect\?\.addEventListener\("change"/);
  assert.match(css, /@media\(max-width:1100px\)[\s\S]*?\.mobile-context-bar/);
  assert.match(css, /@media\(max-width:768px\)[\s\S]*?\.mobile-context-panel/);
  assert.match(css, /@media\(max-width:430px\)[\s\S]*?\.mobile-context-bar/);
  assert.match(css, /@media\(max-width:390px\)[\s\S]*?\.mobile-context-bar/);
});

test("todos os 46 dashboards possuem permissão funcional explícita", () => {
  const window = loadCatalogs();
  const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const start = app.indexOf("const PAGE_PERMISSION_IDS = Object.freeze({");
  const end = app.indexOf("\n  });", start);
  assert.ok(start >= 0 && end > start, "PAGE_PERMISSION_IDS não encontrado");
  const objectSource = app.slice(
    app.indexOf("{", start),
    end + 4
  );
  const permissions = new Function("return (" + objectSource + ")")();
  for (const id of Object.keys(window.BI_DASHBOARDS)) {
    assert.ok(permissions[id], "dashboard sem permissão: " + id);
  }
});

test("permissões locais são fail-closed para usuário comum e sistemas não autorizados ficam ocultos", () => {
  const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  assert.match(app, /privileged\|\|currentAllowedViews\.has\(view\)/);
  assert.match(app, /function tenantCanAccessSystem\(/);
  assert.match(app, /accessibleSystemsForTenant\(\)/);
  assert.match(app, /Este sistema não possui painéis liberados para o seu acesso/);
});

test("worker reconhece permissões multi-sistema sem anunciar amostras no MCP real", () => {
  const worker = fs.readFileSync(path.join(ROOT, "backend", "worker.js"), "utf8");
  for (const permission of [
    "BIContabilVisaoGeralPage",
    "BIContabilExecucaoOrcamentariaPage",
    "BIComprasVisaoGeralPage",
    "BIComprasContratosPage",
    "BIFolhaVisaoGeralPage",
    "BIFolhaServidoresPage"
  ]) {
    assert.match(worker, new RegExp(permission));
  }
  assert.match(worker, /const BI_PERMISSION_VIEW_MAP = Object\.freeze/);
  assert.match(worker, /permissionViewsForAccess\(auth\.access\)\.filter\(view=>Boolean\(dashboardBuilder\(view\)\)\)/);
});

test("gestão de usuários agrupa permissões por sistema", () => {
  const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  assert.match(app, /permission-system-group/);
  assert.match(app, /data-permission-group-toggle/);
  assert.match(app, /groups=systems\.map/);
});

test("frontend não expõe User-Access ou access token em configuração pública", () => {
  const config = fs.readFileSync(path.join(ROOT, "config.js"), "utf8");
  assert.doesNotMatch(config, /User-Access\s*[:=]\s*["'][^"']+["']/i);
  assert.doesNotMatch(config, /accessToken\s*[:=]\s*["'][^"']+["']/i);
});
