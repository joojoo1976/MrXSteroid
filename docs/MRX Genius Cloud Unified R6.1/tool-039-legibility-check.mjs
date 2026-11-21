#!/usr/bin/env node
/**
 * docs/MRX Genius Cloud Unified R6.1/tool-039-legibility-check.mjs
 *
 * Measures the real rendered legibility of the Tool 039 explanatory diagram at
 * a 390 px viewport and writes the result plus a screenshot as evidence.
 *
 * It measures the VISIBLE diagram text (the phone stack below 768 px, the SVG
 * above it) instead of the scaled-down SVG text, and it fails if any step is
 * missing or unreadable.
 *
 * The 12 px figure is an INTERNAL engineering criterion of this check — no
 * R6.1 paragraph specifies a minimum font size.
 *
 * Usage: node tool-039-legibility-check.mjs <baseUrl> <outFile> [screenshotFile]
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const BASE_URL = process.argv[2] ?? 'http://localhost:3100';
const OUT_FILE = process.argv[3] ?? 'docs/MRX Genius Cloud Unified R6.1/evidence/tool-039/legibility-390.json';
const SHOT_FILE = process.argv[4] ?? 'docs/MRX Genius Cloud Unified R6.1/evidence/tool-039/legibility-390.png';
const PORT = 9666;

const browserPath = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].find((p) => existsSync(p));
if (!browserPath) {
  console.error('NO_BROWSER_FOUND');
  process.exit(2);
}

const browser = spawn(browserPath, [
  '--headless=new', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.env.TEMP ?? '.'}\\tool-039-legibility`,
  '--no-first-run', '--disable-gpu', '--window-size=1440,900', 'about:blank',
], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForDevTools() {
  for (let i = 0; i < 60; i += 1) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) return r.json(); } catch { /* retry */ }
    await sleep(500);
  }
  throw new Error('devtools endpoint never became reachable');
}

const version = await waitForDevTools();
const socket = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener('open', resolve); socket.addEventListener('error', reject); });

let id = 0;
const pending = new Map();
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve } = pending.get(message.id);
    pending.delete(message.id);
    resolve(message.result);
  }
});
const send = (method, params = {}, sessionId) => {
  id += 1;
  const current = id;
  socket.send(JSON.stringify({ id: current, method, params, sessionId }));
  return new Promise((resolve) => pending.set(current, { resolve }));
};

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
await send('Page.enable', {}, sessionId);
await send('Runtime.enable', {}, sessionId);
const evaluate = async (expression) =>
  (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId)).result?.value;

await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }, sessionId);
await send('Page.navigate', { url: `${BASE_URL}/en/smarttools/medical-monitoring/tool-039-liver-enzyme-tracker` }, sessionId);
await sleep(2500);
await evaluate(`(() => { const add = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Add reading')); if (add) add.click(); return true; })()`);
await sleep(400);
await evaluate(`(() => {
  const setValue = (el, v) => { const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; s.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); };
  setValue(document.querySelector('input[aria-label="Value 1"]'), '112');
  setValue(document.querySelector('input[aria-label="Draw date 1"]'), '2026-02-01');
  const oral = document.querySelector('[aria-label="On oral steroids"]');
  const tudca = document.querySelector('[aria-label="Using TUDCA"]');
  [...oral.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Yes').click();
  [...tudca.querySelectorAll('button')].find((b) => b.textContent.trim() === 'No').click();
  setValue(document.querySelector('input[aria-label="Alcohol drinks per week"]'), '0');
  return true;
})()`);
await sleep(1200);

// Scroll the diagram into view so the screenshot shows the very thing that was
// measured (not the top of the form).
await evaluate(`(() => {
  const visual = document.querySelector('[data-r6-visual="tool-039"]');
  if (visual) visual.scrollIntoView({ block: 'start', behavior: 'instant' });
  return true;
})()`);
await sleep(400);

