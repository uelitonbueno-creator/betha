import { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "agents/mcp/server";
import { z } from "zod";
import catalog from "../../config/mcp-tools.generated.json";

type Env = {
  BI_API_BASE: string;
  MCP_AUTH_READY?: string;
  MCP_INTROSPECTION_URL?: string;
  MCP_AUDIT_URL?: string;
  MCP_INTERNAL_AUDIT_TOKEN?: string;
};

type TenantGrant = {
  id: string;
  name?: string;
  entityId?: string;
  databaseId?: string;
};

type Principal = {
  subject: string;
  clientId: string;
  scopes: string[];
  permissions: string[];
  tenants: TenantGrant[];
  biSession: string;
  expiresAt?: number;
};

type ToolDefinition = {
  name: string;
  panel: string;
  title: string;
  description: string;
  permission: string;
  upstream: string;
  readOnly: true;
};

const generatedCatalog = catalog as {
  mode: string;
  toolCount: number;
  missingPermissions: string[];
  tools: ToolDefinition[];
};

const inputSchema = {
  tenant_id: z.string().trim().min(1).optional(),
  data_inicial: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  data_final: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  exercicio: z.number().int().min(1900).max(2200).optional(),
  comparar_periodo_anterior: z.boolean().optional(),
};

function json(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

function bearerToken(request: Request) {
  const value = request.headers.get("Authorization") || "";
  const match = value.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

async function introspect(request: Request, env: Env): Promise<Principal> {
  if (String(env.MCP_AUTH_READY || "").toLowerCase() !== "true") {
    throw new Error("MCP_AUTH_NOT_READY");
  }
  if (!env.MCP_INTROSPECTION_URL) {
    throw new Error("MCP_INTROSPECTION_NOT_CONFIGURED");
  }

  const token = bearerToken(request);
  if (!token) throw new Error("MCP_TOKEN_REQUIRED");

  const response = await fetch(env.MCP_INTROSPECTION_URL, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ audience: "betha-bi-mcp" }),
  });

  if (!response.ok) throw new Error("MCP_TOKEN_INVALID");

  const body = await response.json() as Partial<Principal> & { active?: boolean };
  if (body.active !== true) throw new Error("MCP_TOKEN_INACTIVE");
  if (!body.subject || !body.clientId || !body.biSession) {
    throw new Error("MCP_PRINCIPAL_INCOMPLETE");
  }

  return {
    subject: String(body.subject),
    clientId: String(body.clientId),
    biSession: String(body.biSession),
    scopes: Array.isArray(body.scopes) ? body.scopes.map(String) : [],
    permissions: Array.isArray(body.permissions) ? body.permissions.map(String) : [],
    tenants: Array.isArray(body.tenants)
      ? body.tenants
          .filter((x): x is TenantGrant => Boolean(x && typeof x === "object" && x.id))
          .map(x => ({
            id: String(x.id),
            name: x.name ? String(x.name) : undefined,
            entityId: x.entityId ? String(x.entityId) : undefined,
            databaseId: x.databaseId ? String(x.databaseId) : undefined,
          }))
      : [],
    expiresAt: body.expiresAt ? Number(body.expiresAt) : undefined,
  };
}

function canUseTool(principal: Principal, tool: ToolDefinition) {
  return principal.permissions.includes("*") ||
    principal.permissions.includes(tool.permission) ||
    principal.scopes.includes(tool.permission) ||
    principal.scopes.includes("bi:read");
}

function resolveTenant(principal: Principal, requested?: string) {
  if (!principal.tenants.length) throw new Error("MCP_NO_AUTHORIZED_TENANT");

  if (requested) {
    const found = principal.tenants.find(t => t.id === requested);
    if (!found) throw new Error("MCP_TENANT_ACCESS_DENIED");
    return found;
  }

  if (principal.tenants.length !== 1) {
    const error = new Error("MCP_TENANT_SELECTION_REQUIRED") as Error & { tenants?: TenantGrant[] };
    error.tenants = principal.tenants.map(t => ({
      id: t.id,
      name: t.name,
      entityId: t.entityId,
      databaseId: t.databaseId,
    }));
    throw error;
  }

  return principal.tenants[0];
}

function safeQuery(args: Record<string, unknown>) {
  const params = new URLSearchParams();
  const mapping: Record<string, string> = {
    data_inicial: "dataInicial",
    data_final: "dataFinal",
    exercicio: "exercicio",
    comparar_periodo_anterior: "compararPeriodoAnterior",
  };
  for (const [input, output] of Object.entries(mapping)) {
    const value = args[input];
    if (value !== undefined && value !== null && value !== "") {
      params.set(output, String(value));
    }
  }
  return params;
}

