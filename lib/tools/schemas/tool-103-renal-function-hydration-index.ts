import { z } from 'zod';
export const RenalFunctionInputSchema = z.object({ serum_creatinine_mg_dl:z.number().finite().min(0.1).max(20), age_years:z.number().finite().int().min(18).max(120), sex:z.enum(['male','female']), body_weight_kg:z.number().finite().min(30).max(250), fluid_intake_liters:z.number().finite().min(0).max(15), climate:z.enum(['temperate','hot_humid']), training_sweat_liters:z.number().finite().min(0).max(10) }).strict();
export type RenalFunctionInput = z.infer<typeof RenalFunctionInputSchema>;
