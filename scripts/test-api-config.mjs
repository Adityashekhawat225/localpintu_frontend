import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { loadEnv } from 'vite';
for (const [app, port] of [['Frontend', 5031], ['admin', 8000]]) {
  const root = new URL(`../../${app}/`, import.meta.url);
  const source = await readFile(new URL('src/services/apiConfig.js', root), 'utf8');
  for (const mode of ['development', 'production', 'live']) {
    test(`${app}: ${mode} selects matching API, socket and image origin`, async () => {
      const env = { ...loadEnv(mode, decodeURIComponent(root.pathname).replace(/^\/(\w:)/, '$1'), 'VITE_'), DEV: mode !== 'production' };
      const code = source.replace('import.meta.env', JSON.stringify(env));
      const config = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
      const origin = mode === 'development' ? `http://localhost:${port}` : 'https://api.localpintu.com';
      assert.equal(config.API_BASE, `${origin}/api`);
      assert.equal(config.SOCKET_URL, origin);
      assert.equal(config.API_ORIGIN, origin);
    });
  }
}
