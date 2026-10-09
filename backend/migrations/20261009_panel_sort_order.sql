ALTER TABLE bi_panel_drafts ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_bi_panel_sort ON bi_panel_drafts(tenant_id,system_id,owner_id,view_id,sort_order);
