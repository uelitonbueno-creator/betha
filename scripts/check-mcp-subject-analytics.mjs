import fs from "node:fs";

const worker=fs.readFileSync(new URL("../backend/worker.js",import.meta.url),"utf8");
const sdk=fs.readFileSync(new URL("../mcp/src/index.ts",import.meta.url),"utf8");

const errors=[];
const requireText=(source,text,code)=>{
  if(!source.includes(text)) errors.push(code);
};

for(const tool of ["bi_resolve_subject","bi_company_iss_detail","bi_subject_financial_summary"]){
  requireText(worker,'name:"'+tool+'"',"WORKER_TOOL_MISSING:"+tool);
  requireText(sdk,'"'+tool+'"',"SDK_TOOL_MISSING:"+tool);
}

requireText(worker,"mcpSubjectCandidatesFromRows","SUBJECT_RESOLVER_MISSING");
requireText(worker,"mcpSelectResolvedCandidate","SUBJECT_AMBIGUITY_GUARD_MISSING");
requireText(worker,"maskDetailDocument(candidate.documentRaw)","SUBJECT_DOCUMENT_MASK_MISSING");
requireText(worker,"mcpIsIssPaymentDetail","ISS_CLASSIFICATION_MISSING");
requireText(worker,"pagamentosClassificados","ISS_CLASSIFIED_COUNT_MISSING");
requireText(worker,'privacy:"Resumo agregado. Não retorna endereço, documento completo nem lançamentos individualizados."',"SUBJECT_FINANCIAL_PRIVACY_MISSING");
requireText(worker,'requireViewPermission(auth,"arrecadacao")',"COMPANY_ISS_REVENUE_PERMISSION_MISSING");
requireText(worker,'requireViewPermission(auth,"divida")',"SUBJECT_FINANCIAL_ACTIVE_DEBT_PERMISSION_MISSING");
requireText(worker,'/api/mcp/analytics/company-iss',"SDK_COMPANY_ISS_ROUTE_MISSING");
requireText(worker,'/api/mcp/analytics/subject-financial',"SDK_SUBJECT_FINANCIAL_ROUTE_MISSING");

requireText(sdk,"permissions?: readonly string[];","SDK_MULTI_PERMISSION_TYPE_MISSING");
requireText(sdk,"function toolPermissions","SDK_MULTI_PERMISSION_GUARD_MISSING");
requireText(sdk,'permissions: ["BIArrecadacaoPage", "BIEconomicosPage"]',"SDK_COMPANY_ISS_PERMISSION_SET_MISSING");
requireText(sdk,'permissions: ["BIContribuintesPage", "BIDebitosPage", "BIDividaPage"]',"SDK_SUBJECT_FINANCIAL_PERMISSION_SET_MISSING");
requireText(sdk,'upstream: "/api/mcp/analytics/company-iss"',"SDK_COMPANY_ISS_UPSTREAM_MISSING");
requireText(sdk,'upstream: "/api/mcp/analytics/subject-financial"',"SDK_SUBJECT_FINANCIAL_UPSTREAM_MISSING");
requireText(sdk,"required.every(permission => tenant.permissions!.includes(permission))","SDK_ALL_PERMISSIONS_NOT_ENFORCED");

if(errors.length){
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("MCP subject analytics contract OK: ambiguity handling, masked identifiers, ISS classification, aggregate financial privacy and multi-permission SDK guards are present.");
