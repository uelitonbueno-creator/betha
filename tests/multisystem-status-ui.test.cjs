/* node --test tests/multisystem-status-ui.test.cjs */
"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const app=fs.readFileSync(path.join(__dirname,"../app.js"),"utf8");
const html=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");
const css=fs.readFileSync(path.join(__dirname,"../style.css"),"utf8");

test("admin has an accessible multi-system status table",()=>{
  for(const id of ["refreshMultiSystemStatusButton","multiSystemLoadMessage","multiSystemLoadRows"]){
    assert.match(html,new RegExp('id="'+id+'"'));
  }
  assert.match(html,/aria-label="Situação das cargas por fonte"/);
  assert.match(css,/\.bi-multisystem-table-scroll\{[^}]*overflow-x:auto/);
});

test("status refresh is read-only, scoped to selected tenant and escaped",()=>{
  const a=app.indexOf("async function refreshMultiSystemLoads(){");
  const b=app.indexOf("document.getElementById('refreshMultiSystemStatusButton').addEventListener(",a);
  assert.ok(a>0&&b>a);
  const fn=app.slice(a,b);
  assert.match(fn,/api\('\/api\/admin\/multisystem-loads\?entity='/);
  assert.match(fn,/encodeURIComponent\(selected\)/);
  assert.match(fn,/form\.elements\.id\.value\.trim\(\)!==selected/);
  assert.match(fn,/cell\.textContent=value/);
  assert.match(fn,/body\.replaceChildren\(\)/);
  assert.doesNotMatch(fn,/\.innerHTML\s*=/);
  assert.doesNotMatch(fn,/method:\s*['"]POST['"]|method:\s*['"]PUT['"]/);
});

test("tenant changes refresh multi-system status without restarting the load",()=>{
  const a=app.indexOf("function resetEntitySettings(record=null)");
  const b=app.indexOf("async function loadEntitySettings()",a);
  const fn=app.slice(a,b);
  assert.match(fn,/if\(record\)\{\s*entitySyncAction\(\);\s*refreshMultiSystemLoads\(\);/);
  assert.match(fn,/multiSystemLoadRows"\)\.replaceChildren\(\)/);
});
