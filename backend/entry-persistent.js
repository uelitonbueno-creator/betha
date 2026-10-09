import worker from "./worker.js";

const SYNC_PREFIX = "bi-sync:v1:";
const RAW_BUCKET_PREFIX = "bi-sync/";
let schemaReady = false;

async function ensureDurableSchema(env) {
  if (schemaReady || !env.AUTH_DB) return;
  await env.AUTH_DB.prepare(
    "CREATE TABLE IF NOT EXISTS bi_durable_kv (cache_key TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at TEXT NOT NULL)"
  ).run();
  await env.AUTH_DB.prepare(
    "CREATE INDEX IF NOT EXISTS idx_bi_durable_kv_updated ON bi_durable_kv (updated_at)"
  ).run();
  schemaReady = true;
}

function isSyncKey(key) {
  return String(key || "").startsWith(SYNC_PREFIX);
}

function isJobKey(key) {
  return isSyncKey(key) && String(key).includes(":job:");
}

function isRowKey(key) {
  return isSyncKey(key) && String(key).includes(":rows:");
}

function durableKey(key) {
  const text = String(key || "");
  const match = text.match(/^(bi-sync:v1:[^:]+):rows:[^:]+:(.+):(\d+)$/);
  return match ? match[1] + ":rows:latest:" + match[2] + ":" + match[3] : text;
}

function rawObjectKey(key) {
  return RAW_BUCKET_PREFIX + encodeURIComponent(durableKey(key)) + ".json";
}

function isTransientSyncError(code) {
  const value = String(code || "");
  return value === "The operation was aborted"
    || value === "AbortError"
    || value === "REQUEST_TIMEOUT"
    || /^BETHA_HTTP_(408|409|425|429|5\d\d)$/.test(value)
    || /^D1_ERROR:/.test(value);
}

function normalizeJob(job) {
  if (!job || typeof job !== "object" || !job.sources || typeof job.sources !== "object") return job;
  let completed = 0;
  let reopened = false;
  for (const entry of Object.values(job.sources)) {
    if (!entry || typeof entry !== "object") continue;
    if (entry.error && isTransientSyncError(entry.error)) {
      entry.lastError = entry.error;
      entry.lastErrorAt = entry.lastErrorAt || new Date().toISOString();
      entry.error = null;
      entry.complete = false;
      entry.retryCount = 0;
      entry.pageSize = Math.min(50, Number(entry.pageSize) || 50);
      if (entry.nextOffset == null) entry.nextOffset = Math.max(0, Number(entry.loaded) || 0);
      reopened = true;
    }
    if (entry.complete || (entry.error && !isTransientSyncError(entry.error))) completed++;
  }
  job.completed = completed;
  job.failures = Array.isArray(job.failures)
    ? job.failures.filter(item => !isTransientSyncError(item?.error))
    : [];
  const total = Math.max(0, Number(job.total) || Object.keys(job.sources).length);
  job.total = total;
  if (reopened || completed < total) {
    job.state = "running";
    job.finishedAt = null;
  }
  return job;
}

function requestedType(typeOrOptions) {
  if (typeof typeOrOptions === "string") return typeOrOptions;
  if (typeOrOptions && typeof typeOrOptions === "object") return typeOrOptions.type || "text";
  return "text";
}

function decodeValue(value, type, key) {
  if (value == null) return null;
  if (type === "json") {
    try {
      const parsed = JSON.parse(String(value));
      return isJobKey(key) ? normalizeJob(parsed) : parsed;
    } catch {
      return null;
    }
  }
  if (type === "arrayBuffer") return new TextEncoder().encode(String(value)).buffer;
  if (isJobKey(key)) {
    try {
      return JSON.stringify(normalizeJob(JSON.parse(String(value))));
    } catch {}
  }
  return String(value);
}

async function readLegacyRowFromD1(env, key) {
  if (!env.AUTH_DB) return null;
  await ensureDurableSchema(env);
  const canonical = durableKey(key);
  let row = await env.AUTH_DB
    .prepare("SELECT cache_key,payload FROM bi_durable_kv WHERE cache_key=?1 LIMIT 1")
    .bind(canonical)
    .first();
  if (!row?.payload && canonical !== String(key)) {
    row = await env.AUTH_DB
      .prepare("SELECT cache_key,payload FROM bi_durable_kv WHERE cache_key=?1 LIMIT 1")
      .bind(String(key))
      .first();
  }
  return row || null;
}

async function removeLegacyRowFromD1(env, key) {
  if (!env.AUTH_DB) return;
  await ensureDurableSchema(env);
  await env.AUTH_DB
    .prepare("DELETE FROM bi_durable_kv WHERE cache_key IN (?1,?2)")
    .bind(String(key), durableKey(key))
    .run();
}

async function migrateLegacyRows(env, limit = 12) {
  if (!env.AUTH_DB || !env.BI_SYNC_RAW) return { migrated: 0 };
  await ensureDurableSchema(env);
  const result = await env.AUTH_DB
    .prepare("SELECT cache_key,payload FROM bi_durable_kv WHERE cache_key LIKE '%:rows:%' ORDER BY updated_at LIMIT ?1")
    .bind(Math.max(1, Math.min(50, Number(limit) || 12)))
    .all();
  const rows = Array.isArray(result?.results) ? result.results : [];
  let migrated = 0;
  for (const row of rows) {
    if (!row?.cache_key || row.payload == null) continue;
    try {
      await env.BI_SYNC_RAW.put(rawObjectKey(row.cache_key), String(row.payload), {
        httpMetadata: { contentType: "application/json" }
      });
      await env.AUTH_DB
        .prepare("DELETE FROM bi_durable_kv WHERE cache_key=?1")
        .bind(String(row.cache_key))
        .run();
      migrated++;
    } catch (error) {
      console.warn("Legacy BI row migration failed", String(row.cache_key), error?.message || error);
      break;
    }
  }
  return { migrated };
}

