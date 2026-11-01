import {z} from 'zod';
export const LabObservationSchema=z.object({marker:z.string().trim().min(1).max(100),value:z.number().finite().max(1000000),unit:z.string().trim().min(1).max(30)}).strict();
export function recordLabObservation(raw:unknown){const i=LabObservationSchema.parse(raw);return {status:'RECORDED' as const,resultType:'USER_PROVIDED' as const,entry:i,disclaimer:'User-provided lab record only; no interpretation, reference-range judgment, or diagnosis.'};}
