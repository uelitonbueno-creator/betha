/**
 * BI Tributos - backend multi-entidade.
 *
 * Segurança:
 * - Token de serviço e User-Access nunca saem do backend.
 * - O token do usuário autenticado é usado apenas para validar identidade/acessos
 *   e para operações de administração permitidas pela Betha.
 * - Todo acesso a dados valida se o usuário possui vínculo com o database+entity
 *   do tenant solicitado.
 */
const BI_BASE_DEFAULT = "https://tributos.suite.betha.cloud";
const AUTH_BASE = "https://plataforma-autorizacoes.betha.cloud";
const USERS_BASE = "https://plataforma-usuarios.betha.cloud";
const LICENSES_BASE = "https://plataforma-licencas.betha.cloud";
const OAUTH_AUTHORIZE_URL = "https://plataforma-oauth.betha.cloud/auth/oauth2/authorize";
const OAUTH_TOKEN_URL = "https://plataforma-oauth.betha.cloud/auth/oauth2/token";
const LOGIN_REDIRECT_DEFAULT = "https://betha-bi-api.ueliton-bueno.workers.dev/api/auth/callback";
const FRONT_URL_DEFAULT = "https://uelitonbueno-creator.github.io/betha/";
const LOGIN_SCOPES_DEFAULT = "contas-usuarios.suite,user-accounts.suite,licenses.suite";

const BI_RESOURCES = Object.freeze({
  contribuintes: "/integracoes-bi/v1/contribuintes",
  imoveis: "/integracoes-bi/v1/imoveis",
  "imoveis-responsaveis": "/integracoes-bi/v1/imoveis/responsaveis",
  "imoveis-corresponsaveis": "/integracoes-bi/v1/imoveis/corresponsaveis",
  "imoveis-campos-adicionais": "/integracoes-bi/v1/imoveis/campos-adicionais",
  economicos: "/integracoes-bi/v1/economicos",
  "economicos-atividades": "/integracoes-bi/v1/economicos/atividades",
  indexadores: "/integracoes-bi/v1/indexadores",
  "indexadores-valores": "/integracoes-bi/v1/indexadores/valores",
  receitas: "/integracoes-bi/v1/receitas",
  debitos: "/integracoes-bi/v1/debitos",
  "debitos-receitas": "/integracoes-bi/v1/debitos/receitas",
  dividas: "/integracoes-bi/v1/dividas",
  "dividas-receitas": "/integracoes-bi/v1/dividas/receitas",
  parcelamentos: "/integracoes-bi/v1/parcelamentos",
  "parcelamentos-referentes": "/integracoes-bi/v1/parcelamentos/referentes",
  "parcelamentos-parcelas": "/integracoes-bi/v1/parcelamentos/parcelas",
  pagamentos: "/integracoes-bi/v1/pagamentos",
  "pagamentos-parcelamentos": "/integracoes-bi/v1/pagamentos/parcelamentos",
  "pagamentos-detalhados": "/integracoes-bi/v1/pagamentos-detalhados",
  "pagamentos-detalhados-valores": "/integracoes-bi/v1/pagamentos-detalhados/valores",
  "solicitacoes-transferencias-imoveis": "/integracoes-bi/v1/solicitacoes-transferencias-imoveis",
  "solicitacoes-transferencias-imoveis-itens": "/integracoes-bi/v1/solicitacoes-transferencias-imoveis/itens",
  "solicitacoes-transferencias-imoveis-movimentacoes": "/integracoes-bi/v1/solicitacoes-transferencias-imoveis/movimentacoes",
  "transferencias-imoveis": "/integracoes-bi/v1/transferencias-imoveis",
  "transferencias-imoveis-compra": "/integracoes-bi/v1/transferencias-imoveis/compra"
});

const BASE_RESOURCES = Object.freeze({
  imoveis: "/dados/v1/imoveis",
  bairros: "/dados/v1/bairros",
  distritos: "/dados/v1/distritos",
  logradouros: "/dados/v1/logradouros",
  loteamentos: "/dados/v1/loteamentos",
  contribuintes: "/dados/v1/contribuintes",
  "planta-valores": "/dados/v1/planta-valores",
  obras: "/dados/v1/obras",
  "obras-responsaveis": "/dados/v1/obras/responsaveis-execucao",
  "creditos-tributarios": "/dados/v1/creditos-tributarios",
  "creditos-tributarios-receitas": "/dados/v1/creditos-tributarios/receitas",
  "guias-unificadas": "/dados/v1/guias-unificadas",
  parcelamentos: "/dados/v1/parcelamentos",
  "parcelamentos-parcelas": "/dados/v1/parcelamentos/parcelas",
  "encerramento-dividas": "/dados/v1/encerramento-mensal/movimentacoes-dividas",
  "encerramento-lancamentos": "/dados/v1/encerramento-mensal/movimentacoes-lanctos",
  dividas: "/dados/v1/dividas",
  "imoveis-transferencias": "/dados/v1/imoveis/transferencias"
});

const FORWARDED_QUERY_PARAMS = new Set(["offset","limit","filter","fields","cpaFields","sort"]);

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const raw = env.ALLOWED_ORIGINS || "https://uelitonbueno-creator.github.io";
  const allowed = String(raw).split(",").map(v => v.trim()).filter(Boolean);
  const allowOrigin = allowed.includes(origin) ? origin : "";
  return {
    ...(allowOrigin ? {"Access-Control-Allow-Origin": allowOrigin} : {}),
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Accept,Authorization,X-Tenant-Id",
    "Vary": "Origin",
    "Cache-Control": "no-store"
  };
}

function json(request, env, status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {"Content-Type":"application/json; charset=utf-8", ...corsHeaders(request, env)}
  });
}

function parseJsonObject(value, fallback={}) {
  if (!value) return fallback;
  try {
    const parsed=JSON.parse(value);
    return parsed && typeof parsed==="object" && !Array.isArray(parsed) ? parsed : fallback;
  } catch { return fallback; }
}

function getTenantId(request,url) {
  return (request.headers.get("X-Tenant-Id") || url.searchParams.get("tenant") || "").trim();
}

function resolveTenant(env, tenantId) {
  if (!tenantId) throw new Error("TENANT_REQUIRED");
  const tenants=parseJsonObject(env.BETHA_TENANTS_JSON,{});
  const tenant=tenants[tenantId];
  if (!tenant || tenant.enabled===false) throw new Error("TENANT_NOT_FOUND");
  if (!tenant.userAccess) throw new Error("TENANT_USER_ACCESS_NOT_CONFIGURED");
  return {
    id:tenantId,
    name:tenant.name || tenantId,
    entityId:tenant.entityId ? String(tenant.entityId) : null,
    databaseId:tenant.databaseId ? String(tenant.databaseId) : null,
    userAccess:tenant.userAccess,
    accessToken:tenant.accessToken || env.BETHA_ACCESS_TOKEN || ""
  };
}

function bytesToBase64Url(bytes) {
  let binary="";
  for (const b of bytes) binary+=String.fromCharCode(b);
  return btoa(binary).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
}

function base64UrlToBytes(value) {
  let normalized=String(value||"").replace(/-/g,"+").replace(/_/g,"/");
  while (normalized.length%4) normalized+="=";
  const binary=atob(normalized);
  const out=new Uint8Array(binary.length);
  for (let i=0;i<binary.length;i++) out[i]=binary.charCodeAt(i);
  return out;
}

async function sessionKey(secret) {
  if (!secret) throw new Error("LOGIN_CLIENT_SECRET_NOT_CONFIGURED");
  const raw=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw",raw,{name:"AES-GCM"},false,["encrypt","decrypt"]);
}

async function sealSession(payload, secret) {
  const key=await sessionKey(secret);
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const plain=new TextEncoder().encode(JSON.stringify(payload));
  const encrypted=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,plain);
  return "v1."+bytesToBase64Url(iv)+"."+bytesToBase64Url(new Uint8Array(encrypted));
}

async function openSession(token, secret) {
  const parts=String(token||"").split(".");
  if (parts.length!==3 || parts[0]!=="v1") throw new Error("APPLICATION_SESSION_INVALID");
  try {
    const key=await sessionKey(secret);
    const iv=base64UrlToBytes(parts[1]);
    const encrypted=base64UrlToBytes(parts[2]);
    const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv},key,encrypted);
    const payload=JSON.parse(new TextDecoder().decode(plain));
    if (!payload || !payload.accessToken) throw new Error("APPLICATION_SESSION_INVALID");
    if (payload.exp && Date.now()>=Number(payload.exp)) throw new Error("APPLICATION_SESSION_EXPIRED");
    return payload;
  } catch(error) {
    if (error.message==="APPLICATION_SESSION_EXPIRED") throw error;
    throw new Error("APPLICATION_SESSION_INVALID");
  }
}

async function oauthStateKey(secret) {
  if (!secret) throw new Error("LOGIN_CLIENT_SECRET_NOT_CONFIGURED");
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {name:"HMAC",hash:"SHA-256"},
    false,
    ["sign","verify"]
  );
}

async function createOAuthState(secret) {
  const ts=Date.now().toString(36);
  const nonce=bytesToBase64Url(crypto.getRandomValues(new Uint8Array(12)));
  const payload=ts+"."+nonce;
  const key=await oauthStateKey(secret);
  const sig=await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(payload));
  return payload+"."+bytesToBase64Url(new Uint8Array(sig));
}

async function validateOAuthState(state, secret) {
  const parts=String(state||"").split(".");
  if (parts.length!==3) throw new Error("OAUTH_STATE_INVALID");

  const [ts,nonce,signature]=parts;
  const created=parseInt(ts,36);
  if (!Number.isFinite(created) || Date.now()-created>10*60*1000 || created>Date.now()+60*1000) {
    throw new Error("OAUTH_STATE_INVALID");
  }

  const payload=ts+"."+nonce;
  const key=await oauthStateKey(secret);
  const valid=await crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlToBytes(signature),
    new TextEncoder().encode(payload)
  );
  if (!valid) throw new Error("OAUTH_STATE_INVALID");
  return true;
}

function devSessionSecret(env) {
  return env.BI_DEV_SESSION_SECRET || env.BETHA_LOGIN_CLIENT_SECRET || "";
}

function normalizeDevCredential(value) {
  let text=String(value ?? "").trim();
  if (
    text.length>=2 &&
    ((text.startsWith('"') && text.endsWith('"')) ||
     (text.startsWith("'") && text.endsWith("'")))
  ) {
    text=text.slice(1,-1).trim();
  }
  return text;
}

async function devHmacKey(secret) {
  if (!secret) throw new Error("DEV_SESSION_SECRET_NOT_CONFIGURED");
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {name:"HMAC",hash:"SHA-256"},
    false,
    ["sign","verify"]
  );
}

async function createDevSession(env, username) {
  const secret=devSessionSecret(env);
  if (!secret) throw new Error("DEV_SESSION_SECRET_NOT_CONFIGURED");

  const payload={
    v:1,
    u:String(username||""),
    exp:Date.now()+8*60*60*1000
  };

  const encoded=bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const key=await devHmacKey(secret);
  const signature=await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(encoded));

  return "d1."+encoded+"."+bytesToBase64Url(new Uint8Array(signature));
}

async function validateDevSession(request, env) {
  const header=request.headers.get("Authorization") || "";
  const match=header.match(/^DevSession\s+(.+)$/i);
  if (!match) throw new Error("DEV_SESSION_REQUIRED");

  const secret=devSessionSecret(env);
  if (!secret) throw new Error("DEV_SESSION_SECRET_NOT_CONFIGURED");

  const token=match[1].trim();
  const parts=token.split(".");
  if (parts.length!==3 || parts[0]!=="d1") throw new Error("DEV_SESSION_INVALID");

  try {
    const encoded=parts[1];
    const signature=base64UrlToBytes(parts[2]);
    const key=await devHmacKey(secret);
    const valid=await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      new TextEncoder().encode(encoded)
    );
    if (!valid) throw new Error("DEV_SESSION_INVALID");

    const payload=JSON.parse(new TextDecoder().decode(base64UrlToBytes(encoded)));
    if (!payload || payload.v!==1 || !payload.u) throw new Error("DEV_SESSION_INVALID");
    if (!payload.exp || Date.now()>=Number(payload.exp)) throw new Error("DEV_SESSION_EXPIRED");

    return {
      kind:"dev-session",
      username:String(payload.u),
      exp:Number(payload.exp)
    };
  } catch(error) {
    if (error.message==="DEV_SESSION_EXPIRED") throw error;
    throw new Error("DEV_SESSION_INVALID");
  }
}

async function getUserToken(request, env) {
  const header=request.headers.get("Authorization") || "";
  const sessionMatch=header.match(/^Session\s+(.+)$/i);
  if (sessionMatch) {
    const session=await openSession(sessionMatch[1].trim(),env.BETHA_LOGIN_CLIENT_SECRET);
    return session.accessToken;
  }

  // Compatibilidade temporária durante a migração.
  const bearerMatch=header.match(/^Bearer\s+(.+)$/i);
  return bearerMatch ? bearerMatch[1].trim() : "";
}

async function readJsonResponse(response) {
  const text=await response.text();
  let body=null;
  try { body=text ? JSON.parse(text) : null; } catch { body=text; }
  return {body,text};
}

async function platformRequest(url, options={}) {
  const response=await fetch(url,options);
  const parsed=await readJsonResponse(response);
  if (!response.ok) {
    const error=new Error("PLATFORM_HTTP_"+response.status);
    error.status=response.status;
    error.remoteBody=typeof parsed.body==="string" ? parsed.body.slice(0,500) : parsed.body;
    throw error;
  }
  return parsed.body;
}

