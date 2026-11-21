#!/usr/bin/env node
/**
 * docs/MRX Genius Cloud Unified R6.1/tool-049-i18n-check.mjs
 *
 * The re-runnable AR/EN parity and contamination check for Tool 049.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const file = join(root, 'i18n', 'tool-049-bone-density.json');

const ALLOWED_LATIN = new Set(['DXA', 'AI', 'CSV', 'CORE', 'IU']);

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

const MAP_KEYS = [
  'state_empty', 'state_partial', 'state_full', 'state_invalid', 'state_degraded',
  'state_hint_empty', 'state_hint_partial', 'state_hint_full', 'state_hint_invalid',
  'state_hint_degraded',
  'error_invalid_number', 'error_out_of_range', 'error_required', 'error_schema_mismatch',
  'band_optimal', 'band_good', 'band_at_risk', 'band_high_risk', 'band_unknown',
  'rf_ai_exposure', 'rf_low_resistance', 'rf_low_calcium', 'rf_low_vitamin_d', 'rf_smoking',
  'rf_postmenopausal', 'rf_advanced_age', 'rf_unknown',
  'iv_review_ai', 'iv_resistance_program', 'iv_calcium', 'iv_vitamin_d', 'iv_smoking_cessation',
  'iv_dxa', 'iv_unknown',
  'warning_educational', 'warning_fracture', 'warning_unknown',
  'contribution_base', 'contribution_resistance', 'contribution_calcium', 'contribution_vitamin_d',
  'contribution_ai', 'contribution_smoking', 'contribution_postmenopausal', 'contribution_advanced_age',
  'cross_tool_047_field', 'cross_tool_047_note', 'cross_tool_047_freshness',
  'cross_tool_046_field', 'cross_tool_046_note', 'cross_tool_046_freshness',
];

const REQUIRED_KEYS = [
  'tool_name', 'state_label', 'state_waiting', 'state_no_result', 'not_answered',
  'field_age', 'field_sex', 'sex_male', 'sex_female', 'field_uses_ai_years', 'field_weekly_resistance',
  'field_calcium', 'field_vitamin_d', 'field_smoker', 'yes', 'no',
  'unit_points',
  'kpi_score', 'kpi_band', 'kpi_risk_factors', 'kpi_interventions',
  'genius_title', 'genius_title_compact', 'genius_compact', 'genius_full',
  'genius_section_label', 'genius_mode_label',
  'box1_title', 'box2_title', 'box3_title', 'box4_title', 'box5_title', 'box6_title',
  'box7_title', 'box8_title', 'box9_title', 'box10_title', 'box11_title', 'box12_title',
  'box1_note', 'primary_score_suffix', 'confidence', 'confidence_not_assessed',
  'primary_heuristic_note', 'primary_not_dxa_note', 'not_a_prescription',
  'formula_title', 'formula_base', 'formula_resistance', 'formula_calcium', 'formula_vitd',
  'formula_ai', 'formula_smoking', 'formula_postmenopausal', 'formula_advanced_age', 'formula_clamp',
  'contributions_title', 'contributions_total',
  'inputs_used', 'assumptions_title', 'assumptions_body', 'uncertainty_title', 'uncertainty_body',
  'box4_not_entered', 'box4_inputs_label', 'box4_waiting',
  'box5_intro', 'box5_changed', 'box5_unchanged', 'box5_out_of_range',
  'box5_age_up', 'box5_ai_up', 'box5_resistance_up', 'box5_calcium_up', 'box5_vitd_up', 'box5_smoking_toggle',
  'box6_intro', 'box6_effect_status', 'box6_effect_no_status', 'box6_no_single_change',
  'box6_effect_recommendation',
  'risk_factors_title', 'no_risk_factors', 'interventions_title', 'no_interventions',
  'interventions_informational_note',
  'warnings_title', 'no_warnings', 'red_flags', 'no_red_flags',
  'red_flag_fracture', 'red_flag_smoking', 'red_flag_ai',
  'referral_title', 'referral_not_available', 'pending_medical_review',
  'box8_intro', 'box8_mapped_fields', 'box8_freshness', 'box8_link_note', 'box8_prev_next',
  'box8_no_transfer', 'box8_transfer_manual', 'box8_calculated_at',
  'evidence_none', 'evidence_pending_review', 'evidence_no_invented_range',
  'evidence_publisher', 'evidence_date', 'evidence_level',
  'box10_intro', 'box10_button', 'box10_note', 'box10_unavailable', 'box11_na',
  'next_step', 'do_not', 'seek_care', 'not_a_diagnosis', 'c5_not_available',
  'box12_rating', 'box12_rating_not_saved', 'box12_rating_aria',
  ...MAP_KEYS,
];

const absent = [...new Set(REQUIRED_KEYS)].filter((key) => !(key in en) || !(key in ar));
console.log('required keys absent:', absent.length === 0 ? 'none' : absent.join(', '));
if (absent.length) problems.push(`${absent.length} required key(s) absent`);

const sources = [
  join(root, 'components', 'tools', 'tool-049-bone-density.tsx'),
  join(root, 'components', 'tools', 'tool-049-bone-density.genius.tsx'),
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

const contract = readFileSync(
  join(root, 'lib', 'tools', 'r6', 'tool-049-bone-density-contract.ts'),
  'utf8',
);
const mapped = new Set();
for (const match of contract.matchAll(/:\s*'([a-z][a-z0-9_]*_(?:field|note|freshness))'/g)) {
  mapped.add(match[1]);
}
for (const match of contract.matchAll(/:\s*'(band_[a-z0-9_]+)'/g)) mapped.add(match[1]);
for (const match of contract.matchAll(/:\s*'(rf_[a-z0-9_]+)'/g)) mapped.add(match[1]);
for (const match of contract.matchAll(/:\s*'(iv_[a-z0-9_]+)'/g)) mapped.add(match[1]);
for (const match of contract.matchAll(/:\s*'(warning_[a-z0-9_]+)'/g)) mapped.add(match[1]);
for (const match of contract.matchAll(/labelKey:\s*'(contribution_[a-z0-9_]+)'/g)) {
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
