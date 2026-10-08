import { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "agents/mcp/server";
import { z } from "zod";
import catalog from "../../config/mcp-tools.generated.json";

type Env = {
  BI_API_BASE: string;
  MCP_AUTH_READY?: string;
  MCP_AUTH_SERVER_URL?: string;
  MCP_RESOURCE_URL?: string;
  MCP_INTROSPECTION_URL?: string;
  MCP_AUDIT_URL?: string;
  MCP_INTERNAL_AUDIT_TOKEN?: string;
};

type TenantGrant = {
  id: string;
  name?: string;
  entityId?: string;
  databaseId?: string;
  permissions?: string[];
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
  permission?: string;
  permissions?: readonly string[];
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

function canonicalResource(request: Request, env: Env) {
  const configured = String(env.MCP_RESOURCE_URL || "").trim();
  if (configured) return configured;
  return new URL("/mcp", request.url).toString();
}

function authServerBase(env: Env) {
  const configured = String(env.MCP_AUTH_SERVER_URL || "").trim();
  if (configured) return configured.replace(/\/$/, "");
  return String(env.BI_API_BASE || "").replace(/\/$/, "");
}

function protectedResourceMetadataUrl(request: Request) {
  return new URL("/.well-known/oauth-protected-resource", request.url).toString();
}

function oauthChallenge(request: Request, error = "invalid_token", description = "Authentication required") {
  const metadata = protectedResourceMetadataUrl(request);
  const safeDescription = description.replace(/["\\]/g, "");
  return `Bearer resource_metadata="${metadata}", scope="bi:read", error="${error}", error_description="${safeDescription}"`;
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
    body: JSON.stringify({
      audience: "bi-vella-mcp",
      resource: canonicalResource(request, env),
    }),
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
            permissions: Array.isArray(x.permissions) ? x.permissions.map(String) : [],
          }))
      : [],
    expiresAt: body.expiresAt ? Number(body.expiresAt) : undefined,
  };
}

function toolPermissions(tool: ToolDefinition) {
  const list = Array.isArray(tool.permissions) && tool.permissions.length
    ? tool.permissions.map(String)
    : (tool.permission ? [String(tool.permission)] : []);
  return [...new Set(list.filter(Boolean))];
}

function tenantCanUseTool(tenant: TenantGrant, tool: ToolDefinition) {
  const required = toolPermissions(tool);
  return required.length > 0 &&
    Array.isArray(tenant.permissions) &&
    required.every(permission => tenant.permissions!.includes(permission));
}

