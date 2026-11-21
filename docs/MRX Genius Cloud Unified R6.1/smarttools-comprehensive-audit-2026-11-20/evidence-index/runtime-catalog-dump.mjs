#!/usr/bin/env node
// Read-only runtime evaluation of the smartToolsCatalog4 module using the installed
// TypeScript transpiler. Confirms the exact published catalog count without modifying source.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const ROOT = resolve('E:/MrXSteroid-main');
const OUT = join(ROOT, 'docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/evidence-index');
const nodeRequire = createRequire(import.meta.url);
const cache = new Map();

function loadTs(rel) {
  const abs = join(ROOT, rel);
  if (cache.has(abs)) return cache.get(abs).exports;
  const src = readFileSync(abs, 'utf8');
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const mod = { exports: {} };
  cache.set(abs, mod);
  const req = (spec) => {
    if (spec.startsWith('.')) {
      let p = join(dirname(abs), spec);
      if (!existsSync(p) && !p.endsWith('.ts')) p += '.ts';
      return loadTs(relative(ROOT, p).replace(/\\/g, '/'));
    }
    return nodeRequire(spec);
  };
  new Function('require', 'module', 'exports', js)(req, mod, mod.exports);
  return mod.exports;
}

const m = loadTs('lib/tools/smartToolsCatalog4.ts');
const published = m.getPublishedCatalogTools();
const all = m.catalogAll();
const summary = {
  publishedCount: published.length,
  allCount: all.length,
  plannedCount: all.filter((t) => t.status === 'planned').length,
  duplicateToolIds: published.map((t) => t.toolId).filter((v, i, a) => a.indexOf(v) !== i),
  duplicateSlugs: published.map((t) => t.slug).filter((v, i, a) => a.indexOf(v) !== i),
  duplicateHrefs: published.map((t) => t.href).filter((v, i, a) => a.indexOf(v) !== i),
  published: published.map(({ toolId, slug, href, order, status, titleEn, titleAr }) => ({ toolId, slug, href, order, status, titleEn, titleAr })),
};
writeFileSync(join(OUT, 'RUNTIME-PUBLISHED-CATALOG.json'), JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify({ publishedCount: summary.publishedCount, allCount: summary.allCount, plannedCount: summary.plannedCount, dupIds: summary.duplicateToolIds.length, dupSlugs: summary.duplicateSlugs.length, dupHrefs: summary.duplicateHrefs.length }));
