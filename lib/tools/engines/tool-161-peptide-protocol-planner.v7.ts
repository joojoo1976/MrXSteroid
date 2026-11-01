import {z} from 'zod';
export const PeptidePlanInputSchema=z.object({name:z.string().trim().min(1).max(100),note:z.string().trim().max(300).optional()}).strict();
export function recordPeptidePlan(raw:unknown){const i=PeptidePlanInputSchema.parse(raw);return {status:'RECORDED' as const,resultType:'USER_PROVIDED' as const,entry:i,disclaimer:'User note only; no peptide protocol, dose, timing, or treatment advice.'};}
