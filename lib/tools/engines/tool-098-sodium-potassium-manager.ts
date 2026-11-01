import { SodiumPotassiumManagerInputSchema } from '../schemas/tool-098-sodium-potassium-manager';

export type SodiumPotassiumManagerInput = {
  daily_sodium_mg: number;
  daily_potassium_mg: number;
};

export type SodiumPotassiumManagerResult = {
  status: 'CALCULATED';
  resultType: 'CALCULATED';
  sodium_to_potassium_ratio: number;
};

/** Calculates only the ratio of two user-entered dietary amounts. */
export function manageSodiumPotassium(input: SodiumPotassiumManagerInput): SodiumPotassiumManagerResult {
  const values = SodiumPotassiumManagerInputSchema.parse(input);
  return {
    status: 'CALCULATED',
    resultType: 'CALCULATED',
    sodium_to_potassium_ratio: Math.round((values.daily_sodium_mg / values.daily_potassium_mg) * 100) / 100,
  };
}
