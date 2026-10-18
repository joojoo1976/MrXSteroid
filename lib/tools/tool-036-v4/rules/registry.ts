/**
 * Tool-036 V4 — rule registry (R2/R3/R7).
 *
 * Every health claim or comparison rule that can reach the UI must resolve
 * to a ruleId here. The registry is the auditable record of:
 *   - what the tool claims,
 *   - where the claim comes from,
 *   - how confident that source is,
 *   - where the claim does and does not apply,
 *   - whether the tool is even allowed to show it.
 *
 * Statuses:
 *   - 'active'            : shown with source + confidence + applicability.
 *   - 'display-unverified': shown only with an explicit "not clinically
 *                           verified" banner.
 *   - 'disabled'          : never used for any inference (kept for audit).
 *
 * R2 (user decision): the legacy 7/14-day "healing window" is DISABLED. The
 * tool may state when a site was last recorded — it must never infer
 * readiness or safety from elapsed days. Absence of a record is shown as
 * "no recorded usage data", never as "ready".
 * R3 (user decision): the 7-day same-site spacing is a *personal
 * scheduling preference*, editable, and is never phrased as a clinical
 * safety rule.
 */
import { medicalRuleSchema, type MedicalRule } from '../contracts';

const MEDICAL: readonly MedicalRule[] = [
  {
    ruleId: 'ester-half-life-table',
    kind: 'medical',
    claimEn: 'Elimination half-lives for the listed esters, per compound evidence entries.',
    claimAr: 'أنصاف أعمار الإسترات المدرجة، وفق إدخالات الدليل لكل مركّب.',
    source: {
      type: 'secondary',
      ref: 'engine:ESTER_PROFILES evidence entries A01–A07 (FDA label for cypionate/undecanoate; secondary sources for the rest)',
      confidence: 'Moderate',
    },
    applicabilityEn:
      'General reference for the compounds the tool schedules. Not adjusted for age, weight, liver/kidney function, or concomitant medication.',
    applicabilityAr:
      'مرجع عام للمركّبات التي يخطط لها الأداة. لا يراعي العمر أو الوزن أو وظائف الكبد/الكلية أو الأدوية المصاحبة.',
    status: 'active',
  },
  {
    ruleId: 'volume-zone-bands',
    kind: 'medical',
    claimEn:
      'Intramuscular volume bands: ≤2 mL routine, >2–5 mL limited-evidence range, >5 mL beyond the commonly cited adult IM maximum.',
    claimAr:
      'نطاقات الحجم للحقن العضلي: ≤2 مل روتيني، >2–5 مل نطاق محدود الدليل، >5 مل يتجاوز الحد الأقصى الشائع للبالغين.',
    source: {
      type: 'secondary',
      ref: 'engine:classifyVolumeZone evidence B01/B04',
      confidence: 'Low',
    },
    applicabilityEn:
      'Documented practice ranges for adults — NOT a personal limit for any individual, and not a determination that a given volume is safe for a given user.',
    applicabilityAr:
      'نطاقات ممارسة مُدوّنة للبالغين — وليست حدًا شخصيًا لأي فرد، ولا حكمًا بأن حجمًا معينًا آمن لمستخدم بعينه.',
    status: 'active',
  },
  {
    ruleId: 'site-ceiling-table',
    kind: 'medical',
    claimEn: 'Per-site documented volume ceilings for the eight injection sites.',
    claimAr: 'سقوف حجم مُدوّنة لكل موقع من مواقع الحقن الثمانية.',
    source: {
      type: 'secondary',
      ref: 'engine:siteCeilingMl evidence B02–B07',
      confidence: 'Low',
    },
    applicabilityEn:
      'General documented ceilings for healthy adults. Site suitability depends on individual anatomy and history; consult a clinician for personal limits.',
    applicabilityAr:
      'سقوف عامة مُدوّنة لبالغين أصحاء. ملاءمة الموقع تعتمد على تشريح وتاريخ الفرد الشخصي؛ راجع مختصًا لحدودك الشخصية.',
    status: 'active',
  },
  {
    ruleId: 'healing-window-7-14',
    kind: 'medical',
    claimEn: 'A 7-day minimum / 14-day optimal healing window for injection sites.',
    claimAr: 'نافذة تعافٍ 7 أيام حد أدنى / 14 يومًا مثلى لمواقع الحقن.',
    source: {
      type: 'unverified',
      ref: 'engine legacy: healingStatus defaults — borrowed from a varicella-healing context; no verified intramuscular-site source in this repository',
      confidence: 'None',
    },
    applicabilityEn:
      'DISABLED (decision R2). No verified source for this claim exists here; it must never be used to infer readiness or safety.',
    applicabilityAr:
      'معطّل (قرار R2). لا يوجد مصدر موثوق لهذا الادعاء هنا، ولا يجوز استخدامه أبدًا لاستنتاج الجاهزية أو الأمان.',
    status: 'disabled',
  },
  {
    ruleId: 'pain-scale-informational',
    kind: 'medical',
    claimEn: 'The 0–10 pain input is a self-report for the user’s own log.',
    claimAr: 'مدخل الألم 0–10 تقرير ذاتي لسجل المستخدم الخاص.',
    source: {
      type: 'unverified',
      ref: 'product decision §4: informational only',
      confidence: 'None',
    },
    applicabilityEn:
      'Informational. The tool draws no diagnostic conclusion from a pain score; it does not interpret severity.',
    applicabilityAr:
      'معلوماتي. الأداة لا تستنتج أي تشخيص من درجة الألم ولا تفسّر شدته.',
    status: 'active',
  },
  {
    ruleId: 'clinical-evaluation-advisory',
    kind: 'medical',
    claimEn: 'The tool offers no diagnostic criteria and directs users to seek clinical evaluation for health concerns.',
    claimAr: 'الأداة لا تقدم معايير تشخيصية وتوجّه المستخدم لطلب تقييم طبي عند وجود مخاوف صحية.',
    source: {
      type: 'unverified',
      ref: 'product policy §4/§7 (R7)',
      confidence: 'None',
    },
    applicabilityEn:
      'Universal scope statement. This is a product policy, not a clinical guideline; the tool defines no symptoms, thresholds, or red-flag criteria of its own.',
    applicabilityAr:
      'بيان نطاق عام. هذه سياسة منتج وليست إرشادًا سريريًا؛ الأداة لا تعرّف أعراضًا ولا عتبات ولا معايير إنذار خاصة بها.',
    status: 'active',
  },
];

