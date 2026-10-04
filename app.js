(async () => {
  const cfg = window.BI_CONFIG || {};
  const SUPABASE_URL = "https://mliurxyjznxoafkwwtae.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1saXVyeHlqem54b2Fma3d3dGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NjA2MjMsImV4cCI6MjEwNjUzNjYyM30.bxZPsSSLpiZTFvXD2yZjtuc-5sniwDfV5D7UMAsB9ec";
  const dashboards = window.BI_DASHBOARDS || {};
  const ADMIN_VIEWS = new Set(["usuarios-admin","configuracoes-admin"]);
  const bethaApp = document.getElementById("bethaApp");
  const authGate = document.getElementById("authGate");
  const tenantGate = document.getElementById("tenantGate");
  const tenantGateList = document.getElementById("tenantGateList");
  const tenantGateTitle = document.getElementById("tenantGateTitle");
  const tenantGateMessage = document.getElementById("tenantGateMessage");
  const authRequired = cfg.AUTH_REQUIRED !== false;

  if (authRequired && window.BIAuth && BIAuth.ready) {
    try { await BIAuth.ready; } catch {}
  }

  if (authRequired && (!window.BIAuth || !BIAuth.isAuthenticated())) {
    bethaApp.style.display = "none";
    authGate.hidden = false;

    const message = document.getElementById("authMessage");
    const button = document.getElementById("loginButton");
    const previousAuthError = window.BIAuth ? BIAuth.getError() : "BIAuth não carregou";

    const authMessages = {
      OAUTH_STATE_INVALID: "A validação de segurança do login expirou ou ficou inválida. Inicie o login novamente.",
      OAUTH_CALLBACK_INCOMPLETE: "A Betha não devolveu todos os dados necessários para concluir o login.",
      OAUTH_TOKEN_EXCHANGE_FAILED: "A Betha recusou a troca do código de autenticação pelo token.",
      APPLICATION_SESSION_INVALID: "A sessão do BI não é mais válida. Entre novamente.",
      APPLICATION_SESSION_EXPIRED: "Sua sessão do BI expirou. Entre novamente.",
      USER_TOKEN_REQUIRED: "A sessão do usuário não foi encontrada.",
      AUTH_VALIDATION_TIMEOUT: "A validação do login demorou mais que o esperado. Tente novamente.",
      AUTH_HANDOFF_REQUIRED: "O retorno da Betha chegou sem o código temporário de autenticação.",
      AUTH_HANDOFF_INVALID: "O código temporário de autenticação não é válido. Entre novamente.",
      AUTH_HANDOFF_EXPIRED: "O retorno da Betha demorou demais e expirou. Entre novamente.",
      AUTH_HANDOFF_MISSING: "A Betha retornou ao BI, mas o navegador não entregou o código temporário de autenticação.",
      BACKEND_NOT_CONFIGURED: "O backend do BI não está configurado."
    };

    if (previousAuthError) {
      message.textContent = authMessages[previousAuthError] || ("Falha na autenticação: " + previousAuthError);
    }

    // O login Betha usa navegação HTML nativa. Assim ele continua funcionando
    // mesmo se algum módulo JavaScript falhar ou estiver com cache antigo.
    if (button.tagName === "A") {
      const loginBase=String(cfg.BACKEND_URL || "").replace(/\/$/,"");
      button.setAttribute("href",(loginBase || "") + "/api/auth/login");
    }

    // Sem sessão, não mantém contexto de prefeitura na URL.
    const cleanUrl=new URL(location.href);
    ["tenant","entidade","entidadeId","entityId","entity","entidadeNome"].forEach(key=>cleanUrl.searchParams.delete(key));
    if (cleanUrl.toString()!==location.href) history.replaceState({},"",cleanUrl);

    return;
  }

  authGate.hidden = true;
  // Com autenticação ativa, o app só aparece depois que /api/me/tenants
  // confirmar que a entidade solicitada pertence ao usuário.
  bethaApp.style.display = authRequired ? "none" : "";
  if (tenantGate) tenantGate.hidden = true;
  // O componente Betha é registrado de forma assíncrona pelo loader.
  // Aguarda o upgrade antes de chamar métodos como setMenuAtivo().
  if (window.customElements && customElements.whenDefined) {
    try { await customElements.whenDefined("bth-app"); } catch {}
  }

  const query = Object.fromEntries(new URLSearchParams(location.search).entries());
  const chartInstances = new Map();
  const filterStateByView = new Map();
  let currentView = ADMIN_VIEWS.has(query.view) ? query.view :
    (query.view && dashboards[query.view] ? query.view : "visao-geral");
  let currentPayload = null;
  let authorizedTenants = [];

  let tenantId = query.tenant || query.entidadeId || query.entityId || "";
  let entityLabel = query.entidade || query.entity || query.entidadeNome || "ENTIDADE NÃO IDENTIFICADA";

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
  if (typeof bethaApp.setMenuAtivo === "function") bethaApp.setMenuAtivo(currentView);

  bethaApp.addEventListener("opcaoMenuSelecionada", (event) => {
    const detail = event.detail || {};
    const view = detail.rota || detail.id;
    if (!dashboards[view] && !ADMIN_VIEWS.has(view)) return;
    if (detail.id && typeof bethaApp.setMenuAtivo === "function") bethaApp.setMenuAtivo(detail.id);
    navigate(view);
  });

  function navigate(view) {
    if (!dashboards[view] && !ADMIN_VIEWS.has(view)) return;
    currentView = view;
    const url = new URL(location.href);
    url.searchParams.set("view", view);
    history.replaceState({}, "", url);

    if (view === "usuarios-admin") {
      renderUsersAdmin();
      return;
    }
    if (view === "configuracoes-admin") {
      renderConfigAdmin();
      return;
    }

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

  function filterDefinitions(view=currentView) {
    return Array.isArray(dashboards[view]?.filters) ? dashboards[view].filters : [];
  }

  function currentFilterState(view=currentView) {
    if (!filterStateByView.has(view)) filterStateByView.set(view,{});
    return filterStateByView.get(view);
  }

  function currentDashboardFilters(view=currentView) {
    const state=currentFilterState(view);
    return Object.fromEntries(
      Object.entries(state).filter(([,value])=>value!==undefined&&value!==null&&String(value)!=="")
    );
  }

  function hasActiveDashboardFilters(view=currentView) {
    return Object.keys(currentDashboardFilters(view)).length>0;
  }

  function dashboardFilterSignature(view=currentView) {
    const values=currentDashboardFilters(view);
    const ordered=Object.keys(values).sort().reduce((acc,key)=>{
      acc[key]=values[key];
      return acc;
    },{});
    return Object.keys(ordered).length
      ? "filters-"+encodeURIComponent(JSON.stringify(ordered))
      : "filters-none";
  }

  function normalizeFilterOptions(options) {
    if (!Array.isArray(options)) return [];
    return options.map(item=>{
      if (item && typeof item==="object") {
        return {value:String(item.value??item.id??item.label??""),label:String(item.label??item.value??item.id??"")};
      }
      return {value:String(item??""),label:String(item??"")};
    }).filter(item=>item.value!=="");
  }

  function updateFilterActiveCount() {
    const row=document.getElementById("advancedFilterRow");
    if(!row) return;
    const count=Object.keys(currentDashboardFilters()).length;
    row.dataset.activeCount=String(count);
  }

  function renderDashboardFilters(def) {
    const row=document.getElementById("advancedFilterRow");
    const container=document.getElementById("advancedFilters");
    if(!row||!container) return;

    const filters=Array.isArray(def?.filters)?def.filters:[];
    if(!filters.length){
      row.hidden=true;
      container.innerHTML="";
      return;
    }

    row.hidden=false;
    const state=currentFilterState(currentView);

    container.innerHTML=filters.map(filter=>{
      const options=normalizeFilterOptions(filter.options||[]);
      const current=String(state[filter.id]||"");
      const currentExists=options.some(item=>item.value===current);
      const all=[
        {value:"",label:"Todos"},
        ...options,
        ...(current&&!currentExists?[{value:current,label:current}]:[])
      ];

      return '<div class="field">'+
        '<label for="filter-'+escapeHtml(filter.id)+'">'+escapeHtml(filter.label||filter.id)+'</label>'+
        '<select id="filter-'+escapeHtml(filter.id)+'" data-dashboard-filter="'+escapeHtml(filter.id)+'">'+
        all.map(item=>'<option value="'+escapeHtml(item.value)+'"'+(item.value===current?' selected':'')+'>'+escapeHtml(item.label)+'</option>').join("")+
        '</select></div>';
    }).join("");

    container.querySelectorAll("[data-dashboard-filter]").forEach(select=>{
      select.addEventListener("change",()=>{
        const state=currentFilterState(currentView);
        state[select.dataset.dashboardFilter]=select.value;
        if(!select.value) delete state[select.dataset.dashboardFilter];
        filterStateByView.set(currentView,state);
        updateFilterActiveCount();

        const loaded=loadDashboardFromCache(currentView);
        if(!loaded) setStatus("waiting","Filtros alterados · clique em ATUALIZAR");
      });
    });

    updateFilterActiveCount();
  }

  function populateDashboardFilterOptions(payload) {
    const def=dashboards[currentView];
    const filters=Array.isArray(def?.filters)?def.filters:[];
    if(!filters.length) return;

    const serverOptions=payload?.meta?.filterOptions||{};
    const state=currentFilterState(currentView);

    for(const filter of filters){
      const select=document.querySelector('[data-dashboard-filter="'+cssEscape(filter.id)+'"]');
      if(!select) continue;

      const options=normalizeFilterOptions(
        (Array.isArray(serverOptions[filter.id])&&serverOptions[filter.id].length)
          ? serverOptions[filter.id]
          : (filter.options||[])
      );
      const current=String(state[filter.id]||select.value||"");
      const currentExists=options.some(item=>item.value===current);

      select.innerHTML=[
        {value:"",label:"Todos"},
        ...options,
        ...(current&&!currentExists?[{value:current,label:current}]:[])
      ].map(item=>
        '<option value="'+escapeHtml(item.value)+'"'+(item.value===current?' selected':'')+'>'+escapeHtml(item.label)+'</option>'
      ).join("");
    }

    updateFilterActiveCount();
  }

  function renderDashboard(view) {
    document.getElementById("dashboardView").hidden = false;
    document.getElementById("usersAdminView").hidden = true;
    document.getElementById("configAdminView").hidden = true;
    destroyCharts();
    currentPayload = null;
    const def = dashboards[view];
    renderDashboardFilters(def);

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

    let coverage = document.getElementById("integrationCoverage");
    if (!coverage) {
      coverage = document.createElement("section");
      coverage.id = "integrationCoverage";
      coverage.className = "integration-coverage";
      kpiGrid.insertAdjacentElement("afterend", coverage);
    }
    coverage.innerHTML = `
      <div class="coverage-title">
        <strong>Cobertura da integração</strong>
        <span>Registros efetivamente lidos da Betha nesta carga.</span>
      </div>
      <div id="coverageItems" class="coverage-items">
        <span class="coverage-loading">Carregando fontes...</span>
      </div>
    `;

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
            <strong>Sem dados para o filtro atual</strong>
            <span>Atualize os dados ou ajuste os filtros desta visão.</span>
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

    setStatus("waiting", cfg.BACKEND_URL ? "Carregando dados" : "Dados indisponíveis");
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

    const bethaPalette = ["#0b6ff4","#2fa36b","#7c5cff","#f0a202","#00a6a6","#dc5f73","#556070","#9a6dd7"];
    const chartDatasets = data.datasets.map((dataset,index) => {
      const color=bethaPalette[index % bethaPalette.length];
      const base={...dataset};

      if(chartDef.type==="doughnut"){
        return {
          ...base,
          backgroundColor:(dataset.data||[]).map((_,i)=>bethaPalette[i % bethaPalette.length]),
          borderColor:"#ffffff",
          borderWidth:2,
          hoverOffset:5
        };
      }

      if(chartDef.type==="line"){
        return {
          ...base,
          borderColor:dataset.borderColor||color,
          backgroundColor:dataset.backgroundColor||color+"18",
          pointBackgroundColor:dataset.pointBackgroundColor||color,
          pointBorderColor:"#ffffff",
          pointBorderWidth:2,
          pointRadius:2.5,
          pointHoverRadius:5,
          borderWidth:2.25,
          tension:.32,
          fill:false
        };
      }

      return {
        ...base,
        backgroundColor:dataset.backgroundColor||color+"CC",
        borderColor:dataset.borderColor||color,
        borderWidth:1,
        borderRadius:5,
        maxBarThickness:34
      };
    });

    const instance = new Chart(canvas, {
      type: chartType(chartDef.type),
      data: {
        labels: data.labels,
        datasets: chartDatasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {mode:"index", intersect:false},
        animation:{duration:420,easing:"easeOutQuart"},
        layout:{padding:{top:4,right:4,bottom:0,left:2}},
        plugins: {
          legend: {
            display: data.datasets.length > 1 || chartDef.type === "doughnut",
            position: "bottom",
            labels: {
              boxWidth:8,
              boxHeight:8,
              usePointStyle:true,
              pointStyle:"circle",
              padding:16,
              color:"#596579",
              font:{size:10,weight:"500"}
            }
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
          x: {
            ticks:{font:{size:9},color:"#7b8794",maxRotation:35,minRotation:0},
            grid:{display:false},
            border:{display:false}
          },
          y: {
            beginAtZero:true,
            ticks:{font:{size:9},color:"#7b8794",padding:8},
            grid:{color:"rgba(80,96,112,.08)"},
            border:{display:false}
          }
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
    populateDashboardFilterOptions(payload);
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

    const sourceRows = payload && payload.meta && payload.meta.sourceRows ? payload.meta.sourceRows : {};
    const sourceAudit = payload && payload.meta && payload.meta.sourceAudit ? payload.meta.sourceAudit : {};
    const warnings = payload && payload.meta && Array.isArray(payload.meta.warnings) ? payload.meta.warnings : [];
    const labelMap = {
      pagamentos:"Pagamentos", pagamentosDetalhados:"Pagamentos detalhados", pagamentosDetalhadosValores:"Valores detalhados",
      debitos:"Débitos", debitosReceitas:"Débitos/receitas", dividas:"Dívidas", dividasReceitas:"Dívidas/receitas",
      encerramentoDividas:"Encerramento de dívidas", encerramentoLancamentos:"Encerramento de lançamentos",
      parcelamentos:"Parcelamentos", parcelas:"Parcelas", referentes:"Referentes", baseParcelas:"Parcelas (base)",
      contribuintes:"Contribuintes", imoveis:"Imóveis", baseImoveis:"Imóveis (base)", responsaveis:"Responsáveis",
      economicos:"Econômicos", atividades:"Atividades", transferencias:"Transferências", solicitacoes:"Solicitações",
      itens:"Itens ITBI", compras:"Compras", plantaValores:"Planta de valores", obras:"Obras",
      camposAdicionais:"Campos adicionais", baseDividas:"Dívidas (base)"
    };
    const warningBySource = new Map(warnings.map(w => [String(w.source), w]));
    const coverageItems = document.getElementById("coverageItems");
    if (coverageItems) {
      coverageItems.innerHTML = Object.entries(sourceRows).map(([key,raw]) => {
        const value = Number(raw || 0);
        const audit = sourceAudit[key] || {};
        const warning = warningBySource.get(key);
        const reported = audit.reportedTotal === null || audit.reportedTotal === undefined
          ? null
          : Number(audit.reportedTotal);
        const complete = audit.complete === true;
        const mismatch = audit.totalMismatch === true;
        const error = audit.error || (warning && warning.error) || "";
        const errorStatus = audit.errorStatus || (warning && warning.errorStatus) || "";
        const errorDetail = audit.errorDetail || (warning && warning.errorDetail) || "";
        const stateClass = error ? "error" : (mismatch ? "warn" : (complete ? "ok" : "warn"));
        const status = error ? "ERRO" : (mismatch ? "DIVERGÊNCIA" : (complete ? "COMPLETO" : "PARCIAL"));
        const countText = reported !== null
          ? value.toLocaleString("pt-BR") + " carregados / API " + reported.toLocaleString("pt-BR")
          : value.toLocaleString("pt-BR") + " carregados";
        const pages = Number(audit.pages || 0);
        const title = error
          ? "Falha: " + error + (errorStatus ? " (HTTP " + errorStatus + ")" : "") + (errorDetail ? " · " + errorDetail : "")
          : (mismatch
            ? "Total informado pela API diverge do total carregado"
            : status + " · " + pages + " página(s)");
        const detailText = error
          ? [errorStatus ? "HTTP " + errorStatus : error, errorDetail].filter(Boolean).join(" · ")
          : (status + (pages ? " · " + pages + " pág." : ""));
        return `<div class="coverage-item coverage-audit" title="${escapeHtml(title)}">
          <span class="coverage-dot ${stateClass}"></span>
          <span class="coverage-source">${escapeHtml(labelMap[key] || key)}</span>
          <strong>${escapeHtml(countText)}</strong>
          <small>${escapeHtml(detailText)}</small>
        </div>`;
      }).join("") || '<span class="coverage-loading">Nenhuma fonte informada pelo backend.</span>';
    }
  }

  const CACHE_PREFIX = "betha_bi_snapshot_v1";
  const FINANCIAL_AGGREGATION_VERSION = 3;
  const DEBT_MAPPING_VERSION = 4;

  function dashboardCacheKey(view) {
    const periodo = document.getElementById("periodo")?.value || "ano";
    const exercicio = document.getElementById("exercicio")?.value || "";
    const fonte = document.getElementById("fontePreferencial")?.value || "auto";
    return [
      CACHE_PREFIX,
      tenantId || "no-tenant",
      view || currentView || "visao-geral",
      periodo,
      exercicio,
      dashboardFilterSignature(view || currentView),
      fonte
    ].join(":");
  }

  function compactPayloadForCache(payload) {
    const clone = JSON.parse(JSON.stringify(payload || {}));
    if (clone.meta && clone.meta.sourceAudit) {
      for (const audit of Object.values(clone.meta.sourceAudit)) {
        if (audit && typeof audit === "object") delete audit.pageMeta;
      }
    }
    if (clone.meta) {
      clone.meta.cachedLocally = true;
    }
    return clone;
  }

  const SNAPSHOT_PARTS = [
    "contribuintes","imoveis","economicos","parcelamentos",
    "pagamentos","debitos","dividas","pagamentos-detalhados"
  ];

  function auditKeysForPart(part) {
    return {
      contribuintes:["contribuintes"],
      imoveis:["imoveis"],
      economicos:["economicos"],
      parcelamentos:["parcelamentos"],
      pagamentos:["pagamentos"],
      debitos:["debitos"],
      dividas:["dividas","encerramentoDividas"],
      "pagamentos-detalhados":["pagamentosDetalhados","pagamentos-detalhados"]
    }[part] || [part];
  }

  function auditForPartFromPayload(part,payload) {
    const audits=payload?.meta?.sourceAudit||{};
    for(const key of auditKeysForPart(part)){
      if(audits[key]) return {key,audit:audits[key]};
    }
    return null;
  }

  function financialKpiForPart(part,payload) {
    if(part==="pagamentos") return payload?.kpis?.arrecadado;
    if(part==="debitos") return payload?.kpis?.lancado;
    if(part==="dividas") return payload?.kpis?.divida;
    return undefined;
  }

  function fragmentQuality(part,payload) {
    const found=auditForPartFromPayload(part,payload);
    if(!found) return -1;

    const audit=found.audit||{};
    const loaded=Number(audit.loaded)||0;
    const complete=audit.complete===true;
    const kpi=financialKpiForPart(part,payload);
    const hasFinancialKpi=["pagamentos","debitos","dividas"].includes(part)
      ? (kpi!==null && kpi!==undefined && Number.isFinite(Number(kpi)))
      : false;

    let score=loaded;
    if(complete) score+=1e12;
    if(hasFinancialKpi) score+=1e15;

    if(part==="pagamentos-detalhados" && payload?.charts?.["receita-credito"]) score+=1e15;
    return score;
  }

  function extractPartFragment(part,payload) {
    const found=auditForPartFromPayload(part,payload);
    if(!found) return null;

    const fragment={
      part,
      kpis:{},
      charts:{},
      meta:{
        auditMode:payload?.meta?.auditMode||"FULL",
        warnings:[],
        sourceRows:{},
        sourceTotals:{},
        sourceAudit:{},
        fieldMapping:{...(payload?.meta?.fieldMapping||{})},
        sourceUsed:{...(payload?.meta?.sourceUsed||{})}
      }
    };

    const {key,audit}=found;
    fragment.meta.sourceAudit[key]=JSON.parse(JSON.stringify(audit));
    if(payload?.meta?.sourceRows?.[key]!==undefined) fragment.meta.sourceRows[key]=payload.meta.sourceRows[key];
    if(payload?.meta?.sourceTotals?.[key]!==undefined) fragment.meta.sourceTotals[key]=payload.meta.sourceTotals[key];

    if(part==="contribuintes"){
      if(payload?.kpis?.contribuintes!==undefined) fragment.kpis.contribuintes=payload.kpis.contribuintes;
      const chart=payload?.charts?.cadastros;
      if(chart){
        const ds=(chart.datasets||[]).filter(x=>x.label==="Contribuintes");
        if(ds.length) fragment.charts.cadastros={...chart,datasets:JSON.parse(JSON.stringify(ds))};
      }
    }

    if(part==="imoveis"){
      if(payload?.kpis?.imoveis!==undefined) fragment.kpis.imoveis=payload.kpis.imoveis;
      const chart=payload?.charts?.cadastros;
      if(chart){
        const ds=(chart.datasets||[]).filter(x=>x.label==="Imóveis");
        if(ds.length) fragment.charts.cadastros={...chart,datasets:JSON.parse(JSON.stringify(ds))};
      }
    }

    if(part==="economicos"){
      const chart=payload?.charts?.cadastros;
      if(chart){
        const ds=(chart.datasets||[]).filter(x=>x.label==="Econômicos");
        if(ds.length) fragment.charts.cadastros={...chart,datasets:JSON.parse(JSON.stringify(ds))};
      }
    }

    if(part==="parcelamentos" && payload?.kpis?.parcelado!==undefined){
      fragment.kpis.parcelado=payload.kpis.parcelado;
    }

    if(part==="pagamentos"){
      if(payload?.kpis?.arrecadado!==undefined) fragment.kpis.arrecadado=payload.kpis.arrecadado;
      if(payload?.charts?.["receita-mensal"]) {
        fragment.charts["receita-mensal"]=JSON.parse(JSON.stringify(payload.charts["receita-mensal"]));
      }
      const lps=payload?.charts?.["lancado-pago-saldo"];
      if(lps){
        const ds=(lps.datasets||[]).filter(x=>x.label==="Pago");
        if(ds.length) fragment.charts["lancado-pago-saldo"]={...lps,datasets:JSON.parse(JSON.stringify(ds))};
      }
    }

    if(part==="debitos"){
      if(payload?.kpis?.lancado!==undefined) fragment.kpis.lancado=payload.kpis.lancado;
      const lps=payload?.charts?.["lancado-pago-saldo"];
      if(lps){
        const ds=(lps.datasets||[]).filter(x=>["Lançado","Saldo"].includes(x.label));
        if(ds.length) fragment.charts["lancado-pago-saldo"]={...lps,datasets:JSON.parse(JSON.stringify(ds))};
      }
    }

    if(part==="dividas"){
      if(payload?.kpis?.divida!==undefined) fragment.kpis.divida=payload.kpis.divida;
      if(payload?.charts?.["divida-evolucao"]) fragment.charts["divida-evolucao"]=JSON.parse(JSON.stringify(payload.charts["divida-evolucao"]));
      if(payload?.charts?.["situacao-divida"]) fragment.charts["situacao-divida"]=JSON.parse(JSON.stringify(payload.charts["situacao-divida"]));
    }

    if(part==="pagamentos-detalhados" && payload?.charts?.["receita-credito"]){
      fragment.charts["receita-credito"]=JSON.parse(JSON.stringify(payload.charts["receita-credito"]));
    }

    return fragment;
  }

  function composeBestPayload(payloads) {
    const valid=(payloads||[]).filter(Boolean);
    if(!valid.length) return null;

    const base={
      view:"visao-geral",
      kpis:{},
      charts:{},
      meta:{auditMode:"FULL",warnings:[],sourceRows:{},sourceTotals:{},sourceAudit:{},fieldMapping:{},sourceUsed:{}}
    };

    for(const part of SNAPSHOT_PARTS){
      let best=null;
      let bestScore=-1;
      for(const payload of valid){
        const score=fragmentQuality(part,payload);
        if(score>bestScore){
          bestScore=score;
          best=payload;
        }
      }
      if(best && bestScore>=0){
        const fragment=extractPartFragment(part,best);
        if(fragment) mergeDashboardPart(base,fragment);
      }
    }

    return base;
  }

  function saveDashboardCache(view, payload, state="complete") {
    try {
      const existingRecords=readAllDashboardCacheRecords(view);
      const existingPayloads=existingRecords.map(item=>item.record?.payload).filter(Boolean);
      const consolidated=composeBestPayload([...existingPayloads,payload]) || payload;

      const allAudits=Object.values(consolidated?.meta?.sourceAudit||{});
      const calculatedState=allAudits.length>0 && allAudits.every(a=>a&&a.complete===true)
        ? "complete"
        : "partial";

      const record = {
        version:2,
        aggregationVersion:FINANCIAL_AGGREGATION_VERSION,
        debtMappingVersion:DEBT_MAPPING_VERSION,
        savedAt:new Date().toISOString(),
        state:state==="complete" ? calculatedState : "partial",
        payload:compactPayloadForCache(consolidated)
      };
      localStorage.setItem(dashboardCacheKey(view), JSON.stringify(record));
      // gravação persistente é assíncrona; não bloqueia a interface
      persistDashboardToSupabase(view,record.payload,record.state);
      return record;
    } catch (error) {
      console.warn("Não foi possível salvar snapshot local:", error);
      return null;
    }
  }

  function readAllDashboardCacheRecords(view) {
    const periodo = document.getElementById("periodo")?.value || "ano";
    const exercicio = document.getElementById("exercicio")?.value || "";
    const prefix = [
      CACHE_PREFIX,
      tenantId || "no-tenant",
      view || currentView || "visao-geral",
      periodo,
      exercicio,
      dashboardFilterSignature(view || currentView)
    ].join(":") + ":";

    const items=[];
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(!key || !key.startsWith(prefix)) continue;
      try{
        const record=JSON.parse(localStorage.getItem(key));
        if(record && record.payload){
          items.push({key,record,time:new Date(record.savedAt||0).getTime()});
        }
      }catch{}
    }
    return items;
  }

  function readDashboardCache(view) {
    try {
      const items=readAllDashboardCacheRecords(view);
      if(!items.length) return null;

      const payload=composeBestPayload(items.map(item=>item.record.payload));
      if(!payload) return null;

      const newest=items.slice().sort((a,b)=>b.time-a.time)[0];
      const allAudits=Object.values(payload?.meta?.sourceAudit||{});
      const state=allAudits.length>0 && allAudits.every(a=>a&&a.complete===true)
        ? "complete"
        : "partial";

      return {
        version:2,
        aggregationVersion:Math.max(...items.map(x=>Number(x.record.aggregationVersion||0))),
        debtMappingVersion:Math.max(...items.map(x=>Number(x.record.debtMappingVersion||0))),
        savedAt:newest.record.savedAt,
        state,
        payload,
        _cacheKey:newest.key,
        _fallback:items.length>1,
        _composed:items.length>1
      };
    } catch (error) {
      console.warn("Snapshot local inválido:", error);
      return null;
    }
  }

  function formatCacheTime(value) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("pt-BR", {
      day:"2-digit", month:"2-digit", year:"numeric",
      hour:"2-digit", minute:"2-digit"
    });
  }

  async function loadDashboardFromSupabase(view) {
    if (!tenantId || hasActiveDashboardFilters(view)) return false;
    try {
      const periodo=document.getElementById("periodo")?.value || "ano";
      const exercicio=document.getElementById("exercicio")?.value || String(new Date().getFullYear());
      const params=new URLSearchParams({
        tenant_id:"eq."+(tenantId),
        painel:"eq."+(view||"visao-geral"),
        periodo:"eq."+periodo,
        exercicio:"eq."+exercicio,
        select:"payload_json,status,updated_at,fonte",
        order:"updated_at.desc",
        limit:"1"
      });

      const response=await fetch(SUPABASE_URL+"/rest/v1/bi_snapshots?"+params.toString(),{
        headers:{
          apikey:SUPABASE_ANON_KEY,
          Authorization:"Bearer "+SUPABASE_ANON_KEY,
          Accept:"application/json"
        }
      });

      if(!response.ok) return false;
      const rows=await response.json();
      const row=Array.isArray(rows)?rows[0]:null;
      if(!row || !row.payload_json) return false;

      renderPayload(row.payload_json);

      // mantém cópia local para funcionamento offline/fallback
      try{
        localStorage.setItem(dashboardCacheKey(view),JSON.stringify({
          version:2,
          aggregationVersion:FINANCIAL_AGGREGATION_VERSION,
          debtMappingVersion:DEBT_MAPPING_VERSION,
          savedAt:row.updated_at,
          state:row.status||"partial",
          payload:row.payload_json
        }));
      }catch{}

      const stamp=formatCacheTime(row.updated_at);
      const suffix=row.status==="partial"?" · carga parcial":"";
      setStatus("online","Supabase · "+stamp+suffix);
      return true;
    } catch(error) {
      console.warn("Falha ao ler snapshot do Supabase:",error);
      return false;
    }
  }

  function progressRowsFromPayload(view,payload) {
    if (!tenantId) return [];
    const periodo=document.getElementById("periodo")?.value || "ano";
    const exercicio=Number(document.getElementById("exercicio")?.value || new Date().getFullYear());
    const audits=payload?.meta?.sourceAudit||{};
    return Object.entries(audits).map(([fonte,audit])=>({
      tenant_id:tenantId,
      painel:view||"visao-geral",
      periodo,
      exercicio,
      fonte,
      registros_carregados:Number(audit?.loaded||0),
      paginas:Number(audit?.pages||0),
      next_offset:audit?.nextOffset ?? null,
      completo:audit?.complete===true,
      reported_total:audit?.reportedTotal ?? null,
      status:audit?.complete===true?"complete":"partial",
      detalhe:{
        error:audit?.error||null,
        sourceUsed:payload?.meta?.sourceUsed||{},
        fieldMapping:payload?.meta?.fieldMapping||{}
      }
    }));
  }

  async function persistDashboardToSupabase(view,payload,state) {
    if(!cfg.BACKEND_URL || !payload || !tenantId || hasActiveDashboardFilters(view)) return;
    const periodo=document.getElementById("periodo")?.value || "ano";
    const exercicio=Number(document.getElementById("exercicio")?.value || new Date().getFullYear());

    try{
      await api("/api/cache/snapshot",{
        method:"POST",
        timeoutMs:15000,
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          snapshot:{
            tenant_id:tenantId,
            painel:view||"visao-geral",
            periodo,
            exercicio,
            fonte:"auto",
            payload_json:compactPayloadForCache(payload),
            status:state||"partial"
          },
          progress:progressRowsFromPayload(view,payload)
        })
      });
    }catch(error){
      console.warn("Snapshot Supabase não gravado:",error);
    }
  }

  function loadDashboardFromCache(view) {
    const cached = readDashboardCache(view);
    if (!cached) {
      setStatus("waiting", "Sem dados locais · clique em ATUALIZAR");
      return false;
    }

    renderPayload(cached.payload);
    const stamp = formatCacheTime(cached.savedAt);
    const suffix = cached.state === "partial" ? " · carga parcial" : "";
    const fallback = cached._composed
      ? " · snapshot consolidado"
      : (cached._fallback ? " · snapshot de outra fonte" : "");
    const financeStale = Number(cached.aggregationVersion||0) < FINANCIAL_AGGREGATION_VERSION;
    const debtStale = Number(cached.debtMappingVersion||0) < DEBT_MAPPING_VERSION;
    const stale = financeStale
      ? " · financeiro precisa atualizar"
      : (debtStale ? " · dívida precisa atualizar" : "");
    setStatus("online", "Dados locais · " + stamp + suffix + fallback + stale);
    return true;
  }

  async function api(path, options = {}) {
    const base = String(cfg.BACKEND_URL || "").replace(/\/$/, "");
    if (!base) throw new Error("BACKEND_NOT_CONFIGURED");

    const headers = {...(options.headers || {}), Accept:"application/json"};
    const token = cfg.AUTH_REQUIRED && window.BIAuth && typeof BIAuth.getToken === "function" ? BIAuth.getToken() : "";
    if (token) headers.Authorization = "Session " + token;
    if (tenantId) headers["X-Tenant-Id"] = tenantId;

    const controller = new AbortController();
    const timeoutMs = Number(options.timeoutMs || 30000);
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const fetchOptions = {
        ...options,
        headers,
        credentials:"include",
        signal:controller.signal
      };
      delete fetchOptions.timeoutMs;

      const response = await fetch(base + path, fetchOptions);
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(body.error || ("HTTP " + response.status));
        error.status = response.status;
        throw error;
      }
      return body;
    } catch(error) {
      if (error && error.name === "AbortError") {
        const timeout = new Error("REQUEST_TIMEOUT");
        timeout.status = 408;
        throw timeout;
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  function mergeDashboardPart(target, part) {
    target.kpis = target.kpis || {};
    target.charts = target.charts || {};
    target.meta = target.meta || {warnings:[],sourceRows:{},sourceTotals:{},sourceAudit:{}};

    // Na Visão Geral fragmentada, cada lote representa uma parcela do total.
    for (const [key,value] of Object.entries(part.kpis || {})) {
      if (value === null || value === undefined) continue;
      const n=Number(value);
      if (Number.isFinite(n)) {
        target.kpis[key]=(Number(target.kpis[key])||0)+n;
      } else {
        target.kpis[key]=value;
      }
    }

    for (const [chartId, incoming] of Object.entries(part.charts || {})) {
      if (!target.charts[chartId]) {
        target.charts[chartId] = JSON.parse(JSON.stringify(incoming));
        continue;
      }

      const existing = target.charts[chartId];
      const sameLabels = JSON.stringify(existing.labels || []) === JSON.stringify(incoming.labels || []);

      if (sameLabels) {
        for (const ds of incoming.datasets || []) {
          const existingDs=(existing.datasets || []).find(item=>item.label===ds.label);
          if (!existingDs) {
            existing.datasets.push(JSON.parse(JSON.stringify(ds)));
            continue;
          }
          const max=Math.max(existingDs.data?.length||0,ds.data?.length||0);
          const summed=[];
          for(let i=0;i<max;i++){
            summed[i]=(Number(existingDs.data?.[i])||0)+(Number(ds.data?.[i])||0);
          }
          existingDs.data=summed;
        }
      } else if (
        (existing.datasets || []).length === 1 &&
        (incoming.datasets || []).length === 1 &&
        existing.datasets[0].label === incoming.datasets[0].label
      ) {
        existing.labels = [...(existing.labels || []), ...(incoming.labels || [])];
        existing.datasets[0].data = [
          ...(existing.datasets[0].data || []),
          ...(incoming.datasets[0].data || [])
        ];
      }
    }

    const meta = part.meta || {};
    target.meta.auditMode = meta.auditMode || target.meta.auditMode || "FULL";
    target.meta.generatedAt = meta.generatedAt || target.meta.generatedAt;
    target.meta.warnings = [...(target.meta.warnings || []), ...(meta.warnings || [])];

    for(const [key,value] of Object.entries(meta.sourceRows||{})){
      target.meta.sourceRows[key]=(Number(target.meta.sourceRows[key])||0)+(Number(value)||0);
    }
    for(const [key,value] of Object.entries(meta.sourceTotals||{})){
      target.meta.sourceTotals[key]=(Number(target.meta.sourceTotals[key])||0)+(Number(value)||0);
    }

    for(const [key,audit] of Object.entries(meta.sourceAudit||{})){
      const prev=target.meta.sourceAudit[key]||{};
      const prevLoaded=Number(prev.loaded)||0;
      const currentLoaded=Number(audit.loaded)||0;
      const accumulatedLoaded=prevLoaded+currentLoaded;

      const prevReported=prev.reportedTotal===null||prev.reportedTotal===undefined
        ? null : Number(prev.reportedTotal);
      const currentReported=audit.reportedTotal===null||audit.reportedTotal===undefined
        ? null : Number(audit.reportedTotal);

      let mergedReported=prevReported;
      if (currentReported!==null) {
        if (mergedReported===null) mergedReported=currentReported;
        else if (currentReported!==mergedReported) mergedReported=null;
      }

      // Um "total" menor que o acumulado não pode ser total global.
      if (mergedReported!==null && mergedReported<accumulatedLoaded) mergedReported=null;

      const isComplete=audit.complete===true;
      const mismatch=isComplete && mergedReported!==null && mergedReported!==accumulatedLoaded;

      target.meta.sourceAudit[key]={
        reportedTotal:mergedReported,
        loaded:accumulatedLoaded,
        pages:(Number(prev.pages)||0)+(Number(audit.pages)||0),
        complete:isComplete,
        hasMore:audit.hasMore===true,
        nextOffset:audit.nextOffset ?? null,
        startOffset:prev.startOffset ?? audit.startOffset ?? 0,
        truncated:Boolean(prev.truncated||audit.truncated),
        repeatedPage:Boolean(prev.repeatedPage||audit.repeatedPage),
        totalMismatch:mismatch,
        pageLimit:audit.pageLimit ?? prev.pageLimit ?? null,
        error:audit.error || prev.error || null,
        errorStatus:audit.errorStatus || prev.errorStatus || null,
        errorDetail:audit.errorDetail || prev.errorDetail || null,
        detectedFields:audit.detectedFields || prev.detectedFields || []
      };
    }
    target.meta.fieldMapping={...(target.meta.fieldMapping||{}),...(meta.fieldMapping||{})};
    target.meta.sourceUsed={...(target.meta.sourceUsed||{}),...(meta.sourceUsed||{})};
    return target;
  }

  function overviewProfile(part) {
    const profiles = {
      contribuintes:{pages:1,limit:1000},
      imoveis:{pages:1,limit:1000},
      economicos:{pages:1,limit:1000},
      parcelamentos:{pages:1,limit:1000},
      pagamentos:{pages:1,limit:100},
      debitos:{pages:1,limit:500},
      dividas:{pages:1,limit:250},
      "pagamentos-detalhados":{pages:1,limit:100}
    };
    return profiles[part] || {pages:1,limit:250};
  }

  async function requestOverviewChunk(part, params, offset, profile) {
    let pages=profile.pages;
    let limit=profile.limit;
    let lastError=null;

    for (let attempt=0;attempt<4;attempt++) {
      const chunkParams=new URLSearchParams(params);
      chunkParams.set("chunked","1");
      chunkParams.set("chunkOffset",String(offset));
      chunkParams.set("chunkPages",String(pages));
      chunkParams.set("chunkLimit",String(limit));

      try {
        return await api(
          "/api/dashboard/visao-geral/part/" + encodeURIComponent(part) + "?" + chunkParams.toString(),
          {timeoutMs:15000}
        );
      } catch(error) {
        lastError=error;
        // Falha de rede/limite: diminui o lote e tenta novamente.
        pages=1;
        limit=Math.max(50,Math.floor(limit/2));
        await new Promise(resolve=>setTimeout(resolve,350*(attempt+1)));
      }
    }

    throw lastError || new Error("CHUNK_REQUEST_FAILED");
  }

  async function loadOverviewPartFully(part, params, onProgress, options={}) {
    const aggregate={
      part,
      kpis:{},
      charts:{},
      meta:{auditMode:"FULL",warnings:[],sourceRows:{},sourceTotals:{},sourceAudit:{},fieldMapping:{}}
    };

    const profile=overviewProfile(part);
    let offset=Math.max(0,Number(options.startOffset)||0);
    let iterations=0;

    // Trava extrema contra endpoint defeituoso. Não é limite de dados.
    const safetyMaxIterations=10000;

    while(iterations<safetyMaxIterations){
      iterations++;

      if (typeof onProgress==="function") onProgress(aggregate,iterations,"requesting",offset);

      const payload=await requestOverviewChunk(part,params,offset,profile);
      mergeDashboardPart(aggregate,payload);

      const audits=Object.values(payload?.meta?.sourceAudit||{});
      const audit=audits[0]||null;

      if (typeof onProgress==="function") onProgress(aggregate,iterations,"loaded",offset,audit);

      if (!audit) break;
      if (audit.error) break;
      if (audit.complete===true) break;
      if (audit.hasMore!==true || audit.nextOffset===null || audit.nextOffset===undefined) break;

      const next=Number(audit.nextOffset);
      if (!Number.isFinite(next) || next<=offset) break;
      offset=next;

      await new Promise(resolve=>setTimeout(resolve,60));
    }

    if(iterations>=safetyMaxIterations){
      aggregate.meta.warnings=aggregate.meta.warnings||[];
      aggregate.meta.warnings.push({
        source:part,
        error:"SAFETY_PAGE_LIMIT_REACHED"
      });
    }

    return aggregate;
  }

  function sourceKeyForOverviewPart(part) {
    return {
      contribuintes:"contribuintes",
      imoveis:"imoveis",
      economicos:"economicos",
      parcelamentos:"parcelamentos",
      pagamentos:"pagamentos",
      debitos:"debitos",
      dividas:"encerramentoDividas",
      "pagamentos-detalhados":"pagamentosDetalhados"
    }[part] || part;
  }

  function existingAuditForPart(part,payload) {
    const audits=payload?.meta?.sourceAudit||{};
    if(part==="dividas") return audits.encerramentoDividas || audits.dividas || null;
    return audits[sourceKeyForOverviewPart(part)] || null;
  }

  function financialPartNeedsRebuild(part,payload) {
    if (!payload) return false;
    if (part==="pagamentos") return payload.kpis?.arrecadado===null || payload.kpis?.arrecadado===undefined;
    if (part==="debitos") return payload.kpis?.lancado===null || payload.kpis?.lancado===undefined;
    if (part==="dividas") return payload.kpis?.divida===null || payload.kpis?.divida===undefined;
    if (part==="pagamentos-detalhados") return !payload.charts?.["receita-credito"];
    return false;
  }

  async function loadOverviewSharded(params) {
    const parts = [
      "contribuintes",
      "imoveis",
      "economicos",
      "parcelamentos",
      "pagamentos",
      "debitos",
      "dividas",
      "pagamentos-detalhados"
    ];

    const cachedRecord=readDashboardCache("visao-geral");
    const canResume=cachedRecord && cachedRecord.state==="partial" && cachedRecord.payload;
    const financialSnapshotStale=Boolean(
      cachedRecord &&
      Number(cachedRecord.aggregationVersion||0) < FINANCIAL_AGGREGATION_VERSION
    );
    const debtMappingStale=Boolean(
      cachedRecord &&
      Number(cachedRecord.debtMappingVersion||0) < DEBT_MAPPING_VERSION
    );
    const merged=canResume
      ? JSON.parse(JSON.stringify(cachedRecord.payload))
      : {
          view:"visao-geral",
          kpis:{},
          charts:{},
          meta:{auditMode:"FULL",warnings:[],sourceRows:{},sourceTotals:{},sourceAudit:{},fieldMapping:{}}
        };

    // Avisos antigos são recalculados nesta execução.
    merged.meta=merged.meta||{};
    merged.meta.warnings=[];

    for (let index=0; index<parts.length; index++) {
      const partName=parts[index];
      const sourceKey=sourceKeyForOverviewPart(partName);
      const existingAudit=existingAuditForPart(partName,merged);
      const needsRebuild=financialPartNeedsRebuild(partName,merged);
      const isFinancial=["pagamentos","debitos","dividas","pagamentos-detalhados"].includes(partName);

      // Snapshots anteriores à nova lógica financeira precisam de uma reconstrução única
      // dessas quatro fontes, pois os agregados antigos não podem ser recalculados
      // sem reler os registros.
      const shouldRebuild=Boolean(
        isFinancial &&
        (
          financialSnapshotStale ||
          (partName==="dividas" && (debtMappingStale || needsRebuild)) ||
          (needsRebuild && !(Number(existingAudit?.loaded)||0))
        )
      );

      if (canResume && existingAudit?.complete===true && !shouldRebuild && !needsRebuild) {
        setStatus("waiting","Mantendo " + partName + " do snapshot local");
        continue;
      }

      if (shouldRebuild) {
        if (partName==="pagamentos") {
          delete merged.kpis.arrecadado;
          delete merged.charts["receita-mensal"];
          if (merged.charts["lancado-pago-saldo"]) {
            merged.charts["lancado-pago-saldo"].datasets=(merged.charts["lancado-pago-saldo"].datasets||[])
              .filter(ds=>ds.label!=="Pago");
          }
        }
        if (partName==="debitos") {
          delete merged.kpis.lancado;
          if (merged.charts["lancado-pago-saldo"]) {
            merged.charts["lancado-pago-saldo"].datasets=(merged.charts["lancado-pago-saldo"].datasets||[])
              .filter(ds=>!["Lançado","Saldo"].includes(ds.label));
          }
        }
        if (partName==="dividas") {
          delete merged.kpis.divida;
          delete merged.charts["divida-evolucao"];
          delete merged.charts["situacao-divida"];
        }
        if (partName==="pagamentos-detalhados") {
          delete merged.charts["receita-credito"];
        }
        delete merged.meta.sourceRows?.[sourceKey];
        delete merged.meta.sourceTotals?.[sourceKey];
        delete merged.meta.sourceAudit?.[sourceKey];

        if(partName==="dividas"){
          delete merged.meta.sourceRows?.dividas;
          delete merged.meta.sourceTotals?.dividas;
          delete merged.meta.sourceAudit?.dividas;
          delete merged.meta.sourceRows?.encerramentoDividas;
          delete merged.meta.sourceTotals?.encerramentoDividas;
          delete merged.meta.sourceAudit?.encerramentoDividas;
        }
      }

      setStatus(
        "waiting",
        (shouldRebuild ? "Reconstruindo " : "Carregando ") +
        (index+1) + "/" + parts.length + " · " + partName
      );

      try {
        const resumeOffset=(
          !shouldRebuild &&
          canResume &&
          existingAudit &&
          existingAudit.complete!==true &&
          existingAudit.hasMore===true &&
          existingAudit.nextOffset!==null &&
          existingAudit.nextOffset!==undefined
        ) ? Number(existingAudit.nextOffset) : 0;

        const result=await loadOverviewPartFully(
          partName,
          params,
          (partial,iteration,phase,currentOffset,audit)=>{
            setStatus(
              "waiting",
              "Carregando " + (index+1) + "/" + parts.length +
              " · " + partName +
              " · página " + ((Number(existingAudit?.pages)||0)+iteration) +
              (phase==="requesting" ? "..." : "")
            );

            const preview=JSON.parse(JSON.stringify(merged));
            mergeDashboardPart(preview,partial);
            renderPayload(preview);

            // Checkpoint a cada página concluída. Se fechar/recarregar,
            // a próxima atualização continua do nextOffset salvo.
            if(phase==="loaded"){
              saveDashboardCache("visao-geral",preview,"partial");
            }
          },
          {startOffset:resumeOffset}
        );
        mergeDashboardPart(merged,result);
      } catch(error) {
        merged.meta.warnings.push({
          source:sourceKey,
          error:error.message === "REQUEST_TIMEOUT" ? "Tempo limite excedido na página" : (error.message || "PART_REQUEST_FAILED"),
          errorStatus:error.status || null
        });
        if (!merged.meta.sourceRows[sourceKey]) merged.meta.sourceRows[sourceKey]=0;
        merged.meta.sourceAudit[sourceKey]={
          ...(merged.meta.sourceAudit[sourceKey]||{}),
          complete:false,
          error:error.message === "REQUEST_TIMEOUT" ? "Tempo limite excedido na página" : (error.message || "PART_REQUEST_FAILED"),
          errorStatus:error.status || null
        };
      }

      renderPayload(merged);

      const allAudits=Object.values(merged.meta?.sourceAudit||{});
      const allComplete=allAudits.length>0 && allAudits.every(a=>a && a.complete===true);
      saveDashboardCache(
        "visao-geral",
        merged,
        index === parts.length - 1 && allComplete ? "complete" : "partial"
      );
    }

    return merged;
  }

  async function loadDashboardData(view, options = {}) {
    const force = options.force === true;

    if (!force) {
      const loadedFromSupabase=await loadDashboardFromSupabase(view);
      if(!loadedFromSupabase) loadDashboardFromCache(view);
      return;
    }

    if (!cfg.BACKEND_URL) return;
    setStatus("waiting", "Atualizando dados da Betha...");

    try {
      const health = await api("/api/health");
      const missing = [];
      if (!health.accessTokenConfigured) missing.push("BETHA_ACCESS_TOKEN");
      if (!health.tenantsConfigured) missing.push("BETHA_TENANTS_JSON");
      if (missing.length) {
        throw new Error("WORKER_CONFIG_MISSING:" + missing.join(","));
      }

      const params = new URLSearchParams({
        periodo: document.getElementById("periodo").value,
        exercicio: document.getElementById("exercicio").value,
        fonte: document.getElementById("fontePreferencial").value
      });

      for (const [key,value] of Object.entries(currentDashboardFilters(view))) {
        params.set(key,value);
      }

      const payload = view === "visao-geral"
        ? await loadOverviewSharded(params)
        : await api("/api/dashboard/" + encodeURIComponent(view) + "?" + params.toString());

      renderPayload(payload);
      saveDashboardCache(view, payload, "complete");

      const warnings = payload && payload.meta && Array.isArray(payload.meta.warnings)
        ? payload.meta.warnings
        : [];

      const saved = readDashboardCache(view);
      const stamp = saved ? formatCacheTime(saved.savedAt) : "";

      if (warnings.length) {
        setStatus("waiting", "Atualizado " + stamp + " · " + warnings.length + " fonte(s) com aviso");
      } else {
        setStatus("online", "Atualizado " + stamp + " · salvo localmente");
      }
    } catch (error) {
      console.warn("Falha ao atualizar dashboard:", error);

      // Mantém o último snapshot na tela mesmo se a atualização falhar.
      const restored = loadDashboardFromCache(view);

      if (error.status === 404 || error.status === 501) {
        setStatus("waiting", "Dados locais mantidos · motor analítico indisponível");
      } else if (error.message === "APPLICATION_SESSION_NOT_CONFIGURED") {
        setStatus("waiting", "Dados locais mantidos · aguardando autenticação Betha");
      } else if (!restored) {
        setStatus("error", "Atualização indisponível");
      }
    }
  }

  function setStatus(type, text) {
    const el = document.getElementById("apiStatus");
    el.className = "api-status api-status-" + type;
    el.lastElementChild.textContent = text;
  }

  function sourceKeyCandidates(source) {
    const raw=String(source||"");
    const parts=raw.split("|").map(x=>x.trim()).filter(Boolean);
    const out=[];

    for(const part of parts){
      const resource=part.includes(":") ? part.split(":").slice(1).join(":") : part;
      const camel=resource.replace(/-([a-z])/g,(_,c)=>c.toUpperCase());
      out.push(resource,camel);

      if(resource==="pagamentos-detalhados") out.push("pagamentosDetalhados");
      if(resource==="encerramento-dividas") out.push("encerramentoDividas","dividas");
      if(resource==="encerramento-lancamentos") out.push("encerramentoLancamentos","debitos");
    }

    return [...new Set(out)];
  }

  function auditForSource(source) {
    const audits=currentPayload?.meta?.sourceAudit||{};
    for(const key of sourceKeyCandidates(source)){
      if(audits[key]) return {key,audit:audits[key]};
    }
    return null;
  }

  function coverageForSource(source) {
    const found=auditForSource(source);
    if(!found) return null;
    const a=found.audit||{};
    return {
      key:found.key,
      loaded:Number(a.loaded||0),
      pages:Number(a.pages||0),
      complete:a.complete===true,
      reportedTotal:a.reportedTotal===null||a.reportedTotal===undefined ? null : Number(a.reportedTotal),
      error:a.error||null
    };
  }

  function relatedChartIdsForKpi(kpi) {
    const map={
      arrecadado:["receita-mensal","receita-credito"],
      lancado:["lancado-pago-saldo"],
      divida:["divida-evolucao","situacao-divida"],
      parcelado:[],
      contribuintes:["cadastros"],
      imoveis:["cadastros"]
    };
    return map[kpi.id]||[];
  }

  function datasetAllowedForKpi(kpi,dataset) {
    const label=String(dataset?.label||"").toLowerCase();
    if(kpi.id==="contribuintes") return label.includes("contrib");
    if(kpi.id==="imoveis") return label.includes("imó") || label.includes("imov");
    if(kpi.id==="arrecadado") return label.includes("pago") || label.includes("arrecad");
    if(kpi.id==="lancado") return label.includes("lanç") || label.includes("lanc");
    if(kpi.id==="divida") return label.includes("dívida") || label.includes("divida") || label.includes("saldo");
    return true;
  }

  function valueDisplay(value,format) {
    if(value===null || value===undefined || value==="") return "—";
    if(format==="currency") return Number(value||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
    if(format==="percent") return Number(value||0).toLocaleString("pt-BR",{maximumFractionDigits:2})+"%";
    return Number.isFinite(Number(value)) ? Number(value).toLocaleString("pt-BR") : String(value);
  }

  function chartSeriesTable(chartDef,data,kpi=null) {
    if(!data || !Array.isArray(data.labels) || !Array.isArray(data.datasets)) return "";
    const datasets=(data.datasets||[]).filter(ds=>!kpi || datasetAllowedForKpi(kpi,ds));
    if(!datasets.length) return "";

    const totals=datasets.map(ds=>(ds.data||[]).reduce((sum,v)=>sum+(Number(v)||0),0));
    const grand=totals.reduce((a,b)=>a+b,0);
    const rows=data.labels.map((label,index)=>{
      const cells=datasets.map((ds,di)=>{
        const value=Number(ds.data?.[index]||0);
        const percent=grand>0 ? (value/grand)*100 : null;
        return `<td><strong>${escapeHtml(valueDisplay(value,data.format))}</strong>${percent!==null ? `<small class="detail-percent">${percent.toLocaleString("pt-BR",{maximumFractionDigits:1})}%</small>` : ""}</td>`;
      }).join("");
      return `<tr><td>${escapeHtml(String(label))}</td>${cells}</tr>`;
    }).join("");

    return `
      <div class="detail-table-wrap">
        <table class="detail-table detail-series-table">
          <thead>
            <tr><th>${escapeHtml(chartDef.dimension ? chartDef.dimension.replace(/:.*$/,"") : "Período / categoria")}</th>${datasets.map(ds=>`<th>${escapeHtml(ds.label||chartDef.title)}</th>`).join("")}</tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr><th>Total exibido</th>${datasets.map((ds,i)=>`<th>${escapeHtml(valueDisplay(totals[i],data.format))}</th>`).join("")}</tr>
          </tfoot>
        </table>
      </div>
    `;
  }

  function sourceOriginHtml(source,field) {
    const coverage=coverageForSource(source);
    const sourceUsed=currentPayload?.meta?.sourceUsed||{};
    const mapping=currentPayload?.meta?.fieldMapping||{};
    const sourceUsedText=Object.values(sourceUsed).filter(Boolean).join(", ");
    const mappingText=Object.entries(mapping).map(([k,v])=>v ? k+": "+v : "").filter(Boolean).join(" · ");

    return `
      <section class="drawer-section">
        <h3>Origem e cobertura</h3>
        <div class="detail-summary-grid">
          <div class="detail-stat"><span>Fonte declarada</span><strong>${escapeHtml(source||"—")}</strong></div>
          <div class="detail-stat"><span>Campo / expressão</span><strong>${escapeHtml(field||"—")}</strong></div>
          ${coverage ? `
            <div class="detail-stat"><span>Registros lidos</span><strong>${coverage.loaded.toLocaleString("pt-BR")}</strong></div>
            <div class="detail-stat"><span>Páginas</span><strong>${coverage.pages.toLocaleString("pt-BR")}</strong></div>
            <div class="detail-stat"><span>Situação da fonte</span><strong>${coverage.complete ? "COMPLETO" : "PARCIAL"}</strong></div>
          ` : ""}
        </div>
        ${sourceUsedText ? `<div class="data-path">Fonte efetivamente utilizada: ${escapeHtml(sourceUsedText)}</div>` : ""}
        ${mappingText ? `<div class="data-path">Mapeamento detectado: ${escapeHtml(mappingText)}</div>` : ""}
      </section>
    `;
  }

  function drillProgressHtml(source,drill) {
    const detailResource=typeof detailResourceFor==="function" ? detailResourceFor(source,drill) : "";
    const nodes=[
      {label:"Visão consolidada",state:"done"},
      {label:"Composição",state:"done"},
      {label:"Origem / cadastro",state:"done"},
      {label:detailResource ? "Registros autorizados" : "Registro individual",state:detailResource ? "done" : "locked"}
    ];
    return `
      <section class="drawer-section">
        <h3>Caminho macro → micro</h3>
        <div class="drill-chain drill-chain-rich">
          ${nodes.map((node,index)=>`
            ${index ? '<i class="mdi mdi-chevron-right"></i>' : ''}
            <span class="drill-node ${node.state==="locked" ? "is-locked" : "is-ready"}">
              ${node.state==="locked" ? '<i class="mdi mdi-lock-outline"></i>' : '<i class="mdi mdi-check-circle-outline"></i>'}
              ${escapeHtml(node.label)}
            </span>
          `).join("")}
        </div>
        <p class="detail-security-note"><i class="mdi mdi-shield-lock-outline"></i> Registros individuais são exibidos somente quando a fonte possui detalhamento autorizado para a prefeitura e para a sessão atual.</p>
      </section>
    `;
  }

  function compositionForKpi(kpi) {
    const ids=relatedChartIdsForKpi(kpi);
    const pieces=[];
    for(const id of ids){
      const def=(dashboards[currentView]?.charts||[]).find(x=>x.id===id);
      const data=currentPayload?.charts?.[id];
      if(!def || !data) continue;
      const table=chartSeriesTable(def,data,kpi);
      if(!table) continue;
      pieces.push(`
        <div class="detail-composition-block">
          <div class="detail-composition-head">
            <strong>${escapeHtml(def.title)}</strong>
            <span>${escapeHtml(def.subtitle||"")}</span>
          </div>
          ${table}
        </div>
      `);
    }
    return pieces.join("");
  }

  const DETAIL_SUPPORTED = new Set([
    "pagamentos-detalhados-valores","pagamentos-detalhados",
    "debitos","dividas","parcelamentos","parcelamentos-parcelas",
    "guias-unificadas","contribuintes","imoveis","economicos",
    "receitas","creditos-tributarios","indexadores-valores",
    "logradouros","obras","transferencias-imoveis"
  ]);

  function detailResourceFor(source,drill) {
    const candidates=[];
    if(drill) candidates.push(String(drill));
    for(const part of String(source||"").split("|")){
      const resource=part.includes(":") ? part.split(":").slice(1).join(":") : part;
      if(resource) candidates.push(resource);
    }
    return candidates.find(item=>DETAIL_SUPPORTED.has(item)) || "";
  }

  function detailRecordsSection(source,drill) {
    const resource=detailResourceFor(source,drill);
    if(!resource) return "";

    return `
      <section class="drawer-section detail-records-section">
        <div class="detail-records-head">
          <div>
            <h3>Registros autorizados</h3>
            <p>Consulta paginada da fonte vinculada, respeitando prefeitura, sessão e filtros atuais.</p>
          </div>
          <button class="btn-secondary-betha" type="button" data-load-detail="${escapeHtml(resource)}">
            <i class="mdi mdi-table-search"></i> CARREGAR REGISTROS
          </button>
        </div>
        <div class="detail-records-container" data-detail-container data-detail-resource="${escapeHtml(resource)}">
          <div class="detail-empty-state compact">
            <span>Os registros são carregados somente quando solicitados.</span>
          </div>
        </div>
      </section>
    `;
  }

  function formatDetailCell(value,format) {
    if(value===null||value===undefined||value==="") return "—";
    if(format==="currency") return Number(value||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
    if(format==="number") return Number.isFinite(Number(value)) ? Number(value).toLocaleString("pt-BR",{maximumFractionDigits:6}) : String(value);
    if(format==="boolean") return value===true ? "Sim" : value===false ? "Não" : String(value);
    if(format==="date") {
      const d=new Date(value);
      return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString("pt-BR");
    }
    return String(value);
  }

  function detailPageTable(payload) {
    const columns=Array.isArray(payload?.columns)?payload.columns:[];
    const rows=Array.isArray(payload?.rows)?payload.rows:[];
    if(!columns.length) return '<div class="detail-empty-state compact"><span>Fonte sem colunas de detalhamento configuradas.</span></div>';
    if(!rows.length) return '<div class="detail-empty-state compact"><span>Nenhum registro encontrado neste recorte.</span></div>';

    return `
      <div class="detail-table-wrap">
        <table class="detail-table">
          <thead><tr>${columns.map(col=>'<th>'+escapeHtml(col.label||col.key)+'</th>').join("")}</tr></thead>
          <tbody>
            ${rows.map(row=>'<tr>'+columns.map(col=>
              '<td>'+escapeHtml(formatDetailCell(row[col.key],col.format))+'</td>'
            ).join("")+'</tr>').join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  async function loadDetailRecords(resource,offset=0) {
    const container=document.querySelector("[data-detail-container]");
    if(!container) return;

    container.innerHTML='<div class="detail-empty-state compact"><i class="mdi mdi-loading mdi-spin"></i><span>Consultando registros autorizados…</span></div>';

    const params=new URLSearchParams({
      periodo:document.getElementById("periodo")?.value||"todos",
      exercicio:document.getElementById("exercicio")?.value||String(new Date().getFullYear()),
      limit:"25",
      offset:String(offset||0)
    });
    for(const [key,value] of Object.entries(currentDashboardFilters())) params.set(key,value);

    try {
      const payload=await api("/api/detail/"+encodeURIComponent(resource)+"?"+params.toString(),{timeoutMs:30000});
      const pagination=payload?.pagination||{};
      container.innerHTML=detailPageTable(payload)+`
        <div class="detail-pagination">
          <span>${Number(pagination.loaded||0).toLocaleString("pt-BR")} registro(s) nesta página</span>
          <div>
            ${offset>0 ? '<button class="btn-secondary-betha" type="button" data-detail-page="'+escapeHtml(resource)+'" data-detail-offset="'+Math.max(0,offset-25)+'">ANTERIOR</button>' : ''}
            ${pagination.hasMore && pagination.nextOffset!==null && pagination.nextOffset!==undefined
              ? '<button class="btn-secondary-betha" type="button" data-detail-page="'+escapeHtml(resource)+'" data-detail-offset="'+escapeHtml(pagination.nextOffset)+'">PRÓXIMA</button>'
              : ''}
          </div>
        </div>
      `;
    } catch(error) {
      container.innerHTML='<div class="detail-empty-state compact"><strong>Detalhamento indisponível</strong><span>'+escapeHtml(error.message||"Falha na consulta")+'</span></div>';
    }
  }

  function openKpiDetail(kpi) {
    const raw=currentPayload?.kpis?.[kpi.id];
    const composition=compositionForKpi(kpi);
    const coverage=coverageForSource(kpi.source);

    openDrawer(kpi.label, `
      <section class="drawer-section detail-hero">
        <small>VALOR CONSOLIDADO</small>
        <strong class="detail-hero-value">${escapeHtml(formatValue(raw,kpi.format))}</strong>
        <span>Período: ${escapeHtml(document.getElementById("periodo")?.selectedOptions?.[0]?.textContent||"—")} · Exercício: ${escapeHtml(document.getElementById("exercicio")?.value||"—")}</span>
      </section>

      <section class="drawer-section">
        <h3>Composição do indicador</h3>
        ${composition || `
          <div class="detail-empty-state">
            <i class="mdi mdi-database-check-outline"></i>
            <strong>Indicador consolidado disponível</strong>
            <span>${coverage ? coverage.loaded.toLocaleString("pt-BR")+" registros processados na fonte." : "A fonte foi consolidada, mas este indicador ainda não possui uma dimensão armazenada no snapshot."}</span>
          </div>
        `}
      </section>

      ${sourceOriginHtml(kpi.source,kpi.field)}
      ${detailRecordsSection(kpi.source,sourceKeyCandidates(kpi.source)[0])}
      ${drillProgressHtml(kpi.source,sourceKeyCandidates(kpi.source)[0])}
    `);
  }

  function openChartDetail(chartDef, selected) {
    const data=currentPayload?.charts?.[chartDef.id];
    let selectedHtml="";
    if(selected){
      selectedHtml=`
        <section class="drawer-section detail-selected-point">
          <h3>Ponto selecionado</h3>
          <strong>${escapeHtml(String(selected.label))}</strong>
          <div class="detail-summary-grid">
            ${selected.datasets.map(x=>`<div class="detail-stat"><span>${escapeHtml(x.label)}</span><strong>${escapeHtml(valueDisplay(x.value,data?.format))}</strong></div>`).join("")}
          </div>
        </section>
      `;
    }

    const series=chartSeriesTable(chartDef,data);
    openDrawer(chartDef.title,`
      <section class="drawer-section">
        <h3>Definição analítica</h3>
        <div class="detail-summary-grid">
          <div class="detail-stat"><span>Dimensão</span><strong>${escapeHtml(chartDef.dimension||"—")}</strong></div>
          <div class="detail-stat"><span>Medidas</span><strong>${escapeHtml((chartDef.measures||[]).join(", ")||"—")}</strong></div>
          <div class="detail-stat"><span>Fonte</span><strong>${escapeHtml(chartDef.source||"—")}</strong></div>
        </div>
      </section>

      ${selectedHtml}

      <section class="drawer-section">
        <h3>Composição completa</h3>
        ${series || `
          <div class="detail-empty-state">
            <i class="mdi mdi-chart-box-outline"></i>
            <strong>Sem composição para o recorte atual</strong>
            <span>Atualize os dados ou ajuste os filtros desta visão.</span>
          </div>
        `}
      </section>

      ${sourceOriginHtml(chartDef.source,(chartDef.measures||[]).join(", "))}
      ${detailRecordsSection(chartDef.source,chartDef.drill)}
      ${drillProgressHtml(chartDef.source,chartDef.drill)}
    `);
  }

  function buildRowsTable(rows) {
    const keys=[...new Set(rows.flatMap(row=>Object.keys(row)))].slice(0,8);
    return `
      <div class="detail-table-wrap">
        <table class="detail-table">
          <thead><tr>${keys.map(k=>`<th>${escapeHtml(k)}</th>`).join("")}</tr></thead>
          <tbody>
            ${rows.slice(0,100).map(row=>`<tr>${keys.map(k=>`<td>${escapeHtml(String(row[k]??""))}</td>`).join("")}</tr>`).join("")}
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

  document.getElementById("drawerBody").addEventListener("click",(event)=>{
    const loadButton=event.target.closest("[data-load-detail]");
    if(loadButton){
      loadDetailRecords(loadButton.dataset.loadDetail,0);
      return;
    }
    const pageButton=event.target.closest("[data-detail-page]");
    if(pageButton){
      loadDetailRecords(pageButton.dataset.detailPage,Number(pageButton.dataset.detailOffset||0));
    }
  });

  document.getElementById("closeDrawer").addEventListener("click", () => closeDrawer("detailDrawer"));
  document.getElementById("closeIntegration").addEventListener("click", () => closeDrawer("integrationDrawer"));
  document.getElementById("closeUserDrawer").addEventListener("click", () => closeDrawer("userDrawer"));
  document.getElementById("logoutButton").addEventListener("click", () => BIAuth.logout());
  document.getElementById("drawerBackdrop").addEventListener("click", () => {
    closeDrawer("detailDrawer");
    closeDrawer("integrationDrawer");
    closeDrawer("userDrawer");
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

  let selectedCentralUser = null;
  let wizardStep = 1;
  let pageMappingReady = false;
  let pageMappingStatusCache = null;

  const PAGE_PERMISSION_IDS = Object.freeze({
    "visao-geral":"BIVisaoGeralPage",
    arrecadacao:"BIArrecadacaoPage",
    debitos:"BIDebitosPage",
    divida:"BIDividaPage",
    parcelamentos:"BIParcelamentosPage",
    "receitas-creditos":"BIReceitasCreditosPage",
    guias:"BIGuiasPage",
    indexadores:"BIIndexadoresPage",
    encerramento:"BIEncerramentoPage",
    economicos:"BIEconomicosPage",
    imobiliario:"BIImobiliarioPage",
    contribuintes:"BIContribuintesPage",
    territorio:"BITerritorioPage",
    obras:"BIObrasPage",
    itbi:"BIITBIPage",
    qualidade:"BIQualidadePage",
    "usuarios-admin":"BIUsuariosPage",
    "configuracoes-admin":"BIConfiguracoesPage"
  });

  function currentTenantInfo() {
    return authorizedTenants.find(item=>item.id===tenantId) || null;
  }

  function hideMainViews() {
    document.getElementById("dashboardView").hidden = true;
    document.getElementById("usersAdminView").hidden = true;
    document.getElementById("configAdminView").hidden = true;
  }

  function setConfigText(id,text) {
    const el=document.getElementById(id);
    if(el) el.textContent=text;
  }

  function renderExpectedPermissions(expected) {
    const list=document.getElementById("configPermissionList");
    if(!list) return;
    const constraints=Array.isArray(expected&&expected.constraints)?expected.constraints:[];
    if(!constraints.length){
      list.innerHTML='<div class="table-empty">A matriz de permissões não foi carregada.</div>';
      return;
    }
    list.innerHTML=constraints.map(item=>
      '<div class="config-permission-chip"><i class="mdi mdi-check-decagram"></i><span>'+
      escapeHtml(item.description||item.id)+'</span></div>'
    ).join("");
  }

  function pageMappingFriendly(code) {
    const map={
      PAGE_MAPPING_SCOPE_REQUIRED:"A credencial de serviço precisa do escopo autorizacoes.plataforma.betha.cloud/parceiro.leitura.",
      PAGE_MAPPING_WRITE_SCOPE_REQUIRED:"Para publicar, ative o escopo autorizacoes.plataforma.betha.cloud/parceiro.escrita na credencial de serviço e renove o token.",
      PAGE_MAPPING_TOKEN_INVALID:"O token de serviço não foi aceito pela API de Autorizações Dados.",
      ADMIN_REQUIRED:"Seu usuário não possui perfil de administrador para alterar esta configuração."
    };
    return map[code] || code;
  }

  async function readPageMappingStatus({silent=false}={}) {
    try {
      const result=await api("/api/admin/page-mapping/status");
      pageMappingStatusCache=result;
      pageMappingReady=result.configured===true;
      renderExpectedPermissions(result.expected);

      if(!silent){
        const badge=document.getElementById("pageMappingBadge");
        const publish=document.getElementById("publishPageMappingButton");
        const tenant=currentTenantInfo();

        setConfigText("configMappingStatus",pageMappingReady ? "Publicada" : "Não publicada");
        setConfigText(
          "configMappingDetail",
          pageMappingReady
            ? String(result.constraintCount||0)+" permissões funcionais disponíveis."
            : "A matriz do BI ainda não está registrada para esta credencial."
        );
        setConfigText(
          "pageMappingMessage",
          pageMappingReady
            ? "A matriz de permissões está disponível na Betha. Novos usuários podem receber permissões por módulo."
            : "A matriz esperada está pronta no BI e pode ser publicada por um administrador."
        );

        if(badge){
          badge.textContent=pageMappingReady?"PUBLICADA":"PENDENTE";
          badge.className="config-status-badge "+(pageMappingReady?"ok":"warn");
        }
        if(publish){
          publish.disabled=!(tenant&&tenant.admin===true);
          publish.title=publish.disabled?"Somente administradores podem publicar permissões.":"Publicar a matriz versionada do BI na Betha.";
        }
      }

      return result;
    } catch(error) {
      pageMappingReady=false;
      pageMappingStatusCache={error:error.message};
      if(!silent){
        const badge=document.getElementById("pageMappingBadge");
        const publish=document.getElementById("publishPageMappingButton");
        const tenant=currentTenantInfo();
        setConfigText("configMappingStatus","Ação necessária");
        setConfigText("configMappingDetail",pageMappingFriendly(error.message));
        setConfigText("pageMappingMessage",pageMappingFriendly(error.message));
        if(badge){
          badge.textContent="AÇÃO NECESSÁRIA";
          badge.className="config-status-badge warn";
        }
        if(publish){
          publish.disabled=!(tenant&&tenant.admin===true);
        }
      }
      return null;
    }
  }

  async function loadConfigAdmin() {
    const healthPromise=api("/api/health");
    const mappingPromise=readPageMappingStatus({silent:false});
    const tenant=currentTenantInfo();

    setConfigText("configTenantStatus",tenant ? (tenant.name||tenant.id) : "Não selecionada");
    setConfigText(
      "configTenantDetail",
      tenant ? "Contexto autorizado para esta sessão." : "Selecione uma prefeitura autorizada."
    );
    setConfigText("configTenantId",tenantId||"—");
    setConfigText("configEntityId",tenant&&tenant.entityId ? tenant.entityId : "—");
    setConfigText("configDatabaseId",tenant&&tenant.databaseId ? tenant.databaseId : "—");

    try {
      const health=await healthPromise;
      setConfigText("configAuthStatus",health.loginCredentialConfigured&&health.sessionStoreConfigured?"Operacional":"Verificar configuração");
      setConfigText(
        "configAuthDetail",
        health.loginCredentialConfigured&&health.sessionStoreConfigured
          ? "OAuth Betha e sessão server-side disponíveis."
          : "Há componentes de autenticação pendentes."
      );
      setConfigText("configDataStatus",health.accessTokenConfigured&&health.tenantsConfigured?"Operacional":"Verificar configuração");
      setConfigText(
        "configDataDetail",
        health.accessTokenConfigured&&health.tenantsConfigured
          ? "Token de serviço e cadastro multi-entidade configurados."
          : "Credencial de serviço ou cadastro de tenants pendente."
      );
      setConfigText("configWorkerVersion",health.buildVersion||"—");
    } catch(error) {
      setConfigText("configAuthStatus","Indisponível");
      setConfigText("configAuthDetail","Não foi possível consultar a saúde do Worker.");
      setConfigText("configDataStatus","Indisponível");
      setConfigText("configDataDetail",error.message||"Falha na consulta.");
    }

    await mappingPromise;
  }

  function renderConfigAdmin() {
    hideMainViews();
    document.getElementById("configAdminView").hidden = false;
    document.getElementById("pageContext").textContent = "CONFIGURAÇÕES";
    loadConfigAdmin();
  }

  async function publishPageMappingFromUi() {
    const button=document.getElementById("publishPageMappingButton");
    const message=document.getElementById("pageMappingMessage");
    if(button){
      button.disabled=true;
      button.innerHTML='<i class="mdi mdi-loading mdi-spin"></i> PUBLICANDO';
    }
    if(message) message.textContent="Publicando a matriz de permissões na Betha…";

    try {
      await api("/api/admin/page-mapping",{method:"PUT"});
      if(message) message.textContent="Matriz publicada com sucesso. As permissões já podem ser usadas na gestão de usuários.";
      await readPageMappingStatus({silent:false});
    } catch(error) {
      if(message) message.textContent=pageMappingFriendly(error.message);
      const badge=document.getElementById("pageMappingBadge");
      if(badge){
        badge.textContent="AÇÃO NECESSÁRIA";
        badge.className="config-status-badge warn";
      }
    } finally {
      if(button){
        button.innerHTML='<i class="mdi mdi-cloud-upload-outline"></i> PUBLICAR PERMISSÕES';
        const tenant=currentTenantInfo();
        button.disabled=!(tenant&&tenant.admin===true);
      }
    }
  }

  function renderUsersAdmin() {
    hideMainViews();
    document.getElementById("usersAdminView").hidden = false;
    document.getElementById("pageContext").textContent = "USUÁRIOS";
    loadUsers();
  }

  function normalizeAccessList(payload) {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.content)) return payload.content;
    if (payload && payload.data && Array.isArray(payload.data.content)) return payload.data.content;
    return [];
  }

  function renderUsersTable(payload) {
    const tbody = document.getElementById("usersTableBody");
    const rows = normalizeAccessList(payload);
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="table-empty">Nenhum usuário encontrado para esta entidade.</td></tr>';
      return;
    }

    tbody.innerHTML = rows.map((item) => {
      const accessId = item.id || item.accessId || "";
      const name = item.userName || item.name || item.nome || item.user || "Usuário";
      const login = item.user || item.login || item.idUsuario || "";
      const authorized = item.createAt || item.authorizedAt || item.autorizadoEm || "";
      const expires = item.expiresIn || item.expires || "";
      const groups = item.totalGroups ?? item.groups?.length ?? 0;
      const restrictions = item.totalRestrictions ?? item.restrictions?.length ?? 0;
      const connected = Boolean(item.connected);
      const blocked = Boolean(item.blocked);
      const profile = item.admin ? "Administrador" : item.technical ? "Técnico" : (groups ? groups + " grupo(s)" : "Usuário");

      return `
        <tr data-user-row data-search="${escapeHtml((name + " " + login).toLowerCase())}" data-access-id="${escapeHtml(accessId)}">
          <td><div class="user-name">${escapeHtml(name)}</div><div class="user-login">@${escapeHtml(login)}</div></td>
          <td>${escapeHtml(formatDateTime(authorized))}</td>
          <td>${escapeHtml(formatDate(expires))}</td>
          <td>${escapeHtml(profile)}</td>
          <td><span class="user-badge ${restrictions ? "info" : "muted"}">${restrictions ? restrictions + " restrição(ões)" : "Sem restrições"}</span></td>
          <td><span class="user-badge ${blocked ? "muted" : connected ? "ok" : "muted"}">${blocked ? "Bloqueado" : connected ? "Conectado" : "Desconectado"}</span></td>
          <td>
            <button class="row-action danger" type="button" data-revoke-access="${escapeHtml(accessId)}" data-user-name="${escapeHtml(name)}" title="Remover acesso" ${accessId ? "" : "disabled"}>
              <i class="mdi mdi-account-remove-outline"></i>
            </button>
          </td>
        </tr>
      `;
    }).join("");
    applyUsersSearch();
  }

  async function loadUsers() {
    const tbody = document.getElementById("usersTableBody");
    if (!tenantId) {
      tbody.innerHTML = '<tr><td colspan="7" class="table-empty">Selecione uma entidade autorizada para gerenciar usuários.</td></tr>';
      return;
    }
    tbody.innerHTML = '<tr><td colspan="7" class="table-empty">Consultando autorizações da entidade…</td></tr>';
    try {
      const payload = await api("/api/admin/users?limit=100&offset=0");
      renderUsersTable(payload);
    } catch (error) {
      tbody.innerHTML = '<tr><td colspan="7" class="table-empty">Não foi possível consultar os usuários: ' + escapeHtml(error.message) + '</td></tr>';
    }
  }

  function formatDate(value) {
    if (!value) return "—";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString("pt-BR");
  }

  function formatDateTime(value) {
    if (!value) return "—";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString("pt-BR");
  }

  function applyUsersSearch() {
    const term = (document.getElementById("usersSearchInput").value || "").trim().toLowerCase();
    document.querySelectorAll("[data-user-row]").forEach(row => {
      row.hidden = Boolean(term) && !String(row.dataset.search || "").includes(term);
    });
  }

  function openUserDrawer() {
    selectedCentralUser = null;
    wizardStep = 1;
    document.getElementById("centralUserSearch").value = "";
    document.getElementById("centralUserResult").textContent = "Informe o login exato do usuário para consultar a Central de Usuários.";
    document.getElementById("accessExpires").value = "";
    document.getElementById("accessAdmin").checked = false;
    document.getElementById("accessTechnical").checked = false;
    const defaultProfile=document.querySelector('input[name="biGroup"][value="consulta"]');
    if(defaultProfile) defaultProfile.checked=true;
    setWizardStep(1);
    document.getElementById("userDrawer").classList.add("open");
    document.getElementById("userDrawer").setAttribute("aria-hidden","false");
    document.getElementById("drawerBackdrop").hidden = false;
    document.body.classList.add("drawer-open");
  }

  function setWizardStep(step) {
    wizardStep = Math.min(4, Math.max(1, step));
    document.querySelectorAll(".wizard-step").forEach(el => el.classList.toggle("is-active", Number(el.dataset.step) === wizardStep));
    document.querySelectorAll(".wizard-panel").forEach(el => el.hidden = Number(el.dataset.panel) !== wizardStep);
    document.getElementById("wizardBack").disabled = wizardStep === 1;
    document.getElementById("wizardNext").hidden = wizardStep === 4;

    const save = document.getElementById("wizardSave");
    save.hidden = wizardStep !== 4;

    if (wizardStep === 2) {
      renderPermissionOptions();
      readPageMappingStatus({silent:true}).finally(updateWizardSaveState);
    }

    updateWizardSaveState();
  }

  function renderPermissionOptions() {
    const container = document.getElementById("permissionsList");
    const items = Object.entries(dashboards).map(([id, def]) => ({id, label:def.title}));
    items.push({id:"usuarios-admin",label:"Usuários e acessos"});
    items.push({id:"configuracoes-admin",label:"Sistema e permissões"});

    container.innerHTML = items.map(item =>
      '<label class="permission-item"><input type="checkbox" value="' + escapeHtml(item.id) + '" checked> ' + escapeHtml(item.label) + '</label>'
    ).join("");

    applyPermissionPreset();
  }

  function selectedProfile() {
    return document.querySelector('input[name="biGroup"]:checked')?.value || "consulta";
  }

  function applyPermissionPreset() {
    const profile=selectedProfile();
    const inputs=[...document.querySelectorAll('#permissionsList input[type="checkbox"]')];

    for(const input of inputs){
      if(profile==="consulta") input.checked=!ADMIN_VIEWS.has(input.value);
      else if(profile==="gestor") input.checked=input.value!=="configuracoes-admin";
      else input.checked=true;
    }

    if(profile==="administrador") {
      document.getElementById("accessAdmin").checked=true;
    }

    updateWizardSaveState();
  }

  function updateWizardSaveState() {
    const save=document.getElementById("wizardSave");
    if(!save) return;

    const profile=selectedProfile();
    const admin=document.getElementById("accessAdmin").checked || profile==="administrador";
    const canSave=Boolean(selectedCentralUser) && (admin || pageMappingReady);

    save.disabled=!canSave;

    if(!selectedCentralUser) {
      save.title="Localize um usuário válido antes de salvar.";
    } else if(!admin && !pageMappingReady) {
      save.title="Publique a matriz de permissões em Configurações → Sistema e permissões antes de criar acesso limitado.";
    } else {
      save.title="Conceder o acesso selecionado para esta prefeitura.";
    }

    const help=document.getElementById("permissionMappingHelp");
    if(help){
      help.textContent=pageMappingReady
        ? "Selecione os módulos que este usuário poderá consultar. A matriz de permissões está disponível na Betha."
        : "Acesso limitado exige que a matriz de permissões seja publicada. Acesso de Administrador pode ser concedido diretamente.";
    }
  }

  function selectedPermissionPayload() {
    return [...document.querySelectorAll('#permissionsList input[type="checkbox"]:checked')]
      .map(input=>PAGE_PERMISSION_IDS[input.value])
      .filter(Boolean)
      .map(id=>({id,revokedOperations:[]}));
  }

  async function saveUserAccess() {
    if(!selectedCentralUser) return;

    const save=document.getElementById("wizardSave");
    const result=document.getElementById("centralUserResult");
    const userId=selectedCentralUser.id || selectedCentralUser.user || selectedCentralUser.login;
    const profile=selectedProfile();
    const admin=document.getElementById("accessAdmin").checked || profile==="administrador";
    const technical=document.getElementById("accessTechnical").checked;
    const expiresIn=document.getElementById("accessExpires").value || null;

    if(!admin && !pageMappingReady){
      setWizardStep(2);
      if(result) result.textContent="Publique a matriz de permissões antes de criar um acesso limitado.";
      return;
    }

    const body={
      user:String(userId),
      admin,
      technical,
      permissions:admin ? [] : selectedPermissionPayload(),
      expiresIn
    };

    save.disabled=true;
    save.textContent="SALVANDO…";

    try {
      await api("/api/admin/users",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(body)
      });
      closeDrawer("userDrawer");
      await loadUsers();
    } catch(error) {
      setWizardStep(4);
      save.disabled=false;
      const feedback=document.getElementById("userSaveFeedback");
      const msg=feedback || document.getElementById("centralUserResult");
      if(msg) msg.textContent="Não foi possível conceder o acesso: "+pageMappingFriendly(error.message);
    } finally {
      save.textContent="SALVAR";
      updateWizardSaveState();
    }
  }

  async function revokeUserAccess(accessId,userName) {
    if(!accessId) return;
    const confirmed=window.confirm("Remover o acesso de "+(userName||"este usuário")+" nesta prefeitura?");
    if(!confirmed) return;

    try {
      await api("/api/admin/users/"+encodeURIComponent(accessId),{method:"DELETE"});
      await loadUsers();
    } catch(error) {
      window.alert("Não foi possível remover o acesso: "+pageMappingFriendly(error.message));
    }
  }

  async function searchCentralUser() {
    const value = document.getElementById("centralUserSearch").value.trim();
    const result = document.getElementById("centralUserResult");
    selectedCentralUser = null;
    if (!value) {
      result.textContent = "Informe o login do usuário.";
      return;
    }
    result.textContent = "Consultando a Central de Usuários Betha…";
    try {
      const payload = await api("/api/admin/user-search?user=" + encodeURIComponent(value));
      const list = Array.isArray(payload) ? payload : (payload.content || payload.data?.content || []);
      const user = Array.isArray(list) ? list[0] : payload;
      if (!user || (!user.id && !user.user && !user.login)) {
        result.textContent = "Usuário não encontrado na Central de Usuários.";
        return;
      }
      selectedCentralUser = user;
      updateWizardSaveState();
      const id = user.id || user.user || user.login;
      const name = user.name || user.nome || user.fullName || user.userName || id;
      const email = user.email || user.mail || "";
      result.innerHTML = `
        <div class="lookup-user-card">
          <div class="lookup-avatar"><i class="mdi mdi-account"></i></div>
          <div><strong>${escapeHtml(name)}</strong><span>@${escapeHtml(id)}${email ? " · " + escapeHtml(email) : ""}</span></div>
        </div>
      `;
    } catch (error) {
      result.textContent = "Falha na consulta: " + error.message;
    }
  }

  document.getElementById("addUserButton").addEventListener("click", openUserDrawer);
  document.getElementById("centralUserSearchButton").addEventListener("click", searchCentralUser);
  document.getElementById("centralUserSearch").addEventListener("keydown", (event) => {
    if (event.key === "Enter") searchCentralUser();
  });
  document.getElementById("usersSearchInput").addEventListener("input", applyUsersSearch);
  document.getElementById("wizardBack").addEventListener("click", () => setWizardStep(wizardStep - 1));
  document.getElementById("wizardNext").addEventListener("click", () => {
    if (wizardStep === 1 && !selectedCentralUser) {
      document.getElementById("centralUserResult").textContent = "Localize e selecione um usuário válido antes de continuar.";
      return;
    }
    setWizardStep(wizardStep + 1);
  });

  document.getElementById("wizardSave").addEventListener("click", saveUserAccess);

  document.querySelectorAll('input[name="biGroup"]').forEach(input => {
    input.addEventListener("change", applyPermissionPreset);
  });
  document.getElementById("accessAdmin").addEventListener("change", updateWizardSaveState);
  document.getElementById("accessTechnical").addEventListener("change", updateWizardSaveState);

  document.getElementById("usersTableBody").addEventListener("click", (event) => {
    const button=event.target.closest("[data-revoke-access]");
    if(!button) return;
    revokeUserAccess(button.dataset.revokeAccess,button.dataset.userName);
  });

  document.getElementById("refreshConfigButton").addEventListener("click", loadConfigAdmin);
  document.getElementById("publishPageMappingButton").addEventListener("click", publishPageMappingFromUi);

  document.querySelectorAll("[data-user-filter]").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-user-filter]").forEach(x => x.classList.remove("is-active"));
      button.classList.add("is-active");
      const filter = button.dataset.userFilter;
      document.querySelectorAll("[data-user-row]").forEach(row => {
        const txt = row.textContent.toLowerCase();
        row.hidden = filter === "connected" ? !txt.includes("conectado") :
                     filter === "blocked" ? !txt.includes("bloqueado") : false;
      });
      applyUsersSearch();
    });
  });

  function renderAuthorizedTenantMenu() {
    const list = document.getElementById("entityList");
    if (!list) return;

    list.innerHTML = "";

    for (const tenant of authorizedTenants) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "entity-option" + (tenant.id === tenantId ? " is-current" : "");
      button.textContent = tenant.name || tenant.id;
      button.addEventListener("click", () => applyTenantInPlace(tenant, true));
      list.appendChild(button);
    }
  }

  function applyTenantInPlace(tenant, resumeView = false) {
    if (!tenant || !tenant.id) return false;

    tenantId = tenant.id;
    entityLabel = tenant.name || tenant.id;

    const url = new URL(location.href);
    url.searchParams.set("tenant", tenantId);
    if (tenant.name) url.searchParams.set("entidade", tenant.name);
    else url.searchParams.delete("entidade");

    // Atualiza a URL sem navegar/recarregar. Isso preserva a sessão do login
    // mesmo em navegadores embutidos que descartam storage entre navegações.
    history.replaceState({}, "", url);

    if (tenantGate) tenantGate.hidden = true;
    bethaApp.style.display = "";

    document.getElementById("entityContext").textContent =
      String(entityLabel).toUpperCase();

    renderAuthorizedTenantMenu();

    if (resumeView) {
      if (currentView === "usuarios-admin") {
        renderUsersAdmin();
      } else if (currentView === "configuracoes-admin") {
        renderConfigAdmin();
      } else {
        renderDashboard(currentView);
        loadDashboardData(currentView);
      }
    }

    return true;
  }

  function showTenantSelector(tenants, options = {}) {
    bethaApp.style.display = "none";
    if (!tenantGate || !tenantGateList) return;

    tenantGate.hidden = false;
    if (tenantGateTitle) tenantGateTitle.textContent = options.title || "Selecione a prefeitura";
    if (tenantGateMessage) tenantGateMessage.textContent =
      options.message || "Seu acesso Betha está autenticado. Escolha a entidade que deseja consultar.";

    tenantGateList.innerHTML = "";

    if (!Array.isArray(tenants) || !tenants.length) {
      tenantGateList.innerHTML =
        '<div class="tenant-gate-empty">' + escapeHtml(options.empty || "Nenhuma entidade autorizada para este usuário.") + '</div>';
      return;
    }

    for (const tenant of tenants) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tenant-gate-option";
      button.innerHTML =
        '<i class="mdi mdi-office-building"></i>' +
        '<span><strong>' + escapeHtml(tenant.name || tenant.id) + '</strong>' +
        '<small>database: ' + escapeHtml(tenant.databaseId || "—") +
        ' · entity: ' + escapeHtml(tenant.entityId || "—") + '</small></span>';
      button.addEventListener("click", () => applyTenantInPlace(tenant, true));
      tenantGateList.appendChild(button);
    }
  }

  async function loadTenants() {
    if (!cfg.BACKEND_URL) return false;

    try {
      const result = await api("/api/me/tenants");
      if (!Array.isArray(result.tenants)) throw new Error("TENANT_LIST_INVALID");

      const tenants = result.tenants;
      authorizedTenants = tenants.slice();
      const list = document.getElementById("entityList");
      list.innerHTML = "";

      if (!tenants.length) {
        document.getElementById("entityContext").textContent = "SEM ENTIDADE AUTORIZADA";
        list.innerHTML = '<div class="table-empty">Nenhuma entidade autorizada para este usuário.</div>';
        showTenantSelector([], {
          title:"Nenhuma prefeitura disponível",
          message:"O login Betha foi concluído, mas nenhuma entidade configurada no BI corresponde aos acessos deste usuário.",
          empty:"Verifique o acesso do usuário na Central Betha ou o cadastro da entidade no backend."
        });
        return false;
      }

      let currentTenant = tenantId
        ? tenants.find((tenant) => tenant.id === tenantId)
        : null;

      // Sem tenant na URL: uma entidade entra automaticamente; várias exigem escolha.
      if (!currentTenant && !tenantId && tenants.length === 1) {
        currentTenant = tenants[0];
      }

      // Tenant digitado/manipulado ou usuário com várias entidades: nunca escolhe silenciosamente.
      if (!currentTenant) {
        showTenantSelector(tenants, {
          title: tenants.length > 1 ? "Selecione a prefeitura" : "Confirme a prefeitura",
          message: tenantId
            ? "A entidade informada não pertence aos acessos autorizados deste usuário. Selecione uma opção válida."
            : "Seu usuário possui acesso a mais de uma entidade. Escolha qual deseja consultar."
        });
        return false;
      }

      applyTenantInPlace(currentTenant, false);
      return true;
    } catch (error) {
      console.warn("Falha ao carregar entidades autorizadas:", error);

      const code = error && error.message ? error.message : "UNKNOWN_ERROR";
      const messages = {
        PLATFORM_HTTP_401: "Login concluído, mas o token Betha não foi aceito pela API de Autorizações.",
        PLATFORM_HTTP_403: "Login concluído, mas a credencial ainda não possui permissão para consultar os acessos do usuário (user-accounts.suite).",
        USER_TOKEN_REQUIRED: "Login concluído, mas a sessão do usuário não chegou ao módulo de autorizações.",
        TENANT_CONTEXT_UNRESOLVED: "Login concluído, mas não foi possível identificar database/entity da prefeitura.",
        TENANT_ACCESS_DENIED: "Seu usuário Betha não possui acesso ao contexto configurado para esta prefeitura.",
        TENANT_LIST_INVALID: "O backend retornou uma lista de entidades em formato inválido."
      };

      const friendly = messages[code] || ("Não foi possível validar as entidades autorizadas: " + code);
      const entityContext = document.getElementById("entityContext");
      const entityList = document.getElementById("entityList");

      if (entityContext) entityContext.textContent = "ACESSO BETHA NÃO VALIDADO";
      if (entityList) entityList.innerHTML = '<div class="table-empty">' + escapeHtml(friendly) + '</div>';

      showTenantSelector([], {
        title:"Não foi possível carregar as prefeituras",
        message:friendly,
        empty:"Código: " + code
      });
      return false;
    }
  }

  const tenantLogoutButton = document.getElementById("tenantLogoutButton");
  if (tenantLogoutButton) {
    tenantLogoutButton.addEventListener("click", () => {
      if (window.BIAuth) BIAuth.logout();
    });
  }

  document.getElementById("refreshButton").addEventListener("click", () => loadDashboardData(currentView, {force:true}));

  const reloadLocalSelection = () => {
    renderDashboard(currentView);
    loadDashboardData(currentView);
  };

  document.getElementById("periodo").addEventListener("change", reloadLocalSelection);
  document.getElementById("exercicio").addEventListener("change", reloadLocalSelection);
  document.getElementById("fontePreferencial").addEventListener("change", reloadLocalSelection);

  document.getElementById("resetDashboardFilters").addEventListener("click", () => {
    filterStateByView.set(currentView,{});
    const def=dashboards[currentView];
    if(def) renderDashboardFilters(def);
    loadDashboardData(currentView);
  });

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

  if (cfg.AUTH_REQUIRED) {
    const tenantReady = await loadTenants();
    if (!tenantReady) return;
  } else {
    bethaApp.style.display = "";
  }

  if (currentView === "usuarios-admin") {
    renderUsersAdmin();
  } else if (currentView === "configuracoes-admin") {
    renderConfigAdmin();
  } else {
    renderDashboard(currentView);
    loadDashboardData(currentView);
  }
})();