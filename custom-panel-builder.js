/* BI Vella | construtor de painéis personalizados - primeira versão */
(() => {
  "use strict";
  const SOURCES = {
    "bi:debitos": {label:"Débitos",system:"tributos",dimensions:{situacao:"Situação",ano:"Exercício",bairro:"Bairro",receita:"Receita"},measures:{vlLancado:"Valor lançado",valorSaldo:"Saldo"}},
    "bi:pagamentos": {label:"Pagamentos",system:"tributos",dimensions:{ano:"Exercício",receita:"Receita",dataPagamento:"Data do pagamento"},measures:{valorPago:"Valor pago"}},
    "bi:imoveis": {label:"Imóveis",system:"tributos",dimensions:{bairro:"Bairro",zona:"Zona",situacao:"Situação"},measures:{count:"Quantidade"}},
    "bi:parcelamentos": {label:"Parcelamentos",system:"tributos",dimensions:{situacao:"Situação",ano:"Exercício"},measures:{count:"Quantidade"}}
  };
  const state={id:null,source:"bi:debitos",chart:"bar",dimension:"bairro",measure:"valorSaldo",aggregation:"sum",filterField:"",filterValue:"",name:"Débitos por bairro",panels:[],chartInstance:null,loading:false,previewRows:[],previewPartial:false};
  const byId=id=>document.getElementById(id);
  const safe=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function context(){const s=window.BIVellaSearchContext?.getState?.()||{};return {tenant:String(s.tenantId||s.tenant?.id||new URLSearchParams(location.search).get("tenant")||""),system:s.currentSystemId||"tributos"};}
  function apiUrl(path){return String(window.BI_CONFIG?.BACKEND_URL||"").replace(/\/$/,"")+path;}
  async function request(path,method="GET",payload){
    const {tenant}=context();if(!tenant)throw Error("Selecione uma entidade antes de criar o painel.");
    const r=await fetch(apiUrl(path),{method,credentials:"include",headers:{"Content-Type":"application/json","X-Tenant-Id":tenant},body:payload===undefined?undefined:JSON.stringify(payload)});
    const data=await r.json().catch(()=>({}));if(!r.ok)throw Error(data.error||"Não foi possível executar a operação.");return data;
  }
  const option=(value,label,selected)=>'<option value="'+safe(value)+'"'+(String(value)===String(selected)?" selected":"")+">"+safe(label)+"</option>";
  const options=(map,selected)=>Object.entries(map).map(([k,v])=>option(k,v,selected)).join("");
  const cfg=()=>({name:state.name.trim(),system:context().system,source:state.source,dimension:state.dimension,measure:state.measure,aggregation:state.measure==="count"?"count":state.aggregation,chart:state.chart,filters:state.filterField&&state.filterValue!==""?[{field:state.filterField,operator:"eq",value:state.filterValue}]:[],limit:20,config_version:1});
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
          <label>Filtrar por<select id="biCustomFilterField"></select></label>
          <label>Valor do filtro<input id="biCustomFilterValue" maxlength="120" placeholder="Opcional"></label>
          <label>Visualização<select id="biCustomChart"><option value="bar">Barras</option><option value="horizontalBar">Barras horizontais</option><option value="line">Linhas</option><option value="doughnut">Donut</option><option value="pie">Pizza</option><option value="table">Tabela</option><option value="kpi">Indicador KPI</option></select></label>
          <div class="bi-custom-actions"><button type="button" id="biCustomPreview">Atualizar prévia</button><button type="button" id="biCustomExport">Exportar CSV (prévia)</button><button type="submit" class="bi-custom-primary">Salvar painel</button></div>
          <p id="biCustomStatus" role="status"></p>
        </form><div class="bi-custom-preview"><div class="bi-custom-preview-title"><strong>Pré-visualização</strong><small id="biCustomInfo">Dados do cache autorizado</small></div><div id="biCustomChartWrap"><canvas id="biCustomCanvas"></canvas></div><div id="biCustomTable"></div><div id="biCustomDrill" hidden></div><div id="biCustomList" hidden></div></div></div>
      </div>`;
    document.body.appendChild(root);
    byId("biCustomClose").onclick=()=>{root.hidden=true;destroyChart();};
    byId("biCustomNew").onclick=()=>{state.id=null;state.name="Novo painel";renderFields();byId("biCustomList").hidden=true;};
    byId("biCustomListButton").onclick=loadList;
    byId("biCustomSource").onchange=e=>{state.source=e.target.value;const def=SOURCES[state.source];state.dimension=Object.keys(def.dimensions)[0];state.measure=Object.keys(def.measures)[0];state.filterField="";renderFields();};
    for(const [id,key] of [["biCustomName","name"],["biCustomDimension","dimension"],["biCustomMeasure","measure"],["biCustomAggregation","aggregation"],["biCustomChart","chart"],["biCustomFilterField","filterField"],["biCustomFilterValue","filterValue"]])byId(id).addEventListener("change",e=>{state[key]=e.target.value;});
    byId("biCustomPreview").onclick=preview;
    byId("biCustomExport").onclick=exportPreview;
    byId("biCustomForm").onsubmit=async e=>{e.preventDefault();try{state.name=byId("biCustomName").value;const result=await request(state.id?"/api/custom-panels/"+encodeURIComponent(state.id):"/api/custom-panels",state.id?"PUT":"POST",cfg());state.id=result.panel.id;status("Painel salvo. Abra em Meus painéis para editar.");}catch(e){status(e.message,true);}};
  }
  function status(message,error=false){const el=byId("biCustomStatus");el.textContent=message;el.classList.toggle("error",error);}
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
    byId("biCustomFilterField").innerHTML=option("","Sem filtro",state.filterField)+options(src.dimensions,state.filterField);
    byId("biCustomFilterValue").value=state.filterValue;
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
    const blob=new Blob(["\\uFEFF".replace("\\\\uFEFF","\\uFEFF")+csv],{type:"text/csv;charset=utf-8"});
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
      const box=byId("biCustomList");box.hidden=false;box.innerHTML="<strong>Meus painéis</strong>"+(response.panels||[]).map(p=>'<article><span>'+safe(p.name)+'</span><button type="button" data-edit="'+safe(p.id)+'">Editar</button><button type="button" data-dup="'+safe(p.id)+'">Duplicar</button><button type="button" data-del="'+safe(p.id)+'">Excluir</button></article>').join("");
      box.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>openPanel(response.panels.find(p=>p.id===b.dataset.edit)));
      box.querySelectorAll("[data-dup]").forEach(b=>b.onclick=()=>openPanel(response.panels.find(p=>p.id===b.dataset.dup),true));
      box.querySelectorAll("[data-del]").forEach(b=>b.onclick=async()=>{if(!confirm("Excluir este painel?"))return;try{await request("/api/custom-panels/"+encodeURIComponent(b.dataset.del),"DELETE");await loadList();}catch(e){status(e.message,true);}});
      status("");
    }catch(e){status(e.message,true);}
  }
  function openPanel(panel,duplicate=false){
    if(!panel)return;
    Object.assign(state,{id:duplicate?null:panel.id,name:duplicate?panel.name+" (cópia)":panel.name,source:panel.source,dimension:panel.dimension,measure:panel.measure,aggregation:panel.aggregation,chart:panel.chart,filterField:panel.filters?.[0]?.field||"",filterValue:panel.filters?.[0]?.value||""});
    renderFields();byId("biCustomList").hidden=true;preview();
  }
  function show(){ensureUi();byId("biCustomRoot").hidden=false;renderFields();}
  const timer=setInterval(()=>{const gate=byId("authGate");const open=byId("biCustomOpen");if(open)open.hidden=Boolean(gate&&!gate.hidden)||!context().tenant;},1500);
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ensureUi);else ensureUi();
  window.BIVellaCustomPanels={open:show};
})();
