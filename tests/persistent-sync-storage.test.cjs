const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("backend/entry-persistent.js", "utf8");
const start = source.indexOf("function durableSessions(env) {");
const end = source.indexOf("\nfunction persistentEnv(env)", start);
assert.ok(start >= 0 && end > start, "durableSessions should be present");

function makeSessions({ withD1 = true, withR2 = true } = {}) {
  const d1 = new Map();
  const d1Writes = [];
  const r2Writes = [];
  const kvWrites = [];
  const kv = {
    async get() { return null; },
    async put(key, value) { kvWrites.push({ key, value }); }
  };
  const AUTH_DB = withD1 ? {
    prepare(sql) {
      return {
        bind(...params) {
          return {
            async run() {
              d1Writes.push({ sql, params });
              d1.set(params[0], params[1]);
            },
            async first() {
              const payload = d1.get(params[0]);
              return payload == null ? null : { payload };
            }
          };
        }
      };
    }
  } : null;
  const BI_SYNC_RAW = withR2 ? {
    async put(key, value) { r2Writes.push({ key, value }); },
    async get() { return null; }
  } : null;
  const context = {
    JSON,
    Date,
    console,
    ensureDurableSchema: async () => {},
    normalizeJob: value => value,
    isRowKey: key => String(key).includes(":rows:"),
    isSyncKey: key => String(key).startsWith("bi-sync:v1:"),
    isJobKey: key => String(key).includes(":job:"),
    requestedType: value => typeof value === "string" ? value : value?.type || "text",
    decodeValue: value => value,
    rawObjectKey: key => "raw/" + key,
    readLegacyRowFromD1: async () => null,
    durableKey: key => key,
    removeLegacyRowFromD1: async () => {}
  };
  const durableSessions = vm.runInNewContext(
    source.slice(start, end) + "; durableSessions",
    context
  );
  return { sessions: durableSessions({ BI_SESSIONS: kv, AUTH_DB, BI_SYNC_RAW }), d1, d1Writes, r2Writes, kvWrites };
}

test("sync metadata is written durably without spending another KV write", async () => {
  const { sessions, d1, d1Writes, kvWrites } = makeSessions();
  const key = "bi-sync:v1:tenant-hash:config";

  await sessions.put(key, JSON.stringify({ activeJob: "job-id" }), { expirationTtl: 604800 });

  assert.equal(d1Writes.length, 1);
  assert.equal(d1.get(key), JSON.stringify({ activeJob: "job-id" }));
  assert.equal(kvWrites.length, 0);
});

test("sync row pages are written to R2 without spending another KV write", async () => {
  const { sessions, r2Writes, kvWrites } = makeSessions();
  const key = "bi-sync:v1:tenant-hash:rows:job-id:bi:pagamentos:0";

  await sessions.put(key, JSON.stringify([{ id: 1 }]), { expirationTtl: 604800 });

  assert.deepEqual(r2Writes, [{ key: "raw/" + key, value: JSON.stringify([{ id: 1 }]) }]);
  assert.equal(kvWrites.length, 0);
});

test("ordinary session writes and sync rows without R2 keep the KV fallback", async () => {
  const withR2 = makeSessions();
  await withR2.sessions.put("auth-session:abc", "session", { expirationTtl: 3600 });
  assert.deepEqual(withR2.kvWrites, [{ key: "auth-session:abc", value: "session" }]);

  const withoutR2 = makeSessions({ withR2: false });
  const rowKey = "bi-sync:v1:tenant-hash:rows:job-id:bi:pagamentos:0";
  await withoutR2.sessions.put(rowKey, "[]", { expirationTtl: 604800 });
  assert.deepEqual(withoutR2.kvWrites, [{ key: rowKey, value: "[]" }]);
});
