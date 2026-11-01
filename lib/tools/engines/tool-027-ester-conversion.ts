import {
  MolarMassConversionInputSchema,
  MolarMassConversionResultSchema,
  type MolarMassConversionInput,
  type MolarMassConversionResult,
} from '../schemas/tool-027-ester-conversion';

const GRAMS_PER_UNIT = { mg: 0.001, g: 1, kg: 1000 } as const;

/**
 * Educational mass conversion preserving only the entered amount of substance:
 * n = m / M, then m_target = n × M_target. No substance data is assumed.
 */
export function calculateMolarMassRelationshipV7(
  input: MolarMassConversionInput,
): MolarMassConversionResult {
  const validated = MolarMassConversionInputSchema.parse(input);
  const sourceAmountInGrams = validated.sourceMass * GRAMS_PER_UNIT[validated.sourceMassUnit];
  const amountInMoles = sourceAmountInGrams / validated.sourceMolarMass;
  const targetAmountInGrams = amountInMoles * validated.targetMolarMass;
  const targetAmount = targetAmountInGrams / GRAMS_PER_UNIT[validated.targetMassUnit];

  return MolarMassConversionResultSchema.parse({
    resultOrigin: 'CALCULATED',
    method: 'SAME_AMOUNT_OF_SUBSTANCE',
    sourceAmountInGrams,
    amountInMoles,
    targetAmountInGrams,
    targetAmount,
    targetMassUnit: validated.targetMassUnit,
    sourceSubstanceLabel: validated.sourceSubstanceLabel,
    targetSubstanceLabel: validated.targetSubstanceLabel,
    sourceMolarMass: validated.sourceMolarMass,
    sourceMolarMassSource: validated.sourceMolarMassSource,
    targetMolarMass: validated.targetMolarMass,
    targetMolarMassSource: validated.targetMolarMassSource,
  });
}
