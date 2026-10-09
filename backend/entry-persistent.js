import worker from "./worker.js";

const SYNC_PREFIX = "bi-sync:v1:";
const RAW_BUCKET_PREFIX = "bi-sync/";
const CRON_LOCK_MS = 90 * 1000;
const CRON_MIGRATION_BATCH = 2;
let schemaReady = false;

async function ensureDurableSchema(env) {
  if (schemaReady || !env.AUTH_DB) return;
  await env.AUTH_DB.prepare(
    "CREATE TABLE IF NOT EXISTS bi_durable_kv (cache_key TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at TEXT NOT NULL)"
  ).run();
  await env.AUTH_DB.prepare(
    "CREATE INDEX IF NOT EXISTS idx_bi_durable_kv_updated ON bi_durable_kv (updated_at)"
  ).run();
  await env.AUTH_DB.prepare(
    "CREATE TABLE IF NOT EXISTS bi_cron_heartbeat (id INTEGER PRIMARY KEY CHECK(id=1), run_id TEXT, cron TEXT, status TEXT NOT NULL, started_at TEXT, finished_at TEXT, lock_until TEXT, task_count INTEGER NOT NULL DEFAULT 0, error_json TEXT, updated_at TEXT NOT NULL)"
  ).run();
  await env.AUTH_DB.prepare(
    "INSERT OR IGNORE INTO bi_cron_heartbeat (id,status,updated_at) VALUES (1,'idle',?1)"
  ).bind(new Date().toISOString()).run();
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

async function acquireCronLease(env, event) {
  if (!env.AUTH_DB) return { acquired: true, runId: crypto.randomUUID(), startedAt: new Date().toISOString() };
  await ensureDurableSchema(env);
  const startedAt = new Date().toISOString();
  const runId = crypto.randomUUID();
  const lockUntil = new Date(Date.now() + CRON_LOCK_MS).toISOString();
  const result = await env.AUTH_DB.prepare(
    "UPDATE bi_cron_heartbeat SET run_id=?1,cron=?2,status='running',started_at=?3,finished_at=NULL,lock_until=?4,task_count=0,error_json=NULL,updated_at=?3 WHERE id=1 AND (status!='running' OR lock_until IS NULL OR lock_until<?3)"
  ).bind(runId, String(event?.cron || ""), startedAt, lockUntil).run();
  const changes = Number(result?.meta?.changes ?? result?.changes ?? 0);
  return { acquired: changes > 0, runId, startedAt, lockUntil };
}

async function finishCronHeartbeat(env, lease, status, taskCount, errors) {
  if (!env.AUTH_DB || !lease?.runId) return;
  const finishedAt = new Date().toISOString();
  await env.AUTH_DB.prepare(
    "UPDATE bi_cron_heartbeat SET status=?1,finished_at=?2,lock_until=?2,task_count=?3,error_json=?4,updated_at=?2 WHERE id=1 AND run_id=?5"
  ).bind(
    status,
    finishedAt,
    Math.max(0, Number(taskCount) || 0),
    errors?.length ? JSON.stringify(errors).slice(0, 4000) : null,
    lease.runId
  ).run();
}

async function runScheduledWithHeartbeat(event, env, ctx) {
  const lease = await acquireCronLease(env, event);
  if (!lease.acquired) return;

  const tasks = [];
  const wrappedCtx = {
    waitUntil(promise) {
      tasks.push(Promise.resolve(promise));
    },
    passThroughOnException() {
      if (typeof ctx?.passThroughOnException === "function") ctx.passThroughOnException();
    }
  };

  const pEnv = persistentEnv(env);
  let immediateError = null;

  try {
    const returned = worker.scheduled(event, pEnv, wrappedCtx);
    if (returned && typeof returned.then === "function") tasks.push(Promise.resolve(returned));
  } catch (error) {
    immediateError = error;
  }

  const settled = immediateError
    ? []
    : await Promise.allSettled(tasks);

  const errors = [];
  if (immediateError) errors.push(String(immediateError?.message || immediateError));
  for (const item of settled) {
    if (item.status === "rejected") errors.push(String(item.reason?.message || item.reason || "scheduled task failed"));
  }

  if (!errors.length) {
    try {
      await migrateLegacyRows(env, CRON_MIGRATION_BATCH);
    } catch (error) {
      errors.push("migration: " + String(error?.message || error));
    }
  }

  await finishCronHeartbeat(env, lease, errors.length ? "error" : "ok", tasks.length, errors);
}

export default {
  fetch(request, env, ctx) {
    return worker.fetch(request, persistentEnv(env), ctx);
  },
  scheduled(event, env, ctx) {
    const run = runScheduledWithHeartbeat(event, env, ctx);
    if (ctx?.waitUntil) {
      ctx.waitUntil(run);
      return;
    }
    return run;
  }
};
