import { z } from 'zod';
export const ThyroidInputSchema = z.object({ tsh_miu_l:z.number().finite().min(0.01).max(100), free_t4_ng_dl:z.number().finite().min(0.1).max(10), free_t3_pg_ml:z.number().finite().min(0.5).max(20), age_years:z.number().finite().int().min(18).max(120), sex:z.enum(['male','female']), weight_kg:z.number().finite().min(30).max(250), height_cm:z.number().finite().min(120).max(230) }).strict();
export type ThyroidInput = z.infer<typeof ThyroidInputSchema>;
