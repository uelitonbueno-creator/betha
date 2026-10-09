/* Execute: node tests/panel-builder-core.test.cjs */
const assert=require("node:assert/strict");
const core=require("../panel-builder-core.js");
const catalog=[{id:"bi:pagamentos",systemId:"tributos",fields:[
  {id:"mes",type:"string",dimension:true,filterable:true},
  {id:"valor",type:"number",measure:true,filterable:true},
  {id:"situacao",type:"string",dimension:true,filterable:true}
]}];
const context={tenantId:"paula-freitas",systemId:"tributos"};
const definition={title:"Arrecadação por mês",sourceId:"bi:pagamentos",type:"bar",
  dimension:"mes",measures:[{field:"valor",aggregation:"sum"},{field:"*",aggregation:"count"}],
  filters:[{field:"situacao",op:"eq",value:"PAGO"}]};
const rows=[{mes:"Jan",valor:30,situacao:"PAGO"},{mes:"Jan",valor:20,situacao:"PAGO"},
  {mes:"Fev",valor:10,situacao:"PAGO"},{mes:"Jan",valor:90,situacao:"ABERTO"}];
assert.equal(core.validate(definition,catalog,context).ok,true);
assert.deepEqual(core.aggregate(rows,definition,catalog,context),[
  {dimension:"Jan",values:[50,2]},{dimension:"Fev",values:[10,1]}
]);
assert.equal(core.validate({...definition,sourceId:"outro"},catalog,context).ok,false);
assert.equal(core.validate(definition,catalog,{tenantId:"x",systemId:"compras"}).ok,false);
assert.equal(core.validate({...definition,measures:[{field:"segredo",aggregation:"sum"}]},catalog,context).ok,false);
assert.equal(core.validate({...definition,filters:[{field:"segredo",op:"eq",value:"x"}]},catalog,context).ok,false);
assert.equal(core.readField({a:{b:1}},"a.b"),1);
assert.equal(core.readField({},"constructor"),undefined);
assert.equal(core.validate({...definition,type:"javascript"},catalog,context).ok,false);
assert.throws(()=>core.aggregate(new Array(50001).fill({}),definition,catalog,context),/50.000/);
console.log("Panel builder core: 9 verificações passaram.");
