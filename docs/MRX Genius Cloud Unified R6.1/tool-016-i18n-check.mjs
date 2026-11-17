#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const file = join(root, 'i18n', 'tool-016-half-life-calculator.json');

const ALLOWED_LATIN = new Set(['CSV', 'CORE', 'PCT']);

const raw = readFileSync(file, 'utf8');
let parsed;
try {
  parsed = JSON.parse(raw);
  console.log('JSON.parse: OK');
} catch (error) {
  console.error('JSON.parse: FAILED -', error.message);
  process.exit(1);
}

const locales = Object.keys(parsed);
console.log('locales:', locales.join(', '));

const problems = [];
if (!locales.includes('en')) problems.push('the "en" locale is missing');
if (!locales.includes('ar')) problems.push('the "ar" locale is missing');
if (problems.length) { problems.forEach((p) => console.error('  ' + p)); process.exit(1); }

const en = parsed.en;
const ar = parsed.ar;
const enKeys = Object.keys(en);
const arKeys = Object.keys(ar);

console.log(`keys: en = ${enKeys.length}, ar = ${arKeys.length}`);

const missingInAr = enKeys.filter((key) => !(key in ar));
const missingInEn = arKeys.filter((key) => !(key in en));

console.log(`[ar] missing: ${missingInAr.length}`, missingInAr.slice(0, 10).join(', '));
console.log(`[en] missing: ${missingInEn.length}`, missingInEn.slice(0, 10).join(', '));

if (missingInAr.length) problems.push(`${missingInAr.length} key(s) missing in ar`);
if (missingInEn.length) problems.push(`${missingInEn.length} key(s) missing in en`);

let empty = 0;
for (const locale of locales) {
  for (const [key, value] of Object.entries(parsed[locale])) {
    if (typeof value !== 'string' || value.trim() === '') {
      empty += 1;
      problems.push(`${locale}.${key} is empty`);
    }
  }
}
console.log('empty values:', empty === 0 ? 'none' : empty);

const cjk = /[\u4e00-\u9fff\uac00-\ud7af]/;
let contamination = 0;
for (const locale of locales) {
  for (const [key, value] of Object.entries(parsed[locale])) {
    if (cjk.test(String(value))) {
      contamination += 1;
      problems.push(`[${locale}] ${key} carries CJK/Hangul characters: ${String(value).slice(0, 60)}`);
    }
  }
}
console.log('CJK/Hangul contamination count:', contamination);

const stray = [];
for (const [key, value] of Object.entries(ar)) {
  const words = String(value).match(/\b[A-Za-z]{3,}\b/g) ?? [];
  for (const word of words) {
    if (!ALLOWED_LATIN.has(word)) stray.push(`${key}: ${word}`);
  }
}
console.log('stray Latin words in ar:', stray.length === 0 ? 'none' : stray.join(', '));
if (stray.length) problems.push(`${stray.length} stray Latin word(s) in the Arabic locale`);

const sources = [
  join(root, 'components', 'tools', 'tool-016-half-life-calculator.tsx'),
  join(root, 'components', 'tools', 'tool-016-half-life-calculator.genius.tsx'),
];
const used = new Set();
for (const source of sources) {
  const text = readFileSync(source, 'utf8');
  for (const match of text.matchAll(/\bt\.([a-zA-Z0-9_]+)/g)) used.add(match[1]);
  for (const match of text.matchAll(/titleKey:\s*'([a-z0-9_]+)'/g)) used.add(match[1]);
}
const unresolved = [...used].filter((key) => !(key in en) || !(key in ar)).sort();
console.log('unresolved t.* keys:', unresolved.length === 0 ? 'none' : unresolved.join(', '));
if (unresolved.length) problems.push(`${unresolved.length} t.* key(s) unresolved`);

if (problems.length) {
  console.log('');
  console.log('I18N_PROBLEMS:');
  problems.forEach((p) => console.log('  ' + p));
  process.exit(1);
}

console.log('');
console.log('I18N_PARITY: OK');
process.exit(0);
