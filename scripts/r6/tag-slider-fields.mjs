#!/usr/bin/env node
/**
 * scripts/r6/tag-slider-fields.mjs
 *
 * Adds data-r6-slider="true" to JSX <input> tags that:
 *  - are type="number" or type="range"
 *  - already declare BOTH min= and max=
 *  - are not already tagged
 *
 * Dry-run by default. Pass --write to apply.
 * No guessed ranges: a field without min+max is never touched.
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const write = args.includes('--write');
const listFlag = args.indexOf('--list');
const listFile = listFlag >= 0 ? args[listFlag + 1] : null;
const explicit = args.filter((a) => a.endsWith('.tsx'));

const repoRoot = process.cwd();

// The five frozen tools are routing-fix-only by owner decision; never patch them.
const FROZEN = new Set([
  'tool-111-smart-food-macro-substitution.tsx',
  'tool-132-ai-pose-form-coach.tsx',
  'tool-137-peptide-hormone-reconstitution-calculator.tsx',
  'tool-138-raw-powder-density-oil-formulation-engine.tsx',
  'tool-139-solvent-emulsifier-ratio-calculator.tsx',
]);

function resolveTarget(raw) {
  if (raw.includes('/') || raw.includes('\\')) return path.resolve(repoRoot, raw);
  return path.resolve(repoRoot, 'components/tools', `${raw}.tsx`);
}

function targets() {
  if (listFile) {
    return fs
      .readFileSync(path.resolve(repoRoot, listFile), 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map(resolveTarget);
  }
  if (explicit.length > 0) return explicit.map(resolveTarget);
  return fs
    .readdirSync(path.resolve(repoRoot, 'components/tools'))
    .filter((f) => /^tool-.*\.tsx$/.test(f) && !f.includes('.test.'))
    .map((f) => path.resolve(repoRoot, 'components/tools', f));
}

const INPUT_RE = /<input\b[\s\S]*?\/>/g;

function eligible(tag) {
  if (/data-r6-slider=/.test(tag)) return false;
  const isNumber = /type=["']number["']/.test(tag);
  const isRange = /type=["']range["']/.test(tag);
  if (!isNumber && !isRange) return false;
  return /\bmin=/.test(tag) && /\bmax=/.test(tag);
}

let changedFiles = 0;
let changedTags = 0;

for (const file of targets()) {
  if (!fs.existsSync(file)) {
    console.error(`MISSING ${path.relative(repoRoot, file)}`);
    continue;
  }
  if (FROZEN.has(path.basename(file))) {
    console.log(`SKIP FROZEN ${path.relative(repoRoot, file)}`);
    continue;
  }
  const before = fs.readFileSync(file, 'utf8');
  let count = 0;
  const after = before.replace(INPUT_RE, (tag) => {
    if (!eligible(tag)) return tag;
    count += 1;
    return tag.replace(/^<input\b/, '<input data-r6-slider="true"');
  });

  if (count === 0) continue;
  changedFiles += 1;
  changedTags += count;
  console.log(`${write ? 'TAG' : 'WOULD TAG'} ${path.relative(repoRoot, file)} (${count})`);
  if (write) fs.writeFileSync(file, after, 'utf8');
}

console.log(`\n${write ? 'Tagged' : 'Eligible'}: ${changedTags} input(s) in ${changedFiles} file(s).`);
if (!write) console.log('Dry-run only. Re-run with --write to apply.');
