const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');
function harness() {
  const values=new Map();
  const c=vm.createContext({URL,URLSearchParams,Request,Response,Headers,TextEncoder,TextDecoder,AbortController,crypto:webcrypto,setTimeout,clearTimeout,console:{warn(){},error(){}},fetch:async()=>new Response(JSON.stringify({content:[],hasNext:false}))});
  vm.runInContext(fs.readFileSync('backend/worker.js','utf8').replace('export default {','globalThis.worker = {'),c);
  const kv={get:async key=>values.get(key)||null,put:async(key,value)=>values.set(key,value),list:async({prefix})=>({keys:[...values.keys()].filter(k=>k.startsWith(prefix)).map(name=>({name})),list_complete:true})};
  const initial={name:'Inicial',entityId:'1',databaseId:'10',userAccess:'legacy-access',accessToken:'legacy-token'};
  const env={BI_SESSIONS:kv,BETHA_TENANT_CONFIG_KEY:'test-encryption-key',BETHA_TENANTS_JSON:JSON.stringify({initial}),BETHA_ACCESS_TOKEN:'shared-token'};
  return {c,values,env};
}
test('tenant credentials are encrypted, bound to their tenant and overlaid on legacy configuration',async()=>{
  const {c,env,values}=harness();
  const config={name:'Nova prefeitura',entityId:'2',databaseId:'20',userAccess:'private-access',accessToken:'private-token'};
  const cipher=await c.encodeTenantConfig(env,'new-town',config);
  assert.ok(!cipher.includes('private-access')&&!cipher.includes('private-token'));
  await env.BI_SESSIONS.put('tenant-config:v1:new-town',cipher);
  const resolved=await c.resolveTenant(env,'new-town');
  assert.equal(resolved.accessToken,'private-token');
  assert.equal((await c.resolveTenant(env,'initial')).accessToken,'legacy-token');
  await assert.rejects(c.decodeTenantConfig(env,'other-town',cipher));
  const exposed=JSON.stringify(c.publicTenantConfig('new-town',config,env));
  assert.ok(!exposed.includes('private-access')&&!exposed.includes('private-token'));
  assert.equal(Object.keys(await c.tenantRegistry(env)).length,2);
});
test('blank secrets preserve saved keys; shared token is an explicit choice',()=>{
  const {c}=harness();
  const previous={userAccess:'keep-access',accessToken:'keep-token'};
  const input={id:'valid-town',name:'Cidade',entityId:'1',databaseId:'10',userAccess:'',accessToken:''};
  const result=c.validateTenantConfig(input,previous);
  assert.equal(result.config.accessToken,'keep-token');
  assert.equal(result.config.userAccess,'keep-access');
  assert.equal(c.validateTenantConfig({...input,useSharedToken:true},previous).config.accessToken,undefined);
  assert.throws(()=>c.validateTenantConfig({...input,id:'../invalid'},previous));
  assert.throws(()=>c.validateTenantConfig({...input,userAccess:'invalid\r\nheader'},previous));
  assert.throws(()=>c.requireTenantConfigAdmin({access:{constraints:['BIConfiguracoesPage']}}));
  c.requireTenantConfigAdmin({access:{technical:true}});
});
function mockAuth(c,admin=true) {
  c.getUserToken=async()=> 'session-token';
  c.getUserAccesses=async()=> [{entity:'1',database:'10',admin},{entity:'2',database:'20',admin}];
  c.authorizeTenant=async()=> ({userToken:'session-token',access:{admin},context:{entity:'1',database:'10'}});
  c.matchAccess=(accesses,context)=>accesses.find(a=>a.entity===context.entity&&a.database===context.database);
}
function entityRequest(body,path='/api/admin/entities',origin='https://uelitonbueno-creator.github.io') {
  return new Request('https://worker.test'+path,{method:'POST',headers:{'Content-Type':'application/json','X-Tenant-Id':'initial',Origin:origin},body:JSON.stringify(body)});
}
const newEntity={id:'new-town',name:'Nova prefeitura',entityId:'2',databaseId:'20',userAccess:'private-access',accessToken:'private-token'};
test('entity endpoints authorize both contexts, test without saving, and reject unsafe or invalid writes',async()=>{
  const {c,env,values}=harness();mockAuth(c);
  let response=await c.worker.fetch(entityRequest(newEntity,'/api/admin/entities/test'),env);
  assert.equal(response.status,200);assert.equal(values.size,0);
  response=await c.worker.fetch(entityRequest({...newEntity,entityId:'99'}),env);
  assert.equal(response.status,403);assert.equal(values.size,0);
  response=await c.worker.fetch(entityRequest(newEntity,'/api/admin/entities','https://untrusted.test'),env);
  assert.equal(response.status,403);assert.equal(values.size,0);
  c.bethaGet=async()=>{throw new Error('BETHA_HTTP_401');};
  response=await c.worker.fetch(entityRequest(newEntity),env);
  assert.equal(response.status,502);assert.equal(values.size,0);
  mockAuth(c,false);
  response=await c.worker.fetch(entityRequest(newEntity),env);
  assert.equal(response.status,403);assert.equal(values.size,0);
});
test('successful entity save persists keys privately and returns only safe metadata',async()=>{
  const {c,env,values}=harness();mockAuth(c);
  const response=await c.worker.fetch(entityRequest(newEntity),env);
  assert.equal(response.status,200);
  const body=await response.text();
  assert.ok(!body.includes('private-access')&&!body.includes('private-token'));
  assert.equal((await c.resolveTenant(env,'new-town')).name,'Nova prefeitura');
  assert.ok(values.get('tenant-config:v1:new-town'));
});
test('parcelas preserve history and require the actual parent relation, not a nested own ID',()=>{
  const {c}=harness();
  const url=new URL('https://worker.test?periodo=ano&exercicio=2026&parcelamentoId=128217');
  const rows=[{id:7,idParcelamentos:128217,dtVcto:'2024-03-10',vlParcela:20},{id:128217,idParcelamentos:9,dtVcto:'2026-04-10'},{id:8,parcelamento:{id:128217},dtVcto:'2027-03-10'}];
  const filtered=c.detailFilterRows('parcelamentos-parcelas',rows,url);
  assert.deepEqual(Array.from(filtered,r=>r.id),[7,8]);
  url.searchParams.set('detailDateField','vencimento');url.searchParams.set('detailFrom','2025-01-01');
  assert.deepEqual(Array.from(c.detailFilterRows('parcelamentos-parcelas',rows,url),r=>r.id),[8]);
});
test('analytic filters combine local search, source fields and parent geography without filtering cadastros by year',()=>{
  const {c}=harness();
  const rows=[{id:1,nome:'José',nomeCidade:'Cidade A',tipoPessoa:'FISICA',dhOperacao:'2024-01-01'},{id:2,nome:'Maria',nomeCidade:'Cidade B',tipoPessoa:'FISICA',dhOperacao:'2026-01-01'}];
  const url=new URL('https://worker.test?periodo=ano&exercicio=2026&cidade=Cidade+A&detailSearch=jose');
  assert.deepEqual(Array.from(c.detailFilterRows('contribuintes',rows,url),r=>r.id),[1]);
  url.searchParams.set('detailSearch','maria');
  assert.equal(c.detailFilterRows('contribuintes',rows,url).length,0);
});
test('all configured analytic sources have frontend support and a permission mapping',()=>{
  const {c}=harness();
  const defs=vm.runInContext('DETAIL_RESOURCES',c),permissions=vm.runInContext('DETAIL_PERMISSION_VIEWS',c);
  const front=fs.readFileSync('app.js','utf8');
  const supported=vm.runInNewContext(front.match(/const DETAIL_SUPPORTED = new Set\(([\s\S]*?)\);/)[0]+';DETAIL_SUPPORTED');
  for(const resource of Object.keys(defs)){assert.ok(supported.has(resource),resource);assert.ok(permissions[resource]?.length,resource);}
});
test('empty analytic pages expose continuation until a distant matching parcela is found',async()=>{
  const {c}=harness();
  c.fetch=async raw=>{
    const url=new URL(raw),offset=Number(url.searchParams.get('offset')),limit=Number(url.searchParams.get('limit'));
    const content=Array.from({length:Math.min(limit,130-offset)},(_,i)=>({id:offset+i,idParcelamentos:offset+i===125?128217:9,dtVcto:'2024-01-01',vlParcela:50}));
    return new Response(JSON.stringify({content,hasNext:offset+content.length<130,offset,total:130}));
  };
  const tenant={id:'test',name:'Test',accessToken:'token',userAccess:'access'};
  const url=new URL('https://worker.test?periodo=ano&exercicio=2026&parcelamentoId=128217');
  const first=await c.buildDetailPage({},tenant,'parcelamentos-parcelas',url);
  assert.equal(first.rows.length,0);assert.equal(first.pagination.searching,true);assert.equal(first.pagination.nextOffset,100);
  url.searchParams.set('offset','100');
  const second=await c.buildDetailPage({},tenant,'parcelamentos-parcelas',url);
  assert.equal(second.rows.length,1);assert.equal(second.rows[0].id,'125');assert.equal(second.pagination.hasMore,false);
});
test('client captures local analytic fields and drops unrelated parent filters on a linked child',()=>{
  const source=fs.readFileSync('app.js','utf8');
  const functionSource=source.slice(source.indexOf('  function detailRequestParams('),source.indexOf('  function analyticFilterControls('));
  const context=vm.createContext({URLSearchParams,Date,document:{getElementById:id=>({value:id==='periodo'?'ano':'2026'})},currentDashboardFilters:()=>({situacao:'ATIVO',bairro:'Centro'})});
  vm.runInContext(functionSource,context);
  const container={dataset:{relationKey:'parcelamentoId',relationValue:'128217'},querySelectorAll:()=>[{dataset:{detailParam:'detailSearch'},value:' 125 '},{dataset:{detailParam:'detailField'},value:'id'}]};
  const params=context.detailRequestParams(container,50,'');
  assert.equal(params.get('detailSearch'),'125');assert.equal(params.get('parcelamentoId'),'128217');assert.equal(params.get('periodo'),'todos');assert.equal(params.has('situacao'),false);assert.equal(params.has('bairro'),false);
  container.dataset={};
  const parent=context.detailRequestParams(container,0,'');assert.equal(parent.get('bairro'),'Centro');assert.equal(parent.get('situacao'),'ATIVO');
});
