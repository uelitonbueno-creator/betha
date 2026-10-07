(async () => {
  const cfg = window.BI_CONFIG || {};
  const SUPABASE_URL = "https://mliurxyjznxoafkwwtae.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1saXVyeHlqem54b2Fma3d3dGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NjA2MjMsImV4cCI6MjEwNjUzNjYyM30.bxZPsSSLpiZTFvXD2yZjtuc-5sniwDfV5D7UMAsB9ec";
  const dashboards = window.BI_DASHBOARDS || {};
  const systems = (Array.isArray(window.BI_SYSTEMS) && window.BI_SYSTEMS.length
    ? window.BI_SYSTEMS
    : [{id:"tributos",name:"Tributos",enabled:true,homeView:"visao-geral"}])
    .filter(system=>system && system.enabled!==false);
  const HOME_VIEW="inicio";
  const DEFAULT_VIEW="visao-geral";
  const ADMIN_VIEWS = new Set(["usuarios-admin","configuracoes-admin"]);
  const bethaApp = document.getElementById("bethaApp");
  const authGate = document.getElementById("authGate");
  const tenantGate = document.getElementById("tenantGate");
  const tenantGateList = document.getElementById("tenantGateList");
  const tenantGateTitle = document.getElementById("tenantGateTitle");
  const tenantGateMessage = document.getElementById("tenantGateMessage");
  const settingsUtilityButton = document.getElementById("settingsUtilityButton");
  const settingsUtilityMenu = document.getElementById("settingsUtilityMenu");
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
  const chartDisplayStateByView = new Map();
  const restoredPreferenceScopes = new Set();
  let toastTimer = null;
  let currentView = query.view===HOME_VIEW
    ? DEFAULT_VIEW
    : ADMIN_VIEWS.has(query.view)
      ? query.view
      : (query.view&&dashboards[query.view]?query.view:DEFAULT_VIEW);
  let currentPayload = null;
  let dashboardLoadGeneration = 0;
  let currentDetailPayload = null;
  let currentDetailResource = "";
  let currentDetailTitle = "";
  let currentLocalDetailExport = null;
  let authorizedTenants = [];
  let currentAllowedViews = new Set(Object.keys(dashboards));
  let currentAllowedAdminViews = new Set(ADMIN_VIEWS);

  let tenantId = query.tenant || query.entidadeId || query.entityId || "";
  let entityLabel = query.entidade || query.entity || query.entidadeNome || "ENTIDADE NÃO IDENTIFICADA";
  let currentSystemId = query.sistema || cfg.DEFAULT_SYSTEM || systems[0]?.id || "tributos";
  if(!systems.some(system=>String(system.id)===String(currentSystemId))) currentSystemId=systems[0]?.id||"tributos";

  window.BIVellaSearchContext=Object.freeze({
    getState:()=>{
      const system=systems.find(item=>String(item.id)===String(currentSystemId))||systems[0]||null;
      const tenant=currentTenantInfo();
      const privileged=Boolean(tenant&&(tenant.admin===true||tenant.technical===true));
      const allowedViews=Object.keys(dashboards).filter(view=>{
        const owner=String(dashboards[view]?.system||"tributos");
        if(owner!==String(currentSystemId)) return false;
        return privileged||currentAllowedViews.has(view);
      });
      const homeView=String(system?.homeView||DEFAULT_VIEW);
      const home=dashboards[homeView]||{};
      return {
        currentSystemId:String(currentSystemId),
        systemName:String(system?.name||system?.label||currentSystemId||"Tributos"),
        homeView,
        localSample:Boolean(home.localSample),
        sampleFile:home.localSample?.file||"",
        allowedViews
      };
    }
  });

  const initialSystem=systems.find(system=>String(system.id)===String(currentSystemId))||systems[0]||null;
  const initialSystemHome=initialSystem?.homeView||DEFAULT_VIEW;
  const initialViewSystem=dashboards[currentView]?.system||"tributos";
  if(!query.view || query.view===HOME_VIEW || String(initialViewSystem)!==String(currentSystemId)) currentView=initialSystemHome;

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
    if(view===HOME_VIEW) view=currentSystemInfo()?.homeView||DEFAULT_VIEW;
    if(dashboards[view]){
      const owner=String(dashboards[view].system||"tributos");
      if(owner!==String(currentSystemId)) return false;
    }
    if(dashboards[view]?.localSample){
      const tenant=currentTenantInfo();
      const privileged=Boolean(tenant&&(tenant.admin===true||tenant.technical===true));
      return String(dashboards[view].system||"")===String(currentSystemId) && (privileged||currentAllowedViews.has(view));
    }
    if (dashboards[view]?.apiSource) return (dashboards[view].permissionViews||[]).some(v=>currentAllowedViews.has(v));
    if (dashboards[view]) return currentAllowedViews.has(view);
    if (ADMIN_VIEWS.has(view)) return currentAllowedAdminViews.has(view);
    return false;
  }

  function menuForTenant(tenant) {
    const system=systems.find(item=>String(item.id)===String(currentSystemId))||systems[0]||null;
    const raw=Array.isArray(system?.menu) ? system.menu : (Array.isArray(window.BI_MENU)?window.BI_MENU:[]);
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
      const normalizedView=view===HOME_VIEW?(system?.homeView||DEFAULT_VIEW):view;
      if(dashboards[normalizedView]?.localSample){
        const privileged=Boolean(tenant&&(tenant.admin===true||tenant.technical===true));
        return String(dashboards[normalizedView].system||"")===String(currentSystemId) && (privileged||allowedViews.has(normalizedView));
      }
      return dashboards[normalizedView] ? allowedViews.has(normalizedView) :
        (ADMIN_VIEWS.has(normalizedView) ? allowedAdminViews.has(normalizedView) : false);
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
    const system=systems.find(item=>String(item.id)===String(currentSystemId))||systems[0]||null;
    const home=system?.homeView||DEFAULT_VIEW;
    if(isViewAllowed(home)) return home;
    return Object.keys(dashboards).find(view=>{
      const owner=String(dashboards[view]?.system||"tributos");
      return owner===String(currentSystemId)&&isViewAllowed(view);
    }) ||
      [...currentAllowedAdminViews][0] ||
      home;
  }

  function applyNavigationPermissions(tenant) {
    const menu=menuForTenant(tenant);
    bethaApp.opcoes=menu;
    if(typeof closeGroupNavigation==="function")closeGroupNavigation();
    if(typeof syncSettingsUtilityPermissions==="function")syncSettingsUtilityPermissions();

    if(!isViewAllowed(currentView)){
      const fallback=firstAllowedView();
      if(fallback) currentView=fallback;
    }

    if(typeof bethaApp.setMenuAtivo==="function" && currentView){
      bethaApp.setMenuAtivo(currentView);
    }
    if(typeof syncSettingsUtilityPermissions==="function")syncSettingsUtilityPermissions();
    if(typeof syncMobileContextSelectors==="function")syncMobileContextSelectors();
  }

  bethaApp.opcoes = (systems.find(item=>String(item.id)===String(currentSystemId))?.menu) || window.BI_MENU || [];
  if (typeof bethaApp.setMenuAtivo === "function") bethaApp.setMenuAtivo(currentView);

  const groupNavigationMenu=document.createElement('nav');
  groupNavigationMenu.className='group-navigation-menu';
  groupNavigationMenu.hidden=true;
  groupNavigationMenu.setAttribute('aria-label','Opções do grupo');
  document.body.appendChild(groupNavigationMenu);
  let groupNavigationTrigger=null;
  function closeGroupNavigation(restoreFocus=false) {
    groupNavigationMenu.hidden=true;
    groupNavigationMenu.dataset.group='';
    if(restoreFocus)groupNavigationTrigger?.focus();
  }
  function openGroupNavigation(group) {
    const items=(group.submenus||[]).filter(item=>isViewAllowed(item.rota||item.id));
    if(!items.length)return;
    if(!groupNavigationMenu.hidden&&groupNavigationMenu.dataset.group===String(group.id)){closeGroupNavigation(true);return;}
    groupNavigationMenu.replaceChildren();
    for(const item of items){
      const button=document.createElement('button');button.type='button';button.textContent=item.descricao;
      button.addEventListener('click',()=>{closeGroupNavigation();navigate(item.rota||item.id);});
      groupNavigationMenu.appendChild(button);
    }
    const host=[...(bethaApp.shadowRoot?.querySelectorAll('bth-menu-horizontal-item')||[])].find(item=>item.identificador===group.id);
    groupNavigationTrigger=host?.shadowRoot?.querySelector('a')||null;
    const rect=host?.getBoundingClientRect()||bethaApp.getBoundingClientRect();
    groupNavigationMenu.style.left=Math.max(8,Math.min(rect.left,window.innerWidth-272))+'px';
    groupNavigationMenu.style.top=Math.max(8,Math.min(rect.bottom+4,window.innerHeight-items.length*44-20))+'px';
    groupNavigationMenu.dataset.group=String(group.id);
    groupNavigationMenu.hidden=false;
    groupNavigationMenu.querySelector('button')?.focus();
  }
  document.addEventListener('pointerdown',event=>{
    if(!groupNavigationMenu.hidden&&!event.composedPath().includes(groupNavigationMenu)&&!event.composedPath().includes(groupNavigationTrigger))closeGroupNavigation();
  });
  groupNavigationMenu.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();closeGroupNavigation(true);}
    if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
      event.preventDefault();const buttons=[...groupNavigationMenu.querySelectorAll('button')];const index=buttons.indexOf(document.activeElement);
      const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;
      buttons[next]?.focus();
    }
  });
  window.addEventListener('resize',()=>closeGroupNavigation());

  function syncSettingsUtilityPermissions() {
    if(!settingsUtilityButton||!settingsUtilityMenu) return;
    const buttons=[...settingsUtilityMenu.querySelectorAll("[data-settings-view]")];
    let visible=0;
    for(const button of buttons){
      const allowed=isViewAllowed(button.dataset.settingsView);
      button.hidden=!allowed;
      if(allowed) visible++;
    }
    settingsUtilityButton.hidden=visible===0;
    settingsUtilityButton.classList.toggle("is-active",ADMIN_VIEWS.has(currentView));
    if(!visible) closeSettingsUtilityMenu();
  }

  function positionSettingsUtilityMenu() {
    if(!settingsUtilityButton||!settingsUtilityMenu||settingsUtilityMenu.hidden) return;
    const rect=settingsUtilityButton.getBoundingClientRect();
    const width=Math.min(360,window.innerWidth-16);
    settingsUtilityMenu.style.width=width+"px";
    settingsUtilityMenu.style.left=Math.max(8,Math.min(rect.right-width,window.innerWidth-width-8))+"px";
    settingsUtilityMenu.style.top=Math.min(rect.bottom+7,window.innerHeight-settingsUtilityMenu.offsetHeight-8)+"px";
  }

  function closeSettingsUtilityMenu(restoreFocus=false) {
    if(!settingsUtilityMenu||!settingsUtilityButton) return;
    settingsUtilityMenu.hidden=true;
    settingsUtilityButton.setAttribute("aria-expanded","false");
    if(restoreFocus) settingsUtilityButton.focus();
  }

  function openSettingsUtilityMenu() {
    if(!settingsUtilityMenu||!settingsUtilityButton||settingsUtilityButton.hidden) return;
    syncSettingsUtilityPermissions();
    const visible=[...settingsUtilityMenu.querySelectorAll("[data-settings-view]:not([hidden])")];
    if(!visible.length) return;
    closeGroupNavigation();
    settingsUtilityMenu.hidden=false;
    settingsUtilityButton.setAttribute("aria-expanded","true");
    requestAnimationFrame(()=>{
      positionSettingsUtilityMenu();
      visible[0]?.focus();
    });
  }

  settingsUtilityButton?.addEventListener("click",event=>{
    event.stopPropagation();
    if(settingsUtilityMenu?.hidden) openSettingsUtilityMenu();
    else closeSettingsUtilityMenu(true);
  });
  settingsUtilityMenu?.addEventListener("click",event=>{
    const item=event.target.closest("[data-settings-view]");
    if(!item||item.hidden) return;
    const view=item.dataset.settingsView;
    closeSettingsUtilityMenu();
    if(isViewAllowed(view)) navigate(view);
  });
  settingsUtilityMenu?.addEventListener("keydown",event=>{
    const buttons=[...settingsUtilityMenu.querySelectorAll("[data-settings-view]:not([hidden])")];
    if(event.key==="Escape"){
      event.preventDefault();
      closeSettingsUtilityMenu(true);
      return;
    }
    if(!["ArrowDown","ArrowUp","ArrowLeft","ArrowRight","Home","End"].includes(event.key)||!buttons.length) return;
    event.preventDefault();
    const index=Math.max(0,buttons.indexOf(document.activeElement));
    let next=index;
    if(event.key==="Home") next=0;
    else if(event.key==="End") next=buttons.length-1;
    else next=(index+(event.key==="ArrowDown"||event.key==="ArrowRight"?1:-1)+buttons.length)%buttons.length;
    buttons[next]?.focus();
  });
  document.addEventListener("pointerdown",event=>{
    if(!settingsUtilityMenu||settingsUtilityMenu.hidden) return;
    const path=event.composedPath();
    if(!path.includes(settingsUtilityMenu)&&!path.includes(settingsUtilityButton)) closeSettingsUtilityMenu();
  });
  window.addEventListener("resize",()=>{
    closeSettingsUtilityMenu();
  });
  window.addEventListener("scroll",()=>{
    if(settingsUtilityMenu&&!settingsUtilityMenu.hidden) positionSettingsUtilityMenu();
  },true);

  bethaApp.addEventListener("opcaoMenuSelecionada", (event) => {
    const detail = event.detail || {};
    const group=(bethaApp.opcoes||[]).find(item=>item.id===detail.id&&item.submenus?.length);
    if(group){openGroupNavigation(group);return;}
    closeGroupNavigation();
    const view = detail.rota || detail.id;
    if (!isViewAllowed(view)) return;
    if (detail.id && typeof bethaApp.setMenuAtivo === "function") bethaApp.setMenuAtivo(detail.id);
    navigate(view);
  });

  function navigate(view) {
    if(view===HOME_VIEW) view=currentSystemInfo()?.homeView||DEFAULT_VIEW;
    if (!isViewAllowed(view)) {
      showToast("Este painel não está liberado para o seu acesso.");
      return;
    }
    closeSettingsUtilityMenu();
    currentView = view;
    syncSettingsUtilityPermissions();
    if(typeof syncMobileContextSelectors==="function")syncMobileContextSelectors();
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
    const value=String(source||"");
    if(value.startsWith("local:")) return "sample";
    return value.startsWith("base:") ? "base" : "";
  }

  function sourceLabel(source) {
    if (!source) return "Fonte";
    if (source.includes("|")) return "MÚLTIPLAS";
    if(String(source).startsWith("local:")) return "AMOSTRA";
    return source.startsWith("base:") ? "DADOS" : "BI";
  }

  function renderSourceProvenance(payload,view=currentView) {
    const def=dashboards[view]||{};
    const title=document.getElementById("sourceDisclosureTitle");
    const description=document.getElementById("sourceDisclosureDescription");
    const summary=document.getElementById("sourceSummary");
    if(!summary) return;

    if(def.localSample||payload?.meta?.sampleMode){
      const meta=payload?.meta||{};
      const activeSystem=currentSystemInfo();
      const rows=Number(Object.values(meta.sourceRows||{})[0]||0);
      const audit=Object.values(meta.sourceAudit||{})[0]||{};
      const total=Number(audit.reportedTotal||rows||0);
      const generated=meta.sampleGeneratedAt ? formatCacheTime(meta.sampleGeneratedAt) : "";
      const sampleFile=String(meta.sampleFile||def.localSample?.file||"").split("/").pop();
      if(title) title.textContent="Origem da amostra desta visão";
      if(description) description.textContent="Dados sintéticos locais para validação visual e funcional. Não representam dados de produção.";
      summary.innerHTML=[
        '<span class="source-chip source-chip-sample"><strong>AMOSTRA LOCAL</strong> · '+escapeHtml(activeSystem?.name||currentSystemId)+'</span>',
        '<span class="source-chip"><strong>RECORTE</strong> · '+rows.toLocaleString("pt-BR")+' de '+total.toLocaleString("pt-BR")+' registros</span>',
        sampleFile?'<span class="source-chip"><strong>ARQUIVO</strong> · '+escapeHtml(sampleFile)+'</span>':"",
        generated?'<span class="source-chip"><strong>GERADA</strong> · '+escapeHtml(generated)+'</span>':"",
        '<span class="source-chip source-chip-zero-api"><strong>API</strong> · 0 chamadas Cloudflare</span>'
      ].filter(Boolean).join("");
      return;
    }

    if(title) title.textContent="Fontes utilizadas nesta visão";
    if(description) description.textContent="Integrações autorizadas utilizadas nesta leitura.";
    const sources=[...new Set([
      ...(def.kpis||[]).map(item=>item.source),
      ...dashboardCharts(view).map(item=>item.source)
    ].filter(Boolean))];
    summary.innerHTML=sources.map(src=>
      '<span class="source-chip"><strong>'+sourceLabel(src)+'</strong> · '+escapeHtml(src)+'</span>'
    ).join("");
  }

  function formatValue(value, format) {
    if(value===null||value===undefined)return "—";
    if(format==="percent")return Number(value).toLocaleString("pt-BR",{maximumFractionDigits:2})+"%";
    if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
    if (format === "currency") {
      return Number(value).toLocaleString("pt-BR", {style:"currency", currency:"BRL"});
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
      chartDisplay:chartDisplayStateByView.get(currentView)||{},
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
    chartDisplayStateByView.set(view,{...(saved.chartDisplay||{})});
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
    ].slice(0,24);
    writePersonalization(state);
  }

  function toggleDashboardFavorite(view=currentView) {
    if(!dashboards[view]) return;
    const state=readPersonalization();
    const set=new Set((state.favoriteDashboards||[]).filter(id=>dashboards[id]));
    const adding=!set.has(view);
    if(adding) set.add(view); else set.delete(view);
    state.favoriteDashboards=[...set].slice(0,24);
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
      : [{view,kpiId:kpi.id},...(state.favoriteKpis||[])].slice(0,32);

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

  function dashboardSystemId(view) {
    return String(dashboards[view]?.system||"tributos");
  }

  function isCurrentSystemHome(view=currentView) {
    return String(view||"")===String(currentSystemInfo()?.homeView||DEFAULT_VIEW);
  }

  const SYSTEM_HOME_COPY=Object.freeze({
    tributos:{
      kpiEyebrow:"RESUMO DO PERÍODO",
      kpiTitle:"Indicadores principais",
      kpiText:"Uma leitura rápida da arrecadação, carteira e base cadastral.",
      chartEyebrow:"ANÁLISES COMPLEMENTARES",
      chartTitle:"Composição e evolução",
      chartText:"Aprofunde a leitura pelos principais recortes tributários."
    },
    contabil:{
      kpiEyebrow:"EXECUÇÃO ORÇAMENTÁRIA",
      kpiTitle:"Indicadores principais",
      kpiText:"Empenho, liquidação, pagamento, receita arrecadada e concentração de credores.",
      chartEyebrow:"EVOLUÇÃO E COMPOSIÇÃO",
      chartTitle:"Execução e resultado",
      chartText:"Compare a execução mensal, a despesa por função e o comportamento da receita."
    },
    compras:{
      kpiEyebrow:"COMPRAS E CONTRATAÇÕES",
      kpiTitle:"Indicadores principais",
      kpiText:"Volume de processos, valores estimados e homologados, economia e fornecedores.",
      chartEyebrow:"ANÁLISES DE COMPRAS",
      chartTitle:"Valores, modalidades e secretarias",
      chartText:"Acompanhe a evolução das contratações e a distribuição por modalidade e área demandante."
    },
    folha:{
      kpiEyebrow:"FOLHA E QUADRO FUNCIONAL",
      kpiTitle:"Indicadores principais",
      kpiText:"Pessoas, folha bruta e líquida, descontos e encargos do recorte selecionado.",
      chartEyebrow:"ANÁLISES DA FOLHA",
      chartTitle:"Evolução, secretarias e vínculos",
      chartText:"Compare a evolução da folha com a distribuição do custo e do quadro funcional."
    }
  });

  function currentSystemHomeCopy() {
    return SYSTEM_HOME_COPY[String(currentSystemId)]||SYSTEM_HOME_COPY.tributos;
  }

  function isPersonalizationViewAllowed(view) {
    return Boolean(
      dashboards[view] &&
      dashboardSystemId(view)===String(currentSystemId) &&
      isViewAllowed(view)
    );
  }

  function renderPersonalHome() {
    const home=document.getElementById("personalHome");
    if(!home) return;
    if(!isCurrentSystemHome()){
      home.hidden=true; home.innerHTML=""; return;
    }

    const state=readPersonalization();
    const system=currentSystemInfo();
    const systemName=String(system?.name||system?.label||currentSystemId||"Tributos");
    const homeView=String(system?.homeView||DEFAULT_VIEW);

    const favorites=(state.favoriteDashboards||[])
      .filter(view=>view!==homeView&&isPersonalizationViewAllowed(view))
      .slice(0,6);

    const recent=(state.recentViews||[])
      .filter(item=>item&&item.view!==homeView&&isPersonalizationViewAllowed(item.view))
      .slice(0,4);

    const favoriteKpis=(state.favoriteKpis||[]).map(item=>{
      if(!isPersonalizationViewAllowed(item.view)) return null;
      const def=(dashboards[item.view]?.kpis||[]).find(kpi=>kpi.id===item.kpiId);
      return def ? {...item,def,snapshot:state.kpiSnapshots[favoriteKpiKey(item.view,item.kpiId)]||null} : null;
    }).filter(Boolean).slice(0,4);

    const favoriteHtml=favorites.length
      ? favorites.map(view=>'<button class="home-shortcut-card" type="button" data-home-open-view="'+escapeHtml(view)+'"><span class="home-shortcut-icon"><i class="mdi mdi-view-dashboard-outline"></i></span><span><strong>'+escapeHtml(dashboardLabel(view))+'</strong><small>Abrir painel favorito</small></span><i class="mdi mdi-chevron-right"></i></button>').join("")
      : '<div class="home-empty"><i class="mdi mdi-star-outline"></i><span>Favorite os painéis de '+escapeHtml(systemName)+' mais usados pela estrela do cabeçalho.</span></div>';

    const recentHtml=recent.length
      ? recent.map(item=>'<button class="home-recent-item" type="button" data-home-open-view="'+escapeHtml(item.view)+'"><span><strong>'+escapeHtml(dashboardLabel(item.view))+'</strong><small>'+escapeHtml(shortRelativeTime(item.at))+'</small></span><i class="mdi mdi-arrow-right"></i></button>').join("")
      : '<div class="home-empty compact"><span>Seus acessos recentes em '+escapeHtml(systemName)+' aparecerão aqui.</span></div>';

    const kpiHtml=favoriteKpis.length
      ? favoriteKpis.map(item=>'<button class="home-kpi-card" type="button" data-home-open-view="'+escapeHtml(item.view)+'"><small>'+escapeHtml(dashboardLabel(item.view))+'</small><strong>'+escapeHtml(item.def.label)+'</strong><span class="home-kpi-value">'+escapeHtml(item.snapshot?.formatted||"—")+'</span><span class="home-kpi-meta">'+escapeHtml(item.snapshot?.updatedAt ? "Última leitura "+shortRelativeTime(item.snapshot.updatedAt) : "Abra o painel para carregar o valor")+'</span></button>').join("")
      : '<div class="home-empty"><i class="mdi mdi-chart-box-outline"></i><span>Destaque KPIs de '+escapeHtml(systemName)+' pela estrela dos indicadores.</span></div>';

    home.innerHTML=
      '<div class="personal-home-head"><div><small>MINHA HOME · '+escapeHtml(systemName.toUpperCase())+'</small><h2>Seu '+escapeHtml(systemName)+', do seu jeito</h2><p>Favoritos, indicadores destacados e acessos recentes somente deste sistema e dentro das suas permissões.</p></div><span class="personal-home-badge"><i class="mdi mdi-account-cog-outline"></i> Personalizado</span></div>'+
      '<div class="personal-home-grid">'+
        '<section class="home-block home-block-favorites"><div class="home-block-title"><strong>Painéis favoritos</strong><span>Atalhos de '+escapeHtml(systemName)+'</span></div><div class="home-shortcuts">'+favoriteHtml+'</div></section>'+
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
      const option=normalizeFilterOptions(def?.options||[]).find(item=>item.value===String(value));
      items.push({kind:"advanced",key,label:def?.label||key,value:option?.label||value});
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
    chartDisplayStateByView.delete(currentView);
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

  function filterControlHtml(filter,state,prefix="filter") {
    const current=String(state[filter.id]||"");
    const fieldId=prefix+"-"+filter.id;

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
  }

  function bindDashboardFilterControls(hosts=[]) {
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
      if(!loaded) setStatus("waiting","Atualizando o painel para os filtros selecionados…");
      loadDashboardData(currentView,{force:true});
    };

    for(const host of hosts.filter(Boolean)){
      host.querySelectorAll("select[data-dashboard-filter]").forEach(select=>{
        select.addEventListener("change",()=>applyControlValue(select));
      });

      host.querySelectorAll('input[type="search"][data-dashboard-filter]').forEach(input=>{
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
          }
        });
      });
    }
  }

  function renderDashboardFilters(def) {
    const row=document.getElementById("advancedFilterRow");
    const container=document.getElementById("advancedFilters");
    const primaryContainer=document.getElementById("primaryDynamicFilters");
    const toggle=document.getElementById("moreFiltersButton");
    if(!row||!container||!primaryContainer) return;

    const filters=Array.isArray(def?.filters)?def.filters:[];
    const primaryFilters=filters.filter(filter=>filter.primary!==false).slice(0,2);
    const primaryIds=new Set(primaryFilters.map(filter=>filter.id));
    const advancedFilters=filters.filter(filter=>!primaryIds.has(filter.id));

    if(!filters.length){
      row.hidden=true;
      container.innerHTML="";
      primaryContainer.innerHTML="";
      primaryContainer.hidden=true;
      if(toggle){
        toggle.hidden=true;
        toggle.setAttribute("aria-expanded","false");
      }
      updateFilterActiveCount();
      return;
    }

    const state=currentFilterState(currentView);
    primaryContainer.hidden=!primaryFilters.length;
    primaryContainer.innerHTML=primaryFilters.map(filter=>filterControlHtml(filter,state,"primary-filter")).join("");

    const hasAdvancedActive=advancedFilters.some(filter=>{
      const value=state[filter.id];
      return value!==undefined&&value!==null&&String(value)!=="";
    });

    if(toggle){
      toggle.hidden=!advancedFilters.length;
      const expanded=advancedFilters.length && (toggle.dataset.view===currentView
        ? toggle.getAttribute("aria-expanded")==="true"
        : hasAdvancedActive);
      toggle.dataset.view=currentView;
      toggle.setAttribute("aria-expanded",String(Boolean(expanded)));
      row.hidden=!expanded;
    }else{
      row.hidden=!advancedFilters.length;
    }

    container.innerHTML=advancedFilters.map(filter=>filterControlHtml(filter,state,"filter")).join("");
    bindDashboardFilterControls([primaryContainer,container]);
    updateFilterActiveCount();
  }

  function populateDashboardFilterOptions(payload) {
    const def=dashboards[currentView];
    const filters=Array.isArray(def?.filters)?def.filters:[];
    if(!filters.length) return;

    const serverOptions=payload?.meta?.filterOptions||payload?.filterOptions||{};
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
    if(view===HOME_VIEW) view=currentSystemInfo()?.homeView||DEFAULT_VIEW;
    document.getElementById("syntheticHomeView").hidden=true;
    document.getElementById("dashboardView").hidden = false;
    document.getElementById("usersAdminView").hidden = true;
    document.getElementById("configAdminView").hidden = true;
    destroyCharts();
    currentPayload = null;
    const def = dashboards[view];
    const sourceChoice=document.getElementById("fontePreferencial")?.closest(".field");if(sourceChoice)sourceChoice.hidden=Boolean(def.apiSource||def.localSample);
    const dashboardView = document.getElementById("dashboardView");
    dashboardView.dataset.dashboard = view;
    dashboardView.dataset.system = currentSystemId;
    const systemInfo=currentSystemInfo();
    const systemName=String(systemInfo?.name||systemInfo?.label||systemInfo?.id||"Tributos");
    const systemHeaderContext=document.getElementById("systemHeaderContext");
    if(systemHeaderContext) systemHeaderContext.textContent=systemName.toUpperCase();
    document.title="BI Vella | "+systemName+" / "+(def?.title||"Painel");
    const sampleModeBadge=document.getElementById("sampleModeBadge");
    if(sampleModeBadge){
      sampleModeBadge.hidden=!def?.localSample;
      const sampleText=sampleModeBadge.querySelector("span");
      if(sampleText&&def?.localSample) sampleText.textContent="Amostra de teste · sem consumo da API";
    }
    const tableGrid=document.getElementById("tableGrid");
    if(tableGrid){tableGrid.innerHTML="";tableGrid.hidden=true;}
    document.getElementById("overviewExecutive")?.remove();
    document.getElementById("overviewAttention")?.remove();
    document.getElementById("overviewKpiHeading")?.remove();
    document.getElementById("overviewSecondaryHeading")?.remove();
    document.getElementById("revenueKpiHeading")?.remove();
    document.getElementById("revenueExecutive")?.remove();
    document.getElementById("revenueTrendHeading")?.remove();
    document.getElementById("revenueSecondaryHeading")?.remove();
    document.getElementById("debtKpiHeading")?.remove();
    document.getElementById("debtExecutive")?.remove();
    document.getElementById("debtTrendHeading")?.remove();
    document.getElementById("debtSecondaryHeading")?.remove();
    document.getElementById("activeDebtKpiHeading")?.remove();
    document.getElementById("activeDebtExecutive")?.remove();
    document.getElementById("activeDebtTrendHeading")?.remove();
    document.getElementById("activeDebtSecondaryHeading")?.remove();
    document.getElementById("installmentKpiHeading")?.remove();
    document.getElementById("installmentExecutive")?.remove();
    document.getElementById("installmentTrendHeading")?.remove();
    document.getElementById("installmentSecondaryHeading")?.remove();
    document.getElementById("economicKpiHeading")?.remove();
    document.getElementById("economicExecutive")?.remove();
    document.getElementById("economicTrendHeading")?.remove();
    document.getElementById("economicSecondaryHeading")?.remove();
    document.getElementById("propertyKpiHeading")?.remove();
    document.getElementById("propertyExecutive")?.remove();
    document.getElementById("propertyTrendHeading")?.remove();
    document.getElementById("propertySecondaryHeading")?.remove();
    document.getElementById("itbiKpiHeading")?.remove();
    document.getElementById("itbiExecutive")?.remove();
    document.getElementById("itbiTrendHeading")?.remove();
    document.getElementById("itbiSecondaryHeading")?.remove();
    document.getElementById("taxpayerKpiHeading")?.remove();
    document.getElementById("taxpayerExecutive")?.remove();
    document.getElementById("taxpayerTrendHeading")?.remove();
    document.getElementById("taxpayerSecondaryHeading")?.remove();
    restoreViewPreferencesOnce(view);
    renderDashboardFilters(def);

    const activeSystem=currentSystemInfo();
    const activeSystemName=String(activeSystem?.name||activeSystem?.label||activeSystem?.id||"Tributos");
    document.getElementById("pageTitle").textContent = activeSystemName+" / "+def.title;
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
      el.className = "kpi-card kpi-card-" + kpiFormat + " kpi-tone-" + ((def.kpis||[]).indexOf(kpi)%6);
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
      el.addEventListener("click", () => {
        if(def.localSample){openLocalSampleKpiDetail(kpi);return;}
        if(def.apiSource){openChartDetail(displayChartDefinition(def.charts[0]));return;}
        const candidates=dashboardCharts(view).filter(chart=>chart.source===kpi.source);
        const target=candidates.find(chart=>chart.id===kpi.chart)||candidates.find(chart=>chart.dimension===kpi.field)||candidates.find(chart=>(chart.measures||[]).includes(kpi.field))||candidates.find(chart=>(chart.measures||[]).includes("count"));
        if(!target){openKpiDetail(kpi);return;}
        const state=chartDisplayStateByView.get(view)||{};
        state[target.id]={group:target.id,type:state[target.id]?.type||target.type};
        chartDisplayStateByView.set(view,state);
        const card=document.querySelector('[data-chart="'+cssEscape(target.id)+'"]');
        if(card){const select=card.querySelector('[data-chart-display="group"]');if(select)select.value=target.id;card.scrollIntoView({behavior:"smooth",block:"center"});card.classList.add("chart-highlight");setTimeout(()=>card.classList.remove("chart-highlight"),1600);}
        if(currentPayload) renderPayload(currentPayload);
      });
      kpiGrid.appendChild(el);
    }
    updateKpiFavoriteButtons();

    if(isCurrentSystemHome(view)){
      const copy=currentSystemHomeCopy();
      const kpiHeading=document.createElement("div");
      kpiHeading.id="overviewKpiHeading";
      kpiHeading.className="overview-section-heading overview-kpi-heading system-home-section-heading";
      kpiHeading.innerHTML='<div><span>'+escapeHtml(copy.kpiEyebrow)+'</span><h2>'+escapeHtml(copy.kpiTitle)+'</h2></div><p>'+escapeHtml(copy.kpiText)+'</p>';
      kpiGrid.insertAdjacentElement("beforebegin",kpiHeading);
    }

    if(view==="arrecadacao"){
      const kpiHeading=document.createElement("div");
      kpiHeading.id="revenueKpiHeading";
      kpiHeading.className="revenue-section-heading revenue-kpi-heading";
      kpiHeading.innerHTML='<div><span>RECEITA DO PERÍODO</span><h2>Arrecadação efetivamente recebida</h2></div><p>Separe o principal arrecadado dos acréscimos, multas, correções e descontos.</p>';
      kpiGrid.insertAdjacentElement("beforebegin",kpiHeading);
    }

    if(view==="debitos"){
      const kpiHeading=document.createElement("div");
      kpiHeading.id="debtKpiHeading";
      kpiHeading.className="debt-section-heading debt-kpi-heading";
      kpiHeading.innerHTML='<div><span>CARTEIRA DO PERÍODO</span><h2>Lançamentos e situação dos débitos</h2></div><p>Priorize o valor lançado e os vencidos em aberto antes de aprofundar a composição da carteira.</p>';
      kpiGrid.insertAdjacentElement("beforebegin",kpiHeading);
    }

    if(view==="divida"){
      const kpiHeading=document.createElement("div");
      kpiHeading.id="activeDebtKpiHeading";
      kpiHeading.className="active-debt-section-heading active-debt-kpi-heading";
      kpiHeading.innerHTML='<div><span>ESTOQUE DA DÍVIDA ATIVA</span><h2>Saldo, inscrições e cobrança</h2></div><p>Veja primeiro o saldo atual e o valor inscrito; depois acompanhe execução, protesto e emissão de CDA.</p>';
      kpiGrid.insertAdjacentElement("beforebegin",kpiHeading);
    }

    if(view==="parcelamentos"){
      const kpiHeading=document.createElement("div");
      kpiHeading.id="installmentKpiHeading";
      kpiHeading.className="installment-section-heading installment-kpi-heading";
      kpiHeading.innerHTML='<div><span>ACORDOS E PARCELAS</span><h2>Saúde dos parcelamentos</h2></div><p>Priorize acordos ativos e parcelas vencidas, depois acompanhe entradas, quantidade de parcelas e cancelamentos.</p>';
      kpiGrid.insertAdjacentElement("beforebegin",kpiHeading);
    }

    if(view==="economicos"){
      const kpiHeading=document.createElement("div");
      kpiHeading.id="economicKpiHeading";
      kpiHeading.className="economic-section-heading economic-kpi-heading";
      kpiHeading.innerHTML='<div><span>ATIVIDADE ECONÔMICA E ISS</span><h2>Empresas, movimentação e base ativa</h2></div><p>Destaque os cadastros ativos e novas aberturas; depois acompanhe encerramentos, atividades e arrecadação vinculada.</p>';
      kpiGrid.insertAdjacentElement("beforebegin",kpiHeading);
    }

    if(view==="imobiliario"){
      const kpiHeading=document.createElement("div");
      kpiHeading.id="propertyKpiHeading";
      kpiHeading.className="property-section-heading property-kpi-heading";
      kpiHeading.innerHTML='<div><span>CADASTRO IMOBILIÁRIO E IPTU</span><h2>Estoque, ocupação e movimentação</h2></div><p>Priorize o total de imóveis e a base ativa; depois acompanhe rurais, responsáveis e transferências.</p>';
      kpiGrid.insertAdjacentElement("beforebegin",kpiHeading);
    }

    if(view==="itbi"){
      const kpiHeading=document.createElement("div");
      kpiHeading.id="itbiKpiHeading";
      kpiHeading.className="itbi-section-heading itbi-kpi-heading";
      kpiHeading.innerHTML='<div><span>TRANSFERÊNCIAS E ITBI</span><h2>Operações, valores e imposto apurado</h2></div><p>Priorize o ITBI apurado e o valor declarado; depois acompanhe solicitações, transferências e financiamento.</p>';
      kpiGrid.insertAdjacentElement("beforebegin",kpiHeading);
    }

    if(view==="contribuintes"){
      const kpiHeading=document.createElement("div");
      kpiHeading.id="taxpayerKpiHeading";
      kpiHeading.className="taxpayer-section-heading taxpayer-kpi-heading";
      kpiHeading.innerHTML='<div><span>BASE DE CONTRIBUINTES</span><h2>Cadastro, perfil e qualidade das informações</h2></div><p>Priorize o total cadastrado e os registros desativados; depois acompanhe PF, PJ e optantes do Simples.</p>';
      kpiGrid.insertAdjacentElement("beforebegin",kpiHeading);
    }

    let coverage = document.getElementById("integrationCoverage");
    if (!coverage) {
      coverage = document.createElement("section");
      coverage.id = "integrationCoverage";
      coverage.className = "integration-coverage";
      kpiGrid.insertAdjacentElement("afterend", coverage);
    }
    const sampleCoverage=Boolean(def.localSample);
    coverage.classList.toggle("is-sample",sampleCoverage);
    coverage.innerHTML = `
      <div class="coverage-title">
        <strong>${sampleCoverage?"Cobertura da amostra local":"Cobertura da integração"}</strong>
        <span>${sampleCoverage?"Registros sintéticos efetivamente usados no recorte atual · 0 chamadas à API.":"Registros efetivamente lidos das fontes autorizadas nesta carga."}</span>
      </div>
      <div id="coverageItems" class="coverage-items">
        <span class="coverage-loading">${sampleCoverage?"Preparando amostra local...":"Carregando fontes..."}</span>
      </div>
    `;

    const chartGrid = document.getElementById("chartGrid");
    chartGrid.innerHTML = "";
    const mainChartCount=(def.charts||[]).length;
    let additionalBody=null;
    if((def.additionalCharts||[]).length) {
      const more=document.createElement("details");more.className="additional-chart-section";more.innerHTML='<summary>Outros indicadores de imóveis</summary><div class="chart-grid additional-chart-grid"></div>';chartGrid.appendChild(more);additionalBody=more.querySelector(".additional-chart-grid");more.addEventListener("toggle",()=>{if(more.open)for(const chart of chartInstances.values())chart.resize();});
    }
    dashboardCharts(view).forEach((chartDef, index) => {
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
            ${chartTypeMenu(chartDef)}
            <span class="source-badge ${sourceClass(chartDef.source)}">${sourceLabel(chartDef.source)}</span>
            <button type="button" class="detail-button">VER DETALHES</button>
          </div>
        </div>
        <div class="chart-display-controls">${chartDisplayControls(chartDef)}</div>
        <div class="chart-body">
          <div class="chart-canvas-wrap"><canvas></canvas></div>
          <div class="chart-empty" data-empty-state>
            <i class="mdi mdi-chart-box-outline"></i>
            <strong>Carregando dados...</strong>
            <span>Aguardando resposta das fontes desta visão.</span>
          </div>
        </div>
      `;
      card.querySelector(".detail-button").addEventListener("click", () => openChartDetail(displayChartDefinition(chartDef)));
      card.querySelectorAll('[data-chart-type]').forEach(button=>button.addEventListener('click',()=>{
        const select=card.querySelector('[data-chart-display="type"]');
        select.value=button.dataset.chartType;select.dispatchEvent(new Event('change'));
        card.querySelector('.chart-type-menu').open=false;
      }));
      card.querySelector('.chart-type-menu').addEventListener('keydown',event=>{if(event.key==='Escape')card.querySelector('.chart-type-menu').open=false;});
      card.querySelectorAll("[data-chart-display]").forEach(select=>select.addEventListener("change",()=>{
        const state=chartDisplayStateByView.get(view)||{};
        state[chartDef.id]={group:card.querySelector('[data-chart-display="group"]')?.value||chartDef.id,type:card.querySelector('[data-chart-display="type"]')?.value||chartDef.type};
        chartDisplayStateByView.set(view,state);
        saveViewPreferences({silent:true});
        const selected=displayChartDefinition(chartDef);
        card.querySelector("h2").textContent=selected.title;
        card.querySelector(".chart-title-block p").textContent=selected.subtitle||"";
        if(currentPayload) renderPayload(currentPayload);
      }));
      if(index<mainChartCount) chartGrid.insertBefore(card,chartGrid.querySelector(".additional-chart-section"));
      else additionalBody.appendChild(card);
    });

    if(isCurrentSystemHome(view)){
      const copy=currentSystemHomeCopy();
      const secondaryHeading=document.createElement("div");
      secondaryHeading.id="overviewSecondaryHeading";
      secondaryHeading.className="overview-section-heading overview-secondary-heading system-home-section-heading";
      secondaryHeading.innerHTML='<div><span>'+escapeHtml(copy.chartEyebrow)+'</span><h2>'+escapeHtml(copy.chartTitle)+'</h2></div><p>'+escapeHtml(copy.chartText)+'</p>';
      chartGrid.insertAdjacentElement("beforebegin",secondaryHeading);

      const personalHome=document.getElementById("personalHome");
      if(personalHome) chartGrid.insertAdjacentElement("afterend",personalHome);
      if(coverage){
        if(personalHome) personalHome.insertAdjacentElement("afterend",coverage);
        else chartGrid.insertAdjacentElement("afterend",coverage);
      }
    }

    if(view==="arrecadacao"){
      const executive=document.createElement("section");
      executive.id="revenueExecutive";
      executive.className="revenue-executive";
      const trendHeading=document.createElement("div");
      trendHeading.id="revenueTrendHeading";
      trendHeading.className="revenue-section-heading revenue-trend-heading";
      trendHeading.innerHTML='<div><span>EVOLUÇÃO E COMPOSIÇÃO</span><h2>Como a receita entrou</h2></div><p>Compare a evolução mensal com a composição entre tributo, correção, juros e multa.</p>';
      chartGrid.insertAdjacentElement("beforebegin",trendHeading);
      trendHeading.insertAdjacentElement("afterend",executive);

      const monthly=document.querySelector('#chartGrid [data-chart="arrecadacao-mes"]');
      const composition=document.querySelector('#chartGrid [data-chart="composicao-pagamento"]');
      if(monthly){
        monthly.classList.add("revenue-executive-main");
        executive.appendChild(monthly);
      }
      if(composition){
        composition.classList.add("revenue-executive-side");
        executive.appendChild(composition);
      }

      const secondaryHeading=document.createElement("div");
      secondaryHeading.id="revenueSecondaryHeading";
      secondaryHeading.className="revenue-section-heading revenue-secondary-heading";
      secondaryHeading.innerHTML='<div><span>DETALHAMENTO DA RECEITA</span><h2>Origem, modalidade e comportamento</h2></div><p>Explore recebimentos diários, créditos, receitas, baixas, estornos, benefícios e acréscimos.</p>';
      chartGrid.insertAdjacentElement("beforebegin",secondaryHeading);

      if(coverage) chartGrid.insertAdjacentElement("afterend",coverage);
    }

    if(view==="debitos"){
      const executive=document.createElement("section");
      executive.id="debtExecutive";
      executive.className="debt-executive";

      const trendHeading=document.createElement("div");
      trendHeading.id="debtTrendHeading";
      trendHeading.className="debt-section-heading debt-trend-heading";
      trendHeading.innerHTML='<div><span>EVOLUÇÃO E RISCO</span><h2>Formação e envelhecimento da carteira</h2></div><p>Acompanhe novos lançamentos e concentre a análise nas faixas de atraso dos débitos ainda em aberto.</p>';
      chartGrid.insertAdjacentElement("beforebegin",trendHeading);
      trendHeading.insertAdjacentElement("afterend",executive);

      const monthly=document.querySelector('#chartGrid [data-chart="lancamentos-mensais"]');
      const aging=document.querySelector('#chartGrid [data-chart="aging-debitos"]');
      if(monthly){
        monthly.classList.add("debt-executive-main");
        executive.appendChild(monthly);
      }
      if(aging){
        aging.classList.add("debt-executive-side");
        executive.appendChild(aging);
      }

      const secondaryHeading=document.createElement("div");
      secondaryHeading.id="debtSecondaryHeading";
      secondaryHeading.className="debt-section-heading debt-secondary-heading";
      secondaryHeading.innerHTML='<div><span>COMPOSIÇÃO DA CARTEIRA</span><h2>Situação, crédito e origem</h2></div><p>Analise status, crédito tributário, exercício, origem cadastral, descontos e receitas vinculadas.</p>';
      chartGrid.insertAdjacentElement("beforebegin",secondaryHeading);

      if(coverage) chartGrid.insertAdjacentElement("afterend",coverage);
    }

    if(view==="divida"){
      const executive=document.createElement("section");
      executive.id="activeDebtExecutive";
      executive.className="active-debt-executive";

      const trendHeading=document.createElement("div");
      trendHeading.id="activeDebtTrendHeading";
      trendHeading.className="active-debt-section-heading active-debt-trend-heading";
      trendHeading.innerHTML='<div><span>EVOLUÇÃO E RECUPERAÇÃO</span><h2>Estoque versus recuperação</h2></div><p>Compare a evolução do saldo da dívida ativa com os recebimentos vinculados à recuperação da carteira.</p>';
      chartGrid.insertAdjacentElement("beforebegin",trendHeading);
      trendHeading.insertAdjacentElement("afterend",executive);

      const stock=document.querySelector('#chartGrid [data-chart="estoque-divida"]');
      const recovery=document.querySelector('#chartGrid [data-chart="recuperacao"]');
      if(stock){
        stock.classList.add("active-debt-executive-main");
        executive.appendChild(stock);
      }
      if(recovery){
        recovery.classList.add("active-debt-executive-side");
        executive.appendChild(recovery);
      }

      const secondaryHeading=document.createElement("div");
      secondaryHeading.id="activeDebtSecondaryHeading";
      secondaryHeading.className="active-debt-section-heading active-debt-secondary-heading";
      secondaryHeading.innerHTML='<div><span>COBRANÇA E COMPOSIÇÃO</span><h2>Inscrições, ações e maiores devedores</h2></div><p>Analise novas inscrições, composição do saldo, situação, idade, crédito, execução, protesto, penhora e ranking de devedores.</p>';
      chartGrid.insertAdjacentElement("beforebegin",secondaryHeading);

      if(coverage) chartGrid.insertAdjacentElement("afterend",coverage);
    }

    if(view==="parcelamentos"){
      const executive=document.createElement("section");
      executive.id="installmentExecutive";
      executive.className="installment-executive";

      const trendHeading=document.createElement("div");
      trendHeading.id="installmentTrendHeading";
      trendHeading.className="installment-section-heading installment-trend-heading";
      trendHeading.innerHTML='<div><span>INADIMPLÊNCIA E RECEBIMENTO</span><h2>Risco dos acordos versus entrada de recursos</h2></div><p>Compare a concentração de parcelas vencidas com os pagamentos efetivamente vinculados aos parcelamentos.</p>';
      chartGrid.insertAdjacentElement("beforebegin",trendHeading);
      trendHeading.insertAdjacentElement("afterend",executive);

      const delinquency=document.querySelector('#chartGrid [data-chart="vencidas-parcelamento"]');
      const receipts=document.querySelector('#chartGrid [data-chart="pagamentos-parcelas"]');
      if(delinquency){
        delinquency.classList.add("installment-executive-main");
        executive.appendChild(delinquency);
      }
      if(receipts){
        receipts.classList.add("installment-executive-side");
        executive.appendChild(receipts);
      }

      const secondaryHeading=document.createElement("div");
      secondaryHeading.id="installmentSecondaryHeading";
      secondaryHeading.className="installment-section-heading installment-secondary-heading";
      secondaryHeading.innerHTML='<div><span>COMPOSIÇÃO DOS ACORDOS</span><h2>Novos parcelamentos, situação e cobrança</h2></div><p>Explore evolução dos acordos, situação, faixa de parcelas, entradas, execução/protesto, origem e cancelamentos.</p>';
      chartGrid.insertAdjacentElement("beforebegin",secondaryHeading);

      if(coverage) chartGrid.insertAdjacentElement("afterend",coverage);
    }

    if(view==="economicos"){
      const executive=document.createElement("section");
      executive.id="economicExecutive";
      executive.className="economic-executive";

      const trendHeading=document.createElement("div");
      trendHeading.id="economicTrendHeading";
      trendHeading.className="economic-section-heading economic-trend-heading";
      trendHeading.innerHTML='<div><span>DINÂMICA E RECEITA</span><h2>Aberturas versus arrecadação associada</h2></div><p>Acompanhe o ritmo de novos econômicos ao lado da receita vinculada ao cadastro econômico.</p>';
      chartGrid.insertAdjacentElement("beforebegin",trendHeading);
      trendHeading.insertAdjacentElement("afterend",executive);

      const openings=document.querySelector('#chartGrid [data-chart="aberturas"]');
      const issRevenue=document.querySelector('#chartGrid [data-chart="iss-arrecadacao"]');
      if(openings){
        openings.classList.add("economic-executive-main");
        executive.appendChild(openings);
      }
      if(issRevenue){
        issRevenue.classList.add("economic-executive-side");
        executive.appendChild(issRevenue);
      }

      const secondaryHeading=document.createElement("div");
      secondaryHeading.id="economicSecondaryHeading";
      secondaryHeading.className="economic-section-heading economic-secondary-heading";
      secondaryHeading.innerHTML='<div><span>PERFIL ECONÔMICO</span><h2>Situação, atividades e localização</h2></div><p>Explore encerramentos, situação cadastral, tipo de econômico, principais atividades, vínculos e distribuição por bairro.</p>';
      chartGrid.insertAdjacentElement("beforebegin",secondaryHeading);

      if(coverage) chartGrid.insertAdjacentElement("afterend",coverage);
    }

    if(view==="imobiliario"){
      const executive=document.createElement("section");
      executive.id="propertyExecutive";
      executive.className="property-executive";

      const trendHeading=document.createElement("div");
      trendHeading.id="propertyTrendHeading";
      trendHeading.className="property-section-heading property-trend-heading";
      trendHeading.innerHTML='<div><span>BASE E RECEITA IMOBILIÁRIA</span><h2>Composição dos imóveis versus arrecadação</h2></div><p>Compare a distribuição urbana/rural com os pagamentos vinculados aos imóveis no período selecionado.</p>';
      chartGrid.insertAdjacentElement("beforebegin",trendHeading);
      trendHeading.insertAdjacentElement("afterend",executive);

      const stock=document.querySelector('#chartGrid [data-chart="imoveis-geral"]');
      const propertyRevenue=document.querySelector('[data-chart="iptu-pagamentos"]');
      if(stock){
        stock.classList.add("property-executive-main");
        executive.appendChild(stock);
      }
      if(propertyRevenue){
        propertyRevenue.classList.add("property-executive-side");
        executive.appendChild(propertyRevenue);
      }

      const secondaryHeading=document.createElement("div");
      secondaryHeading.id="propertySecondaryHeading";
      secondaryHeading.className="property-section-heading property-secondary-heading";
      secondaryHeading.innerHTML='<div><span>TERRITÓRIO E RESPONSABILIDADE</span><h2>Bairros, ruas, proprietários e movimentações</h2></div><p>Explore a distribuição territorial, imóveis urbanos e rurais, responsáveis, setores, condomínios, loteamentos e transferências.</p>';
      chartGrid.insertAdjacentElement("beforebegin",secondaryHeading);

      if(coverage) chartGrid.insertAdjacentElement("afterend",coverage);
    }

    if(view==="itbi"){
      const executive=document.createElement("section");
      executive.id="itbiExecutive";
      executive.className="itbi-executive";

      const trendHeading=document.createElement("div");
      trendHeading.id="itbiTrendHeading";
      trendHeading.className="itbi-section-heading itbi-trend-heading";
      trendHeading.innerHTML='<div><span>FLUXO E APURAÇÃO</span><h2>Transferências concluídas versus ITBI calculado</h2></div><p>Acompanhe o volume de transferências ao lado da comparação entre o ITBI original e o valor ajustado.</p>';
      chartGrid.insertAdjacentElement("beforebegin",trendHeading);
      trendHeading.insertAdjacentElement("afterend",executive);

      const transfers=document.querySelector('#chartGrid [data-chart="transferencias-mes"]');
      const taxComparison=document.querySelector('#chartGrid [data-chart="itbi-ajustado"]');
      if(transfers){
        transfers.classList.add("itbi-executive-main");
        executive.appendChild(transfers);
      }
      if(taxComparison){
        taxComparison.classList.add("itbi-executive-side");
        executive.appendChild(taxComparison);
      }

      const secondaryHeading=document.createElement("div");
      secondaryHeading.id="itbiSecondaryHeading";
      secondaryHeading.className="itbi-section-heading itbi-secondary-heading";
      secondaryHeading.innerHTML='<div><span>PROCESSO E COMPOSIÇÃO</span><h2>Solicitações, certidões, financiamento e tramitação</h2></div><p>Explore o fluxo das solicitações, situações, certidão de ITBI, valores declarados, financiamento, cobrança e compradores.</p>';
      chartGrid.insertAdjacentElement("beforebegin",secondaryHeading);

      if(coverage) chartGrid.insertAdjacentElement("afterend",coverage);
    }

    if(view==="contribuintes"){
      const executive=document.createElement("section");
      executive.id="taxpayerExecutive";
      executive.className="taxpayer-executive";

      const trendHeading=document.createElement("div");
      trendHeading.id="taxpayerTrendHeading";
      trendHeading.className="taxpayer-section-heading taxpayer-trend-heading";
      trendHeading.innerHTML='<div><span>PERFIL E QUALIDADE</span><h2>Composição do cadastro versus completude de contato</h2></div><p>Compare pessoa física e jurídica com a disponibilidade de e-mail, telefone e celular.</p>';
      chartGrid.insertAdjacentElement("beforebegin",trendHeading);
      trendHeading.insertAdjacentElement("afterend",executive);

      const profile=document.querySelector('#chartGrid [data-chart="tipo-pessoa"]');
      const contact=document.querySelector('#chartGrid [data-chart="completude-contato"]');
      if(profile){
        profile.classList.add("taxpayer-executive-main");
        executive.appendChild(profile);
      }
      if(contact){
        contact.classList.add("taxpayer-executive-side");
        executive.appendChild(contact);
      }

      const secondaryHeading=document.createElement("div");
      secondaryHeading.id="taxpayerSecondaryHeading";
      secondaryHeading.className="taxpayer-section-heading taxpayer-secondary-heading";
      secondaryHeading.innerHTML='<div><span>SEGMENTAÇÃO CADASTRAL</span><h2>Simples, porte, situação e território</h2></div><p>Explore opção pelo Simples, porte empresarial, bairros, cidades, situação cadastral e atualizações ao longo do tempo.</p>';
      chartGrid.insertAdjacentElement("beforebegin",secondaryHeading);

      if(coverage) chartGrid.insertAdjacentElement("afterend",coverage);
    }

    renderSourceProvenance(null,view);

    setDashboardLoading(true);
    setLastUpdated(null);
    setStatus("waiting", cfg.BACKEND_URL ? "Carregando dados" : "Dados indisponíveis");
  }

  let syntheticHomeGeneration=0;
  function renderSyntheticHome() {
    hideMainViews();
    destroyCharts();
    currentPayload=null;
    document.getElementById("syntheticHomeView").hidden=false;
    document.getElementById("pageContext").textContent="INÍCIO";
    document.getElementById("homeSummaryGroups").innerHTML="";
    document.getElementById("homeSummaryStatus").textContent="Carregando os resumos autorizados…";
  }
  function homeCardHtml(card) {
    return '<button type="button" class="home-summary-card" data-home-panel="'+escapeHtml(card.panelView||card.view)+'" data-home-source="'+escapeHtml(card.id)+'"><span class="home-card-name">'+escapeHtml(card.label)+'</span><strong data-home-count>—</strong><span class="home-card-state" data-home-state>Consultando registros…</span><span class="home-card-action">VER PAINEL <i class="mdi mdi-chevron-right"></i></span></button>';
  }
  async function loadSyntheticHome() {
    const generation=++syntheticHomeGeneration;
    ++dashboardLoadGeneration;
    const homeTenant=tenantId;
    const active=()=>generation===syntheticHomeGeneration&&currentView===HOME_VIEW&&tenantId===homeTenant;
    const status=document.getElementById("homeSummaryStatus");
    const button=document.getElementById("refreshHomeButton");
    button.disabled=true;
    try {
      const catalog=await api("/api/home");
      if(!active()) return;
      const groups=catalog.groups||[];
      document.getElementById("homeSummaryGroups").innerHTML=groups.map(group=>'<section class="home-summary-group"><header><i class="mdi mdi-'+escapeHtml(group.icon)+'"></i><h2>'+escapeHtml(group.label)+'</h2><span>'+group.cards.length+' resumos</span></header><div class="home-summary-grid">'+group.cards.map(homeCardHtml).join('')+'</div></section>').join('');
      let next=0,finished=0,unavailable=0,backgroundJob=null;
      await Promise.all(Array.from({length:Math.min(2,groups.length)},async()=>{
        while(next<groups.length&&active()) {
          const group=groups[next++];
          try {
            const result=await api("/api/home/"+encodeURIComponent(group.id),{timeoutMs:30000});
            if(!active()) return;
            if(result.sync?.state==="running")backgroundJob=result.sync;
            if(!backgroundJob&&(result.cards||[]).some(card=>card.state==="loading"))backgroundJob={completed:0,total:groups.reduce((n,g)=>n+g.cards.length,0)};
            for(const card of result.cards||[]) {
              const el=document.querySelector('[data-home-source="'+cssEscape(card.id)+'"]');
              if(!el) continue;
              el.querySelector("[data-home-count]").textContent=card.count===null?"—":Number(card.count).toLocaleString("pt-BR")+(card.partial?"+":"");
              el.querySelector("[data-home-state]").textContent=card.state==="loading"?"Carga inicial em andamento":card.state==="unavailable"?"Fonte indisponível":card.partial?"Registros consultados · contagem parcial":card.state==="reported"?"Total informado pela fonte":"Total de registros";
              if(card.state==="unavailable") unavailable++;
            }
          } catch(error) {
            if(!active()) return;
            for(const card of group.cards){const el=document.querySelector('[data-home-source="'+cssEscape(card.id)+'"]');if(el)el.querySelector("[data-home-state]").textContent="Resumo indisponível · abra o painel";unavailable++;}
          }
          finished++;
          status.textContent="Resumos atualizados: "+finished+" de "+groups.length+" grupos.";
        }
      }));
      if(active()) status.textContent=groups.length?"Resumos atualizados"+(unavailable?" · "+unavailable+" fonte(s) indisponível(is)":"")+". Clique em um cartão para explorar.":"Nenhuma fonte liberada para este acesso.";
      if(active()&&backgroundJob){status.textContent='Carga completa em segundo plano: '+backgroundJob.completed+' de '+backgroundJob.total+' fontes concluídas. Os totais são atualizados automaticamente.';setTimeout(()=>{if(active())loadSyntheticHome();},15000);}

    } catch(error) {if(active())status.textContent="Não foi possível carregar os resumos: "+error.message;}
    finally {if(active())button.disabled=false;}
  }
  document.getElementById("homeSummaryGroups")?.addEventListener("click",event=>{const card=event.target.closest("[data-home-panel]");if(card)navigate(card.dataset.homePanel);});
  document.getElementById("refreshHomeButton")?.addEventListener("click",()=>loadSyntheticHome());

  function dashboardCharts(view=currentView) {
    return [...(dashboards[view]?.charts||[]),...(dashboards[view]?.additionalCharts||[])];
  }

  function compatibleChartGroups(chartDef,charts) {
    const signature=JSON.stringify([[...(chartDef.measures||[])].sort(),chartDef.detailFilters||{}]);
    return charts.filter(item=>item.source===chartDef.source&&item.drill===chartDef.drill&&JSON.stringify([[...(item.measures||[])].sort(),item.detailFilters||{}])===signature);
  }
  function displayChartDefinition(chartDef) {
    const state=chartDisplayStateByView.get(currentView)?.[chartDef.id]||{};
    const groups=compatibleChartGroups(chartDef,dashboardCharts());
    const selected=groups.find(item=>item.id===state.group)||chartDef;
    const type=["bar","pie","doughnut","line"].includes(state.type)?state.type:selected.type;
    return {...selected,type};
  }
  function chartDisplayControls(chartDef) {
    const groups=compatibleChartGroups(chartDef,dashboardCharts());
    const selected=displayChartDefinition(chartDef);
    const grouping=groups.length>1?'<label>Agrupar por<select data-chart-display="group" aria-label="Agrupamento de '+escapeHtml(chartDef.title)+'">'+groups.map(item=>'<option value="'+escapeHtml(item.id)+'" '+(item.id===selected.id?'selected':'')+'>'+escapeHtml(item.groupLabel||item.title)+'</option>').join('')+'</select></label>':'<span class="chart-group-label">'+escapeHtml(selected.groupLabel||selected.title)+'</span>';
    return grouping;
  }

  function chartTypeMenu(chartDef) {
    const type=displayChartDefinition(chartDef).type;
    const options=[["bar","chart-bar","Barras"],["pie","chart-pie","Pizza"],["doughnut","chart-donut","Rosca"],["line","chart-line","Linhas"]];
    const current=options.find(([value])=>value===type)||options[0];
    return '<details class="chart-type-menu"><summary aria-label="Alterar tipo de gráfico" title="Alterar tipo de gráfico"><i class="mdi mdi-'+current[1]+'" aria-hidden="true"></i><i class="mdi mdi-chevron-down" aria-hidden="true"></i></summary><div class="chart-type-options" role="group" aria-label="Tipo de gráfico">'+options.map(([value,icon,label])=>'<button type="button" data-chart-type="'+value+'" aria-label="'+label+'" title="'+label+'" aria-pressed="'+(value===type)+'"><i class="mdi mdi-'+icon+'" aria-hidden="true"></i></button>').join('')+'</div><select data-chart-display="type" hidden aria-label="Tipo de gráfico">'+options.map(([value,icon,label])=>'<option value="'+value+'" '+(value===type?'selected':'')+'>'+label+'</option>').join('')+'</select></details>';
  }

  function chartType(type) {
    if (type === "doughnut") return "doughnut";
    if (type === "pie") return "pie";
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
    if(value===null||value===undefined)return "—";
    if(format==="percent")return Number(value).toLocaleString("pt-BR",{maximumFractionDigits:2})+"%";
    const n=Number(value || 0);
    if(format==="currency"){
      return n.toLocaleString("pt-BR",{style:"currency",currency:"BRL",minimumFractionDigits:2,maximumFractionDigits:2});
    }
    return n.toLocaleString("pt-BR",{maximumFractionDigits:2});
  }

  function renderChartData(chartDef, data) {
    const card = document.querySelector(`[data-chart="${cssEscape(chartDef.id)}"]`);
    if (!card || !data || !Array.isArray(data.labels) || !Array.isArray(data.datasets)) return;

    const baseChartId=chartDef.id;
    chartDef=displayChartDefinition(chartDef);
    data=currentPayload?.charts?.[chartDef.id]||data;
    const signed=data.datasets.some(dataset=>(dataset.data||[]).some(value=>Number(value)<0));
    if(signed&&["pie","doughnut"].includes(chartDef.type)) {
      chartDef={...chartDef,type:"bar"};
      card.querySelector('[data-chart-display="type"]').value="bar";
    }
    card.querySelector("h2").textContent=chartDef.title;
    card.querySelector(".chart-title-block p").textContent=data.note||chartDef.subtitle||"";
    const icons={bar:'chart-bar',pie:'chart-pie',doughnut:'chart-donut',line:'chart-line'};
    const menu=card.querySelector('.chart-type-menu');
    if(menu){menu.querySelector('summary i').className='mdi mdi-'+(icons[chartDef.type]||'chart-bar');menu.querySelectorAll('[data-chart-type]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.chartType===chartDef.type)));}
    const circular=["pie","doughnut"].includes(chartDef.type);
    const horizontal=chartDef.type==="bar"&&data.labels.length>15;
    card.querySelector(".chart-canvas-wrap").style.height=horizontal?Math.max(300,data.labels.length*26)+"px":"300px";
    card.querySelector(".chart-empty").hidden = true;
    const canvas = card.querySelector("canvas");

    if (chartInstances.has(baseChartId)) {
      chartInstances.get(baseChartId).destroy();
      chartInstances.delete(baseChartId);
    }

    const bethaPalette = ["#0878f9","#0aa66d","#ff9f1a","#7c3aed","#ff4d45","#0f8db8","#64748b","#a855f7"];
    const chartDatasets = data.datasets.map((dataset,index) => {
      const color=bethaPalette[index % bethaPalette.length];
      const base={...dataset};

      if(circular){
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
        indexAxis:horizontal?"y":"x",
        responsive: true,
        maintainAspectRatio: false,
        interaction: {mode:"index", intersect:false},
        animation:{duration:420,easing:"easeOutQuart"},
        layout:{padding:{top:4,right:4,bottom:0,left:2}},
        plugins: {
          legend: {
            display: data.datasets.length > 1 || circular,
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
            displayColors:data.datasets.length>1 || circular,
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
        scales: circular ? undefined : {
          x: {
            beginAtZero:horizontal,
            ticks:{font:{size:9,weight:"500"},color:"#7a8495",maxRotation:horizontal?0:30,minRotation:0,padding:6,callback:horizontal?(value=>compactChartValue(value,data.format)):undefined},
            grid:{display:false},
            border:{display:false}
          },
          y: {
            beginAtZero:true,
            ticks:{
              font:{size:9,weight:"500"},
              color:"#8a94a4",
              padding:10,
              maxTicksLimit:horizontal?undefined:6,
              autoSkip:!horizontal,
              callback:horizontal?undefined:(value=>compactChartValue(value,data.format))
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
            filters:chartDef.selectionFilter&&data.selectionValues?.[idx]?{[chartDef.selectionFilter]:data.selectionValues[idx]}:{},
            datasets: data.datasets.map(d => ({label:d.label || chartDef.title, value:d.data[idx]}))
          });
        }
      }
    });
    chartInstances.set(baseChartId, instance);
  }

  function renderOverviewAttention(payload) {
    let panel=document.getElementById("overviewAttention");
    if(!isCurrentSystemHome()){
      if(panel) panel.remove();
      document.getElementById("overviewExecutive")?.remove();
      return;
    }

    if(!panel){
      panel=document.createElement("section");
      panel.id="overviewAttention";
      panel.className="overview-attention system-home-attention";
    }

    let executive=document.getElementById("overviewExecutive");
    if(!executive){
      executive=document.createElement("section");
      executive.id="overviewExecutive";
      executive.className="overview-executive system-home-executive";
      const secondaryHeading=document.getElementById("overviewSecondaryHeading");
      const chartGrid=document.getElementById("chartGrid");
      if(secondaryHeading) secondaryHeading.insertAdjacentElement("beforebegin",executive);
      else if(chartGrid) chartGrid.insertAdjacentElement("beforebegin",executive);
    }

    const primaryChartId=String(dashboards[currentView]?.charts?.[0]?.id||"");
    const primaryCard=primaryChartId
      ? document.querySelector('#chartGrid [data-chart="'+cssEscape(primaryChartId)+'"]')
      : null;
    if(primaryCard && primaryCard.parentElement!==executive){
      primaryCard.classList.add("overview-executive-chart");
      executive.appendChild(primaryCard);
    }
    if(panel.parentElement!==executive) executive.appendChild(panel);

    const kpis=payload?.kpis||{};
    const warnings=Array.isArray(payload?.meta?.warnings)?payload.meta.warnings:[];
    const sampleMode=Boolean(payload?.meta?.sampleMode||dashboards[currentView]?.localSample);
    const items=[];

    if(String(currentSystemId)==="tributos"){
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
          detail:"Quantidade retornada para o período selecionado.",
          value:formatValue(installments,"number"),
          route:"parcelamentos"
        });
      }
      if(Number.isFinite(launched)&&Number.isFinite(collected)){
        items.push({
          icon:"compare-horizontal",
          title:"Diferença lançado × arrecadado",
          detail:"Comparação simples do período; não representa inadimplência.",
          value:formatValue(launched-collected,"currency"),
          route:"debitos"
        });
      }
    }else if(String(currentSystemId)==="contabil"){
      const empenhado=Number(kpis.empenhado);
      const pago=Number(kpis.pago);
      const arrecadado=Number(kpis.arrecadado);
      if(Number.isFinite(empenhado)&&Number.isFinite(pago)){
        const saldo=Math.max(0,empenhado-pago);
        const execucao=empenhado?Math.min(100,(pago/empenhado)*100):0;
        items.push({
          icon:"cash-clock",
          title:"Saldo empenhado ainda não pago",
          detail:"Diferença entre o valor empenhado e o efetivamente pago na amostra.",
          value:formatValue(saldo,"currency"),
          route:"contabil-despesa"
        });
        items.push({
          icon:"progress-check",
          title:"Execução financeira da despesa",
          detail:"Percentual pago em relação ao total empenhado no recorte.",
          value:formatValue(execucao,"percent"),
          route:"contabil-execucao-orcamentaria"
        });
      }
      if(Number.isFinite(arrecadado)&&Number.isFinite(pago)){
        items.push({
          icon:"scale-balance",
          title:"Receita arrecadada × despesa paga",
          detail:"Saldo simples do recorte; indicador gerencial da amostra, não resultado contábil oficial.",
          value:formatValue(arrecadado-pago,"currency"),
          route:"contabil-execucao-orcamentaria"
        });
      }
    }else if(String(currentSystemId)==="compras"){
      const processos=Number(kpis.processos);
      const estimado=Number(kpis.estimado);
      const homologado=Number(kpis.homologado);
      const economia=Number(kpis.economia);
      if(Number.isFinite(economia)){
        items.push({
          icon:"cash-check",
          title:"Economia estimada",
          detail:"Diferença acumulada entre valores estimados e homologados na amostra.",
          value:formatValue(economia,"currency"),
          route:"compras-licitacoes"
        });
      }
      if(Number.isFinite(estimado)&&Number.isFinite(economia)){
        items.push({
          icon:"percent-outline",
          title:"Economia sobre o estimado",
          detail:"Percentual gerencial de economia em relação ao valor inicialmente estimado.",
          value:formatValue(estimado?(economia/estimado)*100:0,"percent"),
          route:"compras-licitacoes"
        });
      }
      if(Number.isFinite(processos)&&Number.isFinite(homologado)){
        items.push({
          icon:"clipboard-check-outline",
          title:"Valor homologado por processo",
          detail:"Média simples do valor homologado entre os processos do recorte.",
          value:formatValue(processos?homologado/processos:0,"currency"),
          route:"compras-processos"
        });
      }
    }else if(String(currentSystemId)==="folha"){
      const bruto=Number(kpis.bruto);
      const liquido=Number(kpis.liquido);
      const descontos=Number(kpis.descontos);
      const encargos=Number(kpis.encargos);
      if(Number.isFinite(bruto)&&Number.isFinite(encargos)){
        items.push({
          icon:"bank-transfer",
          title:"Encargos sobre a folha bruta",
          detail:"Participação dos encargos sobre o valor bruto do recorte.",
          value:formatValue(bruto?(encargos/bruto)*100:0,"percent"),
          route:"folha-encargos"
        });
      }
      if(Number.isFinite(bruto)&&Number.isFinite(descontos)){
        items.push({
          icon:"cash-minus",
          title:"Descontos sobre a folha bruta",
          detail:"Participação dos descontos sobre a folha bruta da amostra.",
          value:formatValue(bruto?(descontos/bruto)*100:0,"percent"),
          route:"folha-mensal"
        });
      }
      if(Number.isFinite(bruto)&&Number.isFinite(encargos)&&Number.isFinite(liquido)){
        items.push({
          icon:"calculator-variant-outline",
          title:"Custo bruto + encargos",
          detail:"Soma gerencial da folha bruta e dos encargos do recorte atual.",
          value:formatValue(bruto+encargos,"currency"),
          route:"folha-despesas"
        });
      }
    }

    if(warnings.length&&!sampleMode){
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
          <p>${escapeHtml(sampleMode
            ?"Indicadores gerenciais calculados somente sobre a AMOSTRA LOCAL; não representam produção."
            :"Indicadores calculados somente com os dados autorizados desta carga.")}</p>
        </div>
        ${sampleMode?'<span class="overview-attention-mode"><i class="mdi mdi-flask-outline"></i> AMOSTRA LOCAL</span>':""}
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
        `).join(""):'<div class="overview-attention-empty">Sem indicadores suficientes para compor os pontos de atenção neste recorte.</div>'}
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

  function chartSourceState(source,payload) {
    const audits=payload?.meta?.sourceAudit||{};
    const warnings=Array.isArray(payload?.meta?.warnings)?payload.meta.warnings:[];
    const candidates=[String(source),...sourceKeyCandidates(source)];
    const matched=candidates.map(key=>({key,audit:audits[key]})).filter(x=>x.audit);
    const warning=warnings.find(w=>candidates.includes(String(w?.source||"")));
    if(warning) return {kind:"error",detail:warning.errorDetail||warning.error||"Falha informada pela fonte"};
    if(!matched.length) return {kind:"unavailable",detail:"A carga não informou cobertura para esta fonte."};
    if(matched.some(x=>x.audit?.error)) {
      const a=matched.find(x=>x.audit?.error)?.audit||{};
      return {kind:"error",detail:a.errorDetail||a.error||"Falha ao consultar a fonte."};
    }
    const loaded=matched.reduce((n,x)=>n+(Number(x.audit?.loaded)||0),0);
    const complete=matched.every(x=>x.audit?.complete===true);
    if(loaded===0 && complete) return {kind:"empty",detail:"A fonte respondeu com carga completa e nenhum registro para o período/filtros."};
    if(loaded===0) return {kind:"partial",detail:"A fonte não retornou registros e a carga não foi concluída."};
    return {kind:"loaded",detail:loaded.toLocaleString("pt-BR")+" registro(s) carregado(s)."};
  }

  function renderChartEmptyState(chartDef,payload) {
    const card=document.querySelector(`[data-chart="${cssEscape(chartDef.id)}"]`);
    const empty=card?.querySelector("[data-empty-state]");
    if(!empty) return;
    const state=chartSourceState(chartDef.source,payload);
    const data=payload?.charts?.[displayChartDefinition(chartDef).id];
    if(chartDef.apiPanel&&data){empty.querySelector("strong").textContent=data.status==="unavailable"?"Indicador indisponível":data.status==="missing-fields"?"Campos necessários não informados":"Sem registros neste recorte";empty.querySelector("span").textContent=data.note||"Confira os filtros selecionados.";empty.hidden=false;return;}
    const title=empty.querySelector("strong");
    const detail=empty.querySelector("span");
    if(state.kind==="error"){
      title.textContent="Fonte indisponível";
      detail.textContent=state.detail;
    } else if(state.kind==="partial"){
      title.textContent="Carga parcial";
      detail.textContent=state.detail;
    } else if(state.kind==="unavailable"){
      title.textContent="Fonte não carregada";
      detail.textContent=state.detail;
    } else {
      title.textContent="Sem registros para o filtro atual";
      detail.textContent=state.detail;
    }
    empty.hidden=false;
  }

  function summaryCellDisplay(value,format="number") {
    if(value===null||value===undefined||value==="") return "—";
    const numeric=Number(value);
    if(!Number.isFinite(numeric)) return escapeHtml(String(value));
    if(format==="currency") return escapeHtml(formatValue(numeric,"currency"));
    if(format==="percent") return escapeHtml(formatValue(numeric,"percent"));
    return escapeHtml(formatValue(numeric,"number"));
  }

  function appendSummaryTableCard(host,table) {
    const columns=Array.isArray(table?.columns)?table.columns:[];
    const rows=Array.isArray(table?.rows)?table.rows:[];
    if(!columns.length||!rows.length) return false;
    const drillable=Boolean(currentPayload?.meta?.sampleMode&&table?.id&&rows.some(row=>row.key!==undefined));
    const card=document.createElement("article");
    card.className="summary-table-card";
    card.dataset.table=table.id||"summary";
    card.innerHTML='<header><div><h3>'+escapeHtml(table.title||"Resumo analítico")+'</h3><span>'+escapeHtml(table.subtitle||"Dados consolidados do painel")+'</span></div><span>'+Number(table.totalRows||rows.length).toLocaleString("pt-BR")+' item(ns)</span></header>'+
      '<div class="summary-table-scroll"><table class="summary-table"><thead><tr><th>'+escapeHtml(table.groupLabel||"Categoria")+'</th>'+
      columns.map(column=>'<th>'+escapeHtml(column.label||column.id||"Valor")+'</th>').join("")+
      '</tr></thead><tbody>'+
      rows.map(row=>'<tr'+(drillable?' class="summary-table-row-drill" tabindex="0" role="button" aria-label="Detalhar '+escapeHtml(String(row.label??"categoria"))+'" data-summary-table="'+escapeHtml(table.id)+'" data-summary-key="'+escapeHtml(String(row.key??""))+'" data-summary-label="'+escapeHtml(String(row.label??""))+'"':'')+'><td>'+escapeHtml(String(row.label??"—"))+(drillable?'<i class="mdi mdi-chevron-right summary-row-arrow" aria-hidden="true"></i>':'')+'</td>'+
        (row.values||[]).map((value,index)=>'<td>'+summaryCellDisplay(value,columns[index]?.format||"number")+'</td>').join("")+
      '</tr>').join("")+
      '</tbody></table></div>';
    host.appendChild(card);
    return true;
  }

  function renderSummaryTables(payload) {
    const host=document.getElementById("tableGrid");
    const heading=document.getElementById("tableSectionHeading");
    if(!host) return;
    host.innerHTML="";
    let rendered=0;

    const syncVisibility=()=>{
      const hidden=rendered===0;
      host.hidden=hidden;
      if(heading) heading.hidden=hidden;
    };

    const configured=Array.isArray(payload?.tables)?payload.tables.filter(Boolean):[];
    if(configured.length){
      for(const table of configured.slice(0,2)){
        if(appendSummaryTableCard(host,table)) rendered++;
      }
      syncVisibility();
      return;
    }

    const defs=dashboardCharts(currentView)
      .map(chart=>displayChartDefinition(chart))
      .filter((chart,index,array)=>array.findIndex(item=>item.id===chart.id)===index);
    const charts=payload?.charts||{};

    for(const chartDef of defs){
      if(rendered>=2) break;
      const data=charts[chartDef.id];
      if(!data||!Array.isArray(data.labels)||!data.labels.length||!Array.isArray(data.datasets)||!data.datasets.length) continue;
      const datasets=data.datasets.filter(ds=>Array.isArray(ds.data)).slice(0,3);
      if(!datasets.length) continue;
      const rows=data.labels.map((label,index)=>({
        label,
        values:datasets.map(ds=>ds.data[index])
      })).filter(row=>row.values.some(value=>value!==null&&value!==undefined));
      if(!rows.length) continue;
      const fallback={
        id:"chart-"+chartDef.id,
        title:chartDef.title,
        subtitle:"Resumo analítico dos dados exibidos no gráfico",
        columns:datasets.map(ds=>({label:ds.label||"Valor",format:data.format||chartDef?.sample?.format||"number"})),
        rows:rows.slice(0,10),
        totalRows:rows.length
      };
      if(appendSummaryTableCard(host,fallback)) rendered++;
    }
    syncVisibility();
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
      const sourceState=chartSourceState(kpi.source,payload);
      if (el && raw !== undefined) el.textContent = raw===null?"—":
        sourceState.kind==="error" || (sourceState.kind==="partial"&&Number(raw)===0)
          ? "—" : formatValue(raw, kpi.format);
    }
    syncFavoriteKpiSnapshots(payload);
    renderPersonalHome();

    const charts = payload.charts || {};
    for (const chartDef of dashboardCharts()) {
      const chartData=charts[displayChartDefinition(chartDef).id];
      const hasData=chartData && Array.isArray(chartData.labels) && chartData.labels.length &&
        Array.isArray(chartData.datasets) && chartData.datasets.some(ds=>Array.isArray(ds.data) && ds.data.some(v=>v!==null&&Number(v)!==0||chartDef.apiPanel&&v!==null));
      if (hasData) renderChartData(chartDef,chartData);
      else renderChartEmptyState(chartDef,payload);
    }
    renderSummaryTables(payload);
    renderSourceProvenance(payload,currentView);

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
      const sampleMode=Boolean(payload?.meta?.sampleMode);
      const sampleSystemName=currentSystemInfo()?.name||currentSystemId;
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
        const status = sampleMode ? "AMOSTRA LOCAL" : (error ? "ERRO" : (mismatch ? "DIVERGÊNCIA" : (complete ? "COMPLETO" : "PARCIAL")));
        const countText = sampleMode
          ? value.toLocaleString("pt-BR") + " no recorte / " + Number(reported??value).toLocaleString("pt-BR") + " na amostra"
          : (reported !== null
            ? value.toLocaleString("pt-BR") + " carregados / API " + reported.toLocaleString("pt-BR")
            : value.toLocaleString("pt-BR") + " carregados");
        const pages = Number(audit.pages || 0);
        const title = sampleMode
          ? "Dados sintéticos locais · 0 chamadas à API / Cloudflare"
          : (error
            ? "Falha: " + error + (errorStatus ? " (HTTP " + errorStatus + ")" : "") + (errorDetail ? " · " + errorDetail : "")
            : (mismatch
              ? "Total informado pela API diverge do total carregado"
              : status + " · " + pages + " página(s)"));
        const detailText = sampleMode
          ? "AMOSTRA LOCAL · 0 API"
          : (error
            ? [errorStatus ? "HTTP " + errorStatus : error, errorDetail].filter(Boolean).join(" · ")
            : (status + (pages ? " · " + pages + " pág." : "")));
        return `<div class="coverage-item coverage-audit${sampleMode?" is-sample":""}" title="${escapeHtml(title)}">
          <span class="coverage-dot ${stateClass}"></span>
          <span class="coverage-source">${escapeHtml(sampleMode?sampleSystemName:(labelMap[key] || key))}</span>
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

  async function loadDashboardFromSupabase(view, isActive = () => true) {
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
      if (!isActive()) return false;

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
    const safetyMaxIterations=2000;
    // Uma carga completa pode atravessar milhares de páginas. Em vez de manter
    // o navegador preso até o fim, processamos um lote por sessão e persistimos
    // o nextOffset. A próxima abertura continua do checkpoint.
    const sessionMaxIterations=Math.max(1,Number(options.sessionMaxIterations)||25);

    while(iterations<safetyMaxIterations && iterations<sessionMaxIterations){
      if (options.isActive && !options.isActive()) return aggregate;
      iterations++;

      if (typeof onProgress==="function") onProgress(aggregate,iterations,"requesting",offset);

      const payload=await requestOverviewChunk(part,params,offset,profile);
      if (options.isActive && !options.isActive()) return aggregate;
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
    } else if(iterations>=sessionMaxIterations) {
      const audits=Object.values(aggregate?.meta?.sourceAudit||{});
      const audit=audits[0]||null;
      if(audit && audit.complete!==true && audit.hasMore===true){
        aggregate.meta.batchPaused=true;
        aggregate.meta.batchPart=part;
        aggregate.meta.batchNextOffset=audit.nextOffset ?? null;
      }
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

  async function loadOverviewSharded(params, isActive = () => true) {
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
      if (!isActive()) return null;
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
            if (!isActive()) return;
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
          {startOffset:resumeOffset,isActive}
        );
        if (!isActive()) return null;
        mergeDashboardPart(merged,result);

        // Se a fonte ainda possui muitas páginas, encerra esta rodada de forma
        // controlada. O checkpoint parcial já contém o nextOffset para retomar.
        if(result?.meta?.batchPaused===true){
          saveDashboardCache("visao-geral",merged,"partial");
          renderPayload(merged);
          setStatus(
            "waiting",
            "Carga parcial salva · " + partName +
            " · continue na próxima atualização"
          );
          return merged;
        }
      } catch(error) {
        if (!isActive()) return null;
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

  async function loadDashboardProgressively(view, params, isActive) {
    params.set("progressive","1");
    params.set("loadId",crypto.randomUUID());
    let pendingRetries=0;
    for (let batch=0;batch<600;batch++) {
      if (!isActive()) return null;
      let payload;
      try {
        payload=await api("/api/dashboard/"+encodeURIComponent(view)+"?"+params.toString(),{timeoutMs:60000});
        pendingRetries=0;
      } catch (error) {
        if (error.message!=="DASHBOARD_BATCH_PENDING"||pendingRetries++>=30) throw error;
        await new Promise(resolve=>setTimeout(resolve,2000));
        continue;
      }
      if (!isActive()) return null;
      const audits=Object.values(payload?.meta?.sourceAudit||{});
      const complete=audits.length>0&&audits.every(a=>a.complete===true);
      renderPayload(payload);
      saveDashboardCache(view,payload,complete?"complete":"partial");
      if (payload.loading?.hasMore!==true) return payload;
      const loaded=audits.reduce((sum,a)=>sum+(Number(a.loaded)||0),0);
      setStatus("waiting","Carregando · "+loaded.toLocaleString("pt-BR")+" registros consultados · dados parciais");
      params.set("cursor",JSON.stringify(payload.loading.cursor||{}));
      await new Promise(resolve=>setTimeout(resolve,1200));
    }
    throw new Error("DASHBOARD_BATCH_LIMIT");
  }

  function apiPanelPath(source) {return "/api/panels/"+source.split(":").map(encodeURIComponent).join("/");}
  async function loadApiPanelDashboard(view) {
    const generation=++dashboardLoadGeneration,activeTenant=tenantId;
    const active=()=>generation===dashboardLoadGeneration&&currentView===view&&tenantId===activeTenant;
    const params=new URLSearchParams({periodo:document.getElementById("periodo").value,exercicio:document.getElementById("exercicio").value,loadId:crypto.randomUUID()});
    for(const [k,v]of Object.entries(currentDashboardFilters(view)))params.set(k,v);
    setRefreshBusy(true);setDashboardLoading(true);setStatus("waiting","Consultando os indicadores da entidade…");
    try {
      let pending=0;
      for(let batch=0;batch<600&&active();batch++){
        let payload;
        try {payload=await api(apiPanelPath(dashboards[view].apiSource)+"?"+params.toString(),{timeoutMs:60000});pending=0;}
        catch(error){const transient=["DASHBOARD_BATCH_PENDING","INITIAL_LOAD_IN_PROGRESS"].includes(error.message)||[429,502,503,504].includes(error.status)||error.message==="REQUEST_TIMEOUT";if(!transient||pending++>=6)throw error;setStatus("waiting","Consulta interrompida temporariamente · tentando novamente…");await new Promise(resolve=>setTimeout(resolve,Math.min(10000,1500*pending)));batch--;continue;}
        if(!active())return;
        renderPayload(payload);setLastUpdated(payload.meta?.updatedAt,"Betha");
        const loaded=Object.values(payload.meta?.sourceRows||{}).reduce((a,b)=>a+Number(b||0),0);
        const audits=Object.values(payload.meta?.sourceAudit||{}),complete=audits.length&&audits.every(a=>a.complete);
        if(!payload.loading?.hasMore){setStatus(complete?"online":"waiting",complete?"Fontes consultadas · confira os avisos de cada indicador":"Consulta concluída com limitações · confira a cobertura das fontes");return;}
        setStatus("waiting",loaded.toLocaleString("pt-BR")+" registros consultados · cálculos parciais");
        params.set("cursor",JSON.stringify(payload.loading.cursor||{}));
        await new Promise(resolve=>setTimeout(resolve,payload.loading?.background?15000:1200));
      }
      if(active())throw new Error("Limite de consulta atingido; os números exibidos são parciais.");
    }catch(error){if(active()){setDashboardLoading(false);setStatus("error",error.message||"Consulta indisponível");document.querySelectorAll("#chartGrid .chart-empty").forEach(el=>{el.querySelector("strong").textContent="Não foi possível carregar este gráfico";el.querySelector("span").textContent=error.message==="INITIAL_LOAD_REQUIRED"?"Execute a carga inicial em Administração → Configurações.":error.message||"Tente atualizar o painel.";});showToast("Não foi possível concluir a consulta dos indicadores.");}}
    finally{if(active())setRefreshBusy(false);}
  }

  const localSampleCache=new Map();
  const localSampleDetailRowsByView=new Map();

  function localSampleWhere(rows,where) {
    if(!where||typeof where!=="object") return rows;
    return rows.filter(row=>Object.entries(where).every(([key,value])=>row?.[key]===value));
  }

  function localSampleAggregate(rows,spec={}) {
    const scoped=localSampleWhere(rows,spec.where);
    if(spec.agg==="count") return scoped.length;
    if(spec.agg==="distinct") return new Set(scoped.map(row=>row?.[spec.field]).filter(value=>value!==null&&value!==undefined&&value!=="")).size;
    if(spec.agg==="average"){
      const values=scoped.map(row=>Number(row?.[spec.field])).filter(Number.isFinite);
      return values.length ? values.reduce((a,b)=>a+b,0)/values.length : 0;
    }
    if(spec.agg==="ratio"){
      const numerator=scoped.reduce((sum,row)=>sum+(Number(row?.[spec.numerator])||0),0);
      const denominator=scoped.reduce((sum,row)=>sum+(Number(row?.[spec.denominator])||0),0);
      return denominator ? (numerator/denominator)*100 : 0;
    }
    if(spec.agg==="difference"){
      const minuend=scoped.reduce((sum,row)=>sum+(Number(row?.[spec.minuend])||0),0);
      const subtrahend=scoped.reduce((sum,row)=>sum+(Number(row?.[spec.subtrahend])||0),0);
      return minuend-subtrahend;
    }
    return scoped.reduce((sum,row)=>sum+(Number(row?.[spec.field])||0),0);
  }

  function localSampleRowsForPeriod(rows) {
    const periodo=document.getElementById("periodo")?.value||"ano";
    const exercicio=document.getElementById("exercicio")?.value||String(currentYear);
    if(periodo==="todos") return rows.slice();

    const selectedYear=Number(exercicio)||currentYear;
    const currentMonth=new Date().getMonth()+1;
    const anchorMonth=selectedYear===currentYear ? currentMonth : 12;
    const monthKey=row=>String(row.mes||row.competencia||row.data||"").slice(0,7);

    if(periodo==="mes"){
      const key=String(selectedYear)+"-"+String(anchorMonth).padStart(2,"0");
      return rows.filter(row=>monthKey(row)===key);
    }

    if(periodo==="12m"){
      const anchor=new Date(selectedYear,anchorMonth-1,1);
      const start=new Date(anchor.getFullYear(),anchor.getMonth()-11,1);
      const startKey=start.getFullYear()+"-"+String(start.getMonth()+1).padStart(2,"0");
      const endKey=anchor.getFullYear()+"-"+String(anchor.getMonth()+1).padStart(2,"0");
      return rows.filter(row=>{
        const key=monthKey(row);
        return key>=startKey&&key<=endKey;
      });
    }

    const year=String(selectedYear);
    return rows.filter(row=>monthKey(row).startsWith(year+"-"));
  }

  function localSampleFilterOptions(rows,filters=[]) {
    const result={};
    for(const filter of filters){
      if(filter.type==="search"||filter.dynamic===false) continue;
      const field=filter.field||filter.id;
      result[filter.id]=[...new Set(rows
        .map(row=>row?.[field])
        .filter(value=>value!==undefined&&value!==null&&String(value)!=="")
        .map(value=>String(value)))]
        .sort((a,b)=>a.localeCompare(b,"pt-BR"));
    }
    return result;
  }

  function localSampleApplyDashboardFilters(rows,view=currentView) {
    const defs=filterDefinitions(view);
    const values=currentDashboardFilters(view);
    if(!Object.keys(values).length) return rows.slice();
    return rows.filter(row=>defs.every(filter=>{
      const selected=values[filter.id];
      if(selected===undefined||selected===null||String(selected)==="") return true;
      const field=filter.field||filter.id;
      if(filter.type==="search"){
        const needle=String(selected).trim().toLocaleLowerCase("pt-BR");
        if(!needle) return true;
        const haystack=filter.field
          ? String(row?.[field]??"")
          : Object.values(row||{}).map(value=>String(value??"")).join(" ");
        return haystack.toLocaleLowerCase("pt-BR").includes(needle);
      }
      return String(row?.[field]??"")===String(selected);
    }));
  }

  function localSampleTable(rows,tableDef) {
    const scoped=localSampleWhere(rows,tableDef?.where);
    const groupField=tableDef?.group;
    if(!groupField) return null;

    const groups=new Map();
    for(const row of scoped){
      const raw=row?.[groupField];
      const key=String(raw??"Não informado");
      if(!groups.has(key)) groups.set(key,[]);
      groups.get(key).push(row);
    }

    const columns=Array.isArray(tableDef.columns)?tableDef.columns:[];
    if(!columns.length||!groups.size) return null;

    const labelMap=tableDef.labelMap||{};
    let rowsOut=[...groups.entries()].map(([key,groupRows])=>({
      key,
      label:Object.prototype.hasOwnProperty.call(labelMap,key)?labelMap[key]:key,
      values:columns.map(column=>localSampleAggregate(groupRows,{
        ...column,
        where:null
      }))
    }));

    const sortIndex=Math.max(0,columns.findIndex(column=>column.id===tableDef.sortBy));
    const direction=String(tableDef.sortDir||"desc").toLowerCase()==="asc"?1:-1;
    rowsOut.sort((a,b)=>{
      const av=Number(a.values[sortIndex]);
      const bv=Number(b.values[sortIndex]);
      if(Number.isFinite(av)&&Number.isFinite(bv)&&av!==bv) return (av-bv)*direction;
      return String(a.label).localeCompare(String(b.label),"pt-BR");
    });

    const totalRows=rowsOut.length;
    const limit=Math.max(1,Number(tableDef.limit||10));
    rowsOut=rowsOut.slice(0,limit);

    return {
      id:tableDef.id,
      title:tableDef.title,
      subtitle:tableDef.subtitle||"",
      groupLabel:tableDef.groupLabel||"Categoria",
      columns:columns.map(column=>({
        id:column.id,
        label:column.label||column.id||"Valor",
        format:column.format||"number"
      })),
      rows:rowsOut,
      totalRows
    };
  }

  function localSampleChart(rows,chartDef) {
    const spec=chartDef.sample||{};
    const scoped=localSampleWhere(rows,spec.where);
    const groups=new Map();
    for(const row of scoped){
      const label=String(row?.[spec.group]??"Não informado");
      if(!groups.has(label)) groups.set(label,[]);
      groups.get(label).push(row);
    }
    let labels=[...groups.keys()];
    if(/^mes|competencia$/i.test(String(spec.group||""))) labels.sort();
    else labels.sort((a,b)=>a.localeCompare(b,"pt-BR"));

    const fields=Array.isArray(spec.fields)&&spec.fields.length
      ? spec.fields
      : [{field:spec.field,label:chartDef.title,agg:spec.agg}];

    const datasets=fields.map(fieldSpec=>({
      label:fieldSpec.label||chartDef.title,
      data:labels.map(label=>localSampleAggregate(groups.get(label)||[],{
        ...spec,
        ...fieldSpec,
        agg:fieldSpec.agg||spec.agg,
        where:null
      }))
    }));

    return {
      labels,
      datasets,
      format:spec.format||"number",
      note:"Amostra local de "+scoped.length+" registros · sem consumo do Cloudflare."
    };
  }

  async function localSampleDocument(file) {
    if(localSampleCache.has(file)) return localSampleCache.get(file);
    const promise=fetch(file,{cache:"no-store"}).then(async response=>{
      if(!response.ok) throw new Error("SAMPLE_HTTP_"+response.status);
      return response.json();
    });
    localSampleCache.set(file,promise);
    try{return await promise;}catch(error){localSampleCache.delete(file);throw error;}
  }

  async function loadLocalSampleDashboard(view) {
    const def=dashboards[view];
    const sample=def?.localSample;
    if(!sample) return;
    const generation=++dashboardLoadGeneration;
    const requestedTenant=tenantId;
    const requestedSystem=currentSystemId;
    const active=()=>generation===dashboardLoadGeneration&&currentView===view&&tenantId===requestedTenant&&currentSystemId===requestedSystem;

    setRefreshBusy(true);
    setDashboardLoading(true);
    setStatus("waiting","Carregando amostra local · sem consumo do Cloudflare...");

    try{
      const doc=await localSampleDocument(sample.file);
      if(!active()) return;
      const allRows=Array.isArray(doc?.rows)?doc.rows:[];
      const periodRows=localSampleRowsForPeriod(allRows);
      const filterOptions=localSampleFilterOptions(periodRows,def.filters||[]);
      const rows=localSampleApplyDashboardFilters(periodRows,view);
      localSampleDetailRowsByView.set(view,rows.slice());
      const kpis={};
      for(const kpi of def.kpis||[]) kpis[kpi.id]=localSampleAggregate(rows,kpi.sample||{agg:"count"});
      const charts={};
      for(const chart of def.charts||[]) charts[chart.id]=localSampleChart(rows,chart);
      const tables=(def.summaryTables||[]).map(table=>localSampleTable(rows,table)).filter(Boolean);

      const key=sample.sourceKey||requestedSystem||"sample";
      const payload={
        kpis,
        charts,
        tables,
        meta:{
          sampleMode:true,
          sampleFile:sample.file,
          sampleGeneratedAt:doc?.generatedAt||null,
          sampleRecordCount:Number(doc?.recordCount||allRows.length),
          filterOptions,
          sourceRows:{[key]:rows.length},
          sourceAudit:{[key]:{loaded:rows.length,reportedTotal:Number(doc?.recordCount||allRows.length),complete:true,pages:1}},
          warnings:[]
        }
      };
      renderPayload(payload);
      const sampleModeBadge=document.getElementById("sampleModeBadge");
      if(sampleModeBadge){
        sampleModeBadge.hidden=false;
        const sampleText=sampleModeBadge.querySelector("span");
        if(sampleText) sampleText.textContent=allRows.length+" registros · sem consumo da API / Cloudflare";
      }
      setLastUpdated(doc?.generatedAt||new Date().toISOString(),"Amostra local");
      const activeFilterCount=Object.keys(currentDashboardFilters(view)).length;
      setStatus("online","AMOSTRA LOCAL · "+rows.length+" de "+allRows.length+" registros"+(activeFilterCount?" · "+activeFilterCount+" filtro(s) ativo(s)":"")+" · 0 chamadas Cloudflare");
    }catch(error){
      if(!active()) return;
      console.warn("Falha ao carregar amostra local:",error);
      setDashboardLoading(false);
      setStatus("error","Amostra local indisponível");
      showToast("Não foi possível carregar os dados locais de teste.","error");
    }finally{
      if(active()) setRefreshBusy(false);
    }
  }

  async function loadDashboardData(view, options = {}) {
    if(view===HOME_VIEW) view=currentSystemInfo()?.homeView||DEFAULT_VIEW;
    if(dashboards[view]?.localSample) return loadLocalSampleDashboard(view);
    if(dashboards[view]?.apiSource) return loadApiPanelDashboard(view);
    const generation=++dashboardLoadGeneration;
    const requestedTenant=tenantId;
    const isActive=()=>generation===dashboardLoadGeneration&&view===currentView&&tenantId===requestedTenant;
    const force = options.force === true;

    if (!force) {
      // Snapshot/cache servem apenas para preencher a tela imediatamente.
      // Não encerram mais a carga: a Betha continua sendo consultada para evitar
      // que um snapshot vazio, parcial ou antigo congele os painéis sem disparar
      // /api/dashboard/*.
      const loadedFromSupabase=await loadDashboardFromSupabase(view,isActive);
      if (!isActive()) return;
      const loadedFromCache=loadedFromSupabase ? false : loadDashboardFromCache(view);

      if (loadedFromSupabase || loadedFromCache) {
        setStatus("waiting","Dados em cache exibidos · conferindo dados atuais da Betha...");
      } else {
        setStatus("waiting","Sem snapshot disponível · buscando dados da Betha...");
      }
    }

    if (!cfg.BACKEND_URL) return;
    setRefreshBusy(true);
    setDashboardLoading(true);
    setStatus("waiting", "Atualizando dados da Betha...");

    try {
      const health = await api("/api/health");
      if (!isActive()) return;
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

      // A Visão Geral não deve iniciar uma varredura pesada automaticamente em
      // cada navegador/dispositivo. Se já existe snapshot compartilhado/local,
      // ele é a leitura operacional e a atualização completa fica explícita no
      // botão ATUALIZAR. Os demais painéis continuam consultando suas rotas.
      const overviewHasSnapshot = view==="visao-geral" &&
        Boolean(readDashboardCache("visao-geral"));

      if(view==="visao-geral" && !force && overviewHasSnapshot){
        setDashboardLoading(false);
        const cached=readDashboardCache("visao-geral");
        if(cached?.payload) renderPayload(cached.payload);
        setLastUpdated(cached?.savedAt||null,"Snapshot");
        setStatus(
          cached?.state==="complete" ? "online" : "waiting",
          cached?.state==="complete"
            ? "Visão geral carregada do snapshot consolidado"
            : "Visão geral em snapshot parcial · use ATUALIZAR para continuar a sincronização"
        );
        return;
      }

      const payload = view === "visao-geral"
        ? await loadOverviewSharded(params,isActive)
        : await loadDashboardProgressively(view,params,isActive);

      if (!payload || !isActive()) return;

      renderPayload(payload);
      const audits=Object.values(payload?.meta?.sourceAudit||{});
      const complete=audits.length>0&&audits.every(a=>a.complete===true);
      saveDashboardCache(view, payload, complete?"complete":"partial");

      const warnings = payload && payload.meta && Array.isArray(payload.meta.warnings)
        ? payload.meta.warnings
        : [];

      const saved = readDashboardCache(view);
      const stamp = saved ? formatCacheTime(saved.savedAt) : "";
      setLastUpdated(saved?.savedAt || new Date().toISOString(),"Betha");

      if (warnings.length || !complete) {
        setStatus("waiting", "Atualizado " + stamp + " · carga parcial" + (warnings.length ? " · "+warnings.length+" fonte(s) com aviso" : ""));
      } else {
        setStatus("online", "Atualizado " + stamp + " · salvo localmente");
      }
    } catch (error) {
      if (!isActive()) return;
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
      if (isActive()) setRefreshBusy(false);
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
    for(const key of [String(source),...sourceKeyCandidates(source)]){
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
    if(value===null||value===undefined)return "—";
    if(format==="percent")return Number(value).toLocaleString("pt-BR",{maximumFractionDigits:2})+"%";
    if(value===null || value===undefined || value==="") return "—";
    if(format==="percent") return Number(value).toLocaleString("pt-BR",{maximumFractionDigits:2})+"%";
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
        const value=ds.data?.[index]??null;
        const percent=grand>0&&!data.nonAdditive ? (value/grand)*100 : null;
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
            <tr><th>Total exibido</th>${datasets.map((ds,i)=>`<th>${escapeHtml(data.nonAdditive?"—":valueDisplay(totals[i],data.format))}</th>`).join("")}</tr>
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
"pagamentos","dividas-receitas","parcelamentos-referentes","encerramento-dividas","encerramento-lancamentos","indexadores","bairros","distritos","obras-responsaveis","creditos-tributarios-receitas","transferencias-imoveis-compra",
    "pagamentos-detalhados-valores","pagamentos-detalhados",
    "debitos","debitos-receitas","dividas","parcelamentos","parcelamentos-parcelas","pagamentos-parcelamentos",
    "guias-unificadas","contribuintes","imoveis","imoveis-responsaveis","imoveis-corresponsaveis","economicos","economicos-atividades",
    "receitas","creditos-tributarios","indexadores-valores",
    "logradouros","imoveis-campos-adicionais","planta-valores","obras",
    "solicitacoes-transferencias-imoveis","solicitacoes-transferencias-imoveis-itens","solicitacoes-transferencias-imoveis-movimentacoes","transferencias-imoveis"
  ]);

  const DETAIL_RESOURCE_LABELS = Object.freeze({
"pagamentos":"Pagamentos","dividas-receitas":"Dividas receitas","parcelamentos-referentes":"Parcelamentos referentes","encerramento-dividas":"Encerramento dividas","encerramento-lancamentos":"Encerramento lancamentos","indexadores":"Indexador","bairros":"Bairro","distritos":"Distrito","obras-responsaveis":"Obras responsaveis","creditos-tributarios-receitas":"Creditos tributarios receitas","transferencias-imoveis-compra":"Transferencias imoveis compra",
    contribuintes:"Contribuintes",
    imoveis:"Imóveis",
    "imoveis-responsaveis":"Responsáveis dos imóveis",
    "imoveis-corresponsaveis":"Corresponsáveis dos imóveis",
    economicos:"Econômicos",
    "economicos-atividades":"Atividades dos econômicos",
    debitos:"Débitos",
    "debitos-receitas":"Receitas dos débitos",
    dividas:"Dívidas",
    parcelamentos:"Parcelamentos",
    "parcelamentos-parcelas":"Parcelas",
    "pagamentos-parcelamentos":"Pagamentos dos parcelamentos",
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
    "solicitacoes-transferencias-imoveis-movimentacoes":"Movimentações das solicitações",
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
          <thead><tr>${columns.map(col=>'<th>'+escapeHtml(col.label||col.key)+'</th>').join("")}${rows.some(row=>row?._drill)?'<th>Detalhar</th>':''}</tr></thead>
          <tbody>
            ${rows.map(row=>{
              const drill=row?._drill;
              const cells=columns.map(col=>'<td>'+escapeHtml(formatDetailCell(row[col.key],col.format))+'</td>').join("");
              const action=drill
                ? '<td><button type="button" class="btn-secondary-betha detail-row-drill" data-row-drill-resource="'+escapeHtml(drill.resource||"")+'" data-row-drill-key="'+escapeHtml(drill.filterKey||"")+'" data-row-drill-value="'+escapeHtml(drill.filterValue||"")+'" data-row-drill-label="'+escapeHtml(drill.label||"Detalhamento")+'"><span>Parcelas</span><i class="mdi mdi-chevron-right"></i></button></td>'
                : (rows.some(item=>item?._drill)?'<td></td>':'');
              return '<tr class="'+(drill?'detail-row-clickable':'')+'">'+cells+action+'</tr>';
            }).join("")}
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
    for(const table of currentPayload?.tables||[]){
      const columns=Array.isArray(table?.columns)?table.columns:[];
      for(const row of table?.rows||[]){
        columns.forEach((column,index)=>{
          rows.push({
            tipo:"Tabela",
            item:table.title||table.id||"Tabela",
            serie:column.label||column.id||"Valor",
            categoria:row.label??"",
            valor:summaryCellDisplay(row.values?.[index],column.format||"number"),
            fonte:def.localSample?"AMOSTRA LOCAL":"Painel"
          });
        });
      }
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
    const system=currentSystemInfo();
    const sampleMode=Boolean(dashboards[currentView]?.localSample);
    const header=["Tipo","Item","Série","Categoria","Valor","Fonte"].map(x=>csvEscape(x,separator)).join(separator);
    const body=rows.map(row=>[
      row.tipo,row.item,row.serie,row.categoria,row.valor,row.fonte
    ].map(value=>csvEscape(value,separator)).join(separator)).join("\r\n");
    const meta=[
      ["BI","BI Vella"],
      ["Entidade",entityLabel||tenantId||"Entidade"],
      ["Sistema",system?.name||system?.label||currentSystemId],
      ["Painel",dashboards[currentView]?.title||currentView],
      ["Modo de dados",sampleMode?"AMOSTRA LOCAL · DADOS DE TESTE · SEM CONSUMO DA API":"DADOS AUTORIZADOS"],
      ["Contexto",context.summary||"Padrão"]
    ].map(row=>row.map(value=>csvEscape(value,separator)).join(separator)).join("\r\n");
    const text=(extension==="csv"?"\uFEFF":"")+meta+"\r\n\r\n"+header+"\r\n"+body;
    const mime=extension==="csv"?"text/csv;charset=utf-8":"text/plain;charset=utf-8";
    const name=safeFilePart("bi-vella-"+(currentSystemInfo()?.name||currentSystemId)+"-"+(entityLabel||tenantId)+"-"+(dashboards[currentView]?.title||currentView));
    downloadBlob(text,mime,name+"."+extension);
    showToast(extension.toUpperCase()+" gerado com sucesso.");
  }

  async function fetchDetailExport(resource,maxRecords) {
    const exportQuery=detailQuerySnapshot;
    const exportTenant=tenantId;
    const columns=[];
    const rows=[];
    let offset=0;
    let first=true;
    const seen=new Set();

    while(rows.length<maxRecords && !seen.has(offset)){
      seen.add(offset);
      if(detailQuerySnapshot!==exportQuery||tenantId!==exportTenant) throw new Error("O detalhamento mudou durante a exportação.");
      const params=new URLSearchParams(exportQuery);
      params.set("limit","50");
      params.set("offset",String(offset));

      const payload=await api(
        detailApiUrl(resource,params),
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
      const activeSystem=currentSystemInfo();
      const systemName=String(activeSystem?.name||activeSystem?.label||currentSystemId||"Tributos");
      const sampleMode=Boolean(dashboards[currentView]?.localSample);
      const panelName=String(dashboards[currentView]?.title||"Painel");

      const drawHeader=(pageNo)=>{
        pdf.setFontSize(13);
        pdf.text("BI Vella | "+systemName+" / "+panelName,margin,8);
        pdf.setFontSize(8);
        pdf.text(String(entityLabel||tenantId||"Entidade"),margin,13);
        pdf.setTextColor(90);
        pdf.text((sampleMode?"AMOSTRA LOCAL · DADOS DE TESTE · ":"")+(context.summary||"Sem filtros adicionais"),margin,17);
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
          longPdf.text("BI Vella | "+systemName+" / "+panelName,margin,8);
          longPdf.setFontSize(8);
          longPdf.text(String(entityLabel||tenantId||"Entidade"),margin,13);
          longPdf.setTextColor(90);
          longPdf.text((sampleMode?"AMOSTRA LOCAL · DADOS DE TESTE · ":"")+(context.summary||"Sem filtros adicionais"),margin,17);
          longPdf.text("Página "+p,pageWidth-margin-18,17);
          longPdf.setTextColor(0);
          longPdf.addImage(imgData,"JPEG",margin,headerHeight-yOffset,usableWidth,imgHeight,undefined,"FAST");
          yOffset+=availableHeight;
          p++;
        }
        longPdf.save(
          safeFilePart("bi-vella-"+systemName+"-"+(entityLabel||tenantId)+"-"+panelName)+".pdf"
        );
      } else {
        pdf.save(
          safeFilePart("bi-vella-"+systemName+"-"+(entityLabel||tenantId)+"-"+panelName)+".pdf"
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

  function localDetailColumns(rows,system) {
    const configured=(localSampleDetailColumns[system]||[]).filter(([key])=>rows.some(row=>row?.[key]!==undefined));
    const fallback=[...new Set(rows.flatMap(row=>Object.keys(row)))].slice(0,8).map(key=>[key,key]);
    return (configured.length?configured:fallback).map(([key,label])=>({
      key,
      label,
      format:["valorEmpenhado","valorLiquidado","valorPago","valorEstimado","valorHomologado","bruto","descontos","liquido","encargos","beneficioValor","receitaPrevista","receitaArrecadada","restosPagar"].includes(key)?"currency":"text"
    }));
  }

  function setLocalDetailExport(title,rows,system=currentSystemId) {
    currentLocalDetailExport={
      title:title||"Detalhamento",
      system:String(system||currentSystemId),
      columns:localDetailColumns(rows,system),
      rows:rows.slice()
    };
    const actions=document.getElementById("drawerExportActions");
    if(actions) actions.hidden=!rows.length;
  }

  async function currentDetailExportPayload(maxRecords) {
    if(currentLocalDetailExport){
      const rows=currentLocalDetailExport.rows.slice(0,maxRecords);
      return {
        resource:"amostra-local",
        columns:currentLocalDetailExport.columns,
        rows,
        truncated:currentLocalDetailExport.rows.length>rows.length,
        maxRecords,
        sampleMode:true
      };
    }
    if(!currentDetailResource) return null;
    return fetchDetailExport(currentDetailResource,maxRecords);
  }

  function detailExportContext() {
    const params=new URLSearchParams(detailQuerySnapshot);
    const labels={detailSearch:"Busca",detailField:"Campo",detailValue:"Valor",detailDateField:"Data",detailFrom:"De",detailTo:"Até",parcelamentoId:"Parcelamento"};
    const parts=[params.get("periodo")==="todos"?"Todos os exercícios":exportContextLabel().summary];
    for(const [key,label] of Object.entries(labels)) if(params.get(key)) parts.push(label+": "+params.get(key));
    return {summary:parts.filter(Boolean).join(" · ")};
  }

  async function exportDetailCsv() {
    if(!currentDetailResource&&!currentLocalDetailExport) return;
    setExportBusy(true);
    try{
      const payload=await currentDetailExportPayload(10000);
      if(!payload) return;
      const context=detailExportContext();
      const systemName=currentSystemInfo()?.name||currentSystemId;
      const meta=payload.sampleMode
        ? [
            ["BI","BI Vella"],
            ["Entidade",entityLabel||tenantId||"Entidade"],
            ["Sistema",systemName],
            ["Detalhamento",currentDetailTitle],
            ["Modo de dados","AMOSTRA LOCAL · DADOS DE TESTE · SEM CONSUMO DA API"],
            ["Contexto",context.summary||"Padrão"]
          ].map(row=>row.map(value=>csvEscape(value,";")).join(";")).join("\r\n")+"\r\n\r\n"
        : "";
      const text="\uFEFF"+meta+exportRowsText(payload,";");
      const resource=currentLocalDetailExport?"amostra-local":currentDetailResource;
      const name=safeFilePart("bi-vella-"+systemName+"-"+(entityLabel||tenantId)+"-"+currentDetailTitle+"-"+resource);
      downloadBlob(text,"text/csv;charset=utf-8",name+".csv");
    }catch(error){
      console.error("detail csv export",error);
      window.alert("Não foi possível exportar o CSV.");
    }finally{
      setExportBusy(false);
    }
  }

  async function exportDetailTxt() {
    if(!currentDetailResource&&!currentLocalDetailExport) return;
    setExportBusy(true);
    try{
      const payload=await currentDetailExportPayload(10000);
      if(!payload) return;
      const context=detailExportContext();
      const systemName=currentSystemInfo()?.name||currentSystemId;
      const meta=[
        "BI Vella",
        "Entidade: "+(entityLabel||tenantId||""),
        "Sistema: "+systemName,
        "Detalhamento: "+currentDetailTitle,
        "Modo de dados: "+(payload.sampleMode?"AMOSTRA LOCAL · DADOS DE TESTE · SEM CONSUMO DA API":"DADOS AUTORIZADOS"),
        "Período/Filtros: "+(context.summary||""),
        "Registros exportados: "+payload.rows.length+(payload.truncated?" (limite atingido)":""),
        ""
      ].join("\r\n");
      const resource=currentLocalDetailExport?"amostra-local":currentDetailResource;
      const name=safeFilePart("bi-vella-"+systemName+"-"+(entityLabel||tenantId)+"-"+currentDetailTitle+"-"+resource);
      downloadBlob("\uFEFF"+meta+exportRowsText(payload,"\t"),"text/plain;charset=utf-8",name+".txt");
    }catch(error){
      console.error("detail txt export",error);
      window.alert("Não foi possível exportar o TXT.");
    }finally{
      setExportBusy(false);
    }
  }

  async function exportDetailPdf() {
    if((!currentDetailResource&&!currentLocalDetailExport) || !window.jspdf?.jsPDF) return;
    setExportBusy(true);
    try{
      const payload=await currentDetailExportPayload(1000);
      if(!payload) return;
      const {jsPDF}=window.jspdf;
      const pdf=new jsPDF({orientation:"landscape",unit:"mm",format:"a4"});
      const context=detailExportContext();
      const systemName=currentSystemInfo()?.name||currentSystemId;
      const columns=payload.columns||[];
      const head=[columns.map(col=>col.label||col.key)];
      const body=payload.rows.map(row=>columns.map(col=>formatDetailCell(row[col.key],col.format)));

      pdf.setFontSize(13);
      pdf.text("BI Vella | "+systemName+" / "+(currentDetailTitle||"Detalhamento"),10,10);
      pdf.setFontSize(8);
      pdf.text(String(entityLabel||tenantId||"Entidade"),10,15);
      pdf.setTextColor(90);
      pdf.text((payload.sampleMode?"AMOSTRA LOCAL · DADOS DE TESTE · ":"")+(context.summary||"Sem filtros adicionais"),10,19);
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

      const resource=currentLocalDetailExport?"amostra-local":currentDetailResource;
      const name=safeFilePart("bi-vella-"+systemName+"-"+(entityLabel||tenantId)+"-"+currentDetailTitle+"-"+resource);
      pdf.save(name+".pdf");
    }catch(error){
      console.error("detail pdf export",error);
      window.alert("Não foi possível exportar o PDF do detalhamento.");
    }finally{
      setExportBusy(false);
    }
  }

  function installmentSummaryHtml(payload) {
    if(payload?.resource!=="parcelamentos-parcelas") return "";
    const rows=Array.isArray(payload?.rows)?payload.rows:[];
    if(!rows.length) return "";
    const money=value=>{
      const n=Number(value);
      return Number.isFinite(n)?n:0;
    };
    const total=rows.reduce((sum,row)=>sum+money(row.valor),0);
    const descontos=rows.reduce((sum,row)=>sum+money(row.desconto),0);
    const paidRows=rows.filter(row=>row.pagamento||/pago|quitad/i.test(String(row.situacao||"")));
    const paid=paidRows.reduce((sum,row)=>sum+money(row.valor),0);
    const open=Math.max(0,total-paid);
    const overdue=rows.filter(row=>{
      if(row.pagamento||/pago|quitad|cancel/i.test(String(row.situacao||""))) return false;
      const due=new Date(row.vencimento);
      return !Number.isNaN(due.getTime())&&due.getTime()<Date.now();
    });
    const overdueValue=overdue.reduce((sum,row)=>sum+money(row.valor),0);
    const currency=value=>Number(value||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
    return `
      <section class="detail-installment-summary">
        <div class="detail-stat"><span>Parcelas exibidas</span><strong>${rows.length.toLocaleString("pt-BR")}</strong></div>
        <div class="detail-stat"><span>Valor das parcelas</span><strong>${escapeHtml(currency(total))}</strong></div>
        <div class="detail-stat"><span>Pago</span><strong>${escapeHtml(currency(paid))}</strong></div>
        <div class="detail-stat"><span>Em aberto</span><strong>${escapeHtml(currency(open))}</strong></div>
        <div class="detail-stat"><span>Vencidas</span><strong>${overdue.length.toLocaleString("pt-BR")} · ${escapeHtml(currency(overdueValue))}</strong></div>
        <div class="detail-stat"><span>Descontos</span><strong>${escapeHtml(currency(descontos))}</strong></div>
      </section>
      <p class="detail-summary-note">Resumo calculado sobre as parcelas exibidas nesta página do analítico.</p>
    `;
  }

  let detailLoadGeneration=0;
  let detailQuerySnapshot="";
  let detailPageOffsets=[];
  function detailRequestParams(container,offset,qualityIssue) {
    const linked=Boolean(container.dataset.relationValue);
    if(container.dataset.panelSnapshot){
      const frozen=new URLSearchParams(container.dataset.panelSnapshot);frozen.set("offset",String(offset||0));frozen.set("limit","25");
      for(const input of container.querySelectorAll("[data-detail-param]"))if(input.value.trim())frozen.set(input.dataset.detailParam,input.value.trim());
      return frozen;
    }
    const params=new URLSearchParams({periodo:linked?"todos":document.getElementById("periodo")?.value||"todos",exercicio:document.getElementById("exercicio")?.value||String(new Date().getFullYear()),limit:"25",offset:String(offset||0)});
    if(!linked) for(const [key,value] of Object.entries(currentDashboardFilters())) params.set(key,value);
    if(qualityIssue) params.set("qualityIssue",qualityIssue);
    let chartFilters={};try {chartFilters=JSON.parse(container.dataset.chartFilters||"{}");} catch {}
    for(const [key,value] of Object.entries(chartFilters)) {
      if(params.has(key)&&params.get(key)!==String(value)) params.set("detailNoMatch","1");
      else params.set(key,String(value));
    }
    for(const input of container.querySelectorAll("[data-detail-param]")) if(input.value.trim()) params.set(input.dataset.detailParam,input.value.trim());
    if(linked) params.set(container.dataset.relationKey,container.dataset.relationValue);
    return params;
  }
  function analyticFilterControls(payload,params) {
    const columns=payload.columns||[];
    const fields=columns.filter(column=>column.format!=="date");
    const dates=columns.filter(column=>column.format==="date");
    const input=(key,label,type="text")=>'<label>'+label+'<input type="'+type+'" data-detail-param="'+key+'" value="'+escapeHtml(params.get(key)||"")+'"></label>';
    return '<div class="detail-micro-filters">'+input("detailSearch","Pesquisar nos registros","search")+
      '<label>Campo<select data-detail-param="detailField"><option value="">Todos os campos</option>'+fields.map(column=>'<option value="'+escapeHtml(column.key)+'" '+(params.get("detailField")===column.key?'selected':'')+'>'+escapeHtml(column.label)+'</option>').join('')+'</select></label>'+input("detailValue","Valor do campo")+
      (dates.length?'<label>Data de referência<select data-detail-param="detailDateField">'+dates.map(column=>'<option value="'+escapeHtml(column.key)+'" '+(params.get("detailDateField")===column.key?'selected':'')+'>'+escapeHtml(column.label)+'</option>').join('')+'</select></label>'+input("detailFrom","De","date")+input("detailTo","Até","date"):'')+
      '<button class="btn-primary-betha" type="button" data-apply-detail-filters>APLICAR FILTROS</button><button class="btn-secondary-betha" type="button" data-clear-detail-filters>LIMPAR</button></div>';
  }
  async function loadDetailRecords(resource,offset=0,qualityIssue="") {
    const container=document.querySelector("[data-detail-container]");
    if(!container) return;
    const generation=++detailLoadGeneration;
    const activeTenant=tenantId;
    const isActive=()=>generation===detailLoadGeneration&&container.isConnected&&activeTenant===tenantId;
    // Capture values before replacing the form with its loading state.
    const params=detailRequestParams(container,offset,qualityIssue);
    detailQuerySnapshot=params.toString();
    if(offset===0) detailPageOffsets=[];
    if(!detailPageOffsets.includes(offset)) detailPageOffsets.push(offset);
    currentDetailPayload=null;
    document.getElementById("drawerExportActions").hidden=true;
    container.innerHTML='<div class="detail-empty-state compact"><i class="mdi mdi-loading mdi-spin"></i><span>Consultando registros autorizados…</span></div>';
    try {
      let payload;
      let scanOffset=offset;
      const seen=new Set();
      do {
        if(seen.has(scanOffset)) throw new Error("A fonte não avançou na paginação.");
        seen.add(scanOffset);
        params.set("offset",String(scanOffset));
        payload=await api(detailApiUrl(resource,params),{timeoutMs:30000});
        if(!isActive()) return;
        if(!payload.pagination?.searching) break;
        scanOffset=Number(payload.pagination.nextOffset);
        container.innerHTML='<div class="detail-empty-state compact"><i class="mdi mdi-loading mdi-spin"></i><span>Procurando registros vinculados ao recorte… '+scanOffset.toLocaleString("pt-BR")+' registros consultados.</span><button type="button" class="btn-secondary-betha" data-stop-detail>INTERROMPER BUSCA</button></div>';
        container.querySelector("[data-stop-detail]")?.addEventListener("click",()=>{detailLoadGeneration++;container.innerHTML='<div class="detail-empty-state compact">Busca interrompida antes de concluir a consulta.</div>';});
      } while(isActive());
      if(!isActive()) return;
      currentDetailPayload=payload;
      currentDetailResource=resource;
      currentDetailTitle=document.getElementById("drawerTitle")?.textContent||resource;
      document.getElementById("drawerExportActions").hidden=false;
      const pagination=payload.pagination||{};
      const pageIndex=detailPageOffsets.indexOf(offset);
      const linked=Boolean(container.dataset.relationValue);
      const localSummary=[params.get("detailSearch"),params.get("detailValue"),params.get("detailFrom"),params.get("detailTo")].filter(Boolean).map(escapeHtml).join(" · ");
      container.innerHTML=(linked?'<div class="detail-context-bar"><strong>Parcelamento '+escapeHtml(container.dataset.relationValue)+' · Todos os exercícios</strong><button type="button" class="btn-secondary-betha" data-parent-detail>VOLTAR AOS PARCELAMENTOS</button></div>':container.dataset.panelSnapshot?'<p class="detail-filter-summary">Recorte preservado do gráfico · '+escapeHtml(new URLSearchParams(container.dataset.panelSnapshot).get('panelCategory')||'Todas as categorias')+(payload.partial?' · Carga parcial':'')+'</p>':detailContextHtml())+(payload.note?'<p class="detail-summary-note">'+escapeHtml(payload.note)+'</p>':'')+(localSummary?'<p class="detail-filter-summary">Filtros do analítico: '+localSummary+'</p>':'')+installmentSummaryHtml(payload)+analyticFilterControls(payload,params)+detailPageTable(payload)+
        '<div class="detail-pagination"><div class="detail-page-summary"><strong>Página '+(pageIndex+1)+'</strong><span>'+Number(pagination.loaded||0).toLocaleString("pt-BR")+' registro(s) exibidos</span></div><div class="detail-page-actions">'+
        (pageIndex>0?'<button class="btn-secondary-betha" type="button" data-prev-detail>ANTERIOR</button>':'')+
        (pagination.hasMore?'<button class="btn-secondary-betha" type="button" data-next-detail>PRÓXIMA</button>':'')+'</div></div>';
      container.querySelector("[data-prev-detail]")?.addEventListener("click",()=>loadDetailRecords(resource,detailPageOffsets[pageIndex-1],qualityIssue));
      container.querySelector("[data-next-detail]")?.addEventListener("click",()=>loadDetailRecords(resource,Number(pagination.nextOffset),qualityIssue));
      container.querySelector("[data-apply-detail-filters]")?.addEventListener("click",()=>loadDetailRecords(resource,0,qualityIssue));
      container.querySelector("[data-clear-detail-filters]")?.addEventListener("click",()=>{container.querySelectorAll("[data-detail-param]").forEach(input=>input.value="");loadDetailRecords(resource,0,qualityIssue);});
      container.querySelector("[data-parent-detail]")?.addEventListener("click",()=>{delete container.dataset.relationKey;delete container.dataset.relationValue;container.innerHTML="";loadDetailRecords("parcelamentos",0,qualityIssue);});
      container.querySelectorAll("[data-row-drill-resource]").forEach(button=>button.addEventListener("click",()=>{
        container.dataset.relationKey=button.dataset.rowDrillKey||"";
        container.dataset.relationValue=button.dataset.rowDrillValue||"";
        container.innerHTML="";
        loadDetailRecords(button.dataset.rowDrillResource,0,qualityIssue);
      }));
      container.querySelectorAll("input[data-detail-param]").forEach(input=>input.addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();loadDetailRecords(resource,0,qualityIssue);}}));
    } catch(error) {
      if(isActive()) container.innerHTML='<div class="detail-empty-state compact"><strong>Detalhamento indisponível</strong><span>'+escapeHtml(error.message||"Falha na consulta")+'</span></div>';
    }
  }

  const localSampleDetailColumns={
    contabil:[
      ["data","Data"],["empenho","Empenho"],["unidade","Unidade"],["credor","Credor"],
      ["natureza","Natureza"],["valorEmpenhado","Empenhado"],["valorLiquidado","Liquidado"],["valorPago","Pago"],["status","Situação"]
    ],
    compras:[
      ["processo","Processo"],["modalidade","Modalidade"],["secretaria","Secretaria"],["fornecedor","Fornecedor"],
      ["objeto","Objeto"],["valorEstimado","Estimado"],["valorHomologado","Homologado"],["status","Situação"]
    ],
    folha:[
      ["servidor","Servidor"],["secretaria","Secretaria"],["vinculo","Vínculo"],["cargo","Cargo"],
      ["bruto","Bruto"],["descontos","Descontos"],["liquido","Líquido"],["status","Situação"]
    ]
  };

  function localSampleDetailValue(key,value) {
    if(value===null||value===undefined||value==="") return "—";
    if(["valorEmpenhado","valorLiquidado","valorPago","valorEstimado","valorHomologado","bruto","descontos","liquido","encargos","beneficioValor","receitaPrevista","receitaArrecadada","restosPagar"].includes(key)){
      return formatValue(Number(value)||0,"currency");
    }
    if(/^\d{4}-\d{2}-\d{2}/.test(String(value))){
      const date=new Date(String(value)+"T00:00:00");
      if(!Number.isNaN(date.getTime())) return date.toLocaleDateString("pt-BR");
    }
    return String(value);
  }

  function localSampleDetailTable(rows,system) {
    const configured=(localSampleDetailColumns[system]||[]).filter(([key])=>rows.some(row=>row?.[key]!==undefined));
    const columns=configured.length?configured:[...new Set(rows.flatMap(row=>Object.keys(row)))].slice(0,8).map(key=>[key,key]);
    return '<div class="detail-table-wrap"><table class="detail-table"><thead><tr>'+
      columns.map(([,label])=>'<th>'+escapeHtml(label)+'</th>').join("")+
      '</tr></thead><tbody>'+
      rows.slice(0,100).map(row=>'<tr>'+
        columns.map(([key])=>'<td>'+escapeHtml(localSampleDetailValue(key,row?.[key]))+'</td>').join("")+
      '</tr>').join("")+
      '</tbody></table></div>';
  }

  function openLocalSampleSummaryDetail(tableId,key,label) {
    const def=dashboards[currentView];
    if(!def?.localSample) return;
    const tableDef=(def.summaryTables||[]).find(table=>String(table.id)===String(tableId));
    if(!tableDef?.group) return;
    const rows=(localSampleDetailRowsByView.get(currentView)||[])
      .filter(row=>String(row?.[tableDef.group]??"Não informado")===String(key));
    const activeSystem=currentSystemInfo();
    openDrawer(tableDef.title||"Detalhamento",`
      <section class="drawer-section detail-hero local-sample-detail-hero">
        <small>AMOSTRA LOCAL · SEM CONSUMO DA API</small>
        <strong class="detail-hero-value">${escapeHtml(label||key||"Categoria")}</strong>
        <span>${rows.length.toLocaleString("pt-BR")} registro(s) neste agrupamento · filtros atuais preservados</span>
      </section>
      <section class="drawer-section">
        <h3>Registros da amostra</h3>
        <p>Detalhamento do agrupamento selecionado em ${escapeHtml(activeSystem?.name||currentSystemId)}.</p>
        ${rows.length?localSampleDetailTable(rows,currentSystemId):'<div class="detail-empty-state compact"><strong>Nenhum registro</strong><span>Não há linhas para o recorte atual.</span></div>'}
      </section>
    `);
    setLocalDetailExport(tableDef.title||"Detalhamento",rows,currentSystemId);
  }

  function localSampleRowsForKpi(kpi) {
    const rows=localSampleDetailRowsByView.get(currentView)||[];
    return localSampleWhere(rows,kpi?.sample?.where);
  }

  function openLocalSampleKpiDetail(kpi) {
    const def=dashboards[currentView];
    if(!def?.localSample) return;
    const rows=localSampleRowsForKpi(kpi);
    const raw=currentPayload?.kpis?.[kpi.id];
    const activeSystem=currentSystemInfo();
    openDrawer(kpi.label,`
      <section class="drawer-section detail-hero local-sample-detail-hero">
        <small>AMOSTRA LOCAL · SEM CONSUMO DA API</small>
        <strong class="detail-hero-value">${escapeHtml(formatValue(raw,kpi.format))}</strong>
        <span>${escapeHtml(kpi.label)} · ${rows.length.toLocaleString("pt-BR")} registro(s) no recorte atual</span>
      </section>
      <section class="drawer-section">
        <h3>Registros que compõem o indicador</h3>
        <p>Detalhamento local de ${escapeHtml(activeSystem?.name||currentSystemId)}, preservando período, exercício e filtros selecionados.</p>
        ${rows.length?localSampleDetailTable(rows,currentSystemId):'<div class="detail-empty-state compact"><strong>Nenhum registro</strong><span>Não há linhas para o recorte atual.</span></div>'}
      </section>
    `);
    setLocalDetailExport(kpi.label,rows,currentSystemId);
  }

  function localSampleRowsForChart(chartDef,selected) {
    const rows=localSampleDetailRowsByView.get(currentView)||[];
    const spec=chartDef?.sample||{};
    let scoped=localSampleWhere(rows,spec.where);
    const group=spec.group;
    if(group&&selected?.label!==undefined&&selected?.label!==null){
      const label=String(selected.label);
      scoped=scoped.filter(row=>String(row?.[group]??"Não informado")===label);
    }
    return scoped;
  }

  function openLocalSampleChartDetail(chartDef,selected) {
    const def=dashboards[currentView];
    if(!def?.localSample) return;
    const resolved=displayChartDefinition(chartDef);
    const data=currentPayload?.charts?.[resolved.id]||currentPayload?.charts?.[chartDef.id];
    const rows=localSampleRowsForChart(resolved,selected);
    const activeSystem=currentSystemInfo();
    const selectedSummary=selected?.datasets?.length
      ? '<div class="detail-summary-grid">'+selected.datasets.map(item=>
          '<div class="detail-stat"><span>'+escapeHtml(item.label||resolved.title)+'</span><strong>'+escapeHtml(fullChartValue(item.value,data?.format||resolved?.sample?.format))+'</strong></div>'
        ).join("")+'</div>'
      : "";
    openDrawer(resolved.title,`
      <section class="drawer-section detail-hero local-sample-detail-hero">
        <small>AMOSTRA LOCAL · SEM CONSUMO DA API</small>
        <strong class="detail-hero-value">${escapeHtml(selected?.label||resolved.title)}</strong>
        <span>${rows.length.toLocaleString("pt-BR")} registro(s) neste recorte · filtros atuais preservados</span>
      </section>
      ${selectedSummary?'<section class="drawer-section"><h3>Valores selecionados</h3>'+selectedSummary+'</section>':""}
      <section class="drawer-section">
        <h3>Registros da amostra</h3>
        <p>Detalhamento local de ${escapeHtml(activeSystem?.name||currentSystemId)} para o ponto selecionado do gráfico.</p>
        ${rows.length?localSampleDetailTable(rows,currentSystemId):'<div class="detail-empty-state compact"><strong>Nenhum registro</strong><span>Não há linhas para este ponto do gráfico.</span></div>'}
      </section>
    `);
    setLocalDetailExport(resolved.title,rows,currentSystemId);
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

    if(detailResource){
      loadDetailRecords(detailResource,0,detailIssue);
    }
  }

  function openApiPanelDetail(chartDef,selected) {
    const data=currentPayload?.charts?.[chartDef.id];
    const snapshot=currentPayload?.meta?.snapshot;
    if(!snapshot){showToast("Aguarde a primeira consulta para detalhar.");return;}
    const params=new URLSearchParams({periodo:document.getElementById("periodo").value,exercicio:document.getElementById("exercicio").value,loadId:snapshot.loadId,cursor:JSON.stringify(snapshot.cursor)});
    if(snapshot.cacheJob)params.set("cacheJob",snapshot.cacheJob);
    if(snapshot.cachePages)params.set("cachePages",JSON.stringify(snapshot.cachePages));
    for(const [k,v]of Object.entries(currentDashboardFilters()))params.set(k,v);
    if(selected?.label)params.set("panelCategory",selected.label);
    const resource="panel~"+chartDef.apiSource+"~"+chartDef.apiPanel;
    openDrawer(chartDef.title,'<section class="drawer-section"><p>'+escapeHtml(data?.note||"Registros que compõem o indicador, com os filtros deste painel.")+'</p>'+(selected?.label?'<p><strong>Categoria: '+escapeHtml(selected.label)+'</strong></p>':'')+chartSeriesTable(chartDef,data)+'</section><section class="drawer-section"><h3>Registros do indicador</h3><div data-detail-container data-detail-resource="'+escapeHtml(resource)+'"></div></section>');
    const container=document.querySelector("[data-detail-container]");container.dataset.panelSnapshot=params.toString();
    loadDetailRecords(resource,0);
  }
  function detailApiUrl(resource,params) {
    if(resource.startsWith("panel~")){const [,source,panel]=resource.split("~");return apiPanelPath(source)+"/detail/"+encodeURIComponent(panel)+"?"+params.toString();}
    return "/api/detail/"+encodeURIComponent(resource)+"?"+params.toString();
  }

  function openChartDetail(chartDef, selected) {
    if(dashboards[currentView]?.localSample){openLocalSampleChartDetail(chartDef,selected);return;}
    if(chartDef.apiPanel){openApiPanelDetail(chartDef,selected);return;}
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

    const container=document.querySelector("[data-detail-container]");
    if(container) container.dataset.chartFilters=JSON.stringify({...chartDef.detailFilters,...selected?.filters});
    const detailResource=detailResourceFor(chartDef.source,chartDef.drill);
    if(detailResource){
      loadDetailRecords(detailResource,0);
    }
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

  const drawerFocusReturn=new Map();

  function drawerFocusable(drawer) {
    if(!drawer) return [];
    return [...drawer.querySelectorAll(
      'button:not([disabled]):not([hidden]),a[href],input:not([disabled]):not([hidden]),select:not([disabled]):not([hidden]),textarea:not([disabled]):not([hidden]),[tabindex]:not([tabindex="-1"]):not([hidden])'
    )].filter(element=>element.getClientRects().length>0);
  }

  function activateDrawer(id,preferredSelector="") {
    const drawer=document.getElementById(id);
    if(!drawer) return;
    if(!drawer.classList.contains("open")) drawerFocusReturn.set(id,document.activeElement);
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden","false");
    document.getElementById("drawerBackdrop").hidden=false;
    document.body.classList.add("drawer-open");
    requestAnimationFrame(()=>{
      const preferred=preferredSelector?drawer.querySelector(preferredSelector):null;
      const first=preferred||drawerFocusable(drawer)[0]||drawer;
      first?.focus?.({preventScroll:true});
    });
  }

  function openDrawer(title, html) {
    detailLoadGeneration++;
    detailQuerySnapshot="";
    detailPageOffsets=[];
    currentDetailPayload=null;
    currentDetailResource="";
    currentLocalDetailExport=null;
    currentDetailTitle=title||"Detalhamento";
    const exportActions=document.getElementById("drawerExportActions");
    if(exportActions) exportActions.hidden=true;
    document.getElementById("drawerTitle").textContent = title;
    const drawerContext=document.getElementById("drawerContext");
    if(drawerContext){
      const context=exportContextLabel();
      const systemName=currentSystemInfo()?.name||currentSystemId;
      drawerContext.textContent=[entityLabel||tenantId||"Entidade",systemName,context.period,context.exercise].filter(Boolean).join(" · ");
    }
    document.getElementById("drawerBody").innerHTML = html;
    activateDrawer("detailDrawer","#closeDrawer");
  }

  function closeDrawer(id) {
    const drawer=document.getElementById(id);
    if(!drawer||!drawer.classList.contains("open")) return;
    if(id==="detailDrawer") detailLoadGeneration++;
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden","true");
    const openDrawers=[...document.querySelectorAll(".detail-drawer.open")];
    const anyOpen=openDrawers.at(-1);
    if (!anyOpen) {
      document.getElementById("drawerBackdrop").hidden = true;
      document.body.classList.remove("drawer-open");
    }
    const previous=drawerFocusReturn.get(id);
    drawerFocusReturn.delete(id);
    if(anyOpen){
      requestAnimationFrame(()=>drawerFocusable(anyOpen)[0]?.focus?.({preventScroll:true}));
    }else if(previous&&document.contains(previous)){
      requestAnimationFrame(()=>previous.focus?.({preventScroll:true}));
    }
  }

  document.addEventListener("keydown",event=>{
    const openDrawers=[...document.querySelectorAll(".detail-drawer.open")];
    const drawer=openDrawers.at(-1);
    if(!drawer) return;
    if(event.key==="Escape"){
      event.preventDefault();
      event.stopPropagation();
      closeDrawer(drawer.id);
      return;
    }
    if(event.key!=="Tab") return;
    const focusable=drawerFocusable(drawer);
    if(!focusable.length){
      event.preventDefault();
      drawer.focus();
      return;
    }
    const first=focusable[0];
    const last=focusable[focusable.length-1];
    if(event.shiftKey&&document.activeElement===first){
      event.preventDefault();
      last.focus();
    }else if(!event.shiftKey&&document.activeElement===last){
      event.preventDefault();
      first.focus();
    }else if(!drawer.contains(document.activeElement)){
      event.preventDefault();
      first.focus();
    }
  },true);

  const summaryTableGrid=document.getElementById("tableGrid");
  const handleSummaryTableDrill=(event)=>{
    const row=event.target.closest(".summary-table-row-drill");
    if(!row) return;
    if(event.type==="keydown"&&!["Enter"," "].includes(event.key)) return;
    if(event.type==="keydown") event.preventDefault();
    openLocalSampleSummaryDetail(row.dataset.summaryTable,row.dataset.summaryKey,row.dataset.summaryLabel);
  };
  summaryTableGrid?.addEventListener("click",handleSummaryTableDrill);
  summaryTableGrid?.addEventListener("keydown",handleSummaryTableDrill);

  document.getElementById("drawerBody").addEventListener("click",(event)=>{
    const loadButton=event.target.closest("[data-load-detail]");
    if(loadButton){
      const container=document.querySelector("[data-detail-container]");
      if(container){delete container.dataset.relationKey;delete container.dataset.relationValue;container.innerHTML="";}
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
    const openDrawers=[...document.querySelectorAll(".detail-drawer.open")];
    const drawer=openDrawers.at(-1);
    if(drawer) closeDrawer(drawer.id);
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
    activateDrawer("integrationDrawer","#closeIntegration");

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
  const sidebarEntityButton=document.getElementById("sidebarEntityButton");
  const sidebarEntityMenu=document.getElementById("sidebarEntityMenu");
  const sidebarEntityContext=document.getElementById("sidebarEntityContext");
  const sidebarEntityList=document.getElementById("sidebarEntityList");
  entityButton.addEventListener("click", async () => {
    const opening=entityMenu.hidden;
    entityMenu.hidden=!opening;
    if(!opening) return;

    entityButton.setAttribute("aria-busy","true");
    try {
      // Atualiza a lista na abertura para refletir prefeituras cadastradas
      // ou permissões concedidas depois do login atual.
      await loadTenants();
      entityMenu.hidden=false;
    } catch(error) {
      console.warn("Falha ao atualizar lista de entidades:",error);
      entityMenu.hidden=false;
    } finally {
      entityButton.removeAttribute("aria-busy");
    }
  });

  sidebarEntityButton?.addEventListener("click",async event=>{
    event.stopPropagation();
    if(!sidebarEntityMenu) return;
    const opening=sidebarEntityMenu.hidden;
    sidebarEntityMenu.hidden=!opening;
    sidebarEntityButton.setAttribute("aria-expanded",String(opening));
    if(!opening) return;
    sidebarEntityButton.setAttribute("aria-busy","true");
    try{
      await loadTenants();
      sidebarEntityMenu.hidden=false;
    }catch(error){
      console.warn("Falha ao atualizar entidades no sidebar:",error);
      sidebarEntityMenu.hidden=false;
    }finally{
      sidebarEntityButton.removeAttribute("aria-busy");
    }
  });

  const systemButton=document.getElementById("systemButton");
  const systemMenu=document.getElementById("systemMenu");
  const systemList=document.getElementById("systemList");
  const systemRailList=document.getElementById("systemRailList");
  const sidebarSystemMenuLabel=document.getElementById("sidebarSystemMenuLabel");
  const mobileEntitySelect=document.getElementById("mobileEntitySelect");
  const mobileSystemSelect=document.getElementById("mobileSystemSelect");
  const mobilePanelSelect=document.getElementById("mobilePanelSelect");
  const systemContext=document.getElementById("systemContext");
  const systemHeaderContext=document.getElementById("systemHeaderContext");
  const systemHeaderSubtitle=document.getElementById("systemHeaderSubtitle");

  function currentSystemInfo() {
    return systems.find(system=>String(system.id)===String(currentSystemId)) || systems[0] || null;
  }

  function renderMobileEntitySelector() {
    if(!mobileEntitySelect) return;
    const tenants=Array.isArray(authorizedTenants)?authorizedTenants:[];
    mobileEntitySelect.innerHTML=tenants.length
      ? tenants.map(tenant=>'<option value="'+escapeHtml(String(tenant.id))+'"'+(String(tenant.id)===String(tenantId)?' selected':'')+'>'+escapeHtml(tenant.name||tenant.id)+'</option>').join("")
      : '<option value="">Sem entidade autorizada</option>';
    mobileEntitySelect.disabled=tenants.length<=1;
    if(tenantId&&tenants.some(tenant=>String(tenant.id)===String(tenantId))) mobileEntitySelect.value=String(tenantId);
  }

  function renderMobileSystemSelector() {
    if(!mobileSystemSelect) return;
    const available=accessibleSystemsForTenant();
    mobileSystemSelect.innerHTML=available.length ? available.map(system=>
      '<option value="'+escapeHtml(String(system.id))+'"'+(String(system.id)===String(currentSystemId)?' selected':'')+'>'+escapeHtml(system.name||system.label||system.id)+'</option>'
    ).join("") : '<option value="">Nenhum sistema autorizado</option>';
    mobileSystemSelect.disabled=available.length<=1;
    if(currentSystemId&&available.some(system=>String(system.id)===String(currentSystemId))) mobileSystemSelect.value=String(currentSystemId);
  }

  function renderMobilePanelSelector() {
    if(!mobilePanelSelect) return;
    const menu=Array.isArray(bethaApp.opcoes)?bethaApp.opcoes:[];
    const options=[];
    for(const item of menu){
      if(Array.isArray(item.submenus)&&item.submenus.length){
        for(const sub of item.submenus){
          const route=sub.rota||sub.id;
          if(route) options.push({route,label:sub.descricao||sub.label||route});
        }
      }else{
        const route=item.rota||item.id;
        if(route) options.push({route,label:item.descricao||item.label||route});
      }
    }
    if(ADMIN_VIEWS.has(currentView)&&!options.some(item=>item.route===currentView)){
      options.push({
        route:currentView,
        label:currentView==="usuarios-admin"?"Usuários":"Configurações"
      });
    }
    mobilePanelSelect.innerHTML=options.length
      ? options.map(item=>'<option value="'+escapeHtml(String(item.route))+'"'+(String(item.route)===String(currentView)?' selected':'')+'>'+escapeHtml(item.label)+'</option>').join("")
      : '<option value="">Nenhum painel disponível</option>';
    mobilePanelSelect.disabled=options.length<=1;
    if(options.some(item=>String(item.route)===String(currentView))) mobilePanelSelect.value=String(currentView);
  }

  function syncMobileContextSelectors() {
    renderMobileEntitySelector();
    renderMobileSystemSelector();
    renderMobilePanelSelector();
  }

  function tenantCanAccessSystem(system,tenant=currentTenantInfo()) {
    if(!system) return false;
    if(!tenant) return true;
    if(tenant.admin===true||tenant.technical===true) return true;
    const allowed=new Set(Array.isArray(tenant.allowedViews)?tenant.allowedViews:[]);
    return Object.entries(dashboards).some(([view,def])=>
      String(def?.system||"tributos")===String(system.id)&&allowed.has(view)
    );
  }

  function accessibleSystemsForTenant(tenant=currentTenantInfo()) {
    return systems.filter(system=>tenantCanAccessSystem(system,tenant));
  }

  function renderSystemSelector() {
    const active=currentSystemInfo();
    const activeName=String(active?.name||active?.label||active?.id||"Tributos");
    if(systemContext) systemContext.textContent=activeName.toUpperCase();
    if(sidebarSystemMenuLabel) sidebarSystemMenuLabel.textContent=activeName.toUpperCase();
    if(systemHeaderContext) systemHeaderContext.textContent=activeName.toUpperCase();
    if(systemHeaderSubtitle) systemHeaderSubtitle.textContent=String(active?.heading||"");
    const targets=[systemList,systemRailList].filter(Boolean);
    for(const target of targets) target.innerHTML="";
    renderMobileSystemSelector();
    for(const system of accessibleSystemsForTenant()){
      const icon=String(system.icon||"application-cog-outline");
      if(systemList){
        const button=document.createElement("button");
        button.type="button";
        button.className="entity-option system-option"+(String(system.id)===String(currentSystemId)?" is-current":"");
        button.innerHTML='<i class="mdi mdi-'+escapeHtml(icon)+'"></i><span>'+escapeHtml(system.name||system.label||system.id)+'</span>';
        button.addEventListener("click",()=>selectSystem(system));
        systemList.appendChild(button);
      }
      if(systemRailList){
        const rail=document.createElement("button");
        rail.type="button";
        rail.className="system-rail-option"+(String(system.id)===String(currentSystemId)?" is-current":"");
        rail.setAttribute("aria-current",String(system.id)===String(currentSystemId)?"page":"false");
        rail.innerHTML='<i class="mdi mdi-'+escapeHtml(icon)+'" aria-hidden="true"></i><span>'+escapeHtml(system.name||system.label||system.id)+'</span>';
        rail.addEventListener("click",()=>selectSystem(system));
        systemRailList.appendChild(rail);
      }
    }
  }

  function selectSystem(system) {
    if(!system||!system.id) return;
    if(!tenantCanAccessSystem(system)){
      showToast("Este sistema não possui painéis liberados para o seu acesso.");
      return;
    }
    const previous=String(currentSystemId||"");
    currentSystemId=String(system.id);
    renderSystemSelector();
    if(systemMenu) systemMenu.hidden=true;
    systemButton?.setAttribute("aria-expanded","false");

    const target=String(system.href||system.url||"").trim();
    if(target && previous!==currentSystemId){
      const next=new URL(target,location.href);
      if(tenantId) next.searchParams.set("tenant",tenantId);
      if(entityLabel) next.searchParams.set("entidade",entityLabel);
      next.searchParams.set("sistema",currentSystemId);
      location.assign(next.toString());
      return;
    }

    const url=new URL(location.href);
    url.searchParams.set("sistema",currentSystemId);
    url.searchParams.set("view",system.homeView||DEFAULT_VIEW);
    history.replaceState({},"",url);

    currentView=system.homeView||DEFAULT_VIEW;
    applyNavigationPermissions(currentTenantInfo());
    navigate(currentView);
    if(previous && previous!==currentSystemId) showToast("Sistema alterado para "+(system.name||system.id)+".");
  }

  renderSystemSelector();
  syncMobileContextSelectors();

  mobileEntitySelect?.addEventListener("change",()=>{
    const tenant=authorizedTenants.find(item=>String(item.id)===String(mobileEntitySelect.value));
    if(tenant) applyTenantInPlace(tenant,true);
  });
  mobileSystemSelect?.addEventListener("change",()=>{
    const system=systems.find(item=>String(item.id)===String(mobileSystemSelect.value));
    if(system) selectSystem(system);
  });
  mobilePanelSelect?.addEventListener("change",()=>{
    const view=String(mobilePanelSelect.value||"");
    if(view&&isViewAllowed(view)) navigate(view);
  });

  systemButton?.addEventListener("click",event=>{
    event.stopPropagation();
    if(entityMenu) entityMenu.hidden=true;
    if(!systemMenu) return;
    const opening=systemMenu.hidden;
    systemMenu.hidden=!opening;
    systemButton.setAttribute("aria-expanded",String(opening));
  });

  document.addEventListener("keydown",event=>{
    if(event.key!=="Escape") return;
    if(sidebarEntityMenu&&!sidebarEntityMenu.hidden){
      sidebarEntityMenu.hidden=true;
      sidebarEntityButton?.setAttribute("aria-expanded","false");
      sidebarEntityButton?.focus();
    }
    if(entityMenu&&!entityMenu.hidden){
      entityMenu.hidden=true;
      entityButton?.focus();
    }
    if(systemMenu&&!systemMenu.hidden){
      systemMenu.hidden=true;
      systemButton?.setAttribute("aria-expanded","false");
      systemButton?.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".entity-control") && entityMenu) entityMenu.hidden = true;
    if (!event.target.closest(".vella-sidebar-brand") && sidebarEntityMenu) {
      sidebarEntityMenu.hidden=true;
      sidebarEntityButton?.setAttribute("aria-expanded","false");
    }
    if (!event.target.closest(".system-control") && systemMenu) {
      systemMenu.hidden = true;
      systemButton?.setAttribute("aria-expanded","false");
    }
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

    "contabil-visao-geral":"BIContabilVisaoGeralPage",
    "contabil-execucao-orcamentaria":"BIContabilExecucaoOrcamentariaPage",
    "contabil-receita":"BIContabilReceitaPage",
    "contabil-despesa":"BIContabilDespesaPage",
    "contabil-empenhos":"BIContabilEmpenhosPage",
    "contabil-movimentos":"BIContabilMovimentosPage",
    "contabil-restos":"BIContabilRestosPage",
    "contabil-credores":"BIContabilCredoresPage",
    "contabil-demonstrativos":"BIContabilDemonstrativosPage",
    "contabil-relatorios":"BIContabilRelatoriosPage",
    "contabil-controle":"BIContabilControlePage",

    "compras-visao-geral":"BIComprasVisaoGeralPage",
    "compras-processos":"BIComprasProcessosPage",
    "compras-licitacoes":"BIComprasLicitacoesPage",
    "compras-contratos":"BIComprasContratosPage",
    "compras-fornecedores":"BIComprasFornecedoresPage",
    "compras-atas":"BIComprasAtasPage",
    "compras-itens":"BIComprasItensPage",
    "compras-controle":"BIComprasControlePage",

    "folha-visao-geral":"BIFolhaVisaoGeralPage",
    "folha-servidores":"BIFolhaServidoresPage",
    "folha-vinculos":"BIFolhaVinculosPage",
    "folha-cargos":"BIFolhaCargosPage",
    "folha-departamentos":"BIFolhaDepartamentosPage",
    "folha-mensal":"BIFolhaMensalPage",
    "folha-eventos":"BIFolhaEventosPage",
    "folha-encargos":"BIFolhaEncargosPage",
    "folha-beneficios":"BIFolhaBeneficiosPage",
    "folha-despesas":"BIFolhaDespesasPage",
    "folha-controle":"BIFolhaControlePage",

    "usuarios-admin":"BIUsuariosPage",
    "configuracoes-admin":"BIConfiguracoesPage"
  });

  function currentTenantInfo() {
    return authorizedTenants.find(item=>item.id===tenantId) || null;
  }

  function hideMainViews() {
    document.getElementById("syntheticHomeView").hidden=true;
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
          label:"BI Vella",
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

  let auditPayloadCache={events:[],security:{},history:{}};
  let auditLoadLimit=100;
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
      ["BI Vella - Auditoria"],
      ["Entidade",entityLabel||tenantId||"Entidade"],
      ["Período",filterLabels.period],
      ["Categoria",filterLabels.category],
      ["Status",filterLabels.status],
      ["Busca",filterLabels.text],
      ["Eventos carregados",Number(auditPayloadCache?.history?.loaded||allEvents.length)],
      ["Cobertura indexada",auditPayloadCache?.history?.indexTruncated===true
        ? String(auditPayloadCache?.history?.totalIndexed||0)+"+"
        : String(auditPayloadCache?.history?.totalIndexed||allEvents.length)],
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

  function renderAuditHistory(history) {
    const coverage=document.getElementById("auditHistoryCoverage");
    const button=document.getElementById("loadMoreAudit");
    const loaded=Number(history?.loaded||0);
    const total=Number(history?.totalIndexed||0);
    const maxLimit=Number(history?.maxLimit||1000);
    const hasMore=history?.hasMore===true && loaded<maxLimit;
    const retention=Number(history?.retentionDays||30);
    const truncated=history?.indexTruncated===true;

    if(coverage){
      if(truncated){
        coverage.textContent=loaded+" evento(s) carregado(s) · índice com mais de "+total+" eventos · retenção "+retention+" dias";
      }else{
        coverage.textContent=loaded+" de "+total+" evento(s) retido(s) · retenção "+retention+" dias";
      }
    }

    if(button){
      button.hidden=!hasMore;
      button.disabled=false;
      button.innerHTML='<i class="mdi mdi-chevron-down"></i> CARREGAR MAIS';
      const remaining=truncated ? Math.max(0,maxLimit-loaded) : Math.max(0,total-loaded);
      button.title=remaining
        ? "Carregar mais eventos mantendo os filtros atuais."
        : "Todo o histórico disponível neste recorte já foi carregado.";
    }
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
      security:payload?.security&&typeof payload.security==="object" ? payload.security : {},
      history:payload?.history&&typeof payload.history==="object" ? payload.history : {}
    };
    const allEvents=auditPayloadCache.events;
    renderAuditHistory(auditPayloadCache.history);
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

  async function loadAuditEvents({preserveTable=false}={}) {
    const tbody=document.getElementById("auditTableBody");
    const loadMore=document.getElementById("loadMoreAudit");
    if(!preserveTable && tbody){
      tbody.innerHTML='<tr><td colspan="6" class="table-empty">Carregando auditoria…</td></tr>';
    }
    if(loadMore){
      loadMore.disabled=true;
      loadMore.innerHTML='<i class="mdi mdi-loading mdi-spin"></i> CARREGANDO';
    }
    try{
      const payload=await api("/api/admin/audit?limit="+encodeURIComponent(String(auditLoadLimit)));
      renderAuditEvents(payload);
    }catch(error){
      auditPayloadCache={events:[],security:{},history:{}};
      renderAuditHistory({});
      updateAuditFilterCount(0,0);
      if(tbody) tbody.innerHTML='<tr><td colspan="6" class="table-empty">Auditoria disponível apenas para usuários com permissão de Configurações do BI.</td></tr>';
    }
  }

  async function loadMoreAuditEvents() {
    const history=auditPayloadCache?.history||{};
    const maxLimit=Number(history.maxLimit||1000);
    if(history.hasMore!==true || auditLoadLimit>=maxLimit) return;
    auditLoadLimit=Math.min(maxLimit,auditLoadLimit+100);
    await loadAuditEvents({preserveTable:true});
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
      ADMIN_REQUIRED:"Seu usuário não possui perfil de administrador/técnico para alterar esta configuração.",
      BI_USER_NOT_AUTHORIZED:"Seu usuário foi validado na Betha, mas ainda não possui autorização cadastrada neste BI.",
      USER_NOT_FOUND:"O usuário não foi encontrado na Central Betha."
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

  let entitySyncTimer=null;
  function entitySyncPath(){const id=document.getElementById('entitySettingsForm').elements.id.value.trim();if(!entitySettingsRecords.some(r=>r.id===id))throw new Error('Salve ou selecione uma prefeitura antes de iniciar a carga.');return '/api/admin/sync?entity='+encodeURIComponent(id);}
  async function entitySyncAction(method='GET'){
    const status=document.getElementById('entitySyncStatus'),start=document.getElementById('initialLoadButton');
    clearTimeout(entitySyncTimer);
    try{
      const path=entitySyncPath();start.disabled=true;
      const payload=await api(path,{method,...(method==='PUT'?{headers:{'Content-Type':'application/json'},body:JSON.stringify({intervalMinutes:Number(document.getElementById('entitySyncInterval').value)})}:{})});
      if(method!=='PUT')document.getElementById('entitySyncInterval').value=String(payload.config?.intervalMinutes??60);
      const job=payload.job;
      status.textContent=method==='PUT'?'Frequência salva.':!job?'Carga inicial ainda não executada.':job.state==='running'?'Carga em segundo plano: '+job.completed+' de '+job.total+' fontes concluídas · '+Number(job.rows).toLocaleString('pt-BR')+' registros.':(job.failures?.length?'Carga concluída com '+job.failures.length+' fonte(s) indisponível(is): '+job.failures.map(f=>f.source).join(', '):'Todos os painéis atualizados')+' · '+new Date(job.finishedAt).toLocaleString('pt-BR')+'.';
      start.disabled=job?.state==='running';
      if(job?.state==='running'&&currentView==='configuracoes-admin')entitySyncTimer=setTimeout(()=>entitySyncAction(),15000);
    }catch(error){status.textContent='Carga: '+error.message;start.disabled=false;}
  }
  document.getElementById('initialLoadButton').addEventListener('click',()=>entitySyncAction('POST'));
  document.getElementById('saveSyncScheduleButton').addEventListener('click',()=>entitySyncAction('PUT'));
  document.getElementById('refreshSyncStatusButton').addEventListener('click',()=>entitySyncAction());
  let entitySettingsRecords=[];
  let entitySettingsBusy=false;
  function resetEntitySettings(record=null) {
    const form=document.getElementById("entitySettingsForm");
    form.reset();
    form.elements.id.readOnly=Boolean(record);
    if(record) {
      for(const key of ["id","name","entityId","databaseId"]) form.elements[key].value=record[key]||"";
      form.elements.enabled.checked=record.enabled;
      form.elements.useSharedToken.checked=record.usesSharedToken;
      form.elements.userAccess.placeholder=record.userAccessConfigured?"Chave salva — deixe em branco para manter":"Informe a chave";
      form.elements.accessToken.placeholder=record.accessTokenConfigured?"Token salvo — deixe em branco para manter":"Informe o token";
    }
    document.getElementById("entitySettingsMessage").textContent="";
    clearTimeout(entitySyncTimer);
    if(record)entitySyncAction();
    else document.getElementById("entitySyncStatus").textContent="Salve ou selecione uma prefeitura antes de iniciar a carga.";
  }
  async function loadEntitySettings() {
    const list=document.getElementById("entitySettingsList");
    const form=document.getElementById("entitySettingsForm");
    const newButton=document.getElementById("newEntityButton");
    try {
      const payload=await api("/api/admin/entities");
      entitySettingsRecords=payload.entities||[];
      if(form) form.hidden=false;
      if(newButton) newButton.disabled=false;
      const message=document.getElementById("entitySettingsMessage");
      if(message && /TENANT_CONFIG_FORBIDDEN|HTTP 503|Cadastro indisponível/i.test(message.textContent||"")) message.textContent="";
      list.innerHTML='<div class="entity-settings-table"><table><thead><tr><th>Prefeitura</th><th>Tenant</th><th>Entidade / banco</th><th>Integração</th><th></th></tr></thead><tbody>'+entitySettingsRecords.map(record=>'<tr><td>'+escapeHtml(record.name)+'</td><td>'+escapeHtml(record.id)+'</td><td>'+escapeHtml(record.entityId)+' / '+escapeHtml(record.databaseId)+'</td><td>'+(record.enabled?'Ativa':'Inativa')+' · '+(record.userAccessConfigured&&record.accessTokenConfigured?'Chaves configuradas':'Chaves pendentes')+'</td><td><button type="button" class="btn-secondary-betha" data-edit-entity="'+escapeHtml(record.id)+'">EDITAR</button></td></tr>').join('')+'</tbody></table></div>';
    } catch(error) {
      list.textContent="Não foi possível atualizar a lista de prefeituras agora: "+error.message+". Você ainda pode preencher os dados e testar a conexão.";
      if(form) form.hidden=false;
      if(newButton) newButton.disabled=false;
    }
  }
  async function submitEntitySettings(testOnly=false) {
    if(entitySettingsBusy) return;
    const form=document.getElementById("entitySettingsForm");
    if(!form.reportValidity()) return;
    const body={};
    for(const key of ["id","name","entityId","databaseId","userAccess","accessToken"]) body[key]=form.elements[key].value.trim();
    body.enabled=form.elements.enabled.checked;
    body.useSharedToken=form.elements.useSharedToken.checked;
    const message=document.getElementById("entitySettingsMessage");
    entitySettingsBusy=true;
    form.querySelectorAll("button").forEach(button=>button.disabled=true);
    message.textContent=testOnly?"Testando conexão Betha…":"Validando e salvando prefeitura…";
    try {
      await api("/api/admin/entities"+(testOnly?"/test":""),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),timeoutMs:30000});
      message.textContent=testOnly?"Conexão validada com sucesso.":"Prefeitura salva. Atualizando entidades autorizadas…";
      if(!testOnly) {
        form.elements.userAccess.value="";
        form.elements.accessToken.value="";
        form.elements.id.readOnly=true;
        await loadEntitySettings();
        await loadTenants();
        message.textContent="Prefeitura salva e seleção de entidades atualizada.";
      }
    } catch(error) {
      message.textContent="Não foi possível "+(testOnly?"testar":"salvar")+": "+error.message;
    } finally {
      entitySettingsBusy=false;
      form.querySelectorAll("button").forEach(button=>button.disabled=false);
    }
  }
  document.getElementById("entitySettingsForm")?.addEventListener("submit",event=>{event.preventDefault();submitEntitySettings(false);});
  document.getElementById("testEntityButton")?.addEventListener("click",()=>submitEntitySettings(true));
  document.getElementById("newEntityButton")?.addEventListener("click",()=>resetEntitySettings());
  document.getElementById("entitySettingsList")?.addEventListener("click",event=>{
    const button=event.target.closest("[data-edit-entity]");
    if(button) resetEntitySettings(entitySettingsRecords.find(record=>record.id===button.dataset.editEntity));
  });

  async function loadConfigAdmin() {
    const entitySettingsPromise=loadEntitySettings();
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

    await Promise.all([mappingPromise,mcpTokensPromise,auditPromise,entitySettingsPromise]);
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
      const permissionCount=Number(item.permissionCount??item.permissions?.length??0);
      const profile = item.admin ? "Administrador" : item.technical ? "Técnico" : (permissionCount ? permissionCount + " permissão(ões)" : groups ? groups + " grupo(s)" : "Usuário");

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
    tbody.innerHTML = '<tr><td colspan="7" class="table-empty">Consultando usuários autorizados no BI…</td></tr>';
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
    if(userAccessSaving)return;
    const feedback=document.getElementById("userSaveFeedback");
    if(feedback){feedback.hidden=true;feedback.textContent="";}
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
    activateDrawer("userDrawer","#centralUserSearch");
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
    if(!container) return;

    const groups=systems.map(system=>({
      id:String(system.id),
      label:system.name||system.label||system.id,
      icon:system.icon||"view-dashboard-outline",
      items:Object.entries(dashboards)
        .filter(([,def])=>String(def?.system||"tributos")===String(system.id))
        .map(([id,def])=>({id,label:def.title}))
    })).filter(group=>group.items.length);

    groups.push({
      id:"administracao",
      label:"Administração",
      icon:"cog-outline",
      items:[
        {id:"usuarios-admin",label:"Usuários e acessos"},
        {id:"configuracoes-admin",label:"Configurações"}
      ]
    });

    container.innerHTML=groups.map(group=>
      '<section class="permission-system-group" data-permission-system="'+escapeHtml(group.id)+'">'+
        '<header><div><i class="mdi mdi-'+escapeHtml(group.icon)+'" aria-hidden="true"></i><strong>'+escapeHtml(group.label)+'</strong><span>'+group.items.length+' painel(is)</span></div>'+
        '<button type="button" class="permission-group-toggle" data-permission-group-toggle="'+escapeHtml(group.id)+'">Marcar grupo</button></header>'+
        '<div class="permission-system-items">'+
          group.items.map(item=>
            '<label class="permission-item"><input type="checkbox" value="'+escapeHtml(item.id)+'" checked> <span>'+escapeHtml(item.label)+'</span></label>'
          ).join("")+
        '</div>'+
      '</section>'
    ).join("");

    container.querySelectorAll("[data-permission-group-toggle]").forEach(button=>{
      button.addEventListener("click",()=>{
        const group=button.closest(".permission-system-group");
        const inputs=[...group.querySelectorAll('input[type="checkbox"]')];
        const shouldCheck=inputs.some(input=>!input.checked);
        inputs.forEach(input=>input.checked=shouldCheck);
        button.textContent=shouldCheck?"Desmarcar grupo":"Marcar grupo";
        updateWizardSaveState();
      });
    });

    container.onchange=event=>{
      if(!event.target.matches('input[type="checkbox"]')) return;
      const group=event.target.closest(".permission-system-group");
      const button=group?.querySelector("[data-permission-group-toggle]");
      if(button){
        const inputs=[...group.querySelectorAll('input[type="checkbox"]')];
        button.textContent=inputs.every(input=>input.checked)?"Desmarcar grupo":"Marcar grupo";
      }
      updateWizardSaveState();
    };

    applyPermissionPreset();
    container.querySelectorAll(".permission-system-group").forEach(group=>{
      const inputs=[...group.querySelectorAll('input[type="checkbox"]')];
      const button=group.querySelector("[data-permission-group-toggle]");
      if(button) button.textContent=inputs.every(input=>input.checked)?"Desmarcar grupo":"Marcar grupo";
    });
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

    const canSave=Boolean(selectedCentralUser);
    save.disabled=!canSave;

    if(!selectedCentralUser) {
      save.title="Localize um usuário válido antes de salvar.";
    } else {
      save.title="Salvar as permissões deste usuário no BI.";
    }

    const help=document.getElementById("permissionMappingHelp");
    if(help){
      help.textContent="As permissões são gravadas por painel no BI. Tributos preserva a validação Betha; Contabilidade, Compras e Folha usam autorização local enquanto estiverem em AMOSTRA LOCAL.";
    }
  }

  function selectedPermissionPayload() {
    return [...document.querySelectorAll('#permissionsList input[type="checkbox"]:checked')]
      .map(input=>PAGE_PERMISSION_IDS[input.value])
      .filter(Boolean)
      .map(id=>({id,revokedOperations:[]}));
  }

  let userAccessSaving=false;
  async function saveUserAccess() {
    if(!selectedCentralUser||userAccessSaving) return;

    const save=document.getElementById("wizardSave");
    const result=document.getElementById("centralUserResult");
    const userId=selectedCentralUser.id || selectedCentralUser.user || selectedCentralUser.login;
    const profile=selectedProfile();
    const admin=document.getElementById("accessAdmin").checked || profile==="administrador";
    const technical=document.getElementById("accessTechnical").checked;
    const expiresIn=document.getElementById("accessExpires").value || null;

    const body={
      user:String(userId),
      admin,
      technical,
      permissions:admin ? [] : selectedPermissionPayload(),
      expiresIn
    };

    const feedback=document.getElementById("userSaveFeedback");
    if(feedback){feedback.hidden=false;feedback.textContent="Salvando as permissões no BI…";feedback.classList.remove("is-error");}
    userAccessSaving=true;
    save.disabled=true;
    save.textContent="SALVANDO…";

    try {
      await api("/api/admin/users",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(body)
      });
      closeDrawer("userDrawer");
      selectedCentralUser=null;
      showToast("Usuário salvo com sucesso.");
      try{await loadUsers();}catch{showToast("Usuário salvo. Atualize a lista para conferir o acesso.");}
    } catch(error) {
      setWizardStep(4);
      save.disabled=false;
      const feedback=document.getElementById("userSaveFeedback");
      const msg=feedback || document.getElementById("centralUserResult");
      if(msg){msg.hidden=false;msg.classList.add("is-error");msg.textContent="Não foi possível salvar o usuário: "+pageMappingFriendly(error.message);}
    } finally {
      userAccessSaving=false;
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
  document.getElementById("loadMoreAudit")?.addEventListener("click",loadMoreAuditEvents);
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
    const lists=[document.getElementById("entityList"),sidebarEntityList].filter(Boolean);
    for(const list of lists) list.innerHTML="";
    for (const tenant of authorizedTenants) {
      for(const list of lists){
        const button = document.createElement("button");
        button.type = "button";
        button.className = "entity-option" + (tenant.id === tenantId ? " is-current" : "");
        button.textContent = tenant.name || tenant.id;
        button.addEventListener("click", () => applyTenantInPlace(tenant, true));
        list.appendChild(button);
      }
    }
    if(sidebarEntityContext) sidebarEntityContext.textContent=entityLabel||"Selecione a entidade";
    renderMobileEntitySelector();
  }

  function applyTenantInPlace(tenant, resumeView = false) {
    if (!tenant || !tenant.id) return false;

    const previousTenantId=tenantId;
    if(tenantId!==tenant.id){chartDisplayStateByView.clear();filterStateByView.clear();restoredPreferenceScopes.clear();}
    tenantId = tenant.id;
    entityLabel = tenant.name || tenant.id;

    const availableSystems=accessibleSystemsForTenant(tenant);
    if(!availableSystems.some(system=>String(system.id)===String(currentSystemId)) && availableSystems.length){
      currentSystemId=String(availableSystems[0].id);
      currentView=availableSystems[0].homeView||DEFAULT_VIEW;
    }

    applyNavigationPermissions(tenant);
    renderSystemSelector();

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
    if(sidebarEntityContext) sidebarEntityContext.textContent=entityLabel;

    renderAuthorizedTenantMenu();
    if(entityMenu) entityMenu.hidden=true;
    if(sidebarEntityMenu) sidebarEntityMenu.hidden=true;
    sidebarEntityButton?.setAttribute("aria-expanded","false");

    if(resumeView && previousTenantId && previousTenantId!==tenantId){
      showToast("Prefeitura alterada para " + entityLabel + ".");
    }

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
        if(sidebarEntityContext) sidebarEntityContext.textContent="Sem entidade autorizada";
        renderMobileEntitySelector();
        list.innerHTML = '<div class="table-empty">Nenhuma entidade autorizada para este usuário.</div>';
        if(sidebarEntityList) sidebarEntityList.innerHTML=list.innerHTML;
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
      if(sidebarEntityContext) sidebarEntityContext.textContent="Acesso não validado";
      renderMobileEntitySelector();
      if (entityList) entityList.innerHTML = '<div class="table-empty">' + escapeHtml(friendly) + '</div>';
      if(sidebarEntityList) sidebarEntityList.innerHTML='<div class="table-empty">'+escapeHtml(friendly)+'</div>';

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
