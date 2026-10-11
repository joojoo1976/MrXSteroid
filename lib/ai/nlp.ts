/**
 * lib/ai/nlp.ts — deterministic NLP for SmartTools (SPEC §10, §11, §19).
 * ═══════════════════════════════════════════════════════════════════════════
 *  Arabic-friendly normalisation, intent classification and keyword expansion.
 *  Fully offline and unit-testable — it never calls a network provider, so it
 *  is the reliable backbone even when the AI provider is unavailable.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import type { AiIntent, AiMessage } from './types';

/**
 * Normalise Arabic + English text:
 *  - strip Arabic diacritics (tashkeel) and tatweel
 *  - unify alef variants (أإآٱ → ا), ya (ى → ي), ta marbuta (ة → ه)
 *  - remove Arabic-Indic digits → ASCII
 *  - collapse whitespace, lowercase
 */
export function normalizeText(value: string): string {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670]/g, '') // tashkeel + dagger alef
    .replace(/\u0640/g, '') // tatweel
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627') // alef variants → alef
    .replace(/\u0649/g, '\u064A') // alef maksura → ya
    .replace(/\u0629/g, '\u0647') // ta marbuta → ha
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/\s+/g, ' ')
    .trim();
}

/** Tokenise normalised text into words (length ≥ 2). */
export function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length >= 2);
}

const ARABIC_DIACRITIC_SAFE = /^[\p{L}\p{N}\s]+$/u;
export function isArabic(value: string): boolean {
  return /[\u0600-\u06FF]/.test(value) && ARABIC_DIACRITIC_SAFE.test(value.replace(/[\u0600-\u06FF]/g, 'ا'));
}

const DANGER_PATTERNS: RegExp[] = [
  /\bchest pain\b/i,
  /\bcan'?t breathe\b/i,
  /\bsevere bleeding\b/i,
  /\bunconscious\b/i,
  /ألم في الصدر/,
  /ضيق (في )?النفس/,
  /نزيف/,
  /فقدان الوعي/,
];

const DOSING_PATTERNS: RegExp[] = [
  /\bhow (much|many)\b.*\b(mg|iu|ml)\b/i,
  /\bdose\b.*\b(for me|should i)\b/i,
  /\bwhat dose\b/i,
  /كم (جرعه|ملغ|وحده)/,
  /ما هي الجرعه/,
  /الجرعه المناسبه/,
];

const FIND_TOOL_PATTERNS: RegExp[] = [
  /\b(find|show|which|what) .*\b(tool|calculator)\b/i,
  /\bcalculator\b/i,
  /ابحث|اعرض|اي (اداه|حاسبه)|ما هي الاداه/,
];

const REPORT_PATTERNS: RegExp[] = [/\breport\b/i, /تقرير/, /\bsummary\b/i, /ملخص/];
const NAVIGATE_PATTERNS: RegExp[] = [/\bgo to\b/i, /\bopen\b/i, /افتح|اذهب/];

/** Classify the user's intent from the latest message. */
export function classifyIntent(text: string): AiIntent {
  const raw = text ?? '';
  const norm = normalizeText(raw);
  const hits = (patterns: RegExp[]) => patterns.some((re) => re.test(raw) || re.test(norm));
  if (hits(DANGER_PATTERNS)) return 'emergency';
  if (hits(DOSING_PATTERNS)) return 'dosing-request';
  if (hits(REPORT_PATTERNS)) return 'report';
  if (hits(FIND_TOOL_PATTERNS)) return 'find-tool';
  if (hits(NAVIGATE_PATTERNS)) return 'navigate';
  return 'explain-concept';
}

/** Extract the searchable topic from the last user message. */
export function extractQuery(messages: AiMessage[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  if (!lastUser) return '';
  return lastUser.content
    .replace(/^(find|show|open|ابحث عن|اعرض|افتح)\s+/i, '')
    .trim();
}

/**
 * Expand a query with bilingual synonyms so AR/EN users reach the same tools.
 * Deterministic map — no external dependency.
 */
const SYNONYMS: ReadonlyArray<readonly [RegExp, string[]]> = [
  [/macros?|ماكرو|سعرات|كالوري/, ['macro', 'calorie', 'nutrition']],
  [/half.?life|نصف العمر/, ['half-life', 'pharmacokinetics']],
  [/injection|حقن|ابره/, ['injection', 'site', 'volume']],
  [/blood ?work|تحاليل|مختبر/, ['bloodwork', 'lab', 'monitoring']],
  [/pct|استعاده|تعافي/, ['pct', 'recovery', 'hpta']],
  [/estrogen|استروجين|ارومات/, ['estrogen', 'aromatization']],
  [/trt|تستوستيرون/, ['trt', 'testosterone', 'hormonal']],
  [/fertility|خصوبه|انجاب/, ['fertility', 'sperm', 'reproductive']],
  [/heart|قلب|ضغط/, ['cardiovascular', 'blood-pressure', 'lipid']],
  [/bone|عظام|هشاشه/, ['bone', 'density', 'calcium']],
  [/mental|نفسي|اكتئاب|مزاج/, ['mental', 'mood', 'depression']],
  [/diet|تغذيه|وجبات/, ['nutrition', 'meal', 'food']],
  [/training|تدريب|تمرين/, ['training', 'recovery', 'volume']],
];

export function expandQuery(query: string): string {
  const base = normalizeText(query);
  const extra: string[] = [];
  for (const [re, terms] of SYNONYMS) {
    if (re.test(query) || re.test(base)) extra.push(...terms);
  }
  return [base, ...extra].join(' ').trim();
}
