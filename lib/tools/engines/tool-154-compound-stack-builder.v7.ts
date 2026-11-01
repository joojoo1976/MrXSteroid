import { z } from 'zod';
export const StackEntrySchema=z.object({compound:z.string().trim().min(1).max(100),enteredByUser:z.boolean(),note:z.string().trim().max(300).optional()}).strict();
export const StackInputSchema=z.object({entries:z.array(StackEntrySchema).max(50)}).strict();
export function recordCompoundStack(raw:unknown){const input=StackInputSchema.parse(raw);return {status:input.entries.length?'RECORDED':'PARTIAL' as const,resultType:'USER_PROVIDED' as const,entries:input.entries,disclaimer:'User-provided compound record only; no stack design, dose, cycle, interaction conclusion, or safety clearance.'};}
