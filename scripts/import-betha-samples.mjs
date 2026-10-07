#!/usr/bin/env node
/**
 * Importa até 100 registros reais de uma API Betha para inspeção de schema.
 * Não grava segredos e não depende do Cloudflare Worker.
 *
 * Variáveis:
 *   BETHA_ACCESS_TOKEN
 *   BETHA_USER_ACCESS
 *   BETHA_CONTABIL_SAMPLE_URL
 *   BETHA_COMPRAS_SAMPLE_URL
 *   BETHA_FOLHA_SAMPLE_URL
 *
 * Uso:
 *   node scripts/import-betha-samples.mjs contabil
 *   node scripts/import-betha-samples.mjs compras
 *   node scripts/import-betha-samples.mjs folha
 *   node scripts/import-betha-samples.mjs all
 */
import fs from "node:fs/promises";
import path from "node:path";

const token=String(process.env.BETHA_ACCESS_TOKEN||"").trim();
const userAccess=String(process.env.BETHA_USER_ACCESS||"").trim();
if(!token) throw new Error("BETHA_ACCESS_TOKEN_REQUIRED");
if(!userAccess) throw new Error("BETHA_USER_ACCESS_REQUIRED");

const targets={
  contabil:{url:process.env.BETHA_CONTABIL_SAMPLE_URL,out:"data/raw/contabil-100.json"},
  compras:{url:process.env.BETHA_COMPRAS_SAMPLE_URL,out:"data/raw/compras-100.json"},
  folha:{url:process.env.BETHA_FOLHA_SAMPLE_URL,out:"data/raw/folha-100.json"}
};

function rowsFrom(body){
  if(Array.isArray(body)) return body;
  for(const key of ["content","data","items","records","resultados"]){
    if(Array.isArray(body?.[key])) return body[key];
  }
  return [];
}

async function fetchTarget(name,target){
  const rawUrl=String(target.url||"").trim();
  if(!rawUrl) throw new Error("BETHA_"+name.toUpperCase()+"_SAMPLE_URL_REQUIRED");
  const url=new URL(rawUrl);
  if(!url.searchParams.has("limit")) url.searchParams.set("limit","100");
  if(!url.searchParams.has("offset")) url.searchParams.set("offset","0");

  const response=await fetch(url,{
    headers:{
      Accept:"application/json",
      Authorization:token.toLowerCase().startsWith("bearer ")?token:"Bearer "+token,
      "User-Access":userAccess
    }
  });
  const text=await response.text();
  if(!response.ok) throw new Error(name.toUpperCase()+"_HTTP_"+response.status+":"+text.slice(0,300));
  const body=JSON.parse(text);
  const rows=rowsFrom(body).slice(0,100);
  if(!rows.length) throw new Error(name.toUpperCase()+"_NO_ROWS");

  await fs.mkdir(path.dirname(target.out),{recursive:true});
  await fs.writeFile(target.out,JSON.stringify({
    mode:"raw-api-sample",
    system:name,
    importedAt:new Date().toISOString(),
    source:url.origin+url.pathname,
    recordCount:rows.length,
    rows
  },null,2)+"\n","utf8");
  console.log(name+": "+rows.length+" registros -> "+target.out);
}

const requested=(process.argv[2]||"all").toLowerCase();
const list=requested==="all"?Object.keys(targets):[requested];
for(const name of list){
  if(!targets[name]) throw new Error("SYSTEM_NOT_SUPPORTED:"+name);
  await fetchTarget(name,targets[name]);
}
