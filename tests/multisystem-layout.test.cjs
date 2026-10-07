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

test("painéis locais possuem filtros específicos do assunto e campos válidos", () => {
  const window = loadCatalogs();
  const samples = {
    contabil: JSON.parse(fs.readFileSync(path.join(ROOT, "data", "samples", "contabil-100.json"), "utf8")),
    compras: JSON.parse(fs.readFileSync(path.join(ROOT, "data", "samples", "compras-100.json"), "utf8")),
    folha: JSON.parse(fs.readFileSync(path.join(ROOT, "data", "samples", "folha-100.json"), "utf8"))
  };
  const expectedPrimary = {
    "contabil-despesa": ["unidade", "funcao"],
    "contabil-receita": ["unidade", "fonteRecurso"],
    "contabil-empenhos": ["unidade", "status"],
    "compras-contratos": ["secretaria", "fornecedor"],
    "compras-itens": ["itemCategoria", "secretaria"],
    "folha-servidores": ["secretaria", "status"],
    "folha-departamentos": ["departamento", "secretaria"],
    "folha-beneficios": ["beneficio", "secretaria"]
  };

  for (const [id, dashboard] of Object.entries(window.BI_DASHBOARDS)) {
    if (!samples[dashboard.system]) continue;
    assert.ok(Array.isArray(dashboard.filters) && dashboard.filters.length >= 3, id + " deve ter filtros contextuais");
    const sampleKeys = new Set(Object.keys(samples[dashboard.system].rows[0] || {}));
    for (const filter of dashboard.filters) {
      assert.ok(sampleKeys.has(filter.field || filter.id), id + " usa campo inexistente: " + (filter.field || filter.id));
    }
    const primary = dashboard.filters.filter(filter => filter.primary !== false).slice(0, 2).map(filter => filter.id);
    assert.ok(primary.length >= 2, id + " deve expor dois filtros principais");
  }

  for (const [id, expected] of Object.entries(expectedPrimary)) {
    const primary = window.BI_DASHBOARDS[id].filters.filter(filter => filter.primary !== false).slice(0, 2).map(filter => filter.id);
    assert.deepEqual(primary, expected, id + " com filtros principais inadequados");
  }
});

