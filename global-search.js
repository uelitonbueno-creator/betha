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

  function escapeHtml(value){
    return String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/\x27/g,"&#039;");
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
    resultsEl.innerHTML=
      '<div class="global-search-preview"><button type="button" class="global-search-back" data-search-back><i class="mdi mdi-arrow-left"></i> Voltar aos resultados</button><div class="global-search-preview-icon"><i class="mdi mdi-'+escapeHtml(item?.icon||"database-outline")+'"></i></div><small>'+escapeHtml(String(item?.category||"Registro").toUpperCase())+'</small><h3>'+escapeHtml(item?.title||"Resultado")+'</h3><p>'+escapeHtml(item?.subtitle||"Registro autorizado nesta prefeitura.")+'</p><div class="global-search-preview-meta"><span><small>ID</small><strong>'+escapeHtml(item?.id||"—")+'</strong></span><span><small>Fonte</small><strong>'+escapeHtml(item?.resource||"—")+'</strong></span></div>'+sourceButton+'<div class="global-search-security"><i class="mdi mdi-shield-check-outline"></i><span>A busca respeita as permissões atuais e não salva o termo pesquisado.</span></div></div>';
    setStatus("Resultado selecionado","ready");
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
    setStatus("Buscando dados autorizados…","loading");
    resultsEl.innerHTML='<div class="global-search-empty"><i class="mdi mdi-loading mdi-spin"></i><strong>Pesquisando</strong><span>Consultando somente as fontes permitidas para este acesso.</span></div>';
    try{
      const payload=await api("/api/search?q="+encodeURIComponent(q)+"&limit=24");
      if(seq!==requestSeq) return;
      renderResults(payload);
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
