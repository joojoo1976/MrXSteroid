#!/usr/bin/env node
/**
 * docs/MRX Genius Cloud Unified R6.1/tool-040-i18n-check.mjs
 *
 * The re-runnable AR/EN parity and contamination check for Tool 040.
 *
 * It proves four things that the acceptance claims and that a reader must be
 * able to re-run:
 *   1. the file parses;
 *   2. both locales carry exactly the same key set (no missing, no extra);
 *   3. no value is empty;
 *   4. no value carries CJK or Hangul characters (a copy-paste contamination
 *      that would show as a foreign glyph in the Arabic interface), and no
 *      stray English word is left inside the Arabic locale.
 *
 * The allowed Latin tokens are the technical ones that MUST stay Latin:
 * the marker acronyms (LDL, HDL, TG), the unit symbols (mg/dL, mmHg),
 * the file format (CSV), the publisher acronym (CDC), the scanning method
 * acronym (OCR) and the product name (Genius). A unit symbol is not a stray
 * English word: it is the same symbol the laboratory prints, in both locales.
 *
 * Usage: node tool-040-i18n-check.mjs
 * Exit code 0 = OK, 1 = a problem was found.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const file = join(here, '..', '..', 'i18n', 'tool-040-lipid-profile-optimizer.json');

const ALLOWED_LATIN = new Set(['LDL', 'HDL', 'TG', 'CSV', 'CDC', 'Genius', 'mmHg', 'OCR']);

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
  if (typeof value !== 'string' || value.trim() === '') { empty += 1; problems.push(`en.${key} is empty`); }
}
for (const [key, value] of Object.entries(ar)) {
  if (typeof value !== 'string' || value.trim() === '') { empty += 1; problems.push(`ar.${key} is empty`); }
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

// The keys the contract and the components reference must all exist.
const REQUIRED_KEYS = [
  'tool_name', 'disclaimer', 'interpretation',
  'field_ldl', 'field_hdl', 'field_tg', 'field_total_cholesterol', 'field_panel_date',
  'field_age', 'field_smoker', 'field_sbp', 'field_on_cycle', 'field_weeks_remaining',
  'help_ldl', 'help_hdl', 'help_tg', 'help_total_cholesterol', 'help_panel_date',
  'help_age', 'help_smoker', 'help_sbp', 'help_on_cycle', 'help_weeks_remaining',
  'slider_not_for_precision', 'slider_not_for_date', 'slider_not_for_boolean',
  'state_label', 'state_empty', 'state_partial', 'state_full', 'state_invalid', 'state_degraded',
  'empty_state', 'partial_state', 'invalid_state', 'degraded_state', 'invalid_input',
  'out_of_range', 'invalid_number', 'invalid_date',
  'panel_section', 'context_section',
  'band_optimal', 'band_borderline', 'band_high', 'band_very_high',
  'overall_band', 'non_hdl', 'interventions', 'band_ladder_title', 'band_ladder_note',
  'freshness_label', 'freshness_current', 'freshness_stale', 'days_old',
  'visual_section_title', 'visual_section_label', 'illustration_title', 'illustration_caption', 'illustration_desc',
  'illustration_marker_note', 'marker_meaning_ldl', 'marker_meaning_hdl', 'marker_meaning_tg',
  'step1_title', 'step1_body', 'step2_title', 'step2_body', 'step3_title', 'step3_body',
  'step4_title', 'step4_body', 'step5_title', 'step5_body',
  'chart_bar_title', 'chart_bar_scale_note', 'chart_legend_label', 'chart_legend_value',
  'chart_legend_reference', 'chart_legend_status',
  'table_title', 'table_caption', 'table_marker', 'table_value', 'table_unit', 'table_reference', 'table_band', 'table_reading',
  'pie_decision_title',
  'tooltip_meaning_label', 'tooltip_value_label', 'tooltip_ratio_label', 'tooltip_explanation_label',
  'tooltip_formula_label', 'tooltip_source_label', 'tooltip_warning_label', 'tooltip_limitation_label',
  'tooltip_close', 'tooltip_source_engine', 'tooltip_limitation_reference', 'tooltip_limitation_illustration',
  'c1_formula_band', 'c2_formula_multiple', 'c2_assumptions', 'c2_uncertainty',
  'c1_confidence_value', 'c1_range_note',
  'safety_title', 'safety_red_flag', 'safety_referral', 'safety_referral_1', 'safety_referral_2',
  'safety_referral_3', 'safety_do_not', 'safety_do_not_1', 'safety_do_not_2', 'safety_stop', 'safety_stop_body',
  'source_medlineplus_publisher', 'source_cdc_publisher',
  'source_cholesterol_levels_title', 'source_cholesterol_levels_note',
  'source_triglycerides_title', 'source_triglycerides_note',
  'source_cholesterol_topic_title', 'source_cholesterol_topic_note',
  'source_cdc_cholesterol_title', 'source_cdc_cholesterol_note',
  'source_reviewed', 'source_level', 'sources_intro',
  'genius_section_label', 'genius_title', 'genius_title_compact', 'genius_compact', 'genius_full', 'genius_mode_label',
  'box1_title', 'box1_note', 'box2_title', 'box3_title', 'box4_title', 'box4_note',
  'box5_title', 'box5_intro', 'box5_current', 'box5_unavailable', 'box5_out_of_range', 'box5_unchanged', 'box5_recommendation_note',
  'box6_title', 'box6_intro', 'box6_effect_status', 'box6_effect_no_status', 'box6_effect_recommendation',
  'sens_ldl_label', 'sens_hdl_label', 'sens_tg_label', 'sens_age_label', 'sens_sbp_label',
  'box7_title', 'box8_title', 'box8_intro', 'box8_link_note', 'box8_freshness', 'box8_mapped_fields',
  'box8_no_shared_field', 'box8_stale_action',
  'box9_title', 'box10_title', 'box10_intro', 'box10_button', 'box10_note',
  'box11_title', 'box11_na', 'box12_title', 'box12_next', 'box12_next_body', 'box12_not', 'box12_not_body',
  'box12_doctor', 'box12_doctor_body', 'box12_rating', 'box12_rating_na',
  'capability_title', 'capability_evidence', 'capability_can', 'capability_cannot', 'capability_sources',
  'capability_why', 'capability_cost', 'capability_stop', 'capability_restore',
  'capability_can_text', 'capability_cannot_text', 'capability_sources_text', 'capability_why_text',
  'capability_cost_text', 'capability_stop_text', 'capability_restore_text',
  'kpi_overall_band', 'kpi_worst_marker', 'kpi_non_hdl',
  'box2_value_label', 'box2_band_label', 'box2_why_label', 'box2_why_text',
  'box3_formula_label', 'box3_assumptions_label', 'box3_uncertainty_label', 'box3_inputs_label',
  'box4_readings_label', 'box4_context_label', 'box4_freshness_note', 'box4_not_entered', 'box4_total_estimated',
  'yes', 'no', 'unanswered',
];
const absent = REQUIRED_KEYS.filter((key) => !(key in en) || !(key in ar));
console.log('required keys absent:', absent.length === 0 ? 'none' : absent.join(', '));
if (absent.length) problems.push(`${absent.length} required key(s) absent`);

if (problems.length) {
  console.log('');
  console.log('I18N_PROBLEMS:');
  problems.forEach((p) => console.log('  ' + p));
  process.exit(1);
}

console.log('');
console.log('I18N_PARITY: OK');
process.exit(0);
