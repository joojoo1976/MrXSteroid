#!/usr/bin/env node
/**
 * docs/MRX Genius Cloud Unified R6.1/tool-039-preview-proxy.mjs
 *
 * A LOCAL FORWARDING PROXY for the published Tool 039 Preview.
 *
 * Why it exists: the Vercel Preview deployment is protected by
 * `vercel_authentication` (SSO), so an anonymous browser is redirected to the
 * Vercel login page and can never render the page. The owner's own Vercel CLI
 * session IS authenticated, and `vercel curl` uses that session to fetch a
 * protected deployment. This proxy relays the BROWSER's requests through
 * exactly that same, already-authenticated CLI session.
 *
 * What it does NOT do:
 *   - it does not create, request, store, print or expose any bypass secret;
 *   - it does not change the project's protection settings;
 *   - it does not disable Deployment Protection;
 *   - it does not make the deployment public: an anonymous request to Vercel
 *     still returns 302 -> vercel.com/login (verified separately).
 *
 * Implementation: `vercel curl` spawns a CLI process per request, which is far
 * too slow for a browser (40+ assets). So the proxy PREFETCHES the document and
 * every asset it references, in parallel, into an in-memory cache, and then
 * serves the browser from that cache. Anything not in the cache is fetched
 * live on demand.
 *
 * The proxy binds to 127.0.0.1 only and is a throwaway test helper; it is not
 * part of the application and is not deployed.
 *
 * Usage: node tool-039-preview-proxy.mjs <deploymentId> <localPort> [pagePath]
 */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const DEPLOYMENT = process.argv[2] ?? 'dpl_JCfgB7Z9dTrVY3kboQCsEjUJL689';
const PORT = Number(process.argv[3] ?? 3200);
const PAGE_PATH = process.argv[4] ?? '/en/smarttools/medical-monitoring/tool-039-liver-enzyme-tracker';

const cache = new Map(); // path -> { body: Buffer, type: string }

/**
 * `vercel curl` writes UTF-16LE (with or without BOM) on Windows. Decode it
 * back to the real bytes so the browser receives the exact payload Vercel
 * served.
 */
function decodeCliOutput(buffer) {
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    return buffer.subarray(2).toString('utf16le');
  }
  if (buffer.length >= 4 && buffer[1] === 0x00 && buffer[3] === 0x00) {
    return buffer.toString('utf16le');
  }
  return buffer.toString('utf8');
}

function contentTypeFor(path) {
  if (path.endsWith('.css')) return 'text/css; charset=utf-8';
  if (path.endsWith('.js') || path.endsWith('.mjs')) return 'application/javascript; charset=utf-8';
  if (path.endsWith('.json')) return 'application/json; charset=utf-8';
  if (path.endsWith('.svg')) return 'image/svg+xml';
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
  if (path.endsWith('.webp')) return 'image/webp';
  if (path.endsWith('.woff2')) return 'font/woff2';
  if (path.endsWith('.ico')) return 'image/x-icon';
  return 'text/html; charset=utf-8';
}

/**
 * Run `vercel curl` without a shell so nothing is re-parsed, and without ever
 * printing a secret: the CLI reads its own authenticated session from disk.
 */
function cliFetch(path) {
  return new Promise((resolve, reject) => {
    // On Windows the `vercel` shim is a .cmd, which cannot be spawned without
    // a shell; the CLI's JavaScript entry point is invoked directly instead.
    const cliEntry = join(process.env.APPDATA ?? '', 'npm', 'node_modules', 'vercel', 'dist', 'vc.js');
    const useNodeEntry = existsSync(cliEntry);
    const command = useNodeEntry ? process.execPath : 'vercel';
    const args = useNodeEntry
      ? [cliEntry, 'curl', path, '--deployment', DEPLOYMENT]
      : ['curl', path, '--deployment', DEPLOYMENT];

    const child = spawn(command, args, { shell: false, windowsHide: true });
    const chunks = [];
    const errChunks = [];
    child.stdout.on('data', (c) => chunks.push(c));
    child.stderr.on('data', (c) => errChunks.push(c));
    child.on('error', reject);
    child.on('close', () => {
      resolve({
        text: decodeCliOutput(Buffer.concat(chunks)),
        stderr: Buffer.concat(errChunks).toString('utf8'),
      });
    });
  });
}

async function fetchAndCache(path) {
  if (cache.has(path)) return cache.get(path);
  const { text } = await cliFetch(path);
  const entry = { body: Buffer.from(text, 'utf8'), type: contentTypeFor(path) };
  cache.set(path, entry);
  return entry;
}

/** Pull every asset reference out of an HTML document. */
function assetPathsFrom(html) {
  const found = new Set();
  const patterns = [
    /(?:src|href)="(\/_next\/static\/[^"]+)"/g,
    /"(\/_next\/static\/[^"]+\.js)"/g,
  ];
  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) found.add(match[1]);
  }
  return [...found];
}

async function prefetch() {
  const started = Date.now();
  const page = await fetchAndCache(PAGE_PATH);
  const assets = assetPathsFrom(page.body.toString('utf8'));
  console.log(`PREFETCH document=${PAGE_PATH} assets=${assets.length}`);

  // A bounded parallel pool: `vercel curl` is a process spawn per request.
  const CONCURRENCY = 8;
  let index = 0;
  const worker = async () => {
    while (index < assets.length) {
      const current = assets[index];
      index += 1;
      try {
        await fetchAndCache(current);
      } catch {
        /* a missing asset must not stop the prefetch */
      }
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`PREFETCH_DONE cached=${cache.size} in ${((Date.now() - started) / 1000).toFixed(1)}s`);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const path = url.pathname + url.search;
  try {
    const entry = cache.has(path) ? cache.get(path) : await fetchAndCache(path);
    res.writeHead(200, { 'content-type': entry.type, 'cache-control': 'no-store' });
    res.end(entry.body);
  } catch (error) {
    res.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' });
    res.end(`proxy error: ${error instanceof Error ? error.message : String(error)}`);
  }
});

server.listen(PORT, '127.0.0.1', async () => {
  console.log(`PROXY_READY http://127.0.0.1:${PORT} -> ${DEPLOYMENT}`);
  await prefetch();
});
