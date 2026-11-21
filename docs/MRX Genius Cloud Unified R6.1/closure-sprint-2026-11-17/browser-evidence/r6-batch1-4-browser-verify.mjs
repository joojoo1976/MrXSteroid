/**
 * Browser evidence verifier for the 29 R6.1 tools in Batches 1-4.
 *
 * STATUS: PREPARED - NOT RUN. The preview deployment is SSO-protected and no
 * authorized session has been provided. This script does not bypass SSO, does
 * not accept credentials, and must only be pointed at an authorized origin.
 *
 * Method: drives a locally installed Chrome/Edge through the Chrome DevTools
 * Protocol (no new dependency, same approach as tool-040-browser-verify.mjs).
 *
 * What it verifies per route, in EN and AR:
 *   - the canonical route renders (HTTP 200 / no error page);
 *   - exactly one GENIUS shell (`[data-r6-genius]`) - no duplicate shell;
 *   - twelve boxes, fixed order 1..12, none hidden by display/visibility;
 *   - the current state attribute (`data-r6-genius-state`);
 *   - document direction (rtl for AR, ltr for EN);
 *   - no horizontal overflow at 390 px;
 *   - console errors / uncaught exceptions / hydration mismatches.
 *
 * What it does NOT do: entering tool-specific values for PARTIAL / INVALID /
 * FULL / DEGRADED. Those need per-tool input fixtures and stay manual until
 * the owner approves a fixture pack.
 *
 * Usage:
 *   node r6-batch1-4-browser-verify.mjs <authorized-base-url> <out-dir>
 *
 * The base URL is supplied at run time through the environment/CLI only; it is
 * never committed. No secret belongs in this file or in the output JSON.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const BASE_URL = process.argv[2];
const OUT_DIR = process.argv[3] ?? '.';
if (!BASE_URL) {
  console.error('usage: node r6-batch1-4-browser-verify.mjs <authorized-base-url> <out-dir>');
  process.exit(2);
}

const ROUTES = [
  ['006', 'hormonal-health', 'tool-006-estrogen-prolactin'],
  ['008', 'medical-monitoring', 'tool-008-side-effect-tracker'],
  ['014', 'body-composition', 'tool-014-water-retention'],
  ['015', 'hormonal-health', 'tool-015-shbg-modulator'],
  ['016', 'pharmacokinetics', 'tool-016-half-life-calculator'],
  ['017', 'medical-monitoring', 'tool-017-drug-interaction'],
  ['022', 'pharmacokinetics', 'tool-022-half-life-stacker'],
  ['023', 'hormonal-health', 'tool-023-trt-optimization'],
  ['025', 'medical-monitoring', 'tool-025-drug-interaction-pro'],
  ['026', 'injection-formulation', 'tool-026-injection-pain'],
  ['027', 'pharmacokinetics', 'tool-027-ester-conversion'],
  ['029', 'medical-monitoring', 'tool-029-side-effect-early-warning'],
  ['031', 'cycle-management', 'tool-031-cycle-length-optimizer'],
  ['034', 'pharmacokinetics', 'tool-034-compound-clearance'],
  ['035', 'pharmacokinetics', 'tool-035-hormone-conversion'],
  ['037', 'medical-monitoring', 'tool-037-side-effect-probability'],
  ['038', 'cycle-management', 'tool-038-stack-compatibility'],
  ['040', 'medical-monitoring', 'tool-040-lipid-profile-optimizer'],
  ['041', 'medical-monitoring', 'tool-041-hematocrit-monitor'],
  ['042', 'hormonal-health', 'tool-042-estrogen-management'],
  ['043', 'hormonal-health', 'tool-043-prolactin-management'],
  ['044', 'medical-monitoring', 'tool-044-dht-side-effects'],
  ['045', 'cycle-management', 'tool-045-cycle-break-planner'],
  ['046', 'hormonal-health', 'tool-046-trt-lifetime'],
  ['047', 'hormonal-health', 'tool-047-fertility-preservation'],
  ['048', 'medical-monitoring', 'tool-048-cardiovascular-risk'],
  ['049', 'medical-monitoring', 'tool-049-bone-density'],
  ['050', 'medical-monitoring', 'tool-050-mental-health'],
  ['051', 'injection-formulation', 'tool-051-peptide-dosage-calculator'],
];

const PORT = Number(process.env.CDP_PORT ?? 9232);
const BROWSER_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean);
const browserPath = BROWSER_CANDIDATES.find((candidate) => existsSync(candidate));
if (!browserPath) { console.error('NO_BROWSER_FOUND'); process.exit(2); }

mkdirSync(OUT_DIR, { recursive: true });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const browser = spawn(browserPath, [
  '--headless=new', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.env.TEMP ?? '.'}\\r6-batch1-4-cdp-profile`,
  '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--hide-scrollbars',
  '--window-size=1440,900', 'about:blank',
], { stdio: 'ignore' });

async function waitForDevTools() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (response.ok) return response.json();
    } catch { /* not ready */ }
    await sleep(500);
  }
  throw new Error('devtools endpoint never became reachable');
}

