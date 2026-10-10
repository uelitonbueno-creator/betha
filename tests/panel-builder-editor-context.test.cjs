/* node tests/panel-builder-editor-context.test.cjs
 * Ensures the editor never sends saved-panel requests to a new entity
 * with stale system/definition state from a previously opened editor.
 */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../panel-builder-ui.js"),"utf8");
const start=source.indexOf("function sameContext(){");
const end=source.indexOf("async function requestDraft(",start);
assert(start>=0&&end>start,"Editor context validation functions unavailable");
const state={tenantId:"tenant-a",currentSystemId:"contabil"};
const context={tenantId:"tenant-a",currentSystemId:"contabil"};
const window={
 BI_CONFIG:{BACKEND_URL:"https://bi.example/"},
 BIVellaSearchContext:{getState:()=>state}
};
const {sameContext,remote}=new Function("window","context",source.slice(start,end)+"; return {sameContext,remote};")(window,context);
assert.equal(sameContext(),true);
assert.deepEqual(remote(),{endpoint:"https://bi.example/api/panel-drafts?system=contabil",tenant:"tenant-a"});
state.tenantId="tenant-b";
assert.equal(sameContext(),false);
assert.throws(remote,/entidade ou sistema mudou/);
state.tenantId="tenant-a";state.currentSystemId="compras";
assert.equal(sameContext(),false);
assert.throws(remote,/entidade ou sistema mudou/);
state.currentSystemId="contabil";
assert.equal(sameContext(),true);
window.BI_CONFIG.BACKEND_URL="";
assert.throws(remote,/Backend indisponível/);
assert.match(source,/options\(drafts,\[\["","Rascunhos salvos"\]\]\);drafts\._items=\[\]/,
 "Old draft titles must be cleared before loading a different tenant's drafts");
assert.match(source,/if\(generation!==previewRequest\|\|!sameContext\(\)/,
 "Late chart previews must be discarded after a tenant change");
console.log("Panel editor tenant/system context isolation passed.");
