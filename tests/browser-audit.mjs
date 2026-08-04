import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { createServer } from "node:net";

const args = parseArgs(process.argv.slice(2));
const url = args.url || "http://127.0.0.1:4174/hanbot/?lang=pt-BR";
const width = Number(args.width || 1440);
const height = Number(args.height || 1000);
const screenshotPath = args.screenshot ? resolve(args.screenshot) : null;
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = await openPort();
const profilePath = join(tmpdir(), `riftreborn-audit-${randomUUID()}`);
let browser;

try {
  browser = spawn(chromePath, [
    "--headless=new",
    "--disable-background-networking",
    "--disable-component-update",
    "--disable-extensions",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-default-browser-check",
    "--no-first-run",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profilePath}`,
    "about:blank",
  ], { stdio: "ignore", windowsHide: true });

  await waitForChrome(port);
  const page = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: "PUT" }).then(checkResponse).then((response) => response.json());
  const cdp = connect(page.webSocketDebuggerUrl);
  const runtimeExceptions = [];
  const logErrors = [];

  cdp.on("Runtime.exceptionThrown", (params) => {
    runtimeExceptions.push(params.exceptionDetails?.text || "Runtime exception");
  });
  cdp.on("Log.entryAdded", (params) => {
    if (["error", "warning"].includes(params.entry?.level)) logErrors.push(params.entry.text);
  });

  await cdp.ready;
  await Promise.all([
    cdp.send("Page.enable"),
    cdp.send("Runtime.enable"),
    cdp.send("Log.enable"),
    cdp.send("Network.enable"),
  ]);
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width <= 760,
    screenWidth: width,
    screenHeight: height,
  });
  await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: width <= 760 });

  const loaded = cdp.waitFor("Page.loadEventFired", 10000);
  await cdp.send("Page.navigate", { url });
  await loaded;
  await waitForReady(cdp);

  const initial = await evaluate(cdp, collectMetrics);
  let interaction = null;
  if (args.interact !== "false") {
    interaction = await evaluate(cdp, () => {
      document.querySelector('[data-champion-select="graves"]')?.click();
      document.querySelector('[data-champion-select="ezreal"]')?.click();
      document.querySelector('[data-ability-select="r"]')?.click();
      const locale = document.querySelector("[data-language]");
      if (locale) {
        locale.value = "zh-CN";
        locale.dispatchEvent(new Event("change", { bubbles: true }));
      }
      return new Promise((resolve) => setTimeout(() => resolve({
        champion: document.documentElement.dataset.champion,
        language: document.documentElement.lang,
        abilityName: document.querySelector("[data-ability-name]")?.textContent?.trim(),
        selectedTabs: document.querySelectorAll('[role="tab"][aria-selected="true"]').length,
        url: location.href,
      }), 750));
    }, true);
  }

  const afterInteraction = await evaluate(cdp, collectMetrics);
  let scrollResult = null;

  if (args.scroll) {
    const scroll = await cdp.send("Runtime.evaluate", {
      expression: `(() => {
        const target = document.querySelector(${JSON.stringify(args.scroll)});
        if (!target) return { found: false, scrollY: window.scrollY };
        const top = target.getBoundingClientRect().top + window.scrollY - 88;
        window.scrollTo({ top, behavior: "instant" });
        return { found: true, targetTop: Math.round(top), scrollY: Math.round(window.scrollY) };
      })()`,
      returnByValue: true,
    });
    scrollResult = scroll.result?.value;
    await evaluate(cdp, () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))), true);
  }

  if (screenshotPath) {
    mkdirSync(dirname(screenshotPath), { recursive: true });
    const metrics = await cdp.send("Page.getLayoutMetrics");
    const viewport = metrics.cssLayoutViewport || metrics.layoutViewport;
    const format = /\.jpe?g$/i.test(screenshotPath) ? "jpeg" : "png";
    const capture = await cdp.send("Page.captureScreenshot", {
      format,
      quality: format === "jpeg" ? 88 : undefined,
      fromSurface: true,
      captureBeyondViewport: true,
      clip: {
        x: viewport.pageX,
        y: viewport.pageY,
        width: viewport.clientWidth,
        height: viewport.clientHeight,
        scale: 1,
      },
    });
    writeFileSync(screenshotPath, Buffer.from(capture.data, "base64"));
  }

  console.log(JSON.stringify({
    url,
    viewport: { width, height },
    initial,
    interaction,
    afterInteraction,
    scrollResult,
    console: { runtimeExceptions, logErrors },
    screenshot: screenshotPath,
  }, null, 2));

  cdp.close();
} finally {
  await stopBrowser(browser);
  await removeProfile(profilePath);
}

function parseArgs(values) {
  const parsed = {};
  for (let index = 0; index < values.length; index += 2) {
    const key = values[index]?.replace(/^--/, "");
    if (key) parsed[key] = values[index + 1];
  }
  return parsed;
}

function openPort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolvePort(address.port));
    });
  });
}

async function waitForChrome(debugPort) {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`);
      if (response.ok) return;
    } catch (_error) {
      // Chrome has not opened the debugging endpoint yet.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 80));
  }
  throw new Error("Chrome DevTools endpoint did not start.");
}

