(() => {
  const cfg=window.BI_CONFIG||{};
  const overlay=document.getElementById("globalSearchOverlay");
  const input=document.getElementById("globalSearchInput");
  const resultsEl=document.getElementById("globalSearchResults");
  const statusEl=document.getElementById("globalSearchStatus");
  const openButton=document.getElementById("globalSearchButton");
  const closeButton=document.getElementById("closeGlobalSearch");
  if(!overlay||!input||!resultsEl||!openButton) return;

  let timer=null;
  let requestSeq=0;
  let results=[];
  let activeIndex=-1;
  let lastPayload=null;
  const localSampleCache=new Map();

  function escapeHtml(value){
    return String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/\x27/g,"&#039;");
  }

  function normalize(value){
    return String(value??"")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"")
      .toLocaleLowerCase("pt-BR")
      .trim();
  }

  function currentSearchContext(){
    try{
      return window.BIVellaSearchContext?.getState?.()||null;
    }catch{
      return null;
    }
  }

  function dashboardScore(def,view,query,systemName){
    const q=normalize(query);
    const title=normalize(def?.title||view);
    const description=normalize(def?.description||"");
    const system=normalize(systemName||def?.system||"");
    if(!q) return 0;
    if(title===q) return 120;
    if(title.startsWith(q)) return 105;
    if(title.includes(q)) return 92;
    if(system===q) return 88;
    if((system+" "+title).includes(q)) return 82;
    if(description.includes(q)) return 64;
    return 0;
  }

  function localDashboardResults(query,context){
    const allowed=new Set(Array.isArray(context?.allowedViews)?context.allowedViews:[]);
    return [...allowed].map(view=>{
      const def=window.BI_DASHBOARDS?.[view];
      if(!def) return null;
      const score=dashboardScore(def,view,query,context?.systemName);
      if(!score) return null;
      return {
        kind:"dashboard",
        category:"Painel",
        icon:"view-dashboard-outline",
        view,
        id:view,
        title:def.title||view,
        subtitle:(context?.systemName||"BI Vella")+" · painel autorizado",
        score
      };
    }).filter(Boolean);
  }

  const LOCAL_SAMPLE_SEARCH_CONFIG={
    contabil:{
      icon:"calculator-variant-outline",
      title:row=>[row.empenho,row.credor].filter(Boolean).join(" · ")||("Registro "+row.id),
      subtitle:row=>["AMOSTRA LOCAL",row.unidade,row.natureza,row.status].filter(Boolean).join(" · "),
      preferred:[
        {field:"empenho",view:"contabil-empenhos"},
        {field:"credor",view:"contabil-credores"},
        {field:"natureza",view:"contabil-despesa"},
        {field:"fonteRecurso",view:"contabil-receita"}
      ]
    },
    compras:{
      icon:"cart-outline",
      title:row=>[row.processo,row.fornecedor].filter(Boolean).join(" · ")||("Registro "+row.id),
      subtitle:row=>["AMOSTRA LOCAL",row.modalidade,row.secretaria,row.status].filter(Boolean).join(" · "),
      preferred:[
        {field:"processo",view:"compras-processos"},
        {field:"fornecedor",view:"compras-fornecedores"},
        {field:"ata",view:"compras-atas"},
        {field:"itemCategoria",view:"compras-itens"}
      ]
    },
    folha:{
      icon:"account-group-outline",
      title:row=>row.servidor||("Servidor "+row.servidorId)||("Registro "+row.id),
      subtitle:row=>["AMOSTRA LOCAL",row.cargo,row.secretaria,row.status].filter(Boolean).join(" · "),
      preferred:[
        {field:"servidor",view:"folha-servidores"},
        {field:"departamento",view:"folha-departamentos"},
        {field:"cargo",view:"folha-cargos"},
        {field:"beneficio",view:"folha-beneficios"}
      ]
    }
  };

  async function loadLocalSample(file){
    const key=String(file||"");
    if(!key) return {rows:[]};
    if(localSampleCache.has(key)) return localSampleCache.get(key);
    const promise=fetch(key,{cache:"force-cache"})
      .then(response=>{
        if(!response.ok) throw new Error("LOCAL_SAMPLE_UNAVAILABLE");
        return response.json();
      })
      .catch(()=>({rows:[]}));
    localSampleCache.set(key,promise);
    return promise;
  }

  function preferredLocalView(row,query,context,config){
    const q=normalize(query);
    const allowed=new Set(Array.isArray(context?.allowedViews)?context.allowedViews:[]);
    for(const item of config?.preferred||[]){
      if(!allowed.has(item.view)) continue;
      const value=normalize(row?.[item.field]);
      if(value&&value.includes(q)) return item.view;
    }
    if(allowed.has(context?.homeView)) return context.homeView;
    return [...allowed][0]||context?.homeView||"";
  }

  async function runLocalSampleSearch(query,context){
    const config=LOCAL_SAMPLE_SEARCH_CONFIG[String(context?.currentSystemId||"")];
    const panels=localDashboardResults(query,context);
    const doc=await loadLocalSample(context?.sampleFile);
    const q=normalize(query);
    const rows=Array.isArray(doc?.rows)?doc.rows:[];
    const matches=rows.map(row=>{
      const entries=Object.entries(row||{}).filter(([,value])=>value!==null&&value!==undefined&&String(value)!=="");
      const normalized=entries.map(([key,value])=>[key,normalize(value)]);
      const exact=normalized.find(([,value])=>value===q);
      const starts=normalized.find(([,value])=>value.startsWith(q));
      const contains=normalized.find(([,value])=>value.includes(q));
      if(!exact&&!starts&&!contains) return null;
      const score=exact?95:starts?82:68;
      return {row,score};
    }).filter(Boolean).sort((a,b)=>b.score-a.score||Number(a.row?.id||0)-Number(b.row?.id||0)).slice(0,10);

    const records=matches.map(({row,score})=>({
      kind:"record",
      resource:"amostra-local",
      category:"Amostra "+String(context?.systemName||"local"),
      icon:config?.icon||"database-outline",
      view:preferredLocalView(row,query,context,config),
      id:String(row?.id??row?.servidorId??""),
      title:config?.title?config.title(row):("Registro "+String(row?.id??"")),
      subtitle:config?.subtitle?config.subtitle(row):"AMOSTRA LOCAL · DADOS DE TESTE",
      sampleMode:true,
      score
    }));

    const combined=[...panels,...records]
      .sort((a,b)=>(b.score||0)-(a.score||0)||String(a.title||"").localeCompare(String(b.title||""),"pt-BR"))
      .slice(0,24)
      .map(({score,...item})=>item);

    return {
      query,
      results:combined,
      partial:false,
      scanned:rows.length,
      localSample:true,
      source:"amostra-local"
    };
  }

  function tenantId(){
    const p=new URL(location.href).searchParams;
    return p.get("tenant")||p.get("entidadeId")||p.get("entityId")||"";
  }

  async function api(path){
    const base=String(cfg.BACKEND_URL||"").replace(/\/$/,"");
    if(!base) throw new Error("BACKEND_NOT_CONFIGURED");
    const headers={Accept:"application/json"};
    const token=window.BIAuth&&typeof BIAuth.getToken==="function"?BIAuth.getToken():"";
    if(token) headers.Authorization="Session "+token;
    const tenant=tenantId();
    if(tenant) headers["X-Tenant-Id"]=tenant;
    const controller=new AbortController();
    const timerId=setTimeout(()=>controller.abort(),25000);
    try{
      const response=await fetch(base+path,{headers,credentials:"include",signal:controller.signal});
      const body=await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(body.error||("HTTP_"+response.status));
      return body;
    }catch(error){
      if(error&&error.name==="AbortError") throw new Error("REQUEST_TIMEOUT");
      throw error;
    }finally{clearTimeout(timerId);}
  }

  function setStatus(text,state=""){
    if(!statusEl) return;
    statusEl.textContent=String(text||"");
    statusEl.dataset.state=state;
  }

  function openSearch(){
    overlay.hidden=false;
    document.body.classList.add("global-search-open");
    renderStart();
    setTimeout(()=>{input.focus();input.select();},0);
  }

  function closeSearch(){
    overlay.hidden=true;
    document.body.classList.remove("global-search-open");
    clearTimeout(timer);
    requestSeq++;
  }

  function navigate(view){
    if(!view) return;
    const url=new URL(location.href);
    const def=window.BI_DASHBOARDS?.[view];
    const system=String(def?.system||"tributos");
    url.searchParams.set("sistema",system);
    url.searchParams.set("view",view);
    location.assign(url.toString());
  }

  function renderStart(){
    results=[];activeIndex=-1;lastPayload=null;
    resultsEl.innerHTML='<div class="global-search-empty"><i class="mdi mdi-magnify"></i><strong>Encontre qualquer área do BI em um só lugar</strong><span>Digite nome, CPF/CNPJ, cadastro, ID, débito, dívida ou nome de painel.</span></div>';
    setStatus("Digite para pesquisar");
  }

  function groupResults(items){
    const groups=[];
    const dashboards=items.filter(item=>item.kind==="dashboard");
    if(dashboards.length) groups.push(["Painéis",dashboards]);
    const records=items.filter(item=>item.kind!=="dashboard");
    const byCategory=new Map();
    for(const item of records){
      const key=item.category||"Registros";
      if(!byCategory.has(key)) byCategory.set(key,[]);
      byCategory.get(key).push(item);
    }
    for(const pair of byCategory.entries()) groups.push(pair);
    return groups;
  }

  function renderResults(payload){
    lastPayload=payload||{};
    results=Array.isArray(payload?.results)?payload.results:[];
    activeIndex=results.length?0:-1;
    if(!results.length){
      resultsEl.innerHTML='<div class="global-search-empty"><i class="mdi mdi-database-search-outline"></i><strong>Nenhum resultado encontrado</strong><span>Tente outro nome, documento, cadastro ou termo.</span></div>';
      setStatus("Nenhum resultado","empty");
      return;
    }
    let index=0;
    let html="";
    for(const [group,items] of groupResults(results)){
      html+='<section class="global-search-group"><div class="global-search-group-title"><strong>'+escapeHtml(group)+'</strong><span>'+items.length+'</span></div>';
      for(const item of items){
        const idx=results.indexOf(item);
        html+='<button type="button" class="global-search-result '+(idx===activeIndex?"is-active":"")+'" data-search-index="'+idx+'" role="option" aria-selected="'+String(idx===activeIndex)+'"><span class="global-search-result-icon"><i class="mdi mdi-'+escapeHtml(item.icon||"magnify")+'"></i></span><span class="global-search-result-copy"><strong>'+escapeHtml(item.title||group)+'</strong><small>'+escapeHtml(item.subtitle||"Resultado autorizado")+'</small></span><span class="global-search-result-kind">'+escapeHtml(String(item.kind==="dashboard"?"PAINEL":group).toUpperCase())+'</span><i class="mdi mdi-chevron-right"></i></button>';
        index++;
      }
      html+="</section>";
    }
    resultsEl.innerHTML=html;
    setStatus(payload?.partial===true?"Resultados encontrados · busca parcial":"Resultados encontrados",payload?.partial===true?"partial":"ready");
  }

  function renderPreview(item){
    results=[];activeIndex=-1;
    const sourceButton=item?.view?'<button type="button" class="btn-primary-betha global-search-open-view" data-search-view="'+escapeHtml(item.view)+'"><i class="mdi mdi-open-in-new"></i> ABRIR PAINEL RELACIONADO</button>':"";
    const securityText=item?.sampleMode
      ? "AMOSTRA LOCAL · dados sintéticos de teste · nenhuma chamada ao Worker/Cloudflare."
      : "A busca respeita as permissões atuais e não salva o termo pesquisado.";
    resultsEl.innerHTML=
      '<div class="global-search-preview'+(item?.sampleMode?" is-sample":"")+'"><button type="button" class="global-search-back" data-search-back><i class="mdi mdi-arrow-left"></i> Voltar aos resultados</button><div class="global-search-preview-icon"><i class="mdi mdi-'+escapeHtml(item?.icon||"database-outline")+'"></i></div><small>'+escapeHtml(String(item?.category||"Registro").toUpperCase())+'</small><h3>'+escapeHtml(item?.title||"Resultado")+'</h3><p>'+escapeHtml(item?.subtitle||"Registro autorizado nesta prefeitura.")+'</p><div class="global-search-preview-meta"><span><small>ID</small><strong>'+escapeHtml(item?.id||"—")+'</strong></span><span><small>Fonte</small><strong>'+escapeHtml(item?.resource||"—")+'</strong></span></div>'+sourceButton+'<div class="global-search-security"><i class="mdi mdi-shield-check-outline"></i><span>'+escapeHtml(securityText)+'</span></div></div>';
    setStatus(item?.sampleMode?"AMOSTRA LOCAL · 0 chamadas à API":"Resultado selecionado",item?.sampleMode?"sample":"ready");
  }

  function updateActive(next){
    if(!results.length) return;
    activeIndex=(next+results.length)%results.length;
    resultsEl.querySelectorAll("[data-search-index]").forEach(button=>{
      const active=Number(button.dataset.searchIndex)===activeIndex;
      button.classList.toggle("is-active",active);
      button.setAttribute("aria-selected",String(active));
      if(active) button.scrollIntoView({block:"nearest"});
    });
  }

  async function runSearch(term){
    const q=String(term||"").trim();
    const seq=++requestSeq;
    if(q.length<2){
      results=[];activeIndex=-1;
      resultsEl.innerHTML='<div class="global-search-empty"><i class="mdi mdi-text-search"></i><strong>Digite pelo menos 2 caracteres</strong><span>A busca aceita nome, documento, cadastro, ID e nome do painel.</span></div>';
      setStatus(q?"Digite mais um caractere":"Digite para pesquisar","hint");
      return;
    }
    const context=currentSearchContext();
    const localMode=Boolean(context?.localSample&&context?.sampleFile);
    setStatus(localMode?"Buscando na amostra local…":"Buscando dados autorizados…","loading");
    resultsEl.innerHTML='<div class="global-search-empty"><i class="mdi mdi-loading mdi-spin"></i><strong>Pesquisando</strong><span>'+(localMode?"Consultando somente os 100 registros locais e os painéis autorizados.":"Consultando somente as fontes permitidas para este acesso.")+'</span></div>';
    try{
      const payload=localMode
        ? await runLocalSampleSearch(q,context)
        : await api("/api/search?q="+encodeURIComponent(q)+"&limit=24");
      if(seq!==requestSeq) return;
      renderResults(payload);
      if(localMode&&payload?.results?.length) setStatus("AMOSTRA LOCAL · 0 chamadas à API","sample");
    }catch(error){
      if(seq!==requestSeq) return;
      results=[];activeIndex=-1;
      resultsEl.innerHTML='<div class="global-search-empty"><i class="mdi mdi-alert-circle-outline"></i><strong>Busca indisponível</strong><span>'+escapeHtml(error?.message==="REQUEST_TIMEOUT"?"A consulta demorou demais. Refine o termo e tente novamente.":"Não foi possível consultar os dados agora.")+'</span></div>';
      setStatus("Busca indisponível","error");
    }
  }

  openButton.addEventListener("click",openSearch);
  closeButton?.addEventListener("click",closeSearch);
  overlay.addEventListener("click",event=>{if(event.target===overlay) closeSearch();});
  input.addEventListener("input",()=>{
    clearTimeout(timer);
    const term=input.value.trim();
    timer=setTimeout(()=>runSearch(term),500);
  });
  input.addEventListener("keydown",event=>{
    if(event.key==="ArrowDown"){event.preventDefault();updateActive(activeIndex+1);return;}
    if(event.key==="ArrowUp"){event.preventDefault();updateActive(activeIndex-1);return;}
    if(event.key==="Enter"){
      event.preventDefault();
      const item=results[activeIndex];
      if(!item) return;
      if(item.kind==="dashboard") navigate(item.view); else renderPreview(item);
    }
  });
  resultsEl.addEventListener("click",event=>{
    const back=event.target.closest("[data-search-back]");
    if(back){renderResults(lastPayload||{results:[]});return;}
    const viewButton=event.target.closest("[data-search-view]");
    if(viewButton){navigate(viewButton.dataset.searchView);return;}
    const button=event.target.closest("[data-search-index]");
    if(!button) return;
    const item=results[Number(button.dataset.searchIndex)];
    if(!item) return;
    if(item.kind==="dashboard") navigate(item.view); else renderPreview(item);
  });
  document.addEventListener("keydown",event=>{
    const target=event.target;
    const editing=target&&["INPUT","TEXTAREA","SELECT"].includes(target.tagName);
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="k"){event.preventDefault();openSearch();return;}
    if(event.key==="/"&&!editing&&overlay.hidden!==false){event.preventDefault();openSearch();return;}
    if(event.key==="Escape"&&overlay.hidden===false){event.preventDefault();closeSearch();}
  });
  renderStart();
})();
