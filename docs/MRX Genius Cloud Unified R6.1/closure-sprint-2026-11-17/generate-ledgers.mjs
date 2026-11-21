import fs from 'fs';
import path from 'path';
const base = path.join('docs','MRX Genius Cloud Unified R6.1','closure-sprint-2026-11-17');

const tools = [
 {id:'006',slug:'tool-006-estrogen-prolactin',batch:1,cat:'hormonal-health',sha:'108d3063',i18n:null,artifacts:'component/genius/contract/pipeline/tests exist; no R6.1 proposals/i18n-check/closure ledger in docs',preview:'batch1'},
 {id:'015',slug:'tool-015-shbg-modulator',batch:1,cat:'hormonal-health',sha:'108d3063',i18n:null,artifacts:'component/genius/contract/pipeline/tests exist; no R6.1 proposals/i18n-check/closure ledger',preview:'batch1'},
 {id:'023',slug:'tool-023-trt-optimization',batch:1,cat:'hormonal-health',sha:'108d3063',i18n:null,artifacts:'component/genius/contract/pipeline/tests exist; no R6.1 proposals/i18n-check/closure ledger',preview:'batch1'},
 {id:'035',slug:'tool-035-hormone-conversion',batch:1,cat:'hormonal-health',sha:'108d3063',i18n:null,artifacts:'component/genius/contract/pipeline/tests exist; no R6.1 proposals/i18n-check/closure ledger',preview:'batch1'},
 {id:'040',slug:'tool-040-lipid-profile-optimizer',batch:1,cat:'medical-monitoring',sha:'historical (R6.1 docs)',i18n:'236/236 PASS',artifacts:'R6.1 acceptance/requirements docs exist',preview:'batch1'},
 {id:'041',slug:'tool-041-hematocrit-monitor',batch:1,cat:'medical-monitoring',sha:'c15b84c7',i18n:'172/172 PASS',artifacts:'R6.1 full ledger+acceptance (v2-138) authoritative',preview:'batch1/batch2',ledgerNote:'authoritative 76/132=57.58% (2026-11-14)'},
 {id:'042',slug:'tool-042-estrogen-management',batch:1,cat:'hormonal-health',sha:'c15b84c7',i18n:'178/178 PASS',artifacts:'R6.1 proposals/i18n-check; no full requirement ledger',preview:'batch1/batch2'},
 {id:'043',slug:'tool-043-prolactin-management',batch:1,cat:'hormonal-health',sha:'5a87f3e5',i18n:null,artifacts:'component/genius/contract/pipeline/tests exist; no R6.1 proposals/i18n-check/closure ledger',preview:'batch1'},
 {id:'044',slug:'tool-044-dht-side-effects',batch:1,cat:'hormonal-health',sha:'5a87f3e5',i18n:null,artifacts:'component/genius/contract/pipeline/tests exist; no R6.1 proposals/i18n-check/closure ledger',preview:'batch1'},
 {id:'045',slug:'tool-045-cycle-break-planner',batch:2,cat:'cycle-management',sha:'579c9f56',i18n:'140/140 PASS',artifacts:'R6.1 proposals+i18n-check+i18n-evidence; focused/batch tests recorded',preview:'batch2'},
 {id:'046',slug:'tool-046-trt-lifetime-calculator',batch:2,cat:'cycle-management',sha:'d8acd740',i18n:'140/140 PASS',artifacts:'R6.1 proposals+i18n-check recorded',preview:'batch2'},
 {id:'047',slug:'tool-047-fertility-preservation',batch:2,cat:'cycle-management',sha:'b19f360b',i18n:'140/140 PASS',artifacts:'R6.1 proposals+i18n-check recorded',preview:'batch2'},
 {id:'048',slug:'tool-048-cardiovascular-risk-assessor',batch:2,cat:'medical-monitoring',sha:'1af1d45c',i18n:'169/169 PASS',artifacts:'R6.1 proposals+i18n-check recorded',preview:'batch2'},
 {id:'049',slug:'tool-049-bone-density-optimizer',batch:2,cat:'medical-monitoring',sha:'42e11b41',i18n:'174/174 PASS',artifacts:'R6.1 proposals+i18n-check recorded',preview:'batch2'},
 {id:'050',slug:'tool-050-mental-health-monitor',batch:2,cat:'medical-monitoring',sha:'12fbc24c',i18n:'158/158 PASS',artifacts:'R6.1 proposals+i18n-check recorded',preview:'batch2'},
 {id:'051',slug:'tool-051-peptide-dosage-calculator',batch:2,cat:'injection-formulation',sha:'371d2bcc',i18n:'122/122 PASS',artifacts:'R6.1 proposals+i18n-check recorded',preview:'batch2'},
 {id:'016',slug:'tool-016-half-life-calculator',batch:3,cat:'cycle-management',sha:'82798e4e/2b637ae8',i18n:'129/129 PASS',artifacts:'R6.1 proposals+i18n-check; no batch3 preview/ledger recorded',preview:'none'},
 {id:'022',slug:'tool-022-oral-vs-injectable',batch:3,cat:'cycle-management',sha:'9bee0deb',i18n:'119/119 PASS',artifacts:'R6.1 proposals+i18n-check; no batch3 preview/ledger recorded',preview:'none'},
 {id:'027',slug:'tool-027-ester-conversion',batch:3,cat:'cycle-management',sha:'2d246bfd',i18n:'117/117 PASS',artifacts:'R6.1 proposals+i18n-check; no batch3 preview/ledger recorded',preview:'none'},
 {id:'031',slug:'tool-031-blast-cruise',batch:3,cat:'cycle-management',sha:'56380d66/770e50f',i18n:'131/131 PASS',artifacts:'R6.1 proposals+i18n-check; no batch3 preview/ledger recorded',preview:'none'},
 {id:'034',slug:'tool-034-compound-clearance',batch:3,cat:'cycle-management',sha:'19e9301c',i18n:'116/116 PASS',artifacts:'R6.1 proposals+i18n-check; no batch3 preview/ledger recorded',preview:'none'},
 {id:'008',slug:'tool-008-side-effect-tracker',batch:4,cat:'medical-monitoring',sha:'5edce6da',i18n:'105/105 PASS',artifacts:'R6.1 contract/component/genius/i18n/check/proposals/i18n-evidence; pipeline+tests; consolidated 17/50 PASS',preview:'none'},
 {id:'014',slug:'tool-014-water-retention',batch:4,cat:'body-composition',sha:'cbf75513',i18n:'59/59 PASS',artifacts:'R6.1 full set; honest NOT_AVAILABLE engine; consolidated 17/50 PASS',preview:'none'},
 {id:'017',slug:'tool-017-drug-interaction',batch:4,cat:'medical-monitoring',sha:'4e73130a',i18n:'63/63 PASS',artifacts:'R6.1 full set; fail-closed; consolidated 17/50 PASS',preview:'none'},
 {id:'025',slug:'tool-025-drug-interaction-pro',batch:4,cat:'medical-monitoring',sha:'b24fe5a7',i18n:'78/78 PASS',artifacts:'R6.1 full set; assessment NOT_AVAILABLE; consolidated 17/50 PASS',preview:'none'},
 {id:'026',slug:'tool-026-injection-pain',batch:4,cat:'injection-formulation',sha:'3c10a0c5',i18n:'70/70 PASS',artifacts:'R6.1 full set; assessment NOT_AVAILABLE; consolidated 17/50 PASS',preview:'none'},
 {id:'029',slug:'tool-029-side-effect-early-warning',batch:4,cat:'medical-monitoring',sha:'dd804f85',i18n:'85/85 PASS',artifacts:'R6.1 full set; descriptive only; consolidated 17/50 PASS',preview:'none'},
 {id:'037',slug:'tool-037-side-effect-probability',batch:4,cat:'medical-monitoring',sha:'6e0416fe',i18n:'88/88 PASS',artifacts:'R6.1 full set; heuristic preserved; consolidated 17/50 PASS',preview:'none'},
 {id:'038',slug:'tool-038-stack-compatibility',batch:4,cat:'cycle-management',sha:'63a4f5cc/357adfe5',i18n:'86/86 PASS',artifacts:'R6.1 full set; heuristic preserved; consolidated 17/50 PASS',preview:'none'},
];

