import fs from "node:fs";

const worker=fs.readFileSync(new URL("../backend/worker.js",import.meta.url),"utf8");
const errors=[];

const requireText=(text,code)=>{
  if(!worker.includes(text)) errors.push(code);
};

requireText('tenantId:String(flow.tenantId||"")',"MCP_CODE_TENANT_BINDING_MISSING");
requireText('tenantId:String(grant.tenantId||"")',"MCP_ACCESS_TOKEN_TENANT_BINDING_MISSING");
requireText('authorizedTenants.filter(tenant=>String(tenant.id)===String(token.tenantId||""))',"MCP_INTROSPECTION_TENANT_FILTER_MISSING");
requireText('const tenant=await resolveTenant(env,String(token.tenantId));',"MCP_RUNTIME_TENANT_RESOLUTION_MISSING");
requireText('const auth=await authorizeTenant(internalRequest,env,tenant);',"MCP_RUNTIME_TENANT_AUTH_MISSING");
requireText('allowedViews=permissionViewsForAccess(auth.access).filter(view=>Boolean(dashboardBuilder(view)))',"MCP_RUNTIME_VIEW_REVALIDATION_MISSING");
requireText('mcpOAuthTenantSelectPage',"MCP_TENANT_SELECTION_PAGE_MISSING");
requireText('mcpOAuthTenantSelectSubmit',"MCP_TENANT_SELECTION_SUBMIT_MISSING");

const toolsStart=worker.indexOf("function mcpToolDefinitions(credential) {");
const toolsEnd=worker.indexOf("\nfunction mcpJsonRpc(",toolsStart);
if(toolsStart<0 || toolsEnd<0){
  errors.push("MCP_TOOL_DEFINITION_BLOCK_MISSING");
}else{
  const toolsBlock=worker.slice(toolsStart,toolsEnd);
  if(toolsBlock.includes("tenant_id")) errors.push("MCP_TOOL_TENANT_OVERRIDE_EXPOSED");
}

const executeStart=worker.indexOf("async function executeMcpTool(");
const executeEnd=worker.indexOf("\nasync function handleMcpRequest(",executeStart);
if(executeStart<0 || executeEnd<0){
  errors.push("MCP_TOOL_EXECUTION_BLOCK_MISSING");
}else{
  const executeBlock=worker.slice(executeStart,executeEnd);
  if(executeBlock.includes("args.tenant_id") || executeBlock.includes("args[\"tenant_id\"]")){
    errors.push("MCP_TOOL_TENANT_OVERRIDE_RUNTIME");
  }
}

if(errors.length){
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("MCP tenant isolation contract OK: OAuth grant is tenant-bound, runtime permissions are revalidated, and tools cannot override tenant selection.");
