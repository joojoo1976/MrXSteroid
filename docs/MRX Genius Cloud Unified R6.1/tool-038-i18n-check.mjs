#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const file = join(root, 'i18n', 'tool-038-stack-compatibility.json');
const ALLOWED_LATIN = new Set(['CSV','CORE','AI','DHT','SERM']);
const raw = readFileSync(file, 'utf8');
let parsed; try { parsed = JSON.parse(raw); console.log('JSON.parse: OK'); } catch (e) { console.error('JSON.parse: FAILED -', e.message); process.exit(1); }
const problems = [];
const en = parsed.en, ar = parsed.ar;
const enKeys = Object.keys(en), arKeys = Object.keys(ar);
console.log(`keys: en = ${enKeys.length}, ar = ${arKeys.length}`);
const missingInAr = enKeys.filter(k=>!(k in ar)); const missingInEn = arKeys.filter(k=>!(k in en));
console.log(`[ar] missing: ${missingInAr.length}`); console.log(`[en] missing: ${missingInEn.length}`);
if (missingInAr.length) problems.push(`${missingInAr.length} key(s) missing in ar`);
if (missingInEn.length) problems.push(`${missingInEn.length} key(s) missing in en`);
let empty=0; for (const loc of ['en','ar']) for (const [k,v] of Object.entries(parsed[loc])) if(typeof v!=='string'||v.trim()===''){empty++;problems.push(`${loc}.${k} empty`);} 
console.log('empty values:', empty===0?'none':empty);
const cjk=/[\u4e00-\u9fff\uac00-\ud7af]/; let cont=0; for(const loc of ['en','ar']) for(const [k,v] of Object.entries(parsed[loc])) if(cjk.test(String(v))){cont++;problems.push(`[${loc}] ${k} CJK`);} 
console.log('CJK/Hangul contamination count:', cont);
const stray=[]; for(const [k,v] of Object.entries(ar)){ const words=String(v).match(/\b[A-Za-z]{3,}\b/g)??[]; for(const w of words) if(!ALLOWED_LATIN.has(w)) stray.push(`${k}: ${w}`); }
console.log('stray Latin words in ar:', stray.length===0?'none':stray.join(', '));
if(stray.length) problems.push(`${stray.length} stray Latin word(s) in ar`);
const sources=[join(root,'components/tools/tool-038-stack-compatibility.tsx'),join(root,'components/tools/tool-038-stack-compatibility.genius.tsx')];
const used=new Set(); for(const s of sources){const text=readFileSync(s,'utf8'); for(const m of text.matchAll(/\bt\.([a-zA-Z0-9_]+)/g)) used.add(m[1]); for(const m of text.matchAll(/titleKey:\s*'([a-z0-9_]+)'/g)) used.add(m[1]);}
['family_testosterone','family_nandrolone','family_trenbolone','family_dht','family_oral','family_ai','family_serm','family_support'].forEach(k=>used.add(k));
const unresolved=[...used].filter(k=>!(k in en)||!(k in ar)).sort();
console.log('unresolved t.* keys:', unresolved.length===0?'none':unresolved.join(', '));
if(unresolved.length) problems.push(`${unresolved.length} unresolved`);
const REQUIRED=['state_empty','state_partial','state_full','state_invalid','state_degraded','box1_title','box2_title','box3_title','box4_title','box5_title','box6_title','box7_title','box8_title','box9_title','box10_title','box11_title','box12_title','box10_button','box11_na','pending_medical_review','c5_not_available','not_a_diagnosis','confidence_not_assessed'];
const absent=REQUIRED.filter(k=>!(k in en)||!(k in ar));
console.log('required keys absent:', absent.length===0?'none':absent.join(', '));
if(absent.length) problems.push('required absent');
if(problems.length){ console.log('\nI18N_PROBLEMS:'); problems.forEach(p=>console.log('  '+p)); process.exit(1); }
console.log('\nI18N_PARITY: OK'); process.exit(0);