function canUseTool(principal: Principal, tool: ToolDefinition) {
  if (!principal.scopes.includes("bi:read")) return false;
  const required = toolPermissions(tool);
  if (!required.length) return false;
  if (principal.permissions.includes("*")) return true;
  if (required.every(permission => principal.permissions.includes(permission))) return true;
  return principal.tenants.some(tenant => tenantCanUseTool(tenant, tool));
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
    periodo: "periodo",
    comparar_periodo_anterior: "compararPeriodoAnterior",
    busca: "busca",
    tipo: "tipo",
    limite: "limite",
    economico_id: "economico_id",
    contribuinte_id: "contribuinte_id",
  };
  for (const [input, output] of Object.entries(mapping)) {
    const value = args[input];
    if (value !== undefined && value !== null && value !== "") {
      params.set(output, String(value));
    }
  }

  const filters = args.filters;
  if (filters && typeof filters === "object" && !Array.isArray(filters)) {
    for (const [key, value] of Object.entries(filters as Record<string, unknown>)) {
      if (value === undefined || value === null || value === "") continue;
      if (["string", "number", "boolean"].includes(typeof value)) {
        params.set(key, String(value));
      }
    }
  }

  if (args.carteira !== undefined && args.carteira !== null && args.carteira !== "") {
    params.set("carteira", String(args.carteira));
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
  const requiredPermissions = toolPermissions(tool);
  if (!principal.permissions.includes("*") &&
      !requiredPermissions.every(permission => principal.permissions.includes(permission)) &&
      !tenantCanUseTool(tenant, tool)) {
    throw new Error("MCP_TOOL_ACCESS_DENIED");
  }

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

type JsonRecord = Record<string, any>;

const analyticalTools = {
  bi_revenue_breakdown: {
    panel: "arrecadacao",
    permission: "BIArrecadacaoPage",
    title: "Arrecadação por dimensão",
    description: "Analisa a arrecadação por receita, crédito tributário, tipo de pagamento, tipo de baixa ou classificação da guia.",
  },
  bi_debt_portfolio: {
    panel: "debitos",
    permission: "BIDebitosPage",
    title: "Carteira de débitos",
    description: "Resume débitos abertos, vencidos ou pagos, com aging, crédito, origem e receita.",
  },
  bi_active_debt_summary: {
    panel: "divida",
    permission: "BIDividaPage",
    title: "Resumo da dívida ativa",
    description: "Resume estoque, composição, situação, aging, crédito, cobrança e recuperação da dívida ativa sem ranking nominal.",
  },
  bi_installments_summary: {
    panel: "parcelamentos",
    permission: "BIParcelamentosPage",
    title: "Resumo de parcelamentos",
    description: "Resume parcelamentos, parcelas vencidas, entradas, situações e recebimentos.",
  },
  bi_resolve_subject: {
    panel: "contribuintes",
    permission: "BIContribuintesPage",
    permissions: ["BIContribuintesPage", "BIEconomicosPage"],
    upstream: "/api/mcp/analytics/resolve-subject",
    title: "Resolver contribuinte ou econômico",
    description: "Resolve nome ou documento em candidatos seguros, com IDs estáveis e documento mascarado para desambiguação.",
  },
  bi_company_iss_detail: {
    panel: "arrecadacao",
    permission: "BIArrecadacaoPage",
    permissions: ["BIArrecadacaoPage", "BIEconomicosPage"],
    upstream: "/api/mcp/analytics/company-iss",
    title: "ISS por empresa",
    description: "Consulta ISS de um econômico específico, com desambiguação, total, evolução mensal e composição por crédito/receita.",
  },
  bi_subject_financial_summary: {
    panel: "debitos",
    permission: "BIDebitosPage",
    permissions: ["BIContribuintesPage", "BIDebitosPage", "BIDividaPage"],
    upstream: "/api/mcp/analytics/subject-financial",
    title: "Resumo financeiro do contribuinte",
    description: "Resume débitos e dívida ativa de um contribuinte específico sem expor documento completo, endereço ou lançamentos individualizados.",
  },
} as const;

function analyticToolDefinition(name: keyof typeof analyticalTools): ToolDefinition {
  const def = analyticalTools[name];
  const permissions = "permissions" in def && Array.isArray(def.permissions)
    ? [...def.permissions]
    : [def.permission];
  const upstream = "upstream" in def
    ? String(def.upstream)
    : "/api/dashboard/" + def.panel;
  return {
    name,
    panel: def.panel,
    title: def.title,
    description: def.description,
    permission: def.permission,
    permissions,
    upstream,
    readOnly: true,
  };
}

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : {};
}

function chartRows(chartValue: unknown, limitValue: unknown = 12) {
  const chart = record(chartValue);
  const labels = Array.isArray(chart.labels) ? chart.labels : [];
  const datasets = Array.isArray(chart.datasets) ? chart.datasets.map(record) : [];
  const limit = Math.max(1, Math.min(20, Number(limitValue) || 12));

  return labels.slice(0, limit).map((label: unknown, index: number) => {
    const values: Record<string, number | null> = {};
    for (const dataset of datasets) {
      const key = String(dataset.label || "Valor");
      const data = Array.isArray(dataset.data) ? dataset.data : [];
      const n = Number(data[index]);
      values[key] = Number.isFinite(n) ? n : null;
    }
    const names = Object.keys(values);
    return names.length === 1
      ? { label: String(label), value: values[names[0]] }
      : { label: String(label), values };
  });
}

function numeric(recordValue: JsonRecord, key: string) {
  const value = Number(recordValue[key]);
  return Number.isFinite(value) ? value : 0;
}

function revenueBreakdown(bodyValue: unknown, args: Record<string, unknown>) {
  const body = record(bodyValue);
  const kpis = record(body.kpis);
  const charts = record(body.charts);
  const dimension = String(args.dimensao || "");
  const map: Record<string, string> = {
    receita: "arrecadacao-receita",
    credito: "arrecadacao-credito",
    tipo_pagamento: "tipo-pagamento",
    tipo_baixa: "tipo-baixa",
    classificacao_guia: "guias",
  };
  const chartKey = map[dimension];
  if (!chartKey) throw new Error("MCP_DIMENSION_INVALID");

  const total = numeric(kpis, "total-pago");
  const groups = chartRows(charts[chartKey], args.limite).map((item: any) => ({
    ...item,
    ...(typeof item.value === "number"
      ? { percentual: total > 0 ? Number(((item.value / total) * 100).toFixed(2)) : 0 }
      : {}),
  }));

  return {
    tenant: body.tenant,
    period: body.period,
    filters: body.filters || {},
    dimensao: dimension,
    totalArrecadado: total,
    grupos: groups,
    calculationBasis: record(body.meta).calculationBasis || null,
  };
}

