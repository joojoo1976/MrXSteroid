import {z} from 'zod';
export const VolumeInputSchema=z.object({amount_ml:z.number().finite().nonnegative().max(1000),container_ml:z.number().finite().positive().max(1000)}).strict();
export function calculateVolumeRatio(raw:unknown){const i=VolumeInputSchema.parse(raw);return {status:'CALCULATED' as const,resultType:'MEASUREMENT' as const,ratio:Number((i.amount_ml/i.container_ml).toFixed(4)),assumptions:['Generic volume arithmetic only'],disclaimer:'Does not determine a safe injection volume or provide injection instructions.'};}
