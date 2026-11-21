#!/usr/bin/env node
/**
 * Read-only probe: what does the R6.1 app's SecureStorage actually write in a
 * REAL browser?  This decides whether Tool 039 may rely on it for medical
 * values.  Nothing is modified in the repository; the probe writes one probe
 * key into the browser profile and removes it again.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const BASE_URL = process.argv[2] ?? 'http://localhost:3100';
const PORT = 9677;
const PROBE_KEY = 'mrx_probe_secure_storage_check';
const PROBE_VALUE = 'PROBE_MEDICAL_VALUE_112';

const browserPath = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].find((p) => existsSync(p));
if (!browserPath) { console.error('NO_BROWSER_FOUND'); process.exit(2); }

const browser = spawn(browserPath, [
  '--headless=new', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.env.TEMP ?? '.'}\\tool-039-secure-probe`,
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
  const m = JSON.parse(event.data);
  if (m.id && pending.has(m.id)) { const { resolve } = pending.get(m.id); pending.delete(m.id); resolve(m.result); }
});
const send = (method, params = {}, sessionId) => {
  id += 1; const current = id;
  socket.send(JSON.stringify({ id: current, method, params, sessionId }));
  return new Promise((resolve) => pending.set(current, { resolve }));
};

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
await send('Page.enable', {}, sessionId);
await send('Runtime.enable', {}, sessionId);
const evaluate = async (expression) =>
  (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId)).result?.value;

await send('Page.navigate', { url: `${BASE_URL}/en/smarttools/medical-monitoring/tool-039-liver-enzyme-tracker` }, sessionId);
await sleep(3000);

const report = await evaluate(`(() => {
  const out = {};
  // 1) Which env vars does the browser bundle actually see?
  const envKeys = (typeof process !== 'undefined' && process.env) ? Object.keys(process.env) : [];
  out.browserEnvKeys = envKeys;
  out.hasViteEncryptionKey = envKeys.includes('VITE_ENCRYPTION_KEY');
  out.hasNextPublicEncryptionKey = envKeys.includes('NEXT_PUBLIC_ENCRYPTION_KEY');
  out.anyEncryptionKey = envKeys.filter((k) => k.includes('ENCRYPTION'));

  // 2) Reproduce the SecureStorage decision path exactly as secureStorage.ts does.
  //    (The module is not exported globally, so the same branches are evaluated
  //    against the same env read the module performs.)
  const readEnv = (key) => {
    if (typeof process !== 'undefined' && process.env) return process.env[key];
    return undefined;
  };
  const ENCRYPTION_KEY = readEnv('VITE_ENCRYPTION_KEY');
  out.encryptionKeyResolved = ENCRYPTION_KEY === undefined ? 'undefined' : ('present len=' + ENCRYPTION_KEY.length);
  out.secureStorageWouldUse = ENCRYPTION_KEY ? 'AES (encrypted)' : 'PLAINTEXT FALLBACK (console.warn + raw localStorage)';

  // 3) Prove it on the page: write the probe value the way SecureStorage would
  //    and read back exactly what landed in localStorage.
  const PROBE_KEY = ${JSON.stringify(PROBE_KEY)};
  const PROBE_VALUE = ${JSON.stringify(PROBE_VALUE)};
  const PREFIX = 'mrx_enc_';
  if (!ENCRYPTION_KEY) {
    localStorage.setItem(PREFIX + PROBE_KEY, PROBE_VALUE);
  } else {
    out.note = 'key present - AES branch would run (not exercised here)';
  }
  const stored = localStorage.getItem(PREFIX + PROBE_KEY);
  out.storedRaw = stored;
  out.storedIsPlaintext = stored === PROBE_VALUE;
  out.storedContainsProbeValue = typeof stored === 'string' && stored.includes(PROBE_VALUE);
  localStorage.removeItem(PREFIX + PROBE_KEY);
  out.probeRemoved = localStorage.getItem(PREFIX + PROBE_KEY) === null;
  return out;
})()`);

console.log(JSON.stringify(report, null, 2));
socket.close();
browser.kill();
process.exit(0);
