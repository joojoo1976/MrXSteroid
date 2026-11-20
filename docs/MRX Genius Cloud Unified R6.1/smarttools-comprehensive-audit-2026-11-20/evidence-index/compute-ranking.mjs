import { readFileSync } from 'node:fs';
const p = 'E:/MrXSteroid-main/docs/MRX Genius Cloud Unified R6.1/parallel-execution-2026-11-19/phase-next/R6.1-29-TOOLS-VS-039-COMPARISON.csv';
const lines = readFileSync(p, 'utf8').split(/\r?\n/).filter(Boolean);
const h = lines[0].split(',');
const rows = lines.slice(1).map((x) => Object.fromEntries(h.map((k, i) => [k, (x.split(',')[i] || '').replace(/^"|"$/g, '')])))
  .filter((r) => r.decision !== 'REFERENCE_ONLY')
  .map((r) => ({ id: r.tool_id, pct: parseFloat(r.completion_pct), decision: r.decision, gap: r.key_gap }))
  .sort((a, b) => b.pct - a.pct || a.id.localeCompare(b.id));
console.log(rows.map((r) => r.id.padStart(3) + ' ' + r.pct.toFixed(2).padStart(6) + '% ' + r.decision).join('\n'));
