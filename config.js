// Arquivo público. NÃO coloque tokens, User-Access, chave privada ou client_secret aqui.
window.BI_CONFIG = {
  APP_NAME: "BI Tributos",
  ENTITY_LABEL: "Prefeitura Municipal de Agudos do Sul",
  DEFAULT_TENANT: "agudosdosul",
  BACKEND_URL: "https://betha-bi-api.ueliton-bueno.workers.dev",
  AUTH_REQUIRED: true,

  AUTH: {
    CLIENT_ID: "9296eb53-4d03-495b-96e6-a3ed3a7d14e3",
    REDIRECT_URI: "https://uelitonbueno-creator.github.io/betha/",
    AUTHORIZE_URL: "https://plataforma-oauth.betha.cloud/auth/oauth2/authorize",
    TOKEN_URL: "https://plataforma-oauth.betha.cloud/auth/oauth2/token",
    SCOPES: ["contas-usuarios.suite", "user-accounts.suite", "licenses.suite"]
  }
};