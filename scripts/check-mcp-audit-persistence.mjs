import fs from "node:fs";

const worker=fs.readFileSync(new URL("../backend/worker.js",import.meta.url),"utf8");
const errors=[];
const requireText=(text,code)=>{
  if(!worker.includes(text)) errors.push(code);
};

requireText("CREATE TABLE IF NOT EXISTS bi_audit_events","AUDIT_D1_TABLE_MISSING");
requireText("CREATE INDEX IF NOT EXISTS idx_bi_audit_events_tenant_ts","AUDIT_D1_INDEX_MISSING");
requireText("INSERT OR REPLACE INTO bi_audit_events","AUDIT_D1_WRITE_MISSING");
requireText("FROM bi_audit_events WHERE tenant_id=?1 ORDER BY ts DESC LIMIT ?2","AUDIT_D1_READ_TENANT_SCOPE_MISSING");
requireText('const key="audit:"+event.tenantId+":"',"AUDIT_KV_MIRROR_MISSING");
requireText('"d1-primary+kv-mirror"',"AUDIT_PERSISTENCE_STATUS_MISSING");
requireText("retentionDays:30","AUDIT_RETENTION_MISSING");
requireText("safeAuditMeta(meta)","AUDIT_META_SANITIZATION_MISSING");

if(errors.length){
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("MCP audit persistence contract OK: D1 primary storage, tenant-scoped reads, KV mirror and 30-day retention are present.");
