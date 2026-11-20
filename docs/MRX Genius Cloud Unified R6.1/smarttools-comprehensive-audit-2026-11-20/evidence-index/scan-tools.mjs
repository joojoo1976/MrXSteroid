#!/usr/bin/env node
// Read-only deterministic source scanner for the 2026-11-20 SmartTools forensic audit.
// Reads source files and git metadata only. Writes ONLY inside the audit output folder.
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const ROOT = resolve('E:/MrXSteroid-main');
const OUT = join(ROOT, 'docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20');
const EVIDENCE = join(OUT, 'evidence-index');

const git = (args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1024 * 1024 * 20 }).trim();
const tracked = new Set(git(['ls-files']).split('\n').filter(Boolean));
const statusLines = git(['status', '--porcelain=v1', '-uall']).split('\n').filter(Boolean);
const statusByPath = new Map();
for (const line of statusLines) {
  const code = line.slice(0, 2);
  let p = line.slice(3);
  if (p.startsWith('"') && p.endsWith('"')) p = p.slice(1, -1).replace(/\\"/g, '"');
  statusByPath.set(p, code.trim());
}

const catalogFiles = readdirSync(join(ROOT, 'lib/tools')).filter((f) => /^smartToolsCatalog\d*\.ts$/.test(f)).sort();
const tools = [];
// Character-level object-block extraction handles one-line AND multi-line catalog entries,
// including nested bookContext objects, without executing any TypeScript.
function extractBlocks(text) {
  const blocks = [];
  let depth = 0, start = -1, inStr = false, quote = '', esc = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (esc) { esc = false; continue; }
      if (c === '\\') { esc = true; continue; }
      if (c === quote) { inStr = false; quote = ''; }
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = true; quote = c; continue; }
    if (c === '{') { if (depth === 0) start = i; depth++; continue; }
    if (c === '}') {
      depth--;
      if (depth === 0 && start >= 0) {
        const block = text.slice(start, i + 1);
        if (/\btoolId\s*:/.test(block)) blocks.push(block);
        start = -1;
      }
    }
  }
  return blocks;
}
const field = (block, name) => {
  const m = block.match(new RegExp("\\b" + name + "\\s*:\\s*['\"]([^'\"]*)['\"]"));
  return m ? m[1] : '';
};
for (const file of catalogFiles) {
  const text = readFileSync(join(ROOT, 'lib/tools', file), 'utf8');
  // Only parse exported SmartToolEntry array literals; never parse function bodies
  // (validateCatalog contains `toolId:` strings and would otherwise be counted).
  const arrays = [...text.matchAll(/export\s+const\s+\w+\s*:\s*readonly\s+SmartToolEntry\[\]\s*=\s*\[([\s\S]*?)\n\];/g)].map((m) => m[1]);
  const blocks = arrays.flatMap(extractBlocks);
  for (const block of blocks) {
    const entry = {
      toolId: field(block, 'toolId'), slug: field(block, 'slug'), href: field(block, 'href'),
      order: Number((block.match(/\border\s*:\s*(\d+)/) || [])[1] || 0),
      catalogStatus: field(block, 'status') || 'implemented',
      titleEn: field(block, 'titleEn'), titleAr: field(block, 'titleAr'),
      descriptionEn: field(block, 'descriptionEn'), descriptionAr: field(block, 'descriptionAr'),
      componentPath: field(block, 'componentPath'), enginePath: field(block, 'enginePath'), schemaPath: field(block, 'schemaPath'),
      accessTier: field(block, 'accessTier'), catalogFile: file,
    };
    if (entry.toolId && entry.slug) tools.push(entry);
  }
}
const unique = new Map();
for (const t of tools) {
  const key = t.toolId + '|' + t.slug;
  if (!unique.has(key)) unique.set(key, t);
  else unique.get(key).duplicateCatalogFiles = (unique.get(key).duplicateCatalogFiles || []).concat(t.catalogFile);
}
const published = [...unique.values()].filter((t) => t.catalogStatus !== 'planned').sort((a, b) => a.order - b.order);

const allFiles = [];
function walk(dir, out) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|json|mjs|js)$/.test(name)) out.push(relative(ROOT, p).replace(/\\/g, '/'));
  }
}
for (const d of ['app', 'components', 'lib', 'i18n', 'tests']) walk(join(ROOT, d), allFiles);

