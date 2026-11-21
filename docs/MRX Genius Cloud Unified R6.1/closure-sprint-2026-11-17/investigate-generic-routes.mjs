import { execSync } from 'child_process';
import fs from 'fs';
const map = {
 '016':'/smarttools/cycle-management/tool-016-half-life-calculator',
 '022':'/smarttools/cycle-management/tool-022-oral-vs-injectable',
 '027':'/smarttools/cycle-management/tool-027-ester-conversion',
 '031':'/smarttools/cycle-management/tool-031-blast-cruise',
 '034':'/smarttools/cycle-management/tool-034-compound-clearance',
 '035':'/smarttools/hormonal-health/tool-035-hormone-conversion',
 '044':'/smarttools/hormonal-health/tool-044-dht-side-effects',
 '046':'/smarttools/cycle-management/tool-046-trt-lifetime-calculator',
 '047':'/smarttools/cycle-management/tool-047-fertility-preservation',
 '048':'/smarttools/medical-monitoring/tool-048-cardiovascular-risk-assessor',
 '049':'/smarttools/medical-monitoring/tool-049-bone-density-optimizer',
 '050':'/smarttools/medical-monitoring/tool-050-mental-health-monitor'
};
const out=[];
for(const [t,r] of Object.entries(map)){
 const html=execSync(`vercel curl "${r}" --deployment dpl_E1n1DmQYYQRnuofhbcHiAjPT8LsL`,{encoding:'utf8',maxBuffer:30*1024*1024,stdio:['pipe','pipe','pipe']});
 const title=(html.match(/<title>([^<]*)<\/title>/i)||[])[1]||'';
 out.push({
  tool:t, route:r, len:html.length, title,
  hasToolSlug: html.includes(`tool-${t}`),
  hasR6State: /data-r6-state/.test(html),
  hasR6Genius: /data-r6-genius/.test(html),
  hasSmartToolsGeneric: title.includes('Smart Tools | Mr. X-Steroid'),
  bodySnippet: (html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)||['',''])[1].replace(/<script[\s\S]*?<\/script>/gi,'[script]').replace(/<style[\s\S]*?<\/style>/gi,'[style]').replace(/\s+/g,' ').trim().slice(0,1500)
 });
}
fs.writeFileSync('docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/generic-routes-investigation.json', JSON.stringify(out,null,2));
console.log(out.map(o=>`${o.tool} len=${o.len} slug=${o.hasToolSlug} r6=${o.hasR6State} gen=${o.hasSmartToolsGeneric} title=${o.title}`).join('\n'));
