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
const note=make("p",{},"Editor de rascunho. As definições não são publicadas nem aplicadas a dados reais sem validação no backend.");
panel.append(note);
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
actions.append(build,download);form.append(actions,status,output);panel.append(form);dialog.append(panel);document.body.append(trigger,dialog);
let catalog=[],context=null,current=null;
function options(element,values){element.replaceChildren(...values.map(([v,l])=>make("option",{value:v},l)));}
function fillFields(){
const selected=catalog.find(s=>s.id===source.value);
const fields=selected?.fields||[];
options(dimension,fields.filter(f=>f.dimension).map(f=>[f.id,f.id]));
options(measure,[["*","Total de registros"],...fields.filter(f=>f.measure).map(f=>[f.id,f.id])]);
const usable=Boolean(selected&&fields.some(f=>f.dimension));build.disabled=!usable;
if(!usable)status.textContent="Esta fonte ainda não possui dimensões disponíveis para edição.";
}
function open(){
context=window.BIVellaSearchContext.getState();
catalog=core.sourcesFromDashboards(window.BI_DASHBOARDS,context.currentSystemId)
.filter(s=>s.fields.some(f=>f.dimension)&&s.fields.some(f=>f.measure));
options(source,catalog.map(s=>[s.id,s.id]));
title.value="";type.value="bar";agg.value="sum";status.textContent="";output.textContent="";current=null;download.disabled=true;
fillFields();dialog.hidden=false;dirty=false;close.focus();
}
function dismiss(){dialog.hidden=true;trigger.focus();}
trigger.addEventListener("click",open);
close.addEventListener("click",dismiss);
dialog.addEventListener("click",e=>{if(e.target===dialog)dismiss();});
document.addEventListener("keydown",e=>{if(dialog.hidden)return;if(e.key==="Escape")dismiss();if(e.key==="Tab"){const f=[...dialog.querySelectorAll("button:not(:disabled),input:not(:disabled),select:not(:disabled)")];if(!f.length)return;const first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
source.addEventListener("change",()=>{fillFields();current=null;download.disabled=true;});
form.addEventListener("submit",e=>{
e.preventDefault();
const metric=measure.value==="*"?{field:"*",aggregation:"count"}:{field:measure.value,aggregation:agg.value};
const definition={title:title.value.trim(),sourceId:source.value,type:type.value,
dimension:dimension.value,measures:[metric],filters:[]};
const result=core.validate(definition,catalog,{tenantId:"editor-local",systemId:context.currentSystemId});
if(!result.ok){status.textContent=result.errors.join(" ");download.disabled=true;current=null;return;}
current=definition;output.textContent=JSON.stringify(definition,null,2);
status.textContent="Definição validada localmente. Não publicada.";download.disabled=false;
});
download.addEventListener("click",()=>{
if(!current)return;
const blob=new Blob([JSON.stringify({version:1,systemId:context.currentSystemId,definition:current},null,2)],{type:"application/json"});
const url=URL.createObjectURL(blob),a=make("a",{href:url,download:"bi-vella-painel.json"});
a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
