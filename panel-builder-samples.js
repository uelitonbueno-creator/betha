/* Catálogo restrito a arquivos de AMOSTRA LOCAL já incluídos no projeto.
   Não promove campos de demonstração a fontes autorizadas da Betha. */
(function(root){
"use strict";
const definitions={
 contabil:{file:"contabil-100.json",dimensions:["mes","unidade","funcao","credor","natureza","fonteRecurso","status"],numbers:["valorEmpenhado","valorLiquidado","valorPago","receitaPrevista","receitaArrecadada"]},
 compras:{file:"compras-100.json",dimensions:["mes","modalidade","secretaria","fornecedor","status","objeto"],numbers:["valorEstimado","valorHomologado","diasTramitacao","economia"]},
 folha:{file:"folha-100.json",dimensions:["mes","secretaria","vinculo","status","cargo","evento"],numbers:["bruto","liquido","encargos","descontos","beneficioValor"]}
};
function catalog(system){
 const d=definitions[system];if(!d)return[];
 return [{id:"sample:"+system,systemId:system,mode:"sample",file:d.file,fields:[
 ...d.dimensions.map(id=>({id,type:"string",dimension:true,filterable:true})),
 ...d.numbers.map(id=>({id,type:"number",measure:true,filterable:false}))
 ]}];
}
async function preview(definition,system){
 const entry=catalog(system)[0];
 if(!entry||definition.sourceId!==entry.id)throw new Error("Fonte de amostra indisponível.");
 const core=root.BIPanelBuilderCore;
 const result=core.validate(definition,[entry],{tenantId:"sample-only",systemId:system});
 if(!result.ok)throw new Error(result.errors.join(" "));
 const response=await fetch("data/samples/"+entry.file,{cache:"no-store",credentials:"same-origin"});
 if(!response.ok)throw new Error("Arquivo de amostra não encontrado.");
 const file=await response.json();
 if(file.mode!=="sample"||file.system!==system||!Array.isArray(file.rows)||file.rows.length>500)throw new Error("Amostra inválida.");
 const rows=core.aggregate(file.rows,definition,[entry],{tenantId:"sample-only",systemId:system});
 return {rows,scanned:file.rows.length,partial:true,mode:"sample",note:"AMOSTRA LOCAL — resultados demonstrativos, sem dados reais."};
}
async function filterValues(system,field){
 const source=catalog(system)[0];
 if(!source||!source.fields.some(f=>f.id===field&&f.filterable))throw new Error("Campo de filtro não autorizado.");
 const response=await fetch("data/samples/"+source.file,{credentials:"same-origin"});
 if(!response.ok)throw new Error("Amostra não encontrada.");
 const file=await response.json();
 if(file.mode!=="sample"||file.system!==system||!Array.isArray(file.rows)||file.rows.length>500)throw new Error("Amostra inválida.");
 const values=new Set();
 for(const row of file.rows){
   if(!row||typeof row!=="object"||Array.isArray(row))continue;
   const raw=row[field];if(raw==null||typeof raw==="object")continue;
   const value=String(raw).trim();
   if(value&&value.length<=120)values.add(value);
   if(values.size>=40)break;
 }
 return {sourceId:source.id,field,values:[...values].sort((a,b)=>a.localeCompare(b,"pt-BR")),mode:"sample",partial:true};
}

root.BIPanelSampleBuilder=Object.freeze({catalog,preview,filterValues});
})(window);
