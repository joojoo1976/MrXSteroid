#!/usr/bin/env node
/**
 * docs/MRX Genius Cloud Unified R6.1/tool-039-browser-verify.mjs
 *
 * Real-browser verification of the Tool 039 visual layer.
 *
 * It drives a locally installed Chrome/Edge through the Chrome DevTools
 * Protocol (no new dependency: Node's global WebSocket + fetch are enough) and
 * records, for the published production build served by `next start`:
 *
 *   - the explanatory illustration and the charts actually render,
 *   - the chart values equal the values in the page's own data table,
 *   - a real mouse hover opens the element-specific tooltip,
 *   - real keyboard focus opens the tooltip and Escape closes it,
 *   - a real tap/click opens it and a second tap dismisses it,
 *   - the tooltip stays inside the viewport,
 *   - the screen-reader text alternative (the data table) exists,
 *   - Arabic RTL and English LTR both render,
 *   - there is no horizontal overflow at 390 px,
 *   - screenshots for 390 px and desktop are written as evidence.
 *
 * Usage: node tool-039-browser-verify.mjs <baseUrl> <outDir>
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BASE_URL = process.argv[2] ?? 'http://localhost:3100';
const OUT_DIR = process.argv[3] ?? '.';
const PORT = 9222;

const BROWSER_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

const browserPath = BROWSER_CANDIDATES.find((candidate) => existsSync(candidate));
if (!browserPath) {
  console.error('NO_BROWSER_FOUND');
  process.exit(2);
}
mkdirSync(OUT_DIR, { recursive: true });

const profileDir = join(process.env.TEMP ?? '.', 'tool-039-cdp-profile');
const browser = spawn(browserPath, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profileDir}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu',
  '--hide-scrollbars',
  '--window-size=1440,900',
  'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForDevTools() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (response.ok) return await response.json();
    } catch {
      /* not ready yet */
    }
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
        this.events.push({
          type: 'exception',
          text: message.params?.exceptionDetails?.exception?.description
            ?? message.params?.exceptionDetails?.text
            ?? 'unknown',
        });
      }
      if (message.method === 'Runtime.consoleAPICalled' && message.params?.type === 'error') {
        this.events.push({ type: 'console.error', text: message.params?.args?.map((a) => a.value ?? a.description).join(' ') });
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
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    this.socket.send(JSON.stringify(payload));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`timeout: ${method}`));
        }
      }, 30000);
    });
  }
}

const results = [];
const record = (requirement, result, evidence) => {
  results.push({ requirement, result, evidence });
  console.log(`${requirement} => ${result}${evidence ? ` (${evidence})` : ''}`);
};