function esc(s){return String(s==null?'':s).replace(/"/g,'""');}
const header=['req_id','requirement','applicability','A','B','C','E','files','test_result','verified_date','head','evidence_uri','gap_next_action','closure_evidence'];
const head='8d7e406c'; const date='2026-11-17';
const depE1={id:'dpl_E1n1DmQYYQRnuofhbcHiAjPT8LsL',url:'https://mrxsteroid-bml67hgvb-georges-projects-78ef250b.vercel.app',alias:'https://mrxsteroid-git-feat-r61-tools-041-042-georges-projects-78ef250b.vercel.app',shaNote:'branch feat/r6.1-tools-041-042 deployed 2026-11-17 21:06:08 GMT+0200; exact SHA not exposed by vercel inspect text (HEAD at push 8d7e406c)'};

function row(o){return header.map(k=>`"${esc(o[k]||'')}"`).join(',');}

function makeRows(t){
 const r61=['040','041','042','045','046','047','048','049','050','051','016','022','027','031','034','008','014','017','025','026','029','037','038'].includes(t.id);
 const i18n=!!t.i18n; const b4=t.batch===4;
 const rows=[];
 const baseFiles=`components/tools/${t.slug}*, lib/tools/r6/tool-${t.id}*`;
 rows.push({req_id:'ENG-PIPELINE',requirement:'Compute via R6 pipeline path only (no UI-side engine logic)',applicability:'APPLICABLE',A:'SPEC_APPROVED',B:(r61)?'PASS':'PARTIAL',C:'PENDING',E:(b4?'E3':(r61?'E2':'E1')),files:baseFiles,test_result:(b4?'Batch 4 pipeline tests in consolidated 17/50 PASS (2026-11-17)': r61?'R6.1 pipeline artifacts/tests recorded in prior implementation':'R6 pipeline artifacts present; R6.1 closure doc evidence incomplete'),verified_date:date,head,evidence_uri:'',gap_next_action:(b4?'Re-run and archive per-tool log on current HEAD':'Re-run and capture focused pipeline evidence for this tool on current HEAD'),closure_evidence:''});
 rows.push({req_id:'STATE-5',requirement:'Five states EMPTY/PARTIAL/INVALID/FULL/DEGRADED implemented honestly',applicability:'APPLICABLE',A:'SPEC_APPROVED',B:r61?'PASS':'PARTIAL',C:'PENDING',E:r61?'E2':'E1',files:baseFiles,test_result:r61?'R6.1 component/proposals/tests indicate five-state behavior; build passed during implementation':'Base artifacts exist; R6.1 state evidence not fully documented',verified_date:date,head,evidence_uri:'',gap_next_action:'Verify state transitions on accessible Preview (E4) and capture evidence',closure_evidence:''});
 rows.push({req_id:'UI-GENIUS12',requirement:'GENIUS-12 fixed order present once (no hidden/duplicate boxes) + CORE-5',applicability:'APPLICABLE',A:'SPEC_APPROVED',B:r61?'PASS':'PARTIAL',C:'PENDING',E:r61?'E2':'E1',files:baseFiles,test_result:r61?'Genius component/proposals indicate fixed 12-box order and CORE-5 behavior':'Artifacts exist; closure documentation/evidence incomplete',verified_date:date,head,evidence_uri:'',gap_next_action:'Browser verify on accessible Preview (no duplicate shell/hidden box) with screenshot/E4',closure_evidence:''});
 rows.push({req_id:'I18N-PARITY',requirement:'AR/EN parity, required keys resolved, no contamination',applicability:'APPLICABLE',A:'SPEC_APPROVED',B:i18n?'PASS':'NOT_RUN',C:'PENDING',E:i18n?'E3':'E0',files:`docs/MRX Genius Cloud Unified R6.1/tool-${t.id}-i18n-check.mjs`,test_result:i18n?`I18N_PARITY OK ${t.i18n} (re-run 2026-11-17)`:'No R6.1 i18n-check script in docs folder',verified_date:date,head,evidence_uri:'',gap_next_action:i18n?'none':'Create and run R6.1 i18n parity check with evidence',closure_evidence:''});
 rows.push({req_id:'EXPORT-CSV',requirement:'Browser-only CSV export (no server/session identifier)',applicability:'APPLICABLE',A:'SPEC_APPROVED',B:r61?'PASS':'PARTIAL',C:'PENDING',E:r61?'E2':'E1',files:baseFiles,test_result:r61?'Implemented per R6.1 proposals/contract patterns':'Not fully documented in R6.1 closure artifacts',verified_date:date,head,evidence_uri:'',gap_next_action:'Verify on accessible Preview and capture evidence',closure_evidence:''});
 rows.push({req_id:'TEST-FOCUSED',requirement:'Focused tests pass (pipeline/contract/component/i18n-evidence as applicable)',applicability:'APPLICABLE',A:'SPEC_APPROVED',B:b4?'PASS':'PARTIAL',C:'PENDING',E:b4?'E3':'E2',files:baseFiles,test_result:b4?'Included in consolidated Batch 4 run: 17 files / 50 tests PASS (2026-11-17)': (t.batch<=2?'Prior batch/tool focused tests recorded in reports (e.g. Batch1 combined slices, Batch2 59/516 cumulative) — not rerun as single per-tool battery this pass':'Prior implementation tests recorded; not consolidated this pass'),verified_date:date,head,evidence_uri:'',gap_next_action:'Re-run focused battery for this tool on current HEAD and archive log',closure_evidence:''});
 rows.push({req_id:'BUILD-TSC',requirement:'tsc --noEmit and next build pass with route present',applicability:'APPLICABLE',A:'SPEC_APPROVED',B:'PARTIAL',C:'PENDING',E:'E2',files:'repo build',test_result:'Per-batch/per-tool tsc/build recorded in prior reports; E1 deployment build for mrxsteroid reached 506/506 routes (Ready). Not re-run as archived clean artifact for this exact ledger pass.',verified_date:date,head,evidence_uri:depE1.url,gap_next_action:'Archive clean tsc/build output for HEAD 8d7e406c',closure_evidence:''});
 rows.push({req_id:'PREVIEW-ROUTE',requirement:'Direct Preview route loads for tool (SSR/accessible)',applicability:'APPLICABLE',A:'SPEC_APPROVED',B:'NOT_RUN',C:'PENDING',E:'E0',files:`/smarttools/${t.cat}/${t.slug}`,test_result:'Deployment E1 Ready (mrxsteroid preview) but URL/alias/batch aliases redirect to Vercel SSO login in real checks (2026-11-17). Route accessibility NOT_RUN.',verified_date:date,head,evidence_uri:depE1.url,gap_next_action:'Provide unauthenticated/bypass access or disable protection for preview and verify each route loads',closure_evidence:''});
 rows.push({req_id:'BROWSER-EN-AR',requirement:'EN and AR functional pass on Preview',applicability:'APPLICABLE',A:'SPEC_APPROVED',B:'NOT_RUN',C:'PENDING',E:'E0',files:t.slug,test_result:'NOT_RUN — Preview SSO-protected',verified_date:date,head,evidence_uri:'',gap_next_action:'Execute EN/AR browser checks on accessible Preview',closure_evidence:''});
 rows.push({req_id:'BROWSER-5-STATES',requirement:'Five states exercised on Preview',applicability:'APPLICABLE',A:'SPEC_APPROVED',B:'NOT_RUN',C:'PENDING',E:'E0',files:t.slug,test_result:'NOT_RUN — Preview SSO-protected',verified_date:date,head,evidence_uri:'',gap_next_action:'Exercise EMPTY/PARTIAL/INVALID/FULL/DEGRADED on accessible Preview',closure_evidence:''});
 rows.push({req_id:'RTL-390',requirement:'Real Arabic RTL at 390px (no overflow, readable, correct direction)',applicability:'APPLICABLE',A:'SPEC_APPROVED',B:'NOT_RUN',C:'PENDING',E:'E0',files:t.slug,test_result:'NOT_RUN — Preview SSO-protected',verified_date:date,head,evidence_uri:'',gap_next_action:'Run real 390px RTL browser test and capture evidence',closure_evidence:''});
 rows.push({req_id:'CONSOLE-HYDRATION',requirement:'No Console errors or SSR/Hydration issues',applicability:'APPLICABLE',A:'SPEC_APPROVED',B:'NOT_RUN',C:'PENDING',E:'E0',files:t.slug,test_result:'NOT_RUN — Preview SSO-protected',verified_date:date,head,evidence_uri:'',gap_next_action:'Capture browser console on accessible Preview',closure_evidence:''});
 rows.push({req_id:'NO-DUP-GENIUS',requirement:'No duplicate GENIUS-12 / no hidden box / no double shell',applicability:'APPLICABLE',A:'SPEC_APPROVED',B:'NOT_RUN',C:'PENDING',E:'E0',files:t.slug,test_result:'NOT_RUN — requires accessible Preview DOM inspection',verified_date:date,head,evidence_uri:'',gap_next_action:'Inspect DOM on accessible Preview; verify R6_EXEMPT_SLUGS/shell alignment',closure_evidence:''});
 rows.push({req_id:'C4-SOURCES',requirement:'Specialist-approved sources/provenance or owner-approved N/A',applicability:'APPLICABLE',A:'SPEC_APPROVED',B:'NOT_AVAILABLE',C:'PENDING',E:'E1',files:t.slug,test_result:'No approved source/provenance recorded (D-C4 open)',verified_date:date,head,evidence_uri:'',gap_next_action:'Provide approved source pack or owner-approved N/A per tool/domain',closure_evidence:''});
 rows.push({req_id:'C5-REFERRAL',requirement:'Specialist-approved referral/seek-care wording (AR/EN)',applicability:'APPLICABLE',A:'SPEC_APPROVED',B:'NOT_AVAILABLE',C:'PENDING',E:'E1',files:t.slug,test_result:'Referral wording pending specialist approval (D-C5)',verified_date:date,head,evidence_uri:'',gap_next_action:'Provide approved wording pack',closure_evidence:''});
 rows.push({req_id:'CLINICAL-REVIEW',requirement:'Clinical/model review sign-off as applicable',applicability:'APPLICABLE',A:'SPEC_APPROVED',B:'BLOCKED',C:'PENDING',E:'E1',files:t.slug,test_result:'Clinical/model review not recorded (D-CLIN)',verified_date:date,head,evidence_uri:'',gap_next_action:'Obtain clinical/model review sign-off',closure_evidence:''});
 rows.push({req_id:'W18-HISTORY',requirement:'History/storage/sync per W18 decision',applicability:'APPLICABLE',A:'SPEC_APPROVED',B:'NOT_AVAILABLE',C:'PENDING',E:'E1',files:t.slug,test_result:'Box 11 NOT_AVAILABLE; no storage (D-W18 open)',verified_date:date,head,evidence_uri:'',gap_next_action:'Owner decision on W18',closure_evidence:''});
 rows.push({req_id:'P03-PIPELINE',requirement:'Shared R6 pipeline result-schema enforcement (if applicable)',applicability:'APPLICABLE',A:'SPEC_APPROVED',B:'NOT_IMPLEMENTED',C:'PENDING',E:'E1',files:'shared pipeline',test_result:'Frozen pipeline layer; P-03 not implemented (D-P03)',verified_date:date,head,evidence_uri:'',gap_next_action:'Approve and implement shared P-03 change with regression',closure_evidence:''});
 if(t.id==='041'){
   rows.push({req_id:'LEDGER-AUTH',requirement:'Authoritative R6.1 ledger completion (v2-138)',applicability:'APPLICABLE',A:'SPEC_APPROVED',B:'PARTIAL',C:'PENDING',E:'E3',files:'docs/MRX Genius Cloud Unified R6.1/tool-041-requirements.csv, tool-041-acceptance-calc.json',test_result:'76/132 = 57.58% (2026-11-14) OWNER_REVIEW — NOT ACCEPTED — NOT CLOSED',verified_date:'2026-11-14',head:'c15b84c7',evidence_uri:'docs/MRX Genius Cloud Unified R6.1/TOOL-041-ACCEPTANCE.md',gap_next_action:'Close remaining engineering-evidencable rows; clinical/C4/C5/W18/P-03 remain',closure_evidence:''});
 }
 return rows;
}

function compute(rows){
 const app=rows.filter(r=>!String(r.applicability||'').startsWith('NOT_APPLICABLE'));
 const denom=app.length;
 const num=app.filter(r=>r.B==='PASS' && ['E3','E4','E5'].includes(r.E)).length;
 const pct=denom?Math.round((num/denom)*10000)/100:0;
 return {num,denom,pct};
}

const summary=[];
for(const t of tools){
 const rows=makeRows(t);
 const c=compute(rows);
 const csv=[header.join(','),...rows.map(r=>row(r))].join('\n');
 fs.writeFileSync(path.join(base,`tool-${t.id}-closure-ledger.csv`),csv,'utf8');
 const remaining=rows.filter(r=>!(r.B==='PASS' && ['E3','E4','E5'].includes(r.E)));
 const md = `# Tool ${t.id} — ${t.slug}\n\n- **Batch:** ${t.batch}\n- **Category/Route:** ${t.cat} / \`/smarttools/${t.cat}/${t.slug}\`\n- **Source SHA (tool):** ${t.sha}\n- **Snapshot HEAD:** ${head}\n- **Deployment (E1, Ready):** ${depE1.id} — ${depE1.url} (alias ${depE1.alias}) [${depE1.shaNote}] — **SSO-protected**\n- **Direct per-tool URL:** ${depE1.url}/smarttools/${t.cat}/${t.slug}\n- **i18n (R6.1 check):** ${t.i18n||'no R6.1 i18n-check script'}\n- **Artifacts:** ${t.artifacts}\n- **Pragmatic closure completion:** **${c.num}/${c.denom} = ${c.pct}%** (B=PASS & E>=E3 / applicable)\n- **Status:** \`IN PROGRESS\` (engineering) / \`NOT CLOSED\` (formal R6.1). **Not 100% VERIFIED.**${t.ledgerNote?`\n- **Authoritative note:** ${t.ledgerNote}`:''}\n\n## Requirements (this ledger)\n| Req | B | E | Result | Gap / Next |\n|---|---|---|---|---|\n${rows.map(r=>`| ${r.req_id} | ${r.B} | ${r.E} | ${String(r.test_result).replace(/\|/g,'/').slice(0,120)} | ${String(r.gap_next_action).replace(/\|/g,'/').slice(0,120)} |`).join('\n')}\n\n## Remaining to 100% (this register)\n${remaining.map(r=>`- **${r.req_id}** [${r.B}/${r.E}]: ${r.gap_next_action||r.test_result}`).join('\n')}\n`;
 fs.writeFileSync(path.join(base,`tool-${t.id}-closure-ledger.md`),md,'utf8');
 summary.push({id:t.id,slug:t.slug,batch:t.batch,cat:t.cat,sha:t.sha,i18n:t.i18n||'n/a',num:c.num,denom:c.denom,pct:c.pct,route:`/smarttools/${t.cat}/${t.slug}`});
}
summary.sort((a,b)=>b.pct-a.pct || a.batch-b.batch || a.id.localeCompare(b.id));
const payload={head,date,deployment:depE1,failedDeployment:{id:'dpl_BQ8w7CQnroD9oVNmUmXwW3TxaqDV',project:'mr-x-steroid',status:'Error',reason:'[STATIC_BUILD_NO_OUT_DIR] No Output Directory named "dist" found after Build completed (project output dir misconfigured; different project from mrxsteroid; does not represent 29 tools on mrxsteroid)'},summary};
fs.writeFileSync(path.join(base,'summary.json'),JSON.stringify(payload,null,2),'utf8');

// summary md
const lines=[];
lines.push('# Closure Sprint 2026-11-17 — Per-Tool Ledgers Summary (29 tools, Batches 1–4)');
lines.push('');
lines.push(`- **HEAD (snapshot):** \`${head}\` (branch \`feat/r6.1-tools-041-042\`, pushed)`);
lines.push(`- **Successful deployment (inspected):** \`${depE1.id}\` — project \`mrxsteroid\`, target \`preview\`, status **Ready**, URL ${depE1.url}, alias ${depE1.alias}, created 2026-11-17 21:06:08 GMT+0200 (branch deployment for \`feat/r6.1-tools-041-042\`; exact SHA not exposed by \`vercel inspect\` text). Build 506/506 routes.`);
lines.push('- **Failed deployment (inspected):** `dpl_BQ8w7CQnroD9oVNmUmXwW3TxaqDV` — **different project `mr-x-steroid`** (not `mrxsteroid`), target `preview`, status **Error**. Reason: `[STATIC_BUILD_NO_OUT_DIR] No Output Directory named "dist" found after the Build completed.` (project output dir misconfigured; not representative of 29 tools).');
lines.push('- **Preview access (real check 2026-11-17):** E1 URL, git-branch alias, batch1/batch2 aliases all redirect to **Vercel SSO login** — direct unauthenticated browser verification (load, EN/AR, 5 states, RTL 390px, duplicate GENIUS-12, Console/SSR-Hydration) **NOT_RUN** without access/bypass.');
lines.push('- **Ledger method (pragmatic, independent per tool):** counts `B=PASS` with `E>=E3` over applicable rows in each `tool-XXX-closure-ledger.csv`. This is an honest engineering-evidence register, **not** a full R6.1 atomic ledger except where noted (041 has authoritative ledger 76/132=57.58%). Browser/shared-blocker items marked NOT_RUN/NOT_AVAILABLE/BLOCKED/PARTIAL as applicable.');
lines.push('');
lines.push('## Tools sorted by pragmatic completion % (highest → lowest)');
lines.push('');
lines.push('| # | Tool | Batch | Route | i18n | Completion (pragmatic) | Status |');
lines.push('|---:|---|---:|---|---|---:|---|');
summary.forEach((t,i)=>{lines.push(`| ${i+1} | ${t.id} ${t.slug} | ${t.batch} | \`${t.route}\` | ${t.i18n} | **${t.num}/${t.denom} = ${t.pct}%** | IN PROGRESS / NOT CLOSED |`);});
lines.push('');
lines.push('## 100% VERIFIED');
lines.push('- **None.** No tool reaches 100% of applicable requirements with B=PASS and E>=E3 (browser E4/E3 evidence and shared blockers D-C4/C5/CLIN/W18/P-03 remain).');
lines.push('');
lines.push('## Shared blockers bundle');
lines.push('See `../R6.1-SHARED-DECISIONS-BLOCKERS.md` (D-C4, D-C5, D-CLIN, D-W18, D-P03).');
fs.writeFileSync(path.join(base,'CLOSURE-LEADERS-SUMMARY.md'),lines.join('\n'),'utf8');

console.log('generated',summary.length);
