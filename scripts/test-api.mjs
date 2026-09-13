import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (await readFile(new URL("../src/services/api.js", import.meta.url), "utf8"))
  .replace('import { API_BASE } from "./apiConfig";', 'const API_BASE = "http://localhost:5031/api";');

test("catalog requests share a fetch, cache success, and recover after errors", async () => {
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  globalThis.window = { location: { hostname: "localhost", origin: "http://localhost:5173" }, setTimeout: (fn) => setTimeout(fn, 0) };
  try {
    const { default: api } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      return new Response(JSON.stringify({ servicePlans: [{ _id: "plan" }] }), { status: 200 });
    };
    const [first, second] = await Promise.all([api.get("/service-plans"), api.get("/service-plans")]);
    assert.equal(calls, 1);
    assert.deepEqual(first, second);
    await api.get("/service-plans");
    assert.equal(calls, 1);

    calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      return new Response(JSON.stringify({ message: "Database failed" }), { status: 500 });
    };
    await assert.rejects(api.get("/child-services"), /Database failed/);
    assert.equal(calls, 1, "application errors must not be retried four times");
    globalThis.fetch = async () => {
      calls += 1;
      return new Response("{}", { status: 200 });
    };
    await api.get("/child-services");
    assert.equal(calls, 2, "a failed request must not poison the cache");

    calls = 0;
    globalThis.fetch = async () => new Response("{}", { status: ++calls === 1 ? 503 : 200 });
    await api.get("/service-categories");
    assert.equal(calls, 2);

    calls = 0;
    globalThis.fetch = async () => { calls += 1; return new Response("{}", { status: 503 }); };
    await assert.rejects(api.post("/bookings", {}), /503/);
    assert.equal(calls, 1, "booking mutations must never be retried automatically");
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.window = originalWindow;
  }
});
