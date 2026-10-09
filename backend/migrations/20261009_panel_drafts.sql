-- Banco padrão: AUTH_DB (wrangler.jsonc); BI_PANEL_DB opcional se configurado.
-- A rotina ensurePanelDraftSchema inicializa/atualiza automaticamente o esquema.
-- Migração manual apenas antes da inicialização automática, em ordem com as seguintes.
CREATE TABLE IF NOT EXISTS bi_panel_drafts (
 id TEXT PRIMARY KEY,
 tenant_id TEXT NOT NULL,
 system_id TEXT NOT NULL,
 owner_id TEXT NOT NULL,
 title TEXT NOT NULL,
 definition_json TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_bi_panel_drafts_scope
 ON bi_panel_drafts(tenant_id,system_id,owner_id,updated_at);
