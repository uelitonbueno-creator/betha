/* node tests/panel-placements-cancellation.test.cjs */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../panel-placements.js"),"utf8");
const start=source.indexOf("function cancelPending(){"),end=source.indexOf("function clear(){",start);
assert(start>=0&&end>start,"Cancellation helper not found");
const controller={aborted:false,abort(){this.aborted=true;}};
const result=new Function("controller",
 "let activeController=controller;"+source.slice(start,end)+
 ";cancelPending();return {controller,activeController};")(controller);
assert.equal(result.controller.aborted,true,"Pending request must be aborted");
assert.equal(result.activeController,null,"Controller must be released");
const reload=source.slice(source.indexOf("async function reload(c){"),source.indexOf("function refresh(){"));
assert.match(reload,/cancelPending\(\)/,"Reload cancels old context");
assert.match(reload,/signal:controller\.signal/,"Preview and drafts use abort signals");
assert.match(source,/if\(!c\)\{generation\+\+;cancelPending\(\)/,
 "No authorized context must cancel requests");
console.log("Obsolete panel preview requests cancellation passed.");