async function getUserAccesses(userToken) {
  if (!userToken) throw new Error("USER_TOKEN_REQUIRED");
  const payload=await platformRequest(
    AUTH_BASE+"/user-accounts/v0.1/api/suite/users/@me/access",
    {headers:{"Accept":"application/json","Authorization":"Bearer "+userToken}}
  );
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.content)) return payload.content;
  return [];
}

function parseContextString(context) {
  if (!context || typeof context!=="string") return {};
  try {
    let normalized=context.replace(/-/g,"+").replace(/_/g,"/");
    while(normalized.length%4) normalized+="=";
    const decoded=atob(normalized);
    const out={};
    decoded.split(",").forEach(part=>{
      const idx=part.indexOf(":");
      if(idx>0) out[part.slice(0,idx).trim()]=part.slice(idx+1).trim();
    });
    return out;
  } catch { return {}; }
}

function accessValues(access) {
  const values=(access && access.values && typeof access.values==="object") ? access.values : {};
  const decoded=parseContextString(access && access.context);
  return {
    database:String(values.database ?? decoded.database ?? ""),
    entity:String(values.entity ?? decoded.entity ?? "")
  };
}

function unwrapEntity(payload) {
  if (!payload) return null;
  if (Array.isArray(payload)) return payload[0] || null;
  if (payload.content && Array.isArray(payload.content)) return payload.content[0] || null;
  if (payload.data && typeof payload.data==="object") return unwrapEntity(payload.data);
  return payload;
}

function scalar(value) {
  if (value===null || value===undefined) return "";
  if (typeof value==="object") return String(value.id ?? value.codigo ?? value.value ?? "");
  return String(value);
}

function extractTenantContext(payload, tenant) {
  const obj=unwrapEntity(payload) || {};
  const entity=tenant.entityId || scalar(obj.entityId) || scalar(obj.entidadeId) ||
    scalar(obj.entity) || scalar(obj.entidade) || scalar(obj.id);
  const database=tenant.databaseId || scalar(obj.databaseId) || scalar(obj.database) ||
    scalar(obj.banco) || scalar(obj.database?.id);
  return {entity:String(entity||""),database:String(database||""),raw:obj};
}

async function getTenantContext(userToken, tenant) {
  if (tenant.entityId && tenant.databaseId) {
    return {entity:tenant.entityId,database:tenant.databaseId};
  }
  try {
    const payload=await platformRequest(
      LICENSES_BASE+"/licenses/v0.1/api/entidades/atual/",
      {headers:{
        "Accept":"application/json",
        "Authorization":"Bearer "+userToken,
        "User-Access":tenant.userAccess
      }}
    );
    const ctx=extractTenantContext(payload,tenant);
    if (ctx.entity && ctx.database) return ctx;
  } catch(error) {
    console.warn("tenant context via licensing failed",tenant.id,error.message);
  }
  throw new Error("TENANT_CONTEXT_UNRESOLVED");
}

function matchAccess(accesses, context) {
  return accesses.find(access=>{
    const values=accessValues(access);
    return values.entity===String(context.entity) && values.database===String(context.database);
  }) || null;
}

async function authorizeTenant(request, env, tenant) {
  const userToken=await getUserToken(request,env);
  if (!userToken) throw new Error("USER_TOKEN_REQUIRED");
  const [accesses,context]=await Promise.all([
    getUserAccesses(userToken),
    getTenantContext(userToken,tenant)
  ]);
  const access=matchAccess(accesses,context);
  if (!access) throw new Error("TENANT_ACCESS_DENIED");
  if (access.accepted===false) throw new Error("TENANT_ACCESS_NOT_ACCEPTED");
  if (access.expiresIn && new Date(access.expiresIn).getTime() < Date.now()) throw new Error("TENANT_ACCESS_EXPIRED");
  return {userToken,access,context};
}

function buildForwardedQuery(url) {
  const out=new URLSearchParams();
  for (const [key,value] of url.searchParams.entries()) {
    if (FORWARDED_QUERY_PARAMS.has(key)) out.append(key,value);
  }
  return out.toString();
}

function baseResourceMap(env) {
  return {...BASE_RESOURCES, ...parseJsonObject(env.BETHA_BASE_RESOURCE_MAP_JSON,{})};
}

function resolveResource(env,source,resource) {
  if (source==="bi") {
    const path=BI_RESOURCES[resource];
    if (!path) throw new Error("BI_RESOURCE_NOT_ALLOWED");
    return {base:env.BETHA_BI_API_BASE || BI_BASE_DEFAULT,path};
  }
  if (source==="base") {
    const map=baseResourceMap(env);
    const path=map[resource];
    if (!path || typeof path!=="string" || !path.startsWith("/")) throw new Error("BASE_RESOURCE_NOT_CONFIGURED");
    return {base:env.BETHA_BASE_API_BASE || BI_BASE_DEFAULT,path};
  }
  throw new Error("INVALID_SOURCE");
}

async function bethaGet(env,tenant,source,resource,query="") {
  const {base,path}=resolveResource(env,source,resource);
  if (!tenant.accessToken) throw new Error("BETHA_ACCESS_TOKEN_NOT_CONFIGURED");
  const target=String(base).replace(/\/$/,"")+path+(query?"?"+query:"");
  const response=await fetch(target,{
    method:"GET",
    headers:{
      "Accept":"application/json",
      "Authorization":"Bearer "+tenant.accessToken,
      "User-Access":tenant.userAccess
    }
  });
  const parsed=await readJsonResponse(response);
  if (!response.ok) {
    const error=new Error("BETHA_HTTP_"+response.status);
    error.status=response.status;
    error.remoteBody=typeof parsed.body==="string"?parsed.body.slice(0,300):parsed.body;
    throw error;
  }
  return parsed.body;
}

function payloadRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload!=="object") return [];
  if (Array.isArray(payload.content)) return payload.content;
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && Array.isArray(payload.data.content)) return payload.data.content;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
}

function payloadTotal(payload) {
  if (!payload || typeof payload!=="object") return null;
  const candidates=[
    payload.total,
    payload.totalElements,
    payload.totalRegistros,
    payload.totalRecords,
    payload.count,
    payload.pagination && payload.pagination.total,
    payload.page && payload.page.totalElements,
    payload.metadata && payload.metadata.total
  ];
  for (const value of candidates) {
    const n=Number(value);
    if (Number.isFinite(n) && n>=0) return n;
  }
  return null;
}

function payloadPageMeta(payload, requestedOffset, requestedLimit, rowCount) {
  const root=(payload && typeof payload==="object") ? payload : {};
  const nested=root.pagination || root.page || root.metadata || {};

  const offsetCandidates=[root.offset,nested.offset,nested.number!=null ? Number(nested.number)*Number(root.limit||nested.size||requestedLimit) : null];
  const limitCandidates=[root.limit,nested.limit,nested.size];
  const hasNextCandidates=[root.hasNext,nested.hasNext,nested.last===false ? true : nested.last===true ? false : undefined];

  let offset=requestedOffset;
  for(const value of offsetCandidates){
    const n=Number(value);
    if(Number.isFinite(n)&&n>=0){offset=n;break;}
  }

  let limit=requestedLimit;
  for(const value of limitCandidates){
    const n=Number(value);
    if(Number.isFinite(n)&&n>0){limit=n;break;}
  }

  let hasNext=null;
  for(const value of hasNextCandidates){
    if(typeof value==="boolean"){hasNext=value;break;}
    if(value==="true"||value==="false"){hasNext=value==="true";break;}
  }

  return {
    offset,
    limit,
    total:payloadTotal(payload),
    hasNext,
    nextOffset:offset + (limit>0 ? limit : rowCount)
  };
}

async function fetchBethaRows(env,tenant,source,resource,{limit=1000,maxPages=null}={}) {
  const rows=[];
  const seenIds=new Set();
  const seenFingerprints=new Set();
  const pageMeta=[];
  let reportedTotal=null;
  let truncated=false;
  let repeatedPage=false;
  let offset=0;
  let pages=0;
  let reachedEnd=false;

  const safetyMaxPages=maxPages==null ? 500 : Math.max(1,Number(maxPages));

  for (let page=0;page<safetyMaxPages;page++) {
    const body=await bethaGet(env,tenant,source,resource,"limit="+limit+"&offset="+offset);
    pages++;

    const pageRows=payloadRows(body);
    const meta=payloadPageMeta(body,offset,limit,pageRows.length);
    if (reportedTotal===null && meta.total!==null) reportedTotal=meta.total;
    pageMeta.push({
      offset:meta.offset,
      limit:meta.limit,
      total:meta.total,
      hasNext:meta.hasNext,
      returned:pageRows.length
    });

    const fingerprint=pageRows.slice(0,10).map((row,index)=>{
      const id=firstValue(row,["id","codigo","idIntegracao","uuid"]);
      return id!==undefined ? String(id) : JSON.stringify(row||{}).slice(0,220)+":"+index;
    }).join("|");

    if (fingerprint && seenFingerprints.has(fingerprint)) {
      repeatedPage=true;
      truncated=true;
      break;
    }
    if (fingerprint) seenFingerprints.add(fingerprint);

    let newRows=0;
    for (const row of pageRows) {
      const id=firstValue(row,["id","codigo","idIntegracao","uuid"]);
      if (id!==undefined && id!==null && id!=="") {
        const key=String(id);
        if (seenIds.has(key)) continue;
        seenIds.add(key);
      }
      rows.push(row);
      newRows++;
    }

    // hasNext, quando presente, é a regra principal de paginação da Betha.
    if (meta.hasNext===false) {
      reachedEnd=true;
      break;
    }

    // Fallback para endpoints que não retornam hasNext.
    if (meta.hasNext===null && (!pageRows.length || pageRows.length<meta.limit)) {
      reachedEnd=true;
      break;
    }

    if (!pageRows.length || !newRows) {
      repeatedPage=true;
      truncated=true;
      break;
    }

    const nextOffset=meta.nextOffset;
    if (!Number.isFinite(nextOffset) || nextOffset<=offset) {
      truncated=true;
      break;
    }
    offset=nextOffset;

    if (page===safetyMaxPages-1) truncated=true;
  }

  if (reportedTotal!==null && rows.length>reportedTotal) {
    // O endpoint percorreu mais registros do que o suposto "total".
    // Nesse caso esse campo não representa o total global.
    reportedTotal=null;
  }

  const totalMismatch=reportedTotal!==null && reachedEnd && reportedTotal!==rows.length;
  const complete=reachedEnd && !truncated;

  return {
    rows,
    total:complete ? rows.length : Math.max(reportedTotal||0,rows.length),
    reportedTotal,
    loaded:rows.length,
    pages,
    complete,
    truncated,
    repeatedPage,
    totalMismatch,
    pageMeta
  };
}

async function safeBethaRows(env,tenant,source,resource,options={}) {
  const heavyFinancial=new Set([
    "pagamentos",
    "pagamentos-detalhados",
    "pagamentos-detalhados-valores",
    "debitos",
    "debitos-receitas",
    "dividas",
    "dividas-receitas"
  ]);

  const requestedLimit=Number(options.limit || 0);
  const limits=requestedLimit>0
    ? [requestedLimit]
    : (heavyFinancial.has(resource) ? [500,250,100,50] : [1000,500,250]);

  let lastError=null;

  for (const limit of limits) {
    try {
      const result=await fetchBethaRows(env,tenant,source,resource,{...options,limit});
      // Alguns endpoints BI retornam 1001 como marcador/limite, e não como total global.
      // Se o "total" informado for menor que o que efetivamente foi percorrido,
      // descartamos esse número e confiamos no fim real da paginação.
      if (result.reportedTotal!==null && result.loaded>result.reportedTotal) {
        result.reportedTotal=null;
        result.totalMismatch=false;
        result.total=result.loaded;
      }
      return {...result,error:null,errorStatus:null,errorDetail:null,pageLimit:limit};
    } catch(error) {
      lastError=error;
      // Tenta página menor para endpoints pesados/instáveis.
      // 401/403/404 não melhoram reduzindo a página.
      if ([401,403,404].includes(Number(error.status))) break;
    }
  }

  const detail=lastError && lastError.remoteBody
    ? (typeof lastError.remoteBody==="string"
        ? lastError.remoteBody.slice(0,240)
        : JSON.stringify(lastError.remoteBody).slice(0,240))
    : null;

  console.warn("dashboard source failed",source,resource,lastError && lastError.message,detail);

  return {
    rows:[],
    total:0,
    reportedTotal:null,
    loaded:0,
    pages:0,
    complete:false,
    truncated:false,
    repeatedPage:false,
    totalMismatch:false,
    pageMeta:[],
    pageLimit:null,
    error:lastError ? lastError.message : "UNKNOWN_ERROR",
    errorStatus:lastError ? (lastError.status || null) : null,
    errorDetail:detail
  };
}

function valueAt(obj,path) {
  if (!obj || !path) return undefined;
  if (!String(path).includes(".")) return obj[path];
  return String(path).split(".").reduce((acc,key)=>acc==null?undefined:acc[key],obj);
}

function normalizeFieldName(value) {
  return String(value||"")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-zA-Z0-9]/g,"")
    .toLowerCase();
}

function findFieldAdaptive(obj,candidates,maxDepth=4) {
  if (!obj || typeof obj!=="object") return undefined;
  const wanted=new Set(candidates.map(c=>normalizeFieldName(String(c).split(".").pop())));

  const queue=[{value:obj,depth:0}];
  const visited=new Set();

  while(queue.length){
    const current=queue.shift();
    const value=current.value;
    if(!value || typeof value!=="object" || visited.has(value)) continue;
    visited.add(value);

    for(const [key,val] of Object.entries(value)){
      if(wanted.has(normalizeFieldName(key)) && val!==undefined && val!==null && val!==""){
        return val;
      }
      if(current.depth<maxDepth && val && typeof val==="object" && !Array.isArray(val)){
        queue.push({value:val,depth:current.depth+1});
      }
    }
  }
  return undefined;
}

