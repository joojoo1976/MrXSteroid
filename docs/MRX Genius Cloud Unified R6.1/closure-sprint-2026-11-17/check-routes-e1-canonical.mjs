import { execSync } from 'child_process';
import fs from 'fs';
const routes = [
 {id:'006',slug:'tool-006-estrogen-prolactin',cat:'hormonal-health',route:'/smarttools/hormonal-health/tool-006-estrogen-prolactin'},
 {id:'015',slug:'tool-015-shbg-modulator',cat:'hormonal-health',route:'/smarttools/hormonal-health/tool-015-shbg-modulator'},
 {id:'023',slug:'tool-023-trt-optimization',cat:'hormonal-health',route:'/smarttools/hormonal-health/tool-023-trt-optimization'},
 {id:'035',slug:'tool-035-hormone-conversion',cat:'pharmacokinetics',route:'/smarttools/pharmacokinetics/tool-035-hormone-conversion'},
 {id:'040',slug:'tool-040-lipid-profile-optimizer',cat:'medical-monitoring',route:'/smarttools/medical-monitoring/tool-040-lipid-profile-optimizer'},
 {id:'041',slug:'tool-041-hematocrit-monitor',cat:'medical-monitoring',route:'/smarttools/medical-monitoring/tool-041-hematocrit-monitor'},
 {id:'042',slug:'tool-042-estrogen-management',cat:'hormonal-health',route:'/smarttools/hormonal-health/tool-042-estrogen-management'},
 {id:'043',slug:'tool-043-prolactin-management',cat:'hormonal-health',route:'/smarttools/hormonal-health/tool-043-prolactin-management'},
 {id:'044',slug:'tool-044-dht-side-effects',cat:'medical-monitoring',route:'/smarttools/medical-monitoring/tool-044-dht-side-effects'},
 {id:'045',slug:'tool-045-cycle-break-planner',cat:'cycle-management',route:'/smarttools/cycle-management/tool-045-cycle-break-planner'},
 {id:'046',slug:'tool-046-trt-lifetime',cat:'hormonal-health',route:'/smarttools/hormonal-health/tool-046-trt-lifetime'},
 {id:'047',slug:'tool-047-fertility-preservation',cat:'hormonal-health',route:'/smarttools/hormonal-health/tool-047-fertility-preservation'},
 {id:'048',slug:'tool-048-cardiovascular-risk',cat:'medical-monitoring',route:'/smarttools/medical-monitoring/tool-048-cardiovascular-risk'},
 {id:'049',slug:'tool-049-bone-density',cat:'medical-monitoring',route:'/smarttools/medical-monitoring/tool-049-bone-density'},
 {id:'050',slug:'tool-050-mental-health',cat:'medical-monitoring',route:'/smarttools/medical-monitoring/tool-050-mental-health'},
 {id:'051',slug:'tool-051-peptide-dosage-calculator',cat:'injection-formulation',route:'/smarttools/injection-formulation/tool-051-peptide-dosage-calculator'},
 {id:'016',slug:'tool-016-half-life-calculator',cat:'pharmacokinetics',route:'/smarttools/pharmacokinetics/tool-016-half-life-calculator'},
 {id:'022',slug:'tool-022-half-life-stacker',cat:'pharmacokinetics',route:'/smarttools/pharmacokinetics/tool-022-half-life-stacker'},
 {id:'027',slug:'tool-027-ester-conversion',cat:'pharmacokinetics',route:'/smarttools/pharmacokinetics/tool-027-ester-conversion'},
 {id:'031',slug:'tool-031-cycle-length-optimizer',cat:'cycle-management',route:'/smarttools/cycle-management/tool-031-cycle-length-optimizer'},
 {id:'034',slug:'tool-034-compound-clearance',cat:'pharmacokinetics',route:'/smarttools/pharmacokinetics/tool-034-compound-clearance'},
 {id:'008',slug:'tool-008-side-effect-tracker',cat:'medical-monitoring',route:'/smarttools/medical-monitoring/tool-008-side-effect-tracker'},
 {id:'014',slug:'tool-014-water-retention',cat:'body-composition',route:'/smarttools/body-composition/tool-014-water-retention'},
 {id:'017',slug:'tool-017-drug-interaction',cat:'medical-monitoring',route:'/smarttools/medical-monitoring/tool-017-drug-interaction'},
 {id:'025',slug:'tool-025-drug-interaction-pro',cat:'medical-monitoring',route:'/smarttools/medical-monitoring/tool-025-drug-interaction-pro'},
 {id:'026',slug:'tool-026-injection-pain',cat:'injection-formulation',route:'/smarttools/injection-formulation/tool-026-injection-pain'},
 {id:'029',slug:'tool-029-side-effect-early-warning',cat:'medical-monitoring',route:'/smarttools/medical-monitoring/tool-029-side-effect-early-warning'},
 {id:'037',slug:'tool-037-side-effect-probability',cat:'medical-monitoring',route:'/smarttools/medical-monitoring/tool-037-side-effect-probability'},
 {id:'038',slug:'tool-038-stack-compatibility',cat:'cycle-management',route:'/smarttools/cycle-management/tool-038-stack-compatibility'},
];
let ok=0,fail=0; const results=[];
for(const t of routes){
 try{
  const s=execSync(`vercel curl "${t.route}" --deployment dpl_E1n1DmQYYQRnuofhbcHiAjPT8LsL`,{encoding:'utf8',stdio:['pipe','pipe','pipe'],maxBuffer:30*1024*1024});
  const hasHtml=/<!DOCTYPE html>|<html/i.test(s);
  const appErr=/Application error/i.test(s);
  const title=(s.match(/<title>([^<]*)<\/title>/i)||[])[1]||'';
  const r6State=/data-r6-state/.test(s);
  const r6Genius=/data-r6-genius/.test(s);
  results.push({...t, html:hasHtml, appErr, title, r6State, r6Genius, len:s.length});
  if(hasHtml && !appErr) ok++; else fail++;
 }catch(e){ fail++; results.push({...t,error:String(e.message||e).slice(0,200)}); }
}
const report={deployment:'dpl_E1n1DmQYYQRnuofhbcHiAjPT8LsL',base:'https://mrxsteroid-bml67hgvb-georges-projects-78ef250b.vercel.app',ok,fail,total:routes.length,checkedAt:new Date().toISOString(),source:'canonical slugs/categories from lib/tools/categories.ts and smartToolsCatalog4.ts',results};
fs.writeFileSync('docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/route-check-e1-canonical.json', JSON.stringify(report,null,2));
// consistency check
const withR6 = results.filter(r=>r.r6State).length;
const generic = results.filter(r=> (r.title||'').includes('Smart Tools | Mr. X-Steroid')).length;
const summary={ok,fail,total:routes.length,withR6State:withR6,genericTitleCount:generic,allHtml:results.every(r=>r.html),noAppErr:results.every(r=>!r.appErr)};
fs.writeFileSync('docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/route-check-e1-canonical-summary.json', JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary));
for(const r of results){ console.log(`${r.id} | ${r.route} | html=${r.html} | appErr=${r.appErr} | r6State=${r.r6State} | r6Genius=${r.r6Genius} | title=${(r.title||'').replace(/\s+/g,' ').trim()}`); }
