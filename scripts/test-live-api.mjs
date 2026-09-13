import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';
const root = resolve(import.meta.dirname, '../..');
const base = 'https://api.localpintu.com';
const results = [];
for (const path of ['/api/appliance-services', '/api/service-categories', '/api/child-services', '/api/service-plans', '/api/products', '/api/pricing-settings', '/api/blogs', '/api/blogs/latest', '/api/offers', '/api/states', '/api/cities', '/api/areas', '/api/pincodes']) {
  try {
    const res = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(20000) });
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /json/);
    await res.json();
    results.push({ check: path, passed: true });
  } catch (error) { results.push({ check: path, passed: false, error: error.message }); }
}
for (const origin of ['https://localpintu.com', 'https://admin.localpintu.com', 'http://localhost:5173', 'http://localhost:5174']) {
  try {
    const res = await fetch(`${base}/api/appliance-services`, { method: 'OPTIONS', headers: { Origin: origin, 'Access-Control-Request-Method': 'GET', 'Access-Control-Request-Headers': 'authorization,content-type,cache-control' }, signal: AbortSignal.timeout(20000) });
    assert.ok(res.ok);
    assert.equal(res.headers.get('access-control-allow-origin'), origin);
    results.push({ check: `CORS ${origin}`, passed: true });
  } catch (error) { results.push({ check: `CORS ${origin}`, passed: false, error: error.message }); }
}
try {
  const res = await fetch(`${base}/socket.io/?EIO=4&transport=polling`, { signal: AbortSignal.timeout(20000) });
  assert.equal(res.status, 200);
  assert.match(await res.text(), /^0\{/);
  results.push({ check: 'Socket.IO transport handshake', passed: true });
} catch (error) { results.push({ check: 'Socket.IO transport handshake', passed: false, error: error.message }); }
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-first-run'] });
try {
  for (const [app, port, paths] of [['Frontend', 4178, ['/', '/blogs', '/login', '/cart']], ['admin', 4179, ['/login']]]) {
    const { preview } = await import(pathToFileURL(resolve(root, app, 'node_modules/vite/dist/node/index.js')));
    const server = await preview({ root: resolve(root, app), preview: { host: '127.0.0.1', port, strictPort: true }, logLevel: 'error' });
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 390, height: 844 });
      for (const path of paths) {
        const errors = [], apiResponses = [], wrongBackend = [];
        const onError = error => errors.push(error.message);
        const onResponse = response => { if (response.url().startsWith(`${base}/api/`)) apiResponses.push({ path: new URL(response.url()).pathname, status: response.status() }); };
        const onRequest = request => { const url = new URL(request.url()); if (url.hostname.endsWith('.onrender.com') || (['localhost', '127.0.0.1'].includes(url.hostname) && ['5031', '8000'].includes(url.port))) wrongBackend.push(url.origin); };
        page.on('pageerror', onError); page.on('response', onResponse); page.on('request', onRequest);
        try {
          await page.goto(`http://127.0.0.1:${port}${path}`, { waitUntil: 'networkidle2', timeout: 30000 });
          const visibleText = await page.evaluate(() => document.body.innerText.trim().length);
          assert.ok(visibleText > 20);
          assert.deepEqual(errors, []);
          assert.deepEqual(wrongBackend, []);
          assert.ok(apiResponses.every(res => res.status < 400));
          if (app === 'Frontend' && path === '/') assert.ok(apiResponses.length > 0, 'No live API calls observed');
          // Exercise browser CORS on both apps, including the admin JSON/auth preflight.
          const status = await page.evaluate(async (url) => (await fetch(url, { headers: { 'Content-Type': 'application/json' } })).status, `${base}/api/appliance-services`);
          assert.equal(status, 200);
          results.push({ check: `${app} browser ${path}`, passed: true, apiResponses });
        } catch (error) { results.push({ check: `${app} browser ${path}`, passed: false, error: error.message, errors, apiResponses, wrongBackend }); }
        page.off('pageerror', onError); page.off('response', onResponse); page.off('request', onRequest);
      }
      await page.close();
    } finally { await new Promise(resolve => server.httpServer.close(resolve)); }
  }
} finally { await browser.close(); }
await mkdir(resolve(root, 'Frontend/reports'), { recursive: true });
await writeFile(resolve(root, 'Frontend/reports/api-domain-verification.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify({ total: results.length, passed: results.filter(x => x.passed).length, failures: results.filter(x => !x.passed) }, null, 2));
if (results.some(x => !x.passed)) process.exitCode = 1;