function firstValue(obj,paths) {
  for (const path of paths) {
    const value=valueAt(obj,path);
    if (value!==undefined && value!==null && value!=="") return value;
  }
  return findFieldAdaptive(obj,paths);
}

function numericValue(obj,paths) {
  const raw=firstValue(obj,paths);
  if (raw===undefined) return 0;
  if (typeof raw==="number") return Number.isFinite(raw)?raw:0;
  const text=String(raw).trim();
  const normalized=text.includes(",")
    ? text.replace(/\./g,"").replace(",",".")
    : text;
  const n=Number(normalized);
  return Number.isFinite(n)?n:0;
}

function stringValue(obj,paths,fallback="Não informado") {
  const raw=firstValue(obj,paths);
  if (raw===undefined || raw===null || raw==="") return fallback;
  if (typeof raw==="object") {
    return String(raw.descricao ?? raw.nome ?? raw.codigo ?? raw.id ?? fallback);
  }
  return String(raw);
}

function dateValue(obj,paths) {
  const raw=firstValue(obj,paths);
  if (!raw) return null;
  const d=new Date(raw);
  return Number.isNaN(d.getTime())?null:d;
}

function yearValue(obj,datePaths,yearPaths=[]) {
  const explicit=Number(firstValue(obj,yearPaths));
  if (Number.isFinite(explicit) && explicit>1900) return explicit;
  const d=dateValue(obj,datePaths);
  return d?d.getFullYear():null;
}

function periodIncludes(obj,{periodo,exercicio,datePaths,yearPaths=[]}) {
  if (periodo==="todos") return true;
  const selectedYear=Number(exercicio);
  const d=dateValue(obj,datePaths);
  const y=yearValue(obj,datePaths,yearPaths);

  if (periodo==="ano") {
    return y===selectedYear || (y===null && !d);
  }

  if (periodo==="mes") {
    if (d) return d.getFullYear()===selectedYear && d.getMonth()===new Date().getMonth();
    return y===selectedYear || y===null;
  }

  if (periodo==="12m") {
    if (!d) return y===selectedYear || y===null;
    const end=new Date();
    const start=new Date(end.getFullYear(),end.getMonth()-11,1);
    return d>=start && d<=end;
  }

  return true;
}

function sumRows(rows,paths) {
  return rows.reduce((total,row)=>total+numericValue(row,paths),0);
}

function hasAnyValue(rows,paths) {
  return rows.some(row=>paths.some(path=>{
    const value=valueAt(row,path);
    return value!==undefined && value!==null && value!=="";
  }));
}

function sumRowsOrNull(rows,paths) {
  if (!hasAnyValue(rows,paths)) return null;
  return sumRows(rows,paths);
}

function monthSeries(rows,{datePaths,valuePaths,periodo,exercicio}) {
  const buckets=new Map();
  const selectedYear=Number(exercicio);
  let months=[];

  if (periodo==="12m") {
    const now=new Date();
    for (let i=11;i>=0;i--) months.push(new Date(now.getFullYear(),now.getMonth()-i,1));
  } else {
    for (let m=0;m<12;m++) months.push(new Date(selectedYear,m,1));
  }

  for (const m of months) buckets.set(m.getFullYear()+"-"+String(m.getMonth()+1).padStart(2,"0"),0);

  for (const row of rows) {
    const d=dateValue(row,datePaths);
    if (!d) continue;
    if (!periodIncludes(row,{periodo,exercicio,datePaths})) continue;
    const key=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");
    if (!buckets.has(key)) continue;
    buckets.set(key,buckets.get(key)+numericValue(row,valuePaths));
  }

  return {
    labels:months.map(d=>d.toLocaleDateString("pt-BR",{month:"short",year:periodo==="12m"?"2-digit":undefined}).replace(".","")),
    values:[...buckets.values()]
  };
}

function topGroups(rows,{labelPaths,valuePaths,limit=10,countOnly=false,filter=null}) {
  const grouped=new Map();
  for (const row of rows) {
    if (filter && !filter(row)) continue;
    const label=stringValue(row,labelPaths);
    const current=grouped.get(label)||0;
    grouped.set(label,current+(countOnly?1:numericValue(row,valuePaths)));
  }
  return [...grouped.entries()]
    .sort((a,b)=>b[1]-a[1])
    .slice(0,limit);
}

function debtYearSeries(rows) {
  const grouped=new Map();
  for (const row of rows) {
    const year=yearValue(row,["dataInscricao","dtInscricao","dataDivida"],["anoDivida","ano"]);
    if (!year) continue;
    const saldo=numericValue(row,["vlSaldo","valorSaldo","saldo","saldoCalculado"]);
    grouped.set(year,(grouped.get(year)||0)+saldo);
  }
  return [...grouped.entries()].sort((a,b)=>a[0]-b[0]);
}

async function buildOverviewDashboard(env,tenant,url) {
  const periodo=url.searchParams.get("periodo") || "ano";
  const exercicio=Number(url.searchParams.get("exercicio") || new Date().getFullYear());

  const [
    pagamentos,
    debitos,
    dividas,
    parcelamentos,
    contribuintes,
    imoveis,
    economicos,
    pagamentosDetalhados
  ]=await Promise.all([
    safeBethaRows(env,tenant,"bi","pagamentos"),
    safeBethaRows(env,tenant,"bi","debitos"),
    safeBethaRows(env,tenant,"bi","dividas"),
    safeBethaRows(env,tenant,"bi","parcelamentos"),
    safeBethaRows(env,tenant,"bi","contribuintes"),
    safeBethaRows(env,tenant,"bi","imoveis"),
    safeBethaRows(env,tenant,"bi","economicos"),
    safeBethaRows(env,tenant,"bi","pagamentos-detalhados")
  ]);

  const paymentDatePaths=["dataPagamento","dtPagamento","dhPagamento","pagamento.dataPagamento"];
  const debitDatePaths=["dhDebito","dataDebito","dtDebito","dataLancamento","dtLancamento"];

  const filteredPayments=pagamentos.rows.filter(row=>periodIncludes(row,{
    periodo,exercicio,datePaths:paymentDatePaths,yearPaths:["ano","exercicio"]
  }));

  const filteredDebits=debitos.rows.filter(row=>periodIncludes(row,{
    periodo,exercicio,datePaths:debitDatePaths,yearPaths:["ano","anoDebito","exercicio"]
  }));

  const filteredParcels=parcelamentos.rows.filter(row=>periodIncludes(row,{
    periodo,exercicio,datePaths:["dtParcelamento","dataParcelamento","dhParcelamento"],yearPaths:["ano","exercicio"]
  }));

  const paymentMonthly=monthSeries(pagamentos.rows,{
    datePaths:paymentDatePaths,
    valuePaths:["valorPago","vlPago","valorTotalPago"],
    periodo,
    exercicio
  });

  const debitMonthly=monthSeries(debitos.rows,{
    datePaths:debitDatePaths,
    valuePaths:["vlLancado","valorLancado","valorDebito"],
    periodo,
    exercicio
  });

  const debitPaidMonthly=monthSeries(debitos.rows,{
    datePaths:debitDatePaths,
    valuePaths:["vlPago","valorPago"],
    periodo,
    exercicio
  });

  const debitSaldoMonthly=monthSeries(debitos.rows,{
    datePaths:debitDatePaths,
    valuePaths:["vlSaldo","valorSaldo","saldo"],
    periodo,
    exercicio
  });

  const creditRows=pagamentosDetalhados.rows.filter(row=>periodIncludes(row,{
    periodo,exercicio,
    datePaths:["pagamento.dataPagamento","dataPagamento","dtPagamento"],
    yearPaths:["ano","exercicio"]
  }));

  const creditGroups=topGroups(creditRows,{
    labelPaths:["creditoTributario.descricao","creditoTributario.nome","descricaoCreditoTributario","idCreditoTributario"],
    valuePaths:["valorPagoLancado","vlPagoLancado","valorPago","vlPago"],
    limit:10
  });

  const debtStatus=topGroups(dividas.rows,{
    labelPaths:["statusDivida","situacaoDivida","situacao","status"],
    countOnly:true,
    limit:12
  });

  const debtYears=debtYearSeries(dividas.rows);
  const debtSaldo=sumRows(dividas.rows,["vlSaldo","valorSaldo","saldo","saldoCalculado"]);

  const warnings=[
    ["pagamentos",pagamentos],
    ["debitos",debitos],
    ["dividas",dividas],
    ["parcelamentos",parcelamentos],
    ["contribuintes",contribuintes],
    ["imoveis",imoveis],
    ["economicos",economicos],
    ["pagamentos-detalhados",pagamentosDetalhados]
  ].filter(([,src])=>src.error || src.truncated)
   .map(([name,src])=>({source:name,error:src.error,truncated:src.truncated}));

  return {
    view:"visao-geral",
    tenant:{id:tenant.id,name:tenant.name},
    period:{periodo,exercicio},
    kpis:{
      arrecadado:sumRowsOrNull(filteredPayments,["valorPago","vlPago","valorTotalPago","vlTotalPago","valorArrecadado"]),
      lancado:sumRowsOrNull(filteredDebits,["vlLancado","valorLancado","valorDebito","vlDebito","valorOriginal"]),
      divida:hasAnyValue(dividas.rows,["vlSaldo","valorSaldo","saldo","saldoCalculado"])
        ? debtSaldo
        : null,
      parcelado:periodo==="todos" ? parcelamentos.total : filteredParcels.length,
      contribuintes:contribuintes.total,
      imoveis:imoveis.total
    },
    charts:{
      "receita-mensal":{
        format:"currency",
        labels:paymentMonthly.labels,
        datasets:[{label:"Arrecadado",data:paymentMonthly.values}]
      },
      "lancado-pago-saldo":{
        format:"currency",
        labels:debitMonthly.labels,
        datasets:[
          {label:"Lançado",data:debitMonthly.values},
          {label:"Pago",data:debitPaidMonthly.values.some(v=>v!==0)?debitPaidMonthly.values:paymentMonthly.values},
          ...(debitSaldoMonthly.values.some(v=>v!==0)?[{label:"Saldo",data:debitSaldoMonthly.values}]:[])
        ]
      },
      "divida-evolucao":{
        format:"currency",
        labels:debtYears.map(([year])=>String(year)),
        datasets:[{label:"Saldo da dívida",data:debtYears.map(([,value])=>value)}]
      },
      "receita-credito":{
        format:"currency",
        labels:creditGroups.map(([label])=>label),
        datasets:[{label:"Arrecadado",data:creditGroups.map(([,value])=>value)}]
      },
      "situacao-divida":{
        format:"number",
        labels:debtStatus.map(([label])=>label),
        datasets:[{label:"Dívidas",data:debtStatus.map(([,value])=>value)}]
      },
      cadastros:{
        format:"number",
        labels:["Contribuintes","Imóveis","Econômicos"],
        datasets:[{
          label:"Cadastros",
          data:[contribuintes.total,imoveis.total,economicos.total]
        }]
      }
    },
    meta:{
      generatedAt:new Date().toISOString(),
      publicAggregateMode:true,
      warnings,
      sourceRows:{
        pagamentos:pagamentos.rows.length,
        debitos:debitos.rows.length,
        dividas:dividas.rows.length,
        parcelamentos:parcelamentos.rows.length,
        contribuintes:contribuintes.rows.length,
        imoveis:imoveis.rows.length,
        economicos:economicos.rows.length,
        pagamentosDetalhados:pagamentosDetalhados.rows.length
      },
      sourceTotals:{
        pagamentos:pagamentos.total,
        debitos:debitos.total,
        dividas:dividas.total,
        parcelamentos:parcelamentos.total,
        contribuintes:contribuintes.total,
        imoveis:imoveis.total,
        economicos:economicos.total,
        pagamentosDetalhados:pagamentosDetalhados.total
      },
      auditMode:"FULL",
      sourceAudit:Object.fromEntries([
        ["pagamentos",pagamentos],
        ["debitos",debitos],
        ["dividas",dividas],
        ["parcelamentos",parcelamentos],
        ["contribuintes",contribuintes],
        ["imoveis",imoveis],
        ["economicos",economicos],
        ["pagamentosDetalhados",pagamentosDetalhados]
      ].map(([name,src])=>[name,{
        reportedTotal:src.reportedTotal,
        loaded:src.loaded,
        pages:src.pages,
        complete:Boolean(src.complete),
        truncated:Boolean(src.truncated),
        repeatedPage:Boolean(src.repeatedPage),
        totalMismatch:Boolean(src.totalMismatch),
        pageMeta:Array.isArray(src.pageMeta)?src.pageMeta:[],
        pageLimit:src.pageLimit,
        error:src.error,
        errorStatus:src.errorStatus,
        errorDetail:src.errorDetail
      }]))
    }
  };
}


function truthyValue(row,paths) {
  const raw=firstValue(row,paths);
  if (raw===undefined || raw===null || raw==="") return false;
  if (typeof raw==="boolean") return raw;
  const v=String(raw).trim().toLowerCase();
  return ["true","1","sim","s","yes","y","ativo","a","principal"].includes(v);
}

function countWhere(rows,predicate) {
  let count=0;
  for (const row of rows) if (predicate(row)) count++;
  return count;
}

function countPresent(rows,paths) {
  return countWhere(rows,row=>firstValue(row,paths)!==undefined);
}