const measurement = await evaluate(`(() => {
  const nodes = Array.from(document.querySelectorAll('[data-r6-diagram-step], [data-r6-illustration-node]'));
  const isVisible = (el) => el.getClientRects().length > 0 && el.getBoundingClientRect().width > 0;
  const visible = nodes.filter(isVisible);
  const svg = document.querySelector('[data-r6-illustration="tool-039"]');
  const svgRect = svg ? svg.getBoundingClientRect() : null;
  const viewBoxWidth = svg ? Number(svg.getAttribute('viewBox').split(' ')[2]) : 0;
  const svgScale = svgRect && viewBoxWidth ? svgRect.width / viewBoxWidth : 0;

  const steps = visible.map((el) => {
    const texts = Array.from(el.querySelectorAll('p, span, text'))
      .filter((node) => node.textContent && node.textContent.trim().length > 0)
      .map((node) => {
        const declared = Number(window.getComputedStyle(node).fontSize.replace('px', ''));
        const isSvgText = node.tagName.toLowerCase() === 'text';
        return {
          tag: node.tagName.toLowerCase(),
          content: node.textContent.trim().slice(0, 48),
          declaredFontPx: declared,
          renderedFontPx: Number((isSvgText ? declared * svgScale : declared).toFixed(2)),
        };
      });
    return {
      id: el.getAttribute('data-r6-diagram-step') || el.getAttribute('data-r6-illustration-node'),
      variant: el.hasAttribute('data-r6-diagram-step') ? 'html-stack' : 'svg',
      minRenderedFontPx: texts.length ? Math.min(...texts.map((x) => x.renderedFontPx)) : 0,
      maxRenderedFontPx: texts.length ? Math.max(...texts.map((x) => x.renderedFontPx)) : 0,
      sample: texts.slice(0, 2),
    };
  });

  return {
    viewport: { width: window.innerWidth, height: window.innerHeight },
    svgRenderedWidthPx: svgRect ? Number(svgRect.width.toFixed(1)) : 0,
    svgVisible: svg ? isVisible(svg) : false,
    viewBoxWidth,
    svgScaleFactor: Number(svgScale.toFixed(4)),
    totalStepNodes: nodes.length,
    visibleStepCount: steps.length,
    smallestVisibleFontPx: steps.length ? Math.min(...steps.map((x) => x.minRenderedFontPx)) : 0,
    largestVisibleFontPx: steps.length ? Math.max(...steps.map((x) => x.maxRenderedFontPx)) : 0,
    steps,
    horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
})()`);

const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, sessionId);
mkdirSync(dirname(SHOT_FILE), { recursive: true });
writeFileSync(SHOT_FILE, Buffer.from(shot.data, 'base64'));

const thresholdPx = 12;
const allStepsPresent = measurement.visibleStepCount >= 5;
const readable = measurement.smallestVisibleFontPx >= thresholdPx;
const verdict = {
  result: readable && allStepsPresent
    ? `PASS - at ${measurement.viewport.width}px all ${measurement.visibleStepCount} diagram steps are visible and their text renders at or above ${thresholdPx}px (smallest visible ${measurement.smallestVisibleFontPx}px)`
    : `FAIL - at ${measurement.viewport.width}px the diagram text is not readable (smallest visible ${measurement.smallestVisibleFontPx}px, ${measurement.visibleStepCount}/5 steps visible)`,
  thresholdPx,
  thresholdProvenance: 'Internal engineering criterion of this check (not an R6.1 rule: no R6.1 paragraph specifies a minimum font size). The measurement is the rendered size of the VISIBLE diagram text.',
  measuredSmallestVisibleFontPx: measurement.smallestVisibleFontPx,
  visibleStepCount: measurement.visibleStepCount,
};

const artifact = {
  date: new Date().toISOString(),
  build: process.env.VERCEL_PREVIEW_HOST ? `PUBLISHED ${process.env.VERCEL_PREVIEW_HOST}` : 'WORKTREE (local production build of the authorized legibility fix)',
  baseUrl: BASE_URL,
  browser: browserPath,
  screenshot: SHOT_FILE,
  check: 'ACC-5.5.7-LEGIBILITY - legibility of the explanatory diagram at a 390 px viewport',
  measurement,
  verdict,
};
mkdirSync(dirname(OUT_FILE), { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify(artifact, null, 2) + '\n', 'utf8');
console.log(JSON.stringify(artifact, null, 2));
socket.close();
browser.kill();
process.exit(0);
