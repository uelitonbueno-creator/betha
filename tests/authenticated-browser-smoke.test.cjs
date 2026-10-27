const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const {spawn, spawnSync} = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const CHROME = ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']
  .map(name => { const p = spawnSync('which', [name], {encoding:'utf8'}); return p.status === 0 ? p.stdout.trim() : ''; })
  .find(Boolean);

function respond(res, body, type='text/plain', status=200) {
  res.writeHead(status, {'Content-Type':type, 'Cache-Control':'no-store'});
  res.end(body);
}
function json(res, data, status=200) { respond(res, JSON.stringify(data), 'application/json', status); }

function mockServer({realAuth=false}={}) {
  const server = http.createServer(async (req,res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    try {
      if (url.pathname === '/api/me/tenants') {
        return json(res, {tenants:[{
          id:'paulafreitas', name:'Paula Freitas', databaseId:'test-database', entityId:'test-entity',
          admin:true, technical:true, allowedViews:['contabil-visao-geral','contabil-empenhos','compras-visao-geral','compras-processos']
        }]});
      }
      if (realAuth && url.pathname === '/api/auth/session-check') {
        return json(res, {error:'USER_TOKEN_REQUIRED'}, 401);
      }
      if (url.pathname.startsWith('/api/')) {
        return json(res, {ok:true, tenant:'paulafreitas', period:{ano:2026}, kpis:{}, charts:{}, tables:[], meta:{source:'TEST_FIXTURE_ONLY'}});
      }
      if (url.pathname === '/auth/auth.js') {
        if (realAuth) {
          return respond(res, await fs.readFile(path.join(ROOT,'auth/auth.js'),'utf8'), 'application/javascript');
        }
        return respond(res, 'window.BIAuth={ready:Promise.resolve(true),isAuthenticated:()=>true,getToken:()=>"test-only-session",getError:()=>"",clear:()=>{},logout:()=>{}};', 'application/javascript');
      }
      if (url.pathname === '/config.js') {
        let source = await fs.readFile(path.join(ROOT,'config.js'),'utf8');
        source = source.replace(/BACKEND_URL:\s*"[^"]+"/, 'BACKEND_URL: "http://127.0.0.1:' + server.address().port + '"');
        return respond(res, source, 'application/javascript');
      }
      if (url.pathname === '/') {
        let html = await fs.readFile(path.join(ROOT,'index.html'),'utf8');
        html = html.replace(/<script type="module">[\s\S]*?<\/script>/, '<script>customElements.define("bth-app",class extends HTMLElement {});</script>');
        html = html.replace(/<script src="https:\/\/[^\"]+"><\/script>/g, '');
        html = html.replace(/<link[^>]+href="https:\/\/[^\"]+"[^>]*>/g, '');
        html = html.replace('</head>', "<script>window.__biBootErrors=[];window.addEventListener('error',e=>window.__biBootErrors.push(e.message));window.addEventListener('unhandledrejection',e=>window.__biBootErrors.push(String(e.reason)));</script></head>");
        html=html.replace('</body>', '<pre id="biBootErrors" hidden></pre><script>setInterval(()=>{document.getElementById("biBootErrors").textContent=JSON.stringify(window.__biBootErrors)},100)</script></body>');
        return respond(res, html, 'text/html');
      }
      const name = decodeURIComponent(url.pathname).replace(/^\/+/, '');
      const resolved = path.resolve(ROOT,name);
      if (!resolved.startsWith(ROOT + path.sep)) return respond(res,'Forbidden','text/plain',403);
      const data = await fs.readFile(resolved);
      const type = name.endsWith('.js') ? 'application/javascript' : name.endsWith('.css') ? 'text/css' : name.endsWith('.svg') ? 'image/svg+xml' : 'application/octet-stream';
      return respond(res,data,type);
    } catch (error) {
      return respond(res,'Not found','text/plain',404);
    }
  });
  return server;
}

function runChrome(url) {
  return new Promise((resolve,reject) => {
    const child = spawn(CHROME,[
      '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
      '--no-first-run','--no-default-browser-check','--virtual-time-budget=12000',
      '--dump-dom',url
    ],{stdio:['ignore','pipe','pipe']});
    let stdout='', stderr='';
    const timeout=setTimeout(()=>{child.kill('SIGKILL');reject(new Error('Chromium timed out: '+stderr.slice(-500)));},35000);
    child.stdout.on('data',chunk=>stdout+=chunk);
    child.stderr.on('data',chunk=>stderr+=chunk);
    child.on('error',error=>{clearTimeout(timeout);reject(error);});
    child.on('close',code=>{clearTimeout(timeout);if(code!==0)reject(new Error('Chromium '+code+': '+stderr.slice(-800)));else resolve(stdout);});
  });
}

test('authenticated startup opens Contabilidade and Compras without a blank screen (mock session, no production data)', {timeout:100000}, async () => {
  assert.ok(CHROME,'Chrome/Chromium is required for authenticated browser smoke');
  const mock=mockServer();
  await new Promise(resolve=>mock.listen(0,'127.0.0.1',resolve));
  try {
    for (const [system,view] of [['contabil','contabil-visao-geral'],['compras','compras-visao-geral']]) {
      const url='http://127.0.0.1:' + mock.address().port + '/?sistema=' + system + '&view=' + view;
      const html=await runChrome(url);
      const app=html.match(/<bth-app id="bethaApp"[^>]*>/);
      const auth=html.match(/<div id="authGate"[^>]*>/);
      const tenant=html.match(/<div id="tenantGate"[^>]*>/);
      assert.ok(app,system + ': app element missing ');
      assert.ok(auth?.[0].includes(' hidden'),system + ': login gate must remain hidden ');
      assert.ok(tenant?.[0].includes(' hidden'),system + ': tenant gate must be hidden after selecting authorized tenant ');
      assert.ok(!/style="[^"]*display:\s*none/.test(app[0]),system + ': application remains hidden ');
      assert.ok(html.includes('Paula Freitas'),system + ': authorized tenant was not selected ');
      const diagnostics=html.match(/<pre id="biBootErrors"[^>]*>([^<]*)<\/pre>/);
      assert.ok(diagnostics,system + ': browser diagnostics node missing');
      assert.deepEqual(JSON.parse(diagnostics[1] || '[]'),[],system + ': uncaught JavaScript errors');
    }
  } finally {
    await new Promise(resolve=>mock.close(resolve));
  }
});

test('failed Betha OAuth callback shows a useful login error instead of a blank screen (real auth.js)', {timeout:100000}, async () => {
  assert.ok(CHROME,'Chrome/Chromium is required for callback smoke');
  const mock=mockServer({realAuth:true});
  await new Promise(resolve=>mock.listen(0,'127.0.0.1',resolve));
  try {
    const html=await runChrome('http://127.0.0.1:'+mock.address().port+'/?auth_error=AUTH_HANDOFF_INVALID');
    const gate=html.match(/<div id="authGate"[^>]*>/);
    assert.ok(gate && !gate[0].includes(' hidden'),'login gate must be visible after OAuth failure');
    assert.match(html,/O retorno do login Betha não pôde ser validado/);
    assert.ok(!html.includes('auth_error=AUTH_HANDOFF_INVALID'),'OAuth callback query must be cleared');
    const diagnostics=html.match(/<pre id="biBootErrors"[^>]*>([^<]*)<\/pre>/);
    assert.ok(diagnostics,'browser diagnostics missing');
    assert.deepEqual(JSON.parse(diagnostics[1] || '[]'),[],'uncaught JavaScript errors');
  } finally {
    await new Promise(resolve=>mock.close(resolve));
  }
});