function groupCount(rows,labelPaths,limit=12,filter=null) {
  return topGroups(rows,{labelPaths,countOnly:true,limit,filter});
}

function groupSum(rows,labelPaths,valuePaths,limit=12,filter=null) {
  return topGroups(rows,{labelPaths,valuePaths,limit,filter});
}

function chartGroups(groups,label="Quantidade",format="number") {
  return {
    format,
    labels:groups.map(([k])=>String(k)),
    datasets:[{label,data:groups.map(([,v])=>v)}]
  };
}

function chartFixed(labels,values,label="Quantidade",format="number") {
  return {format,labels,datasets:[{label,data:values}]};
}

function monthlyCount(rows,datePaths,periodo,exercicio,filter=null) {
  const selected=filter?rows.filter(filter):rows;
  const base=monthSeries(selected,{datePaths,valuePaths:["__count__"],periodo,exercicio});
  const buckets=new Map(base.labels.map((label,i)=>[label,i]));
  const values=new Array(base.labels.length).fill(0);
  let months=[];
  if (periodo==="12m") {
    const now=new Date();
    for(let i=11;i>=0;i--) months.push(new Date(now.getFullYear(),now.getMonth()-i,1));
  } else {
    for(let m=0;m<12;m++) months.push(new Date(Number(exercicio),m,1));
  }
  for(const row of selected){
    const d=dateValue(row,datePaths);
    if(!d) continue;
    if(!periodIncludes(row,{periodo,exercicio,datePaths})) continue;
    const idx=months.findIndex(m=>m.getFullYear()===d.getFullYear()&&m.getMonth()===d.getMonth());
    if(idx>=0) values[idx]++;
  }
  return {labels:base.labels,values};
}

function monthlyMulti(rows,datePaths,measures,periodo,exercicio,filter=null) {
  const selected=filter?rows.filter(filter):rows;
  const first=monthSeries(selected,{datePaths,valuePaths:measures[0].paths,periodo,exercicio});
  return {
    labels:first.labels,
    datasets:measures.map(m=>({
      label:m.label,
      data:monthSeries(selected,{datePaths,valuePaths:m.paths,periodo,exercicio}).values
    }))
  };
}

function dailySeries(rows,datePaths,valuePaths,exercicio) {
  const grouped=new Map();
  for(const row of rows){
    const d=dateValue(row,datePaths);
    if(!d || d.getFullYear()!==Number(exercicio)) continue;
    const key=d.toISOString().slice(0,10);
    grouped.set(key,(grouped.get(key)||0)+numericValue(row,valuePaths));
  }
  const entries=[...grouped.entries()].sort((a,b)=>a[0].localeCompare(b[0])).slice(-60);
  return {
    labels:entries.map(([k])=>new Date(k+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})),
    values:entries.map(([,v])=>v)
  };
}

function numberBucket(value,bounds) {
  const n=Number(value);
  if(!Number.isFinite(n)) return "Não informado";
  for(const [max,label] of bounds) if(n<=max) return label;
  return bounds.length?("Acima de "+bounds[bounds.length-1][0]):String(n);
}

function dashboardWarnings(entries) {
  return entries
    .filter(([,src])=>src && (src.error||src.truncated||src.totalMismatch))
    .map(([source,src])=>({
      source,
      error:src.error,
      truncated:Boolean(src.truncated),
      totalMismatch:Boolean(src.totalMismatch),
      errorStatus:src.errorStatus||null,
      errorDetail:src.errorDetail||null
    }));
}

function dashboardMeta(entries,extra={}) {
  return {
    generatedAt:new Date().toISOString(),
    publicAggregateMode:true,
    auditMode:"FULL",
    warnings:dashboardWarnings(entries),
    sourceRows:Object.fromEntries(entries.map(([name,src])=>[name,src?src.rows.length:0])),
    sourceTotals:Object.fromEntries(entries.map(([name,src])=>[name,src?src.total:0])),
    sourceAudit:Object.fromEntries(entries.map(([name,src])=>[name,{
      reportedTotal:src?src.reportedTotal:null,
      loaded:src?src.loaded:0,
      pages:src?src.pages:0,
      complete:Boolean(src&&src.complete),
      truncated:Boolean(src&&src.truncated),
      repeatedPage:Boolean(src&&src.repeatedPage),
      totalMismatch:Boolean(src&&src.totalMismatch),
      pageMeta:src&&Array.isArray(src.pageMeta)?src.pageMeta:[],
      pageLimit:src?src.pageLimit:null,
      error:src?src.error:null,
      errorStatus:src?src.errorStatus:null,
      errorDetail:src?src.errorDetail:null
    }])),
    ...extra
  };
}

async function buildRevenueDashboard(env,tenant,url) {
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const [pag,det,val]=await Promise.all([
    safeBethaRows(env,tenant,"bi","pagamentos"),
    safeBethaRows(env,tenant,"bi","pagamentos-detalhados"),
    safeBethaRows(env,tenant,"bi","pagamentos-detalhados-valores")
  ]);
  const dates=["dataPagamento","dtPagamento","dhPagamento","pagamento.dataPagamento"];
  const rows=pag.rows.filter(r=>periodIncludes(r,{periodo,exercicio,datePaths:dates,yearPaths:["ano","exercicio"]}));
  const detRows=det.rows.filter(r=>periodIncludes(r,{periodo,exercicio,datePaths:["pagamento.dataPagamento","dataPagamento","dtPagamento"],yearPaths:["ano","exercicio"]}));
  const aliases={
    total:["valorPago","vlPago","valorTotalPago","vlTotalPago","valorArrecadado"],
    tributo:["valorPagoLancado","vlPagoLancado","valorTributo","vlTributo"],
    juros:["valorPagoJuro","vlPagoJuro","valorJuros","vlJuros"],
    multa:["valorPagoMulta","vlPagoMulta","valorMulta","vlMulta"],
    correcao:["valorPagoCorrecao","vlPagoCorrecao","valorCorrecao","vlCorrecao"],
    desconto:["valorConcedidoDescontos","vlDesconto","valorDesconto","desconto"]
  };
  const day=dailySeries(rows,dates,aliases.total,exercicio);
  const mon=monthSeries(rows,{datePaths:dates,valuePaths:aliases.total,periodo,exercicio});
  const credit=groupSum(detRows,["creditoTributario.descricao","descricaoCreditoTributario","creditoTributario.nome","idCreditoTributario"],["valorPagoLancado","vlPagoLancado","valorPago","vlPago"],12);
  const receita=groupSum(detRows,["receita.descricao","descricaoReceita","receita.nome","idReceita"],["valorPagoLancado","vlPagoLancado","valorPago","vlPago"],12);
  const tipo=groupSum(rows,["tipoPagamento","tipoPagamento.descricao","formaPagamento"],aliases.total,12);
  const baixa=groupSum(rows,["tipoBaixa","tipoBaixa.descricao","formaBaixa"],aliases.total,12);
  const retro=monthSeries(rows.filter(r=>truthyValue(r,["pagamentoRetroativo","retroativo"])),{datePaths:dates,valuePaths:aliases.total,periodo,exercicio});
  const est=monthlyCount(rows,["dataHoraEstorno","dtEstorno"],periodo,exercicio,r=>Boolean(firstValue(r,["dataHoraEstorno","dtEstorno"])));
  const acres=monthlyMulti(rows,dates,[
    {label:"Correção",paths:aliases.correcao},
    {label:"Juros",paths:aliases.juros},
    {label:"Multa",paths:aliases.multa}
  ],periodo,exercicio);
  const guias=groupSum(rows,["classificacaoGuia","classificacaoGuia.descricao","tipoGuia"],aliases.total,12);
  return {
    view:"arrecadacao",tenant:{id:tenant.id,name:tenant.name},period:{periodo,exercicio},
    kpis:{
      "total-pago":sumRowsOrNull(rows,aliases.total),
      "tributo-pago":sumRowsOrNull(rows,aliases.tributo),
      "juros-pagos":sumRowsOrNull(rows,aliases.juros),
      "multa-paga":sumRowsOrNull(rows,aliases.multa),
      "correcao-paga":sumRowsOrNull(rows,aliases.correcao),
      descontos:sumRowsOrNull(rows,aliases.desconto)
    },
    charts:{
      "arrecadacao-dia":{format:"currency",labels:day.labels,datasets:[{label:"Arrecadado",data:day.values}]},
      "arrecadacao-mes":{format:"currency",labels:mon.labels,datasets:[{label:"Arrecadado",data:mon.values}]},
      "arrecadacao-credito":chartGroups(credit,"Arrecadado","currency"),
      "arrecadacao-receita":chartGroups(receita,"Arrecadado","currency"),
      "composicao-pagamento":chartFixed(["Tributo","Correção","Juros","Multa"],[
        sumRows(rows,aliases.tributo),sumRows(rows,aliases.correcao),sumRows(rows,aliases.juros),sumRows(rows,aliases.multa)
      ],"Valor","currency"),
      "tipo-pagamento":chartGroups(tipo,"Arrecadado","currency"),
      "tipo-baixa":chartGroups(baixa,"Arrecadado","currency"),
      retroativos:{format:"currency",labels:retro.labels,datasets:[{label:"Retroativos",data:retro.values}]},
      estornos:{format:"number",labels:est.labels,datasets:[{label:"Estornos",data:est.values}]},
      "descontos-anistias":chartFixed(["Descontos","Anistias","Remissões"],[
        sumRows(val.rows,["valorDesconto","vlDesconto","desconto"]),
        sumRows(val.rows,["valorAnistia","vlAnistia","anistia"]),
        sumRows(val.rows,["valorRemissao","vlRemissao","remissao"])
      ],"Valor","currency"),
      acrescimos:{format:"currency",labels:acres.labels,datasets:acres.datasets},
      guias:chartGroups(guias,"Arrecadado","currency")
    },
    meta:dashboardMeta([["pagamentos",pag],["pagamentosDetalhados",det],["pagamentosDetalhadosValores",val]])
  };
}

async function buildDebtsDashboard(env,tenant,url) {
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const [deb,rec]=await Promise.all([
    safeBethaRows(env,tenant,"bi","debitos"),
    safeBethaRows(env,tenant,"bi","debitos-receitas")
  ]);
  const dates=["dhDebito","dataDebito","dtDebito","dataLancamento","dtLancamento"];
  const rows=deb.rows.filter(r=>periodIncludes(r,{periodo,exercicio,datePaths:dates,yearPaths:["ano","anoDebito","exercicio"]}));
  const amount=["vlLancado","valorLancado","valorDebito","vlDebito","valorOriginal"];
  const month=monthSeries(rows,{datePaths:dates,valuePaths:amount,periodo,exercicio});
  const sit=groupSum(rows,["situacao","situacao.descricao","status"],amount,12);
  const credito=groupSum(rows,["idCredito","creditoTributario.descricao","idCreditoTributario"],amount,12);
  const now=Date.now();
  const aging=new Map();
  for(const row of rows){
    const d=dateValue(row,["dtVcto","dataVencimento","vencimento"]);
    let label="Sem vencimento";
    if(d){
      const days=Math.floor((now-d.getTime())/86400000);
      label=days<=0?"A vencer":days<=30?"1–30 dias":days<=90?"31–90 dias":days<=180?"91–180 dias":days<=365?"181–365 dias":"Acima de 1 ano";
    }
    aging.set(label,(aging.get(label)||0)+numericValue(row,amount));
  }
  const years=groupSum(rows,["ano","anoDebito","exercicio"],amount,20);
  const unica=groupSum(rows,["unica","parcelaUnica","tipoParcela"],amount,10);
  const origem=groupSum(rows,["referente.tipo","tipoReferente","referente","origem"],amount,12);
  const receitaGroups=new Map();
  for(const row of rec.rows){
    const label=stringValue(row,["idReceitasCreditos","receita.descricao","idReceita"]);
    const item=receitaGroups.get(label)||{devido:0,pago:0};
    item.devido+=numericValue(row,["vlDevido","valorDevido"]);
    item.pago+=numericValue(row,["vlPago","valorPago"]);
    receitaGroups.set(label,item);
  }
  const topRec=[...receitaGroups.entries()].sort((a,b)=>b[1].devido-a[1].devido).slice(0,12);
  return {
    view:"debitos",tenant:{id:tenant.id,name:tenant.name},period:{periodo,exercicio},
    kpis:{
      "vl-lancado":sumRowsOrNull(rows,amount),
      "qtd-debitos":rows.length,
      vencidos:countWhere(rows,r=>{const d=dateValue(r,["dtVcto","dataVencimento","vencimento"]);return d&&d.getTime()<now&&!firstValue(r,["dtPgto","dataPagamento"]);}),
      pagos:countWhere(rows,r=>Boolean(firstValue(r,["dtPgto","dataPagamento","dataQuitacao"]))),
      "descontos-debito":sumRowsOrNull(rows,["vlDesconto","valorDesconto","desconto"])
    },
    charts:{
      "lancamentos-mensais":{format:"currency",labels:month.labels,datasets:[{label:"Lançado",data:month.values}]},
      "debitos-situacao":chartGroups(sit,"Lançado","currency"),
      "debitos-credito":chartGroups(credito,"Lançado","currency"),
      "aging-debitos":chartGroups([...aging.entries()],"Saldo","currency"),
      "debitos-ano":chartGroups(years,"Lançado","currency"),
      "unica-parcelada":chartGroups(unica,"Lançado","currency"),
      "origem-cadastro":chartGroups(origem,"Lançado","currency"),
      "devido-pago-receita":{
        format:"currency",
        labels:topRec.map(([k])=>k),
        datasets:[
          {label:"Devido",data:topRec.map(([,v])=>v.devido)},
          {label:"Pago",data:topRec.map(([,v])=>v.pago)}
        ]
      }
    },
    meta:dashboardMeta([["debitos",deb],["debitosReceitas",rec]])
  };
}

