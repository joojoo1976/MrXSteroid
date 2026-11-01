import { FemaleHealthOptimizerInputSchema } from '../schemas/tool-091-female-health-optimizer';
export type FemaleHealthOptimizerInput={energy_availability_adequacy:'adequate'|'marginal'|'severely_deficient';ferritin_status:'optimal'|'borderline_low'|'clinical_deficiency_suspected';bone_stress_or_joint_pains:boolean;thyroid_cold_intolerance:boolean;resistance_training_sessions_per_week:number};
export type FemaleHealthOptimizerResult=FemaleHealthOptimizerInput&{status:'RECORDED';resultType:'USER_PROVIDED'};
/** Records self-reported observations without inferring RED-S, iron deficiency, thyroid disease, or clinical priority. */
export function optimizeFemaleHealth(input:FemaleHealthOptimizerInput):FemaleHealthOptimizerResult{return {status:'RECORDED',resultType:'USER_PROVIDED',...FemaleHealthOptimizerInputSchema.parse(input)}}
