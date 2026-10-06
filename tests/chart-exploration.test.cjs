const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function frontend() {
 const context=vm.createContext({window:{},Map,JSON,Number,String,Math});
 vm.runInContext(fs.readFileSync('dashboard-catalog.js','utf8'),context);
 context.dashboards=context.window.BI_DASHBOARDS;
 context.currentView='imobiliario';context.chartDisplayStateByView=new Map();
 context.chartInstances=new Map();context.cssEscape=value=>value;
 const nodes={};const card={querySelector:selector=>nodes[selector]||(nodes[selector]={style:{}})};
 context.document={querySelector:()=>card};
 let config;
 context.Chart=class {constructor(canvas,input){config=input;}destroy(){}};
 const src=fs.readFileSync('app.js','utf8');
 vm.runInContext(src.slice(src.indexOf('  function dashboardCharts('),src.indexOf('  function renderOverviewAttention(')),context);
 return {context,nodes,config:()=>config};
}
test('compatible groupings preserve source and indicator, and reject unrelated measures',()=>{
 const {context:c}=frontend();
 const charts=c.dashboards.imobiliario.charts;
 const base=charts.find(x=>x.id==='bairro-imoveis');
 const choices=c.compatibleChartGroups(base,charts);
 assert.ok(choices.some(x=>x.id==='logradouro-imoveis'));
 assert.ok(choices.some(x=>x.id==='imoveis-geral'));
 assert.ok(!choices.some(x=>x.id==='iptu-pagamentos'||x.id==='planta-valores'));
 for(const dashboard of Object.values(c.dashboards))for(const chart of dashboard.charts||[]){const choices=c.compatibleChartGroups(chart,dashboard.charts);assert.ok(choices.some(x=>x.id===chart.id));for(const choice of choices)assert.equal(choice.source,chart.source);}
});
test('switching from bairros to streets uses street data, renders pizza and keeps the original card identity',()=>{
 const {context:c,config}=frontend();const base=c.dashboards.imobiliario.charts.find(x=>x.id==='bairro-imoveis');
 c.chartDisplayStateByView.set('imobiliario',{'bairro-imoveis':{group:'logradouro-imoveis',type:'pie'}});
 c.currentPayload={charts:{'logradouro-imoveis':{labels:['Rua A','Rua B'],format:'number',datasets:[{label:'Imóveis',data:[5,3]}]}}};
 c.renderChartData(base,{labels:['Bairro único'],datasets:[{data:[8]}]});
 assert.equal(config().type,'pie');assert.deepEqual(Array.from(config().data.labels),['Rua A','Rua B']);
 assert.equal(c.chartInstances.has('bairro-imoveis'),true);assert.equal(c.chartInstances.has('logradouro-imoveis'),false);
 assert.equal(c.displayChartDefinition(base).drill,'imoveis');
});
test('long street distributions keep every category and use scrollable horizontal bars; negative values stay in bars',()=>{
 const {context:c,config,nodes}=frontend();const base=c.dashboards.imobiliario.charts.find(x=>x.id==='bairro-imoveis');
 c.currentPayload={charts:{}};
 const labels=Array.from({length:30},(_,i)=>'Rua '+i);
 c.renderChartData(base,{labels,format:'number',datasets:[{data:labels.map(()=>1)}]});
 assert.equal(config().data.labels.length,30);assert.equal(config().options.indexAxis,'y');assert.equal(nodes['.chart-canvas-wrap'].style.height,'780px');
 c.chartDisplayStateByView.set('imobiliario',{[base.id]:{group:base.id,type:'pie'}});
 c.renderChartData(base,{labels:['A'],datasets:[{data:[-1]}]});
 assert.equal(config().type,'bar');
});
function backend() {
 const c=vm.createContext({URL,URLSearchParams,Date,Map,Set,console:{warn(){}}});
 vm.runInContext(fs.readFileSync('backend/worker.js','utf8').replace('export default {','const worker={'),c);return c;
}
test('urban filter, bairro and street grouping agree with KPIs and analytic records without dropping streets',async()=>{
 const c=backend();
 const rows=Array.from({length:23},(_,i)=>({id:i+1,nomeBairro:i<20?'Centro':'Outro',nomeLogradouro:'Rua '+i,rural:i>=22,desativado:false}));
 c.safeBethaRows=async(env,tenant,source,resource)=>({rows:source==='bi'&&resource==='imoveis'?rows:[],loaded:source==='bi'&&resource==='imoveis'?rows.length:0,complete:true,hasMore:false,error:null});
 const url=new URL('https://worker.test?zona=urbana&bairro=Centro');
 const result=await c.buildRealEstateDashboard({}, {id:'test',name:'Test'},url);
 assert.equal(result.kpis['imoveis-total'],20);
 assert.equal(result.charts['logradouro-imoveis'].labels.length,20);
 assert.equal(result.charts['logradouro-imoveis'].datasets[0].data.reduce((a,b)=>a+b,0),20);
 assert.equal(c.detailFilterRows('imoveis',rows,url).length,20);
 url.searchParams.set('logradouro','Rua 4');
 const narrowed=await c.buildRealEstateDashboard({}, {id:'test',name:'Test'},url);
 assert.equal(narrowed.kpis['imoveis-total'],1);
 assert.equal(c.detailFilterRows('imoveis',rows,url)[0].id,5);
 assert.ok(narrowed.meta.filterOptions.logradouro.some(x=>x.value==='Rua 4'));
});
