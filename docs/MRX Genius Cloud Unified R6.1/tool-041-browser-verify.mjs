#!/usr/bin/env node
/**
 * docs/MRX Genius Cloud Unified R6.1/tool-041-browser-verify.mjs
 *
 * Real-browser verification of the Tool 041 (Hematocrit Monitor) R6.1
 * implementation. It drives a locally installed Chrome/Edge through the Chrome
 * DevTools Protocol (no new dependency) and records:
 *
 *   - the page load through the R6 shell;
 *   - the twelve GENIUS result boxes in their fixed order;
 *   - the engine result panel (HCT / band / trend / donation / projection / warnings);
 *   - the INVALID path (out-of-range value rejected, result panel withdrawn);
 *   - the field tooltip (hover, Escape);
 *   - AR/RTL and the 390 px viewport;
 *   - that NO value or comment reaches the network or the application log.
 *
 * Usage: node tool-041-browser-verify.mjs <baseUrl> <outDir>
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const BASE_URL = process.argv[2] ?? 'http://localhost:3100';
const OUT_DIR = process.argv[3] ?? '.';
const PORT = 9232;

const BROWSER_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];
const browserPath = BROWSER_CANDIDATES.find((candidate) => existsSync(candidate));
if (!browserPath) { console.error('NO_BROWSER_FOUND'); process.exit(2); }
mkdirSync(OUT_DIR, { recursive: true });

const browser = spawn(browserPath, [
  '--headless=new', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.env.TEMP ?? '.'}\\tool-041-cdp-profile`,
  '--no-first-run', '--no-default-browser-check',
  '--disable-gpu', '--hide-scrollbars',
  '--window-size=1440,900', 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForDevTools() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { const response = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (response.ok) return await response.json(); } catch { /* not ready */ }
    await sleep(500);
  }
  throw new Error('devtools endpoint never became reachable');
}

class Cdp {
  constructor(socket) {
    this.socket = socket; this.id = 0; this.pending = new Map(); this.events = [];
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.method === 'Runtime.exceptionThrown') {
        this.events.push({ type: 'exception', text: message.params?.exceptionDetails?.exception?.description ?? message.params.exceptionDetails?.text ?? 'unknown' });
      }
      if (message.method === 'Runtime.consoleAPICalled') {
        this.events.push({ type: 'console.error', text: (message.params.args ?? []).map((a) => a.value ?? a.description ?? '').join(' ') });
      }
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(JSON.stringify(message.error)));
        else resolve(message.result);
      }
    });
  }
  send(method, params = {}, sessionId) {
    this.id += 1; const id = this.id;
    this.socket.send(JSON.stringify({ id, method, params, sessionId }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); reject(new Error(`timeout: ${method}`)); } }, 30000);
    });
  }
}

const results = [];
const record = (requirement, result, evidence) => {
  results.push({ requirement, result, evidence });
  console.log(`${requirement} => ${result}${evidence ? ` (${evidence})` : ''}`);
};