const PRODUCT: readonly MedicalRule[] = [
  {
    ruleId: 'rotation-rest-preference',
    kind: 'product',
    claimEn:
      'User preference for spacing injections to the same site (default 7 days, editable).',
    claimAr: 'تفضيل شخصي للتباعد بين الحقن في نفس الموقع (الافتراضي 7 أيام، قابل للتعديل).',
    source: {
      type: 'unverified',
      ref: 'product decision R3: user-configurable scheduling preference',
      confidence: 'None',
    },
    applicabilityEn:
      'Scheduling convenience only. Adherence does not establish that a site is medically suitable; deviation is reported as a preference breach, never as a safety warning.',
    applicabilityAr:
      'للتنظيم والتخطيط فقط. الالتزام لا يثبت أن الموقع ملائم طبيًا، والانحراف يُعرض كتجاوز لتفضيل لا كتحذير سلامة.',
    status: 'active',
  },
  {
    ruleId: 'drift-matching-tolerance',
    kind: 'product',
    claimEn:
      'Plan-vs-Actual matching uses the user’s declared tolerance (default 6 h) for "on time"; an actual up to 24 h after schedule is "late"; otherwise "missed".',
    claimAr:
      'مطابقة الخطة بالواقع تستخدم حد التسامح المعلن من المستخدم (الافتراضي 6 ساعات) لتصنيف «في الوقت»؛ الفعلي حتى 24 ساعة بعد الموعد «متأخر»، وما بعدها «فائت».',
    source: {
      type: 'unverified',
      ref: 'product decision D4/§5: comparison rules are declared and user-editable',
      confidence: 'None',
    },
    applicabilityEn:
      'Describes the comparison method only. Classifications are bookkeeping about adherence, not clinical judgements.',
    applicabilityAr:
      'يصف طريقة المقارنة فقط. التصنيفات قيود التزام وليست أحكامًا سريرية.',
    status: 'active',
  },
];

/** Every rule, indexed by id. Both arrays are validated in registry.test.ts. */
export const RULES: readonly MedicalRule[] = [...MEDICAL, ...PRODUCT];

export const MEDICAL_RULES = MEDICAL;
export const PRODUCT_RULES = PRODUCT;

export const RULE_BY_ID: Record<string, MedicalRule> = Object.fromEntries(
  RULES.map((r) => [r.ruleId, r]),
);

/**
 * Maps every health-related constant exposed by the V3 engine to the
 * registry rule that governs its use. `registry.test.ts` fails if a mapping
 * is removed or points at a missing rule — this is the completeness net that
 * keeps engine constants from leaking into the UI unsupervised (R7).
 */
export const ENGINE_CLAIMS: Record<string, string> = {
  'ESTER_PROFILES.halfLifeDays': 'ester-half-life-table',
  'classifyVolumeZone.bands': 'volume-zone-bands',
  'siteCeilingMl.per-site': 'site-ceiling-table',
  'classifyPain.bands': 'pain-scale-informational',
  'healingStatus.min7optimal14': 'healing-window-7-14',
  'validateRotation.minDays7': 'rotation-rest-preference',
};
