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

    const button = document.getElementById("loginButton");
    // Erros de autenticação permanecem disponíveis internamente no BIAuth,
    // mas não são exibidos na tela inicial para manter a entrada limpa.

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
  const restoredPreferenceScopes = new Set();
  let toastTimer = null;
  let currentView = ADMIN_VIEWS.has(query.view) ? query.view :
    (query.view && dashboards[query.view] ? query.view : "visao-geral");
  let currentPayload = null;
  let currentDetailPayload = null;
  let currentDetailResource = "";
  let currentDetailTitle = "";
  let authorizedTenants = [];
  let currentAllowedViews = new Set(Object.keys(dashboards));
  let currentAllowedAdminViews = new Set(ADMIN_VIEWS);

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

  function isViewAllowed(view) {
    if (dashboards[view]) return currentAllowedViews.has(view);
    if (ADMIN_VIEWS.has(view)) return currentAllowedAdminViews.has(view);
    return false;
  }

  function menuForTenant(tenant) {
    const raw=Array.isArray(window.BI_MENU)?window.BI_MENU:[];
    const allowedViews=Array.isArray(tenant?.allowedViews)
      ? new Set(tenant.allowedViews.filter(view=>dashboards[view]))
      : (tenant?.admin||tenant?.technical ? new Set(Object.keys(dashboards)) : new Set(["visao-geral"]));
    const allowedAdminViews=Array.isArray(tenant?.allowedAdminViews)
      ? new Set(tenant.allowedAdminViews.filter(view=>ADMIN_VIEWS.has(view)))
      : (tenant?.admin||tenant?.technical ? new Set(ADMIN_VIEWS) : new Set());

    currentAllowedViews=allowedViews;
    currentAllowedAdminViews=allowedAdminViews;

    const allowed=item=>{
      const view=item?.rota||item?.id;
      return dashboards[view] ? allowedViews.has(view) :
        (ADMIN_VIEWS.has(view) ? allowedAdminViews.has(view) : false);
    };

    return raw.map(item=>{
      if(Array.isArray(item.submenus)){
        const submenus=item.submenus.filter(allowed).map(sub=>({...sub,possuiPermissao:true}));
        if(!submenus.length) return null;
        return {...item,possuiPermissao:true,submenus};
      }
      return allowed(item) ? {...item,possuiPermissao:true} : null;
    }).filter(Boolean);
  }

  function firstAllowedView() {
    if(currentAllowedViews.has("visao-geral")) return "visao-geral";
    const dashboardView=[...currentAllowedViews].find(view=>dashboards[view]);
    if(dashboardView) return dashboardView;
    return [...currentAllowedAdminViews][0] || "";
  }

  function applyNavigationPermissions(tenant) {
    const menu=menuForTenant(tenant);
    bethaApp.opcoes=menu;

    if(!isViewAllowed(currentView)){
      const fallback=firstAllowedView();
      if(fallback) currentView=fallback;
    }

    if(typeof bethaApp.setMenuAtivo==="function" && currentView){
      bethaApp.setMenuAtivo(currentView);
    }
  }

  bethaApp.opcoes = window.BI_MENU || [];
  if (typeof bethaApp.setMenuAtivo === "function") bethaApp.setMenuAtivo(currentView);

  bethaApp.addEventListener("opcaoMenuSelecionada", (event) => {
    const detail = event.detail || {};
    const view = detail.rota || detail.id;
    if (!isViewAllowed(view)) return;
    if (detail.id && typeof bethaApp.setMenuAtivo === "function") bethaApp.setMenuAtivo(detail.id);
    navigate(view);
  });

  function navigate(view) {
    if (!isViewAllowed(view)) {
      showToast("Este painel não está liberado para o seu acesso.");
      return;
    }
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

  function preferenceTokenScope() {
    const token=String(window.BIAuth?.getToken?.()||"");
    if(!token) return "";
    let hash=2166136261;
    for(let i=0;i<token.length;i++){
      hash^=token.charCodeAt(i);
      hash=Math.imul(hash,16777619);
    }
    return (hash>>>0).toString(36);
  }

  function preferenceContext(view=currentView) {
    const tenant=String(tenantId||"sem-tenant");
    const tokenScope=preferenceTokenScope();
    const scope=tokenScope ? "user-"+tokenScope : "session";
    let storage=null;
    try {
      storage=tokenScope ? window.localStorage : window.sessionStorage;
    } catch {}
    return {
      storage,
      scope,
      key:"betha_bi_view_preferences_v1:"+scope+":"+tenant+":"+String(view||"visao-geral")
    };
  }

  function persistableDashboardFilters(view=currentView) {
    const definitions=new Map(filterDefinitions(view).map(item=>[item.id,item]));
    return Object.fromEntries(
      Object.entries(currentDashboardFilters(view))
        .filter(([key])=>definitions.get(key)?.type!=="search")
    );
  }

  function saveViewPreferences(options={}) {
    const context=preferenceContext(currentView);
    if(!context.storage) return false;
    const payload={
      version:1,
      periodo:document.getElementById("periodo")?.value||"ano",
      exercicio:document.getElementById("exercicio")?.value||String(currentYear),
      fonte:document.getElementById("fontePreferencial")?.value||"auto",
      filters:persistableDashboardFilters(currentView),
      savedAt:new Date().toISOString()
    };
    try{
      context.storage.setItem(context.key,JSON.stringify(payload));
      if(!options.silent){
        showToast(context.scope.startsWith("user-")
          ? "Visão salva para este acesso e prefeitura."
          : "Visão salva nesta sessão do navegador.");
      }
      return true;
    }catch(error){
      if(!options.silent) showToast("Não foi possível salvar esta visão.","error");
      return false;
    }
  }

  function readViewPreferences(view=currentView) {
    const context=preferenceContext(view);
    if(!context.storage) return null;
    try{
      const raw=context.storage.getItem(context.key);
      if(!raw) return null;
      const payload=JSON.parse(raw);
      return payload&&payload.version===1 ? payload : null;
    }catch{
      return null;
    }
  }

  function setSelectValueIfAvailable(id,value,fallback) {
    const select=document.getElementById(id);
    if(!select) return;
    const desired=String(value??"");
    const exists=[...select.options].some(option=>option.value===desired);
    select.value=exists ? desired : String(fallback??select.value);
  }

  function restoreViewPreferencesOnce(view=currentView) {
    const context=preferenceContext(view);
    if(restoredPreferenceScopes.has(context.key)) return;
    restoredPreferenceScopes.add(context.key);
    const saved=readViewPreferences(view);
    if(!saved) return;
    setSelectValueIfAvailable("periodo",saved.periodo,"ano");
    setSelectValueIfAvailable("exercicio",saved.exercicio,String(currentYear));
    setSelectValueIfAvailable("fontePreferencial",saved.fonte,"auto");
    filterStateByView.set(view,{...(saved.filters||{})});
  }

  function clearStoredViewPreference(view=currentView) {
    const context=preferenceContext(view);
    try { context.storage?.removeItem(context.key); } catch {}
  }

  function showToast(message,type="success") {
    const toast=document.getElementById("uiToast");
    if(!toast) return;
    clearTimeout(toastTimer);
    toast.textContent=String(message||"");
    toast.dataset.type=type;
    toast.classList.add("is-visible");
    toastTimer=setTimeout(()=>toast.classList.remove("is-visible"),2800);
  }

  function personalizationContext() {
    const tenant=String(tenantId||"sem-tenant");
    const tokenScope=preferenceTokenScope();
    const scope=tokenScope ? "user-"+tokenScope : "session";
    let storage=null;
    try {
      storage=tokenScope ? window.localStorage : window.sessionStorage;
    } catch {}
    return {storage,scope,key:"betha_bi_personal_home_v1:"+scope+":"+tenant};
  }

  function emptyPersonalizationState() {
    return {version:1,favoriteDashboards:[],favoriteKpis:[],recentViews:[],kpiSnapshots:{}};
  }

  function readPersonalization() {
    const context=personalizationContext();
    if(!context.storage) return emptyPersonalizationState();
    try{
      const raw=context.storage.getItem(context.key);
      if(!raw) return emptyPersonalizationState();
      const parsed=JSON.parse(raw);
      return {...emptyPersonalizationState(),...(parsed&&parsed.version===1?parsed:{})};
    }catch{return emptyPersonalizationState();}
  }

  function writePersonalization(state) {
    const context=personalizationContext();
    if(!context.storage) return false;
    try{
      context.storage.setItem(context.key,JSON.stringify({...emptyPersonalizationState(),...state,version:1}));
      return true;
    }catch{return false;}
  }

  function dashboardLabel(view) {
    return dashboards[view]?.title || String(view||"Painel");
  }

  function favoriteKpiKey(view,kpiId) {
    return String(view||"")+"::"+String(kpiId||"");
  }

  function isDashboardFavorite(view=currentView) {
    return readPersonalization().favoriteDashboards.includes(view);
  }

  function updateDashboardFavoriteButton() {
    const button=document.getElementById("favoriteDashboardButton");
    if(!button || !dashboards[currentView]) return;
    const active=isDashboardFavorite(currentView);
    button.classList.toggle("is-active",active);
    button.setAttribute("aria-pressed",String(active));
    button.setAttribute("title",active ? "Remover este painel da Minha Home" : "Adicionar este painel à Minha Home");
    button.innerHTML=active
      ? '<i class="mdi mdi-star"></i><span>Favorito</span>'
      : '<i class="mdi mdi-star-outline"></i><span>Favoritar</span>';
  }

  function updateKpiFavoriteButtons() {
    const state=readPersonalization();
    const favorites=new Set((state.favoriteKpis||[]).filter(item=>item.view===currentView).map(item=>item.kpiId));
    document.querySelectorAll("[data-kpi-favorite]").forEach(button=>{
      const active=favorites.has(button.dataset.kpiFavorite);
      button.classList.toggle("is-active",active);
      button.setAttribute("aria-pressed",String(active));
      button.setAttribute("title",active ? "Remover KPI da Minha Home" : "Destacar KPI na Minha Home");
      const icon=button.querySelector("i");
      if(icon) icon.className="mdi "+(active?"mdi-star":"mdi-star-outline");
    });
  }

  function recordRecentView(view) {
    if(!dashboards[view]) return;
    const state=readPersonalization();
    state.recentViews=[
      {view,at:new Date().toISOString()},
      ...(state.recentViews||[]).filter(item=>item&&item.view!==view&&dashboards[item.view])
    ].slice(0,8);
    writePersonalization(state);
  }

  function toggleDashboardFavorite(view=currentView) {
    if(!dashboards[view]) return;
    const state=readPersonalization();
    const set=new Set((state.favoriteDashboards||[]).filter(id=>dashboards[id]));
    const adding=!set.has(view);
    if(adding) set.add(view); else set.delete(view);
    state.favoriteDashboards=[...set].slice(0,8);
    writePersonalization(state);
    updateDashboardFavoriteButton();
    renderPersonalHome();
    showToast(adding ? "Painel adicionado à Minha Home." : "Painel removido da Minha Home.");
  }

  function toggleKpiFavorite(view,kpi) {
    if(!dashboards[view]||!kpi?.id) return;
    const state=readPersonalization();
    const exists=(state.favoriteKpis||[]).some(item=>item.view===view&&item.kpiId===kpi.id);
    state.favoriteKpis=exists
      ? (state.favoriteKpis||[]).filter(item=>!(item.view===view&&item.kpiId===kpi.id))
      : [{view,kpiId:kpi.id},...(state.favoriteKpis||[])].slice(0,10);

    const snapshotKey=favoriteKpiKey(view,kpi.id);
    if(exists){
      delete state.kpiSnapshots[snapshotKey];
    }else{
      const raw=currentPayload?.kpis?.[kpi.id];
      if(raw!==undefined){
        state.kpiSnapshots[snapshotKey]={formatted:formatValue(raw,kpi.format),updatedAt:new Date().toISOString()};
      }
    }

    writePersonalization(state);
    updateKpiFavoriteButtons();
    renderPersonalHome();
    showToast(exists ? "KPI removido da Minha Home." : "KPI destacado na Minha Home.");
  }

  function syncFavoriteKpiSnapshots(payload) {
    const state=readPersonalization();
    let changed=false;
    for(const item of (state.favoriteKpis||[]).filter(item=>item.view===currentView)){
      const def=(dashboards[currentView]?.kpis||[]).find(kpi=>kpi.id===item.kpiId);
      const raw=payload?.kpis?.[item.kpiId];
      if(!def||raw===undefined) continue;
      state.kpiSnapshots[favoriteKpiKey(currentView,item.kpiId)]={
        formatted:formatValue(raw,def.format),updatedAt:new Date().toISOString()
      };
      changed=true;
    }
    if(changed) writePersonalization(state);
  }

  function shortRelativeTime(value) {
    const date=new Date(value||0);
    if(Number.isNaN(date.getTime())) return "";
    const diff=Math.max(0,Date.now()-date.getTime());
    const minutes=Math.floor(diff/60000);
    if(minutes<1) return "agora";
    if(minutes<60) return "há "+minutes+" min";
    const hours=Math.floor(minutes/60);
    if(hours<24) return "há "+hours+" h";
    return "há "+Math.min(Math.floor(hours/24),99)+" d";
  }

  function renderPersonalHome() {
    const home=document.getElementById("personalHome");
    if(!home) return;
    if(currentView!=="visao-geral"){
      home.hidden=true; home.innerHTML=""; return;
    }

    const state=readPersonalization();
    const favorites=(state.favoriteDashboards||[]).filter(view=>dashboards[view]).slice(0,6);
    const recent=(state.recentViews||[]).filter(item=>item&&dashboards[item.view]&&item.view!=="visao-geral").slice(0,4);
    const favoriteKpis=(state.favoriteKpis||[]).map(item=>{
      const def=(dashboards[item.view]?.kpis||[]).find(kpi=>kpi.id===item.kpiId);
      return def ? {...item,def,snapshot:state.kpiSnapshots[favoriteKpiKey(item.view,item.kpiId)]||null} : null;
    }).filter(Boolean).slice(0,4);

    const favoriteHtml=favorites.length
      ? favorites.map(view=>'<button class="home-shortcut-card" type="button" data-home-open-view="'+escapeHtml(view)+'"><span class="home-shortcut-icon"><i class="mdi mdi-view-dashboard-outline"></i></span><span><strong>'+escapeHtml(dashboardLabel(view))+'</strong><small>Abrir painel favorito</small></span><i class="mdi mdi-chevron-right"></i></button>').join("")
      : '<div class="home-empty"><i class="mdi mdi-star-outline"></i><span>Favorite os painéis mais usados pela estrela do cabeçalho.</span></div>';

    const recentHtml=recent.length
      ? recent.map(item=>'<button class="home-recent-item" type="button" data-home-open-view="'+escapeHtml(item.view)+'"><span><strong>'+escapeHtml(dashboardLabel(item.view))+'</strong><small>'+escapeHtml(shortRelativeTime(item.at))+'</small></span><i class="mdi mdi-arrow-right"></i></button>').join("")
      : '<div class="home-empty compact"><span>Seus acessos recentes aparecerão aqui.</span></div>';

    const kpiHtml=favoriteKpis.length
      ? favoriteKpis.map(item=>'<button class="home-kpi-card" type="button" data-home-open-view="'+escapeHtml(item.view)+'"><small>'+escapeHtml(dashboardLabel(item.view))+'</small><strong>'+escapeHtml(item.def.label)+'</strong><span class="home-kpi-value">'+escapeHtml(item.snapshot?.formatted||"—")+'</span><span class="home-kpi-meta">'+escapeHtml(item.snapshot?.updatedAt ? "Última leitura "+shortRelativeTime(item.snapshot.updatedAt) : "Abra o painel para carregar o valor")+'</span></button>').join("")
      : '<div class="home-empty"><i class="mdi mdi-chart-box-outline"></i><span>Use a estrela nos indicadores para destacar KPIs aqui.</span></div>';

    home.innerHTML=
      '<div class="personal-home-head"><div><small>MINHA HOME</small><h2>Seu BI, do seu jeito</h2><p>Favoritos, indicadores destacados e o que você acessou recentemente.</p></div><span class="personal-home-badge"><i class="mdi mdi-account-cog-outline"></i> Personalizado</span></div>'+
      '<div class="personal-home-grid">'+
        '<section class="home-block home-block-favorites"><div class="home-block-title"><strong>Painéis favoritos</strong><span>Atalhos rápidos</span></div><div class="home-shortcuts">'+favoriteHtml+'</div></section>'+
        '<section class="home-block home-block-kpis"><div class="home-block-title"><strong>KPIs destacados</strong><span>Última leitura disponível</span></div><div class="home-kpis">'+kpiHtml+'</div></section>'+
        '<section class="home-block home-block-recent"><div class="home-block-title"><strong>Recentes</strong><span>Continue de onde parou</span></div><div class="home-recents">'+recentHtml+'</div></section>'+
      '</div>';
    home.hidden=false;
  }

  function activeFilterItems(view=currentView) {
    const items=[];
    const period=document.getElementById("periodo");
    const exercise=document.getElementById("exercicio");
    const source=document.getElementById("fontePreferencial");
    if(period&&period.value!=="ano") items.push({kind:"primary",key:"periodo",label:"Período",value:period.selectedOptions?.[0]?.textContent||period.value});
    if(exercise&&exercise.value!==String(currentYear)) items.push({kind:"primary",key:"exercicio",label:"Exercício",value:exercise.value});
    if(source&&source.value!=="auto") items.push({kind:"primary",key:"fontePreferencial",label:"Fonte",value:source.selectedOptions?.[0]?.textContent||source.value});
    const definitions=new Map(filterDefinitions(view).map(item=>[item.id,item]));
    for(const [key,value] of Object.entries(currentDashboardFilters(view))){
      const def=definitions.get(key);
      items.push({kind:"advanced",key,label:def?.label||key,value});
    }
    return items;
  }

  function updateActiveFilterSummary() {
    const container=document.getElementById("activeFilterSummary");
    if(!container) return;
    const items=activeFilterItems();
    container.hidden=!items.length;
    container.innerHTML=items.length
      ? '<span class="active-filter-summary-label"><i class="mdi mdi-filter-variant"></i> Filtros ativos</span>'+
        items.map(item=>
          '<span class="active-filter-chip">'+
            '<small>'+escapeHtml(item.label)+'</small>'+
            '<strong>'+escapeHtml(item.value)+'</strong>'+
            '<button type="button" data-filter-kind="'+escapeHtml(item.kind)+'" data-filter-key="'+escapeHtml(item.key)+'" aria-label="Remover filtro '+escapeHtml(item.label)+'" title="Remover filtro"><i class="mdi mdi-close"></i></button>'+
          '</span>'
        ).join("")
      : "";
  }

  function clearDashboardFilters(options={}) {
    filterStateByView.set(currentView,{});
    const toggle=document.getElementById("moreFiltersButton");
    if(toggle){
      toggle.setAttribute("aria-expanded","true");
      toggle.dataset.view=currentView;
    }
    const def=dashboards[currentView];
    if(def) renderDashboardFilters(def);
    updateFilterActiveCount();
    saveViewPreferences({silent:true});
    if(options.reload!==false) loadDashboardData(currentView);
    if(!options.silent) showToast("Filtros adicionais removidos.");
  }

  function restoreDefaultView() {
    if(!window.confirm("Restaurar o padrão desta visão? Período, exercício, fonte e filtros adicionais voltarão ao estado inicial.")) return;
    setSelectValueIfAvailable("periodo","ano","ano");
    setSelectValueIfAvailable("exercicio",String(currentYear),String(currentYear));
    setSelectValueIfAvailable("fontePreferencial","auto","auto");
    filterStateByView.set(currentView,{});
    clearStoredViewPreference(currentView);
    const def=dashboards[currentView];
    if(def) renderDashboardFilters(def);
    updateFilterActiveCount();
    showToast("Visão restaurada ao padrão.");
    renderDashboard(currentView);
    loadDashboardData(currentView);
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
    const toggle=document.getElementById("moreFiltersButton");
    const badge=document.getElementById("activeFilterCount");
    const count=Object.keys(currentDashboardFilters()).length;
    if(row) row.dataset.activeCount=String(count);
    if(toggle){
      toggle.classList.toggle("has-active-filters",count>0);
      toggle.setAttribute("aria-label",count>0 ? "Mais filtros, "+count+" ativo(s)" : "Mais filtros");
    }
    if(badge){
      badge.textContent=String(count);
      badge.hidden=count===0;
    }
    updateActiveFilterSummary();
  }

  function renderDashboardFilters(def) {
    const row=document.getElementById("advancedFilterRow");
    const container=document.getElementById("advancedFilters");
    const toggle=document.getElementById("moreFiltersButton");
    if(!row||!container) return;

    const filters=Array.isArray(def?.filters)?def.filters:[];
    if(!filters.length){
      row.hidden=true;
      container.innerHTML="";
      if(toggle){
        toggle.hidden=true;
        toggle.setAttribute("aria-expanded","false");
      }
      updateFilterActiveCount();
      return;
    }

    const state=currentFilterState(currentView);
    const hasActive=Object.keys(currentDashboardFilters()).length>0;
    if(toggle){
      toggle.hidden=false;
      const expanded=toggle.dataset.view===currentView
        ? toggle.getAttribute("aria-expanded")==="true"
        : hasActive;
      toggle.dataset.view=currentView;
      toggle.setAttribute("aria-expanded",String(expanded));
      row.hidden=!expanded;
    }else{
      row.hidden=false;
    }

    container.innerHTML=filters.map(filter=>{
      const current=String(state[filter.id]||"");
      const fieldId="filter-"+filter.id;

      if(filter.type==="search"){
        return '<div class="field filter-search-field">'+
          '<label for="'+escapeHtml(fieldId)+'">'+escapeHtml(filter.label||filter.id)+'</label>'+
          '<div class="filter-search-wrap"><i class="mdi mdi-magnify"></i>'+
          '<input id="'+escapeHtml(fieldId)+'" type="search" data-dashboard-filter="'+escapeHtml(filter.id)+'" '+
          'placeholder="'+escapeHtml(filter.placeholder||"Pesquisar")+'" value="'+escapeHtml(current)+'"></div></div>';
      }

      const options=normalizeFilterOptions(filter.options||[]);
      const currentExists=options.some(item=>item.value===current);
      const all=[
        {value:"",label:"Todos"},
        ...options,
        ...(current&&!currentExists?[{value:current,label:current}]:[])
      ];

      return '<div class="field">'+
        '<label for="'+escapeHtml(fieldId)+'">'+escapeHtml(filter.label||filter.id)+'</label>'+
        '<select id="'+escapeHtml(fieldId)+'" data-dashboard-filter="'+escapeHtml(filter.id)+'">'+
        all.map(item=>'<option value="'+escapeHtml(item.value)+'"'+(item.value===current?' selected':'')+'>'+escapeHtml(item.label)+'</option>').join("")+
        '</select></div>';
    }).join("");

    const applyControlValue=(control)=>{
      const state=currentFilterState(currentView);
      const value=String(control.value||"").trim();
      state[control.dataset.dashboardFilter]=value;
      if(!value) delete state[control.dataset.dashboardFilter];
      filterStateByView.set(currentView,state);
      updateFilterActiveCount();

      const definition=filterDefinitions(currentView).find(item=>item.id===control.dataset.dashboardFilter);
      if(definition?.type!=="search") saveViewPreferences({silent:true});

      const loaded=loadDashboardFromCache(currentView);
      if(!loaded) setStatus("waiting","Filtros alterados · clique em ATUALIZAR");
    };

    container.querySelectorAll("select[data-dashboard-filter]").forEach(select=>{
      select.addEventListener("change",()=>applyControlValue(select));
    });

    container.querySelectorAll('input[type="search"][data-dashboard-filter]').forEach(input=>{
      let timer=null;
      input.addEventListener("input",()=>{
        clearTimeout(timer);
        timer=setTimeout(()=>applyControlValue(input),350);
      });
      input.addEventListener("keydown",(event)=>{
        if(event.key==="Enter"){
          event.preventDefault();
          clearTimeout(timer);
          applyControlValue(input);
          loadDashboardData(currentView,{force:true});
        }
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
      if(filter.type==="search") continue;
      const select=document.querySelector('select[data-dashboard-filter="'+cssEscape(filter.id)+'"]');
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
    const dashboardView = document.getElementById("dashboardView");
    dashboardView.dataset.dashboard = view;
    document.getElementById("overviewExecutive")?.remove();
    document.getElementById("overviewAttention")?.remove();
    restoreViewPreferencesOnce(view);
    renderDashboardFilters(def);

    document.getElementById("pageTitle").textContent = def.title;
    document.getElementById("pageDescription").textContent = def.description;
    document.getElementById("pageContext").textContent = def.title.toUpperCase();
    document.getElementById("levelLabel").textContent = String(def.level || "macro-micro").toUpperCase().replace("-", " → ");
    recordRecentView(view);
    updateDashboardFavoriteButton();
    renderPersonalHome();

    const kpiGrid = document.getElementById("kpiGrid");
    kpiGrid.innerHTML = "";
    for (const kpi of def.kpis || []) {
      const el = document.createElement("article");
      const kpiFormat = kpi.format === "currency" ? "currency" : "number";
      el.className = "kpi-card kpi-card-" + kpiFormat;
      el.dataset.kpi = kpi.id;
      el.dataset.format = kpiFormat;
      el.innerHTML = `
        <button type="button" class="kpi-favorite-button" data-kpi-favorite="${escapeHtml(kpi.id)}" aria-pressed="false" title="Destacar KPI na Minha Home" aria-label="Destacar ${escapeHtml(kpi.label)} na Minha Home"><i class="mdi mdi-star-outline"></i></button>
        <i class="mdi mdi-chevron-right kpi-more"></i>
        <i class="mdi ${kpiFormat === "currency" ? "mdi-cash-multiple" : "mdi-pound-box-outline"} kpi-kind-icon" aria-hidden="true"></i>
        <small>${escapeHtml(kpi.label)}</small>
        <strong data-value>—</strong>
        <span>${escapeHtml(kpi.source)} · ${escapeHtml(kpi.field)}</span>
      `;
      el.querySelector(".kpi-favorite-button").addEventListener("click",(event)=>{
        event.stopPropagation();
        toggleKpiFavorite(view,kpi);
      });
      el.addEventListener("click", () => openKpiDetail(kpi));
      kpiGrid.appendChild(el);
    }
    updateKpiFavoriteButtons();

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

    setDashboardLoading(true);
    setLastUpdated(null);
    setStatus("waiting", cfg.BACKEND_URL ? "Carregando dados" : "Dados indisponíveis");
  }

  function chartType(type) {
    if (type === "doughnut") return "doughnut";
    if (type === "line") return "line";
    return "bar";
  }

  function compactChartValue(value, format) {
    const n=Number(value || 0);
    const abs=Math.abs(n);
    const compact=(divisor,suffix)=>{
      const scaled=n/divisor;
      const digits=Math.abs(scaled)>=100?0:Math.abs(scaled)>=10?1:1;
      return scaled.toLocaleString("pt-BR",{minimumFractionDigits:0,maximumFractionDigits:digits})+" "+suffix;
    };
    if(format==="currency"){
      const sign=n<0?"-":"";
      const positive=Math.abs(n);
      const moneyCompact=(divisor,suffix)=>{
        const scaled=positive/divisor;
        const digits=scaled>=100?0:1;
        return sign+"R$ "+scaled.toLocaleString("pt-BR",{minimumFractionDigits:0,maximumFractionDigits:digits})+" "+suffix;
      };
      if(abs>=1000000000) return moneyCompact(1000000000,"bi");
      if(abs>=1000000) return moneyCompact(1000000,"mi");
      if(abs>=1000) return moneyCompact(1000,"mil");
      return n.toLocaleString("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0});
    }
    if(abs>=1000000000) return compact(1000000000,"bi");
    if(abs>=1000000) return compact(1000000,"mi");
    if(abs>=1000) return compact(1000,"mil");
    return n.toLocaleString("pt-BR",{maximumFractionDigits:1});
  }

  function fullChartValue(value, format) {
    const n=Number(value || 0);
    if(format==="currency"){
      return n.toLocaleString("pt-BR",{style:"currency",currency:"BRL",minimumFractionDigits:2,maximumFractionDigits:2});
    }
    return n.toLocaleString("pt-BR",{maximumFractionDigits:2});
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

    const bethaPalette = ["#356ae6","#168a62","#7b68c8","#d99224","#3a8f9d","#c65e72","#657184","#9671bd"];
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
          backgroundColor:dataset.backgroundColor||color+"12",
          pointBackgroundColor:dataset.pointBackgroundColor||color,
          pointBorderColor:"#ffffff",
          pointBorderWidth:2,
          pointRadius:0,
          pointHoverRadius:4,
          pointHitRadius:12,
          borderWidth:2,
          tension:.34,
          fill:false
        };
      }

      return {
        ...base,
        backgroundColor:dataset.backgroundColor||color+"B8",
        borderColor:"transparent",
        borderWidth:0,
        borderRadius:6,
        borderSkipped:false,
        maxBarThickness:30
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
            backgroundColor:"#172033",
            titleColor:"#ffffff",
            bodyColor:"#eef2f7",
            borderColor:"rgba(255,255,255,.08)",
            borderWidth:1,
            cornerRadius:10,
            padding:11,
            displayColors:data.datasets.length>1 || chartDef.type==="doughnut",
            boxPadding:4,
            titleFont:{size:11,weight:"600"},
            bodyFont:{size:11,weight:"500"},
            callbacks: {
              label(context) {
                const label = context.dataset.label ? context.dataset.label + ": " : "";
                return label + fullChartValue(context.raw,data.format);
              }
            }
          }
        },
        scales: chartDef.type === "doughnut" ? undefined : {
          x: {
            ticks:{font:{size:9,weight:"500"},color:"#7a8495",maxRotation:30,minRotation:0,padding:6},
            grid:{display:false},
            border:{display:false}
          },
          y: {
            beginAtZero:true,
            ticks:{
              font:{size:9,weight:"500"},
              color:"#8a94a4",
              padding:10,
              maxTicksLimit:6,
              callback(value){ return compactChartValue(value,data.format); }
            },
            grid:{color:"rgba(107,116,133,.075)",drawTicks:false},
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

  function renderOverviewAttention(payload) {
    let panel=document.getElementById("overviewAttention");
    if(currentView!=="visao-geral"){
      if(panel) panel.remove();
      return;
    }

    if(!panel){
      panel=document.createElement("section");
      panel.id="overviewAttention";
      panel.className="overview-attention";
    }

    let executive=document.getElementById("overviewExecutive");
    if(!executive){
      executive=document.createElement("section");
      executive.id="overviewExecutive";
      executive.className="overview-executive";
      const coverage=document.getElementById("integrationCoverage");
      const chartGrid=document.getElementById("chartGrid");
      if(coverage) coverage.insertAdjacentElement("beforebegin",executive);
      else if(chartGrid) chartGrid.insertAdjacentElement("beforebegin",executive);
    }

    const revenueCard=document.querySelector('#chartGrid [data-chart="receita-mensal"]');
    if(revenueCard && revenueCard.parentElement!==executive){
      revenueCard.classList.add("overview-executive-chart");
      executive.appendChild(revenueCard);
    }
    if(panel.parentElement!==executive) executive.appendChild(panel);

    const kpis=payload?.kpis||{};
    const warnings=Array.isArray(payload?.meta?.warnings)?payload.meta.warnings:[];
    const items=[];
    const debt=Number(kpis.divida);
    const installments=Number(kpis.parcelado);
    const launched=Number(kpis.lancado);
    const collected=Number(kpis.arrecadado);

    if(Number.isFinite(debt)){
      items.push({
        icon:"bank-outline",
        title:"Saldo da dívida ativa",
        detail:"Estoque informado pela fonte de dívida ativa.",
        value:formatValue(debt,"currency"),
        route:"divida"
      });
    }

    if(Number.isFinite(installments)){
      items.push({
        icon:"calendar-check-outline",
        title:"Parcelamentos no período",
        detail:"Quantidade real retornada para o período selecionado.",
        value:formatValue(installments,"number"),
        route:"parcelamentos"
      });
    }

    if(Number.isFinite(launched)&&Number.isFinite(collected)){
      const difference=launched-collected;
      items.push({
        icon:"compare-horizontal",
        title:"Diferença lançado × arrecadado",
        detail:"Comparação simples do período; não representa inadimplência.",
        value:formatValue(difference,"currency"),
        route:"debitos"
      });
    }

    if(warnings.length){
      items.unshift({
        icon:"alert-circle-outline",
        title:"Fontes que exigem atenção",
        detail:"Carga parcial ou erro informado pelo backend nesta atualização.",
        value:formatValue(warnings.length,"number"),
        coverage:true
      });
    }

    const visible=items.slice(0,3);
    panel.innerHTML=`
      <div class="overview-attention-header">
        <div>
          <h2>Pontos de atenção</h2>
          <p>Indicadores calculados somente com os dados reais desta carga.</p>
        </div>
      </div>
      <div class="overview-attention-list">
        ${visible.length?visible.map((item,index)=>`
          <button class="overview-attention-item" type="button" data-attention-index="${index}">
            <span class="overview-attention-icon"><i class="mdi mdi-${escapeHtml(item.icon)}"></i></span>
            <span class="overview-attention-copy">
              <strong>${escapeHtml(item.title)}</strong>
              <small>${escapeHtml(item.detail)}</small>
            </span>
            <b>${escapeHtml(item.value)}</b>
            <i class="mdi mdi-chevron-right overview-attention-arrow"></i>
          </button>
        `).join(""):'<div class="overview-attention-empty">Sem indicadores suficientes para compor os pontos de atenção nesta carga.</div>'}
      </div>
    `;

    panel.querySelectorAll("[data-attention-index]").forEach(button=>{
      button.addEventListener("click",()=>{
        const item=visible[Number(button.dataset.attentionIndex)];
        if(!item) return;
        if(item.coverage){
          document.getElementById("integrationCoverage")?.scrollIntoView({behavior:"smooth",block:"center"});
          return;
        }
        if(item.route) navigate(item.route);
      });
    });
  }

  function renderPayload(payload) {
    currentPayload = payload || {};
    setDashboardLoading(false);
    const def = dashboards[currentView];
    populateDashboardFilterOptions(payload);
    renderOverviewAttention(payload);
    const kpis = payload.kpis || {};
    for (const kpi of def.kpis || []) {
      const el = document.querySelector(`[data-kpi="${cssEscape(kpi.id)}"] [data-value]`);
      const raw = kpis[kpi.id];
      if (el && raw !== undefined) el.textContent = formatValue(raw, kpi.format);
    }
    syncFavoriteKpiSnapshots(payload);
    renderPersonalHome();

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
      setLastUpdated(row.updated_at,"Supabase");
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
      setDashboardLoading(false);
      setLastUpdated(null);
      setStatus("waiting", "Sem dados locais · clique em ATUALIZAR");
      return false;
    }

    renderPayload(cached.payload);
    const stamp = formatCacheTime(cached.savedAt);
    setLastUpdated(cached.savedAt,"Snapshot local");
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
      if(loadedFromSupabase) return;

      const loadedFromCache=loadDashboardFromCache(view);
      if(loadedFromCache) return;

      // Primeira abertura sem snapshot: não deixa o painel parado no estado vazio.
      // Continua abaixo e consulta a Betha automaticamente com o mesmo tenant,
      // período, exercício, filtros e autorização usados pelo botão ATUALIZAR.
      setStatus("waiting","Sem snapshot disponível · buscando dados da Betha...");
    }

    if (!cfg.BACKEND_URL) return;
    setRefreshBusy(true);
    setDashboardLoading(true);
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
      setLastUpdated(saved?.savedAt || new Date().toISOString(),"Betha");

      if (warnings.length) {
        setStatus("waiting", "Atualizado " + stamp + " · " + warnings.length + " fonte(s) com aviso");
      } else {
        setStatus("online", "Atualizado " + stamp + " · salvo localmente");
      }
    } catch (error) {
      console.warn("Falha ao atualizar dashboard:", error);
      setDashboardLoading(false);

      // Mantém o último snapshot na tela mesmo se a atualização falhar.
      const restored = loadDashboardFromCache(view);

      if (error.status === 404 || error.status === 501) {
        setStatus("waiting", "Dados locais mantidos · motor analítico indisponível");
      } else if (error.message === "APPLICATION_SESSION_NOT_CONFIGURED") {
        setStatus("waiting", "Dados locais mantidos · aguardando autenticação Betha");
      } else if (!restored) {
        setStatus("error", "Atualização indisponível");
      }
    } finally {
      setRefreshBusy(false);
    }
  }

  function setRefreshBusy(busy) {
    const button=document.getElementById("refreshButton");
    if(!button) return;
    button.disabled=Boolean(busy);
    button.setAttribute("aria-busy",busy?"true":"false");
    button.innerHTML=busy
      ? '<i class="mdi mdi-loading mdi-spin"></i> ATUALIZANDO'
      : '<i class="mdi mdi-refresh"></i> ATUALIZAR';
  }

  function setDashboardLoading(loading) {
    const view=document.getElementById("dashboardView");
    if(!view) return;
    view.classList.toggle("is-loading",Boolean(loading));
    view.setAttribute("aria-busy",loading?"true":"false");
  }

  function setLastUpdated(value, source) {
    const el=document.getElementById("lastUpdated");
    if(!el) return;
    const stamp=value ? formatCacheTime(value) : "";
    el.classList.toggle("is-current",Boolean(stamp));
    el.lastElementChild.textContent=stamp
      ? (source ? source+" · "+stamp : "Atualizado · "+stamp)
      : "Aguardando dados";
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
    const detailResources=typeof detailResourcesFor==="function" ? detailResourcesFor(source,drill) : [];
    const hasDetail=detailResources.length>0;
    const nodes=[
      {label:"Visão consolidada",state:"done"},
      {label:"Composição",state:"done"},
      {label:detailResources.length>1 ? "Origens / cadastros" : "Origem / cadastro",state:"done"},
      {label:hasDetail ? "Registros autorizados" : "Registro individual",state:hasDetail ? "done" : "locked"}
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
    "guias-unificadas","contribuintes","imoveis","imoveis-responsaveis","imoveis-corresponsaveis","economicos","economicos-atividades",
    "receitas","creditos-tributarios","indexadores-valores",
    "logradouros","imoveis-campos-adicionais","planta-valores","obras",
    "solicitacoes-transferencias-imoveis","solicitacoes-transferencias-imoveis-itens","transferencias-imoveis"
  ]);

  const DETAIL_RESOURCE_LABELS = Object.freeze({
    contribuintes:"Contribuintes",
    imoveis:"Imóveis",
    "imoveis-responsaveis":"Responsáveis dos imóveis",
    "imoveis-corresponsaveis":"Corresponsáveis dos imóveis",
    economicos:"Econômicos",
    "economicos-atividades":"Atividades dos econômicos",
    debitos:"Débitos",
    dividas:"Dívidas",
    parcelamentos:"Parcelamentos",
    "parcelamentos-parcelas":"Parcelas",
    "guias-unificadas":"Guias",
    receitas:"Receitas",
    "creditos-tributarios":"Créditos tributários",
    "indexadores-valores":"Valores de indexadores",
    logradouros:"Logradouros",
    "imoveis-campos-adicionais":"Campos adicionais dos imóveis",
    "planta-valores":"Planta de valores",
    obras:"Obras",
    "solicitacoes-transferencias-imoveis":"Solicitações de transferência",
    "solicitacoes-transferencias-imoveis-itens":"Itens das solicitações",
    "transferencias-imoveis":"Transferências",
    "pagamentos-detalhados":"Pagamentos",
    "pagamentos-detalhados-valores":"Valores de pagamentos"
  });

  function detailResourcesFor(source,drill) {
    const candidates=[];
    if(drill) candidates.push(String(drill));
    for(const part of String(source||"").split("|")){
      const resource=part.includes(":") ? part.split(":").slice(1).join(":") : part;
      if(resource) candidates.push(resource);
    }
    return [...new Set(candidates.filter(item=>DETAIL_SUPPORTED.has(item)))];
  }

  function detailResourceFor(source,drill) {
    return detailResourcesFor(source,drill)[0] || "";
  }

  function detailRecordsSection(source,drill,options={}) {
    const resources=detailResourcesFor(source,drill);
    const qualityIssue=String(options.qualityIssue||"");
    if(!resources.length) return "";
    const primary=resources[0];

    return `
      <section class="drawer-section detail-records-section">
        <div class="detail-records-head">
          <div>
            <h3>Registros autorizados</h3>
            <p>Consulta paginada por origem, respeitando prefeitura, sessão e filtros atuais.</p>
          </div>
          <div class="detail-records-actions">
            ${resources.map(resource=>`
              <button class="btn-secondary-betha" type="button" data-load-detail="${escapeHtml(resource)}" ${qualityIssue ? 'data-detail-quality-issue="'+escapeHtml(qualityIssue)+'"' : ''}>
                <i class="mdi mdi-table-search"></i> ${escapeHtml(DETAIL_RESOURCE_LABELS[resource]||resource)}
              </button>
            `).join("")}
          </div>
        </div>
        <div class="detail-records-container" data-detail-container data-detail-resource="${escapeHtml(primary)}">
          <div class="detail-empty-state compact">
            <span>Escolha uma origem para carregar os registros autorizados.</span>
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

  function safeFilePart(value) {
    return String(value||"arquivo")
      .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      .replace(/[^a-zA-Z0-9_-]+/g,"-")
      .replace(/^-+|-+$/g,"")
      .toLowerCase()
      .slice(0,80) || "arquivo";
  }

  function exportContextLabel() {
    const period=document.getElementById("periodo")?.selectedOptions?.[0]?.textContent||"Todos";
    const exercise=document.getElementById("exercicio")?.value||"";
    const filters=currentDashboardFilters();
    const parts=[period,exercise].filter(Boolean);
    const filterText=Object.entries(filters).map(([key,value])=>key+": "+value);
    return {period,exercise,filters,summary:[...parts,...filterText].join(" · ")};
  }

  function detailContextHtml() {
    const context=exportContextLabel();
    const chips=[];
    if(context.period) chips.push(["Período",context.period]);
    if(context.exercise) chips.push(["Exercício",context.exercise]);
    for(const [key,value] of Object.entries(context.filters||{})) chips.push([key,value]);
    if(!chips.length) return "";
    return '<div class="detail-context-bar" aria-label="Filtros aplicados">'+chips.map(([label,value])=>
      '<span class="detail-context-chip"><small>'+escapeHtml(label)+'</small><strong>'+escapeHtml(value)+'</strong></span>'
    ).join("")+'</div>';
  }

  function downloadBlob(content,type,filename) {
    const blob=content instanceof Blob ? content : new Blob([content],{type});
    const url=URL.createObjectURL(blob);
    const link=document.createElement("a");
    link.href=url;
    link.download=filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  function csvEscape(value,separator=";") {
    const text=String(value??"");
    if(text.includes('"')||text.includes("\n")||text.includes("\r")||text.includes(separator)){
      return '"'+text.replace(/"/g,'""')+'"';
    }
    return text;
  }

  function exportRowsText(payload,separator) {
    const columns=Array.isArray(payload?.columns)?payload.columns:[];
    const rows=Array.isArray(payload?.rows)?payload.rows:[];
    const header=columns.map(col=>csvEscape(col.label||col.key,separator)).join(separator);
    const body=rows.map(row=>columns.map(col=>
      csvEscape(formatDetailCell(row[col.key],col.format),separator)
    ).join(separator)).join("\r\n");
    return header+"\r\n"+body;
  }

  function dashboardExportRows() {
    const def=dashboards[currentView]||{};
    const rows=[];
    for(const kpi of def.kpis||[]){
      const raw=currentPayload?.kpis?.[kpi.id];
      rows.push({
        tipo:"Indicador",
        item:kpi.label||kpi.id,
        serie:"",
        categoria:"",
        valor:formatValue(raw,kpi.format),
        fonte:kpi.source||""
      });
    }
    for(const chartDef of def.charts||[]){
      const chart=currentPayload?.charts?.[chartDef.id];
      if(!chart||!Array.isArray(chart.labels)||!Array.isArray(chart.datasets)) continue;
      chart.datasets.forEach(dataset=>{
        (dataset.data||[]).forEach((value,index)=>{
          rows.push({
            tipo:"Série",
            item:chartDef.title||chartDef.id,
            serie:dataset.label||"",
            categoria:chart.labels[index]??"",
            valor:chartDef.format ? formatValue(value,chartDef.format) : String(value??""),
            fonte:chartDef.source||""
          });
        });
      });
    }
    return rows;
  }

  function exportDashboardDelimited(separator,extension) {
    if(!currentPayload){
      showToast("Atualize o painel antes de exportar.","error");
      return;
    }
    const rows=dashboardExportRows();
    if(!rows.length){
      showToast("Não há indicadores ou séries para exportar.","error");
      return;
    }
    const context=exportContextLabel();
    const header=["Tipo","Item","Série","Categoria","Valor","Fonte"].map(x=>csvEscape(x,separator)).join(separator);
    const body=rows.map(row=>[
      row.tipo,row.item,row.serie,row.categoria,row.valor,row.fonte
    ].map(value=>csvEscape(value,separator)).join(separator)).join("\r\n");
    const meta=[
      ["Entidade",entityLabel||tenantId||"Entidade"],
      ["Painel",dashboards[currentView]?.title||currentView],
      ["Contexto",context.summary||"Padrão"]
    ].map(row=>row.map(value=>csvEscape(value,separator)).join(separator)).join("\r\n");
    const text=(extension==="csv"?"\uFEFF":"")+meta+"\r\n\r\n"+header+"\r\n"+body;
    const mime=extension==="csv"?"text/csv;charset=utf-8":"text/plain;charset=utf-8";
    const name=safeFilePart("bi-"+(entityLabel||tenantId)+"-"+(dashboards[currentView]?.title||currentView));
    downloadBlob(text,mime,name+"."+extension);
    showToast(extension.toUpperCase()+" gerado com sucesso.");
  }

  async function fetchDetailExport(resource,maxRecords) {
    const columns=[];
    const rows=[];
    let offset=0;
    let first=true;
    const seen=new Set();

    while(rows.length<maxRecords && !seen.has(offset)){
      seen.add(offset);
      const params=new URLSearchParams({
        periodo:document.getElementById("periodo")?.value||"todos",
        exercicio:document.getElementById("exercicio")?.value||String(new Date().getFullYear()),
        limit:"50",
        offset:String(offset)
      });
      for(const [key,value] of Object.entries(currentDashboardFilters())) params.set(key,value);

      const payload=await api(
        "/api/detail/"+encodeURIComponent(resource)+"?"+params.toString(),
        {timeoutMs:30000}
      );

      if(first){
        columns.push(...(Array.isArray(payload?.columns)?payload.columns:[]));
        first=false;
      }

      const pageRows=Array.isArray(payload?.rows)?payload.rows:[];
      for(const row of pageRows){
        if(rows.length>=maxRecords) break;
        rows.push(row);
      }

      const pagination=payload?.pagination||{};
      if(!pagination.hasMore || pagination.nextOffset===null || pagination.nextOffset===undefined) break;
      const next=Number(pagination.nextOffset);
      if(!Number.isFinite(next) || next<=offset) break;
      offset=next;
    }

    return {
      resource,
      columns,
      rows,
      truncated:rows.length>=maxRecords,
      maxRecords
    };
  }

  function setExportBusy(busy) {
    document.getElementById("exportMenuButton")?.classList.toggle("export-busy",busy);
    document.querySelectorAll("[data-dashboard-export]").forEach(button=>button.disabled=Boolean(busy));
    document.getElementById("drawerExportActions")?.classList.toggle("export-busy",busy);
  }

  async function exportDashboardToPdf() {
    const target=document.getElementById("dashboardView");
    if(!target || target.hidden) return;
    if(!window.html2canvas || !window.jspdf?.jsPDF){
      window.alert("Bibliotecas de exportação ainda não carregaram. Atualize a página e tente novamente.");
      return;
    }

    setExportBusy(true);
    try{
      const canvas=await window.html2canvas(target,{
        scale:1.6,
        useCORS:true,
        backgroundColor:"#ffffff",
        logging:false
      });

      const {jsPDF}=window.jspdf;
      const pdf=new jsPDF({orientation:"landscape",unit:"mm",format:"a4"});
      const pageWidth=pdf.internal.pageSize.getWidth();
      const pageHeight=pdf.internal.pageSize.getHeight();
      const margin=8;
      const headerHeight=19;
      const usableWidth=pageWidth-margin*2;
      const imgHeight=canvas.height*usableWidth/canvas.width;
      const imgData=canvas.toDataURL("image/jpeg",0.92);
      const context=exportContextLabel();

      const drawHeader=(pageNo)=>{
        pdf.setFontSize(13);
        pdf.text(String(dashboards[currentView]?.title||"BI Tributos"),margin,8);
        pdf.setFontSize(8);
        pdf.text(String(entityLabel||tenantId||"Entidade"),margin,13);
        pdf.setTextColor(90);
        pdf.text(context.summary||"Sem filtros adicionais",margin,17);
        pdf.text("Página "+pageNo,pageWidth-margin-18,17);
        pdf.setTextColor(0);
      };

      const availableHeight=pageHeight-headerHeight-margin;
      let sourceY=0;
      let pageNo=1;
      while(sourceY<imgHeight){
        if(pageNo>1) pdf.addPage();
        drawHeader(pageNo);
        pdf.addImage(imgData,"JPEG",margin,headerHeight,usableWidth,imgHeight,undefined,"FAST",0);
        // Clip by page via white cover below current slice approach:
        // shift image upward on subsequent pages.
        if(pageNo>1){
          // overwrite current page with shifted image
          pdf.addImage(imgData,"JPEG",margin,headerHeight-sourceY,usableWidth,imgHeight,undefined,"FAST");
        }
        sourceY+=availableHeight;
        pageNo++;
        if(pageNo>20) break;
      }

      // Rebuild multi-page correctly if content spans more than one page.
      if(imgHeight>availableHeight){
        const longPdf=new jsPDF({orientation:"landscape",unit:"mm",format:"a4"});
        let yOffset=0;
        let p=1;
        while(yOffset<imgHeight && p<=20){
          if(p>1) longPdf.addPage();
          longPdf.setFontSize(13);
          longPdf.text(String(dashboards[currentView]?.title||"BI Tributos"),margin,8);
          longPdf.setFontSize(8);
          longPdf.text(String(entityLabel||tenantId||"Entidade"),margin,13);
          longPdf.setTextColor(90);
          longPdf.text(context.summary||"Sem filtros adicionais",margin,17);
          longPdf.text("Página "+p,pageWidth-margin-18,17);
          longPdf.setTextColor(0);
          longPdf.addImage(imgData,"JPEG",margin,headerHeight-yOffset,usableWidth,imgHeight,undefined,"FAST");
          yOffset+=availableHeight;
          p++;
        }
        longPdf.save(
          safeFilePart("bi-"+(entityLabel||tenantId)+"-"+(dashboards[currentView]?.title||currentView))+".pdf"
        );
      } else {
        pdf.save(
          safeFilePart("bi-"+(entityLabel||tenantId)+"-"+(dashboards[currentView]?.title||currentView))+".pdf"
        );
      }
      showToast("PDF gerado com sucesso.");
    }catch(error){
      console.error("dashboard export",error);
      window.alert("Não foi possível gerar o PDF deste painel.");
    }finally{
      setExportBusy(false);
    }
  }

  async function exportDetailCsv() {
    if(!currentDetailResource) return;
    setExportBusy(true);
    try{
      const payload=await fetchDetailExport(currentDetailResource,10000);
      const text="\uFEFF"+exportRowsText(payload,";");
      const name=safeFilePart((entityLabel||tenantId)+"-"+currentDetailTitle+"-"+currentDetailResource);
      downloadBlob(text,"text/csv;charset=utf-8",name+".csv");
    }catch(error){
      console.error("detail csv export",error);
      window.alert("Não foi possível exportar o CSV.");
    }finally{
      setExportBusy(false);
    }
  }

  async function exportDetailTxt() {
    if(!currentDetailResource) return;
    setExportBusy(true);
    try{
      const payload=await fetchDetailExport(currentDetailResource,10000);
      const context=exportContextLabel();
      const meta=[
        "BI Tributos",
        "Entidade: "+(entityLabel||tenantId||""),
        "Detalhamento: "+currentDetailTitle,
        "Período/Filtros: "+(context.summary||""),
        "Registros exportados: "+payload.rows.length+(payload.truncated?" (limite atingido)":""),
        ""
      ].join("\r\n");
      const name=safeFilePart((entityLabel||tenantId)+"-"+currentDetailTitle+"-"+currentDetailResource);
      downloadBlob("\uFEFF"+meta+exportRowsText(payload,"\t"),"text/plain;charset=utf-8",name+".txt");
    }catch(error){
      console.error("detail txt export",error);
      window.alert("Não foi possível exportar o TXT.");
    }finally{
      setExportBusy(false);
    }
  }

  async function exportDetailPdf() {
    if(!currentDetailResource || !window.jspdf?.jsPDF) return;
    setExportBusy(true);
    try{
      const payload=await fetchDetailExport(currentDetailResource,1000);
      const {jsPDF}=window.jspdf;
      const pdf=new jsPDF({orientation:"landscape",unit:"mm",format:"a4"});
      const context=exportContextLabel();
      const columns=payload.columns||[];
      const head=[columns.map(col=>col.label||col.key)];
      const body=payload.rows.map(row=>columns.map(col=>formatDetailCell(row[col.key],col.format)));

      pdf.setFontSize(13);
      pdf.text(currentDetailTitle||"Detalhamento",10,10);
      pdf.setFontSize(8);
      pdf.text(String(entityLabel||tenantId||"Entidade"),10,15);
      pdf.setTextColor(90);
      pdf.text(context.summary||"Sem filtros adicionais",10,19);
      pdf.text(
        "Registros: "+payload.rows.length+(payload.truncated?" · PDF limitado aos primeiros 1.000 registros":""),
        10,23
      );
      pdf.setTextColor(0);

      if(typeof pdf.autoTable==="function"){
        pdf.autoTable({
          head,
          body,
          startY:27,
          styles:{fontSize:6.5,cellPadding:1.5,overflow:"linebreak"},
          headStyles:{fontSize:6.5},
          margin:{left:8,right:8}
        });
      }else{
        pdf.setFontSize(8);
        pdf.text("Tabela indisponível: plugin de exportação não carregado.",10,30);
      }

      const name=safeFilePart((entityLabel||tenantId)+"-"+currentDetailTitle+"-"+currentDetailResource);
      pdf.save(name+".pdf");
    }catch(error){
      console.error("detail pdf export",error);
      window.alert("Não foi possível exportar o PDF do detalhamento.");
    }finally{
      setExportBusy(false);
    }
  }

  async function loadDetailRecords(resource,offset=0,qualityIssue="") {
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
    if(qualityIssue) params.set("qualityIssue",qualityIssue);

    try {
      const payload=await api("/api/detail/"+encodeURIComponent(resource)+"?"+params.toString(),{timeoutMs:30000});
      currentDetailPayload=payload;
      currentDetailResource=resource;
      currentDetailTitle=document.getElementById("drawerTitle")?.textContent||resource;
      const exportActions=document.getElementById("drawerExportActions");
      if(exportActions) exportActions.hidden=false;
      const pagination=payload?.pagination||{};
      const pageNumber=Math.floor(Number(offset||0)/25)+1;
      container.innerHTML=detailContextHtml()+detailPageTable(payload)+`
        <div class="detail-pagination">
          <div class="detail-page-summary">
            <strong>Página ${pageNumber.toLocaleString("pt-BR")}</strong>
            <span>${Number(pagination.loaded||0).toLocaleString("pt-BR")} registro(s) exibidos</span>
          </div>
          <div class="detail-page-actions">
            ${offset>0 ? '<button class="btn-secondary-betha" type="button" data-detail-page="'+escapeHtml(resource)+'" data-detail-offset="'+Math.max(0,offset-25)+'" '+(qualityIssue ? 'data-detail-quality-issue="'+escapeHtml(qualityIssue)+'"' : '')+'><i class="mdi mdi-chevron-left"></i><span>Anterior</span></button>' : ''}
            ${pagination.hasMore && pagination.nextOffset!==null && pagination.nextOffset!==undefined
              ? '<button class="btn-secondary-betha" type="button" data-detail-page="'+escapeHtml(resource)+'" data-detail-offset="'+escapeHtml(pagination.nextOffset)+'" '+(qualityIssue ? 'data-detail-quality-issue="'+escapeHtml(qualityIssue)+'"' : '')+'><span>Próxima</span><i class="mdi mdi-chevron-right"></i></button>'
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
    const detailResource=kpi.detailResource||sourceKeyCandidates(kpi.source)[0];
    const detailIssue=kpi.detailIssue||"";

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
      ${detailRecordsSection(kpi.source,detailResource,{qualityIssue:detailIssue})}
      ${drillProgressHtml(kpi.source,detailResource)}
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
    currentDetailPayload=null;
    currentDetailResource="";
    currentDetailTitle=title||"Detalhamento";
    const exportActions=document.getElementById("drawerExportActions");
    if(exportActions) exportActions.hidden=true;
    document.getElementById("drawerTitle").textContent = title;
    const drawerContext=document.getElementById("drawerContext");
    if(drawerContext){
      const context=exportContextLabel();
      drawerContext.textContent=[entityLabel||tenantId||"Entidade",context.period,context.exercise].filter(Boolean).join(" · ");
    }
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
      loadDetailRecords(loadButton.dataset.loadDetail,0,loadButton.dataset.detailQualityIssue||"");
      return;
    }
    const pageButton=event.target.closest("[data-detail-page]");
    if(pageButton){
      loadDetailRecords(pageButton.dataset.detailPage,Number(pageButton.dataset.detailOffset||0),pageButton.dataset.detailQualityIssue||"");
    }
  });

  document.querySelectorAll("[data-dashboard-export]").forEach(button=>{
    button.addEventListener("click",async()=>{
      const format=button.dataset.dashboardExport;
      document.getElementById("dashboardExportMenu").hidden=true;
      document.getElementById("exportMenuButton").setAttribute("aria-expanded","false");
      if(format==="pdf") await exportDashboardToPdf();
      if(format==="csv") exportDashboardDelimited(";","csv");
      if(format==="txt") exportDashboardDelimited("\t","txt");
    });
  });
  document.getElementById("exportDetailPdf").addEventListener("click",exportDetailPdf);
  document.getElementById("exportDetailCsv").addEventListener("click",exportDetailCsv);
  document.getElementById("exportDetailTxt").addEventListener("click",exportDetailTxt);

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

  function mcpEndpointUrl() {
    return String(cfg.BACKEND_URL || location.origin).replace(/\/$/,"") + "/mcp";
  }

  async function copyTextValue(value) {
    const text=String(value||"");
    if(!text) return false;

    try {
      if(navigator.clipboard && window.isSecureContext){
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {}

    const input=document.createElement("textarea");
    input.value=text;
    input.setAttribute("readonly","");
    input.style.position="fixed";
    input.style.opacity="0";
    document.body.appendChild(input);
    input.select();
    let ok=false;
    try { ok=document.execCommand("copy"); } catch {}
    input.remove();
    return ok;
  }

  function resetMcpCredentialUi() {
    const result=document.getElementById("mcpTokenResult");
    const token=document.getElementById("mcpTokenValue");
    const expiry=document.getElementById("mcpTokenExpiry");
    const permissions=document.getElementById("mcpTokenPermissions");
    if(result) result.hidden=true;
    if(token){
      token.value="";
      token.type="password";
    }
    if(expiry) expiry.textContent="—";
    if(permissions) permissions.textContent="—";
  }

  async function generateMcpCredentialUi() {
    const button=document.getElementById("generateMcpToken");
    const result=document.getElementById("mcpTokenResult");
    const tokenInput=document.getElementById("mcpTokenValue");
    const badge=document.getElementById("mcpStatusBadge");

    if(button){
      button.disabled=true;
      button.innerHTML='<i class="mdi mdi-loading mdi-spin"></i> GERANDO';
    }

    try {
      const payload=await api("/api/mcp/tokens",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          label:"BI Tributos",
          ttlHours:8
        })
      });

      const endpoint=document.getElementById("mcpEndpoint");
      if(endpoint) endpoint.value=payload.endpoint || mcpEndpointUrl();

      if(tokenInput){
        tokenInput.value=payload.token || "";
        tokenInput.type="password";
      }

      const expiresAt=payload.expiresAt ? new Date(payload.expiresAt) : null;
      setConfigText(
        "mcpTokenExpiry",
        expiresAt && !Number.isNaN(expiresAt.getTime())
          ? "Expira em " + expiresAt.toLocaleString("pt-BR")
          : "Validade máxima de 8 horas"
      );

      const views=Array.isArray(payload.allowedViews)?payload.allowedViews:[];
      const labels=views.map(view=>dashboards[view]?.title || view);
      setConfigText(
        "mcpTokenPermissions",
        labels.length
          ? labels.length+" painel(is): "+labels.join(", ")
          : "Sem painéis autorizados"
      );

      if(result) result.hidden=false;
      if(badge){
        badge.textContent="CREDENCIAL ATIVA";
        badge.className="config-status-badge ok";
      }
      await Promise.all([loadMcpTokens(),loadAuditEvents()]);
    } catch(error) {
      resetMcpCredentialUi();
      if(badge){
        badge.textContent="INDISPONÍVEL";
        badge.className="config-status-badge error";
      }
      window.alert("Não foi possível gerar a credencial MCP: "+(error.message||"falha desconhecida"));
    } finally {
      if(button){
        button.disabled=false;
        button.innerHTML='<i class="mdi mdi-key-plus"></i> GERAR CREDENCIAL';
      }
    }
  }

  let auditPayloadCache={events:[],security:{}};
  const auditFilterState={period:"all",category:"all",status:"all",text:""};

  function auditPeriodCutoff(period,now=Date.now()) {
    const durations={
      "15m":15*60*1000,
      "1h":60*60*1000,
      "24h":24*60*60*1000,
      "7d":7*24*60*60*1000,
      "30d":30*24*60*60*1000
    };
    return durations[period] ? now-durations[period] : 0;
  }

  function auditEventMetaParts(event) {
    const meta=event?.meta&&typeof event.meta==="object" ? event.meta : {};
    const parts=[];
    if(meta.surface) parts.push("origem: "+meta.surface);
    if(meta.view) parts.push("painel: "+meta.view);
    if(meta.source) parts.push("fonte: "+meta.source);
    if(meta.resource) parts.push("recurso: "+meta.resource);
    if(meta.part) parts.push("bloco: "+meta.part);
    if(meta.code) parts.push("motivo: "+meta.code);
    if(event?.securitySignal){
      parts.push("padrão: "+event.securitySignal.count+" bloqueios/"+event.securitySignal.windowMinutes+"min");
    }
    if(meta.label) parts.push("rótulo: "+meta.label);
    if(meta.permissionCount!==undefined) parts.push(meta.permissionCount+" permissão(ões)");
    if(meta.viewCount!==undefined) parts.push(meta.viewCount+" painel(is)");
    return parts;
  }

  function filteredAuditEvents(events) {
    const cutoff=auditPeriodCutoff(auditFilterState.period);
    const category=String(auditFilterState.category||"all");
    const status=String(auditFilterState.status||"all");
    const needle=String(auditFilterState.text||"").trim().toLowerCase();

    return (Array.isArray(events)?events:[]).filter(event=>{
      if(cutoff){
        const ts=Date.parse(event?.ts||"");
        if(!Number.isFinite(ts)||ts<cutoff) return false;
      }
      if(category!=="all" && String(event?.category||"")!==category) return false;
      if(status!=="all" && String(event?.status||"")!==status) return false;
      if(needle){
        const haystack=[
          formatAuditCategory(event?.category),
          formatAuditAction(event?.action),
          event?.actor,
          event?.subject,
          ...auditEventMetaParts(event)
        ].filter(Boolean).join(" ").toLowerCase();
        if(!haystack.includes(needle)) return false;
      }
      return true;
    });
  }

  function updateAuditFilterCount(filteredCount,totalCount) {
    const el=document.getElementById("auditFilterCount");
    if(!el) return;
    el.textContent=filteredCount===totalCount
      ? totalCount+" evento(s)"
      : filteredCount+" de "+totalCount+" evento(s)";
  }

  function clearAuditFilters() {
    auditFilterState.period="all";
    auditFilterState.category="all";
    auditFilterState.status="all";
    auditFilterState.text="";
    const period=document.getElementById("auditPeriodFilter");
    const category=document.getElementById("auditCategoryFilter");
    const status=document.getElementById("auditStatusFilter");
    const textInput=document.getElementById("auditTextFilter");
    if(period) period.value="all";
    if(category) category.value="all";
    if(status) status.value="all";
    if(textInput) textInput.value="";
    renderAuditEvents(auditPayloadCache);
  }

  function exportAuditCsv() {
    const allEvents=Array.isArray(auditPayloadCache?.events)?auditPayloadCache.events:[];
    const events=filteredAuditEvents(allEvents);
    if(!events.length){
      showToast("Não há eventos no recorte atual para exportar.","error");
      return;
    }

    const separator=";";
    const filterLabels={
      period:document.getElementById("auditPeriodFilter")?.selectedOptions?.[0]?.textContent||"Todos",
      category:document.getElementById("auditCategoryFilter")?.selectedOptions?.[0]?.textContent||"Todas",
      status:document.getElementById("auditStatusFilter")?.selectedOptions?.[0]?.textContent||"Todos",
      text:String(auditFilterState.text||"").trim()||"Sem busca textual"
    };
    const meta=[
      ["BI Tributos - Auditoria"],
      ["Entidade",entityLabel||tenantId||"Entidade"],
      ["Período",filterLabels.period],
      ["Categoria",filterLabels.category],
      ["Status",filterLabels.status],
      ["Busca",filterLabels.text],
      ["Eventos exportados",events.length]
    ].map(row=>row.map(value=>csvEscape(value,separator)).join(separator)).join("\r\n");

    const header=["Data/hora","Categoria","Ação","Responsável","Referência","Status","Detalhes"]
      .map(value=>csvEscape(value,separator)).join(separator);
    const rows=events.map(event=>[
      event?.ts||"",
      formatAuditCategory(event?.category),
      formatAuditAction(event?.action),
      event?.actor||"",
      event?.subject||"",
      event?.status==="blocked"?"BLOQUEADO":(event?.status==="ok"?"OK":"ERRO"),
      auditEventMetaParts(event).join(" · ")
    ].map(value=>csvEscape(value,separator)).join(separator)).join("\r\n");

    const filename=safeFilePart("bi-auditoria-"+(entityLabel||tenantId||"entidade"))+".csv";
    downloadBlob("\uFEFF"+meta+"\r\n\r\n"+header+"\r\n"+rows,"text/csv;charset=utf-8",filename);
    showToast("CSV da auditoria gerado com "+events.length+" evento(s).");
  }

  function formatAuditAction(action) {
    const map={
      "credential.create":"Credencial MCP criada",
      "credential.revoke":"Credencial MCP revogada",
      "tool.call":"Consulta MCP",
      "access.create":"Acesso de usuário criado",
      "access.revoke":"Acesso de usuário removido",
      "page-mapping.publish":"Matriz de permissões publicada",
      "access.denied":"Acesso bloqueado"
    };
    return map[action] || action || "Ação";
  }

  function formatAuditCategory(category) {
    const map={
      mcp:"MCP",
      users:"Usuários",
      permissions:"Permissões",
      security:"Segurança",
      system:"Sistema"
    };
    return map[category] || category || "Sistema";
  }

  function renderMcpTokens(payload) {
    const container=document.getElementById("mcpActiveTokens");
    if(!container) return;
    const tokens=Array.isArray(payload?.tokens)?payload.tokens:[];
    if(!tokens.length){
      container.innerHTML='<div class="table-empty">Nenhuma credencial MCP ativa para esta prefeitura.</div>';
      return;
    }

    container.innerHTML=tokens.map(token=>{
      const expires=token.expiresAt ? new Date(token.expiresAt) : null;
      const expired=token.expired===true || (expires&&!Number.isNaN(expires.getTime())&&expires.getTime()<Date.now());
      const permissions=Array.isArray(token.allowedViews)?token.allowedViews.length:0;
      return `
        <article class="mcp-token-card">
          <div class="mcp-token-card-main">
            <strong>${escapeHtml(token.label||("Credencial "+token.tokenId))}</strong>
            <span>ID ${escapeHtml(token.tokenId||"—")} · ${escapeHtml(token.owner||"Usuário autenticado")}</span>
            <div class="mcp-token-meta-line">
              <span class="mcp-token-chip ${expired?"warn":"ok"}">${expired?"EXPIRADA":"ATIVA"}</span>
              <span class="mcp-token-chip">${permissions} painel(is)</span>
              <span class="mcp-token-chip">${expires&&!Number.isNaN(expires.getTime()) ? "até "+escapeHtml(expires.toLocaleString("pt-BR")) : "sem validade informada"}</span>
            </div>
          </div>
          <button class="row-action danger" type="button" data-revoke-mcp="${escapeHtml(token.tokenId||"")}" title="Revogar credencial" ${token.tokenId?"":"disabled"}>
            <i class="mdi mdi-key-remove"></i>
          </button>
        </article>
      `;
    }).join("");
  }

  async function loadMcpTokens() {
    const container=document.getElementById("mcpActiveTokens");
    if(container) container.innerHTML='<div class="table-empty">Carregando credenciais…</div>';
    try{
      const payload=await api("/api/mcp/tokens?limit=100");
      renderMcpTokens(payload);
    }catch(error){
      if(container) container.innerHTML='<div class="table-empty">Não foi possível carregar as credenciais MCP.</div>';
    }
  }

  async function revokeMcpToken(tokenId) {
    if(!tokenId) return;
    if(!window.confirm("Revogar esta credencial MCP imediatamente?")) return;
    try{
      await api("/api/mcp/tokens/"+encodeURIComponent(tokenId),{method:"DELETE"});
      await Promise.all([loadMcpTokens(),loadAuditEvents()]);
    }catch(error){
      window.alert("Não foi possível revogar a credencial MCP: "+(error.message||"falha desconhecida"));
    }
  }

  function renderAuditEvents(payload) {
    const tbody=document.getElementById("auditTableBody");
    if(!tbody) return;
    auditPayloadCache={
      events:Array.isArray(payload?.events)?payload.events:[],
      security:payload?.security&&typeof payload.security==="object" ? payload.security : {}
    };
    const allEvents=auditPayloadCache.events;
    const events=filteredAuditEvents(allEvents);
    const security=auditPayloadCache.security;
    const summary=security.summary&&typeof security.summary==="object" ? security.summary : {};

    updateAuditFilterCount(events.length,allEvents.length);

    const blockedCount=allEvents.filter(event=>event?.category==="security"&&event?.status==="blocked").length;
    const securityBadge=document.getElementById("auditSecurityBadge");
    if(securityBadge){
      securityBadge.textContent=blockedCount===1 ? "1 BLOQUEIO" : blockedCount+" BLOQUEIOS";
      securityBadge.className="config-status-badge "+(blockedCount?"warn":"ok");
    }

    const anomalyBadge=document.getElementById("auditAnomalyBadge");
    if(anomalyBadge){
      const flagged=Number(security.flaggedActors||0);
      const level=String(security.level||"normal");
      anomalyBadge.textContent=level==="high"
        ? "ALERTA ALTO · "+flagged
        : (level==="attention" ? "ATENÇÃO · "+flagged : "PADRÃO NORMAL");
      anomalyBadge.className="config-status-badge "+(level==="high"?"error":(level==="attention"?"warn":"ok"));
      anomalyBadge.title=level==="normal"
        ? "Nenhum padrão anômalo detectado nos últimos "+String(security.windowMinutes||10)+" minutos."
        : flagged+" usuário(s) com repetição de bloqueios na janela de "+String(security.windowMinutes||10)+" minutos. Nenhum bloqueio automático foi aplicado.";
    }

    const summaryWindow=document.getElementById("auditSummaryWindow");
    const summaryTrend=document.getElementById("auditSummaryTrend");
    const summaryTarget=document.getElementById("auditSummaryTarget");
    const summaryActors=document.getElementById("auditSummaryActors");
    const currentBlocked=Number(summary.currentBlocked||0);
    const previousBlocked=Number(summary.previousBlocked||0);
    const trend=String(summary.trend||"stable");
    const delta=Number(summary.trendDelta||0);
    const trendSymbol=trend==="up"?"↑":(trend==="down"?"↓":"→");

    if(summaryWindow){
      summaryWindow.querySelector("strong").textContent=String(currentBlocked);
      summaryWindow.querySelector("span").textContent="últimos "+String(security.windowMinutes||10)+" min";
    }
    if(summaryTrend){
      summaryTrend.querySelector("strong").textContent=trendSymbol+" "+Math.abs(delta);
      summaryTrend.querySelector("span").textContent="janela anterior: "+previousBlocked;
      summaryTrend.classList.toggle("is-alert",trend==="up"&&currentBlocked>0);
      summaryTrend.classList.toggle("is-good",trend==="down");
    }
    if(summaryTarget){
      summaryTarget.querySelector("strong").textContent=summary.topTarget||"Sem alvo recorrente";
      summaryTarget.querySelector("span").textContent=summary.topTargetCount
        ? summary.topTargetCount+" bloqueio(s) · "+(summary.topSurface||"origem")
        : "nenhum bloqueio recente";
    }
    if(summaryActors){
      const flagged=Number(security.flaggedActors||0);
      summaryActors.querySelector("strong").textContent=String(flagged);
      summaryActors.querySelector("span").textContent=flagged
        ? "usuário(s) sinalizado(s)"
        : "nenhum usuário sinalizado";
    }

    if(!events.length){
      tbody.innerHTML='<tr><td colspan="6" class="table-empty">'+
        (allEvents.length
          ? "Nenhum evento corresponde aos filtros atuais."
          : "Nenhum evento de auditoria registrado nesta prefeitura.")+
        '</td></tr>';
      return;
    }

    tbody.innerHTML=events.map(event=>{
      const dt=event.ts ? new Date(event.ts) : null;
      const metaParts=auditEventMetaParts(event);
      const status=String(event.status||"ok");
      const statusClass=status==="ok"?"ok":(status==="blocked"?"blocked":"error");
      const statusLabel=status==="ok"?"OK":(status==="blocked"?"BLOQUEADO":"ERRO");
      const signalLevel=String(event.securitySignal?.level||"");
      const rowClass=signalLevel==="high" ? "audit-row-high" : (signalLevel==="attention" ? "audit-row-attention" : "");
      return `
        <tr class="${rowClass}">
          <td>${escapeHtml(dt&&!Number.isNaN(dt.getTime())?dt.toLocaleString("pt-BR"):(event.ts||"—"))}</td>
          <td>${escapeHtml(formatAuditCategory(event.category))}</td>
          <td><span class="audit-action">${escapeHtml(formatAuditAction(event.action))}</span>${metaParts.length?'<small class="audit-meta">'+escapeHtml(metaParts.join(" · "))+'</small>':""}</td>
          <td>${escapeHtml(event.actor||"—")}</td>
          <td>${escapeHtml(event.subject||"—")}</td>
          <td><span class="audit-status ${statusClass}">${escapeHtml(statusLabel)}</span></td>
        </tr>
      `;
    }).join("");
  }

  async function loadAuditEvents() {
    const tbody=document.getElementById("auditTableBody");
    if(tbody) tbody.innerHTML='<tr><td colspan="6" class="table-empty">Carregando auditoria…</td></tr>';
    try{
      const payload=await api("/api/admin/audit?limit=100");
      renderAuditEvents(payload);
    }catch(error){
      auditPayloadCache={events:[],security:{}};
      updateAuditFilterCount(0,0);
      if(tbody) tbody.innerHTML='<tr><td colspan="6" class="table-empty">Auditoria disponível apenas para usuários com permissão de Configurações do BI.</td></tr>';
    }
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
    const mcpTokensPromise=loadMcpTokens();
    const auditPromise=loadAuditEvents();
    const tenant=currentTenantInfo();

    setConfigText("configTenantStatus",tenant ? (tenant.name||tenant.id) : "Não selecionada");
    setConfigText(
      "configTenantDetail",
      tenant ? "Contexto autorizado para esta sessão." : "Selecione uma prefeitura autorizada."
    );
    setConfigText("configTenantId",tenantId||"—");
    setConfigText("configEntityId",tenant&&tenant.entityId ? tenant.entityId : "—");
    setConfigText("configDatabaseId",tenant&&tenant.databaseId ? tenant.databaseId : "—");

    const mcpEndpoint=document.getElementById("mcpEndpoint");
    if(mcpEndpoint) mcpEndpoint.value=mcpEndpointUrl();
    resetMcpCredentialUi();

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
      const mcpBadge=document.getElementById("mcpStatusBadge");
      if(mcpBadge){
        mcpBadge.textContent=health.mcpEnabled===true ? "DISPONÍVEL" : "INDISPONÍVEL";
        mcpBadge.className="config-status-badge "+(health.mcpEnabled===true?"ok":"warn");
      }
    } catch(error) {
      setConfigText("configAuthStatus","Indisponível");
      setConfigText("configAuthDetail","Não foi possível consultar a saúde do Worker.");
      setConfigText("configDataStatus","Indisponível");
      setConfigText("configDataDetail",error.message||"Falha na consulta.");
    }

    await Promise.all([mappingPromise,mcpTokensPromise,auditPromise]);
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

  document.getElementById("generateMcpToken").addEventListener("click",generateMcpCredentialUi);
  document.getElementById("refreshMcpTokens").addEventListener("click",loadMcpTokens);
  document.getElementById("refreshAuditButton").addEventListener("click",loadAuditEvents);
  ["auditPeriodFilter","auditCategoryFilter","auditStatusFilter"].forEach(id=>{
    document.getElementById(id)?.addEventListener("change",(event)=>{
      if(id==="auditPeriodFilter") auditFilterState.period=event.currentTarget.value;
      if(id==="auditCategoryFilter") auditFilterState.category=event.currentTarget.value;
      if(id==="auditStatusFilter") auditFilterState.status=event.currentTarget.value;
      renderAuditEvents(auditPayloadCache);
    });
  });
  document.getElementById("auditTextFilter")?.addEventListener("input",(event)=>{
    auditFilterState.text=event.currentTarget.value;
    renderAuditEvents(auditPayloadCache);
  });
  document.getElementById("clearAuditFilters")?.addEventListener("click",clearAuditFilters);
  document.getElementById("exportAuditCsv")?.addEventListener("click",exportAuditCsv);
  document.getElementById("mcpActiveTokens").addEventListener("click",(event)=>{
    const button=event.target.closest("[data-revoke-mcp]");
    if(button) revokeMcpToken(button.dataset.revokeMcp);
  });
  document.getElementById("copyMcpEndpoint").addEventListener("click",async()=>{
    const endpoint=document.getElementById("mcpEndpoint")?.value||mcpEndpointUrl();
    const ok=await copyTextValue(endpoint);
    if(!ok) window.alert("Não foi possível copiar o endpoint.");
  });
  document.getElementById("copyMcpToken").addEventListener("click",async()=>{
    const token=document.getElementById("mcpTokenValue")?.value||"";
    if(!token) return;
    const ok=await copyTextValue(token);
    if(!ok) window.alert("Não foi possível copiar o token.");
  });
  document.getElementById("toggleMcpToken").addEventListener("click",()=>{
    const input=document.getElementById("mcpTokenValue");
    const icon=document.querySelector("#toggleMcpToken i");
    if(!input) return;
    const visible=input.type==="text";
    input.type=visible?"password":"text";
    if(icon) icon.className=visible?"mdi mdi-eye-outline":"mdi mdi-eye-off-outline";
  });

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

    applyNavigationPermissions(tenant);

    const url = new URL(location.href);
    url.searchParams.set("tenant", tenantId);
    if (tenant.name) url.searchParams.set("entidade", tenant.name);
    else url.searchParams.delete("entidade");
    url.searchParams.set("view", currentView);

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

  document.getElementById("favoriteDashboardButton")?.addEventListener("click",()=>toggleDashboardFavorite(currentView));
  document.getElementById("saveViewButton")?.addEventListener("click",()=>saveViewPreferences());

  document.getElementById("personalHome")?.addEventListener("click",(event)=>{
    const opener=event.target.closest("[data-home-open-view]");
    if(opener?.dataset.homeOpenView) navigate(opener.dataset.homeOpenView);
  });
  document.getElementById("clearViewFiltersButton")?.addEventListener("click",()=>clearDashboardFilters());
  document.getElementById("restoreDefaultViewButton")?.addEventListener("click",restoreDefaultView);

  document.getElementById("exportMenuButton")?.addEventListener("click",(event)=>{
    event.stopPropagation();
    const button=event.currentTarget;
    const menu=document.getElementById("dashboardExportMenu");
    if(!menu) return;
    const open=menu.hidden;
    menu.hidden=!open;
    button.setAttribute("aria-expanded",String(open));
  });

  document.getElementById("dashboardExportMenu")?.addEventListener("click",event=>event.stopPropagation());
  document.addEventListener("click",()=>{
    const menu=document.getElementById("dashboardExportMenu");
    const button=document.getElementById("exportMenuButton");
    if(menu) menu.hidden=true;
    if(button) button.setAttribute("aria-expanded","false");
  });

  document.addEventListener("keydown",(event)=>{
    if(event.key!=="Escape") return;
    const menu=document.getElementById("dashboardExportMenu");
    const button=document.getElementById("exportMenuButton");
    if(menu) menu.hidden=true;
    if(button) button.setAttribute("aria-expanded","false");
  });

  document.getElementById("moreFiltersButton")?.addEventListener("click",()=>{
    const toggle=document.getElementById("moreFiltersButton");
    const row=document.getElementById("advancedFilterRow");
    if(!toggle||!row) return;
    const expanded=toggle.getAttribute("aria-expanded")==="true";
    toggle.setAttribute("aria-expanded",String(!expanded));
    toggle.dataset.view=currentView;
    row.hidden=expanded;
    if(!expanded){
      row.querySelector("input,select,button")?.focus({preventScroll:true});
    }
  });

  const reloadLocalSelection = () => {
    saveViewPreferences({silent:true});
    renderDashboard(currentView);
    loadDashboardData(currentView);
  };

  document.getElementById("periodo").addEventListener("change", reloadLocalSelection);
  document.getElementById("exercicio").addEventListener("change", reloadLocalSelection);
  document.getElementById("fontePreferencial").addEventListener("change", reloadLocalSelection);

  document.getElementById("resetDashboardFilters").addEventListener("click", () => clearDashboardFilters());

  document.getElementById("activeFilterSummary")?.addEventListener("click",(event)=>{
    const button=event.target.closest("[data-filter-key]");
    if(!button) return;
    const kind=button.dataset.filterKind;
    const key=button.dataset.filterKey;
    if(kind==="primary"){
      const defaults={periodo:"ano",exercicio:String(currentYear),fontePreferencial:"auto"};
      setSelectValueIfAvailable(key,defaults[key],defaults[key]);
    }else{
      const state=currentFilterState(currentView);
      delete state[key];
      filterStateByView.set(currentView,state);
    }
    saveViewPreferences({silent:true});
    renderDashboard(currentView);
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
    currentAllowedViews = new Set(Object.keys(dashboards));
    currentAllowedAdminViews = new Set(ADMIN_VIEWS);
    bethaApp.opcoes = window.BI_MENU || [];
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