function debtPortfolio(bodyValue: unknown, args: Record<string, unknown>) {
  const body = record(bodyValue);
  const kpis = record(body.kpis);
  const charts = record(body.charts);
  return {
    tenant: body.tenant,
    period: body.period,
    filters: body.filters || {},
    carteira: String(args.carteira || "aberto"),
    totalLancado: numeric(kpis, "vl-lancado"),
    quantidadeDebitos: numeric(kpis, "qtd-debitos"),
    vencidos: numeric(kpis, "vencidos"),
    pagos: numeric(kpis, "pagos"),
    descontos: numeric(kpis, "descontos-debito"),
    aging: chartRows(charts["aging-debitos"], args.limite),
    porCredito: chartRows(charts["debitos-credito"], args.limite),
    porOrigem: chartRows(charts["origem-cadastro"], args.limite),
    porReceita: chartRows(charts["debitos-receita"], args.limite),
  };
}

function activeDebtSummary(bodyValue: unknown, args: Record<string, unknown>) {
  const body = record(bodyValue);
  const kpis = record(body.kpis);
  const charts = record(body.charts);
  return {
    tenant: body.tenant,
    period: body.period,
    filters: body.filters || {},
    saldoAtual: numeric(kpis, "saldo-divida"),
    valorInscrito: numeric(kpis, "inscrito"),
    quantidadeDividas: numeric(kpis, "qtd-dividas"),
    executadas: numeric(kpis, "executadas"),
    protestadas: numeric(kpis, "protestadas"),
    comCda: numeric(kpis, "cda"),
    composicao: chartRows(charts["composicao-divida"], args.limite),
    situacoes: chartRows(charts["status-divida"], args.limite),
    aging: chartRows(charts["aging-divida"], args.limite),
    porCredito: chartRows(charts["divida-credito"], args.limite),
    cobranca: chartRows(charts.cobranca, args.limite),
    recuperacaoMensal: chartRows(charts.recuperacao, args.limite),
    calculationBasis: record(body.meta).calculationBasis || null,
  };
}

function installmentsSummary(bodyValue: unknown, args: Record<string, unknown>) {
  const body = record(bodyValue);
  const kpis = record(body.kpis);
  const charts = record(body.charts);
  return {
    tenant: body.tenant,
    period: body.period,
    filters: body.filters || {},
    quantidadeParcelamentos: numeric(kpis, "qtd-parcelamentos"),
    ativos: numeric(kpis, "ativos"),
    quantidadeParcelas: numeric(kpis, "qtd-parcelas"),
    parcelasVencidas: numeric(kpis, "parcelas-vencidas"),
    valorEntradas: numeric(kpis, "entradas"),
    cancelados: numeric(kpis, "cancelados"),
    situacoes: chartRows(charts["situacao-parcelamentos"], args.limite),
    faixaParcelas: chartRows(charts["faixa-parcelas"], args.limite),
    vencidasPorParcelamento: chartRows(charts["vencidas-parcelamento"], args.limite),
    recebimentosMensais: chartRows(charts["pagamentos-parcelas"], args.limite),
  };
}

function identityResult(bodyValue: unknown) {
  return bodyValue;
}

