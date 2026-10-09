/* BI Vella — gráficos personalizados associados aos painéis existentes.
 * Usa apenas o catálogo/preview autorizado pelo Worker.
 */
(function(){
"use strict";
const host=document.getElementById("chartGrid");
if(!host||!window.BI_CONFIG)return;
const area=document.createElement("section");area.className="bi-personal-placements";area.hidden=true;
const title=document.createElement("h2");title.textContent="Meus gráficos personalizados";
const items=document.createElement("div");items.className="bi-personal-chart-grid";
const message=document.createElement("p");message.className="bi-personal-note";
area.append(title,message,items);host.after(area);
let charts=[],lastKey="",generation=0;
function clear(){for(const chart of charts)chart.destroy();charts=[];items.replaceChildren();}
function node(tag,text){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;}
function context(){
 const state=window.BIVellaSearchContext?.getState?.();
 if(!state)return null;
 const query=new URLSearchParams(location.search);
 const tenant=query.get("tenant")||query.get("entidadeId")||"";
 const view=query.get("view")||state.homeView;
 if(!tenant||!state.allowedViews?.includes(view))return null;
 return {tenant,system:state.currentSystemId,view};
}
function endpoint(path,c){return String(window.BI_CONFIG.BACKEND_URL||"").replace(/\/$/,"")+path+"?system="+encodeURIComponent(c.system);}
async function getJson(url,options){const response=await fetch(url,{credentials:"include",...options});const body=await response.json().catch(()=>({}));if(!response.ok)throw new Error(body.error||"Dados indisponíveis");return body;}
async function reload(c){
 const gen=++generation;clear();area.hidden=true;
 try{
  const data=await getJson(endpoint("/api/panel-drafts",c),{headers:{"X-Tenant-Id":c.tenant}});
  if(gen!==generation)return;
  const attached=(data.items||[]).filter(x=>x.viewId===c.view).slice(0,12);
  if(!attached.length)return;
  area.hidden=false;message.textContent="Gráficos personalizados · prévias parciais (até 500 registros por fonte)";
  for(const item of attached){
   if(gen!==generation)return;
   const card=node("article");card.className="bi-personal-chart-card";
   const heading=node("h3",item.title);card.append(heading);
   const status=node("p","Carregando prévia autorizada…");card.append(status);items.append(card);
   try{
    const data=await getJson(endpoint("/api/panel-builder/preview",c),{
      method:"POST",headers:{"X-Tenant-Id":c.tenant,"Content-Type":"application/json"},
      body:JSON.stringify({definition:item.definition})
    });
    if(gen!==generation)return;
    status.textContent="Prévia parcial: "+data.scanned+" registros examinados";
    const rows=(data.rows||[]).slice(0,40),def=item.definition;
    if(!rows.length){card.append(node("p","Nenhum dado na prévia."));continue;}
    if(def.type==="table"||typeof window.Chart!=="function"){
      const table=node("table"),tbody=node("tbody");
      for(const r of rows){const tr=node("tr");tr.append(node("th",r.dimension));for(const v of r.values||[])tr.append(node("td",v==null?"—":String(v)));tbody.append(tr);}
      table.append(tbody);card.append(table);continue;
    }
    const frame=node("div");frame.className="bi-personal-chart-frame";const canvas=node("canvas");frame.append(canvas);card.append(frame);
    const type=def.type==="line"?"line":def.type==="doughnut"?"doughnut":"bar";
    const chart=new window.Chart(canvas,{type,data:{
      labels:rows.map(r=>r.dimension),
      datasets:def.measures.map((m,i)=>({label:m.aggregation+"("+m.field+")",data:rows.map(r=>r.values?.[i]??null)}))
    },options:{responsive:true,maintainAspectRatio:false,animation:false}});
    charts.push(chart);
   }catch(e){if(gen===generation)status.textContent="Prévia indisponível: "+e.message;}
  }
 }catch(e){if(gen===generation){area.hidden=true;console.warn("BI Vella: gráficos personalizados indisponíveis",e.message);}}
}
function refresh(){
 const c=context(),key=c?[c.tenant,c.system,c.view].join("|"):"";
 if(key===lastKey)return;
 lastKey=key;
 if(!c){generation++;clear();area.hidden=true;return;}
 reload(c);
}
const observer=new MutationObserver(()=>refresh());
observer.observe(document.getElementById("dashboardView")||document.body,{attributes:true,attributeFilter:["hidden"]});
window.addEventListener("popstate",refresh);
document.addEventListener("click",()=>queueMicrotask(refresh));
window.addEventListener("bi-panel-drafts-changed",()=>{lastKey="";refresh();});
refresh();
})();
