#!/usr/bin/env node
/**
 * docs/MRX Genius Cloud Unified R6.1/tool-042-i18n-check.mjs
 *
 * The re-runnable AR/EN parity and contamination check for Tool 042.
 *
 * It proves:
 *   1. the file parses;
 *   2. both locales carry exactly the same key set (no missing, no extra);
 *   3. no value is empty;
 *   4. no value carries CJK or Hangul characters, and no stray English word is
 *      left inside the Arabic locale (the tokens that MUST stay Latin are
 *      listed below);
 *   5. every key the Tool 042 component, its GENIUS module and its contract
 *      module read (statically or through a label map) exists in both locales.
 *
 * Usage: node tool-042-i18n-check.mjs
 * Exit code 0 = OK, 1 = a problem was found.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const file = join(root, 'i18n', 'tool-042-estrogen-management.json');

const ALLOWED_LATIN = new Set(['CSV', 'Genius', 'CORE']);

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

// Keys the modules read through a map or a computed key, so a static scan
// cannot see them.
const REQUIRED_KEYS = [
  'tool_name',
  'field_e2', 'field_weekly_test', 'field_taking_ai', 'field_ai_dose', 'field_body_fat',
  'field_symptoms', 'unit_pg_ml', 'unit_mg_week',
  'symptom_nipple_sensitivity', 'symptom_water_retention', 'symptom_mood_swings',
  'symptom_low_libido', 'symptom_edema', 'symptoms_none',
  'state_label', 'state_empty', 'state_partial', 'state_full', 'state_invalid', 'state_degraded',
  'state_waiting', 'state_no_result',
  'state_hint_empty', 'state_hint_partial', 'state_hint_full', 'state_hint_invalid',
  'state_hint_degraded',
  'not_answered', 'yes', 'no',
  'error_invalid_number', 'error_out_of_range', 'error_required', 'error_not_applicable',
  'latest_e2', 'optimal_range_label', 'reference_note', 'confidence', 'confidence_not_assessed',
  'delta_label', 'action_label', 'prescriber_review_only', 'not_a_prescription',
  'band_low', 'band_optimal', 'band_elevated', 'band_high', 'band_unknown',
  'action_none', 'action_monitor', 'action_adjust_ai', 'action_reduce_test', 'action_unknown',
  'formula_title', 'formula_band', 'formula_symptom', 'formula_delta', 'formula_action',
  'assumptions_title', 'assumptions_body', 'uncertainty_title', 'uncertainty_body', 'inputs_used',
  'warnings_title', 'warning_elevated_e2_without_ai', 'warning_ai_may_be_overshooting',
  'warning_low_e2_without_ai', 'warning_e2_extreme', 'warning_unknown', 'no_warnings',
  'red_flags', 'red_flag_high', 'red_flag_extreme', 'red_flag_ai_overshoot',
  'referral_title', 'referral_not_available', 'pending_medical_review',
  'evidence_title', 'evidence_none', 'evidence_pending_review', 'evidence_name',
  'evidence_publisher', 'evidence_date', 'evidence_level', 'evidence_link',
  'next_step', 'do_not', 'seek_care', 'not_a_diagnosis', 'c5_not_available',
  'genius_title', 'genius_title_compact', 'genius_compact', 'genius_full',
  'genius_section_label', 'genius_mode_label',
  'box1_title', 'box2_title', 'box3_title', 'box4_title', 'box5_title', 'box6_title',
  'box7_title', 'box8_title', 'box9_title', 'box10_title', 'box11_title', 'box12_title',
  'kpi_e2', 'kpi_band', 'kpi_delta', 'kpi_action', 'box1_note',
  'box4_inputs_label', 'box4_symptoms_label', 'box4_not_entered', 'box4_waiting',
  'box5_intro', 'box5_current', 'box5_unchanged', 'box5_out_of_range',
  'box5_e2_up', 'box5_e2_down', 'box5_ai_toggle', 'box5_symptom_add',
  'box6_intro', 'box6_effect_status', 'box6_effect_no_status', 'box6_no_single_change',
  'box6_effect_recommendation', 'box6_e2_up', 'box6_e2_down', 'box6_ai_toggle',
  'box6_symptom_add',
  'box8_intro', 'box8_mapped_fields', 'box8_freshness', 'box8_link_note', 'box8_prev_next',
  'box8_no_transfer', 'box8_transfer_manual', 'box8_calculated_at',
  'cross_tool_006_field', 'cross_tool_006_note', 'cross_tool_006_freshness',
  'cross_tool_023_field', 'cross_tool_023_note', 'cross_tool_023_freshness',
  'box10_intro', 'box10_button', 'box10_note', 'box10_unavailable', 'box11_na',
  'box12_next', 'box12_not', 'box12_doctor', 'box12_rating', 'box12_rating_not_saved',
  'box12_rating_aria',
  'csv_band', 'csv_projection',
];

const absent = REQUIRED_KEYS.filter((key) => !(key in en) || !(key in ar));
console.log('required keys absent:', absent.length === 0 ? 'none' : absent.join(', '));
if (absent.length) problems.push(`${absent.length} required key(s) absent`);

// Every key the modules read with `t.<key>` or declare as `titleKey` must exist.
const sources = [
  join(root, 'components', 'tools', 'tool-042-estrogen-management.tsx'),
  join(root, 'components', 'tools', 'tool-042-estrogen-management.genius.tsx'),
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

// Keys declared in the contract's label maps must also exist.
const contract = readFileSync(
  join(root, 'lib', 'tools', 'r6', 'tool-042-estrogen-management-contract.ts'),
  'utf8',
);
const mapped = new Set();
for (const match of contract.matchAll(/:\s*'((?:band|action|symptom|warning)_[a-z0-9_]+)'/g)) {
  mapped.add(match[1]);
}
const unmapped = [...mapped].filter((key) => !(key in en) || !(key in ar)).sort();
console.log('unresolved contract keys:', unmapped.length === 0 ? 'none' : unmapped.join(', '));
if (unmapped.length) problems.push(`${unmapped.length} contract key(s) unresolved`);

if (problems.length) {
  console.log('');
  console.log('I18N_PROBLEMS:');
  problems.forEach((p) => console.log('  ' + p));
  process.exit(1);
}

console.log('');
console.log('I18N_PARITY: OK');
process.exit(0);
