import { z } from 'zod';

export const MobilityScreenSchema = z.object({
  movement: z.enum(['ankle_dorsiflexion', 'shoulder_flexion', 'hip_rotation', 'single_leg_balance']),
  left_value: z.number().finite().min(0).max(200),
  right_value: z.number().finite().min(0).max(200),
  unit: z.enum(['degrees', 'seconds']),
});
export type MobilityScreenInput = z.infer<typeof MobilityScreenSchema>;
export interface MobilityScreenResult {
  absolute_difference: number;
  side_with_higher_value: 'left' | 'right' | 'equal';
  rule_flag: 'within_screen_threshold' | 'review_difference';
  threshold: number;
  disclaimer: string;
}

export function calculateMobilityScreen(input: MobilityScreenInput): MobilityScreenResult {
  const { left_value, right_value, unit, movement } = input;
  if (![left_value, right_value].every(Number.isFinite)) throw new Error('Measurements must be finite');
  if (left_value < 0 || right_value < 0 || left_value > 200 || right_value > 200) throw new Error('Measurement is outside the supported range');
  if ((movement === 'single_leg_balance') !== (unit === 'seconds')) throw new Error('Movement and measurement unit do not match');
  const difference = Math.abs(left_value - right_value);
  const threshold = unit === 'degrees' ? 10 : 5;
  return {
    absolute_difference: Number(difference.toFixed(1)),
    side_with_higher_value: left_value === right_value ? 'equal' : left_value > right_value ? 'left' : 'right',
    rule_flag: difference >= threshold ? 'review_difference' : 'within_screen_threshold',
    threshold,
    disclaimer: 'Self-entered screening comparison only; thresholds are simple app rules, not a diagnosis, injury risk estimate or clinical range-of-motion assessment.',
  };
}