const DYNAMIC_ROUTE = 'app/smarttools/[category]/[tool]/page.tsx';
function resolvePath(declared, slug, kind) {
  const clean = (declared || '').replace(/^@\//, '');
  const candidates = [];
  if (clean) {
    candidates.push(clean + '.tsx', clean + '.ts', clean + '/index.tsx', clean + '/index.ts');
    // catalog paths may point at a versioned filename with no extension match
    candidates.push(clean.replace(/\.v\d+$/, '') + '.v7.ts');
  }
  for (const c of candidates) if (existsSync(join(ROOT, c))) return { path: c, source: 'catalog-declared' };
  const fb = kind === 'engine' ? ['lib/tools/engines/' + slug + '.ts', 'lib/tools/engines/' + slug + '.v7.ts']
    : kind === 'schema' ? ['lib/tools/schemas/' + slug + '.ts', 'lib/tools/schemas/' + slug + '.v7.ts']
    : ['components/tools/' + slug + '.tsx', 'components/tools/' + slug + '.ts'];
  for (const c of fb) if (existsSync(join(ROOT, c))) return { path: c, source: 'slug-fallback' };
  return { path: '', source: 'MISSING' };
}
function read(rel) { return rel && existsSync(join(ROOT, rel)) ? readFileSync(join(ROOT, rel), 'utf8') : ''; }
function sha256(rel) {
  if (!rel || !existsSync(join(ROOT, rel))) return '';
  return createHash('sha256').update(readFileSync(join(ROOT, rel))).digest('hex').toUpperCase();
}
function lastCommit(rel) {
  if (!rel || !tracked.has(rel)) return '';
  try { return git(['log', '-1', '--format=%h', '--', rel]); } catch { return ''; }
}
function worktreeStatus(rel) {
  if (!rel) return 'MISSING';
  if (statusByPath.has(rel)) return 'DIRTY:' + statusByPath.get(rel);
  if (tracked.has(rel)) return 'CLEAN';
  return 'UNTRACKED';
}

const CRITERIA = [
  ['ROUTE_FILE', (e) => !!e.routeStatic || !!e.routeDynamic],
  ['COMPONENT_FILE', (e) => !!e.component.path],
  ['ENGINE_FILE', (e) => !!e.engine.path],
  ['SCHEMA_FILE', (e) => !!e.schema.path],
  ['PIPELINE_FILE', (e) => !!e.pipeline],
  ['I18N_FILE', (e) => !!e.i18n],
  ['GENIUS_MARKER', (e) => /data-r6-box|GENIUS.?12|box1[12]_title|genius/i.test(e.allCode)],
  ['FIVE_STATES', (e) => ['EMPTY', 'PARTIAL', 'INVALID', 'FULL', 'DEGRADED'].every((s) => e.allCode.includes(s))],
  ['CORE5_COMPACT', (e) => /compact|\[2\s*,\s*3\s*,\s*7\s*,\s*9\s*,\s*12\]|\[2,3,7,9,12\]/i.test(e.allCode)],
  ['PIPELINE_ENVELOPE', (e) => /createToolOutput|isToolOutput|safeParse|tryParse/.test(e.allCode)],
  ['INPUT_VALIDATION', (e) => /z\.object|safeParse|zod|\.parse\(/i.test(e.allCode)],
  ['DYNAMIC_RECALC', (e) => /useState|useMemo|onChange/.test(e.allCode)],
  ['WHAT_IF', (e) => /what.?if|sensitivity/i.test(e.allCode)],
  ['EXPLAINABILITY', (e) => /assumption|uncertainty|why|reason|explain|confidence/i.test(e.allCode)],
  ['SAFETY_MARKER', (e) => /disclaimer|warning|referral|not_a_diagnosis|not_a_prescription|safety/i.test(e.allCode)],
  ['EN_AR_I18N_USAGE', (e) => /pickToolI18n|titleAr|titleEn|locale/.test(e.allCode) && !!e.i18n],
  ['RTL_MARKER', (e) => /dir\s*=|isRtl|isRTL|rtl/.test(e.allCode)],
  ['ACCESSIBILITY', (e) => /aria-|role=|label/i.test(e.allCode)],
  ['TEST_FILE', (e) => e.tests.length > 0],
  ['CAPABILITY_CONTRACT', (e) => /CANNOT|CAN\b|SOURCES|WHY|COST|STOP|RESTORE|capability/i.test(e.allCode)],
];

const rows = [];
const registryText = read('lib/tools/registry.ts');
for (const t of published) {
  const href = t.href.replace(/\/$/, '');
  const routeStatic = 'app' + href + '/page.tsx';
  const routeStaticExists = existsSync(join(ROOT, routeStatic));
  const dynamicExists = existsSync(join(ROOT, DYNAMIC_ROUTE));
  const component = resolvePath(t.componentPath, t.slug, 'component');
  const engine = resolvePath(t.enginePath, t.slug, 'engine');
  const schema = resolvePath(t.schemaPath, t.slug, 'schema');
  const pipelineCandidates = [
    'lib/tools/r6/' + t.slug + '-pipeline.ts',
    'lib/tools/r6/' + t.slug + '.ts',
    'lib/tools/r6/' + t.slug.replace(/^tool-\d+-/, 'tool-') + '-pipeline.ts',
  ];
  const pipeline = pipelineCandidates.find((p) => existsSync(join(ROOT, p))) || '';
  const geniusCandidates = ['components/tools/' + t.slug + '.genius.tsx', 'components/tools/' + t.slug + '-genius.tsx'];
  const genius = geniusCandidates.find((p) => existsSync(join(ROOT, p))) || '';
  const i18nCandidates = ['i18n/' + t.slug + '.json', 'i18n/' + t.slug.replace(/^tool-\d+-/, '') + '.json'];
  const i18n = i18nCandidates.find((p) => existsSync(join(ROOT, p))) || '';
  const tests = allFiles.filter((f) => /(\.test\.|\.spec\.)/.test(f) && (f.includes(t.slug) || f.includes(t.toolId.replace(/^mrx\.tool\./, ''))));
  const codePaths = [component.path, engine.path, schema.path, pipeline, genius, routeStaticExists ? routeStatic : '', dynamicExists ? DYNAMIC_ROUTE : ''].filter(Boolean);
  const allCode = codePaths.map(read).join('\n');
  const e = { ...t, routeStatic: routeStaticExists ? routeStatic : '', routeDynamic: dynamicExists ? DYNAMIC_ROUTE : '', component, engine, schema, pipeline, genius, i18n, tests, allCode };
  const criteria = Object.fromEntries(CRITERIA.map(([id, fn]) => [id, fn(e) ? 1 : 0]));
  const implementedCount = Object.values(criteria).reduce((a, b) => a + b, 0);
  const proxy = +(100 * implementedCount / CRITERIA.length).toFixed(2);
  const primary = component.path || engine.path || (routeStaticExists ? routeStatic : '');
  const cat = href.split('/').filter(Boolean)[1] || 'uncategorized';
  rows.push({
    toolId: t.toolId, nameEn: t.titleEn, nameAr: t.titleAr, slug: t.slug, category: cat,
    href, arRoute: 'NOT_VERIFIED (no proven /ar canonical route mapping)',
    routeStatic: routeStaticExists ? routeStatic : '', routeDynamic: dynamicExists ? DYNAMIC_ROUTE : '',
    component: component.path, componentSource: component.source,
    engine: engine.path, engineSource: engine.source,
    schema: schema.path, schemaSource: schema.source,
    pipeline, genius, i18n,
    registryStatus: registryText.includes(t.toolId) ? 'IN_REGISTRY' : 'MISSING_FROM_REGISTRY',
    catalogStatus: t.catalogStatus, worktreeStatus: worktreeStatus(primary),
    lastCommit: lastCommit(primary), sourceSha: sha256(primary),
    tests, criteria, implementedCount, proxy,
    currentStageHeuristic: !component.path && !engine.path ? 'P0'
      : !pipeline ? (criteria.FIVE_STATES ? 'P4' : 'P2')
      : criteria.GENIUS_MARKER ? (criteria.TEST_FILE ? 'P7' : 'P5') : 'P3',
  });
}

const csvCell = (v) => {
  const s = Array.isArray(v) ? v.join(';') : String(v ?? '');
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
const csv = (headers, data) => [headers.join(','), ...data.map((r) => headers.map((h) => csvCell(r[h])).join(','))].join('\n');

const implHeaders = ['Tool ID','Name EN','Name AR','Slug','Category','Canonical EN Route','Canonical AR Route','Component Path','Engine Path','Pipeline Path','Schema Path','Genius Path','i18n Path','Test Files','Registry Status','Catalog Status','Worktree Status','Last Relevant Commit','Source SHA (primary file)','Static Criteria Passed','Static Criteria Total','Source Presence Proxy % (E2 ONLY - NOT Implementation Progress)','Verified Completion %','Runtime Verification %','Notes'];
const implRows = rows.map((r) => ({
  'Tool ID': r.toolId, 'Name EN': r.nameEn, 'Name AR': r.nameAr, 'Slug': r.slug, 'Category': r.category,
  'Canonical EN Route': r.href, 'Canonical AR Route': r.arRoute,
  'Component Path': r.component || 'MISSING', 'Engine Path': r.engine || 'MISSING',
  'Pipeline Path': r.pipeline || 'MISSING', 'Schema Path': r.schema || 'MISSING',
  'Genius Path': r.genius || 'NOT_FOUND', 'i18n Path': r.i18n || 'NOT_FOUND', 'Test Files': r.tests,
  'Registry Status': r.registryStatus, 'Catalog Status': r.catalogStatus, 'Worktree Status': r.worktreeStatus,
  'Last Relevant Commit': r.lastCommit || 'NOT_VERIFIED', 'Source SHA (primary file)': r.sourceSha || 'NOT_VERIFIED',
  'Static Criteria Passed': r.implementedCount, 'Static Criteria Total': CRITERIA.length,
  'Source Presence Proxy % (E2 ONLY - NOT Implementation Progress)': r.proxy,
  'Verified Completion %': 'NOT_VERIFIABLE — no requirement-level E3+ denominator proven in this audit',
  'Runtime Verification %': 'NOT_RUN_NO_SSO_DEPLOYMENT_ID',
  'Notes': 'E2 source presence only. No Implementation Progress, E3 or E4 value awarded by this scan. Untracked files are not treated as committed. Engine/schema slug-fallback paths are labelled in TOOL-SOURCE-SCAN.json.',
}));
writeFileSync(join(OUT, 'SMARTTOOLS-IMPLEMENTATION-SUMMARY.csv'), csv(implHeaders, implRows) + '\n');

const phaseHeaders = ['Tool ID','Slug','Current Development Stage (source-presence heuristic)','Last Fully Verified Stage','P0','P1','P2','P3','P4','P5','P6','P7','P8','P9','Evidence Basis'];
const phaseRows = rows.map((r) => ({
  'Tool ID': r.toolId, Slug: r.slug,
  'Current Development Stage (source-presence heuristic)': r.currentStageHeuristic,
  'Last Fully Verified Stage': 'NOT_VERIFIED',
  P0: r.href && r.titleEn && r.slug ? 'COMPLETED' : 'NOT_STARTED',
  P1: r.component || r.engine || r.schema ? 'COMPLETED' : 'NOT_STARTED',
  P2: r.engine ? 'SOURCE_PRESENT_UNVERIFIED' : 'NOT_STARTED',
  P3: r.pipeline ? 'SOURCE_PRESENT_UNVERIFIED' : 'NOT_STARTED',
  P4: r.component && (r.routeStatic || r.routeDynamic) ? 'SOURCE_PRESENT_UNVERIFIED' : 'NOT_STARTED',
  P5: r.criteria.GENIUS_MARKER || r.criteria.CORE5_COMPACT ? 'SOURCE_PRESENT_UNVERIFIED' : 'NOT_STARTED',
  P6: r.criteria.SAFETY_MARKER && r.criteria.EN_AR_I18N_USAGE ? 'SOURCE_PRESENT_UNVERIFIED' : 'PARTIAL',
  P7: r.tests.length ? 'TEST_FILE_PRESENT_UNVERIFIED' : 'NOT_STARTED',
  P8: 'NOT_RUN_SSO_REQUIRED', P9: 'NOT_STARTED',
  'Evidence Basis': `component=${!!r.component}; engine=${!!r.engine}; schema=${!!r.schema}; pipeline=${!!r.pipeline}; staticRoute=${!!r.routeStatic}; dynamicRoute=${!!r.routeDynamic}; i18n=${!!r.i18n}; tests=${r.tests.length}`,
}));
writeFileSync(join(OUT, 'SMARTTOOLS-PHASE-MATRIX.csv'), csv(phaseHeaders, phaseRows) + '\n');

writeFileSync(join(EVIDENCE, 'TOOL-SOURCE-SCAN.json'), JSON.stringify({
  generatedAt: new Date().toISOString(), head: git(['rev-parse', 'HEAD']),
  catalogFiles, catalogEntries: tools.length, uniqueEntries: unique.size, publishedEntries: published.length,
  criteria: CRITERIA.map(([id]) => id), rows: rows.map(({ allCode, ...rest }) => rest),
}, null, 2) + '\n');

const stats = {
  catalogEntries: tools.length, uniqueEntries: unique.size, publishedEntries: published.length,
  withComponent: rows.filter((r) => r.component).length,
  withEngine: rows.filter((r) => r.engine).length,
  withSchema: rows.filter((r) => r.schema).length,
  withPipeline: rows.filter((r) => r.pipeline).length,
  withStaticRoute: rows.filter((r) => r.routeStatic).length,
  withDynamicRoute: rows.filter((r) => r.routeDynamic).length,
  withI18n: rows.filter((r) => r.i18n).length,
  withTestFile: rows.filter((r) => r.tests.length).length,
  missingFromRegistry: rows.filter((r) => r.registryStatus === 'MISSING_FROM_REGISTRY').length,
  dirtyOrUntrackedPrimary: rows.filter((r) => r.worktreeStatus !== 'CLEAN').length,
};
writeFileSync(join(EVIDENCE, 'SOURCE-SCAN-STATS.md'), '# Source scan statistics\n\n| Metric | Verified count |\n|---|---:|\n' +
  Object.entries(stats).map(([k, v]) => `| ${k} | ${v} |`).join('\n') + '\n\nCriteria (equal weight, static source presence only): ' + CRITERIA.map(([id]) => id).join(', ') + '\n\nThe Source Presence Proxy is E2-only and MUST NOT be reported as Implementation Progress.\n');
console.log(JSON.stringify(stats, null, 2));
