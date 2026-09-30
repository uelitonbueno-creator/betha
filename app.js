(() => {
  const cfg = window.BI_CONFIG || {};
  const dashboards = window.BI_DASHBOARDS || {};
  const bethaApp = document.getElementById("bethaApp");
  const query = Object.fromEntries(new URLSearchParams(location.search).entries());
  const chartInstances = new Map();
  let currentView = query.view && dashboards[query.view] ? query.view : "visao-geral";
  let currentPayload = null;

  const tenantId = query.tenant || query.entidadeId || query.entityId || "";
  const entityLabel = query.entidade || query.entity || query.entidadeNome || cfg.ENTITY_LABEL || "ENTIDADE NÃO IDENTIFICADA";

  document.getElementById("entityContext").textContent = String(entityLabel).toUpperCase();

  const currentYear = new Date().getFullYear();
  const yearSelect = document.getElementById("exercicio");
  for (let y = currentYear; y >= currentYear - 10; y--) {
    const opt = document.createElement("option");
    opt.value = String(y);
    opt.textContent = String(y);
    yearSelect.appendChild(opt);
  }

  bethaApp.opcoes = window.BI_MENU || [];
  bethaApp.setMenuAtivo(currentView);

  bethaApp.addEventListener("opcaoMenuSelecionada", (event) => {
    const detail = event.detail || {};
    const view = detail.rota || detail.id;
    if (!dashboards[view]) return;
    if (detail.id) bethaApp.setMenuAtivo(detail.id);
    navigate(view);
  });

  function navigate(view) {
    if (!dashboards[view]) return;
    currentView = view;
    const url = new URL(location.href);
    url.searchParams.set("view", view);
    history.replaceState({}, "", url);
    renderDashboard(view);
    loadDashboardData(view);
  }

  function sourceClass(source) {
    return String(source || "").startsWith("base:") ? "base" : "";
  }

  function sourceLabel(source) {
    if (!source) return "Fonte";
    if (source.includes("|")) return "MÚLTIPLAS";
    return source.startsWith("base:") ? "DADOS" : "BI";
  }

  function formatValue(value, format) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
    if (format === "currency") {
      return Number(value).toLocaleString("pt-BR", {style:"currency", currency:"BRL"});
    }
    if (format === "percent") {
      return Number(value).toLocaleString("pt-BR", {maximumFractionDigits:1}) + "%";
    }
    return Number(value).toLocaleString("pt-BR");
  }

  function destroyCharts() {
    for (const chart of chartInstances.values()) chart.destroy();
    chartInstances.clear();
  }

  function renderDashboard(view) {
    destroyCharts();
    currentPayload = null;
    const def = dashboards[view];

    document.getElementById("pageTitle").textContent = def.title;
    document.getElementById("pageDescription").textContent = def.description;
    document.getElementById("pageContext").textContent = def.title.toUpperCase();
    document.getElementById("levelLabel").textContent = String(def.level || "macro-micro").toUpperCase().replace("-", " → ");

    const kpiGrid = document.getElementById("kpiGrid");
    kpiGrid.innerHTML = "";
    for (const kpi of def.kpis || []) {
      const el = document.createElement("article");
      el.className = "kpi-card";
      el.dataset.kpi = kpi.id;
      el.innerHTML = `
        <i class="mdi mdi-chevron-right kpi-more"></i>
        <small>${escapeHtml(kpi.label)}</small>
        <strong data-value>—</strong>
        <span>${escapeHtml(kpi.source)} · ${escapeHtml(kpi.field)}</span>
      `;
      el.addEventListener("click", () => openKpiDetail(kpi));
      kpiGrid.appendChild(el);
    }

    const chartGrid = document.getElementById("chartGrid");
    chartGrid.innerHTML = "";
    (def.charts || []).forEach((chartDef, index) => {
      const card = document.createElement("article");
      card.className = "chart-card" + (index === 0 && view !== "qualidade" ? " wide" : "");
      card.dataset.chart = chartDef.id;
      card.innerHTML = `
        <div class="chart-card-header">
          <div class="chart-title-block">
            <h2>${escapeHtml(chartDef.title)}</h2>
            <p>${escapeHtml(chartDef.subtitle || "")}</p>
          </div>
          <div class="chart-meta">
            <span class="source-badge ${sourceClass(chartDef.source)}">${sourceLabel(chartDef.source)}</span>
            <button type="button" class="detail-button">DETALHAR</button>
          </div>
        </div>
        <div class="chart-body">
          <canvas></canvas>
          <div class="chart-empty">
            <i class="mdi mdi-chart-box-outline"></i>
            <strong>Estrutura do gráfico pronta</strong>
            <span>Aguardando dados da entidade para calcular este indicador.</span>
          </div>
        </div>
      `;
      card.querySelector(".detail-button").addEventListener("click", () => openChartDetail(chartDef));
      chartGrid.appendChild(card);
    });

    const sources = [...new Set([
      ...(def.kpis || []).map(x => x.source),
      ...(def.charts || []).map(x => x.source)
    ].filter(Boolean))];
    const summary = document.getElementById("sourceSummary");
    summary.innerHTML = sources.map(src =>
      `<span class="source-chip"><strong>${sourceLabel(src)}</strong> · ${escapeHtml(src)}</span>`
    ).join("");

    setStatus("waiting", cfg.BACKEND_URL ? "Backend configurado · carregando dados" : "Estrutura pronta · dados aguardando integração");
  }

  function chartType(type) {
    if (type === "doughnut") return "doughnut";
    if (type === "line") return "line";
    return "bar";
  }

  function renderChartData(chartDef, data) {
    const card = document.querySelector(`[data-chart="${cssEscape(chartDef.id)}"]`);
    if (!card || !data || !Array.isArray(data.labels) || !Array.isArray(data.datasets)) return;

    card.querySelector(".chart-empty").hidden = true;
    const canvas = card.querySelector("canvas");

    if (chartInstances.has(chartDef.id)) {
      chartInstances.get(chartDef.id).destroy();
      chartInstances.delete(chartDef.id);
    }

    const instance = new Chart(canvas, {
      type: chartType(chartDef.type),
      data: {
        labels: data.labels,
        datasets: data.datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {mode:"nearest", intersect:false},
        plugins: {
          legend: {
            display: data.datasets.length > 1 || chartDef.type === "doughnut",
            position: "bottom",
            labels: {boxWidth:10, font:{size:10}}
          },
          tooltip: {
            callbacks: {
              label(context) {
                const label = context.dataset.label ? context.dataset.label + ": " : "";
                const value = context.raw;
                if (data.format === "currency") {
                  return label + Number(value || 0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
                }
                return label + Number(value || 0).toLocaleString("pt-BR");
              }
            }
          }
        },
        scales: chartDef.type === "doughnut" ? undefined : {
          x: {ticks:{font:{size:9}, maxRotation:45, minRotation:0}, grid:{display:false}},
          y: {beginAtZero:true, ticks:{font:{size:9}}}
        },
        onClick(event, elements) {
          if (!elements.length) return;
          const idx = elements[0].index;
          openChartDetail(chartDef, {
            label: data.labels[idx],
            datasets: data.datasets.map(d => ({label:d.label || chartDef.title, value:d.data[idx]}))
          });
        }
      }
    });
    chartInstances.set(chartDef.id, instance);
  }

  function renderPayload(payload) {
    currentPayload = payload || {};
    const def = dashboards[currentView];
    const kpis = payload.kpis || {};
    for (const kpi of def.kpis || []) {
      const el = document.querySelector(`[data-kpi="${cssEscape(kpi.id)}"] [data-value]`);
      const raw = kpis[kpi.id];
      if (el && raw !== undefined) el.textContent = formatValue(raw, kpi.format);
    }
    const charts = payload.charts || {};
    for (const chartDef of def.charts || []) {
      if (charts[chartDef.id]) renderChartData(chartDef, charts[chartDef.id]);
    }
  }

  async function api(path) {
    const base = String(cfg.BACKEND_URL || "").replace(/\/$/, "");
    if (!base) throw new Error("BACKEND_NOT_CONFIGURED");
    const headers = {Accept:"application/json"};
    if (tenantId) headers["X-Tenant-Id"] = tenantId;
    const response = await fetch(base + path, {headers, credentials:"include"});
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(body.error || ("HTTP " + response.status));
      error.status = response.status;
      throw error;
    }
    return body;
  }

  async function loadDashboardData(view) {
    if (!cfg.BACKEND_URL) return;
    setStatus("waiting", "Consultando backend...");
    try {
      await api("/api/health");
      const params = new URLSearchParams({
        periodo: document.getElementById("periodo").value,
        exercicio: document.getElementById("exercicio").value,
        fonte: document.getElementById("fontePreferencial").value
      });
      const payload = await api("/api/dashboard/" + encodeURIComponent(view) + "?" + params.toString());
      renderPayload(payload);
      setStatus("online", "Dados atualizados");
    } catch (error) {
      console.warn("Dashboard ainda sem motor analítico publicado:", error);
      if (error.status === 404 || error.status === 501) {
        setStatus("waiting", "Front completo · motor analítico aguardando publicação");
      } else if (error.message === "APPLICATION_SESSION_NOT_CONFIGURED") {
        setStatus("waiting", "Aguardando autenticação Betha");
      } else {
        setStatus("error", "Integração indisponível");
      }
    }
  }

  function setStatus(type, text) {
    const el = document.getElementById("apiStatus");
    el.className = "api-status api-status-" + type;
    el.lastElementChild.textContent = text;
  }

  function drillChainFor(source, drill) {
    const nodes = ["Visão consolidada"];
    if (source && source.includes("pagamentos")) nodes.push("Composição do pagamento");
    else if (source && source.includes("dividas")) nodes.push("Composição da dívida");
    else if (source && source.includes("parcel")) nodes.push("Composição do parcelamento");
    else if (source && source.includes("imoveis")) nodes.push("Composição cadastral");
    else nodes.push("Composição do indicador");
    nodes.push(drill ? "Registros: " + drill : "Registros individuais");
    return nodes;
  }

  function openKpiDetail(kpi) {
    const raw = currentPayload && currentPayload.kpis ? currentPayload.kpis[kpi.id] : undefined;
    openDrawer(kpi.label, `
      <section class="drawer-section">
        <h3>Indicador</h3>
        <p>Valor atual: <strong>${escapeHtml(formatValue(raw, kpi.format))}</strong></p>
        <div class="data-path">Fonte: ${escapeHtml(kpi.source)}<br>Campo/expressão: ${escapeHtml(kpi.field)}</div>
      </section>
      ${drillHtml(drillChainFor(kpi.source, null))}
      <section class="drawer-section">
        <h3>Detalhamento</h3>
        <p>Quando os dados estiverem conectados, esta área exibirá os registros que formam o total, com filtros preservados da visão atual.</p>
      </section>
    `);
  }

  function openChartDetail(chartDef, selected) {
    let selectedHtml = "";
    if (selected) {
      selectedHtml = `
        <section class="drawer-section">
          <h3>Ponto selecionado</h3>
          <p><strong>${escapeHtml(String(selected.label))}</strong></p>
          <table class="detail-table"><tbody>
          ${selected.datasets.map(x => `<tr><td>${escapeHtml(x.label)}</td><td>${escapeHtml(String(x.value ?? "—"))}</td></tr>`).join("")}
          </tbody></table>
        </section>
      `;
    }

    const rows = currentPayload && currentPayload.details && currentPayload.details[chartDef.id];
    const rowsHtml = Array.isArray(rows) && rows.length ? buildRowsTable(rows) :
      "<p>A listagem de registros aparecerá aqui quando o motor analítico estiver conectado.</p>";

    openDrawer(chartDef.title, `
      <section class="drawer-section">
        <h3>Definição analítica</h3>
        <div class="data-path">Fonte: ${escapeHtml(chartDef.source)}<br>Dimensão: ${escapeHtml(chartDef.dimension || "—")}<br>Medidas: ${escapeHtml((chartDef.measures || []).join(", "))}</div>
      </section>
      ${selectedHtml}
      ${drillHtml(drillChainFor(chartDef.source, chartDef.drill))}
      <section class="drawer-section">
        <h3>Registros que compõem o gráfico</h3>
        ${rowsHtml}
      </section>
    `);
  }

  function buildRowsTable(rows) {
    const keys = [...new Set(rows.flatMap(row => Object.keys(row)))].slice(0,8);
    return `
      <div style="overflow:auto">
        <table class="detail-table">
          <thead><tr>${keys.map(k => `<th>${escapeHtml(k)}</th>`).join("")}</tr></thead>
          <tbody>
            ${rows.slice(0,100).map(row => `<tr>${keys.map(k => `<td>${escapeHtml(String(row[k] ?? ""))}</td>`).join("")}</tr>`).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function drillHtml(nodes) {
    return `
      <section class="drawer-section">
        <h3>Caminho macro → micro</h3>
        <div class="drill-chain">
          ${nodes.map((node,index) =>
            `${index ? '<i class="mdi mdi-chevron-right"></i>' : ''}<span class="drill-node">${escapeHtml(node)}</span>`
          ).join("")}
        </div>
      </section>
    `;
  }

  function openDrawer(title, html) {
    document.getElementById("drawerTitle").textContent = title;
    document.getElementById("drawerBody").innerHTML = html;
    document.getElementById("detailDrawer").classList.add("open");
    document.getElementById("detailDrawer").setAttribute("aria-hidden","false");
    document.getElementById("drawerBackdrop").hidden = false;
    document.body.classList.add("drawer-open");
  }

  function closeDrawer(id) {
    document.getElementById(id).classList.remove("open");
    document.getElementById(id).setAttribute("aria-hidden","true");
    const anyOpen = document.querySelector(".detail-drawer.open");
    if (!anyOpen) {
      document.getElementById("drawerBackdrop").hidden = true;
      document.body.classList.remove("drawer-open");
    }
  }

  document.getElementById("closeDrawer").addEventListener("click", () => closeDrawer("detailDrawer"));
  document.getElementById("closeIntegration").addEventListener("click", () => closeDrawer("integrationDrawer"));
  document.getElementById("drawerBackdrop").addEventListener("click", () => {
    closeDrawer("detailDrawer");
    closeDrawer("integrationDrawer");
  });

  const context = {
    url: location.href,
    referrer: document.referrer || "(sem referrer)",
    tenantId: tenantId || "(não recebido)",
    entidade: entityLabel,
    parametros: query,
    backendConfigurado: Boolean(cfg.BACKEND_URL),
    dataHoraLocal: new Date().toLocaleString("pt-BR")
  };
  document.getElementById("contextOutput").textContent = JSON.stringify(context,null,2);

  document.getElementById("integrationButton").addEventListener("click", async () => {
    document.getElementById("integrationDrawer").classList.add("open");
    document.getElementById("integrationDrawer").setAttribute("aria-hidden","false");
    document.getElementById("drawerBackdrop").hidden = false;
    document.body.classList.add("drawer-open");

    const state = document.getElementById("integrationState");
    if (!cfg.BACKEND_URL) {
      state.textContent = "Backend ainda não publicado/configurado no front.";
      return;
    }
    try {
      const health = await api("/api/health");
      state.textContent = JSON.stringify(health,null,2);
    } catch (error) {
      state.textContent = "Falha ao consultar backend: " + error.message;
    }
  });

  document.getElementById("copyContext").addEventListener("click", async (event) => {
    try {
      await navigator.clipboard.writeText(document.getElementById("contextOutput").textContent);
      event.currentTarget.textContent = "COPIADO";
      setTimeout(() => event.currentTarget.textContent = "COPIAR CONTEXTO", 1300);
    } catch {
      event.currentTarget.textContent = "SELECIONE E COPIE";
    }
  });

  const entityButton = document.getElementById("entityButton");
  const entityMenu = document.getElementById("entityMenu");
  entityButton.addEventListener("click", () => {
    entityMenu.hidden = !entityMenu.hidden;
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".entity-control")) entityMenu.hidden = true;
  });

  async function loadTenants() {
    if (!cfg.BACKEND_URL) return;
    try {
      const result = await api("/api/me/tenants");
      if (!Array.isArray(result.tenants)) return;
      const list = document.getElementById("entityList");
      list.innerHTML = "";
      for (const tenant of result.tenants) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "entity-option" + (tenant.id === tenantId ? " is-current" : "");
        button.textContent = tenant.name || tenant.id;
        button.addEventListener("click", () => {
          const url = new URL(location.href);
          url.searchParams.set("tenant", tenant.id);
          if (tenant.name) url.searchParams.set("entidade", tenant.name);
          location.href = url.toString();
        });
        list.appendChild(button);
      }
    } catch {}
  }

  document.getElementById("refreshButton").addEventListener("click", () => loadDashboardData(currentView));
  document.getElementById("periodo").addEventListener("change", () => loadDashboardData(currentView));
  document.getElementById("exercicio").addEventListener("change", () => loadDashboardData(currentView));
  document.getElementById("fontePreferencial").addEventListener("change", () => loadDashboardData(currentView));

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");
  }

  function cssEscape(value) {
    if (window.CSS && CSS.escape) return CSS.escape(String(value));
    return String(value).replace(/["\\]/g,"\\$&");
  }

  renderDashboard(currentView);
  loadTenants();
  loadDashboardData(currentView);
})();