class Cdp {
  constructor(socket) {
    this.socket = socket;
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.method === 'Runtime.exceptionThrown') {
        this.events.push({ type: 'exception', text: message.params?.exceptionDetails?.exception?.description ?? message.params?.exceptionDetails?.text ?? 'unknown' });
      }
      if (message.method === 'Runtime.consoleAPICalled' && message.params?.type === 'error') {
        this.events.push({ type: 'console.error', text: (message.params.args ?? []).map((a) => a.value ?? a.description ?? '').join(' ') });
      }
      if (message.method === 'Log.entryAdded' && message.params?.entry?.level === 'error') {
        this.events.push({ type: 'log.error', text: message.params.entry.text });
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
    this.id += 1;
    const id = this.id;
    this.socket.send(JSON.stringify({ id, method, params, sessionId }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.has(id)) { this.pending.delete(id); reject(new Error(`timeout: ${method}`)); }
      }, 45000);
    });
  }
}

const PROBE = `(() => {
  const genius = Array.from(document.querySelectorAll('[data-r6-genius]'));
  const boxes = Array.from(document.querySelectorAll('[data-r6-box]'));
  const order = boxes.map((el) => el.getAttribute('data-r6-box'));
  const hidden = boxes.filter((el) => {
    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return style.display === 'none' || style.visibility === 'hidden' || rect.width === 0 || rect.height === 0;
  }).map((el) => el.getAttribute('data-r6-box'));
  const scroll = document.scrollingElement;
  return {
    title: document.title,
    lang: document.documentElement.lang,
    dir: document.documentElement.dir || getComputedStyle(document.documentElement).direction,
    geniusShells: genius.length,
    geniusState: genius[0]?.getAttribute('data-r6-genius-state') ?? null,
    boxCount: boxes.length,
    boxOrder: order,
    hiddenBoxes: hidden,
    overflowPx: scroll ? scroll.scrollWidth - scroll.clientWidth : null,
    stateText: document.querySelector('[aria-live="polite"]')?.textContent?.trim().slice(0, 160) ?? null,
    hasGeniusCore: ['c1','c2','c3','c4','c5'].every((c) => document.querySelector('[data-r6-core="' + c + '"]')),
  };
})()`;

async function main() {
  const { webSocketDebuggerUrl } = await waitForDevTools();
  const socket = new WebSocket(webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  const cdp = new Cdp(socket);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Log.enable');
  await cdp.send('Network.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });

  const results = [];
  for (const [tool, category, slug] of ROUTES) {
    for (const locale of ['en', 'ar']) {
      cdp.events = [];
      await cdp.send('Network.setCookie', {
        name: 'mrx_explicit_language', value: locale, url: BASE_URL, path: '/',
      });
      const url = `${BASE_URL.replace(/\/$/, '')}/smarttools/${category}/${slug}`;
      const nav = await cdp.send('Page.navigate', { url });
      await sleep(2500);
      let probe = null;
      let probeError = null;
      try {
        const evaluated = await cdp.send('Runtime.evaluate', { expression: PROBE, returnByValue: true, awaitPromise: true });
        probe = evaluated.result?.value ?? null;
      } catch (err) {
        probeError = String(err.message ?? err);
      }
      const expectedDir = locale === 'ar' ? 'rtl' : 'ltr';
      const uniqueOrder = probe ? Array.from(new Set(probe.boxOrder)) : [];
      const checks = {
        navigated: Boolean(nav?.frameId),
        oneShell: probe?.geniusShells === 1,
        twelveBoxes: probe?.boxCount === 12,
        fixedOrder: uniqueOrder.length === 12 && uniqueOrder.every((v, i) => v === String(i + 1)),
        noneHidden: probe?.hiddenBoxes?.length === 0,
        direction: probe?.dir === expectedDir,
        noOverflow390: probe?.overflowPx !== null && probe?.overflowPx <= 1,
        core5: probe?.hasGeniusCore === true,
        consoleClean: cdp.events.length === 0,
      };
      results.push({
        tool, category, slug, locale, url,
        status: Object.values(checks).every(Boolean) ? 'PASS' : 'FAIL',
        checks,
        probe,
        probeError,
        consoleEvents: cdp.events.slice(0, 20),
        capturedAt: new Date().toISOString(),
      });
      console.log(`${tool} ${locale} ${results.at(-1).status} ${Object.entries(checks).filter(([, v]) => !v).map(([k]) => k).join(',') || '-'}`);
    }
  }

  const report = {
    environment: BASE_URL,
    generatedAt: new Date().toISOString(),
    note: 'SSO was not bypassed. Run only against an authorized origin.',
    routeCount: ROUTES.length,
    passCount: results.filter((r) => r.status === 'PASS').length,
    failCount: results.filter((r) => r.status === 'FAIL').length,
    results,
  };
  const out = join(OUT_DIR, 'r6-batch1-4-browser-results.json');
  writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(`WROTE ${out} (${report.passCount} pass / ${report.failCount} fail of ${results.length})`);

  socket.close();
  browser.kill();
}

main().catch((error) => {
  console.error(error);
  browser.kill();
  process.exit(1);
});
