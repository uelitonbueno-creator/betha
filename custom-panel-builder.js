/* BI Vella | construtor de painéis personalizados - primeira versão */
(() => {
  "use strict";
  const SOURCES = {
    "bi:debitos": {label:"Débitos",system:"tributos",dimensions:{situacao:"Situação",ano:"Exercício",bairro:"Bairro",receita:"Receita"},measures:{lancado:"Valor lançado",saldo:"Saldo"}},
    "bi:pagamentos": {label:"Pagamentos",system:"tributos",dimensions:{ano:"Exercício",receita:"Receita",pagamento:"Data exata do pagamento","pagamento:mes":"Mês do pagamento","pagamento:dia":"Dia do pagamento","pagamento:ano":"Ano do pagamento"},measures:{pago:"Valor pago"}},
    "bi:imoveis": {label:"Imóveis",system:"tributos",dimensions:{bairro:"Bairro",zona:"Zona",situacao:"Situação"},measures:{count:"Quantidade"}},
    "bi:parcelamentos": {label:"Parcelamentos",system:"tributos",dimensions:{situacao:"Situação",ano:"Exercício"},measures:{count:"Quantidade"}}
  };
  const state={id:null,source:"bi:debitos",chart:"bar",dimension:"bairro",measure:"saldo",aggregation:"sum",filterField:"",filterValue:"",filters:[],limit:20,name:"Débitos por bairro",panels:[],chartInstance:null,loading:false,previewRows:[],previewPartial:false,previewSeq:0,previewKind:"preview",fullQueryRunning:false,previewSignature:""};
  const byId=id=>document.getElementById(id);
  let authorizedSources=new Set(), catalogScope="",sidebarScope="";
  const safe=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function context(){const s=window.BIVellaSearchContext?.getState?.()||{};return {tenant:String(s.tenantId||s.tenant?.id||new URLSearchParams(location.search).get("tenant")||""),system:s.currentSystemId||"tributos"};}
  function apiUrl(path){return String(window.BI_CONFIG?.BACKEND_URL||"").replace(/\/$/,"")+path;}
  async function request(path,method="GET",payload){
    const {tenant}=context();if(!tenant)throw Error("Selecione uma entidade antes de criar o painel.");
    const r=await fetch(apiUrl(path),{method,credentials:"include",headers:{"Content-Type":"application/json","X-Tenant-Id":tenant},body:payload===undefined?undefined:JSON.stringify(payload)});
    const data=await r.json().catch(()=>({}));if(!r.ok)throw Error(({INITIAL_LOAD_REQUIRED:"Realize a carga inicial da fonte.",CUSTOM_PANEL_SOURCE_NOT_LOADED:"A fonte ainda não possui dados carregados.",CUSTOM_PANEL_D1_NOT_CONFIGURED:"A persistência D1 ainda não está configurada.",CUSTOM_PANEL_SOURCE_INVALID:"Fonte não autorizada para este sistema.",DATA_RESOURCE_PERMISSION_DENIED:"Você não tem permissão para acessar esta fonte."})[data.error]||data.error||"Não foi possível executar a operação.");return data;
  }
  const option=(value,label,selected)=>'<option value="'+safe(value)+'"'+(String(value)===String(selected)?" selected":"")+">"+safe(label)+"</option>";
  const options=(map,selected)=>Object.entries(map).map(([k,v])=>option(k,v,selected)).join("");
  const cfg=()=>({name:state.name.trim(),system:context().system,source:state.source,dimension:state.dimension,measure:state.measure,aggregation:state.measure==="count"?"count":state.aggregation,chart:state.chart,filters:state.filters.filter(f=>f.field&&f.value!==""),limit:state.limit,config_version:1});
  function ensureUi(){
    if(byId("biCustomOpen"))return;
    const style=document.createElement("link");style.rel="stylesheet";style.href="custom-panel-builder.css?v=20261009-5";document.head.appendChild(style);
    const open=document.createElement("button");open.id="biCustomOpen";open.className="bi-custom-open";open.type="button";open.textContent="+ Novo painel";open.onclick=()=>show("new");document.body.appendChild(open);
    const root=document.createElement("section");root.id="biCustomRoot";root.className="bi-custom-root";root.hidden=true;root.innerHTML=`
      <div class="bi-custom-dialog" role="dialog" aria-modal="true" aria-labelledby="biCustomTitle">
        <header><div><strong id="biCustomTitle">Construtor de Painéis</strong><p>Crie suas análises sem programação</p></div><button type="button" id="biCustomClose" aria-label="Fechar">×</button></header>
        <nav class="bi-custom-tabs"><button id="biCustomNew" type="button">+ Novo</button><button id="biCustomListButton" type="button">Meus painéis</button></nav>
        <div class="bi-custom-layout"><form id="biCustomForm">
          <label>Nome do painel<input id="biCustomName" maxlength="100" required></label>
          <label>Fonte de dados<select id="biCustomSource"></select></label>
          <label>Agrupar por<select id="biCustomDimension"></select></label>
          <label>Métrica<select id="biCustomMeasure"></select></label>
          <label>Agregação<select id="biCustomAggregation"><option value="sum">Soma</option><option value="avg">Média</option><option value="min">Mínimo</option><option value="max">Máximo</option><option value="count">Contagem</option></select></label>
          <fieldset class="bi-custom-filter-set"><legend>Filtros (todos devem corresponder)</legend><div id="biCustomFilters"></div><button type="button" id="biCustomAddFilter">+ Adicionar filtro</button></fieldset>
          <label>Exibir categorias<select id="biCustomLimit"><option value="5">Top 5</option><option value="10">Top 10</option><option value="20">Top 20</option><option value="50">Top 50</option></select></label>
          <label>Visualização<select id="biCustomChart"><option value="bar">Barras</option><option value="horizontalBar">Barras horizontais</option><option value="line">Linhas</option><option value="doughnut">Donut</option><option value="pie">Pizza</option><option value="table">Tabela</option><option value="kpi">Indicador KPI</option></select></label>
          <div class="bi-custom-actions"><button type="button" id="biCustomPreview">Atualizar prévia</button><button type="button" id="biCustomFullQuery">Analisar todos os dados carregados</button><button type="button" id="biCustomCancelQuery" hidden>Cancelar análise</button><button type="button" id="biCustomExport">Exportar CSV (prévia)</button><button type="submit" class="bi-custom-primary">Salvar painel</button></div>
          <p id="biCustomStatus" role="status"></p>
        </form><div class="bi-custom-preview"><div class="bi-custom-preview-title"><strong>Pré-visualização</strong><small id="biCustomInfo">Dados do cache autorizado</small></div><div id="biCustomChartWrap"><canvas id="biCustomCanvas"></canvas></div><div id="biCustomTable"></div><div id="biCustomDrill" hidden></div><div id="biCustomList" hidden></div></div></div>
      </div>`;
    document.body.appendChild(root);
    byId("biCustomClose").onclick=()=>{root.hidden=true;destroyChart();if(location.hash.includes("painel="))history.replaceState(null,"",location.pathname+location.search);};
    byId("biCustomNew").onclick=()=>resetDraft();
    byId("biCustomListButton").onclick=loadList;
    byId("biCustomSource").onchange=e=>{state.source=e.target.value;const def=SOURCES[state.source];state.dimension=Object.keys(def.dimensions)[0];state.measure=Object.keys(def.measures)[0];state.filters=[];renderFields();};
    for(const [id,key] of [["biCustomName","name"],["biCustomDimension","dimension"],["biCustomMeasure","measure"],["biCustomAggregation","aggregation"],["biCustomChart","chart"]])byId(id).addEventListener("change",e=>{state[key]=e.target.value;});
    byId("biCustomAddFilter").onclick=()=>{if(state.filters.length>=6)return status("Limite de seis filtros.",true);state.filters.push({field:Object.keys(SOURCES[state.source].dimensions)[0],operator:"eq",value:""});renderFilters();};
    byId("biCustomLimit").onchange=e=>{state.limit=Number(e.target.value);};
    byId("biCustomPreview").onclick=preview;
    byId("biCustomFullQuery").onclick=runCompleteAnalysis;
    byId("biCustomCancelQuery").onclick=()=>{state.previewSeq++;setQueryRunning(false);status("Consulta interrompida.");};
    byId("biCustomExport").onclick=exportPreview;
    const navNew=byId("customPanelSidebarNew"),navList=byId("customPanelSidebarList"),mobile=byId("mobileCustomPanelButton");
    if(navNew)navNew.onclick=()=>show("new");
    if(navList)navList.onclick=()=>show("list");
    if(mobile)mobile.onclick=()=>show("list");
    byId("biCustomForm").onsubmit=async e=>{e.preventDefault();const scope=context().tenant+":"+context().system;try{state.name=byId("biCustomName").value;const result=await request(state.id?"/api/custom-panels/"+encodeURIComponent(state.id):"/api/custom-panels",state.id?"PUT":"POST",cfg());if(scope!==context().tenant+":"+context().system)return;state.id=result.panel.id;history.replaceState(null,"",location.pathname+location.search+"#painel="+encodeURIComponent(state.id));status("Painel salvo. O endereço desta página permite reabrir a análise.");await loadSidebar(true);}catch(e){status(e.message,true);}};
  }
  function status(message,error=false){const el=byId("biCustomStatus");el.textContent=message;el.classList.toggle("error",error);}

  async function refreshCatalog(force=false){
    const {tenant,system}=context(),scope=tenant+":"+system;
    if(!tenant||system!=="tributos"){authorizedSources=new Set();catalogScope="";return;}
    if(!force&&catalogScope===scope)return;
    const result=await request("/api/custom-panels/catalog");
    if(scope!==context().tenant+":"+context().system)return;
    authorizedSources=new Set((result.sources||[]).map(source=>String(source.id)).filter(id=>SOURCES[id]));
    catalogScope=scope;
  }
  function resetDraft(){
    state.id=null;state.name="Novo painel";state.filters=[];state.limit=20;
    state.chart="bar";state.aggregation="sum";
    const first=[...authorizedSources][0]||"";
    state.source=first;
    if(first){state.dimension=Object.keys(SOURCES[first].dimensions)[0];state.measure=Object.keys(SOURCES[first].measures)[0];}
    state.previewRows=[];state.previewSeq++;
    destroyChart();
    renderFields();byId("biCustomList").hidden=true;
    byId("biCustomTable").replaceChildren();byId("biCustomDrill").hidden=true;
  }
  async function loadSidebar(force=false){
    const side=byId("customPanelSidebar"),mobile=byId("mobileCustomPanelButton");
    const {tenant,system}=context(),scope=tenant+":"+system;
    const auth=byId("authGate");
    const visible=Boolean(tenant)&&system==="tributos"&&(!auth||auth.hidden);
    if(!visible){
      if(side)side.hidden=true;if(mobile)mobile.hidden=true;sidebarScope="";
      return;
    }
    if(!force&&sidebarScope===scope)return;
    try{
      await refreshCatalog();
      if(scope!==context().tenant+":"+context().system)return;
      const result=await request("/api/custom-panels");
      if(scope!==context().tenant+":"+context().system)return;
      const list=byId("customPanelSidebarItems");
      if(list){
        list.replaceChildren();
        for(const panel of result.panels||[]){
          const button=document.createElement("button");
          button.className="sidebar-panel-option custom-panel-saved-option";button.type="button";
          const icon=document.createElement("i");icon.className="mdi mdi-chart-box-outline";icon.setAttribute("aria-hidden","true");
          const label=document.createElement("span");label.textContent=panel.name;label.title=panel.name;
          button.append(icon,label);
          button.onclick=async()=>{await show("existing");openPanel(panel);};
          list.appendChild(button);
        }
      }
      sidebarScope=scope;
      if(side)side.hidden=!authorizedSources.size;
      if(mobile)mobile.hidden=!authorizedSources.size;
    }catch(error){
      sidebarScope="";if(side)side.hidden=true;if(mobile)mobile.hidden=true;
    }
  }
  async function show(mode="new"){
    ensureUi();byId("biCustomRoot").hidden=false;
    try{
      await refreshCatalog();
      if(mode==="new")resetDraft();else renderFields();
      if(mode==="list")await loadList();
    }catch(error){status(error.message,true);}
  }
  function renderFilters(){
    const el=byId("biCustomFilters"),src=SOURCES[state.source];if(!el||!src)return;
    el.replaceChildren();
    state.filters.forEach((filter,index)=>{
      const line=document.createElement("div");line.className="bi-custom-filter-row";
      const field=document.createElement("select");field.innerHTML=options(src.dimensions,filter.field);field.value=filter.field;
      field.onchange=()=>{filter.field=field.value;};
      const operator=document.createElement("select");
      operator.innerHTML=[["eq","Igual"],["neq","Diferente"],["contains","Contém"],["gt","Maior que"],["gte","Maior ou igual"],["lt","Menor que"],["lte","Menor ou igual"]].map(([value,label])=>option(value,label,filter.operator)).join("");
      operator.value=filter.operator||"eq";operator.onchange=()=>{filter.operator=operator.value;};
      const input=document.createElement("input");input.placeholder="Valor exato";input.maxLength=120;input.value=filter.value||"";input.oninput=()=>{filter.value=input.value;};
      const remove=document.createElement("button");remove.type="button";remove.textContent="×";remove.title="Remover filtro";remove.onclick=()=>{state.filters.splice(index,1);renderFilters();};
      line.append(field,operator,input,remove);el.append(line);
    });
  }
  function renderFields(){
    const system=context().system;const available=Object.entries(SOURCES).filter(([id,v])=>v.system===system&&authorizedSources.has(id));
    byId("biCustomSource").innerHTML=available.map(([k,v])=>option(k,v.label,state.source)).join("");
    if(!available.some(([k])=>k===state.source)){state.source=available[0]?.[0]||"";}
    const src=SOURCES[state.source];if(!src||!authorizedSources.has(state.source)){byId("biCustomPreview").disabled=true;byId("biCustomForm").querySelector("[type=submit]").disabled=true;status("Nenhuma fonte autorizada está disponível para este sistema.",true);return;}
    byId("biCustomPreview").disabled=false;byId("biCustomForm").querySelector("[type=submit]").disabled=false;
    byId("biCustomSource").value=state.source;
    if(!(state.dimension in src.dimensions))state.dimension=Object.keys(src.dimensions)[0];
    if(!(state.measure in src.measures))state.measure=Object.keys(src.measures)[0];
    byId("biCustomDimension").innerHTML=options(src.dimensions,state.dimension);
    byId("biCustomMeasure").innerHTML=options(src.measures,state.measure);
    renderFilters();byId("biCustomLimit").value=String(state.limit);
    byId("biCustomName").value=state.name;
    byId("biCustomChart").value=state.chart;
    byId("biCustomAggregation").value=state.measure==="count"?"count":state.aggregation;
    byId("biCustomAggregation").disabled=state.measure==="count";
    status("");
  }
  function destroyChart(){if(state.chartInstance){state.chartInstance.destroy();state.chartInstance=null;}}
  function setQueryRunning(active){
    state.fullQueryRunning=active;
    const run=byId("biCustomFullQuery"),cancel=byId("biCustomCancelQuery");
    if(run)run.disabled=active;
    if(cancel)cancel.hidden=!active;
  }
  function mergeAggregate(target,part){
    target.sum+=Number(part.sum||0);target.count+=Number(part.count||0);
    if(part.min!==null&&Number.isFinite(Number(part.min)))
      target.min=target.min===null?part.min:Math.min(Number(target.min),Number(part.min));
    if(part.max!==null&&Number.isFinite(Number(part.max)))
      target.max=target.max===null?part.max:Math.max(Number(target.max),Number(part.max));
  }
  function aggregateValue(group,aggregation){
    return !group.count?0:aggregation==="count"?group.count:aggregation==="avg"?group.sum/group.count:aggregation==="min"?group.min:aggregation==="max"?group.max:group.sum;
  }
  async function runCompleteAnalysis(){
    const scope=context().tenant+":"+context().system,config=cfg(),fingerprint=JSON.stringify(config);
    const seq=++state.previewSeq,groups=new Map(),total={sum:0,count:0,min:null,max:null};
    let cursor=null,scanned=0,loaded=0,last=null;
    setQueryRunning(true);status("Consultando blocos armazenados no cache...");
    try{
      do{
        const result=await request("/api/custom-panels/query","POST",{...config,cursor});
        if(seq!==state.previewSeq||scope!==context().tenant+":"+context().system||fingerprint!==JSON.stringify(cfg()))return;
        for(const group of result.groups||[]){
          let existing=groups.get(group.label);
          if(!existing){
            if(groups.size>=10000)throw Error("Muitas categorias para esta análise. Adicione filtros mais específicos.");
            existing={label:group.label,sum:0,count:0,min:null,max:null};groups.set(group.label,existing);
          }
          mergeAggregate(existing,group);
        }
        mergeAggregate(total,result.total||{});
        scanned+=result.scanned||0;loaded+=result.loaded||0;
        cursor=result.cursor||null;last=result;
        status("Analisadas "+(result.pagesProcessed||0)+" de "+(result.snapshotPages||0)+" páginas · "+scanned.toLocaleString("pt-BR")+" registros lidos.");
      }while(cursor);
      if(!last)return;
      const chronological=/^pagamento:(?:mes|dia|ano)$/.test(config.dimension);
      const rows=[...groups.values()].map(g=>({label:g.label,value:aggregateValue(g,config.aggregation)}))
        .sort((a,b)=>chronological?String(b.label).localeCompare(String(a.label)):b.value-a.value)
        .slice(0,config.limit);
      if(chronological)rows.reverse();
      renderResult({rows,scanned,loaded,totalValue:aggregateValue(total,config.aggregation),
        updatedAt:last.updatedAt,partial:!last.sourceComplete},"full");
    }catch(error){
      if(seq===state.previewSeq)status(error.message,true);
    }finally{
      if(seq===state.previewSeq)setQueryRunning(false);
    }
  }
  async function preview(){
    const scope=context().tenant+":"+context().system;
    const seq=++state.previewSeq;
    try{
      setQueryRunning(false);
      status("Consultando prévia de até 12 páginas...");
      const config=cfg(),fingerprint=JSON.stringify(config);
      const result=await request("/api/custom-panels/preview","POST",config);
      if(scope!==context().tenant+":"+context().system||seq!==state.previewSeq||fingerprint!==JSON.stringify(cfg()))return;
      renderResult(result,"preview");
      status(result.partial?"Prévia parcial: use 'Analisar todos os dados carregados' para agregar as demais páginas.":"Prévia pronta.");
    }catch(e){if(seq===state.previewSeq)status(e.message,true);}
  }
  function renderResult(result,mode="preview"){
    state.previewSignature=JSON.stringify(cfg());
      const rows=result.rows||[];state.previewRows=rows;state.previewPartial=Boolean(result.partial);state.previewKind=mode;destroyChart();
      byId("biCustomList").hidden=true;byId("biCustomTable").innerHTML="";byId("biCustomDrill").hidden=true;
      const wrap=byId("biCustomChartWrap");wrap.hidden=state.chart==="table";
      byId("biCustomInfo").textContent=(mode==="full"?"ANÁLISE COMPLETA":"PRÉVIA")+(result.partial?" · DADOS PARCIAIS":"") +" · "+(result.scanned||0)+" registros lidos · "+(result.loaded||0)+" considerados · "+(result.updatedAt||"cache");
      if(!rows.length){
        wrap.hidden=true;
        byId("biCustomTable").innerHTML='<p class="bi-custom-empty">Nenhum registro encontrado para os filtros selecionados nesta análise'+(result.partial?' parcial':'')+'.</p>';
        status(result.partial?"Dados ainda em atualização; a prévia pode estar incompleta.":"Não foram encontrados registros para a configuração selecionada.");
        return;
      }
      if(state.chart==="table"){
        byId("biCustomTable").innerHTML="<table><thead><tr><th>Categoria</th><th>Valor</th></tr></thead><tbody>"+rows.map(r=>"<tr><td>"+safe(r.label)+"</td><td>"+safe(r.value)+"</td></tr>").join("")+"</tbody></table>";
      }else if(state.chart==="kpi"){
        wrap.hidden=true;byId("biCustomTable").innerHTML='<div class="bi-custom-kpi">'+safe(Number(result.totalValue||0).toLocaleString("pt-BR",{maximumFractionDigits:2}))+(result.partial?" <small>parcial</small>":"")+"</div>";
      }else if(window.Chart){
        const type=state.chart==="horizontalBar"?"bar":state.chart;
        state.chartInstance=new Chart(byId("biCustomCanvas"),{type,data:{labels:rows.map(r=>r.label),datasets:[{label:state.name,data:rows.map(r=>r.value),backgroundColor:["#1673b8","#3c92d1","#68a7d6","#9bbdd9","#b1c9de"],borderColor:"#1673b8",borderWidth:1}]},options:{responsive:true,indexAxis:state.chart==="horizontalBar"?"y":"x",maintainAspectRatio:false,onClick:(_event,elements)=>{const item=elements?.[0];if(item)drillInto(rows[item.index]?.label);}}});
      }
  }

  function exportPreview(){
    if(!state.previewRows.length){status("Atualize a prévia antes de exportar.",true);return;}
    if(state.previewSignature!==JSON.stringify(cfg())){status("A configuração mudou. Atualize a análise antes de exportar.",true);return;}
    const csv=[["Categoria","Valor"],...state.previewRows.map(r=>[r.label,r.value])].map(row=>row.map(value=>'"'+String(value??"").replace(/"/g,'""')+'"').join(";")).join("\r\n");
    const blob=new Blob([String.fromCharCode(0xFEFF)+csv],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);const anchor=document.createElement("a");anchor.href=url;
    anchor.download="bi-vella-"+(state.previewKind==="full"?"analise":"previa")+"-top"+state.limit+(state.previewPartial?"-parcial":"")+".csv";anchor.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function drillInto(category){
    if(category==null)return;
    const panel=byId("biCustomDrill");panel.hidden=false;panel.textContent="Carregando registros da categoria "+category+"...";
    try{
      const scope=context().tenant+":"+context().system;
      const result=await request("/api/custom-panels/preview","POST",{...cfg(),drillCategory:String(category)});
      if(scope!==context().tenant+":"+context().system||byId("biCustomRoot").hidden)return;
      const rows=result.drillRows||[];
      panel.innerHTML="<h3>Detalhamento: "+safe(category)+"</h3>"+(result.partial?"<p>Dados parciais. A carga completa ainda não foi considerada.</p>":"")+
        "<p>Mostrando até 50 registros do cache consultado.</p><table><thead><tr><th>Categoria</th><th>Valor</th></tr></thead><tbody>"+
        rows.map(r=>"<tr><td>"+safe(r.categoria)+"</td><td>"+safe(r.valor)+"</td></tr>").join("")+"</tbody></table>";
    }catch(error){panel.textContent=error.message;}
  }
  async function loadList(){
    const scope=context().tenant+":"+context().system;
    try{
      const response=await request("/api/custom-panels");
      if(scope!==context().tenant+":"+context().system)return;
      const box=byId("biCustomList");box.hidden=false;box.innerHTML="<strong>Meus painéis</strong>"+(response.panels||[]).map(p=>'<article><span>'+safe(p.name)+'</span><button type="button" data-edit="'+safe(p.id)+'">Editar</button><button type="button" data-link="'+safe(p.id)+'">Copiar link</button><button type="button" data-dup="'+safe(p.id)+'">Duplicar</button><button type="button" data-del="'+safe(p.id)+'">Excluir</button></article>').join("");
      box.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>openPanel(response.panels.find(p=>p.id===b.dataset.edit)));
      box.querySelectorAll("[data-link]").forEach(b=>b.onclick=async()=>{const link=new URL(location.href);link.hash="painel="+encodeURIComponent(b.dataset.link);try{await navigator.clipboard.writeText(link.toString());status("Link copiado.");}catch(error){status("Não foi possível copiar. Use o endereço: "+link.toString(),true);}});
      box.querySelectorAll("[data-dup]").forEach(b=>b.onclick=()=>openPanel(response.panels.find(p=>p.id===b.dataset.dup),true));
      box.querySelectorAll("[data-del]").forEach(b=>b.onclick=async()=>{if(!confirm("Excluir este painel?"))return;try{await request("/api/custom-panels/"+encodeURIComponent(b.dataset.del),"DELETE");await loadList();await loadSidebar(true);}catch(e){status(e.message,true);}});
      status("");
    }catch(e){status(e.message,true);}
  }
  function openPanel(panel,duplicate=false){
    if(!panel)return;
    Object.assign(state,{id:duplicate?null:panel.id,name:duplicate?panel.name+" (cópia)":panel.name,source:panel.source,dimension:panel.dimension,measure:panel.measure,aggregation:panel.aggregation,chart:panel.chart,filters:Array.isArray(panel.filters)?panel.filters.map(f=>({...f})):[],limit:panel.limit||20});
    renderFields();byId("biCustomList").hidden=true;if(!duplicate)history.replaceState(null,"",location.pathname+location.search+"#painel="+encodeURIComponent(panel.id));preview();
  }
  async function openSavedFromUrl(){
    const params=new URLSearchParams(location.hash.slice(1));
    const id=params.get("painel");
    if(!id||!/^[a-f0-9-]{36}$/i.test(id))return;
    ensureUi();
    if(!context().tenant||context().system!=="tributos")return;
    try {
      const scope=context().tenant+":"+context().system;
      await refreshCatalog();
      const result=await request("/api/custom-panels/"+encodeURIComponent(id));
      if(scope!==context().tenant+":"+context().system||context().system!=="tributos")return;
      byId("biCustomRoot").hidden=false;
      openPanel(result.panel);
    }catch(error){status(error.message,true);}
  }

  window.addEventListener("hashchange",openSavedFromUrl);
  window.addEventListener("popstate",openSavedFromUrl);
  let lastContext="";
  const timer=setInterval(()=>{
    const gate=byId("authGate"),unauthenticated=Boolean(gate&&!gate.hidden);
    const {tenant,system}=context(),scope=tenant+":"+system;
    const open=byId("biCustomOpen");
    if(open)open.hidden=unauthenticated||!tenant||system!=="tributos";
    if(unauthenticated){
      if(lastContext){
        lastContext="";sidebarScope="";catalogScope="";authorizedSources.clear();
        byId("customPanelSidebarItems")?.replaceChildren();
        byId("biCustomList")?.replaceChildren();
        if(byId("biCustomRoot"))byId("biCustomRoot").hidden=true;
        state.id=null;state.previewRows=[];state.previewSeq++;destroyChart();
      }
      if(byId("customPanelSidebar"))byId("customPanelSidebar").hidden=true;
      if(byId("mobileCustomPanelButton"))byId("mobileCustomPanelButton").hidden=true;
      return;
    }
    if(scope!==lastContext){
      lastContext=scope;sidebarScope="";catalogScope="";authorizedSources.clear();
      byId("customPanelSidebarItems")?.replaceChildren();
      if(byId("biCustomRoot"))byId("biCustomRoot").hidden=true;
      state.id=null;state.previewRows=[];state.previewSeq++;destroyChart();
      if(tenant&&system==="tributos"){loadSidebar(true);openSavedFromUrl();}
      else{if(byId("customPanelSidebar"))byId("customPanelSidebar").hidden=true;if(byId("mobileCustomPanelButton"))byId("mobileCustomPanelButton").hidden=true;}
    }
  },1500);
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ensureUi);else ensureUi();
  window.BIVellaCustomPanels={open:show};
})();
