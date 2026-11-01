import { MenstrualCycleManagerInputSchema } from '../schemas/tool-093-menstrual-cycle-manager';
export type MenstrualCycleManagerInput={cycle_length_days:number;current_cycle_day:number;oral_contraceptive_active:boolean;high_intensity_training_focus:boolean};
export type MenstrualCycleManagerResult=MenstrualCycleManagerInput&{status:'RECORDED';resultType:'USER_PROVIDED'};
/** Records cycle-calendar inputs; it does not infer ovulation, fertility, hormones, or training capacity. */
export function manageMenstrualCycle(input:MenstrualCycleManagerInput):MenstrualCycleManagerResult{return {status:'RECORDED',resultType:'USER_PROVIDED',...MenstrualCycleManagerInputSchema.parse(input)}}