async function buildActiveDebtDashboard(env,tenant,url) {
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const [div,enc,rec,pagdet,baseDiv]=await Promise.all([
    safeBethaRows(env,tenant,"bi","dividas"),
    safeBethaRows(env,tenant,"base","encerramento-dividas"),
    safeBethaRows(env,tenant,"bi","dividas-receitas"),
    safeBethaRows(env,tenant,"bi","pagamentos-detalhados"),
    safeBethaRows(env,tenant,"base","dividas")
  ]);
  const saldoPaths=["valorSaldo","vlSaldo","saldo","saldoCalculado"];
  const inscritoPaths=["valorInscrito","vlInscrito","valorOriginal","vlOriginal"];
  const status=groupCount(div.rows,["statusDivida","situacaoDivida","situacao","status"],12);
  const years=groupSum(enc.rows.length?enc.rows:div.rows,["anoDivida","ano","exercicio"],saldoPaths,20);
  const credito=groupSum(enc.rows.length?enc.rows:div.rows,["idCreditoTributario","creditoTributario.descricao","idCredito"],saldoPaths,12);
  const cobranca=chartFixed(["Execução","Protesto","Penhora"],[
    countWhere(div.rows,r=>truthyValue(r,["sitExecucao","emExecucao","executada"])),
    countWhere(div.rows,r=>truthyValue(r,["protesto","protestada"])),
    countWhere(div.rows,r=>truthyValue(r,["penhora","penhorada"]))
  ],"Dívidas","number");
  const recup=monthSeries(pagdet.rows.filter(r=>firstValue(r,["idDivida","divida.id"])),{
    datePaths:["pagamento.dataPagamento","dataPagamento","dtPagamento"],
    valuePaths:["valorPagoLancado","vlPagoLancado","valorPago","vlPago"],periodo,exercicio
  });
  const recGroups=new Map();
  for(const row of rec.rows){
    const label=stringValue(row,["idCreditosTributariosRec","receita.descricao","idReceita"]);
    const x=recGroups.get(label)||{inscrito:0,saldo:0};
    x.inscrito+=numericValue(row,["vlInscritoCredito","valorInscrito","vlInscrito"]);
    x.saldo+=numericValue(row,["vlSaldo","valorSaldo","saldo"]);
    recGroups.set(label,x);
  }
  const top=[...recGroups.entries()].sort((a,b)=>b[1].saldo-a[1].saldo).slice(0,12);
  const cancel=monthlyCount(baseDiv.rows,["dataCancelamento","dataPrescricao","dtCancelamento","dtPrescricao"],periodo,exercicio);
  const warnings=dashboardMeta([["dividas",div],["encerramentoDividas",enc],["dividasReceitas",rec],["pagamentosDetalhados",pagdet],["baseDividas",baseDiv]],{
    privacy:["top-devedores ocultado enquanto login oficial estiver desativado"]
  });
  return {
    view:"divida",tenant:{id:tenant.id,name:tenant.name},period:{periodo,exercicio},
    kpis:{
      "saldo-divida":sumRowsOrNull(enc.rows.length?enc.rows:div.rows,saldoPaths),
      inscrito:sumRowsOrNull(enc.rows.length?enc.rows:div.rows,inscritoPaths),
      "qtd-dividas":div.total,
      executadas:countWhere(div.rows,r=>truthyValue(r,["sitExecucao","emExecucao","executada"])),
      protestadas:countWhere(div.rows,r=>truthyValue(r,["protesto","protestada"])),
      cda:countWhere(div.rows,r=>truthyValue(r,["possuiCdaEmitida","cdaEmitida","possuiCda"]))
    },
    charts:{
      "estoque-divida":chartGroups(years,"Saldo","currency"),
      "inscricoes-mes":chartGroups(years,"Inscrito/Saldo","currency"),
      "composicao-divida":chartFixed(["Saldo","Correção","Juros","Multa"],[
        sumRows(enc.rows,saldoPaths),sumRows(enc.rows,["valorCorrecao","vlCorrecao"]),sumRows(enc.rows,["valorJuros","vlJuros"]),sumRows(enc.rows,["valorMulta","vlMulta"])
      ],"Valor","currency"),
      "status-divida":chartGroups(status,"Dívidas","number"),
      "aging-divida":chartGroups(years,"Saldo","currency"),
      "divida-credito":chartGroups(credito,"Saldo","currency"),
      cobranca,
      recuperacao:{format:"currency",labels:recup.labels,datasets:[{label:"Recuperado",data:recup.values}]},
      "saldo-receitas-divida":{format:"currency",labels:top.map(([k])=>k),datasets:[
        {label:"Inscrito",data:top.map(([,v])=>v.inscrito)},
        {label:"Saldo",data:top.map(([,v])=>v.saldo)}
      ]},
      cancelamentos:{format:"number",labels:cancel.labels,datasets:[{label:"Cancelamentos/prescrições",data:cancel.values}]},
      "top-devedores":{format:"currency",labels:[],datasets:[]}
    },
    meta:warnings
  };
}

async function buildInstallmentsDashboard(env,tenant,url) {
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const [par,parcelas,refs,baseParcelas]=await Promise.all([
    safeBethaRows(env,tenant,"bi","parcelamentos"),
    safeBethaRows(env,tenant,"bi","parcelamentos-parcelas"),
    safeBethaRows(env,tenant,"bi","parcelamentos-referentes"),
    safeBethaRows(env,tenant,"base","parcelamentos-parcelas")
  ]);
  const dates=["dtParcelamento","dataParcelamento","dhParcelamento"];
  const rows=par.rows.filter(r=>periodIncludes(r,{periodo,exercicio,datePaths:dates,yearPaths:["ano","exercicio"]}));
  const mon=monthlyCount(rows,dates,periodo,exercicio);
  const situ=groupCount(rows,["situacao","situacao.descricao","status"],10);
  const qtdBuckets=new Map(), vencBuckets=new Map();
  for(const r of rows){
    const q=Number(firstValue(r,["qtdParcela","qtdParcelas","quantidadeParcelas"]));
    const v=Number(firstValue(r,["qtdParcelasVencidas","parcelasVencidas"]));
    const qb=numberBucket(q,[[1,"1"],[6,"2–6"],[12,"7–12"],[24,"13–24"],[48,"25–48"]]);
    const vb=numberBucket(v,[[0,"Nenhuma"],[1,"1"],[3,"2–3"],[6,"4–6"],[12,"7–12"]]);
    qtdBuckets.set(qb,(qtdBuckets.get(qb)||0)+1);
    vencBuckets.set(vb,(vencBuckets.get(vb)||0)+1);
  }
  const parcelSit=groupSum(parcelas.rows,["situacao","situacao.descricao","status"],["vlParcela","valorParcela","valor"],10);
  const entrada=groupSum(rows,["tipoEntrada","tipoEntrada.descricao"],["vlEntrada","valorEntrada"],10);
  const cobr=chartFixed(["Executada","Protestada"],[
    countWhere(rows,r=>truthyValue(r,["dividaExecutada","executada","sitExecucao"])),
    countWhere(rows,r=>truthyValue(r,["dividaProtestada","protestada","protesto"]))
  ],"Parcelamentos","number");
  const origem=groupCount(refs.rows,["tipoReferente","referente.tipo","origem"],12);
  const canc=monthlyCount(rows,["dtCancelamento","dataCancelamento"],periodo,exercicio,r=>Boolean(firstValue(r,["dtCancelamento","dataCancelamento"])));
  const pay=monthlyMulti(baseParcelas.rows,["dtQuitacao","dataQuitacao"],[
    {label:"Tributo",paths:["vlPagoTributo","valorPagoTributo"]},
    {label:"Correção",paths:["vlPagoCorrecao","valorPagoCorrecao"]},
    {label:"Juros",paths:["vlPagoJuro","valorPagoJuro"]},
    {label:"Multa",paths:["vlPagoMulta","valorPagoMulta"]}
  ],periodo,exercicio);
  return {
    view:"parcelamentos",tenant:{id:tenant.id,name:tenant.name},period:{periodo,exercicio},
    kpis:{
      "qtd-parcelamentos":rows.length,
      ativos:countWhere(rows,r=>/ativ|abert|vigent/i.test(stringValue(r,["situacao","situacao.descricao","status"],""))),
      "parcelas-vencidas":rows.reduce((s,r)=>s+numericValue(r,["qtdParcelasVencidas","parcelasVencidas"]),0),
      entradas:sumRowsOrNull(rows,["vlEntrada","valorEntrada"]),
      "qtd-parcelas":rows.reduce((s,r)=>s+numericValue(r,["qtdParcela","qtdParcelas","quantidadeParcelas"]),0),
      cancelados:countWhere(rows,r=>Boolean(firstValue(r,["dtCancelamento","dataCancelamento"])))
    },
    charts:{
      "parcelamentos-mes":{format:"number",labels:mon.labels,datasets:[{label:"Parcelamentos",data:mon.values}]},
      "situacao-parcelamentos":chartGroups(situ,"Parcelamentos","number"),
      "faixa-parcelas":chartGroups([...qtdBuckets.entries()],"Parcelamentos","number"),
      "vencidas-parcelamento":chartGroups([...vencBuckets.entries()],"Parcelamentos","number"),
      "parcelas-situacao":chartGroups(parcelSit,"Valor","currency"),
      "entradas-tipo":chartGroups(entrada,"Entrada","currency"),
      "execucao-protesto":cobr,
      "origem-parcelamento":chartGroups(origem,"Parcelamentos","number"),
      "cancelamentos-parcelamento":{format:"number",labels:canc.labels,datasets:[{label:"Cancelamentos",data:canc.values}]},
      "pagamentos-parcelas":{format:"currency",labels:pay.labels,datasets:pay.datasets}
    },
    meta:dashboardMeta([["parcelamentos",par],["parcelas",parcelas],["referentes",refs],["baseParcelas",baseParcelas]])
  };
}


function completenessChart(rows,fields) {
  const labels=[],values=[];
  for(const field of fields){
    labels.push(field.label);
    const filled=countWhere(rows,row=>firstValue(row,field.paths)!==undefined);
    values.push(rows.length?Math.round((filled/rows.length)*1000)/10:0);
  }
  return chartFixed(labels,values,"Preenchimento (%)","number");
}

async function buildEconomicsDashboard(env,tenant,url) {
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const [eco,ativ,pagdet]=await Promise.all([
    safeBethaRows(env,tenant,"bi","economicos"),
    safeBethaRows(env,tenant,"bi","economicos-atividades"),
    safeBethaRows(env,tenant,"bi","pagamentos-detalhados")
  ]);
  const openDates=["dtInicioAtiv","dataInicioAtividade","dataAbertura","dtAbertura"];
  const closeDates=["dtFechamento","dataFechamento","dataEncerramento","dtEncerramento"];
  const opened=monthlyCount(eco.rows,openDates,periodo,exercicio);
  const closed=monthlyCount(eco.rows,closeDates,periodo,exercicio,r=>Boolean(firstValue(r,closeDates)));
  const situ=groupCount(eco.rows,["situacao","situacao.descricao","status"],12);
  const tipos=groupCount(eco.rows,["tipoCadastro","tipoEconomico","tipo"],12);
  const atividade=groupCount(ativ.rows,["descricaoAtividade","atividade.descricao","atividade.nome","cnae.descricao"],15);
  const principal=groupCount(ativ.rows,["principal","atividadePrincipal"],5);
  const bairros=groupCount(eco.rows,["nomeBairro","bairro.nome","bairro"],15);
  const issRows=pagdet.rows.filter(r=>firstValue(r,["idEconomico","economico.id","referente.idEconomico"])!==undefined);
  const iss=monthSeries(issRows,{
    datePaths:["pagamento.dataPagamento","dataPagamento","dtPagamento"],
    valuePaths:["valorPagoLancado","vlPagoLancado","valorPago","vlPago"],periodo,exercicio
  });
  return {
    view:"economicos",tenant:{id:tenant.id,name:tenant.name},period:{periodo,exercicio},
    kpis:{
      economicos:eco.total,
      "ativos-economicos":countWhere(eco.rows,r=>!/inativ|baixad|encerr|cancel/i.test(stringValue(r,["situacao","situacao.descricao","status"],""))&&!truthyValue(r,["desativado"])),
      "novos-economicos":eco.rows.filter(r=>periodIncludes(r,{periodo,exercicio,datePaths:openDates,yearPaths:["anoInicio","exercicio"]})).length,
      fechados:eco.rows.filter(r=>Boolean(firstValue(r,closeDates))&&periodIncludes(r,{periodo,exercicio,datePaths:closeDates})).length,
      atividades:ativ.total
    },
    charts:{
      aberturas:{format:"number",labels:opened.labels,datasets:[{label:"Aberturas",data:opened.values}]},
      fechamentos:{format:"number",labels:closed.labels,datasets:[{label:"Encerramentos",data:closed.values}]},
      "situacao-economicos":chartGroups(situ,"Econômicos","number"),
      "tipo-economico":chartGroups(tipos,"Econômicos","number"),
      "atividades-top":chartGroups(atividade,"Vínculos","number"),
      "atividade-principal":chartGroups(principal,"Vínculos","number"),
      "bairro-economicos":chartGroups(bairros,"Econômicos","number"),
      "iss-arrecadacao":{format:"currency",labels:iss.labels,datasets:[{label:"Arrecadação",data:iss.values}]}
    },
    meta:dashboardMeta([["economicos",eco],["atividades",ativ],["pagamentosDetalhados",pagdet]])
  };
}