function createServer(principal: Principal, env: Env) {
  const server = new McpServer({
    name: "bi-vella-mcp",
    version: "0.2.0",
  });

  for (const tool of generatedCatalog.tools) {
    if (!tool.readOnly || !toolPermissions(tool).length || !canUseTool(principal, tool)) continue;

    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema,
        securitySchemes: [{ type: "oauth2", scopes: ["bi:read"] }],
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          openWorldHint: false,
        },
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
            structuredContent: {
              ok: true,
              tenant: result.tenant,
              panel: tool.panel,
              data: result.body,
            },
          };
        } catch (error) {
          return toolError(error);
        }
      },
    );
  }

  const commonAnalyticsSchema = {
    tenant_id: z.string().trim().min(1).optional(),
    periodo: z.string().optional(),
    exercicio: z.number().int().min(2000).max(2100).optional(),
    limite: z.number().int().min(1).max(20).optional(),
    filters: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  };

  const registerAnalytic = (
    name: keyof typeof analyticalTools,
    input: Record<string, z.ZodTypeAny>,
    transform: (body: unknown, args: Record<string, unknown>) => unknown,
  ) => {
    const tool = analyticToolDefinition(name);
    if (!canUseTool(principal, tool)) return;

    server.registerTool(
      name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: input,
        securitySchemes: [{ type: "oauth2", scopes: ["bi:read"] }],
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          openWorldHint: false,
        },
      },
      async (args) => {
        try {
          const normalized = args as Record<string, unknown>;
          const result = await callBi(env, principal, tool, normalized);
          const data = transform(result.body, normalized);
          return {
            content: [{ type: "text" as const, text: JSON.stringify({ ok: true, data }) }],
            structuredContent: { ok: true, data },
          };
        } catch (error) {
          return toolError(error);
        }
      },
    );
  };

  registerAnalytic(
    "bi_revenue_breakdown",
    {
      ...commonAnalyticsSchema,
      dimensao: z.enum(["receita", "credito", "tipo_pagamento", "tipo_baixa", "classificacao_guia"]),
    },
    revenueBreakdown,
  );

  registerAnalytic(
    "bi_debt_portfolio",
    {
      ...commonAnalyticsSchema,
      carteira: z.enum(["aberto", "vencido", "pago"]).optional(),
    },
    debtPortfolio,
  );

  registerAnalytic("bi_active_debt_summary", commonAnalyticsSchema, activeDebtSummary);
  registerAnalytic("bi_installments_summary", commonAnalyticsSchema, installmentsSummary);

  registerAnalytic(
    "bi_resolve_subject",
    {
      tenant_id: z.string().trim().min(1).optional(),
      busca: z.string().trim().min(2).max(120),
      tipo: z.enum(["ambos", "contribuinte", "economico"]).optional(),
      limite: z.number().int().min(1).max(10).optional(),
    },
    identityResult,
  );

  registerAnalytic(
    "bi_company_iss_detail",
    {
      tenant_id: z.string().trim().min(1).optional(),
      busca: z.string().trim().min(2).max(120),
      economico_id: z.string().trim().min(1).max(80).optional(),
      periodo: z.string().optional(),
      exercicio: z.number().int().min(2000).max(2100).optional(),
      limite: z.number().int().min(1).max(12).optional(),
    },
    identityResult,
  );

  registerAnalytic(
    "bi_subject_financial_summary",
    {
      tenant_id: z.string().trim().min(1).optional(),
      busca: z.string().trim().min(2).max(120),
      contribuinte_id: z.string().trim().min(1).max(80).optional(),
      periodo: z.string().optional(),
      exercicio: z.number().int().min(2000).max(2100).optional(),
    },
    identityResult,
  );

  return server;
}

function authError(request: Request, error: unknown) {
  const code = error instanceof Error ? error.message : "MCP_AUTH_FAILED";
  const unavailable = code === "MCP_AUTH_NOT_READY" || code === "MCP_INTROSPECTION_NOT_CONFIGURED";
  const status = unavailable ? 503 : 401;
  const oauthError = code === "MCP_TOKEN_REQUIRED" ? "invalid_token" : "invalid_token";

  return json(status, { ok: false, error: code }, {
    ...(status === 401
      ? { "WWW-Authenticate": oauthChallenge(request, oauthError, code) }
      : {}),
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/.well-known/oauth-protected-resource" && request.method === "GET") {
      return json(200, {
        resource: canonicalResource(request, env),
        authorization_servers: [authServerBase(env)],
        scopes_supported: ["bi:read"],
        bearer_methods_supported: ["header"],
        resource_documentation: "https://github.com/uelitonbueno-creator/betha/blob/main/docs/mcp-production.md",
      });
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return json(200, {
        ok: true,
        service: "bi-vella-mcp",
        mode: generatedCatalog.mode,
        toolCount: generatedCatalog.toolCount + Object.keys(analyticalTools).length,
        missingPermissions: generatedCatalog.missingPermissions,
        authReady: String(env.MCP_AUTH_READY || "").toLowerCase() === "true",
        authServerConfigured: Boolean(authServerBase(env)),
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
      return authError(request, error);
    }
  },
} satisfies ExportedHandler<Env>;
