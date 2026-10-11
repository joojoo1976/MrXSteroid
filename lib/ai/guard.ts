/**
 * lib/ai/guard.ts — AI safety gate (SPEC §15.2, §19, §40).
 * ═══════════════════════════════════════════════════════════════════════════
 *  Enforces the platform's non-negotiables:
 *   - never provide personalised drug/hormone dosing;
 *   - escalate emergencies to urgent care;
 *   - keep everything educational.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import type { AiIntent, AiSafetyDecision } from './types';

export const EMERGENCY_MESSAGE_EN =
  'This may be a medical emergency. Please contact your local emergency number or go to the nearest emergency department now. This assistant cannot provide emergency care.';

export const EMERGENCY_MESSAGE_AR =
  'قد تكون هذه حالة طارئة. اتصل برقم الطوارئ المحلي أو توجّه إلى أقرب قسم طوارئ فورًا. هذا المساعد لا يقدّم رعاية طارئة.';

export const DOSING_REFUSAL_EN =
  'I can explain how a tool models exposure or risk, but I cannot give personalised medication or hormone doses. Please discuss dosing with a qualified clinician.';

export const DOSING_REFUSAL_AR =
  'يمكنني شرح كيفية نمذجة أداة ما للتعرض أو الخطر، لكن لا يمكنني تقديم جرعات دوائية أو هرمونية شخصية. ناقش الجرعات مع طبيب مؤهل.';

/** Evaluate a safety decision for a classified intent. */
export function evaluateSafety(intent: AiIntent, locale: 'ar' | 'en'): AiSafetyDecision {
  const ar = locale === 'ar';
  if (intent === 'emergency') {
    return {
      blocked: true,
      reason: 'emergency',
      escalate: true,
      emergencyMessage: ar ? EMERGENCY_MESSAGE_AR : EMERGENCY_MESSAGE_EN,
    };
  }
  if (intent === 'dosing-request') {
    return {
      blocked: true,
      reason: 'personalised-dosing',
      escalate: false,
      emergencyMessage: null,
    };
  }
  return { blocked: false, reason: null, escalate: false, emergencyMessage: null };
}

/** The refusal/guidance text for a blocked decision. */
export function guardResponseText(decision: AiSafetyDecision, locale: 'ar' | 'en'): string | null {
  if (!decision.blocked) return null;
  const ar = locale === 'ar';
  if (decision.reason === 'emergency') return decision.emergencyMessage;
  if (decision.reason === 'personalised-dosing') return ar ? DOSING_REFUSAL_AR : DOSING_REFUSAL_EN;
  return null;
}
