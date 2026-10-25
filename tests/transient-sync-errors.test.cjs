const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("backend/entry-persistent.js", "utf8");
const start = source.indexOf("function isTransientSyncError(");
const end = source.indexOf("\nfunction requestedType(", start);
assert.ok(start >= 0 && end > start, "sync error classifier and normalization must exist");
const context = vm.runInNewContext(source.slice(start, end) + ";({isTransientSyncError,normalizeJob})");

test("KV 10001 is transient but Betha authentication errors are not", () => {
  assert.equal(context.isTransientSyncError("put: We encountered an internal error. Please try again. (10001)"), true);
  assert.equal(context.isTransientSyncError("BETHA_HTTP_500"), true);
  assert.equal(context.isTransientSyncError("BETHA_HTTP_429"), true);
  assert.equal(context.isTransientSyncError("BETHA_HTTP_401"), false);
  assert.equal(context.isTransientSyncError("BETHA_HTTP_403"), false);
  assert.equal(context.isTransientSyncError("put: forbidden (10001)"), false);
});

test("reopening KV transient errors preserves loaded rows and nextOffset", () => {
  const job = { state:"completed-with-warnings", completed:1, total:2,
    failures:[{source:"bi:debitos",error:"put: We encountered an internal error. Please try again. (10001)"}],
    sources:{
      "bi:debitos":{complete:false,error:"put: We encountered an internal error. Please try again. (10001)",loaded:156850,nextOffset:156850,retryCount:3,pageSize:250},
      "bi:imoveis":{complete:true,error:null,loaded:2098,nextOffset:null}
    }
  };
  const normalized = context.normalizeJob(job);
  assert.equal(normalized.state,"running");
  assert.equal(normalized.sources["bi:debitos"].error,null);
  assert.equal(normalized.sources["bi:debitos"].loaded,156850);
  assert.equal(normalized.sources["bi:debitos"].nextOffset,156850);
  assert.equal(normalized.sources["bi:debitos"].pageSize,50);
  assert.equal(normalized.sources["bi:imoveis"].loaded,2098);
  assert.equal(normalized.completed,1);
  assert.equal(normalized.failures.length,0);
});

test("401 remains an actionable authentication failure", () => {
  const job={state:"completed-with-warnings",total:1,completed:1,
    failures:[{source:"bi:pagamentos-parcelamentos",error:"BETHA_HTTP_401"}],
    sources:{"bi:pagamentos-parcelamentos":{complete:false,error:"BETHA_HTTP_401",loaded:0,nextOffset:0}}
  };
  const normalized=context.normalizeJob(job);
  assert.equal(normalized.sources["bi:pagamentos-parcelamentos"].error,"BETHA_HTTP_401");
  assert.equal(normalized.completed,1);
  assert.equal(normalized.failures.length,1);
});
