import { z } from 'zod';
export const InjectionSiteRotationSchema=z.object({site:z.string().trim().min(1).max(80),usedOn:z.string().date(),note:z.string().trim().max(240).optional()}).strict();
export const InjectionSiteRotationInputSchema=z.object({entries:z.array(InjectionSiteRotationSchema).max(100)}).strict();
export type InjectionSiteRotationInput=z.infer<typeof InjectionSiteRotationInputSchema>;
export function recordSiteRotation(raw:unknown){const input=InjectionSiteRotationInputSchema.parse(raw);return {status:input.entries.length?'RECORDED':'PARTIAL' as const,resultType:'USER_PROVIDED' as const,entries:input.entries,disclaimer:'User-entered rotation log only; no injection instruction, site safety clearance, or medical advice.'};}
