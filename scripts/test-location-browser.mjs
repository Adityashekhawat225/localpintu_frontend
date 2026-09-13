const browserUrl = process.env.CDP_URL || "ws://127.0.0.1:9223/devtools/browser";

const connect = (url) => new Promise((resolve, reject) => {
  const ws = new WebSocket(url);
  ws.addEventListener("open", () => resolve(ws));
  ws.addEventListener("error", reject);
});

const client = (ws) => {
  let id = 0;
  const pending = new Map();
  const events = [];
  ws.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message)); else resolve(message.result);
    } else events.push(message);
  });
  return {
    events,
    send(method, params = {}) {
      const requestId = ++id;
      ws.send(JSON.stringify({ id: requestId, method, params }));
      return new Promise((resolve, reject) => pending.set(requestId, { resolve, reject }));
    },
  };
};

const version = await fetch("http://127.0.0.1:9223/json/version").then((response) => response.json());
const browser = client(await connect(version.webSocketDebuggerUrl || browserUrl));
await browser.send("Browser.grantPermissions", { origin: "http://localhost:5173", permissions: ["geolocation"] });
const { targetId } = await browser.send("Target.createTarget", { url: "about:blank" });
const targets = await fetch("http://127.0.0.1:9223/json/list").then((response) => response.json());
const target = targets.find((item) => item.id === targetId);
if (!target?.webSocketDebuggerUrl) throw new Error("Chrome page target was not created");
const page = client(await connect(target.webSocketDebuggerUrl));
await Promise.all([page.send("Runtime.enable"), page.send("Network.enable"), page.send("Page.enable")]);
await page.send("Emulation.setGeolocationOverride", { latitude: 26.85426680260981, longitude: 75.72345425344606, accuracy: 159 });
await page.send("Page.navigate", { url: "http://localhost:5173/" });
await new Promise((resolve) => setTimeout(resolve, 5000));
await page.send("Runtime.evaluate", { expression: `document.querySelector('.discovery-location')?.click()` });
await new Promise((resolve) => setTimeout(resolve, 500));
await page.send("Runtime.evaluate", { expression: `document.querySelector('.nav-use-location')?.click()` });
await new Promise((resolve) => setTimeout(resolve, 9000));
const gpsResult = await page.send("Runtime.evaluate", {
  expression: `JSON.stringify({
    title: document.title,
    address: document.querySelector('.nav-location-address')?.value || '',
    error: document.querySelector('.nav-location-dialog > p')?.textContent || '',
    trigger: document.querySelector('.discovery-location')?.textContent?.replace(/\\s+/g,' ').trim() || '',
    stored: JSON.parse(localStorage.getItem('localpintu-location') || 'null')
  })`,
  returnByValue: true,
});
await page.send("Runtime.evaluate", { expression: `(() => {
  const input = document.querySelector('.nav-location-address');
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
  setter.call(input, 'Virasat Homes, Narayan Vihar, Jaipur, Rajasthan, 302026');
  input.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
})()` });
await new Promise((resolve) => setTimeout(resolve, 300));
await page.send("Runtime.evaluate", { expression: `document.querySelector('.nav-save-location')?.click()` });
await new Promise((resolve) => setTimeout(resolve, 2500));
const savedResult = await page.send("Runtime.evaluate", {
  expression: `JSON.stringify({
    address: document.querySelector('.discovery-location')?.textContent?.replace(/\\s+/g,' ').trim() || '',
    stored: JSON.parse(localStorage.getItem('localpintu-location') || 'null')
  })`,
  returnByValue: true,
});
await page.send("Page.reload", { ignoreCache: true });
await new Promise((resolve) => setTimeout(resolve, 5000));
const refreshedResult = await page.send("Runtime.evaluate", {
  expression: `JSON.stringify({
    address: document.querySelector('.discovery-location')?.textContent?.replace(/\\s+/g,' ').trim() || '',
    stored: JSON.parse(localStorage.getItem('localpintu-location') || 'null')
  })`,
  returnByValue: true,
});
const consoleErrors = page.events.filter((event) => event.method === "Runtime.consoleAPICalled" && event.params.type === "error").length;
const failedRequests = page.events.filter((event) => event.method === "Network.loadingFailed").map((event) => event.params.errorText);
console.log(JSON.stringify({ gps: JSON.parse(gpsResult.result.value), saved: JSON.parse(savedResult.result.value), refreshed: JSON.parse(refreshedResult.result.value), consoleErrors, failedRequests }, null, 2));
await browser.send("Target.closeTarget", { targetId });
