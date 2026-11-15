#!/usr/bin/env node
/** verify-phase2: checks Phase 2 shell markers on a built app. */
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execSync } from 'node:child_process';

const root = process.cwd();
const listFile = process.argv[2] ?? 'scripts/r6/batch-03.txt';
const PORT = Number(process.env.R6_VERIFY_PORT ?? 3111);
const BASE = `http://127.0.0.1:${PORT}`;

const slugs = fs.readFileSync(path.resolve(root, listFile), 'utf8').split(/\r?\n/).map(l=>l.trim()).filter(l=>l&&!l.startsWith('#')).map(l=>path.basename(l).replace(/\.tsx$/,''));
const catalogDir = path.join(root, 'lib/tools');
let catalog = '';
for (const f of fs.readdirSync(catalogDir).filter(f=>/^smartToolsCatalog.*\.ts$/.test(f))) catalog += fs.readFileSync(path.join(catalogDir,f),'utf8')+'\n';
const hrefBySlug = new Map();
for (const m of catalog.matchAll(/slug:\s*'([^']+)'[\s\S]{0,400}?href:\s*'([^']+)'/g)) hrefBySlug.set(m[1], m[2]);

async function waitForServer(t=120_000){ const s=Date.now(); while(Date.now()-s<t){ try{ const r=await fetch(BASE+'/',{redirect:'manual'}); if(r.status<500) return true;}catch{} await new Promise(r=>setTimeout(r,1000)); } return false; }
function stop(child){ if(!child?.pid) return; try{ if(process.platform==='win32') execSync(`taskkill /pid ${child.pid} /T /F`,{stdio:'ignore'}); else child.kill('SIGTERM'); }catch{} }

let child;
try {
  child = spawn(process.platform==='win32'?'npm.cmd':'npm',['run','start','--','-p',String(PORT)],{cwd:root,shell:true,env:{...process.env,PORT:String(PORT)},stdio:'ignore'});
  if (!(await waitForServer())) { console.error('Server not ready'); process.exit(1); }
  const failures=[]; let checked=0;
  for (const slug of slugs) {
    const href = hrefBySlug.get(slug);
    if (!href) { failures.push(`${slug}: no href`); continue; }
    for (const locale of ['en','ar']) {
      const url = locale==='ar' ? `${BASE}/ar${href}` : `${BASE}${href}`;
      const res = await fetch(url,{redirect:'follow'});
      const html = await res.text();
      checked++;
      if (res.status!==200) failures.push(`${slug} [${locale}]: HTTP ${res.status}`);
      if (!html.includes('data-r6-capability')) failures.push(`${slug} [${locale}]: capability contract missing`);
      if (!html.includes('data-crosstool')) failures.push(`${slug} [${locale}]: cross-tool marker missing`);
      if (!html.includes('FAQPage')) failures.push(`${slug} [${locale}]: FAQ schema missing`);
    }
  }
  if (failures.length) { console.error(`FAIL ${failures.length}/${checked}`); for(const f of failures) console.error(` - ${f}`); process.exitCode=1; }
  else console.log(`PASS ${checked}/${checked} (phase2 markers)`);
} finally { stop(child); }
