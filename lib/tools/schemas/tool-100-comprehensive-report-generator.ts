import { z } from 'zod';
export const ComprehensiveReportGeneratorInputSchema = z.object({ cardiovascular_risk_score:z.number().finite().min(0).max(100), hepatic_stress_score:z.number().finite().min(0).max(100), endocrine_suppression_score:z.number().finite().min(0).max(100), metabolic_vitality_score:z.number().finite().min(0).max(100), active_red_flag_symptoms_count:z.number().finite().int().min(0).max(100) }).strict();
export type ComprehensiveReportGeneratorInput = z.infer<typeof ComprehensiveReportGeneratorInputSchema>;