function durableSessions(env) {
  const kv = env.BI_SESSIONS;
  if (!kv || !env.AUTH_DB) return kv;
  return {
    async get(key, typeOrOptions) {
      const type = requestedType(typeOrOptions);
      if (isRowKey(key)) {
        if (env.BI_SYNC_RAW) {
          try {
            const object = await env.BI_SYNC_RAW.get(rawObjectKey(key));
            if (object) return decodeValue(await object.text(), type, key);
          } catch (error) {
            console.warn("R2 BI sync read failed", String(key), error?.message || error);
          }
        }
        try {
          const legacy = await readLegacyRowFromD1(env, key);
          if (legacy?.payload != null) {
            if (env.BI_SYNC_RAW) {
              await env.BI_SYNC_RAW.put(rawObjectKey(key), String(legacy.payload), {
                httpMetadata: { contentType: "application/json" }
              });
              await env.AUTH_DB
                .prepare("DELETE FROM bi_durable_kv WHERE cache_key=?1")
                .bind(String(legacy.cache_key))
                .run();
            }
            return decodeValue(legacy.payload, type, key);
          }
        } catch (error) {
          console.warn("Legacy D1 BI row read failed", String(key), error?.message || error);
        }
        const value = await kv.get(key, typeOrOptions);
        if (value != null && env.BI_SYNC_RAW) {
          try {
            const payload = type === "json" && typeof value !== "string" ? JSON.stringify(value) : String(value);
            await env.BI_SYNC_RAW.put(rawObjectKey(key), payload, {
              httpMetadata: { contentType: "application/json" }
            });
          } catch (error) {
            console.warn("KV to R2 BI row migration failed", String(key), error?.message || error);
          }
        }
        return value;
      }

      if (isSyncKey(key)) {
        try {
          await ensureDurableSchema(env);
          const row = await env.AUTH_DB
            .prepare("SELECT payload FROM bi_durable_kv WHERE cache_key=?1 LIMIT 1")
            .bind(String(key))
            .first();
          if (row?.payload != null) return decodeValue(row.payload, type, key);
        } catch (error) {
          console.warn("Durable BI metadata read failed", String(key), error?.message || error);
        }
      }

      const value = await kv.get(key, typeOrOptions);
      if (value != null && isSyncKey(key)) {
        try {
          await ensureDurableSchema(env);
          let stored = value;
          if (isJobKey(key)) {
            try {
              stored = JSON.stringify(normalizeJob(typeof value === "string" ? JSON.parse(value) : value));
            } catch {}
          }
          const payload = type === "json" && typeof stored !== "string"
            ? JSON.stringify(stored)
            : String(stored);
          await env.AUTH_DB
            .prepare("INSERT INTO bi_durable_kv (cache_key,payload,updated_at) VALUES (?1,?2,?3) ON CONFLICT(cache_key) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at")
            .bind(String(key), payload, new Date().toISOString())
            .run();
        } catch (error) {
          console.warn("Durable BI metadata migration failed", String(key), error?.message || error);
        }
      }
      return isJobKey(key) && type === "json" ? normalizeJob(value) : value;
    },

    async put(key, value, options) {
      let stored = value;
      if (isJobKey(key)) {
        try {
          const parsed = typeof value === "string" ? JSON.parse(value) : value;
          stored = JSON.stringify(normalizeJob(parsed));
        } catch {}
      }

      if (isRowKey(key)) {
        if (env.BI_SYNC_RAW) {
          const payload = typeof stored === "string" ? stored : JSON.stringify(stored);
          await env.BI_SYNC_RAW.put(rawObjectKey(key), payload, {
            httpMetadata: { contentType: "application/json" }
          });
        }
        return kv.put(key, stored, options);
      }

      if (isSyncKey(key)) {
        await ensureDurableSchema(env);
        const payload = typeof stored === "string" ? stored : JSON.stringify(stored);
        await env.AUTH_DB
          .prepare("INSERT INTO bi_durable_kv (cache_key,payload,updated_at) VALUES (?1,?2,?3) ON CONFLICT(cache_key) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at")
          .bind(String(key), payload, new Date().toISOString())
          .run();
      }
      return kv.put(key, stored, options);
    },

    async delete(key) {
      if (isRowKey(key)) {
        try {
          if (env.BI_SYNC_RAW) await env.BI_SYNC_RAW.delete(rawObjectKey(key));
          await removeLegacyRowFromD1(env, key);
        } catch (error) {
          console.warn("Durable BI row delete failed", String(key), error?.message || error);
        }
      } else if (isSyncKey(key)) {
        try {
          await ensureDurableSchema(env);
          await env.AUTH_DB
            .prepare("DELETE FROM bi_durable_kv WHERE cache_key=?1")
            .bind(String(key))
            .run();
        } catch (error) {
          console.warn("Durable BI metadata delete failed", String(key), error?.message || error);
        }
      }
      return kv.delete(key);
    },

    list(options) {
      return kv.list(options);
    },

    getWithMetadata(key, typeOrOptions) {
      return kv.getWithMetadata(key, typeOrOptions);
    }
  };
}

function persistentEnv(env) {
  const sessions = durableSessions(env);
  return sessions === env.BI_SESSIONS ? env : { ...env, BI_SESSIONS: sessions };
}

export default {
  fetch(request, env, ctx) {
    return worker.fetch(request, persistentEnv(env), ctx);
  },
  scheduled(event, env, ctx) {
    if (ctx?.waitUntil) ctx.waitUntil(migrateLegacyRows(env, 12));
    return worker.scheduled(event, persistentEnv(env), ctx);
  }
};