async function buildRealEstateDashboard(env,tenant,url) {
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const [imo,resp,trans,baseImo,planta,pagdet]=await Promise.all([
    safeBethaRows(env,tenant,"bi","imoveis"),
    safeBethaRows(env,tenant,"bi","imoveis-responsaveis"),
    safeBethaRows(env,tenant,"bi","transferencias-imoveis"),
    safeBethaRows(env,tenant,"base","imoveis"),
    safeBethaRows(env,tenant,"base","planta-valores"),
    safeBethaRows(env,tenant,"bi","pagamentos-detalhados")
  ]);
  const bairros=groupCount(imo.rows,["nomeBairro","bairro.nome","bairro"],15);
  const setores=groupCount(imo.rows,["setor","setor.codigo","nomeSetor"],15);
  const rural=groupCount(imo.rows,["rural","tipoZona","zona"],6);
  const ativo=groupCount(imo.rows,["desativado","situacao","status"],8);
  const condo=groupCount(imo.rows,["nomeCondominio","condominio.nome","condominio"],12);
  const lote=groupCount(imo.rows,["nomeLoteamento","loteamento.nome","loteamento"],12);
  const tipo=groupCount(baseImo.rows,["tipoImovel","tipoImovel.descricao","tipo"],12);
  const plantaGroups=groupSum(planta.rows,["bairro.nome","nomeBairro","logradouro.nome","nomeLogradouro"],["vlMetroQuadrado","valorMetroQuadrado","valor"],12);
  const iptuRows=pagdet.rows.filter(r=>firstValue(r,["idImovel","imovel.id","referente.idImovel"])!==undefined);
  const iptu=monthSeries(iptuRows,{
    datePaths:["pagamento.dataPagamento","dataPagamento","dtPagamento"],
    valuePaths:["valorPagoLancado","vlPagoLancado","valorPago","vlPago"],periodo,exercicio
  });
  const perc=new Map();
  for(const r of resp.rows){
    const p=numericValue(r,["percentual","percentualTitularidade","percResponsabilidade"]);
    const b=numberBucket(p,[[25,"Até 25%"],[50,"26–50%"],[75,"51–75%"],[99.99,"76–99%"],[100,"100%"]]);
    perc.set(b,(perc.get(b)||0)+1);
  }
  return {
    view:"imobiliario",tenant:{id:tenant.id,name:tenant.name},period:{periodo,exercicio},
    kpis:{
      "imoveis-total":imo.total,
      "imoveis-ativos":countWhere(imo.rows,r=>!truthyValue(r,["desativado"])&&!/inativ|desativ|cancel/i.test(stringValue(r,["situacao","status"],""))),
      rurais:countWhere(imo.rows,r=>truthyValue(r,["rural"])||/rural/i.test(stringValue(r,["tipoZona","zona"],""))),
      responsaveis:resp.total,
      transferencias:trans.total
    },
    charts:{
      "bairro-imoveis":chartGroups(bairros,"Imóveis","number"),
      "setor-imoveis":chartGroups(setores,"Imóveis","number"),
      "rural-urbano":chartGroups(rural,"Imóveis","number"),
      "ativos-inativos-imoveis":chartGroups(ativo,"Imóveis","number"),
      condominios:chartGroups(condo,"Imóveis","number"),
      loteamentos:chartGroups(lote,"Imóveis","number"),
      "tipo-imovel":chartGroups(tipo,"Imóveis","number"),
      "planta-valores":chartGroups(plantaGroups,"Valor m²","currency"),
      "iptu-pagamentos":{format:"currency",labels:iptu.labels,datasets:[{label:"Arrecadação",data:iptu.values}]},
      responsabilidade:chartGroups([...perc.entries()],"Responsáveis","number")
    },
    meta:dashboardMeta([["imoveis",imo],["responsaveis",resp],["transferencias",trans],["baseImoveis",baseImo],["plantaValores",planta],["pagamentosDetalhados",pagdet]])
  };
}

async function buildItbiDashboard(env,tenant,url) {
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const [sol,itens,trans,compra]=await Promise.all([
    safeBethaRows(env,tenant,"bi","solicitacoes-transferencias-imoveis"),
    safeBethaRows(env,tenant,"bi","solicitacoes-transferencias-imoveis-itens"),
    safeBethaRows(env,tenant,"bi","transferencias-imoveis"),
    safeBethaRows(env,tenant,"bi","transferencias-imoveis-compra")
  ]);
  const solMon=monthlyCount(sol.rows,["dataHoraSolicitacao","dataSolicitacao","dhSolicitacao"],periodo,exercicio);
  const transMon=monthlyCount(trans.rows,["dataHoraTransferencia","dataTransferencia","dhTransferencia"],periodo,exercicio);
  const sitSol=groupCount(sol.rows,["situacao","situacao.descricao","status"],10);
  const sitTrans=groupCount(trans.rows,["situacao","situacao.descricao","status"],10);
  const cert=groupCount(trans.rows,["statusCertidaoITBI","statusCertidao","certidaoStatus"],10);
  const compGroups=new Map();
  for(const r of itens.rows){
    const label=stringValue(r,["competencia","ano","exercicio"],"Sem competência");
    const x=compGroups.get(label)||{declarado:0,ajustado:0,itbi:0,itbiAj:0,fin:0,vista:0};
    x.declarado+=numericValue(r,["valorDeclarado","vlDeclarado"]);
    x.ajustado+=numericValue(r,["valorDeclaradoAjustado","vlDeclaradoAjustado"]);
    x.itbi+=numericValue(r,["valorITBI","vlITBI","valorItbi"]);
    x.itbiAj+=numericValue(r,["valorITBIAjustado","vlITBIAjustado","valorItbiAjustado"]);
    x.fin+=numericValue(r,["valorFinanciado","vlFinanciado"]);
    x.vista+=numericValue(r,["valorAvista","vlAvista","valorAVista"]);
    compGroups.set(label,x);
  }
  const comps=[...compGroups.entries()].sort((a,b)=>String(a[0]).localeCompare(String(b[0]))).slice(-12);
  const cobr=groupCount(trans.rows,["tipoCobranca","tipoCobranca.descricao","cobranca"],10);
  const soldGroups=new Map();
  for(const r of compra.rows){
    const p=numericValue(r,["percVendido","percentualVendido","percentual"]);
    const b=numberBucket(p,[[25,"Até 25%"],[50,"26–50%"],[75,"51–75%"],[99.99,"76–99%"],[100,"100%"]]);
    soldGroups.set(b,(soldGroups.get(b)||0)+1);
  }
  return {
    view:"itbi",tenant:{id:tenant.id,name:tenant.name},period:{periodo,exercicio},
    kpis:{
      solicitacoes:sol.total,
      "transferencias-itbi":trans.total,
      itbi:sumRowsOrNull(itens.rows,["valorITBI","vlITBI","valorItbi"]),
      declarado:sumRowsOrNull(itens.rows,["valorDeclarado","vlDeclarado"]),
      financiado:sumRowsOrNull(itens.rows,["valorFinanciado","vlFinanciado"])
    },
    charts:{
      "solicitacoes-mes":{format:"number",labels:solMon.labels,datasets:[{label:"Solicitações",data:solMon.values}]},
      "transferencias-mes":{format:"number",labels:transMon.labels,datasets:[{label:"Transferências",data:transMon.values}]},
      "situacao-solicitacoes":chartGroups(sitSol,"Solicitações","number"),
      "situacao-transferencias":chartGroups(sitTrans,"Transferências","number"),
      "certidao-itbi":chartGroups(cert,"Transferências","number"),
      "declarado-ajustado":{format:"currency",labels:comps.map(([k])=>k),datasets:[
        {label:"Declarado",data:comps.map(([,v])=>v.declarado)},
        {label:"Ajustado",data:comps.map(([,v])=>v.ajustado)}
      ]},
      "itbi-ajustado":{format:"currency",labels:comps.map(([k])=>k),datasets:[
        {label:"ITBI",data:comps.map(([,v])=>v.itbi)},
        {label:"ITBI ajustado",data:comps.map(([,v])=>v.itbiAj)}
      ]},
      financiamento:{format:"currency",labels:comps.map(([k])=>k),datasets:[
        {label:"Financiado",data:comps.map(([,v])=>v.fin)},
        {label:"À vista",data:comps.map(([,v])=>v.vista)}
      ]},
      "tipo-cobranca":chartGroups(cobr,"Transferências","number"),
      compradores:chartGroups([...soldGroups.entries()],"Operações","number")
    },
    meta:dashboardMeta([["solicitacoes",sol],["itens",itens],["transferencias",trans],["compras",compra]],{
      privacy:["nomes de compradores ocultados enquanto login oficial estiver desativado"]
    })
  };
}

async function buildTaxpayersDashboard(env,tenant,url) {
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const con=await safeBethaRows(env,tenant,"bi","contribuintes");
  const rows=con.rows;
  const tipo=groupCount(rows,["tipoPessoa","tipoPessoa.descricao","pessoa.tipo"],5);
  const simples=groupCount(rows,["optanteSimples","simplesNacional","optanteSimplesNacional"],5);
  const porte=groupCount(rows,["porteEmpresa","porteEmpresa.descricao","porte"],10);
  const bairro=groupCount(rows,["nomeBairro","bairro.nome","bairro"],15);
  const cidade=groupCount(rows,["nomeCidade","cidade.nome","municipio.nome"],15);
  const ativo=groupCount(rows,["desativado","situacao","status"],8);
  const updates=monthlyCount(rows,["dhOperacao","dataHoraOperacao","dataAtualizacao","dhAtualizacao"],periodo,exercicio);
  const completion=completenessChart(rows,[
    {label:"CPF/CNPJ",paths:["cpf","cnpj","cpfCnpj","documento"]},
    {label:"E-mail",paths:["email","emailPrincipal"]},
    {label:"Telefone",paths:["telefone","fone","celular"]},
    {label:"CEP",paths:["cep","endereco.cep"]},
    {label:"Logradouro",paths:["nomeLogradouro","logradouro.nome","endereco.logradouro"]}
  ]);
  return {
    view:"contribuintes",tenant:{id:tenant.id,name:tenant.name},period:{periodo,exercicio},
    kpis:{
      "contribuintes-total":con.total,
      pf:countWhere(rows,r=>/fis|pf|física/i.test(stringValue(r,["tipoPessoa","tipoPessoa.descricao"],""))),
      pj:countWhere(rows,r=>/jur|pj|jurídica/i.test(stringValue(r,["tipoPessoa","tipoPessoa.descricao"],""))),
      simples:countWhere(rows,r=>truthyValue(r,["optanteSimples","simplesNacional","optanteSimplesNacional"])),
      inativos:countWhere(rows,r=>truthyValue(r,["desativado"])||/inativ|desativ/i.test(stringValue(r,["situacao","status"],"")))
    },
    charts:{
      "tipo-pessoa":chartGroups(tipo,"Contribuintes","number"),
      "optante-simples":chartGroups(simples,"Contribuintes","number"),
      "porte-empresa":chartGroups(porte,"Contribuintes","number"),
      "bairro-contribuintes":chartGroups(bairro,"Contribuintes","number"),
      "cidade-contribuintes":chartGroups(cidade,"Contribuintes","number"),
      "completude-contato":completion,
      "situacao-cadastro":chartGroups(ativo,"Contribuintes","number"),
      atualizacoes:{format:"number",labels:updates.labels,datasets:[{label:"Atualizações",data:updates.values}]}
    },
    meta:dashboardMeta([["contribuintes",con]])
  };
}