test("filtros booleanos locais usam opções estáticas com rótulos amigáveis", () => {
  const window = loadCatalogs();
  const checks = [
    ["compras-contratos", "contratoAtivo", ["Ativo", "Inativo"]],
    ["compras-atas", "ataRegistro", ["Com ata", "Sem ata"]],
    ["folha-servidores", "ferias", ["Em férias", "Fora de férias"]],
    ["folha-controle", "afastado", ["Afastado", "Não afastado"]]
  ];
  for (const [view, filterId, labels] of checks) {
    const filter = window.BI_DASHBOARDS[view].filters.find(item => item.id === filterId);
    assert.ok(filter, view + " sem filtro " + filterId);
    assert.equal(filter.dynamic, false);
    assert.deepEqual(filter.options.map(item => item.label), labels);
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

test("todos os painéis locais possuem tabelas analíticas configuradas para drill-down", () => {
  const window = loadCatalogs();
  const samples = {
    contabil: JSON.parse(fs.readFileSync(path.join(ROOT, "data", "samples", "contabil-100.json"), "utf8")),
    compras: JSON.parse(fs.readFileSync(path.join(ROOT, "data", "samples", "compras-100.json"), "utf8")),
    folha: JSON.parse(fs.readFileSync(path.join(ROOT, "data", "samples", "folha-100.json"), "utf8"))
  };

  for (const [id, dashboard] of Object.entries(window.BI_DASHBOARDS)) {
    if (!samples[dashboard.system]) continue;
    assert.ok(Array.isArray(dashboard.summaryTables) && dashboard.summaryTables.length >= 1, id + " sem tabela analítica");
    assert.ok(dashboard.summaryTables.length <= 2, id + " deve manter no máximo duas tabelas executivas");
    const keys = new Set(Object.keys(samples[dashboard.system].rows[0] || {}));
    for (const table of dashboard.summaryTables) {
      assert.ok(keys.has(table.group), id + " usa agrupamento inexistente: " + table.group);
      assert.ok(Array.isArray(table.columns) && table.columns.length >= 1, id + " possui tabela sem colunas");
      for (const column of table.columns) {
        if (column.field) assert.ok(keys.has(column.field), id + " usa coluna inexistente: " + column.field);
      }
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
    "systemHeaderContext", "sampleModeBadge", "primaryDynamicFilters", "tableSectionHeading", "tableGrid",
    "sourceDisclosureTitle", "sourceDisclosureDescription", "sourceSummary",
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

test("exportações do painel incluem sistema, modo de dados e tabelas executivas", () => {
  const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  assert.match(app, /for\(const table of currentPayload\?\.tables\|\|\[\]\)/);
  assert.match(app, /\["Sistema",system\?\.name\|\|system\?\.label\|\|currentSystemId\]/);
  assert.match(app, /AMOSTRA LOCAL · DADOS DE TESTE · SEM CONSUMO DA API/);
  assert.match(app, /BI Vella \| "\+systemName\+" \/ "\+panelName/);
  assert.match(html, /Indicadores, séries e tabelas/);
});

test("drill-down local pode exportar PDF CSV e TXT sem buscar registros remotos", () => {
  const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  assert.match(app, /let currentLocalDetailExport = null/);
  assert.match(app, /function setLocalDetailExport\(/);
  assert.match(app, /async function currentDetailExportPayload\(/);
  assert.match(app, /resource:"amostra-local"/);
  assert.match(app, /sampleMode:true/);
  const start = app.indexOf("async function currentDetailExportPayload");
  const end = app.indexOf("function detailExportContext", start);
  const block = app.slice(start, end);
  assert.match(block, /if\(currentLocalDetailExport\)/);
  assert.match(block, /return fetchDetailExport\(currentDetailResource,maxRecords\)/);
  assert.match(app, /setLocalDetailExport\(tableDef\.title\|\|"Detalhamento",rows,currentSystemId\)/);
  assert.match(app, /setLocalDetailExport\(kpi\.label,rows,currentSystemId\)/);
  assert.match(app, /setLocalDetailExport\(resolved\.title,rows,currentSystemId\)/);
});

test("busca global preserva o sistema do painel encontrado", () => {
  const search = fs.readFileSync(path.join(ROOT, "global-search.js"), "utf8");
  assert.match(search, /window\.BI_DASHBOARDS\?\.\[view\]/);
  assert.match(search, /url\.searchParams\.set\("sistema",system\)/);
  assert.match(search, /url\.searchParams\.set\("view",view\)/);
});

test("Minha Home funciona nos quatro sistemas e respeita escopo e permissões", () => {
  const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  assert.match(app, /function isCurrentSystemHome\(/);
  assert.match(app, /currentSystemInfo\(\)\?\.homeView\|\|DEFAULT_VIEW/);
  assert.match(app, /function isPersonalizationViewAllowed\(/);
  assert.match(app, /dashboardSystemId\(view\)===String\(currentSystemId\)/);
  assert.match(app, /isViewAllowed\(view\)/);
  assert.match(app, /item\.view!==homeView&&isPersonalizationViewAllowed\(item\.view\)/);
  assert.match(app, /MINHA HOME · /);
});

test("personalização mantém capacidade suficiente para quatro sistemas", () => {
  const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  assert.match(app, /recentViews=\[[\s\S]*?\]\.slice\(0,24\)/);
  assert.match(app, /favoriteDashboards=\[\.\.\.set\]\.slice\(0,24\)/);
  assert.match(app, /favoriteKpis[\s\S]*?slice\(0,32\)/);
});

test("homes de Contabilidade, Compras e Folha usam hierarquia executiva própria", () => {
  const css = fs.readFileSync(path.join(ROOT, "style.css"), "utf8");
  assert.match(css, /#dashboardView\[data-dashboard\$="-visao-geral"\] \.kpi-grid/);
  assert.match(css, /grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
  assert.match(css, /#dashboardView\[data-dashboard\$="-visao-geral"\] #chartGrid/);
  assert.match(css, /#dashboardView\[data-dashboard\$="-visao-geral"\] #chartGrid \.chart-card:nth-child\(3\)/);
  assert.match(css, /@media\(max-width:480px\)[\s\S]*?#dashboardView\[data-dashboard\$="-visao-geral"\] \.kpi-grid/);
});

test("proveniência diferencia AMOSTRA LOCAL de dados reais", () => {
  const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  assert.match(html, /id="sourceDisclosureTitle"/);
  assert.match(html, /id="sourceDisclosureDescription"/);
  assert.match(app, /function renderSourceProvenance\(/);
  assert.match(app, /Dados sintéticos locais para validação visual e funcional\. Não representam dados de produção\./);
  assert.match(app, /0 chamadas Cloudflare/);
  assert.match(app, /AMOSTRA LOCAL · 0 API/);
  assert.match(app, /na amostra/);
  assert.doesNotMatch(app, /sampleMode[\s\S]{0,220}carregados \/ API/);
});

test("período Últimos 12 meses possui tratamento próprio nas amostras locais", () => {
  const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const start = app.indexOf("function localSampleRowsForPeriod");
  const end = app.indexOf("function localSampleFilterOptions", start);
  assert.ok(start >= 0 && end > start);
  const block = app.slice(start, end);
  assert.match(block, /if\(periodo==="12m"\)/);
  assert.match(block, /anchor\.getMonth\(\)-11/);
  assert.match(block, /key>=startKey&&key<=endKey/);
});

test("busca global usa somente amostra local em Contabilidade, Compras e Folha", () => {
  const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const search = fs.readFileSync(path.join(ROOT, "global-search.js"), "utf8");
  assert.match(app, /window\.BIVellaSearchContext=Object\.freeze/);
  assert.match(app, /allowedViews=Object\.keys\(dashboards\)\.filter/);
  assert.match(search, /async function runLocalSampleSearch\(/);
  assert.match(search, /const localMode=Boolean\(context\?\.localSample&&context\?\.sampleFile\)/);
  assert.match(search, /localMode\s*\? await runLocalSampleSearch\(q,context\)\s*:\s*await api\("\/api\/search\?q="/);
  assert.match(search, /AMOSTRA LOCAL · 0 chamadas à API/);
  assert.match(search, /nenhuma chamada ao Worker\/Cloudflare/);
});

test("busca local só sugere painéis autorizados do sistema atual", () => {
  const search = fs.readFileSync(path.join(ROOT, "global-search.js"), "utf8");
  assert.match(search, /const allowed=new Set\(Array\.isArray\(context\?\.allowedViews\)\?context\.allowedViews:\[\]\)/);
  assert.match(search, /\[\.\.\.allowed\]\.map\(view=>/);
  assert.match(search, /preferredLocalView\(row,query,context,config\)/);
});

test("todas as homes exibem leitura executiva e pontos de atenção contextuais", () => {
  const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const css = fs.readFileSync(path.join(ROOT, "style.css"), "utf8");

  assert.match(app, /const SYSTEM_HOME_COPY=Object\.freeze/);
  for (const system of ["tributos","contabil","compras","folha"]) {
    assert.match(app, new RegExp(system+":\\{"));
  }
  assert.match(app, /if\(isCurrentSystemHome\(view\)\)/);
  assert.match(app, /function renderOverviewAttention\(payload\)/);
  assert.match(app, /if\(!isCurrentSystemHome\(\)\)/);
  assert.match(app, /currentSystemId\)==="contabil"/);
  assert.match(app, /currentSystemId\)==="compras"/);
  assert.match(app, /currentSystemId\)==="folha"/);
  assert.match(app, /AMOSTRA LOCAL/);
  assert.match(css, /\.system-home-executive/);
  assert.match(css, /\.overview-attention-mode/);
});

test("cobertura e badges distinguem amostra local de integração real", () => {
  const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const css = fs.readFileSync(path.join(ROOT, "style.css"), "utf8");
  assert.match(app, /Cobertura da amostra local/);
  assert.match(app, /0 chamadas à API/);
  assert.match(app, /if\(value\.startsWith\("local:"\)\) return "sample"/);
  assert.match(app, /if\(String\(source\)\.startsWith\("local:"\)\) return "AMOSTRA"/);
  assert.match(css, /\.source-badge\.sample/);
  assert.match(css, /\.integration-coverage\.is-sample/);
});

test("frontend não expõe User-Access ou access token em configuração pública", () => {
  const config = fs.readFileSync(path.join(ROOT, "config.js"), "utf8");
  assert.doesNotMatch(config, /User-Access\s*[:=]\s*["'][^"']+["']/i);
  assert.doesNotMatch(config, /accessToken\s*[:=]\s*["'][^"']+["']/i);
});
