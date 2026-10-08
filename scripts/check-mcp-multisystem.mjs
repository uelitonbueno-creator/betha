import fs from "node:fs";

const worker=fs.readFileSync(new URL("../backend/worker.js",import.meta.url),"utf8");
const sdk=fs.readFileSync(new URL("../mcp/src/index.ts",import.meta.url),"utf8");
const mapping=JSON.parse(fs.readFileSync(new URL("../config/page-mapping.json",import.meta.url),"utf8"));
const catalog=JSON.parse(fs.readFileSync(new URL("../config/mcp-tools.generated.json",import.meta.url),"utf8"));

const errors=[];
const requireText=(source,text,code)=>{
  if(!source.includes(text)) errors.push(code);
};

const expectedViews=[
  ["contabil-visao-geral","BIContabilVisaoGeralPage","get_contabil_visao_geral"],
  ["compras-visao-geral","BIComprasVisaoGeralPage","get_compras_visao_geral"],
  ["folha-visao-geral","BIFolhaVisaoGeralPage","get_folha_visao_geral"]
];

for(const [view,permission,tool] of expectedViews){
  requireText(worker,'"'+view+'":build',"WORKER_BUILDER_MISSING:"+view);
  const constraint=(mapping[0]?.constraints||[]).find(item=>item.id===permission);
  if(!constraint) errors.push("PAGE_MAPPING_PERMISSION_MISSING:"+permission);
  const generated=(catalog.tools||[]).find(item=>item.name===tool&&item.panel===view);
  if(!generated) errors.push("GENERATED_TOOL_MISSING:"+tool);
  else if(generated.permission!==permission) errors.push("GENERATED_PERMISSION_INVALID:"+tool);
}

for(const tool of ["bi_accounting_execution","bi_procurement_summary","bi_payroll_summary"]){
  requireText(worker,'name:"'+tool+'"',"WORKER_EXECUTIVE_TOOL_MISSING:"+tool);
  requireText(sdk,tool+":","SDK_EXECUTIVE_TOOL_MISSING:"+tool);
}

requireText(worker,'dataMode:"sample"',"WORKER_SAMPLE_MODE_MISSING");
requireText(worker,"AMOSTRA LOCAL SINTÉTICA","WORKER_SAMPLE_WARNING_MISSING");
requireText(worker,'buildAccountingSampleDashboard',"ACCOUNTING_SAMPLE_DASHBOARD_MISSING");
requireText(worker,'buildProcurementSampleDashboard',"PROCUREMENT_SAMPLE_DASHBOARD_MISSING");
requireText(worker,'buildPayrollSampleDashboard',"PAYROLL_SAMPLE_DASHBOARD_MISSING");
requireText(worker,'privacy:"Resumo agregado; nomes de servidores não são retornados."',"PAYROLL_PRIVACY_GUARD_MISSING");
requireText(sdk,'dataMode:"sample"',"SDK_SAMPLE_MODE_MISSING");
requireText(sdk,"AMOSTRA LOCAL SINTÉTICA","SDK_SAMPLE_WARNING_MISSING");
requireText(sdk,'privacy:"Resumo agregado; nomes de servidores não são retornados."',"SDK_PAYROLL_PRIVACY_GUARD_MISSING");

if(Number(catalog.toolCount)!==19) errors.push("GENERATED_TOOL_COUNT_EXPECTED_19");
if(Array.isArray(catalog.missingPermissions)&&catalog.missingPermissions.length) {
  errors.push("MULTISYSTEM_MISSING_PERMISSIONS:"+catalog.missingPermissions.join(","));
}

const payrollStart=worker.indexOf("async function mcpPayrollSummary");
const payrollEnd=worker.indexOf("\nasync function executeMcpTool",payrollStart);
if(payrollStart<0||payrollEnd<0){
  errors.push("PAYROLL_SUMMARY_BLOCK_MISSING");
}else{
  const block=worker.slice(payrollStart,payrollEnd);
  if(/servidorName|servidorNome|nomeServidor/i.test(block)) errors.push("PAYROLL_INDIVIDUAL_NAME_EXPOSED");
}

if(errors.length){
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("MCP multi-system executive contract OK: 3 sample-backed overview panels, 3 executive tools, permissions, sample warnings and payroll privacy are synchronized.");