async function buildClosingDashboard(env,tenant,url) {
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const [lan,div]=await Promise.all([
    safeBethaRows(env,tenant,"base","encerramento-lancamentos"),
    safeBethaRows(env,tenant,"base","encerramento-dividas")
  ]);

  const labelFor=row=>String(firstValue(row,["mesEncerramento","competencia","mes","referencia"])||"Não informado");
  const aggregate=(rows)=>{
    const map=new Map();
    for(const r of rows){
      const k=labelFor(r);
      const x=map.get(k)||{saldo:0,lancado:0,inscrito:0,correcao:0,juros:0,multa:0,correcaoMes:0,jurosMes:0,multaMes:0};
      x.saldo+=numericValue(r,["valorSaldo","vlSaldo","saldo"]);
      x.lancado+=numericValue(r,["valorLancado","vlLancado","lancado"]);
      x.inscrito+=numericValue(r,["valorInscrito","vlInscrito","inscrito"]);
      x.correcao+=numericValue(r,["valorCorrecao","vlCorrecao"]);
      x.juros+=numericValue(r,["valorJuros","vlJuros"]);
      x.multa+=numericValue(r,["valorMulta","vlMulta"]);
      x.correcaoMes+=numericValue(r,["valorCorrecaoMes","vlCorrecaoMes"]);
      x.jurosMes+=numericValue(r,["valorJurosMes","vlJurosMes"]);
      x.multaMes+=numericValue(r,["valorMultaMes","vlMultaMes"]);
      map.set(k,x);
    }
    return [...map.entries()].sort((a,b)=>String(a[0]).localeCompare(String(b[0])));
  };

  const l=aggregate(lan.rows), d=aggregate(div.rows);
  return {
    view:"encerramento",tenant:{id:tenant.id,name:tenant.name},period:{periodo,exercicio},
    kpis:{
      "saldo-lancamentos":sumRowsOrNull(lan.rows,["valorSaldo","vlSaldo","saldo"]),
      "saldo-dividas":sumRowsOrNull(div.rows,["valorSaldo","vlSaldo","saldo"]),
      "acrescimos-lancamentos":hasAnyValue(lan.rows,["valorCorrecao","vlCorrecao","valorJuros","vlJuros","valorMulta","vlMulta"])
        ? sumRows(lan.rows,["valorCorrecao","vlCorrecao"])+sumRows(lan.rows,["valorJuros","vlJuros"])+sumRows(lan.rows,["valorMulta","vlMulta"])
        : null,
      "acrescimos-dividas":hasAnyValue(div.rows,["valorCorrecao","vlCorrecao","valorJuros","vlJuros","valorMulta","vlMulta"])
        ? sumRows(div.rows,["valorCorrecao","vlCorrecao"])+sumRows(div.rows,["valorJuros","vlJuros"])+sumRows(div.rows,["valorMulta","vlMulta"])
        : null
    },
    charts:{
      "saldo-lancamentos-mes":{format:"currency",labels:l.map(([k])=>k),datasets:[{label:"Saldo",data:l.map(([,v])=>v.saldo)}]},
      "saldo-divida-mes":{format:"currency",labels:d.map(([k])=>k),datasets:[{label:"Saldo",data:d.map(([,v])=>v.saldo)}]},
      "lancado-saldo":{format:"currency",labels:l.map(([k])=>k),datasets:[
        {label:"Lançado",data:l.map(([,v])=>v.lancado)},
        {label:"Saldo",data:l.map(([,v])=>v.saldo)}
      ]},
      "inscrito-saldo":{format:"currency",labels:d.map(([k])=>k),datasets:[
        {label:"Inscrito",data:d.map(([,v])=>v.inscrito)},
        {label:"Saldo",data:d.map(([,v])=>v.saldo)}
      ]},
      "acrescimos-lancamentos-mes":{format:"currency",labels:l.map(([k])=>k),datasets:[
        {label:"Correção",data:l.map(([,v])=>v.correcao)},
        {label:"Juros",data:l.map(([,v])=>v.juros)},
        {label:"Multa",data:l.map(([,v])=>v.multa)}
      ]},
      "acrescimos-divida-mes":{format:"currency",labels:d.map(([k])=>k),datasets:[
        {label:"Correção",data:d.map(([,v])=>v.correcao)},
        {label:"Juros",data:d.map(([,v])=>v.juros)},
        {label:"Multa",data:d.map(([,v])=>v.multa)}
      ]},
      "fluxo-acrescimos":{format:"currency",labels:d.map(([k])=>k),datasets:[
        {label:"Correção",data:d.map(([,v])=>v.correcaoMes)},
        {label:"Juros",data:d.map(([,v])=>v.jurosMes)},
        {label:"Multa",data:d.map(([,v])=>v.multaMes)}
      ]}
    },
    meta:dashboardMeta([["encerramentoLancamentos",lan],["encerramentoDividas",div]])
  };
}

async function buildWorksDashboard(env,tenant,url) {
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const [obras,resp]=await Promise.all([
    safeBethaRows(env,tenant,"base","obras"),
    safeBethaRows(env,tenant,"base","obras-responsaveis")
  ]);
  const entrada=monthlyCount(obras.rows,["dataEntrada","dtEntrada","dataCadastro"],periodo,exercicio);
  const liber=monthlyCount(obras.rows,["dataLiberacao","dtLiberacao"],periodo,exercicio,r=>Boolean(firstValue(r,["dataLiberacao","dtLiberacao"])));
  const sit=groupCount(obras.rows,["situacao","situacao.descricao","status"],12);
  const medida=groupSum(obras.rows,["situacao","situacao.descricao","status"],["medida","area","metragem"],12);
  const respGrouped=new Map();
  for(const r of resp.rows){
    const tipo=stringValue(r,["tipoResponsavel","tipo","funcao"],"Responsável");
    respGrouped.set(tipo,(respGrouped.get(tipo)||0)+1);
  }
  return {
    view:"obras",tenant:{id:tenant.id,name:tenant.name},period:{periodo,exercicio},
    kpis:{
      "obras-total":obras.total,
      "obras-situacao":countWhere(obras.rows,r=>/andamento|execu|abert/i.test(stringValue(r,["situacao","situacao.descricao","status"],""))),
      medida:sumRowsOrNull(obras.rows,["medida","area","metragem"]),
      liberadas:obras.rows.filter(r=>Boolean(firstValue(r,["dataLiberacao","dtLiberacao"]))&&periodIncludes(r,{periodo,exercicio,datePaths:["dataLiberacao","dtLiberacao"]})).length
    },
    charts:{
      "obras-situacao-grafico":chartGroups(sit,"Obras","number"),
      "obras-entrada":{format:"number",labels:entrada.labels,datasets:[{label:"Entradas",data:entrada.values}]},
      "obras-liberacao":{format:"number",labels:liber.labels,datasets:[{label:"Liberações",data:liber.values}]},
      "obras-medida":chartGroups(medida,"Medida","number"),
      "obras-responsaveis":chartGroups([...respGrouped.entries()],"Vínculos","number")
    },
    meta:dashboardMeta([["obras",obras],["responsaveis",resp]],{
      privacy:["nomes de responsáveis ocultados enquanto login oficial estiver desativado"]
    })
  };
}

async function buildQualityDashboard(env,tenant,url) {
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const [con,imo,eco,ativ,campos]=await Promise.all([
    safeBethaRows(env,tenant,"bi","contribuintes"),
    safeBethaRows(env,tenant,"bi","imoveis"),
    safeBethaRows(env,tenant,"bi","economicos"),
    safeBethaRows(env,tenant,"bi","economicos-atividades"),
    safeBethaRows(env,tenant,"bi","imoveis-campos-adicionais")
  ]);

  const ecoWithActivity=new Set(ativ.rows.map(r=>String(firstValue(r,["idEconomico","economico.id"])||"")).filter(Boolean));
  const opCon=monthlyCount(con.rows,["dhOperacao","dataHoraOperacao","dataAtualizacao"],periodo,exercicio);
  const opImo=monthlyCount(imo.rows,["dhOperacao","dataHoraOperacao","dataAtualizacao"],periodo,exercicio);
  const opEco=monthlyCount(eco.rows,["dhOperacao","dataHoraOperacao","dataAtualizacao"],periodo,exercicio);
  const campoGroups=groupCount(campos.rows,["campoAdicional.descricao","descricaoCampo","campoAdicional","campo"],12);

  const completionCon=completenessChart(con.rows,[
    {label:"CPF/CNPJ",paths:["cpf","cnpj","cpfCnpj","documento"]},
    {label:"E-mail",paths:["email","emailPrincipal"]},
    {label:"Telefone",paths:["telefone","fone","celular"]},
    {label:"CEP",paths:["cep","endereco.cep"]},
    {label:"Logradouro",paths:["nomeLogradouro","logradouro.nome","endereco.logradouro"]}
  ]);
  const completionImo=completenessChart(imo.rows,[
    {label:"Logradouro",paths:["nomeLogradouro","logradouro.nome"]},
    {label:"Número",paths:["numero","numeroImovel"]},
    {label:"CEP",paths:["cep","endereco.cep"]},
    {label:"Bairro",paths:["nomeBairro","bairro.nome"]},
    {label:"Setor",paths:["setor","setor.codigo"]}
  ]);
  const completionEco=completenessChart(eco.rows,[
    {label:"Início atividade",paths:["dtInicioAtiv","dataInicioAtividade"]},
    {label:"Situação",paths:["situacao","situacao.descricao"]},
    {label:"Bairro",paths:["nomeBairro","bairro.nome"]},
    {label:"Logradouro",paths:["nomeLogradouro","logradouro.nome"]},
    {label:"Tipo cadastro",paths:["tipoCadastro","tipoEconomico"]}
  ]);

  return {
    view:"qualidade",tenant:{id:tenant.id,name:tenant.name},period:{periodo,exercicio},
    kpis:{
      "sem-documento":countWhere(con.rows,r=>firstValue(r,["cpf","cnpj","cpfCnpj","documento"])===undefined),
      "sem-contato":countWhere(con.rows,r=>firstValue(r,["email","emailPrincipal","telefone","fone","celular"])===undefined),
      "imoveis-sem-endereco":countWhere(imo.rows,r=>firstValue(r,["nomeLogradouro","logradouro.nome"])===undefined||firstValue(r,["cep","endereco.cep"])===undefined),
      "economicos-sem-atividade":countWhere(eco.rows,r=>{
        const id=String(firstValue(r,["id","idEconomico"])||"");
        return id&&!ecoWithActivity.has(id);
      })
    },
    charts:{
      "completude-contribuintes":completionCon,
      "completude-imoveis":completionImo,
      "completude-economicos":completionEco,
      "operacoes-integracao":{format:"number",labels:opCon.labels,datasets:[
        {label:"Contribuintes",data:opCon.values},
        {label:"Imóveis",data:opImo.values},
        {label:"Econômicos",data:opEco.values}
      ]},
      "registros-desativados":chartFixed(["Contribuintes","Imóveis"],[
        countWhere(con.rows,r=>truthyValue(r,["desativado"])||/inativ|desativ/i.test(stringValue(r,["situacao","status"],""))),
        countWhere(imo.rows,r=>truthyValue(r,["desativado"])||/inativ|desativ/i.test(stringValue(r,["situacao","status"],"")))
      ],"Desativados","number"),
      "campos-adicionais":chartGroups(campoGroups,"Registros","number")
    },
    meta:dashboardMeta([["contribuintes",con],["imoveis",imo],["economicos",eco],["atividades",ativ],["camposAdicionais",campos]])
  };
}

async function listContextUsers(userToken, tenant, url) {
  const params=new URLSearchParams();
  params.set("limit",url.searchParams.get("limit") || "100");
  params.set("offset",url.searchParams.get("offset") || "0");
  const target=AUTH_BASE+"/user-accounts/v0.1/api/management/access?"+params.toString();
  return platformRequest(target,{headers:{
    "Accept":"application/json",
    "Authorization":"Bearer "+userToken,
    "User-Access":tenant.userAccess
  }});
}

