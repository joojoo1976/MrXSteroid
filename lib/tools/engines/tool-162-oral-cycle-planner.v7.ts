import {z} from 'zod';
export const OralCycleInputSchema=z.object({name:z.string().trim().min(1).max(100),note:z.string().trim().max(300).optional()}).strict();
export function recordOralCycleNote(raw:unknown){const i=OralCycleInputSchema.parse(raw);return {status:'RECORDED' as const,resultType:'USER_PROVIDED' as const,entry:i,disclaimer:'User note only; no cycle design, liver advice, dose, or treatment recommendation.'};}
