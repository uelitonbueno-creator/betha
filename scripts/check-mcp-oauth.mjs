import fs from "node:fs";

const worker=fs.readFileSync(new URL("../backend/worker.js",import.meta.url),"utf8");
const mcp=fs.readFileSync(new URL("../mcp/src/index.ts",import.meta.url),"utf8");
const wrangler=fs.readFileSync(new URL("../mcp/wrangler.jsonc",import.meta.url),"utf8");

const errors=[];
const requireText=(source,text,code)=>{
  if(!source.includes(text)) errors.push(code);
};

requireText(worker,'/.well-known/oauth-authorization-server',"MCP_OAUTH_METADATA_MISSING");
requireText(worker,'/.well-known/oauth-protected-resource',"MCP_RESOURCE_METADATA_MISSING");
requireText(worker,'/oauth/register',"MCP_DCR_ENDPOINT_MISSING");
requireText(worker,'/oauth/authorize',"MCP_AUTHORIZE_ENDPOINT_MISSING");
requireText(worker,'/oauth/token',"MCP_TOKEN_ENDPOINT_MISSING");
requireText(worker,'code_challenge_methods_supported:["S256"]',"MCP_PKCE_S256_MISSING");
requireText(worker,'grant.resource!==resource',"MCP_RESOURCE_BINDING_MISSING");
requireText(worker,'MCP_OAUTH_CODE_PREFIX',"MCP_ONE_TIME_CODE_STORE_MISSING");
requireText(worker,'MCP_OAUTH_ACCESS_PREFIX',"MCP_ACCESS_TOKEN_STORE_MISSING");
requireText(worker,'/api/mcp/introspect',"MCP_INTROSPECTION_ENDPOINT_MISSING");
requireText(worker,'permissions',"MCP_TENANT_PERMISSIONS_MISSING");

requireText(mcp,'securitySchemes: [{ type: "oauth2", scopes: ["bi:read"] }]',"MCP_TOOL_SECURITY_SCHEME_MISSING");
requireText(mcp,'readOnlyHint: true',"MCP_READ_ONLY_HINT_MISSING");
requireText(mcp,'destructiveHint: false',"MCP_DESTRUCTIVE_HINT_INVALID");
requireText(mcp,'resource_metadata=',"MCP_WWW_AUTHENTICATE_METADATA_MISSING");
requireText(mcp,'tenantCanUseTool',"MCP_TENANT_TOOL_AUTH_MISSING");
requireText(mcp,'resource: canonicalResource(request, env)',"MCP_INTROSPECTION_RESOURCE_MISSING");

requireText(wrangler,'"MCP_AUTH_READY": "false"',"MCP_FAIL_CLOSED_DISABLED");
requireText(wrangler,'"MCP_INTROSPECTION_URL"',"MCP_INTROSPECTION_CONFIG_MISSING");
requireText(wrangler,'"MCP_AUTH_SERVER_URL"',"MCP_AUTH_SERVER_CONFIG_MISSING");
requireText(wrangler,'"MCP_RESOURCE_URL"',"MCP_RESOURCE_CONFIG_MISSING");

if(errors.length){
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("MCP OAuth 2.1 contract OK: discovery, DCR, PKCE S256, resource binding, introspection and tenant-scoped tool authorization present.");
