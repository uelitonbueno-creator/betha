const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

test('BI Vella exposes four systems with generic groups and system-specific submenus',()=>{
  const context=vm.createContext({window:{BI_DASHBOARDS:{},BI_MENU:[]}});
  vm.runInContext(fs.readFileSync('system-catalog.js','utf8'),context);
  const systems=context.window.BI_SYSTEMS;
  assert.deepEqual(systems.map(x=>x.id),['tributos','contabil','compras','folha']);
  for(const system of systems){
    assert.deepEqual(system.menu.map(x=>x.descricao),['Início','Financeiro','Operações','Cadastros','Controle']);
    assert.equal(system.menu[0].rota,system.homeView);
  }
  assert.notDeepEqual(
    systems.find(x=>x.id==='contabil').menu[1].submenus.map(x=>x.descricao),
    systems.find(x=>x.id==='folha').menu[1].submenus.map(x=>x.descricao)
  );
});

test('local samples contain exactly 100 rows per new system',()=>{
  for(const system of ['contabil','compras','folha']){
    const doc=JSON.parse(fs.readFileSync('data/samples/'+system+'-100.json','utf8'));
    assert.equal(doc.mode,'sample');
    assert.equal(doc.system,system);
    assert.equal(doc.recordCount,100);
    assert.equal(doc.rows.length,100);
  }
});

test('new system home dashboards are connected to local samples',()=>{
  const context=vm.createContext({window:{BI_DASHBOARDS:{},BI_MENU:[]}});
  vm.runInContext(fs.readFileSync('system-catalog.js','utf8'),context);
  for(const system of context.window.BI_SYSTEMS.filter(x=>x.sampleMode)){
    const dashboard=context.window.BI_DASHBOARDS[system.homeView];
    assert.equal(dashboard.system,system.id);
    assert.ok(dashboard.localSample.file.endsWith(system.id+'-100.json'));
    assert.ok(dashboard.kpis.length>=3);
    assert.ok(dashboard.charts.length>=2);
  }
});

test('index loads system catalog before the app runtime',()=>{
  const html=fs.readFileSync('index.html','utf8');
  assert.ok(html.indexOf('system-catalog.js')>html.indexOf('dashboard-catalog.js'));
  assert.ok(html.indexOf('system-catalog.js')<html.indexOf('app.js'));
});
