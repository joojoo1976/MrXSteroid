import { z } from 'zod';
export const SideEffectLogSchema=z.object({ symptom:z.string().trim().min(1).max(120), observedAt:z.string().date(), severity:z.enum(['user_noted','needs_review']), note:z.string().trim().max(300).optional() }).strict();
export const SideEffectLogInputSchema=z.object({ entries:z.array(SideEffectLogSchema).max(100) }).strict();
export type SideEffectLogInput=z.infer<typeof SideEffectLogInputSchema>;
export type SideEffectLogResult={status:'RECORDED'|'PARTIAL';resultType:'USER_PROVIDED';entries:SideEffectLogInput['entries'];disclaimer:string};
export function recordSideEffects(raw:unknown):SideEffectLogResult{const input=SideEffectLogInputSchema.parse(raw);return {status:input.entries.length?'RECORDED':'PARTIAL',resultType:'USER_PROVIDED',entries:input.entries,disclaimer:'User-provided symptom log only; no diagnosis, severity inference, or treatment advice.'};}
