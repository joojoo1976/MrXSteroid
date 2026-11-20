#!/usr/bin/env node
/**
 * docs/MRX Genius Cloud Unified R6.1/tool-039-two-browsers-check.mjs
 *
 * Owner decision D-08 (Option A): the local history lives in the USER'S OWN
 * BROWSER on the USER'S OWN DEVICE. This check proves that in a REAL browser,
 * with TWO INDEPENDENT browser profiles, the profiles cannot see each other's
 * saved results — the requirement "عدم اختلاط بيانات متصفحين مستقلين".
 *
 * It launches two separate Chrome instances with two separate --user-data-dir
 * profiles against the SAME origin, and checks that a result saved in profile
 * A never appears in profile B.
 *
 * Usage: node tool-039-two-browsers-check.mjs <baseUrl> <outFile>
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const BASE_URL = process.argv[2] ?? 'http://localhost:3100';
const OUT_FILE = process.argv[3] ?? 'docs/MRX Genius Cloud Unified R6.1/evidence/tool039-history/two-browsers.json';
const PAGE = '/en/smarttools/medical-monitoring/tool-039-liver-enzyme-tracker';

const BROWSER = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].find((p) => existsSync(p));
if (!BROWSER) { console.error('NO_BROWSER_FOUND'); process.exit(2); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** One independent browser profile driven through the DevTools Protocol. */
class Profile {
  constructor(port, profileName) {
    this.port = port;
    this.profileDir = join(process.env.TEMP ?? '.', `tool-039-two-browsers-${profileName}`);
    this.process = spawn(BROWSER, [
      '--headless=new', `--remote-debugging-port=${port}`,
      `--user-data-dir=${this.profileDir}`,
      '--no-first-run', '--disable-gpu', '--window-size=1440,900', 'about:blank',
    ], { stdio: 'ignore' });
  }

  async connect() {
    for (let i = 0; i < 60; i += 1) {
      try { const r = await fetch(`http://127.0.0.1:${this.port}/json/version`); if (r.ok) { this.version = await r.json(); return; } } catch { /* retry */ }
      await sleep(500);
    }
    throw new Error(`devtools endpoint for port ${this.port} never became reachable`);
  }

  async open() {
    await this.connect();
    this.socket = new WebSocket(this.version.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { this.socket.addEventListener('open', resolve); this.socket.addEventListener('error', reject); });
    this.id = 0;
    this.pending = new Map();
    this.socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve } = this.pending.get(message.id);
        this.pending.delete(message.id);
        resolve(message.result);
      }
    });
    const { targetId } = await this.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await this.send('Target.attachToTarget', { targetId, flatten: true });
    this.sessionId = sessionId;
    await this.send('Page.enable', {}, sessionId);
    await this.send('Runtime.enable', {}, sessionId);
  }

  send(method, params = {}, sessionId = this.sessionId) {
    this.id += 1;
    const current = this.id;
    this.socket.send(JSON.stringify({ id: current, method, params, sessionId }));
    return new Promise((resolve) => this.pending.set(current, { resolve }));
  }

  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result?.value;
  }

  async fillAndSave() {
    await this.send('Page.navigate', { url: `${BASE_URL}${PAGE}` });
    await sleep(2500);
    // The browser profile persists between runs, so start from a clean device
    // state: otherwise the consent from a previous run is still granted and the
    // "Allow local storage" control would not be offered.
    await this.evaluate(`(() => { localStorage.clear(); return true; })()`);
    await this.send('Page.navigate', { url: `${BASE_URL}${PAGE}` });
    await sleep(2500);
    await this.evaluate(`(() => {
      const add = [...document.querySelectorAll('button')].find((b) => /Add reading/.test(b.textContent || ''));
      if (add) add.click();
      return true;
    })()`);
    await sleep(400);
    await this.evaluate(`(() => {
      const setValue = (el, v) => {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        setter.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      };
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
    // Consent, then the explicit save.
    const consented = await this.evaluate(`(() => {
      const button = [...document.querySelectorAll('button')].find((b) => /Allow local storage/.test(b.textContent || ''));
      if (!button) return false;
      button.click();
      return true;
    })()`);
    await sleep(700);
    const saved = await this.evaluate(`(() => {
      const button = [...document.querySelectorAll('button')].find((b) => /Save this result/.test(b.textContent || ''));
      if (!button) return false;
      button.click();
      return true;
    })()`);
    await sleep(700);
    return { consented, saved };
  }

  async readHistory() {
    return this.evaluate(`(() => {
      const entries = Array.from(document.querySelectorAll('[data-r6-history-entry]'));
      return {
        count: entries.length,
        texts: entries.map((e) => e.textContent?.replace(/\\s+/g, ' ').trim().slice(0, 90) ?? ''),
        deviceKeys: (() => {
          const keys = [];
          for (let i = 0; i < localStorage.length; i += 1) {
            const key = localStorage.key(i);
            if (key && key.includes('tool039')) keys.push(key);
          }
          return keys;
        })(),
      };
    })()`);
  }

  close() {
    try { this.socket?.close(); } catch { /* ignore */ }
    this.process.kill();
  }
}

const profileA = new Profile(9681, 'a');
const profileB = new Profile(9682, 'b');
const results = [];
let exitCode = 0;

try {
  await profileA.open();
  await profileB.open();

  const actionA = await profileA.fillAndSave();
  const historyA = await profileA.readHistory();

  // Profile B never consents and never saves.
  await profileB.send('Page.navigate', { url: `${BASE_URL}${PAGE}` });
  await sleep(2500);
  await profileB.evaluate(`(() => { localStorage.clear(); return true; })()`);
  await profileB.send('Page.navigate', { url: `${BASE_URL}${PAGE}` });
  await sleep(2500);
  const historyB = await profileB.readHistory();

  const isolated = actionA.consented && actionA.saved && historyA.count === 1 && historyB.count === 0;

  results.push({
    requirement: 'Local history: two independent browser profiles never see each other\'s data',
    result: isolated ? 'PASS' : 'FAIL',
    evidence: `profile A: consented=${actionA.consented} saved=${actionA.saved} entries=${historyA.count} deviceKeys=${historyA.deviceKeys.length}; profile B: entries=${historyB.count} deviceKeys=${historyB.deviceKeys.length}`,
  });

  if (!isolated) exitCode = 1;
} catch (error) {
  results.push({
    requirement: 'Local history: two independent browser profiles never see each other\'s data',
    result: 'FAIL',
    evidence: `harness error: ${error instanceof Error ? error.message : String(error)}`,
  });
  exitCode = 3;
} finally {
  profileA.close();
  profileB.close();
}

const artifact = {
  date: new Date().toISOString(),
  build: 'WORKTREE (local production build)',
  baseUrl: BASE_URL,
  browser: BROWSER,
  method: 'Two independent Chrome profiles (separate --user-data-dir) against the same origin.',
  results,
};
mkdirSync(dirname(OUT_FILE), { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify(artifact, null, 2) + '\n', 'utf8');
console.log(JSON.stringify(artifact, null, 2));
process.exit(exitCode);
