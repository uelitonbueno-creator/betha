/**
 * Backend seguro para o BI Tributos.
 *
 * Nunca envie BETHA_ACCESS_TOKEN ou BETHA_USER_ACCESS ao navegador.
 * Configure-os como secrets no provedor de execução.
 *
 * Este Worker possui apenas o esqueleto. Os caminhos exatos da API
 * "Tributos integrações BI" devem ser preenchidos após mapear o Swagger.
 */

const ROUTES = {
  overview: "BETHA_OVERVIEW_PATH"
};

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(v => v.trim())
    .filter(Boolean);

  const allowOrigin = allowed.includes(origin) ? origin : (allowed[0] || "");
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Accept",
    "Vary": "Origin",
    "Cache-Control": "no-store"
  };
}

function json(request, env, status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(request, env) }
  });
}

async function bethaGet(env, path, search = "") {
  if (!env.BETHA_API_BASE) throw new Error("BETHA_API_BASE_NOT_CONFIGURED");
  if (!env.BETHA_ACCESS_TOKEN) throw new Error("BETHA_ACCESS_TOKEN_NOT_CONFIGURED");
  if (!env.BETHA_USER_ACCESS) throw new Error("BETHA_USER_ACCESS_NOT_CONFIGURED");
  if (!path || !path.startsWith("/")) throw new Error("BETHA_ENDPOINT_NOT_CONFIGURED");

  const url = String(env.BETHA_API_BASE).replace(/\/$/, "") + path + search;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": "Bearer " + env.BETHA_ACCESS_TOKEN,
      "User-Access": env.BETHA_USER_ACCESS
    }
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error("BETHA_HTTP_" + response.status + ": " + text.slice(0, 300));
  }
  return text ? JSON.parse(text) : {};
}

function normalizeOverview(raw) {
  // TODO: adaptar aos nomes reais retornados pelo Swagger.
  // O front trabalha com este contrato estável e nunca precisa conhecer
  // o token, User-Access ou a estrutura interna da API Betha.
  return {
    arrecadado: raw.arrecadado ?? raw.valorArrecadado ?? null,
    emAberto: raw.emAberto ?? raw.valorEmAberto ?? null,
    contribuintes: raw.contribuintes ?? raw.quantidadeContribuintes ?? null,
    imoveis: raw.imoveis ?? raw.quantidadeImoveis ?? null,
    arrecadacaoSerie: raw.arrecadacaoSerie ?? [],
    creditos: raw.creditos ?? []
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }
    if (request.method !== "GET") {
      return json(request, env, 405, { error: "Método não permitido" });
    }

    if (url.pathname === "/api/health") {
      return json(request, env, 200, {
        ok: true,
        bethaBaseConfigured: Boolean(env.BETHA_API_BASE),
        tokenConfigured: Boolean(env.BETHA_ACCESS_TOKEN),
        userAccessConfigured: Boolean(env.BETHA_USER_ACCESS)
      });
    }

    if (url.pathname === "/api/bi/overview") {
      const envName = ROUTES.overview;
      const path = env[envName];

      if (!path) {
        return json(request, env, 501, {
          error: "Endpoint de visão geral ainda não mapeado",
          requiredVariable: envName
        });
      }

      try {
        const search = new URLSearchParams();
        if (url.searchParams.get("exercicio")) search.set("exercicio", url.searchParams.get("exercicio"));
        if (url.searchParams.get("periodo")) search.set("periodo", url.searchParams.get("periodo"));

        const raw = await bethaGet(env, path, search.size ? "?" + search.toString() : "");
        return json(request, env, 200, normalizeOverview(raw));
      } catch (error) {
        console.error(error);
        return json(request, env, 502, { error: "Falha ao consultar a API Betha" });
      }
    }

    return json(request, env, 404, { error: "Rota não encontrada" });
  }
};