function checkResponse(response) {
  if (!response.ok) throw new Error(`Browser endpoint returned HTTP ${response.status}.`);
  return response;
}

async function stopBrowser(process) {
  if (!process || process.exitCode !== null) return;
  const exited = new Promise((resolveExit) => process.once("exit", resolveExit));
  process.kill();
  await Promise.race([exited, new Promise((resolveWait) => setTimeout(resolveWait, 2000))]);
}

async function removeProfile(path) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      rmSync(path, { recursive: true, force: true, maxRetries: 2, retryDelay: 80 });
      return;
    } catch (error) {
      if (attempt === 7) throw error;
      await new Promise((resolveWait) => setTimeout(resolveWait, 120));
    }
  }
}

function connect(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  const pending = new Map();
  const listeners = new Map();
  let messageId = 0;

  const ready = new Promise((resolveReady, reject) => {
    socket.addEventListener("open", resolveReady, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const request = pending.get(message.id);
      if (!request) return;
      pending.delete(message.id);
      if (message.error) request.reject(new Error(message.error.message));
      else request.resolve(message.result || {});
      return;
    }

    const handlers = listeners.get(message.method) || [];
    handlers.forEach((handler) => handler(message.params || {}));
  });

  function send(method, params = {}) {
    return new Promise((resolveSend, reject) => {
      const id = ++messageId;
      pending.set(id, { resolve: resolveSend, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }

  function on(method, handler) {
    const handlers = listeners.get(method) || [];
    handlers.push(handler);
    listeners.set(method, handlers);
  }

  function waitFor(method, timeout) {
    return new Promise((resolveEvent, reject) => {
      const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${method}.`)), timeout);
      on(method, (params) => {
        clearTimeout(timer);
        resolveEvent(params);
      });
    });
  }

  return { ready, send, on, waitFor, close: () => socket.close() };
}

async function waitForReady(cdp) {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    const ready = await evaluate(cdp, () => ({
      state: document.readyState,
      content: Boolean(window.RIFTREBORN_CONTENT),
      tabs: document.querySelectorAll("[data-ability-select]").length,
      fonts: document.fonts?.status,
    }));
    if (ready.state === "complete" && ready.content && ready.tabs === 6 && ready.fonts === "loaded") {
      await new Promise((resolveWait) => setTimeout(resolveWait, 250));
      return;
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 80));
  }
  throw new Error("Page did not reach the expected interactive state.");
}

async function evaluate(cdp, expression, awaitPromise = false) {
  const result = await cdp.send("Runtime.evaluate", {
    expression: `(${expression.toString()})()`,
    awaitPromise,
    returnByValue: true,
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "Browser evaluation failed.");
  return result.result?.value;
}

function collectMetrics() {
  const resources = performance.getEntriesByType("resource");
  const elements = Array.from(document.querySelectorAll("h1, h2, h3, h4, p, a, button, select"))
    .filter((element) => !element.matches(".roster-entry"));
  return {
    title: document.title,
    language: document.documentElement.lang,
    champion: document.documentElement.dataset.champion,
    viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
    document: {
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    },
    textOverflowElements: elements
      .filter((element) => element.scrollWidth > element.clientWidth + 1)
      .map((element) => ({ tag: element.tagName, className: element.className, text: element.textContent?.trim().slice(0, 80) })),
    failedResources: resources
      .filter((resource) => Number(resource.responseStatus || 0) >= 400)
      .map((resource) => ({ name: resource.name, status: resource.responseStatus })),
    releaseHeadingTop: Math.round(document.querySelector("#release-title")?.getBoundingClientRect().top || 0),
    selectedTabs: document.querySelectorAll('[role="tab"][aria-selected="true"]').length,
  };
}
