ALTER TABLE bi_panel_drafts ADD COLUMN view_id TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_bi_panel_drafts_view ON bi_panel_drafts(tenant_id,system_id,owner_id,view_id);
