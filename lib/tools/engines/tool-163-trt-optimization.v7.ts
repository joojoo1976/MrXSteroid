import {z} from 'zod';
export const TrtInputSchema=z.object({current_value:z.number().finite().nonnegative().max(100000),target_value:z.number().finite().nonnegative().max(100000),unit:z.string().trim().min(1).max(30)}).strict();
export function compareTrtValues(raw:unknown){const i=TrtInputSchema.parse(raw);return {status:'CALCULATED' as const,resultType:'COMPARISON' as const,difference:Number((i.target_value-i.current_value).toFixed(4)),unit:i.unit,disclaimer:'Arithmetic comparison only; no TRT dose optimization or medical recommendation.'};}