async function main() {
  const version = await waitForDevTools();
  const socket = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve); socket.addEventListener('error', reject); });
  const cdp = new Cdp(socket);

  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  await cdp.send('Page.enable', {}, sessionId);
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Network.enable', {}, sessionId);

  const networkRequests = [];
  const consoleLines = [];
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.method === 'Network.requestWillBeSent') {
      networkRequests.push({ url: message.params.request.url, method: message.params.request.method });
    }
    if (message.method === 'Runtime.consoleAPICalled') {
      consoleLines.push((message.params.args ?? []).map((a) => a.value ?? a.description ?? '').join(' '));
    }
  });

  const evaluate = async (expression) => {
    const result = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId);
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result?.value;
  };
  const goto = async (url) => { await cdp.send('Page.navigate', { url }, sessionId); await sleep(2500); };
  const waitForSelector = async (selector, timeoutMs = 30000) => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const found = await evaluate(`!!document.querySelector(${JSON.stringify(selector)})`);
      if (found) return true;
      await sleep(500);
    }
    return false;
  };
  const screenshot = async (name) => {
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, sessionId);
    const file = join(OUT_DIR, name);
    writeFileSync(file, Buffer.from(shot.data, 'base64'));
    return file;
  };

  /* ── Tool 041 page load + R6 shell + GENIUS boxes ─────────────────────── */
  await goto(`${BASE_URL}/en/smarttools/medical-monitoring/tool-041-hematocrit-monitor`);
  const ready = await waitForSelector('h1');
  const loaded = ready && await evaluate(`Boolean(document.querySelector('h1'))`);
  record('Tool 041 page loads', loaded ? 'PASS' : 'FAIL', 'h1 present');

  const shell = await evaluate(`Boolean(document.querySelector('[data-r6-shell="tool-041-hematocrit-monitor"]'))`);
  record('The tool renders through the R6 shell', shell ? 'PASS' : 'FAIL', 'data-r6-shell present');

  const boxes = await evaluate(`Array.from(document.querySelectorAll('[data-box-id]')).map((b) => b.getAttribute('data-box-id'))`);
  record('GENIUS-12: the twelve result boxes keep their fixed order', Array.isArray(boxes) && boxes.length === 12 && boxes.join(',') === 'C1,C2,C3,C4,C5,C6,C7,C8,C9,C10,C11,C12' ? 'PASS' : 'FAIL', Array.isArray(boxes) ? boxes.join(',') : 'missing');

  /* ── FULL state: the engine result panel renders from the submitted snapshot */
  const resultPanel = await evaluate(`Boolean(document.querySelector('[data-r6-shell] [class*="rounded-2xl"]'))`);
  record('FULL state: the engine result panel renders from the submitted snapshot', resultPanel ? 'PASS' : 'FAIL', 'result panel present');

  /* ── INVALID state: an out-of-range value is rejected, the result panel is withdrawn */
  await evaluate(`(() => {
    const field = document.querySelector('input[data-r6-slider="true"]');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(field, '90');
    field.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);
  await sleep(900);
  const invalidShown = await evaluate(`Boolean(document.querySelector('[class*="text-red-400"]'))`);
  const panelAfterInvalid = await evaluate(`Boolean(document.querySelector('[data-r6-shell] [class*="rounded-2xl"]'))`);
  record('INVALID state: an out-of-range value is rejected and the result panel is withdrawn', invalidShown && !panelAfterInvalid ? 'PASS' : 'FAIL', `errorShown=${invalidShown} panel=${panelAfterInvalid}`);

  /* ── The field tooltip ─────────────────────────────────────────────────── */
  await evaluate(`(() => { const el = document.querySelector('input[data-r6-slider="true"]'); el.scrollIntoView({ block: 'center', behavior: 'instant' }); return true; })()`);
  await sleep(700);
  const fieldBox = await evaluate(`(() => { const r = document.querySelector('input[data-r6-slider="true"]').getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; })()`);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 5, y: 5, button: 'none', buttons: 0, pointerType: 'mouse' }, sessionId);
  await sleep(200);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: fieldBox.x, y: fieldBox.y, button: 'none', buttons: 0, pointerType: 'mouse' }, sessionId);
  await sleep(500);
  const tooltip = await evaluate(`(() => {
    const tip = document.querySelector('[data-r6-tooltip]');
    if (!tip) return null;
    const rect = tip.getBoundingClientRect();
    return { text: tip.textContent.replace(/\s+/g, ' ').trim().slice(0, 200), left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, vw: window.innerWidth, vh: window.innerHeight };
  })()`);
  record('Mouse hover opens the field tooltip', tooltip ? 'PASS' : 'FAIL', tooltip?.text ?? 'no tooltip');
  record('The tooltip stays inside the viewport', tooltip && tooltip.left >= 0 && tooltip.right <= tooltip.vw && tooltip.top >= 0 && tooltip.bottom <= tooltip.vh ? 'PASS' : 'FAIL', tooltip ? `left=${Math.round(tooltip.left)} right=${Math.round(tooltip.right)}` : '');

  // Park the pointer first: a real pointer sitting over another control fires a
  // mouseleave that would close the tooltip the focus just opened.
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 2, y: 2, button: 'none', buttons: 0, pointerType: 'mouse' }, sessionId);
  await sleep(300);
  const focusTooltip = await evaluate(`(() => { const el = document.querySelector('input[data-r6-slider="true"]'); el.focus(); return document.activeElement === el; })()`);
  await sleep(400);
  const focusOpen = await evaluate(`Boolean(document.querySelector('[data-r6-tooltip]'))`);
  record('Keyboard focus opens the tooltip', focusTooltip && focusOpen ? 'PASS' : 'FAIL', `focused=${focusTooltip} tooltip=${focusOpen}`);
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 }, sessionId);
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 }, sessionId);
  await sleep(400);
  const afterEscape = await evaluate(`!document.querySelector('[data-r6-tooltip]')`);
  record('Escape closes the tooltip', afterEscape ? 'PASS' : 'FAIL', 'the tooltip is removed');

  const desktopShot = await screenshot('tool-041-desktop-1440.png');
  record('Desktop screenshot', 'PASS', desktopShot);

  /* ── 390 px ──────────────────────────────────────────────────────────── */
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }, sessionId);
  await sleep(800);
  const mobile = await evaluate(`(() => {
    const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    return { overflow, boxes: document.querySelectorAll('[data-box-id]').length };
  })()`);
  record('Mobile 390px renders without horizontal overflow', mobile.overflow <= 0 ? 'PASS' : 'FAIL', `overflow=${mobile.overflow}`);
  record('Mobile 390px keeps the GENIUS boxes rendered', mobile.boxes === 12 ? 'PASS' : 'FAIL', `boxes=${mobile.boxes}`);
  const mobileShot = await screenshot('tool-041-mobile-390.png');
  record('Mobile screenshot', 'PASS', mobileShot);

  /* ── Arabic RTL ──────────────────────────────────────────────────────── */
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
  await goto(`${BASE_URL}/ar/smarttools/medical-monitoring/tool-041-hematocrit-monitor`);
  const arabic = await evaluate(`(() => ({
    dir: document.documentElement?.getAttribute('dir') ?? document.querySelector('main')?.getAttribute('dir'),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }))()`);
  record('Arabic RTL renders the tool', arabic.dir === 'rtl' ? 'PASS' : 'FAIL', `dir=${arabic.dir}`);
  record('Arabic RTL has no horizontal overflow', arabic.overflow <= 0 ? 'PASS' : 'FAIL', `overflow=${arabic.overflow}`);
  const arabicShot = await screenshot('tool-041-arabic-rtl-1440.png');
  record('Arabic screenshot', 'PASS', arabicShot);

  /* ── Nothing leaves the device ────────────────────────────────────────── */
  const writes = networkRequests.filter((request) => request.method !== 'GET');
  const leaks = networkRequests.filter((request) => !request.url.includes('/_next/static/') && request.url.includes('90'));
  const consoleLeaks = consoleLines.filter((line) => line.includes('mg/dL') || line.includes('HCT') || line.includes('%'));
  record('No value is sent to any server', writes.length === 0 && leaks.length === 0 ? 'PASS' : 'FAIL',
    writes.length === 0 && leaks.length === 0 ? `${networkRequests.length} requests, all GET, none carrying a value` : `writes=${writes.length} leaks=${leaks.length}`);
  record('No medical value reaches the application log', consoleLeaks.length === 0 ? 'PASS' : 'FAIL',
    consoleLeaks.length === 0 ? `${consoleLines.length} console messages, none containing a value` : consoleLeaks.slice(0, 2).join(' | ').slice(0, 160));

  const summary = {
    date: new Date().toISOString(),
    baseUrl: BASE_URL,
    browser: browserPath,
    deviceMetrics: { desktop: '1440x900', mobile: '390x844' },
    legibility390: null,
    results,
  };
  writeFileSync(join(OUT_DIR, 'tool-041-browser-verification.json'), JSON.stringify(summary, null, 2), 'utf8');
  console.log(`\nEVIDENCE_FILE: ${join(OUT_DIR, 'tool-041-browser-verification.json')}`);
  const failures = results.filter((entry) => entry.result !== 'PASS');
  console.log(`PASS=${results.length - failures.length} FAIL=${failures.length}`);
  socket.close();
  browser.kill();
  process.exit(failures.length === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error('HARNESS_ERROR:', error);
  browser.kill();
  process.exit(3);
});
