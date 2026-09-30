(() => {
  const cfg = window.BI_CONFIG || {};
  const bethaApp = document.getElementById("bethaApp");

  const menu = [
    { id: "visao-geral", descricao: "Visão geral", rota: "visao-geral", possuiPermissao: true },
    { id: "arrecadacao", descricao: "Arrecadação", rota: "arrecadacao", possuiPermissao: true },
    { id: "divida-ativa", descricao: "Dívida ativa", rota: "divida", possuiPermissao: true },
    { id: "cadastros", descricao: "Cadastros", rota: "cadastros", possuiPermissao: true },
    { id: "auditoria", descricao: "Auditoria", rota: "auditoria", possuiPermissao: true }
  ];

  bethaApp.opcoes = menu;
  bethaApp.setMenuAtivo("visao-geral");

  const titles = {
    "visao-geral": "Visão geral",
    arrecadacao: "Arrecadação",
    divida: "Dívida ativa",
    cadastros: "Cadastros",
    auditoria: "Auditoria",
    issqn: "ISSQN",
    iptu: "IPTU / Imobiliário",
    contribuintes: "Contribuintes",
    imoveis: "Imóveis"
  };

  function setView(view) {
    const title = titles[view] || "Visão geral";
    document.getElementById("pageTitle").textContent = title;
    document.getElementById("pageContext").textContent = title.toUpperCase();
  }

  bethaApp.addEventListener("opcaoMenuSelecionada", (event) => {
    const item = event.detail || {};
    if (item.id) bethaApp.setMenuAtivo(item.id);
    setView(item.rota || item.id);
  });

  document.querySelectorAll(".module-tile").forEach((el) => {
    el.addEventListener("click", () => setView(el.dataset.view));
  });

  const currentYear = new Date().getFullYear();
  const yearSelect = document.getElementById("exercicio");
  for (let y = currentYear; y >= currentYear - 5; y--) {
    const opt = document.createElement("option");
    opt.value = String(y);
    opt.textContent = String(y);
    yearSelect.appendChild(opt);
  }

  const query = Object.fromEntries(new URLSearchParams(location.search).entries());
  const entity = query.entidade || query.entity || query.entidadeNome || cfg.ENTITY_LABEL || "ENTIDADE NÃO IDENTIFICADA";
  document.getElementById("entityContext").textContent = String(entity).toUpperCase();

  const context = {
    url: location.href,
    referrer: document.referrer || "(sem referrer)",
    parametros: query,
    backendConfigurado: Boolean(cfg.BACKEND_URL),
    dataHoraLocal: new Date().toLocaleString("pt-BR")
  };
  const contextOutput = document.getElementById("contextOutput");
  contextOutput.textContent = JSON.stringify(context, null, 2);

  document.getElementById("copyContext").addEventListener("click", async (event) => {
    try {
      await navigator.clipboard.writeText(contextOutput.textContent);
      event.currentTarget.textContent = "COPIADO";
      setTimeout(() => event.currentTarget.textContent = "COPIAR", 1400);
    } catch {
      event.currentTarget.textContent = "SELECIONE E COPIE";
    }
  });

  const revenueChart = new Chart(document.getElementById("revenueChart"), {
    type: "line",
    data: { labels: [], datasets: [{ label: "Arrecadação", data: [] }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });

  const creditsChart = new Chart(document.getElementById("creditsChart"), {
    type: "doughnut",
    data: { labels: [], datasets: [{ data: [] }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } }
    }
  });

  function currency(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
    return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function number(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
    return Number(value).toLocaleString("pt-BR");
  }

  function setStatus(type, text) {
    const el = document.getElementById("apiStatus");
    el.className = "api-status api-status-" + type;
    el.lastElementChild.textContent = text;
  }

  function renderOverview(data) {
    document.getElementById("kpiArrecadado").textContent = currency(data.arrecadado);
    document.getElementById("kpiAberto").textContent = currency(data.emAberto);
    document.getElementById("kpiContribuintes").textContent = number(data.contribuintes);
    document.getElementById("kpiImoveis").textContent = number(data.imoveis);

    if (Array.isArray(data.arrecadacaoSerie)) {
      revenueChart.data.labels = data.arrecadacaoSerie.map(x => x.label);
      revenueChart.data.datasets[0].data = data.arrecadacaoSerie.map(x => x.value);
      revenueChart.update();
    }
    if (Array.isArray(data.creditos)) {
      creditsChart.data.labels = data.creditos.map(x => x.label);
      creditsChart.data.datasets[0].data = data.creditos.map(x => x.value);
      creditsChart.update();
    }
  }

  async function api(path) {
    const base = String(cfg.BACKEND_URL || "").replace(/\/$/, "");
    if (!base) throw new Error("BACKEND_NOT_CONFIGURED");
    const response = await fetch(base + path, { headers: { Accept: "application/json" } });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || ("HTTP " + response.status));
    return body;
  }

  async function refresh() {
    if (!cfg.BACKEND_URL) {
      setStatus("waiting", "API não configurada");
      return;
    }

    setStatus("waiting", "Consultando API...");
    try {
      await api("/api/health");
      document.getElementById("backendCell").innerHTML = '<span class="badge-ok">ONLINE</span>';

      const params = new URLSearchParams({
        periodo: document.getElementById("periodo").value,
        exercicio: document.getElementById("exercicio").value
      });
      const data = await api("/api/bi/overview?" + params.toString());
      renderOverview(data);
      document.getElementById("apiCell").innerHTML = '<span class="badge-ok">CONECTADA</span>';
      setStatus("online", "API Betha conectada");
    } catch (err) {
      console.error(err);
      setStatus("error", "Falha na integração");
    }
  }

  document.getElementById("refreshButton").addEventListener("click", refresh);
  refresh();
})();