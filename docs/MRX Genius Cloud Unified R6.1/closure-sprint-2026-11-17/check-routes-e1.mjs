import { execSync } from 'child_process';
import fs from 'fs';
const routes=[
'/smarttools/hormonal-health/tool-006-estrogen-prolactin',
'/smarttools/hormonal-health/tool-015-shbg-modulator',
'/smarttools/hormonal-health/tool-023-trt-optimization',
'/smarttools/hormonal-health/tool-035-hormone-conversion',
'/smarttools/medical-monitoring/tool-040-lipid-profile-optimizer',
'/smarttools/medical-monitoring/tool-041-hematocrit-monitor',
'/smarttools/hormonal-health/tool-042-estrogen-management',
'/smarttools/hormonal-health/tool-043-prolactin-management',
'/smarttools/hormonal-health/tool-044-dht-side-effects',
'/smarttools/cycle-management/tool-045-cycle-break-planner',
'/smarttools/cycle-management/tool-046-trt-lifetime-calculator',
'/smarttools/cycle-management/tool-047-fertility-preservation',
'/smarttools/medical-monitoring/tool-048-cardiovascular-risk-assessor',
'/smarttools/medical-monitoring/tool-049-bone-density-optimizer',
'/smarttools/medical-monitoring/tool-050-mental-health-monitor',
'/smarttools/injection-formulation/tool-051-peptide-dosage-calculator',
'/smarttools/cycle-management/tool-016-half-life-calculator',
'/smarttools/cycle-management/tool-022-oral-vs-injectable',
'/smarttools/cycle-management/tool-027-ester-conversion',
'/smarttools/cycle-management/tool-031-blast-cruise',
'/smarttools/cycle-management/tool-034-compound-clearance',
'/smarttools/medical-monitoring/tool-008-side-effect-tracker',
'/smarttools/body-composition/tool-014-water-retention',
'/smarttools/medical-monitoring/tool-017-drug-interaction',
'/smarttools/medical-monitoring/tool-025-drug-interaction-pro',
'/smarttools/injection-formulation/tool-026-injection-pain',
'/smarttools/medical-monitoring/tool-029-side-effect-early-warning',
'/smarttools/medical-monitoring/tool-037-side-effect-probability',
'/smarttools/cycle-management/tool-038-stack-compatibility'
];
let ok=0,fail=0; const results=[];
for(const r of routes){
 try{
  const s=execSync(`vercel curl "${r}" --deployment dpl_E1n1DmQYYQRnuofhbcHiAjPT8LsL`,{encoding:'utf8',stdio:['pipe','pipe','pipe'],maxBuffer:30*1024*1024});
  const hasHtml=/<!DOCTYPE html>|<html/i.test(s);
  const appErr=/Application error/i.test(s);
  const title=(s.match(/<title>([^<]*)<\/title>/i)||[])[1]||'';
  const r6State=/data-r6-state/.test(s);
  const r6Genius=/data-r6-genius/.test(s);
  results.push({route:r,html:hasHtml,appErr,title,r6State,r6Genius,len:s.length});
  if(hasHtml && !appErr) ok++; else fail++;
 }catch(e){ fail++; results.push({route:r,error:String(e.message||e).slice(0,200)}); }
}
const report={deployment:'dpl_E1n1DmQYYQRnuofhbcHiAjPT8LsL',ok,fail,total:routes.length,checkedAt:new Date().toISOString(),results};
fs.writeFileSync('docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/route-check-e1.json', JSON.stringify(report,null,2));
console.log(JSON.stringify({ok,fail,total:routes.length}));
for(const r of results){ console.log(`${r.route} | html=${r.html} | appErr=${r.appErr} | r6State=${r.r6State} | r6Genius=${r.r6Genius} | title=${(r.title||'').replace(/\s+/g,' ').trim()}`); }
