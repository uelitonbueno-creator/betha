/* BI Vella — núcleo puro do construtor de painéis.
 * Não realiza chamadas externas nem executa expressões de campos recebidas do usuário.
 * O servidor deve revalidar autorização, fonte e colunas antes de consultar dados.
 */
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.BIPanelBuilderCore=api;
})(typeof globalThis!=="undefined"?globalThis:null,function(){
  "use strict";
  const CHARTS=new Set(["bar","line","doughnut","table","kpi"]);
  const AGGREGATIONS=new Set(["sum","avg","min","max","count"]);
  const FIELD_ID=/^[a-zA-Z_][a-zA-Z0-9_.]{0,119}$/;
  const SOURCE_ID=/^[a-zA-Z0-9_:-]{1,120}$/;
  const MAX_FILTERS=12,MAX_MEASURES=5,MAX_ROWS=50000,MAX_GROUPS=1000;
  const has=(obj,key)=>Object.prototype.hasOwnProperty.call(obj,key);
  function plain(obj){return obj!==null&&typeof obj==="object"&&!Array.isArray(obj)&&Object.getPrototypeOf(obj)===Object.prototype;}
  function fieldMap(source){
    const m=new Map();
    for(const f of source.fields||[]){
      if(!plain(f)||!FIELD_ID.test(f.id||"")||m.has(f.id))continue;
      m.set(f.id,f);
    }
    return m;
  }
  function validate(definition,catalog,context){
    const errors=[];
    if(!plain(definition))return {ok:false,errors:["Definição inválida."]};
    const sourceId=definition.sourceId;
    if(typeof sourceId!=="string"||!SOURCE_ID.test(sourceId))errors.push("Fonte inválida.");
    const source=Array.isArray(catalog)?catalog.find(s=>s&&s.id===sourceId):null;
    if(!source)errors.push("Fonte não disponível no catálogo autorizado.");
    if(!plain(context)||!context.tenantId||!context.systemId)errors.push("Contexto de entidade e sistema obrigatório.");
    if(source&&context&&source.systemId!==context.systemId)errors.push("Fonte pertence a outro sistema.");
    if(typeof definition.title!=="string"||!definition.title.trim()||definition.title.length>120)errors.push("Título deve ter entre 1 e 120 caracteres.");
    if(!CHARTS.has(definition.type))errors.push("Tipo de visualização inválido.");
    const fields=source?fieldMap(source):new Map();
    const dimension=definition.dimension;
    if(definition.type!=="kpi"&&definition.type!=="table"&&(!fields.has(dimension)||fields.get(dimension)?.dimension!==true))errors.push("Dimensão não autorizada.");
    if(dimension!=null&&dimension!==""&&!fields.has(dimension))errors.push("Campo de dimensão desconhecido.");
    const measures=definition.measures;
    if(!Array.isArray(measures)||measures.length<1||measures.length>MAX_MEASURES)errors.push("Selecione de 1 a 5 métricas.");
    else for(const m of measures){
      if(!plain(m)||!AGGREGATIONS.has(m.aggregation)||!(m.field==="*"&&m.aggregation==="count"||fields.get(m.field)?.measure===true))errors.push("Métrica ou agregação não autorizada.");
      if(m.field!=="*"&&m.aggregation!=="count"&&fields.get(m.field)?.type!=="number")errors.push("Agregação numérica exige campo numérico.");
    }
    if(!Array.isArray(definition.filters)||definition.filters.length>MAX_FILTERS)errors.push("Limite de 12 filtros excedido.");
    else for(const f of definition.filters){
      const field=fields.get(f?.field);
      if(!plain(f)||!field||field.filterable!==true||!["eq","neq","in","gte","lte"].includes(f.op))errors.push("Filtro não autorizado.");
      else if(f.op==="in"&&(!Array.isArray(f.value)||f.value.length>100))errors.push("Lista de filtro inválida.");
      else if(f.op!=="in"&&(typeof f.value==="object"||f.value===undefined))errors.push("Valor de filtro inválido.");
    }
    return {ok:errors.length===0,errors:[...new Set(errors)]};
  }
  function readField(row,path){
    if(path==="*")return 1;
    if(!plain(row)||!FIELD_ID.test(path||""))return undefined;
    // Caminhos só atravessam propriedades próprias; nunca interpretam código.
    return path.split(".").reduce((value,key)=>{
      if(key==="__proto__"||key==="prototype"||key==="constructor"||value==null||!has(Object(value),key))return undefined;
      return value[key];
    },row);
  }
  function passes(row,filters){
    return filters.every(f=>{
      const actual=readField(row,f.field),expected=f.value;
      switch(f.op){
        case "eq":return actual===expected;
        case "neq":return actual!==expected;
        case "in":return f.value.includes(actual);
        case "gte":return actual!=null&&actual>=expected;
        case "lte":return actual!=null&&actual<=expected;
        default:return false;
      }
    });
  }
  function aggregate(rows,definition,catalog,context){
    const result=validate(definition,catalog,context);
    if(!result.ok)throw new Error(result.errors.join(" "));
    if(!Array.isArray(rows)||rows.length>MAX_ROWS)throw new Error("Prévia limitada a 50.000 registros.");
    const buckets=new Map(),selected=rows.filter(row=>plain(row)&&passes(row,definition.filters));
    for(const row of selected){
      const raw=definition.type==="kpi"?"Total":readField(row,definition.dimension);
      const label=raw==null?"Não informado":String(raw).slice(0,200);
      if(!buckets.has(label)){
        if(buckets.size>=MAX_GROUPS)throw new Error("Prévia excedeu 1.000 grupos.");
        buckets.set(label,{dimension:label,measures:definition.measures.map(()=>({count:0,sum:0,min:Infinity,max:-Infinity}))});
      }
      const bucket=buckets.get(label);
      definition.measures.forEach((metric,i)=>{
        const state=bucket.measures[i];
        const value=metric.field==="*"?1:readField(row,metric.field);
        if(metric.aggregation==="count"){if(metric.field==="*"||value!=null)state.count++;return;}
        if(typeof value!=="number"||!Number.isFinite(value))return;
        state.count++;state.sum+=value;state.min=Math.min(state.min,value);state.max=Math.max(state.max,value);
      });
    }
    return [...buckets.values()].map(bucket=>({
      dimension:bucket.dimension,
      values:bucket.measures.map((v,i)=>{
        const op=definition.measures[i].aggregation;
        if(op==="count")return v.count;
        if(!v.count)return null;
        return op==="sum"?v.sum:op==="avg"?v.sum/v.count:op==="min"?v.min:v.max;
      })
    }));
  }
  function sourcesFromDashboards(dashboards,systemId){
    // Descoberta assistiva: fontes e campos candidatos, não concessão de acesso.
    // O backend deve fornecer catálogo tipado e autorizado antes de salvar.
    const sources=new Map();
    for(const panel of Object.values(dashboards||{})){
      if(!panel||String(panel.system||"tributos")!==String(systemId))continue;
      for(const chart of panel.charts||[]){
        const id=chart.source;
        if(typeof id!=="string"||!SOURCE_ID.test(id))continue;
        if(!sources.has(id))sources.set(id,{id,systemId,fields:new Map()});
        const fields=sources.get(id).fields;
        const dim=String(chart.dimension||"").split(":")[0];
        if(FIELD_ID.test(dim))fields.set(dim,{id:dim,type:"string",dimension:true,filterable:false});
        for(const measure of chart.measures||[]){
          if(!FIELD_ID.test(measure))continue;
          fields.set(measure,{id:measure,type:"number",measure:true,filterable:false});
        }
      }
    }
    return [...sources.values()].map(s=>({...s,fields:[...s.fields.values()]}));
  }
  return Object.freeze({validate,aggregate,sourcesFromDashboards,readField});
});
