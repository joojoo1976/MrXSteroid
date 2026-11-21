#!/usr/bin/env node
/**
 * docs/MRX Genius Cloud Unified R6.1/tool-041-i18n-check.mjs
 *
 * The re-runnable AR/EN parity and contamination check for Tool 041.
 *
 * It proves:
 *   1. the file parses;
 *   2. both locales carry exactly the same key set (no missing, no extra);
 *   3. no value is empty;
 *   4. no value carries CJK or Hangul characters, and no stray English word is
 *      left inside the Arabic locale (the tokens that MUST stay Latin are
 *      listed below);
 *   5. every key the Tool 041 component and GENIUS module read through `t.*`
 *      exists in both locales.
 *
 * Usage: node tool-041-i18n-check.mjs
 * Exit code 0 = OK, 1 = a problem was found.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const file = join(root, 'i18n', 'tool-041-hematocrit-monitor.json');

const ALLOWED_LATIN = new Set(['HCT', 'CSV', 'Genius', 'CORE']);

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
if (problems.length) {
  problems.forEach((p) => console.error('  ' + p));
  process.exit(1);
}

const en = parsed.en;
const ar = parsed.ar;
const enKeys = Object.keys(en);
const arKeys = Object.keys(ar);

console.log(`keys: en = ${enKeys.length}, ar = ${arKeys.length}`);

const missingInAr = enKeys.filter((key) => !(key in ar));
const missingInEn = arKeys.filter((key) => !(key in en));
const onlyEn = enKeys.filter((key) => !(key in ar));
const onlyAr = arKeys.filter((key) => !(key in en));

console.log(`[ar] missing: ${missingInAr.length}`, missingInAr.slice(0, 10).join(', '));
console.log(`[en] missing: ${missingInEn.length}`, missingInEn.slice(0, 10).join(', '));
console.log('keys only in en/ar:', onlyEn.length === 0 && onlyAr.length === 0 ? 'none' : [...onlyEn, ...onlyAr].join(', '));

if (missingInAr.length) problems.push(`${missingInAr.length} key(s) missing in ar`);
if (missingInEn.length) problems.push(`${missingInEn.length} key(s) missing in en`);

let empty = 0;
for (const [key, value] of Object.entries(en)) {
  if (typeof value !== 'string' || value.trim() === '') {
    empty += 1;
    problems.push(`en.${key} is empty`);
  }
}
for (const [key, value] of Object.entries(ar)) {
  if (typeof value !== 'string' || value.trim() === '') {
    empty += 1;
    problems.push(`ar.${key} is empty`);
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

// Exact keys that the state maps and box titles read dynamically.
const REQUIRED_KEYS = [
  'tool_name', 'readings', 'add_reading', 'hct', 'date', 'sex', 'male', 'female',
  'on_cycle', 'weeks_remaining', 'band', 'trend', 'projected', 'donate', 'warnings',
  'state_label', 'state_empty', 'state_partial', 'state_full', 'state_invalid', 'state_degraded',
  'state_waiting', 'state_no_result', 'state_hint_empty', 'state_hint_partial', 'state_hint_full',
  'state_hint_invalid', 'state_hint_degraded', 'not_answered', 'yes', 'no', 'reading_label',
  'remove_reading', 'error_invalid_number', 'error_out_of_range', 'error_invalid_date', 'error_required',
  'latest', 'baseline', 'unit_pct', 'reference_range', 'display_bounds', 'display_bounds_note',
  'pending_clinical_band', 'confidence', 'confidence_not_assessed', 'trend_per_30d',
  'projected_date', 'not_projected', 'band_normal', 'band_borderline', 'band_high',
  'band_very_high', 'band_unknown',
  'formula_title', 'formula_slope', 'formula_band', 'formula_projection', 'formula_donate',
  'donation_title', 'donation_note', 'assumptions_title', 'uncertainty_title', 'inputs_used',
  'assumptions_body', 'uncertainty_body',
  'warnings_title', 'warning_on_cycle_elevated_hct', 'warning_rising_trend_30d',
  'warning_above_intervention_line_seek_physician', 'warning_no_valid_readings', 'warning_unknown',
  'no_warnings', 'red_flags', 'red_flag_above_intervention', 'red_flag_very_high',
  'red_flag_rapid_rise', 'referral_title', 'referral_not_available', 'pending_medical_review',
  'evidence_title', 'evidence_none', 'evidence_pending_review', 'evidence_name', 'evidence_publisher',
  'evidence_date', 'evidence_level', 'evidence_link',
  'next_step', 'do_not', 'seek_care', 'not_a_diagnosis', 'c5_not_available',
  'genius_title', 'genius_title_compact', 'genius_compact', 'genius_full', 'genius_section_label',
  'genius_mode_label',
  'box1_title', 'box2_title', 'box3_title', 'box4_title', 'box5_title', 'box6_title',
  'box7_title', 'box8_title', 'box9_title', 'box10_title', 'box11_title', 'box12_title',
  'box1_note', 'box4_readings_label', 'box4_context_label', 'box4_not_entered', 'box4_waiting',
  'box5_intro', 'box5_current', 'box5_unchanged', 'box5_delta', 'box5_out_of_range',
  'box5_latest_up', 'box5_latest_down', 'box5_sex_flip', 'box5_on_cycle_flip',
  'box6_intro', 'box6_effect_status', 'box6_effect_no_status', 'box6_no_single_change',
  'box6_effect_recommendation', 'box6_latest_up', 'box6_latest_down', 'box6_sex_flip',
  'box6_on_cycle_flip',
  'box8_intro', 'box8_mapped_fields', 'box8_freshness', 'box8_link_note', 'box8_prev_next',
  'box8_related', 'box8_no_transfer', 'box8_transfer_manual', 'box8_calculated_at',
  'cross_tool_023_field', 'cross_tool_023_note', 'cross_tool_023_freshness',
  'cross_tool_007_field', 'cross_tool_007_note', 'cross_tool_007_freshness',
  'box10_intro', 'box10_button', 'box10_note', 'box10_unavailable', 'box11_na',
  'box12_next', 'box12_not', 'box12_doctor', 'box12_rating', 'box12_rating_not_saved',
  'box12_rating_aria',
  'kpi_latest', 'kpi_band', 'kpi_slope', 'kpi_projection', 'unit_pp_30d', 'csv_band', 'csv_projection',
];

const absent = REQUIRED_KEYS.filter((key) => !(key in en) || !(key in ar));
console.log('required keys absent:', absent.length === 0 ? 'none' : absent.join(', '));
if (absent.length) problems.push(`${absent.length} required key(s) absent`);

// Every key the modules read with `t.<key>` must exist in both locales.
const sources = [
  join(root, 'components', 'tools', 'tool-041-hematocrit-monitor.tsx'),
  join(root, 'components', 'tools', 'tool-041-hematocrit-monitor.genius.tsx'),
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
