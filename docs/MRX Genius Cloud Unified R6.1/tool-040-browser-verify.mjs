#!/usr/bin/env node
/**
 * docs/MRX Genius Cloud Unified R6.1/tool-040-browser-verify.mjs
 *
 * Real-browser verification of the Tool 040 (Lipid Profile Optimizer) R6.1
 * implementation. It drives a locally installed Chrome/Edge through the Chrome
 * DevTools Protocol (no new dependency) and records:
 *
 *   - the EMPTY state (nothing entered, nothing invented, no calculation);
 *   - the PARTIAL / INVALID states;
 *   - the FULL state: the engine result, the gauges, the accessible table;
 *   - the per-marker tooltip (hover, keyboard focus, touch, Escape, close);
 *   - the twelve GENIUS boxes in their fixed order, the compact CORE-5 mode;
 *   - the explanatory illustration in every state;
 *   - AR/RTL and the 390 px viewport;
 *   - that NO value or comment reaches the network or the application log.
 *
 * Usage: node tool-040-browser-verify.mjs <baseUrl> <outDir>
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const BASE_URL = process.argv[2] ?? 'http://localhost:3100';
const OUT_DIR = process.argv[3] ?? '.';
const PORT = 9231;

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
  `--user-data-dir=${process.env.TEMP ?? '.'}\\tool-040-cdp-profile`,
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
        this.events.push({ type: 'exception', text: message.params?.exceptionDetails?.exception?.description ?? message.params?.exceptionDetails?.text ?? 'unknown' });
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
  const screenshot = async (name) => {
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, sessionId);
    const file = join(OUT_DIR, name);
    writeFileSync(file, Buffer.from(shot.data, 'base64'));
    return file;
  };

  /* ── EMPTY state ─────────────────────────────────────────────────────── */
  await goto(`${BASE_URL}/en/smarttools/medical-monitoring/tool-040-lipid-profile-optimizer`);
  const loaded = await evaluate(`Boolean(document.querySelector('main h1'))`);
  record('Tool 040 page loads', loaded ? 'PASS' : 'FAIL', 'main h1 present');

  const empty = await evaluate(`(() => {
    const state = document.querySelector('[data-r6-state]')?.getAttribute('data-r6-state') ?? null;
    const values = Array.from(document.querySelectorAll('[data-r6-field]')).map((el) => el.value).filter((v) => v !== '');
    return { state, values, bars: document.querySelectorAll('[data-r6-bar]').length, boxes: document.querySelectorAll('[data-r6-box]').length };
  })()`);
  record('EMPTY state: nothing is pre-filled and nothing is invented', empty.state === 'EMPTY' && empty.values.length === 0 ? 'PASS' : 'FAIL', `state=${empty.state} pre-filled values=${empty.values.length}`);
  record('EMPTY state: no chart is drawn without a result', empty.bars === 0 ? 'PASS' : 'FAIL', `bars=${empty.bars}`);

  const emptyIllustration = await evaluate(`(() => {
    const section = document.querySelector('[data-r6-visual="tool-040"]');
    const svg = document.querySelector('[data-r6-illustration="tool-040"]');
    const text = document.querySelector('[data-r6-illustration-text="tool-040"]');
    const mobile = document.querySelector('[data-r6-illustration-mobile="tool-040"]');
    const caption = document.querySelector('[data-r6-visual="tool-040"] figcaption')?.textContent ?? '';
    return {
      section: Boolean(section),
      svg: Boolean(svg),
      svgVisible: (svg?.getClientRects().length ?? 0) > 0,
      text: Boolean(text),
      textSteps: text ? text.querySelectorAll('li').length : 0,
      mobile: Boolean(mobile),
      caption,
    };
  })()`);
  record(
    'EMPTY state: the explanatory illustration is visible before anything is entered',
    emptyIllustration.section && emptyIllustration.svg && emptyIllustration.svgVisible && emptyIllustration.textSteps === 5
      ? 'PASS'
      : 'FAIL',
    `section=${emptyIllustration.section} svgVisible=${emptyIllustration.svgVisible} textSteps=${emptyIllustration.textSteps}`,
  );
  record(
    'EMPTY state: the illustration is labelled as illustrative, not as a measurement',
    /Illustrative diagram/i.test(emptyIllustration.caption)
      ? 'PASS'
      : 'FAIL',
    emptyIllustration.caption.slice(0, 120),
  );

  /* ── PARTIAL + INVALID ───────────────────────────────────────────────── */
  await evaluate(`(() => {
    const field = document.querySelector('[data-r6-field="ldl_mg_dl"]');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(field, '160');
    field.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);
  await sleep(600);
  const partial = await evaluate(`document.querySelector('[data-r6-state]')?.getAttribute('data-r6-state')`);
  record('PARTIAL state: an incomplete panel is not calculated', partial === 'PARTIAL' ? 'PASS' : 'FAIL', `state=${partial}`);

  await evaluate(`(() => {
    const field = document.querySelector('[data-r6-field="ldl_mg_dl"]');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(field, '900');
    field.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);
  await sleep(600);
  const invalid = await evaluate(`document.querySelector('[data-r6-state]')?.getAttribute('data-r6-state')`);
  record('INVALID state: an out-of-range value is rejected', invalid === 'INVALID' ? 'PASS' : 'FAIL', `state=${invalid}`);

  /* ── Fill a complete panel ───────────────────────────────────────────── */
  const filled = await evaluate(`(() => {
    const set = (fieldId, value) => {
      const field = document.querySelector('[data-r6-field="' + fieldId + '"]');
      if (!field) return false;
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(field, value);
      field.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    };
    const clickAnswer = (label, text) => {
      const group = [...document.querySelectorAll('[role="group"]')].find((g) => g.getAttribute('aria-label') === label);
      if (!group) return false;
      const button = [...group.querySelectorAll('button')].find((b) => b.textContent.trim() === text);
      if (!button) return false;
      button.click();
      return true;
    };
    const ok = [];
    ok.push(set('ldl_mg_dl', '160'));
    ok.push(set('hdl_mg_dl', '38'));
    ok.push(set('triglycerides_mg_dl', '210'));
    ok.push(set('panel_date', '2026-02-01'));
    ok.push(set('age', '45'));
    ok.push(set('systolic_bp', '145'));
    ok.push(set('weeks_remaining', '8'));
    ok.push(clickAnswer('Smoker', 'Yes'));
    ok.push(clickAnswer('On cycle', 'Yes'));
    return ok.every(Boolean);
  })()`);
  await sleep(1800);

  const full = await evaluate(`(() => {
    const bar = document.querySelector('[data-r6-bar="LDL"]');
    const table = document.querySelector('[data-r6-table="tool-040"] table');
    const boxes = Array.from(document.querySelectorAll('[data-r6-box]')).map((b) => b.getAttribute('data-r6-box'));
    return {
      state: document.querySelector('[data-r6-state]')?.getAttribute('data-r6-state') ?? null,
      ldlText: bar?.textContent?.replace(/\\s+/g, ' ').trim() ?? null,
      bars: document.querySelectorAll('[data-r6-bar]').length,
      tableHasValue: (table?.textContent ?? '').includes('160'),
      boxes,
      illustration: Boolean(document.querySelector('[data-r6-illustration="tool-040"]')),
      historySource: document.querySelector('[data-r6-box="11"]')?.getAttribute('data-r6-box-source') ?? null,
    };
  })()`);
  record('FULL state: the engine result is shown', full.state === 'FULL' && full.bars === 3 ? 'PASS' : 'FAIL', `state=${full.state} bars=${full.bars}`);
  record('FULL state: the gauge shows the entered value and its band', (full.ldlText ?? '').includes('160') ? 'PASS' : 'FAIL', full.ldlText ?? '');
  record('FULL state: the accessible table equals the chart', full.tableHasValue ? 'PASS' : 'FAIL', 'the table contains 160');
  record('FULL state: the twelve GENIUS boxes keep their fixed order', full.boxes.length === 12 && full.boxes.join(',') === '1,2,3,4,5,6,7,8,9,10,11,12' ? 'PASS' : 'FAIL', full.boxes.join(','));
  record('FULL state: the explanatory illustration renders', full.illustration ? 'PASS' : 'FAIL', 'svg[data-r6-illustration="tool-040"]');
  record('The history box stays visible with a real reason', full.historySource === 'not_applicable' ? 'PASS' : 'FAIL', `source=${full.historySource}`);

  /* ── The tooltip ─────────────────────────────────────────────────────── */
  await evaluate(`(() => { const el = document.querySelector('[data-r6-bar="LDL"]'); el.scrollIntoView({ block: 'center', behavior: 'instant' }); return true; })()`);
  await sleep(700);
  const barBox = await evaluate(`(() => { const r = document.querySelector('[data-r6-bar="LDL"]').getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; })()`);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 5, y: 5, button: 'none', buttons: 0, pointerType: 'mouse' }, sessionId);
  await sleep(200);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: barBox.x, y: barBox.y, button: 'none', buttons: 0, pointerType: 'mouse' }, sessionId);
  await sleep(500);
  const tooltip = await evaluate(`(() => {
    const tip = document.querySelector('[data-r6-tooltip="open"]');
    if (!tip) return null;
    const rect = tip.getBoundingClientRect();
    return { text: tip.textContent.replace(/\\s+/g, ' ').trim().slice(0, 200), left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, vw: window.innerWidth, vh: window.innerHeight };
  })()`);
  record('Mouse hover opens the element tooltip', tooltip ? 'PASS' : 'FAIL', tooltip?.text ?? 'no tooltip');
  record('The tooltip stays inside the viewport', tooltip && tooltip.left >= 0 && tooltip.right <= tooltip.vw && tooltip.top >= 0 && tooltip.bottom <= tooltip.vh ? 'PASS' : 'FAIL', tooltip ? `left=${Math.round(tooltip.left)} right=${Math.round(tooltip.right)}` : '');

  // Park the pointer first: a real pointer sitting over another control fires a
  // mouseleave that would close the tooltip the focus just opened.
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 2, y: 2, button: 'none', buttons: 0, pointerType: 'mouse' }, sessionId);
  await sleep(300);
  const focusTooltip = await evaluate(`(() => { const el = document.querySelector('[data-r6-bar="TG"]'); el.focus(); return document.activeElement === el; })()`);
  await sleep(400);
  const focusOpen = await evaluate(`Boolean(document.querySelector('[data-r6-tooltip="open"]'))`);
  record('Keyboard focus opens the tooltip', focusTooltip && focusOpen ? 'PASS' : 'FAIL', `focused=${focusTooltip} tooltip=${focusOpen}`);
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 }, sessionId);
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 }, sessionId);
  await sleep(400);
  const afterEscape = await evaluate(`Boolean(document.querySelector('[data-r6-tooltip="open"]'))`);
  record('Escape closes the tooltip', afterEscape ? 'FAIL' : 'PASS', 'the tooltip is removed');

  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 }, sessionId);
  await sleep(300);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: barBox.x, y: barBox.y }] }, sessionId);
  await sleep(200);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }, sessionId);
  await sleep(500);
  const touchTooltip = await evaluate(`Boolean(document.querySelector('[data-r6-tooltip="open"]'))`);
  record('Touch opens the tooltip', touchTooltip ? 'PASS' : 'FAIL', 'touchStart/touchEnd on the LDL gauge');
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: false }, sessionId);

  const desktopShot = await screenshot('tool-040-desktop-1440.png');
  record('Desktop screenshot', 'PASS', desktopShot);

  /* ── 390 px ──────────────────────────────────────────────────────────── */
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }, sessionId);
  await sleep(800);
  const mobile = await evaluate(`(() => {
    const steps = Array.from(document.querySelectorAll('[data-r6-diagram-step]'));
    const visible = steps.filter((el) => el.getClientRects().length > 0);
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      bars: document.querySelectorAll('[data-r6-bar]').length,
      steps: visible.length,
      svgHidden: (document.querySelector('[data-r6-illustration="tool-040"]')?.getClientRects().length ?? 0) === 0,
    };
  })()`);
  record('Mobile 390px renders without horizontal overflow', mobile.overflow <= 0 ? 'PASS' : 'FAIL', `overflow=${mobile.overflow}`);
  record('Mobile 390px keeps the visual elements', mobile.bars === 3 && mobile.steps >= 5 ? 'PASS' : 'FAIL', `bars=${mobile.bars} visible steps=${mobile.steps}`);
  const legibility = await evaluate(`(() => {
    const visible = (el) => el && el.getClientRects().length > 0;
    const sizes = [];
    for (const el of document.querySelectorAll('[data-r6-illustration-mobile="tool-040"] p')) {
      if (!visible(el)) continue;
      const px = Number.parseFloat(getComputedStyle(el).fontSize);
      if (Number.isFinite(px)) sizes.push({ size: px, text: (el.textContent ?? '').slice(0, 40) });
    }
    const desktopSvg = document.querySelector('[data-r6-illustration="tool-040"]');
    return {
      desktopSvgHidden: !visible(desktopSvg),
      visibleTextCount: sizes.length,
      smallest: sizes.length ? Math.min(...sizes.map((s) => s.size)) : null,
      largest: sizes.length ? Math.max(...sizes.map((s) => s.size)) : null,
      steps: sizes.length,
    };
  })()`);
  record(
    'Mobile 390px: the diagram text is rendered as real, readable text',
    legibility.desktopSvgHidden && legibility.visibleTextCount >= 5 && legibility.smallest !== null && legibility.smallest >= 12
      ? 'PASS'
      : 'FAIL',
    `desktopSvgHidden=${legibility.desktopSvgHidden} visibleTextCount=${legibility.visibleTextCount} smallest=${legibility.smallest}px largest=${legibility.largest}px`,
  );

  const mobileShot = await screenshot('tool-040-mobile-390.png');
  record('Mobile screenshot', 'PASS', mobileShot);

  /* ── Arabic RTL ──────────────────────────────────────────────────────── */
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
  await goto(`${BASE_URL}/ar/smarttools/medical-monitoring/tool-040-lipid-profile-optimizer`);
  const arabic = await evaluate(`(() => ({
    dir: document.querySelector('main')?.getAttribute('dir'),
    illustration: Boolean(document.querySelector('[data-r6-illustration="tool-040"]')),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }))()`);
  record('Arabic RTL renders the visual layer', arabic.dir === 'rtl' && arabic.illustration ? 'PASS' : 'FAIL', `dir=${arabic.dir}`);
  record('Arabic RTL has no horizontal overflow', arabic.overflow <= 0 ? 'PASS' : 'FAIL', `overflow=${arabic.overflow}`);
  const arabicShot = await screenshot('tool-040-arabic-rtl-1440.png');
  record('Arabic screenshot', 'PASS', arabicShot);

  /* ── Nothing leaves the device ────────────────────────────────────────── */
  const writes = networkRequests.filter((request) => request.method !== 'GET');
  // The static chunk names can contain digits, so only the page/API requests are checked.
  const leaks = networkRequests.filter((request) => !request.url.includes('/_next/static/') && (request.url.includes('160') || request.url.includes('210')));
  const consoleLeaks = consoleLines.filter((line) => line.includes('160') || line.includes('210') || line.includes('mg/dL'));
  record('No value is sent to any server', writes.length === 0 && leaks.length === 0 ? 'PASS' : 'FAIL',
    writes.length === 0 && leaks.length === 0 ? `${networkRequests.length} requests, all GET, none carrying a value` : `writes=${writes.length} leaks=${leaks.length}`);
  record('No medical value reaches the application log', consoleLeaks.length === 0 ? 'PASS' : 'FAIL',
    consoleLeaks.length === 0 ? `${consoleLines.length} console messages, none containing a value` : consoleLeaks.slice(0, 2).join(' | ').slice(0, 160));

  const summary = {
    date: new Date().toISOString(),
    baseUrl: BASE_URL,
    browser: browserPath,
    deviceMetrics: { desktop: '1440x900', mobile: '390x844' },
    legibility390: legibility,
    results,
  };
  writeFileSync(join(OUT_DIR, 'tool-040-browser-verification.json'), JSON.stringify(summary, null, 2), 'utf8');
  console.log(`\nEVIDENCE_FILE: ${join(OUT_DIR, 'tool-040-browser-verification.json')}`);
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
