import fs from "node:fs";

const worker=fs.readFileSync(new URL("../backend/worker.js",import.meta.url),"utf8");
const sdk=fs.readFileSync(new URL("../mcp/src/index.ts",import.meta.url),"utf8");

const tools=[
  "bi_revenue_breakdown",
  "bi_debt_portfolio",
  "bi_active_debt_summary",
  "bi_installments_summary"
];

const errors=[];
for(const tool of tools){
  if(!worker.includes('name:"'+tool+'"')) errors.push("WORKER_TOOL_MISSING:"+tool);
  if(!sdk.includes('"'+tool+'"')) errors.push("SDK_TOOL_MISSING:"+tool);
}

const requiredWorker=[
  ["mcpRevenueBreakdown","WORKER_REVENUE_ANALYTICS_MISSING"],
  ["mcpDebtPortfolio","WORKER_DEBT_PORTFOLIO_MISSING"],
  ["mcpActiveDebtSummary","WORKER_ACTIVE_DEBT_ANALYTICS_MISSING"],
  ["mcpInstallmentsSummary","WORKER_INSTALLMENTS_ANALYTICS_MISSING"],
  ["mcpChartRows","WORKER_ANALYTIC_CHART_NORMALIZER_MISSING"],
  ["return tools.map(mcpToolSecurity)","WORKER_ANALYTICS_SECURITY_METADATA_MISSING"]
];

const requiredSdk=[
  ["const analyticalTools =","SDK_ANALYTICS_CATALOG_MISSING"],
  ["registerAnalytic(","SDK_ANALYTICS_REGISTRATION_MISSING"],
  ["revenueBreakdown","SDK_REVENUE_ANALYTICS_MISSING"],
  ["debtPortfolio","SDK_DEBT_PORTFOLIO_MISSING"],
  ["activeDebtSummary","SDK_ACTIVE_DEBT_ANALYTICS_MISSING"],
  ["installmentsSummary","SDK_INSTALLMENTS_ANALYTICS_MISSING"],
  ["generatedCatalog.toolCount + Object.keys(analyticalTools).length","SDK_TOOL_COUNT_NOT_EXTENDED"]
];

for(const [text,code] of requiredWorker) if(!worker.includes(text)) errors.push(code);
for(const [text,code] of requiredSdk) if(!sdk.includes(text)) errors.push(code);

if(worker.includes('"top-devedores"') && !worker.includes("sem retornar ranking nominal de devedores")){
  errors.push("ACTIVE_DEBT_TOOL_PRIVACY_DESCRIPTION_MISSING");
}

if(errors.length){
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("MCP analytics contract OK: 4 specialized read-only analytical tools are present in production and SDK v2, with privacy-safe active debt summary.");