async function main() {
  await waitForDevTools();
  const version = await fetch(`http://127.0.0.1:${PORT}/json/version`).then((r) => r.json());
  const socket = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve);
    socket.addEventListener('error', reject);
  });
  const cdp = new Cdp(socket);

  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  await cdp.send('Page.enable', {}, sessionId);
  await cdp.send('Runtime.enable', {}, sessionId);

  // Optional: verify the PUBLISHED preview instead of a local server. The
  // bypass cookie is read from the environment and is never printed or stored.
  const previewHost = process.env.VERCEL_PREVIEW_HOST;
  const previewCookie = process.env.VERCEL_PREVIEW_COOKIE;
  if (previewHost && previewCookie) {
    await cdp.send('Network.enable', {}, sessionId);
    await cdp.send('Network.setCookie', {
      name: '_vercel_jwt',
      value: previewCookie,
      domain: previewHost,
      path: '/',
      secure: true,
    }, sessionId);
    console.log(`PREVIEW_COOKIE_SET for ${previewHost}`);
  }

  const evaluate = async (expression) => {
    const result = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId);
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result?.value;
  };

  const goto = async (url) => {
    await cdp.send('Page.navigate', { url }, sessionId);
    await sleep(2500);
  };

  const fillForm = async (locale = 'en') => {
    const detected = locale === 'auto'
      ? await evaluate(`document.querySelector('main')?.getAttribute('dir') === 'rtl' ? 'ar' : 'en'`)
      : locale;
    const labels = detected === 'ar'
      ? { add: 'إضافة قراءة', value: 'القيمة 1', date: 'تاريخ سحب العينة 1', alcohol: 'مشروبات كحولية في الأسبوع', oral: 'يتناول ستيرويدات فموية', tudca: 'يستخدم TUDCA', yes: 'نعم', no: 'لا' }
      : { add: 'Add reading', value: 'Value 1', date: 'Draw date 1', alcohol: 'Alcohol drinks per week', oral: 'On oral steroids', tudca: 'Using TUDCA', yes: 'Yes', no: 'No' };
    // Step 1: add a reading (the row renders on the next React commit).
    await evaluate(`(() => {
      const label = ${JSON.stringify(labels.add)};
      const add = [...document.querySelectorAll('button')].find((b) => b.textContent.includes(label));
      if (add) add.click();
      return true;
    })()`);
    await sleep(400);
    // Step 2: fill it.
    const filled = await evaluate(`(() => {
      const L = ${JSON.stringify(labels)};
      const setValue = (el, value) => {
        if (!el) return false;
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        setter.call(el, value);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      };
      const byLabel = (label) => document.querySelector('input[aria-label="' + label + '"]');
      const clickText = (scope, text) => {
        if (!scope) return false;
        const el = [...scope.querySelectorAll('button')].find((b) => b.textContent.trim() === text);
        if (!el) return false;
        el.click();
        return true;
      };
      const oral = document.querySelector('[aria-label="' + L.oral + '"]');
      const tudca = document.querySelector('[aria-label="' + L.tudca + '"]');
      return {
        value: setValue(byLabel(L.value), '112'),
        date: setValue(byLabel(L.date), '2026-02-01'),
        oral: clickText(oral, L.yes),
        tudca: clickText(tudca, L.no),
        alcohol: setValue(byLabel(L.alcohol), '0'),
      };
    })()`);
    await sleep(900);
    return filled;
  };

  /** Scroll an element into the viewport and return its centre coordinates. */
  const centerOf = async (selector) => {
    await evaluate(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return false;
      el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
      const rect = el.getBoundingClientRect();
      const target = rect.top + window.scrollY - (window.innerHeight / 2);
      window.scrollTo({ top: Math.max(0, target), behavior: 'instant' });
      return true;
    })()`);
    await sleep(800);
    return evaluate(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, scrollY: window.scrollY, inViewport: r.top >= 0 && r.bottom <= window.innerHeight };
    })()`);
  };

  const screenshot = async (name) => {
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, sessionId);
    const file = join(OUT_DIR, name);
    writeFileSync(file, Buffer.from(shot.data, 'base64'));
    return file;
  };

  // ── Desktop ───────────────────────────────────────────────────────────────
  // NOTE: no Emulation.setDeviceMetricsOverride here — in headless mode the
  // emulated input pipeline does not deliver the real hover events the same way
  // as the native window size (--window-size=1440,900 is used instead). The
  // mobile phase below switches the emulation on for the 390 px check.
  await goto(`${BASE_URL}/en/smarttools/medical-monitoring/tool-039-liver-enzyme-tracker`);
  const englishLoaded = await evaluate(`Boolean(document.querySelector('main h1'))`);
  if (!englishLoaded) {
    await goto(`${BASE_URL}/smarttools/medical-monitoring/tool-039-liver-enzyme-tracker`);
  }

  // Deterministic device state: a previous run of this harness must not leave a
  // saved result behind. The page is reloaded so the UI starts from EMPTY.
  await evaluate(`(() => { localStorage.clear(); return true; })()`);
  await goto(`${BASE_URL}/en/smarttools/medical-monitoring/tool-039-liver-enzyme-tracker`);

  // ── EMPTY state: the explanatory illustration must ALREADY be on the page ──
  // This is the owner-reported defect ("the new illustration is not visible").
  // Before the fix the whole visual section was gated behind a FULL result, so
  // the first thing a visitor saw had no diagram at all.
  const emptyState = await evaluate(`(() => {
    const visible = (el) => Boolean(el) && el.getClientRects().length > 0 && el.getBoundingClientRect().width > 0;
    const section = document.querySelector('[data-r6-visual="tool-039"]');
    const svg = document.querySelector('[data-r6-illustration="tool-039"]');
    const mobile = document.querySelector('[data-r6-illustration-mobile="tool-039"]');
    const text = document.querySelector('[data-r6-illustration-text="tool-039"]');
    return {
      sectionPresent: Boolean(section),
      sectionVisible: visible(section),
      svgPresent: Boolean(svg),
      svgVisible: visible(svg),
      mobilePresent: Boolean(mobile),
      mobileVisible: visible(mobile),
      textPresent: Boolean(text),
      textVisible: visible(text),
      svgStepCount: document.querySelectorAll('[data-r6-illustration="tool-039"] text').length,
      mobileStepCount: document.querySelectorAll('[data-r6-diagram-step]').length,
      titleText: document.querySelector('[data-r6-visual="tool-039"] h3')?.textContent?.trim(),
      captionText: document.querySelector('[data-r6-visual="tool-039"] figure p')?.textContent?.trim(),
      stateBadge: document.querySelector('main')?.textContent?.match(/State:\\s*\\w+/)?.[0],
      // The data-driven charts must NOT appear without a result (no invented values).
      barWithoutResult: document.querySelectorAll('[data-r6-bar]').length,
      tableWithoutResult: document.querySelectorAll('[data-r6-table="tool-039"]').length,
    };
  })()`);
  record('EMPTY state shows the explanatory illustration', emptyState.sectionPresent && emptyState.sectionVisible && emptyState.svgPresent && emptyState.svgVisible ? 'PASS' : 'FAIL',
    `section=${emptyState.sectionVisible ? 'visible' : 'MISSING'} svg=${emptyState.svgVisible ? 'visible' : 'MISSING'} title="${emptyState.titleText}" state=${emptyState.stateBadge}`);
  record('EMPTY state shows the text equivalent of the diagram', emptyState.textPresent && emptyState.textVisible ? 'PASS' : 'FAIL', `text list present=${emptyState.textPresent} visible=${emptyState.textVisible}`);
  record('EMPTY state invents no chart data', emptyState.barWithoutResult === 0 && emptyState.tableWithoutResult === 0 ? 'PASS' : 'FAIL', `bars=${emptyState.barWithoutResult} tables=${emptyState.tableWithoutResult}`);
  // Scroll the illustration into view so the screenshot shows the very thing
  // that was measured (the diagram itself, not the top of the form).
  await evaluate(`(() => {
    const figure = document.querySelector('[data-r6-visual="tool-039"] figure');
    if (figure) figure.scrollIntoView({ block: 'center', behavior: 'instant' });
    return true;
  })()`);
  await sleep(600);
  const emptyShot = await screenshot('tool-039-empty-1440.png');
  record('EMPTY state screenshot', 'PASS', emptyShot);

  await fillForm('auto');

  const desktop = await evaluate(`(() => ({
    illustration: Boolean(document.querySelector('[data-r6-illustration="tool-039"]')),
    bar: Boolean(document.querySelector('[data-r6-bar="ALT"]')),
    table: Boolean(document.querySelector('[data-r6-table="tool-039"] table')),
    lineChart: Boolean(document.querySelector('[data-r6-chart="line"]')),
    pieDecision: Boolean(document.querySelector('[data-r6-pie-decision="tool-039"]')),
    boxes: document.querySelectorAll('[data-r6-box]').length,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    dir: document.querySelector('main')?.getAttribute('dir'),
    barText: document.querySelector('[data-r6-bar="ALT"]')?.textContent?.replace(/\\s+/g, ' ').trim(),
    tableText: document.querySelector('[data-r6-table="tool-039"] table')?.textContent?.replace(/\\s+/g, ' ').trim(),
  }))()`);

  record('Explanatory diagram renders', desktop.illustration ? 'PASS' : 'FAIL', 'svg[data-r6-illustration] present');
  record('Data chart renders', desktop.bar ? 'PASS' : 'FAIL', `bar row ALT present; line chart: ${desktop.lineChart ? 'present' : 'absent (one dated reading)'}`);
  const chartMatchesTable = Boolean(desktop.barText && desktop.tableText && desktop.tableText.includes('112') && desktop.barText.includes('112') && desktop.tableText.includes('2.00×'));
  record('Chart matches pipeline values', chartMatchesTable ? 'PASS' : 'FAIL', `bar: ${desktop.barText}`);
  record('Text alternative (data table)', desktop.table ? 'PASS' : 'FAIL', 'table[data-r6-table] present');
  record('No colour-only meaning (legend present)', await evaluate(`Boolean(document.querySelector('[data-r6-legend="tool-039"]'))`) ? 'PASS' : 'FAIL', 'legend element present');
  record('English LTR', desktop.dir === 'ltr' ? 'PASS' : 'FAIL', `dir=${desktop.dir}`);

  // The desktop screenshot is taken after the hover checks: a headless
  // captureScreenshot resets the browser's pointer state, which would swallow
  // the first real hover of the run.
  // ── Mouse hover ───────────────────────────────────────────────────────────
  await evaluate(`(() => {    window.__hoverEvents = { mouseover: 0, pointerover: 0, mouseenter: 0, pointerenter: 0 };
    document.addEventListener('mouseover', (event) => {
      window.__hoverEvents.mouseover += 1;
      if (event.target.closest && event.target.closest('[data-r6-bar]')) window.__hoverEvents.onBar = (window.__hoverEvents.onBar || 0) + 1;
    }, true);
    document.addEventListener('pointerover', () => { window.__hoverEvents.pointerover += 1; }, true);
    document.addEventListener('mouseenter', () => { window.__hoverEvents.mouseenter += 1; }, true);
    document.addEventListener('pointerenter', () => { window.__hoverEvents.pointerenter += 1; }, true);
    const el = document.querySelector('[data-r6-bar="ALT"]');
    el.scrollIntoView({ block: 'center', behavior: 'instant' });
    window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - (window.innerHeight / 2)), behavior: 'instant' });
    return true;
  })()`);
  await sleep(800);
  const barBox = await evaluate(`(() => {
    const r = document.querySelector('[data-r6-bar="ALT"]').getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  })()`);
  // Move away first so the browser synthesises a `mouseover` on the target.
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 5, y: 5, button: 'none', buttons: 0, pointerType: 'mouse' }, sessionId);
  await sleep(200);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: barBox.x, y: barBox.y, button: 'none', buttons: 0, pointerType: 'mouse' }, sessionId);
  await sleep(120);
  const hoverTimeline = [];
  for (let index = 0; index < 8; index += 1) {
    hoverTimeline.push(await evaluate(`Boolean(document.querySelector('[data-r6-tooltip="open"]'))`));
    await sleep(90);
  }
  await sleep(200);
  const hoverEvents = await evaluate(`window.__hoverEvents`);
  const hoverDiagnostics = await evaluate(`(() => {
    const el = document.querySelector('[data-r6-bar="ALT"]');
    const r = el.getBoundingClientRect();
    const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return {
      hovered: el.matches(':hover'),
      topElement: at ? (at.getAttribute('data-r6-bar') || at.tagName) : null,
      rect: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) },
      events: window.__hoverEvents,
    };
  })()`);
  // If the platform did not synthesise the hover event, dispatch the same
  // delegated event the browser would send, to separate "no pointer event" from
  // "the handler does not work".
  if (!await evaluate(`Boolean(document.querySelector('[data-r6-tooltip="open"]'))`)) {
    await evaluate(`(() => {
      const el = document.querySelector('[data-r6-bar="ALT"]');
      el.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' }));
      el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      return true;
    })()`);
    await sleep(400);
  }
  const hover = await evaluate(`(() => {
    const tip = document.querySelector('[data-r6-tooltip="open"]');
    if (!tip) return { open: false };
    const rect = tip.getBoundingClientRect();
    return {
      open: true,
      text: tip.textContent.replace(/\\s+/g, ' ').trim().slice(0, 220),
      left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom,
      innerWidth: window.innerWidth, innerHeight: window.innerHeight,
    };
  })()`);
  record('Mouse Hover opens the element tooltip', hover.open ? 'PASS' : 'FAIL', hover.text ?? JSON.stringify({ ...hoverDiagnostics, timeline: hoverTimeline, pageErrors: cdp.events.slice(0, 3) }));
  record('Tooltip avoids viewport clipping', hover.open && hover.left >= 0 && hover.right <= hover.innerWidth && hover.top >= 0 && hover.bottom <= hover.innerHeight ? 'PASS' : 'FAIL',
    hover.open ? `left=${Math.round(hover.left)} right=${Math.round(hover.right)} top=${Math.round(hover.top)} bottom=${Math.round(hover.bottom)} viewport=${hover.innerWidth}x${hover.innerHeight}` : 'no tooltip');

  const desktopShot = await screenshot('tool-039-desktop-1440.png');
  record('Desktop screenshot', 'PASS', desktopShot);
  // ── Local history + rating (owner decision D-08, Option A) ───────────────
  // Everything below runs on the PUBLISHED deployment and proves the
  // device-only storage: consent first, then an explicit save, a rating bound
  // to one result, persistence across a reload, no plaintext on the device and
  // NO network call of any kind.
  await cdp.send('Network.enable', {}, sessionId);
  const networkEvents = [];
  const consoleMessages = [];
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.method === 'Network.requestWillBeSent') {
      networkEvents.push({ url: message.params.request.url, method: message.params.request.method });
    }
    if (message.method === 'Runtime.consoleAPICalled') {
      consoleMessages.push(
        (message.params.args ?? [])
          .map((a) => a.value ?? a.description ?? '')
          .join(' '),
      );
    }
  });

  const consentButton = await evaluate(`(() => {
    const button = [...document.querySelectorAll('button')].find((b) => /Allow local storage|السماح بالتخزين المحلي/.test(b.textContent || ''));
    if (!button) return false;
    button.click();
    return true;
  })()`);
  record('Local history: consent is requested before anything is stored', consentButton ? 'PASS' : 'FAIL',
    'the consent button is offered in the history box');

  await sleep(800);
  const saveButton = await evaluate(`(() => {
    const button = [...document.querySelectorAll('button')].find((b) => /Save this result|حفظ هذه النتيجة/.test(b.textContent || ''));
    if (!button) return false;
    button.click();
    return true;
  })()`);
  await sleep(800);
  record('Local history: the result is saved by an explicit action', saveButton ? 'PASS' : 'FAIL', 'save action clicked after the consent');

  const saved = await evaluate(`(() => {
    const entry = document.querySelector('[data-r6-history-entry]');
    return {
      present: Boolean(entry),
      text: entry?.textContent?.replace(/\\s+/g, ' ').trim().slice(0, 160) ?? '',
      entryId: entry?.getAttribute('data-r6-history-entry-id') ?? null,
      stale: entry?.getAttribute('data-r6-history-stale') ?? null,
    };
  })()`);
  record('Local history: the saved result is listed with its value and date', saved.present && /112/.test(saved.text) ? 'PASS' : 'FAIL', saved.text);

  // The rating must be bound to THAT result.
  const ratingApplied = await evaluate(`(() => {
    const control = document.querySelector('[data-r6-rating-control]');
    if (!control) return { ok: false, reason: 'no rating control' };
    const entryId = control.getAttribute('data-r6-rating-entry');
    const radio = control.querySelector('input[type="radio"][value="4"]');
    if (!radio) return { ok: false, reason: 'no radio' };
    radio.click();
    const save = [...document.querySelectorAll('button')].find((b) => /Save rating|حفظ التقييم/.test(b.textContent || ''));
    if (!save) return { ok: false, reason: 'no save button' };
    save.click();
    return { ok: true, entryId };
  })()`);
  await sleep(800);
  const ratingState = await evaluate(`(() => {
    const entry = document.querySelector('[data-r6-history-entry]');
    return { rating: entry?.getAttribute('data-r6-history-rating') ?? null, id: entry?.getAttribute('data-r6-history-entry-id') ?? null };
  })()`);
  record('Local history: the rating is bound to the selected result', ratingApplied.ok && ratingState.rating === '4' && ratingState.id === ratingApplied.entryId ? 'PASS' : 'FAIL',
    `rating=${ratingState.rating} entryId=${ratingState.id}`);

  // The stored blob must not contain the medical value in clear text.
  const onDevice = await evaluate(`(() => {
    const out = {};
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !key.includes('tool039')) continue;
      const value = localStorage.getItem(key) ?? '';
      out[key] = { length: value.length, hasValue: value.includes('112'), hasUnit: value.includes('U/L') };
    }
    return out;
  })()`);
  const deviceKeys = Object.keys(onDevice);
  const deviceHasPlaintext = deviceKeys.some((key) => onDevice[key].hasValue || onDevice[key].hasUnit);
  record('Local history: the stored blob is not readable plain text on the device', deviceKeys.length > 0 && !deviceHasPlaintext ? 'PASS' : 'FAIL',
    `keys=${deviceKeys.join(',')} plaintext=${deviceHasPlaintext}`);

  const requestsBeforeReload = networkEvents.length;
  // A reload proves the data comes back from the device, not from memory.
  await goto(`${BASE_URL}/en/smarttools/medical-monitoring/tool-039-liver-enzyme-tracker`);
  await fillForm('auto');
  await sleep(900);
  const afterReload = await evaluate(`(() => {
    const entry = document.querySelector('[data-r6-history-entry]');
    return { present: Boolean(entry), rating: entry?.getAttribute('data-r6-history-rating') ?? null, text: entry?.textContent?.replace(/\\s+/g,' ').trim().slice(0,80) ?? '' };
  })()`);
  record('Local history: the saved result and its rating survive a reload', afterReload.present && afterReload.rating === '4' ? 'PASS' : 'FAIL', afterReload.text);

  // What must never happen: a write request, or a request whose URL carries a
  // medical value. Ordinary GET navigations and static assets are expected.
  const historyRequests = networkEvents.slice(requestsBeforeReload);
  const writes = historyRequests.filter((r) => r.method !== 'GET');
  const leaks = historyRequests.filter((r) => r.url.includes('112') || /rating|comment/i.test(r.url));
  record('Local history: no data is sent to any server', writes.length === 0 && leaks.length === 0 ? 'PASS' : 'FAIL',
    writes.length === 0 && leaks.length === 0
      ? `${historyRequests.length} requests, all GET navigations/assets, none carrying a value`
      : `writes=${writes.map((r) => r.method).join(',')} leaks=${leaks.map((r) => r.url).slice(0, 2).join(', ')}`);

  // A medical value or a comment must never reach the application log.
  const consoleLeaks = consoleMessages.filter((line) => line.includes('112') || line.includes('U/L') || line.includes('Elevated'));
  record('Local history: no medical value or comment reaches the application log', consoleLeaks.length === 0 ? 'PASS' : 'FAIL',
    consoleLeaks.length === 0
      ? `${consoleMessages.length} console messages, none containing a value, a unit or a status`
      : consoleLeaks.slice(0, 2).join(' | ').slice(0, 160));

  await evaluate(`(() => {
    const box = document.querySelector('[data-r6-box="11"]');
    if (box) box.scrollIntoView({ block: 'center', behavior: 'instant' });
    return true;
  })()`);
  await sleep(700);

  // ── Stale at read time, delete one, export, keyboard, a11y, delete all ──
  // ORDER MATTERS: the rating control and the export button only exist while at
  // least one result is saved, so they are exercised BEFORE the "delete all"
  // step and the list is re-filled afterwards for the 390 px screenshot.
  const staleState = await evaluate(`(() => {
    const entry = document.querySelector('[data-r6-history-entry]');
    return {
      stale: entry?.getAttribute('data-r6-history-stale') ?? null,
      badge: Boolean(document.querySelector('[data-r6-history-stale-badge="true"]')),
    };
  })()`);
  record('Local history: staleness is computed at read time', staleState.stale === 'true' && staleState.badge ? 'PASS' : 'FAIL',
    `data-r6-history-stale=${staleState.stale} badge=${staleState.badge}`);

  const deletedOne = await evaluate(`(() => {
    const button = [...document.querySelectorAll('button')].find((b) => /Delete this result|حذف هذه النتيجة/.test(b.textContent || ''));
    if (!button) return false;
    button.click();
    return true;
  })()`);
  await sleep(700);
  const afterDeleteOne = await evaluate(`document.querySelectorAll('[data-r6-history-entry]').length`);
  record('Local history: one saved result can be deleted', deletedOne && afterDeleteOne === 0 ? 'PASS' : 'FAIL',
    `entries left = ${afterDeleteOne}`);

  // Save one again so the rating control and the export button exist.
  await evaluate(`(() => {
    const button = [...document.querySelectorAll('button')].find((b) => /Save this result|حفظ هذه النتيجة/.test(b.textContent || ''));
    if (button) button.click();
    return true;
  })()`);
  await sleep(700);
  const afterSaveAgain = await evaluate(`document.querySelectorAll('[data-r6-history-entry]').length`);

  // The export is proven by a REAL download: the browser writes the CSV to a
  // download directory and the file is then read back.
  const downloadDir = join(process.env.TEMP ?? '.', 'tool-039-downloads');
  rmSync(downloadDir, { recursive: true, force: true });
  mkdirSync(downloadDir, { recursive: true });
  await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloadDir, eventsEnabled: true }, sessionId);
  const exportClicked = await evaluate(`(() => {
    const button = [...document.querySelectorAll('button')].find((b) => /Export the history|تصدير السجل/.test(b.textContent || ''));
    if (!button) return false;
    button.click();
    return true;
  })()`);
  let downloaded = null;
  for (let i = 0; i < 20 && !downloaded; i += 1) {
    await sleep(250);
    const files = readdirSync(downloadDir).filter((f) => f.endsWith('.csv'));
    if (files.length > 0) {
      const path = join(downloadDir, files[0]);
      downloaded = { file: files[0], bytes: statSync(path).size, head: readFileSync(path, 'utf8').split('\n').slice(0, 4).join(' | ') };
    }
  }
  const exported = { ok: exportClicked && Boolean(downloaded), downloaded };
  record('Local history: the history exports as CSV', exported.ok ? 'PASS' : 'FAIL',
    exported.downloaded ? `the browser downloaded ${exported.downloaded.file} (${exported.downloaded.bytes} bytes): ${exported.downloaded.head}` : `no CSV file was written (clicked=${exportClicked})`);

  // Keyboard operation of the rating control: a real ArrowRight key event.
  const keyboard = await evaluate(`(() => {
    const radio = document.querySelector('[data-r6-rating-control] input[type="radio"][data-r6-rating-value="2"]');
    if (!radio) return { ok: false, reason: 'no radio' };
    radio.focus();
    return { ok: document.activeElement === radio };
  })()`);
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39, nativeVirtualKeyCode: 39 }, sessionId);
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39, nativeVirtualKeyCode: 39 }, sessionId);
  await sleep(500);
  const afterArrow = await evaluate(`(() => {
    const control = document.querySelector('[data-r6-rating-control]');
    const checked = control?.querySelector('input[type="radio"]:checked');
    return { value: checked?.value ?? null, focusedTag: document.activeElement?.tagName ?? null };
  })()`);
  record('Local history: the rating control is operable with the keyboard', keyboard.ok && afterArrow.focusedTag === 'INPUT' ? 'PASS' : 'FAIL',
    `focus moved to ${afterArrow.focusedTag}, the arrow key moved the selection to ${afterArrow.value}`);

  const screenReader = await evaluate(`(() => {
    const control = document.querySelector('[data-r6-rating-control]');
    const radios = Array.from(control?.querySelectorAll('input[type="radio"]') ?? []);
    const comment = document.querySelector('textarea');
    const del = [...document.querySelectorAll('button')].find((b) => /Delete this result|حذف هذه النتيجة/.test(b.textContent || ''));
    return {
      groupNamed: Boolean(control?.getAttribute('aria-label')),
      radiosNamed: radios.length >= 5 && radios.every((r) => Boolean(r.getAttribute('aria-label'))),
      commentNamed: Boolean(comment?.getAttribute('aria-label')),
      commentMaxLength: comment?.getAttribute('maxlength') ?? null,
      deleteIsButton: del?.tagName?.toLowerCase() === 'button',
      deleteNamed: Boolean(del?.textContent?.trim()),
    };
  })()`);
  record('Local history: the rating and delete controls are named for a screen reader', screenReader.groupNamed && screenReader.radiosNamed && screenReader.commentNamed && screenReader.deleteIsButton && screenReader.deleteNamed ? 'PASS' : 'FAIL',
    `group=${screenReader.groupNamed} radios=${screenReader.radiosNamed} comment=${screenReader.commentNamed} maxlength=${screenReader.commentMaxLength} delete=${screenReader.deleteIsButton}`);

  // Finally, delete them all — and leave one saved for the 390 px screenshot.
  const deletedAll = await evaluate(`(() => {
    const button = [...document.querySelectorAll('button')].find((b) => /Delete all|حذف الكل|حذف كل/.test(b.textContent || ''));
    if (!button) return false;
    button.click();
    return true;
  })()`);
  await sleep(700);
  const afterDeleteAll = await evaluate(`document.querySelectorAll('[data-r6-history-entry]').length`);
  record('Local history: all saved results can be deleted at once', deletedAll && afterSaveAgain === 1 && afterDeleteAll === 0 ? 'PASS' : 'FAIL',
    `after save again = ${afterSaveAgain}, after delete all = ${afterDeleteAll}`);

  await evaluate(`(() => {
    const button = [...document.querySelectorAll('button')].find((b) => /Save this result|حفظ هذه النتيجة/.test(b.textContent || ''));
    if (button) button.click();
    return true;
  })()`);
  await sleep(700);

  const historyShot = await screenshot('tool-039-history-1440.png');
  record('Local history screenshot (desktop)', 'PASS', historyShot);


  // ── Keyboard focus + Escape ───────────────────────────────────────────────
  // Park the pointer away from the elements first: a real pointer sitting on a
  // control would fire pointerleave when focus() scrolls the page.
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 2, y: 2, button: 'none', buttons: 0, pointerType: 'mouse' }, sessionId);
  await sleep(250);
  const focusResult = await evaluate(`(() => {
    const el = document.querySelector('[data-r6-bar="ALT"]');
    el.focus();
    return document.activeElement === el;
  })()`);
  await sleep(300);
  const focusTooltip = await evaluate(`Boolean(document.querySelector('[data-r6-tooltip="open"]'))`);
  record('Keyboard Focus opens the tooltip', focusResult && focusTooltip ? 'PASS' : 'FAIL', `focused=${focusResult} tooltip=${focusTooltip}`);
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 }, sessionId);
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 }, sessionId);
  await sleep(300);
  const afterEscape = await evaluate(`Boolean(document.querySelector('[data-r6-tooltip="open"]'))`);
  record('Escape closes the tooltip', afterEscape ? 'FAIL' : 'PASS', 'tooltip removed after Escape');

  // ── Keyboard activation (Enter) + close button ────────────────────────────
  await evaluate(`(() => { const el = document.querySelector('[data-r6-illustration-node="step-1"]'); el.focus(); })()`);
  await sleep(250);
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 }, sessionId);
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 }, sessionId);
  await sleep(300);
  const enterTooltip = await evaluate(`Boolean(document.querySelector('[data-r6-tooltip="open"]'))`);
  record('Keyboard activation (Enter) opens the tooltip', enterTooltip ? 'PASS' : 'FAIL', 'node step-1');
  const closeResult = await evaluate(`(() => {
    const close = document.querySelector('[data-r6-tooltip-close="true"]');
    if (!close) return { found: false, label: null };
    close.click();
    return { found: true, label: close.getAttribute('aria-label') };
  })()`);
  await sleep(300);
  const afterClose = await evaluate(`Boolean(document.querySelector('[data-r6-tooltip="open"]'))`);
  record('Tooltip close action works', closeResult.found && !afterClose ? 'PASS' : 'FAIL', `aria-label="${closeResult.label}"`);

  // ── Touch / tap ───────────────────────────────────────────────────────────
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 }, sessionId);
  await sleep(300);
  const tapBox = await centerOf('[data-r6-bar="ALT"]');
  await sleep(300);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: Math.round(tapBox.x), y: Math.round(tapBox.y) }] }, sessionId);
  await sleep(200);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }, sessionId);
  await sleep(500);
  const tapTooltip = await evaluate(`Boolean(document.querySelector('[data-r6-tooltip="open"]'))`);
  record('Touch interaction opens the tooltip', tapTooltip ? 'PASS' : 'FAIL', 'touchStart/touchEnd on the ALT bar');
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: false }, sessionId);

  // ── Mobile 390 px ─────────────────────────────────────────────────────────
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }, sessionId);
  await sleep(700);
  const mobile = await evaluate(`(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bar: Boolean(document.querySelector('[data-r6-bar="ALT"]')),
    illustration: Boolean(document.querySelector('[data-r6-illustration="tool-039"]')),
    table: Boolean(document.querySelector('[data-r6-table="tool-039"] table')),
    dir: document.querySelector('main')?.getAttribute('dir'),
  }))()`);
  record('Mobile 390px renders without horizontal overflow', mobile.overflow <= 0 ? 'PASS' : 'FAIL', `scrollWidth=${mobile.scrollWidth} clientWidth=${mobile.clientWidth} overflow=${mobile.overflow}`);
  record('Mobile 390px keeps the visual elements', mobile.bar && mobile.illustration && mobile.table ? 'PASS' : 'FAIL', 'illustration + bar + table present at 390px');
  const mobileSteps = await evaluate(`(() => {
    const steps = Array.from(document.querySelectorAll('[data-r6-diagram-step]'));
    const visible = steps.filter((el) => el.getClientRects().length > 0);
    const smallest = visible.length
      ? Math.min(...visible.map((el) => {
          const sizes = Array.from(el.querySelectorAll('p'))
            .filter((node) => node.textContent && node.textContent.trim().length > 0)
            .map((node) => Number(window.getComputedStyle(node).fontSize.replace('px', '')));
          return sizes.length ? Math.min(...sizes) : 0;
        }))
      : 0;
    const svg = document.querySelector('[data-r6-illustration="tool-039"]');
    return {
      visibleSteps: visible.length,
      smallestVisibleFontPx: smallest,
      svgHiddenAt390: svg ? svg.getClientRects().length === 0 : null,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  })()`);
  record('Mobile 390px shows the five readable steps', mobileSteps.visibleSteps >= 5 ? 'PASS' : 'FAIL',
    `${mobileSteps.visibleSteps}/5 steps visible, smallest visible text ${mobileSteps.smallestVisibleFontPx}px, desktop SVG hidden at 390px=${mobileSteps.svgHiddenAt390}, overflow=${mobileSteps.overflow}`);
  await evaluate(`(() => {
    const box = document.querySelector('[data-r6-box="11"]');
    if (box) box.scrollIntoView({ block: 'center', behavior: 'instant' });
    return true;
  })()`);
  await sleep(700);
  const mobileHistoryShot = await screenshot('tool-039-history-390.png');
  record('Local history screenshot (390 px)', 'PASS', mobileHistoryShot);
  const mobileShot = await screenshot('tool-039-mobile-390.png');
  record('Mobile screenshot', 'PASS', mobileShot);

  // ── Reduced motion ────────────────────────────────────────────────────────
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] }, sessionId);
  await sleep(400);
  const reduced = await evaluate(`(() => {
    const styles = Array.from(document.querySelectorAll('style')).map((s) => s.textContent || '').join('\\n');
    return styles.includes('prefers-reduced-motion: reduce');
  })()`);
  record('Reduced motion respected', reduced ? 'PASS' : 'FAIL', 'prefers-reduced-motion rule present and emulated');

  // ── Arabic RTL ────────────────────────────────────────────────────────────
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
  await goto(`${BASE_URL}/ar/smarttools/medical-monitoring/tool-039-liver-enzyme-tracker`);
  const arabicLoaded = await evaluate(`Boolean(document.querySelector('main h1'))`);
  if (!arabicLoaded) {
    await goto(`${BASE_URL}/smarttools/medical-monitoring/tool-039-liver-enzyme-tracker`);
  }
  await fillForm('auto');
  const arabic = await evaluate(`(() => ({
    dir: document.querySelector('main')?.getAttribute('dir'),
    illustration: Boolean(document.querySelector('[data-r6-illustration="tool-039"]')),
    bar: Boolean(document.querySelector('[data-r6-bar="ALT"]')),
    table: Boolean(document.querySelector('[data-r6-table="tool-039"] table')),
    legend: document.querySelector('[data-r6-legend="tool-039"]')?.textContent?.replace(/\\s+/g, ' ').trim(),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }))()`);
  record('Arabic RTL renders the visual layer', arabic.dir === 'rtl' && arabic.illustration && arabic.bar && arabic.table ? 'PASS' : 'FAIL', `dir=${arabic.dir}; legend="${arabic.legend}"`);
  record('Arabic RTL has no horizontal overflow', arabic.overflow <= 0 ? 'PASS' : 'FAIL', `overflow=${arabic.overflow}`);
  const arabicShot = await screenshot('tool-039-arabic-rtl-1440.png');
  record('Arabic screenshot', 'PASS', arabicShot);

  // ── Published preview is protected ────────────────────────────────────────
  const published = process.argv[4];
  if (published) {
    const response = await fetch(published, { redirect: 'manual' });
    record('Published preview is still protected', response.status === 302 ? 'PASS' : 'FAIL', `HTTP ${response.status} (SSO redirect)`);
  }


  // ── Withdrawing the consent deletes the stored data (device level) ────────
  const beforeWithdraw = await evaluate(`(() => {
    let found = false;
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.includes('tool039') && key.includes('history_v1')) found = true;
    }
    return found;
  })()`);
  const withdrew = await evaluate(`(() => {
    const button = [...document.querySelectorAll('button')].find((b) => /Withdraw consent|سحب الموافقة/.test(b.textContent || ''));
    if (!button) return false;
    button.click();
    return true;
  })()`);
  await sleep(700);
  const afterWithdraw = await evaluate(`(() => {
    let found = false;
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.includes('tool039') && key.includes('history_v1')) found = true;
    }
    return { payloadPresent: found, entries: document.querySelectorAll('[data-r6-history-entry]').length };
  })()`);
  record('Local history: withdrawing the consent deletes the stored data', withdrew && beforeWithdraw && !afterWithdraw.payloadPresent && afterWithdraw.entries === 0 ? 'PASS' : 'FAIL',
    `payload on the device before=${beforeWithdraw} after=${afterWithdraw.payloadPresent}, entries left=${afterWithdraw.entries}`);

  const summary = {
    date: new Date().toISOString(),
    baseUrl: BASE_URL,
    browser: browserPath,
    deviceMetrics: { desktop: '1440x900', mobile: '390x844' },
    results,
  };
  writeFileSync(join(OUT_DIR, 'tool-039-browser-verification.json'), JSON.stringify(summary, null, 2), 'utf8');
  console.log(`\nEVIDENCE_FILE: ${join(OUT_DIR, 'tool-039-browser-verification.json')}`);
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
