// Arquivo público. NÃO coloque tokens, User-Access, chave privada ou client_secret aqui.
window.BI_CONFIG = {
  APP_NAME: "BI Vella",
  // Entidade é definida somente após validar /api/me/tenants.
  ENTITY_LABEL: "",
  DEFAULT_TENANT: "",
  DEFAULT_SYSTEM: "tributos",
  BACKEND_URL: "https://betha-bi-api.ueliton-bueno.workers.dev",
  AUTH_REQUIRED: true
};


// Catálogo de sistemas do BI Vella. Novos módulos podem apontar para outra
// aplicação/rota mantendo o mesmo contexto de entidade na troca.
window.BI_SYSTEMS = [
  {id:"tributos",name:"Tributos",enabled:true,homeView:"visao-geral"},
  {id:"contabil",name:"Contábil",enabled:true,homeView:"contabil-visao-geral",sampleMode:true},
  {id:"compras",name:"Compras",enabled:true,homeView:"compras-visao-geral",sampleMode:true},
  {id:"folha",name:"Folha de pagamento",enabled:true,homeView:"folha-visao-geral",sampleMode:true}
];
