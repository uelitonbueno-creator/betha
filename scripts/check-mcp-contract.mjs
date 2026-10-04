import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync(new URL("../config/mcp-tools.generated.json", import.meta.url), "utf8"));

const errors = [];
if (manifest.mode !== "read-only") errors.push("MCP_MODE_MUST_BE_READ_ONLY");
if (manifest.auth !== "oauth2.1") errors.push("MCP_AUTH_MUST_BE_OAUTH21");
if (manifest.transport !== "streamable-http") errors.push("MCP_TRANSPORT_MUST_BE_STREAMABLE_HTTP");
if (!Array.isArray(manifest.tools) || !manifest.tools.length) errors.push("MCP_TOOLS_EMPTY");
if (Array.isArray(manifest.missingPermissions) && manifest.missingPermissions.length) {
  errors.push("MCP_TOOLS_WITHOUT_PERMISSION:" + manifest.missingPermissions.join(","));
}

const names = new Set();
for (const tool of manifest.tools || []) {
  if (!tool.name || !tool.panel || !tool.upstream) errors.push("MCP_TOOL_INCOMPLETE");
  if (tool.readOnly !== true) errors.push("MCP_TOOL_NOT_READ_ONLY:" + tool.name);
  if (!tool.permission) errors.push("MCP_TOOL_PERMISSION_MISSING:" + tool.name);
  if (names.has(tool.name)) errors.push("MCP_TOOL_DUPLICATE:" + tool.name);
  names.add(tool.name);
  if (!Array.isArray(tool.tenantIsolation) ||
      !tool.tenantIsolation.includes("database") ||
      !tool.tenantIsolation.includes("entity")) {
    errors.push("MCP_TENANT_ISOLATION_MISSING:" + tool.name);
  }
  if (!String(tool.upstream).startsWith("/api/dashboard/")) {
    errors.push("MCP_UPSTREAM_NOT_DASHBOARD:" + tool.name);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`MCP contract OK: ${manifest.tools.length} read-only tools, all permission-bound.`);
