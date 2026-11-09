#!/usr/bin/env node
/**
 * scripts/r6/verify-routes.mjs
 *
 * Starts the production build and checks every slug in a batch list in both
 * EN and AR:
 *  - HTTP 200
 *  - shared progress marker present
 *  - non-frozen tools: data-r6-shell + C1..C12 present
 *  - frozen tools: no duplicate shell (they render their own boxes)
 *
 * Usage: node scripts/r6/verify-routes.mjs scripts/r6/batch-01.txt
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execSync } from 'node:child_process';

const root = process.cwd();
const listFile = process.argv[2] ?? 'scripts/r6/batch-01.txt';
const PORT = Number(process.env.R6_VERIFY_PORT ?? 3111);
const BASE = `http://127.0.0.1:${PORT}`;

const FROZEN = new Set([
  'tool-111-smart-food-macro-substitution',
  'tool-132-ai-pose-form-coach',
  'tool-137-peptide-hormone-reconstitution-calculator',
  'tool-138-raw-powder-density-oil-formulation-engine',
  'tool-139-solvent-emulsifier-ratio-calculator',
]);

const slugs = fs
  .readFileSync(path.resolve(root, listFile), 'utf8')
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'))
  .map((line) => path.basename(line).replace(/\.tsx$/, ''));

const catalogDir = path.join(root, 'lib/tools');
let catalog = '';
for (const file of fs.readdirSync(catalogDir).filter((f) => /^smartToolsCatalog.*\.ts$/.test(f))) {
  catalog += fs.readFileSync(path.join(catalogDir, file), 'utf8') + '\n';
}
const hrefBySlug = new Map();
const metaBySlug = new Map();
const entryRe = /toolId:\s*'([^']+)'[\s\S]*?slug:\s*'([^']+)'[\s\S]*?href:\s*'([^']+)'[\s\S]*?titleEn:\s*'((?:[^'\\]|\\.)*)'[\s\S]*?titleAr:\s*'((?:[^'\\]|\\.)*)'/g;
let match;
while ((match = entryRe.exec(catalog))) {
  hrefBySlug.set(match[2], match[3]);
  metaBySlug.set(match[2], { titleEn: match[4], titleAr: match[5] });
}

async function waitForServer(timeoutMs = 120_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(BASE + '/', { redirect: 'manual' });
      if (response.status < 500) return true;
    } catch {
      // not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

function stopServer(child) {
  if (!child?.pid) return;
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: 'ignore' });
    } else {
      child.kill('SIGTERM');
    }
  } catch {
    // best effort
  }
}

let child;
try {
  child = spawn(
    process.platform === 'win32' ? 'npm.cmd' : 'npm',
    ['run', 'start', '--', '-p', String(PORT)],
    { cwd: root, shell: true, env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' }
  );

  if (!(await waitForServer())) {
    console.error('Server did not become ready in time.');
    process.exit(1);
  }

  let checked = 0;
  const failures = [];

  for (const slug of slugs) {
    const href = hrefBySlug.get(slug);
    if (!href) {
      failures.push(`${slug}: no catalog href`);
      continue;
    }

    for (const locale of ['en', 'ar']) {
      // Locale comes from the URL prefix (middleware rewrites /ar/* and sets
      // x-locale); a raw x-locale header is ignored by the middleware.
      const url = locale === 'ar' ? `${BASE}/ar${href}` : `${BASE}${href}`;
      const response = await fetch(url, { redirect: 'follow' });
      const html = await response.text();
      checked += 1;

      if (response.status !== 200) {
        failures.push(`${slug} [${locale}]: HTTP ${response.status}`);
        continue;
      }
      if (!html.includes('data-r6-progress')) {
        failures.push(`${slug} [${locale}]: progress marker missing`);
      }

      if (FROZEN.has(slug)) {
        if (html.includes('data-r6-shell')) {
          failures.push(`${slug} [${locale}]: frozen tool received the shell (duplicate boxes)`);
        }
        // Frozen tools own their UI (some render boxes only after a
        // calculation), so prove the page rendered by its title instead.
        const meta = metaBySlug.get(slug);
        const expected = locale === 'ar' ? meta?.titleAr : meta?.titleEn;
        const decoded = html.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&#39;/g, "'");
        if (!expected || !decoded.includes(expected)) {
          failures.push(`${slug} [${locale}]: frozen tool title missing`);
        }
      } else {
        if (!html.includes('data-r6-shell')) {
          failures.push(`${slug} [${locale}]: shell marker missing`);
        }
        for (const id of ['C1', 'C6', 'C12']) {
          if (!html.includes(`data-box-id="${id}"`)) {
            failures.push(`${slug} [${locale}]: ${id} missing`);
          }
        }
      }
    }
  }

  if (failures.length > 0) {
    console.error(`FAIL ${failures.length}/${checked}`);
    for (const failure of failures) console.error(` - ${failure}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS ${checked}/${checked} (${slugs.length} routes × EN+AR)`);
  }
} finally {
  stopServer(child);
}