async function audit(
  env: Env,
  event: {
    subject: string;
    clientId: string;
    tenantId: string;
    tool: string;
    panel: string;
    ok: boolean;
    durationMs: number;
    error?: string;
    filters?: Record<string, unknown>;
  },
) {
  const safeEvent = {
    at: new Date().toISOString(),
    ...event,
  };

  console.log("MCP_AUDIT", JSON.stringify(safeEvent));

  if (!env.MCP_AUDIT_URL) return;

  try {
    await fetch(env.MCP_AUDIT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(env.MCP_INTERNAL_AUDIT_TOKEN
          ? { "Authorization": "Bearer " + env.MCP_INTERNAL_AUDIT_TOKEN }
          : {}),
      },
      body: JSON.stringify(safeEvent),
    });
  } catch (error) {
    console.warn("MCP_AUDIT_SINK_FAILED", error instanceof Error ? error.message : String(error));
  }
}

async function callBi(
  env: Env,
  principal: Principal,
  tool: ToolDefinition,
  args: Record<string, unknown>,
) {
  if (!canUseTool(principal, tool)) throw new Error("MCP_TOOL_ACCESS_DENIED");
  const tenant = resolveTenant(principal, args.tenant_id ? String(args.tenant_id) : undefined);

  const started = Date.now();
  let ok = false;
  let failure = "";

  try {
    const base = String(env.BI_API_BASE || "").replace(/\/$/, "");
    const target = new URL(base + tool.upstream);
    const query = safeQuery(args);
    query.forEach((value, key) => target.searchParams.set(key, value));

    const response = await fetch(target, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": "Session " + principal.biSession,
        "X-Tenant-Id": tenant.id,
      },
    });

    const text = await response.text();
    let body: unknown = text;
    try { body = text ? JSON.parse(text) : null; } catch {}

    if (!response.ok) {
      failure = "BI_HTTP_" + response.status;
      throw new Error(failure);
    }

    ok = true;
    return { tenant, body };
  } finally {
    const filters = Object.fromEntries(
      Object.entries(args).filter(([key]) => key !== "tenant_id")
    );
    await audit(env, {
      subject: principal.subject,
      clientId: principal.clientId,
      tenantId: tenant.id,
      tool: tool.name,
      panel: tool.panel,
      ok,
      durationMs: Date.now() - started,
      error: failure || undefined,
      filters,
    });
  }
}

function toolError(error: unknown) {
  const err = error as Error & { tenants?: TenantGrant[] };
  const code = err instanceof Error ? err.message : "MCP_TOOL_FAILED";
  return {
    content: [{
      type: "text" as const,
      text: JSON.stringify({
        ok: false,
        error: code,
        ...(Array.isArray(err.tenants) ? { tenants: err.tenants } : {}),
      }),
    }],
    isError: true,
  };
}

function createServer(principal: Principal, env: Env) {
  const server = new McpServer({
    name: "betha-bi-mcp",
    version: "0.1.0",
  });

  for (const tool of generatedCatalog.tools) {
    if (!tool.permission || !tool.readOnly || !canUseTool(principal, tool)) continue;

    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema,
      },
      async (args) => {
        try {
          const result = await callBi(env, principal, tool, args as Record<string, unknown>);
          return {
            content: [{
              type: "text" as const,
              text: JSON.stringify({
                ok: true,
                tenant: result.tenant,
                panel: tool.panel,
                data: result.body,
              }),
            }],
          };
        } catch (error) {
          return toolError(error);
        }
      },
    );
  }

  return server;
}

function authError(error: unknown) {
  const code = error instanceof Error ? error.message : "MCP_AUTH_FAILED";
  const status =
    code === "MCP_AUTH_NOT_READY" || code === "MCP_INTROSPECTION_NOT_CONFIGURED" ? 503 :
    code === "MCP_TOKEN_REQUIRED" ? 401 :
    403;

  return json(status, { ok: false, error: code }, {
    ...(status === 401
      ? { "WWW-Authenticate": 'Bearer realm="betha-bi-mcp"' }
      : {}),
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/health" && request.method === "GET") {
      return json(200, {
        ok: true,
        service: "betha-bi-mcp",
        mode: generatedCatalog.mode,
        toolCount: generatedCatalog.toolCount,
        missingPermissions: generatedCatalog.missingPermissions,
        authReady: String(env.MCP_AUTH_READY || "").toLowerCase() === "true",
        introspectionConfigured: Boolean(env.MCP_INTROSPECTION_URL),
        auditSinkConfigured: Boolean(env.MCP_AUDIT_URL),
      });
    }

    if (url.pathname !== "/mcp") {
      return json(404, { ok: false, error: "NOT_FOUND" });
    }

    try {
      const principal = await introspect(request, env);
      const handler = createMcpHandler(
        () => createServer(principal, env),
        {
          route: "/mcp",
          legacy: "stateless",
          responseMode: "auto",
        },
      );

      return handler(request, env, ctx);
    } catch (error) {
      return authError(error);
    }
  },
} satisfies ExportedHandler<Env>;
