import { z } from 'zod';
import { evaluateEmergencyChecklist, EMERGENCY_WARNING_RULES, type EmergencyChecklistResult } from './tool-146-emergency-warning-signs-checklist.v6';
export const SafetyGateV7Schema = z.object({ ageGroup: z.enum(['adult','child']).nullable(), answers: z.array(z.object({ flagId: z.string().min(1), answer: z.enum(['yes','no','unsure']).nullable() }).strict()) }).strict();
export function evaluateSafetyGateV7(raw: unknown): EmergencyChecklistResult { const parsed = SafetyGateV7Schema.parse(raw); return evaluateEmergencyChecklist(parsed, { rulePack: EMERGENCY_WARNING_RULES }); }
export function matchSafetySignals(raw: unknown) { const parsed = z.object({ signals: z.array(z.object({ label:z.string().trim().min(1).max(120), selected:z.boolean() }).strict()).max(50) }).strict().parse(raw); return { status: parsed.signals.some(s=>s.selected) ? 'MATCH' as const : 'NO_MATCH' as const, resultType:'EXPLICIT_SELECTION' as const, matched:parsed.signals.filter(s=>s.selected).map(s=>s.label), disclaimer:'Explicit checklist only; no diagnosis or safety guarantee.' }; }

export type SafetyGateV7Input = z.infer<typeof SafetyGateV7Schema>;

