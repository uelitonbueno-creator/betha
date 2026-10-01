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

async function fetchBethaRows(env,tenant,source,resource,{limit=1000,maxPages=5}={}) {
  const rows=[];
  let total=null;
  let truncated=false;

  for (let page=0;page<maxPages;page++) {
    const offset=page*limit;
    const body=await bethaGet(env,tenant,source,resource,"limit="+limit+"&offset="+offset);
    const pageRows=payloadRows(body);
    if (total===null) total=payloadTotal(body);
    rows.push(...pageRows);

    if (!pageRows.length || pageRows.length<limit || (total!==null && rows.length>=total)) {
      break;
    }
    if (page===maxPages-1) truncated=true;
  }

  return {rows,total:total===null?rows.length:total,truncated};
}

async function safeBethaRows(env,tenant,source,resource,options={}) {
  try {
    const result=await fetchBethaRows(env,tenant,source,resource,options);
    return {...result,error:null};
  } catch(error) {
    console.warn("dashboard source failed",source,resource,error.message);
    return {rows:[],total:0,truncated:false,error:error.message};
  }
}

function valueAt(obj,path) {
  if (!obj || !path) return undefined;
  if (!String(path).includes(".")) return obj[path];
  return String(path).split(".").reduce((acc,key)=>acc==null?undefined:acc[key],obj);
}

function firstValue(obj,paths) {
  for (const path of paths) {
    const value=valueAt(obj,path);
    if (value!==undefined && value!==null && value!=="") return value;
  }
  return undefined;
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
    safeBethaRows(env,tenant,"bi","pagamentos",{maxPages:5}),
    safeBethaRows(env,tenant,"bi","debitos",{maxPages:5}),
    safeBethaRows(env,tenant,"bi","dividas",{maxPages:5}),
    safeBethaRows(env,tenant,"bi","parcelamentos",{maxPages:3}),
    safeBethaRows(env,tenant,"bi","contribuintes",{maxPages:3}),
    safeBethaRows(env,tenant,"bi","imoveis",{maxPages:3}),
    safeBethaRows(env,tenant,"bi","economicos",{maxPages:3}),
    safeBethaRows(env,tenant,"bi","pagamentos-detalhados",{maxPages:5})
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
      arrecadado:sumRows(filteredPayments,["valorPago","vlPago","valorTotalPago"]),
      lancado:sumRows(filteredDebits,["vlLancado","valorLancado","valorDebito"]),
      divida:debtSaldo,
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
      }
    }
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
        buildVersion:"2026-10-01-dashboard-public-v2",
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

        // Enquanto o login está desativado, esta rota devolve apenas agregados.
        // Nenhum registro individual ou dado cadastral é exposto.
        if (view==="visao-geral") {
          const body=await buildOverviewDashboard(env,tenant,url);
          return json(request,env,200,body);
        }

        return json(request,env,501,{error:"DASHBOARD_NOT_IMPLEMENTED",view});
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