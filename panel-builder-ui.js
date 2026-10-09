/* Editor de definições de painéis BI Vella.
 * Apenas rascunhos locais: não consulta nem persiste dados municipais.
 * A publicação exige backend autorizado, implementado separadamente.
 */
(function(){
"use strict";
const core=window.BIPanelBuilderCore;
if(!core)return;
const ready=()=>Boolean(window.BIVellaSearchContext?.getState);
let dirty=false;
const make=(tag,attrs={},text)=>{const el=document.createElement(tag);Object.entries(attrs).forEach(([k,v])=>{if(k==="className")el.className=v;else el.setAttribute(k,v)});if(text!==undefined)el.textContent=text;return el;};
function init(){
if(!ready()){setTimeout(init,700);return;}
const trigger=make("button",{type:"button",className:"bi-builder-launch",title:"Criar definição de painel"},"＋ Criar painel");
const dialog=make("section",{className:"bi-builder-modal",role:"dialog","aria-modal":"true","aria-label":"Construtor de painéis"});
dialog.hidden=true;
const panel=make("div",{className:"bi-builder-card"});
const header=make("header",{className:"bi-builder-head"});
header.append(make("h2",{},"Criar painel personalizado"));
const close=make("button",{type:"button","aria-label":"Fechar construtor"},"✕");header.append(close);panel.append(header);
const note=make("p",{},"Construtor de painéis. Fontes demonstrativas são identificadas; somente fontes autorizadas podem consultar dados reais.");
const sourceStatus=make("div",{className:"bi-builder-source-status",role:"status","aria-live":"polite"});
panel.append(note,sourceStatus);
const form=make("form",{className:"bi-builder-form"});
const title=make("input",{name:"title",maxlength:"120",required:"",placeholder:"Ex.: Receita por mês"});
const source=make("select",{name:"sourceId",required:""});
const type=make("select",{name:"type"});
[["bar","Barras"],["line","Linhas"],["doughnut","Rosca"],["table","Tabela"],["kpi","Indicador"]].forEach(([v,label])=>type.append(make("option",{value:v},label)));
const dimension=make("select",{name:"dimension"});
const measure=make("select",{name:"measure"});
const agg=make("select",{name:"aggregation"});
[["sum","Soma"],["avg","Média"],["min","Mínimo"],["max","Máximo"],["count","Contagem"]].forEach(([v,l])=>agg.append(make("option",{value:v},l)));
function field(label,element){const wrapper=make("label",{},label);wrapper.append(element);form.append(wrapper);}
field("Título",title);field("Fonte disponível no catálogo",source);field("Visualização",type);field("Dimensão",dimension);field("Métrica",measure);field("Agregação",agg);
const status=make("p",{role:"status","aria-live":"polite",className:"bi-builder-status"},"");
const output=make("pre",{className:"bi-builder-json","aria-label":"Definição JSON"});
const actions=make("div",{className:"bi-builder-actions"});
const build=make("button",{type:"submit"},"Validar definição");
const download=make("button",{type:"button"},"Exportar JSON");download.disabled=true;
const preview=make("button",{type:"button"},"Prévia de dados");preview.disabled=true;
const previewOutput=make("div",{className:"bi-builder-preview",role:"status","aria-live":"polite"});
const placement=make("select",{"aria-label":"Adicionar ao painel"});
const save=make("button",{type:"button"},"Salvar rascunho");save.disabled=true;
const drafts=make("select",{"aria-label":"Rascunhos salvos"});drafts.append(make("option",{value:""},"Rascunhos salvos"));
const load=make("button",{type:"button"},"Abrir rascunho");
const remove=make("button",{type:"button"},"Excluir rascunho");
actions.append(build,preview,download,placement,save,drafts,load,remove);form.append(actions,status,output,previewOutput);panel.append(form);dialog.append(panel);document.body.append(trigger,dialog);
let catalog=[],context=null,current=null,selectedDraftId="",selectedSortOrder=0,previewChart=null,previewRequest=0;
function clearPreview(){previewRequest++;if(previewChart){previewChart.destroy();previewChart=null;}previewOutput.replaceChildren();}
function remote(){
  const tenant=String(window.BIVellaSearchContext?.getState?.()?.tenantId||context?.tenantId||new URLSearchParams(location.search).get("tenant")||new URLSearchParams(location.search).get("entidadeId")||"");
  const base=String(window.BI_CONFIG?.BACKEND_URL||"").replace(/\/$/,"");
  if(!tenant||!base)throw new Error("Contexto de entidade ou backend indisponível.");
  return {endpoint:base+"/api/panel-drafts?system="+encodeURIComponent(context.currentSystemId),tenant};
}
async function requestDraft(method,id,payload){
  const {endpoint,tenant}=remote();const address=id?endpoint.replace("/api/panel-drafts?","/api/panel-drafts/"+encodeURIComponent(id)+"?"):endpoint;
  const response=await fetch(address,{method,credentials:"include",headers:{"X-Tenant-Id":tenant,...(payload?{"Content-Type":"application/json"}:{})},...(payload?{body:JSON.stringify(payload)}:{})});
  const result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||"Falha ao acessar rascunhos.");return result;
}
async function requestBuilder(method,action,payload){
  const {tenant}=remote(),base=String(window.BI_CONFIG?.BACKEND_URL||"").replace(/\/$/,"");
  const response=await fetch(base+"/api/panel-builder/"+action+"?system="+encodeURIComponent(context.currentSystemId),{
    method,credentials:"include",headers:{"X-Tenant-Id":tenant,...(payload?{"Content-Type":"application/json"}:{})},
    ...(payload?{body:JSON.stringify(payload)}:{})
  });
  const body=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(body.error||"Serviço de prévia indisponível.");
  return body;
}
async function refreshDrafts(){try{const result=await requestDraft("GET");options(drafts,[["","Rascunhos salvos"],...(result.items||[]).map(x=>[x.id,x.title])]);drafts._items=result.items||[];}catch(err){status.textContent="Rascunhos remotos: "+err.message;}}

function options(element,values){element.replaceChildren(...values.map(([v,l])=>make("option",{value:v},l)));}
function fillFields(){
const selected=catalog.find(s=>s.id===source.value);
const fields=selected?.fields||[];
options(dimension,fields.filter(f=>f.dimension).map(f=>[f.id,f.id]));
options(measure,[["*","Total de registros"],...fields.filter(f=>f.measure).map(f=>[f.id,f.id])]);
const usable=Boolean(selected&&fields.some(f=>f.dimension));build.disabled=!usable;
if(!usable)status.textContent="Esta fonte ainda não possui dimensões disponíveis para edição.";
}
async function open(){
context=window.BIVellaSearchContext.getState();
options(placement,[["","Não adicionar ao painel"],...(context.allowedViews||[]).map(v=>[v,v])]);
catalog=[];sourceStatus.textContent="";
if(window.BIPanelSampleBuilder?.catalog(context.currentSystemId).length){
  catalog=window.BIPanelSampleBuilder.catalog(context.currentSystemId);
  try{const live=await requestBuilder("GET","catalog");catalog.push(...(live.sources||[]).filter(x=>x.mode==="cached-real"));}catch{}
  status.textContent="AMOSTRA LOCAL — dados demonstrativos, sem consulta à Betha.";
  try{
    const sourceReport=await requestBuilder("GET","source-status");
    const available=(sourceReport.resources||[]).filter(x=>x.records>0);
    sourceStatus.textContent=available.length
      ? "Cargas reais identificadas: "+available.map(x=>x.resource+" ("+x.records+" registros)").join("; ")+". Execução personalizada real ainda não habilitada."
      : "Nenhuma carga real disponível para consulta personalizada. Editor em modo AMOSTRA LOCAL.";
  }catch(e){sourceStatus.textContent="Estado das cargas reais indisponível. Editor em modo AMOSTRA LOCAL.";}
}
else try{const response=await requestBuilder("GET","catalog");catalog=(response.sources||[]).filter(s=>s.fields.some(f=>f.dimension)&&s.fields.some(f=>f.measure));}catch(err){status.textContent="Catálogo não disponível: "+err.message;}
options(source,catalog.map(s=>[s.id,s.id]));
title.value="";type.value="bar";agg.value="sum";if(!catalog.some(x=>x.mode==="sample"))status.textContent="";output.textContent="";clearPreview();current=null;download.disabled=true;preview.disabled=true;
fillFields();dialog.hidden=false;dirty=false;selectedDraftId="";selectedSortOrder=0;placement.value="";save.disabled=true;close.focus();await refreshDrafts();
}
function dismiss(){clearPreview();dialog.hidden=true;trigger.focus();}
trigger.addEventListener("click",open);
close.addEventListener("click",dismiss);
dialog.addEventListener("click",e=>{if(e.target===dialog)dismiss();});
document.addEventListener("keydown",e=>{if(dialog.hidden)return;if(e.key==="Escape")dismiss();if(e.key==="Tab"){const f=[...dialog.querySelectorAll("button:not(:disabled),input:not(:disabled),select:not(:disabled)")];if(!f.length)return;const first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
source.addEventListener("change",()=>{fillFields();current=null;download.disabled=true;save.disabled=true;preview.disabled=true;clearPreview();});
[title,type,dimension,measure,agg].forEach(el=>el.addEventListener("change",()=>{current=null;save.disabled=true;preview.disabled=true;clearPreview();}));
form.addEventListener("submit",e=>{
e.preventDefault();
const metric=measure.value==="*"?{field:"*",aggregation:"count"}:{field:measure.value,aggregation:agg.value};
const definition={title:title.value.trim(),sourceId:source.value,type:type.value,
dimension:dimension.value,measures:[metric],filters:[]};
const result=core.validate(definition,catalog,{tenantId:"editor-local",systemId:context.currentSystemId});
if(!result.ok){status.textContent=result.errors.join(" ");download.disabled=true;current=null;return;}
current=definition;output.textContent=JSON.stringify(definition,null,2);save.disabled=definition.sourceId.startsWith("sample:");preview.disabled=false;
status.textContent=definition.sourceId.startsWith("sample:")?"AMOSTRA LOCAL: prévia e exportação JSON disponíveis.":definition.sourceId.startsWith("cache:")?"CACHE REAL: prévia de até 500 registros; salvamento sujeito à autorização do Worker.":"Definição validada localmente. Não publicada.";download.disabled=false;
});
preview.addEventListener("click",async()=>{
if(!current)return;
clearPreview();const generation=previewRequest,definition=JSON.parse(JSON.stringify(current));
preview.disabled=true;
try{
const result=definition.sourceId.startsWith("sample:")?await window.BIPanelSampleBuilder.preview(definition,context.currentSystemId):await requestBuilder("POST","preview",{definition});
if(generation!==previewRequest||dialog.hidden)return;
const rows=Array.isArray(result.rows)?result.rows.slice(0,40):[];
previewOutput.append(make("strong",{},"Prévia parcial — "+result.scanned+" registros examinados"));
if(!rows.length){previewOutput.append(make("p",{},"Nenhum registro disponível para esta seleção."));return;}
if(definition.type!=="table"){
 if(typeof window.Chart!=="function")previewOutput.append(make("p",{},"Chart.js indisponível; exibindo tabela."));
 else{
  const wrapper=make("div",{className:"bi-builder-chart-container"});
  const canvas=make("canvas",{"aria-label":"Gráfico preliminar: "+definition.title,role:"img"});
  wrapper.append(canvas);previewOutput.append(wrapper);
  const labels=rows.map(r=>String(r.dimension));
  const datasets=definition.measures.map((m,i)=>({
    label:m.aggregation+"("+m.field+")",
    data:rows.map(r=>typeof r.values?.[i]==="number"?r.values[i]:null)
  }));
  const typeMap={bar:"bar",line:"line",doughnut:"doughnut",kpi:"bar"};
  const chartType=typeMap[definition.type]||"bar";
  // Para gráficos de rosca, cada métrica usa um anel independente.
  previewChart=new window.Chart(canvas,{
    type:chartType,data:{labels,datasets},
    options:{responsive:true,maintainAspectRatio:false,animation:false,
      plugins:{legend:{display:datasets.length>1||chartType==="doughnut"}},
      ...(chartType==="doughnut"?{}:{scales:{y:{beginAtZero:true}}})}
  });
 }
}
const table=make("table",{"aria-label":"Resultado preliminar do painel"});
const head=make("tr");head.append(make("th",{},"Dimensão"));
definition.measures.forEach(m=>head.append(make("th",{},m.aggregation+"("+m.field+")")));
const thead=make("thead");thead.append(head);table.append(thead);
const tbody=make("tbody");
for(const row of rows){const tr=make("tr");tr.append(make("td",{},row.dimension));for(const v of row.values||[])tr.append(make("td",{},v==null?"—":Number(v).toLocaleString("pt-BR",{maximumFractionDigits:2})));tbody.append(tr);}
table.append(tbody);previewOutput.append(table,make("p",{},"Prévia parcial limitada; não corresponde necessariamente aos totais consolidados."));
}catch(err){if(generation===previewRequest)previewOutput.textContent="Prévia indisponível: "+err.message;}
finally{if(generation===previewRequest)preview.disabled=false;}
});
save.addEventListener("click",async()=>{if(!current)return;save.disabled=true;try{const result=await requestDraft(selectedDraftId?"PUT":"POST",selectedDraftId||"",{definition:current,viewId:placement.value,sortOrder:selectedSortOrder});selectedDraftId=result.id||selectedDraftId;status.textContent="Rascunho salvo no D1.";window.dispatchEvent(new Event("bi-panel-drafts-changed"));await refreshDrafts();drafts.value=selectedDraftId;}catch(err){status.textContent="Não foi possível salvar: "+err.message;}finally{save.disabled=false;}});
load.addEventListener("click",()=>{const item=(drafts._items||[]).find(x=>x.id===drafts.value);if(!item)return;const d=item.definition;if(!catalog.some(x=>x.id===d.sourceId)){status.textContent="Fonte não disponível neste sistema.";return;}title.value=d.title;source.value=d.sourceId;fillFields();type.value=d.type;dimension.value=d.dimension;measure.value=d.measures?.[0]?.field||"*";agg.value=d.measures?.[0]?.aggregation||"count";selectedDraftId=item.id;selectedSortOrder=Number(item.sortOrder)||0;placement.value=item.viewId||"";current=null;save.disabled=true;output.textContent="";status.textContent="Rascunho carregado. Valide antes de salvar alterações.";});
window.addEventListener("bi-open-panel-draft",async(event)=>{
  const id=String(event.detail?.id||"");
  if(!id)return;
  await open();
  const found=(drafts._items||[]).find(item=>item.id===id);
  if(!found){status.textContent="Rascunho não encontrado para este usuário.";return;}
  drafts.value=id;
  load.click();
});
remove.addEventListener("click",async()=>{if(!drafts.value||!window.confirm("Excluir o rascunho selecionado?"))return;try{await requestDraft("DELETE",drafts.value);selectedDraftId="";status.textContent="Rascunho excluído.";window.dispatchEvent(new Event("bi-panel-drafts-changed"));await refreshDrafts();}catch(err){status.textContent=err.message;}});
download.addEventListener("click",()=>{
if(!current)return;
const blob=new Blob([JSON.stringify({version:1,systemId:context.currentSystemId,definition:current},null,2)],{type:"application/json"});
const url=URL.createObjectURL(blob),a=make("a",{href:url,download:"bi-vella-painel.json"});
a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
