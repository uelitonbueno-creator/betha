/* BI Vella | construtor de painéis personalizados - primeira versão */
(() => {
  "use strict";
  const SOURCES = {
    "bi:debitos": {label:"Débitos",system:"tributos",dimensions:{situacao:"Situação",ano:"Exercício",bairro:"Bairro",receita:"Receita"},measures:{vlLancado:"Valor lançado",valorSaldo:"Saldo"}},
    "bi:pagamentos": {label:"Pagamentos",system:"tributos",dimensions:{ano:"Exercício",receita:"Receita",dataPagamento:"Data do pagamento"},measures:{valorPago:"Valor pago"}},
    "bi:imoveis": {label:"Imóveis",system:"tributos",dimensions:{bairro:"Bairro",zona:"Zona",situacao:"Situação"},measures:{count:"Quantidade"}},
    "bi:parcelamentos": {label:"Parcelamentos",system:"tributos",dimensions:{situacao:"Situação",ano:"Exercício"},measures:{count:"Quantidade"}}
  };
  const state={id:null,source:"bi:debitos",chart:"bar",dimension:"bairro",measure:"valorSaldo",aggregation:"sum",filterField:"",filterValue:"",filters:[],limit:20,name:"Débitos por bairro",panels:[],chartInstance:null,loading:false,previewRows:[],previewPartial:false};
  const byId=id=>document.getElementById(id);
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
    const style=document.createElement("link");style.rel="stylesheet";style.href="custom-panel-builder.css?v=1";document.head.appendChild(style);
    const open=document.createElement("button");open.id="biCustomOpen";open.className="bi-custom-open";open.type="button";open.textContent="+ Novo painel";open.onclick=()=>show();document.body.appendChild(open);
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
          <div class="bi-custom-actions"><button type="button" id="biCustomPreview">Atualizar prévia</button><button type="button" id="biCustomExport">Exportar CSV (prévia)</button><button type="submit" class="bi-custom-primary">Salvar painel</button></div>
          <p id="biCustomStatus" role="status"></p>
        </form><div class="bi-custom-preview"><div class="bi-custom-preview-title"><strong>Pré-visualização</strong><small id="biCustomInfo">Dados do cache autorizado</small></div><div id="biCustomChartWrap"><canvas id="biCustomCanvas"></canvas></div><div id="biCustomTable"></div><div id="biCustomDrill" hidden></div><div id="biCustomList" hidden></div></div></div>
      </div>`;
    document.body.appendChild(root);
    byId("biCustomClose").onclick=()=>{root.hidden=true;destroyChart();if(location.hash.includes("painel="))history.replaceState(null,"",location.pathname+location.search);};
    byId("biCustomNew").onclick=()=>{state.id=null;state.name="Novo painel";state.filters=[];state.limit=20;renderFields();byId("biCustomList").hidden=true;};
    byId("biCustomListButton").onclick=loadList;
    byId("biCustomSource").onchange=e=>{state.source=e.target.value;const def=SOURCES[state.source];state.dimension=Object.keys(def.dimensions)[0];state.measure=Object.keys(def.measures)[0];state.filters=[];renderFields();};
    for(const [id,key] of [["biCustomName","name"],["biCustomDimension","dimension"],["biCustomMeasure","measure"],["biCustomAggregation","aggregation"],["biCustomChart","chart"]])byId(id).addEventListener("change",e=>{state[key]=e.target.value;});
    byId("biCustomAddFilter").onclick=()=>{if(state.filters.length>=6)return status("Limite de seis filtros.",true);state.filters.push({field:Object.keys(SOURCES[state.source].dimensions)[0],operator:"eq",value:""});renderFilters();};
    byId("biCustomLimit").onchange=e=>{state.limit=Number(e.target.value);};
    byId("biCustomPreview").onclick=preview;
    byId("biCustomExport").onclick=exportPreview;
    byId("biCustomForm").onsubmit=async e=>{e.preventDefault();try{state.name=byId("biCustomName").value;const result=await request(state.id?"/api/custom-panels/"+encodeURIComponent(state.id):"/api/custom-panels",state.id?"PUT":"POST",cfg());state.id=result.panel.id;history.replaceState(null,"",location.pathname+location.search+"#painel="+encodeURIComponent(state.id));status("Painel salvo. O endereço desta página permite reabrir a análise.");}catch(e){status(e.message,true);}};
  }
  function status(message,error=false){const el=byId("biCustomStatus");el.textContent=message;el.classList.toggle("error",error);}
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
    const system=context().system;const available=Object.entries(SOURCES).filter(([,v])=>v.system===system);
    byId("biCustomSource").innerHTML=available.map(([k,v])=>option(k,v.label,state.source)).join("");
    if(!available.some(([k])=>k===state.source)){state.source=available[0]?.[0]||"";}
    const src=SOURCES[state.source];if(!src){status("Ainda não há fontes habilitadas para este sistema.");return;}
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
  async function preview(){
    try{
      status("Consultando cache...");
      const result=await request("/api/custom-panels/preview","POST",cfg());
      const rows=result.rows||[];state.previewRows=rows;state.previewPartial=Boolean(result.partial);destroyChart();
      byId("biCustomList").hidden=true;byId("biCustomTable").innerHTML="";byId("biCustomDrill").hidden=true;
      const wrap=byId("biCustomChartWrap");wrap.hidden=state.chart==="table";
      byId("biCustomInfo").textContent=(result.partial?"Prévia parcial · ":"")+(result.loaded||0)+" registros consultados · "+(result.updatedAt||"cache");
      if(state.chart==="table"){
        byId("biCustomTable").innerHTML="<table><thead><tr><th>Categoria</th><th>Valor</th></tr></thead><tbody>"+rows.map(r=>"<tr><td>"+safe(r.label)+"</td><td>"+safe(r.value)+"</td></tr>").join("")+"</tbody></table>";
      }else if(state.chart==="kpi"){
        wrap.hidden=true;byId("biCustomTable").innerHTML='<div class="bi-custom-kpi">'+safe(rows.reduce((n,r)=>n+Number(r.value||0),0).toLocaleString("pt-BR"))+"</div>";
      }else if(window.Chart){
        const type=state.chart==="horizontalBar"?"bar":state.chart;
        state.chartInstance=new Chart(byId("biCustomCanvas"),{type,data:{labels:rows.map(r=>r.label),datasets:[{label:state.name,data:rows.map(r=>r.value),backgroundColor:["#1673b8","#3c92d1","#68a7d6","#9bbdd9","#b1c9de"],borderColor:"#1673b8",borderWidth:1}]},options:{responsive:true,indexAxis:state.chart==="horizontalBar"?"y":"x",maintainAspectRatio:false,onClick:(_event,elements)=>{const item=elements?.[0];if(item)drillInto(rows[item.index]?.label);}}});
      }
      status(result.partial?"Prévia baseada em parte dos dados carregados.":"Prévia pronta.");
    }catch(e){status(e.message,true);}
  }


  function exportPreview(){
    if(!state.previewRows.length){status("Atualize a prévia antes de exportar.",true);return;}
    const csv=[["Categoria","Valor"],...state.previewRows.map(r=>[r.label,r.value])].map(row=>row.map(value=>'"'+String(value??"").replace(/"/g,'""')+'"').join(";")).join("\r\n");
    const blob=new Blob([String.fromCharCode(0xFEFF)+csv],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);const anchor=document.createElement("a");anchor.href=url;
    anchor.download="bi-vella-previa"+(state.previewPartial?"-parcial":"")+".csv";anchor.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function drillInto(category){
    if(category==null)return;
    const panel=byId("biCustomDrill");panel.hidden=false;panel.textContent="Carregando registros da categoria "+category+"...";
    try{
      const result=await request("/api/custom-panels/preview","POST",{...cfg(),drillCategory:String(category)});
      const rows=result.drillRows||[];
      panel.innerHTML="<h3>Detalhamento: "+safe(category)+"</h3>"+(result.partial?"<p>Dados parciais. A carga completa ainda não foi considerada.</p>":"")+
        "<p>Mostrando até 50 registros do cache consultado.</p><table><thead><tr><th>Categoria</th><th>Valor</th></tr></thead><tbody>"+
        rows.map(r=>"<tr><td>"+safe(r.categoria)+"</td><td>"+safe(r.valor)+"</td></tr>").join("")+"</tbody></table>";
    }catch(error){panel.textContent=error.message;}
  }
  async function loadList(){
    try{
      const response=await request("/api/custom-panels");
      const box=byId("biCustomList");box.hidden=false;box.innerHTML="<strong>Meus painéis</strong>"+(response.panels||[]).map(p=>'<article><span>'+safe(p.name)+'</span><button type="button" data-edit="'+safe(p.id)+'">Editar</button><button type="button" data-link="'+safe(p.id)+'">Copiar link</button><button type="button" data-dup="'+safe(p.id)+'">Duplicar</button><button type="button" data-del="'+safe(p.id)+'">Excluir</button></article>').join("");
      box.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>openPanel(response.panels.find(p=>p.id===b.dataset.edit)));
      box.querySelectorAll("[data-link]").forEach(b=>b.onclick=async()=>{const link=new URL(location.href);link.hash="painel="+encodeURIComponent(b.dataset.link);try{await navigator.clipboard.writeText(link.toString());status("Link copiado.");}catch(error){status("Não foi possível copiar. Use o endereço: "+link.toString(),true);}});
      box.querySelectorAll("[data-dup]").forEach(b=>b.onclick=()=>openPanel(response.panels.find(p=>p.id===b.dataset.dup),true));
      box.querySelectorAll("[data-del]").forEach(b=>b.onclick=async()=>{if(!confirm("Excluir este painel?"))return;try{await request("/api/custom-panels/"+encodeURIComponent(b.dataset.del),"DELETE");await loadList();}catch(e){status(e.message,true);}});
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
    if(!context().tenant)return;
    try {
      const result=await request("/api/custom-panels/"+encodeURIComponent(id));
      byId("biCustomRoot").hidden=false;
      openPanel(result.panel);
    }catch(error){status(error.message,true);}
  }
  function show(){ensureUi();byId("biCustomRoot").hidden=false;renderFields();}
  window.addEventListener("hashchange",openSavedFromUrl);
  window.addEventListener("popstate",openSavedFromUrl);
  let lastContext="";
  const timer=setInterval(()=>{const gate=byId("authGate");const open=byId("biCustomOpen");if(open)open.hidden=Boolean(gate&&!gate.hidden)||!context().tenant||context().system!=="tributos";const scope=context().tenant+":"+context().system;if(scope!==lastContext){lastContext=scope;if(byId("biCustomRoot"))byId("biCustomRoot").hidden=true;state.id=null;state.previewRows=[];destroyChart();if(scope.split(":")[0])openSavedFromUrl();}},1500);
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ensureUi);else ensureUi();
  window.BIVellaCustomPanels={open:show};
})();