function escapeFilterValue(value) {
  return String(value||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'");
}

async function searchCentralUser(userToken, user) {
  const filter="id='"+escapeFilterValue(user)+"'";
  const target=USERS_BASE+"/usuarios/v0.1/api/usuarios/?filter="+encodeURIComponent(filter);
  return platformRequest(target,{headers:{
    "Accept":"application/json",
    "Authorization":"Bearer "+userToken
  }});
}

async function createContextUser(userToken, tenant, body) {
  return platformRequest(AUTH_BASE+"/user-accounts/v0.1/api/management/access",{
    method:"POST",
    headers:{
      "Accept":"application/json",
      "Content-Type":"application/json",
      "Authorization":"Bearer "+userToken,
      "User-Access":tenant.userAccess
    },
    body:JSON.stringify(body)
  });
}

async function deleteContextUser(userToken, tenant, accessId) {
  return platformRequest(AUTH_BASE+"/user-accounts/v0.1/api/management/access/"+encodeURIComponent(accessId),{
    method:"DELETE",
    headers:{
      "Accept":"application/json",
      "Authorization":"Bearer "+userToken,
      "User-Access":tenant.userAccess
    }
  });
}

function publicCatalog(env) {
  const base=baseResourceMap(env);
  return {
    bi:Object.entries(BI_RESOURCES).map(([id,path])=>({id,path})),
    baseConfigured:Object.keys(base).sort()
  };
}

function errorResponse(request,env,error) {
  const code=error && error.message ? error.message : "UNKNOWN_ERROR";
  const statusByCode={
    TENANT_REQUIRED:400,
    TENANT_NOT_FOUND:403,
    TENANT_USER_ACCESS_NOT_CONFIGURED:503,
    USER_TOKEN_REQUIRED:401,
    APPLICATION_SESSION_INVALID:401,
    APPLICATION_SESSION_EXPIRED:401,
    LOGIN_CLIENT_SECRET_NOT_CONFIGURED:503,
    DEV_LOGIN_NOT_CONFIGURED:503,
    DEV_SESSION_SECRET_NOT_CONFIGURED:503,
    DEV_SESSION_REQUIRED:401,
    DEV_SESSION_INVALID:401,
    DEV_SESSION_EXPIRED:401,
    DEV_LOGIN_INVALID:401,
    DEV_LOGIN_USER_INVALID:401,
    DEV_LOGIN_PASSWORD_INVALID:401,
    TENANT_CONTEXT_UNRESOLVED:503,
    TENANT_ACCESS_DENIED:403,
    TENANT_ACCESS_NOT_ACCEPTED:403,
    TENANT_ACCESS_EXPIRED:403,
    BI_RESOURCE_NOT_ALLOWED:404,
    BASE_RESOURCE_NOT_CONFIGURED:501,
    BETHA_ACCESS_TOKEN_NOT_CONFIGURED:503,
    INVALID_SOURCE:400
  };
  if (code.startsWith("BETHA_HTTP_") || code.startsWith("PLATFORM_HTTP_")) {
    return json(request,env,error.status===401?401:error.status===403?403:502,{error:code});
  }
  return json(request,env,statusByCode[code]||500,{error:code});
}

export default {
  async fetch(request,env) {
    const url=new URL(request.url);
    if (request.method==="OPTIONS") return new Response(null,{status:204,headers:corsHeaders(request,env)});

    if (url.pathname==="/api/health" && request.method==="GET") {
      return json(request,env,200,{
        ok:true,
        buildVersion:"2026-10-01-financial-retry-v6",
        dashboardAggregatePublic:true,
        biApiBase:env.BETHA_BI_API_BASE || BI_BASE_DEFAULT,
        accessTokenConfigured:Boolean(env.BETHA_ACCESS_TOKEN),
        tenantsConfigured:Boolean(env.BETHA_TENANTS_JSON),
        userAuthorizationRequired:String(env.ALLOW_UNAUTHENTICATED_DEV || "").toLowerCase()!=="true",
        loginCredentialConfigured:Boolean(env.BETHA_LOGIN_CLIENT_ID && env.BETHA_LOGIN_CLIENT_SECRET),
        devLoginConfigured:Boolean(env.BI_DEV_LOGIN_USER && env.BI_DEV_LOGIN_PASSWORD)
      });
    }

    if (url.pathname==="/api/dev/login" && request.method==="POST") {
      try {
        if (!env.BI_DEV_LOGIN_USER || !env.BI_DEV_LOGIN_PASSWORD) {
          throw new Error("DEV_LOGIN_NOT_CONFIGURED");
        }

        const body=await request.json().catch(()=>({}));
        const username=normalizeDevCredential(body.username).toLowerCase();
        const password=normalizeDevCredential(body.password);

        const expectedUser=normalizeDevCredential(env.BI_DEV_LOGIN_USER).toLowerCase();
        const expectedPassword=normalizeDevCredential(env.BI_DEV_LOGIN_PASSWORD);

        if (username!==expectedUser) {
          throw new Error("DEV_LOGIN_USER_INVALID");
        }
        if (password!==expectedPassword) {
          throw new Error("DEV_LOGIN_PASSWORD_INVALID");
        }

        const session=await createDevSession(env,username);
        return json(request,env,200,{
          ok:true,
          session,
          expires_in:8*60*60
        });
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/api/dev/session-check" && request.method==="GET") {
      try {
        const session=await validateDevSession(request,env);
        return json(request,env,200,{
          ok:true,
          sessionValid:true,
          username:session.username || ""
        });
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/api/auth/login" && request.method==="GET") {
      if (!env.BETHA_LOGIN_CLIENT_ID || !env.BETHA_LOGIN_CLIENT_SECRET) {
        return json(request,env,503,{error:"LOGIN_CREDENTIAL_NOT_CONFIGURED"});
      }

      const state=await createOAuthState(env.BETHA_LOGIN_CLIENT_SECRET);

      const authorize=new URL(OAUTH_AUTHORIZE_URL);
      authorize.searchParams.set("response_type","code");
      authorize.searchParams.set("client_id",env.BETHA_LOGIN_CLIENT_ID);
      authorize.searchParams.set("redirect_uri",env.BETHA_LOGIN_REDIRECT_URI || LOGIN_REDIRECT_DEFAULT);
      authorize.searchParams.set("scope",env.BETHA_LOGIN_SCOPES || LOGIN_SCOPES_DEFAULT);
      authorize.searchParams.set("state",state);

      return new Response(null,{
        status:302,
        headers:{
          "Location":authorize.toString(),
          "Cache-Control":"no-store"
        }
      });
    }

    if (url.pathname==="/api/auth/callback" && request.method==="GET") {
      const front=env.BETHA_FRONT_URL || FRONT_URL_DEFAULT;
      const error=url.searchParams.get("error");
      const code=url.searchParams.get("code");
      const state=url.searchParams.get("state");

      if (error) {
        const target=new URL(front);
        target.hash="auth_error="+encodeURIComponent(error);
        return Response.redirect(target.toString(),302);
      }

      try {
        if (!env.BETHA_LOGIN_CLIENT_ID || !env.BETHA_LOGIN_CLIENT_SECRET) {
          throw new Error("LOGIN_CREDENTIAL_NOT_CONFIGURED");
        }
        if (!code || !state) throw new Error("OAUTH_CALLBACK_INCOMPLETE");

        await validateOAuthState(state,env.BETHA_LOGIN_CLIENT_SECRET);

        const form=new URLSearchParams();
        form.set("grant_type","authorization_code");
        form.set("client_id",env.BETHA_LOGIN_CLIENT_ID);
        form.set("client_secret",env.BETHA_LOGIN_CLIENT_SECRET);
        form.set("code",code);
        form.set("redirect_uri",env.BETHA_LOGIN_REDIRECT_URI || LOGIN_REDIRECT_DEFAULT);

        const oauthResponse=await fetch(OAUTH_TOKEN_URL,{
          method:"POST",
          headers:{"Content-Type":"application/x-www-form-urlencoded","Accept":"application/json"},
          body:form
        });
        const parsed=await readJsonResponse(oauthResponse);

        if (!oauthResponse.ok || !parsed.body || !parsed.body.access_token) {
          console.error("server oauth exchange",oauthResponse.status,parsed.body);
          throw new Error("OAUTH_TOKEN_EXCHANGE_FAILED");
        }

        const oauthSeconds=Number(parsed.body.expires_in || parsed.body.expires || 0);
        const sessionSeconds=oauthSeconds>0 ? Math.min(oauthSeconds,8*60*60) : 8*60*60;

        const session=await sealSession({
          kind:"user-session",
          accessToken:parsed.body.access_token,
          exp:Date.now()+sessionSeconds*1000
        },env.BETHA_LOGIN_CLIENT_SECRET);

        const target=new URL(front);
        target.hash="session="+encodeURIComponent(session)+"&expires_in="+sessionSeconds;
        return Response.redirect(target.toString(),302);
      } catch(authError) {
        console.error("oauth callback",authError);
        const target=new URL(front);
        target.hash="auth_error="+encodeURIComponent(authError.message || "AUTH_CALLBACK_FAILED");
        return Response.redirect(target.toString(),302);
      }
    }

    if (url.pathname==="/api/auth/exchange" && request.method==="POST") {
      try {
        const body=await request.json();
        const code=String(body.code||"").trim();
        const verifier=String(body.codeVerifier||"").trim();
        const state=String(body.state||"").trim();

        if (!code || !verifier) {
          return json(request,env,400,{error:"AUTH_EXCHANGE_MISSING_DATA"});
        }
        if (verifier.length < 43 || verifier.length > 128) {
          return json(request,env,400,{error:"PKCE_VERIFIER_INVALID"});
        }

        const form=new URLSearchParams();
        form.set("grant_type","authorization_code");
        form.set("client_id",BROWSER_CLIENT_ID);
        form.set("code_verifier",verifier);
        form.set("code",code);
        form.set("redirect_uri",BROWSER_REDIRECT_URI);
        form.set("scope",BROWSER_SCOPES);

        const oauthResponse=await fetch(OAUTH_TOKEN_URL,{
          method:"POST",
          headers:{"Content-Type":"application/x-www-form-urlencoded","Accept":"application/json"},
          body:form
        });

        const parsed=await readJsonResponse(oauthResponse);
        if (!oauthResponse.ok) {
          console.error("oauth exchange",oauthResponse.status,parsed.body);
          return json(request,env,oauthResponse.status,{
            error:"OAUTH_TOKEN_EXCHANGE_FAILED",
            status:oauthResponse.status,
            detail:parsed.body && typeof parsed.body==="object"
              ? (parsed.body.error_description || parsed.body.error || null)
              : null
          });
        }

        if (!parsed.body || !parsed.body.access_token) {
          return json(request,env,502,{error:"OAUTH_TOKEN_MISSING"});
        }

        return json(request,env,200,{
          access_token:parsed.body.access_token,
          token_type:parsed.body.token_type || "bearer",
          expires_in:parsed.body.expires_in ?? parsed.body.expires ?? 0,
          scope:parsed.body.scope || "",
          state
        });
      } catch(error) {
        console.error("auth exchange",error);
        return json(request,env,500,{error:"AUTH_EXCHANGE_INTERNAL_ERROR"});
      }
    }

    if (url.pathname==="/api/auth/session-check" && request.method==="GET") {
      try {
        const userToken=await getUserToken(request,env);
        if (!userToken) throw new Error("USER_TOKEN_REQUIRED");

        // Valida também se o token Betha continua aceito, sem retornar dados pessoais.
        const accesses=await getUserAccesses(userToken);
        return json(request,env,200,{
          ok:true,
          sessionValid:true,
          accessCount:Array.isArray(accesses)?accesses.length:0
        });
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    const dashboardMatch=url.pathname.match(/^\/api\/dashboard\/([a-z0-9-]+)$/);
    if (dashboardMatch && request.method==="GET") {
      try {
        const tenant=resolveTenant(env,getTenantId(request,url));
        const view=dashboardMatch[1];

        // Enquanto o login está desativado, estas rotas devolvem apenas agregados.
        // Nenhum registro individual ou dado cadastral é exposto.
        const builders={
          "visao-geral":buildOverviewDashboard,
          arrecadacao:buildRevenueDashboard,
          debitos:buildDebtsDashboard,
          divida:buildActiveDebtDashboard,
          parcelamentos:buildInstallmentsDashboard,
          economicos:buildEconomicsDashboard,
          imobiliario:buildRealEstateDashboard,
          itbi:buildItbiDashboard,
          contribuintes:buildTaxpayersDashboard,
          encerramento:buildClosingDashboard,
          obras:buildWorksDashboard,
          qualidade:buildQualityDashboard
        };

        const builder=builders[view];
        if (!builder) return json(request,env,501,{error:"DASHBOARD_NOT_IMPLEMENTED",view});

        const body=await builder(env,tenant,url);
        return json(request,env,200,body);
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/api/catalog" && request.method==="GET") {
      return json(request,env,200,publicCatalog(env));
    }

    // Teste de credencial de serviço: consulta mínima e não devolve dados cadastrais.
    if (url.pathname==="/api/connection-test" && request.method==="GET") {
      try {
        await validateDevSession(request,env);
        const tenant=resolveTenant(env,getTenantId(request,url));
        const body=await bethaGet(env,tenant,"bi","contribuintes","limit=1&fields=id");
        return json(request,env,200,{
          ok:true,
          bethaAuthenticated:true,
          tenant:tenant.id,
          sampleReturned:body && Array.isArray(body.content) ? body.content.length : 0
        });
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/api/me/access" && request.method==="GET") {
      try {
        const accesses=await getUserAccesses(await getUserToken(request,env));
        return json(request,env,200,{accesses});
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/api/me/tenants" && request.method==="GET") {
      try {
        const userToken=await getUserToken(request,env);
        if (!userToken) throw new Error("USER_TOKEN_REQUIRED");
        const registry=parseJsonObject(env.BETHA_TENANTS_JSON,{});
        const tenants=[];
        for (const id of Object.keys(registry)) {
          try {
            const tenant=resolveTenant(env,id);
            const auth=await authorizeTenant(request,env,tenant);
            tenants.push({
              id:tenant.id,
              name:tenant.name,
              entityId:auth.context.entity,
              databaseId:auth.context.database,
              admin:Boolean(auth.access && auth.access.admin),
              technical:Boolean(auth.access && auth.access.technical)
            });
          } catch(error) {
            if (!["TENANT_ACCESS_DENIED","TENANT_ACCESS_NOT_ACCEPTED","TENANT_ACCESS_EXPIRED"].includes(error.message)) {
              console.warn("tenant validation",id,error.message);
            }
          }
        }
        return json(request,env,200,{tenants});
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/api/admin/users" && request.method==="GET") {
      try {
        const tenant=resolveTenant(env,getTenantId(request,url));
        const auth=await authorizeTenant(request,env,tenant);
        const body=await listContextUsers(auth.userToken,tenant,url);
        return json(request,env,200,body);
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/api/admin/user-search" && request.method==="GET") {
      try {
        const tenant=resolveTenant(env,getTenantId(request,url));
        const auth=await authorizeTenant(request,env,tenant);
        const user=url.searchParams.get("user") || "";
        if (!user.trim()) return json(request,env,400,{error:"USER_REQUIRED"});
        const body=await searchCentralUser(auth.userToken,user.trim());
        return json(request,env,200,body);
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/api/admin/users" && request.method==="POST") {
      try {
        const tenant=resolveTenant(env,getTenantId(request,url));
        const auth=await authorizeTenant(request,env,tenant);
        if (!auth.access || (!auth.access.admin && !auth.access.technical)) throw new Error("ADMIN_REQUIRED");
        const body=await request.json();
        const created=await createContextUser(auth.userToken,tenant,body);
        return json(request,env,201,created);
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    const deleteUserMatch=url.pathname.match(/^\/api\/admin\/users\/([^/]+)$/);
    if (deleteUserMatch && request.method==="DELETE") {
      try {
        const tenant=resolveTenant(env,getTenantId(request,url));
        const auth=await authorizeTenant(request,env,tenant);
        if (!auth.access || (!auth.access.admin && !auth.access.technical)) throw new Error("ADMIN_REQUIRED");
        const body=await deleteContextUser(auth.userToken,tenant,deleteUserMatch[1]);
        return json(request,env,200,body || {ok:true});
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    const dataMatch=url.pathname.match(/^\/api\/data\/([a-z0-9-]+)$/);
    if (dataMatch && request.method==="GET") {
      try {
        const tenant=resolveTenant(env,getTenantId(request,url));
        const auth=await authorizeTenant(request,env,tenant);
        const resource=dataMatch[1];
        const source=(url.searchParams.get("source") || "bi").toLowerCase();
        const query=buildForwardedQuery(url);
        const body=await bethaGet(env,tenant,source,resource,query);
        return json(request,env,200,{
          source,
          tenant:{id:tenant.id,name:tenant.name,entityId:auth.context.entity,databaseId:auth.context.database},
          resource,
          data:body
        });
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    if (!["GET","POST","DELETE"].includes(request.method)) {
      return json(request,env,405,{error:"METHOD_NOT_ALLOWED"});
    }

    return json(request,env,404,{error:"ROUTE_NOT_FOUND"});
  }
};