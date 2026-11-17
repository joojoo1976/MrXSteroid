import fs from 'fs';
const j=JSON.parse(fs.readFileSync('docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/route-check-e1-canonical.json','utf8'));
const rows=j.results.map(r=>`| ${r.id} | \`${r.route}\` | ${r.html} | ${r.appErr} | ${r.r6State} | ${r.r6Genius} | ${String(r.title||'').replace(/\|/g,'/').replace(/\s+/g,' ').trim()} |`).join('\n');
const withR6=j.results.filter(r=>r.r6State).length;
const generic=j.results.filter(r=>(r.title||'').includes('Smart Tools | Mr. X-Steroid')).length;
const md=`# E1 HTTP/SSR Canonical Route Check — 29 Tools (Batches 1–4)

**Checked:** ${j.checkedAt}  
**Deployment:** ${j.deployment} (mrxsteroid, preview, Ready)  
**Base:** ${j.base}  
**Source:** ${j.source}  
**Method:** \`vercel curl\` per canonical route (HTTP/SSR fetch, not interactive browser). Evidence: \`route-check-e1-canonical.json\`, \`route-check-e1-canonical-summary.json\`.

## Summary (computed from JSON)
- **Total:** ${j.total} | **HTML:** ${j.ok} | **App errors:** ${j.fail}
- **r6State in HTML:** ${withR6} | **Generic title:** ${generic}
- **Consistency:** counts derived from \`route-check-e1-canonical.json\`.

## Key finding
Correct canonical category/slug URLs resolve successfully for all 29 tools (**29/29 HTML, 0 app errors, 0 generic hub titles**). Earlier generic-title results in \`route-check-e1.json\` were due to **non-canonical paths** tested in that pass (wrong category/slug for 12 tools), not confirmed broken tool rendering.

## Per-route
| ID | Route | HTML | AppErr | r6State | r6Genius | Title |
|---:|---|:---:|:---:|:---:|:---:|---|
${rows}

> r6State/r6Genius absent in SSR HTML for some routes may reflect client-rendered markers. HTTP/SSR evidence only (not EN/AR, 5 states, RTL 390px, console/hydration runtime).
`;
fs.writeFileSync('docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/ROUTE-CHECK-E1-CANONICAL-REPORT.md', md);
console.log('ok', withR6, generic);
