import { describe, expect, it } from 'vitest';
import { calculateRestaurantLabelTotals } from './tool-236-restaurant-macro.v7';
import { calculateIntraWorkoutLabelTotals } from './tool-237-intra-workout.v7';
import { recordFiberObservation } from './tool-238-fiber-type.v7';
import { recordPeptideLabelReference } from './tool-239-peptide-reconstitution.v7';
import { calculateMeasuredDensity } from './tool-240-density.v7';

describe('Tool 236 — user-entered restaurant label arithmetic', () => {
  const item = {
    itemName: 'Menu item',
    servings: 2,
    caloriesPerServing: 500,
    proteinGramsPerServing: 25,
    carbohydrateGramsPerServing: 40,
    fatGramsPerServing: 15,
    sourceReference: 'Restaurant nutrition page, checked by user',
  };

  it('multiplies declared serving values and calculates totals without estimation', () => {
    const result = calculateRestaurantLabelTotals({ items: [item] });
    expect(result.resultType).toBe('CALCULATED');
    expect(result.inputClassification).toBe('USER_PROVIDED');
    expect(result.totals).toEqual({ calories: 1000, proteinGrams: 50, carbohydrateGrams: 80, fatGrams: 30 });
    expect(result.items[0].labelCaloriesMinusMacroEnergyPerServing).toBe(105);
  });

  it('aggregates multiple menu items and keeps each source reference', () => {
    const result = calculateRestaurantLabelTotals({
      items: [item, { ...item, itemName: 'Side', servings: 1, sourceReference: 'Package label' }],
    });
    expect(result.items).toHaveLength(2);
    expect(result.totals.calories).toBe(1500);
    expect(result.items.map((row) => row.sourceReference)).toEqual(['Restaurant nutrition page, checked by user', 'Package label']);
  });

  it('rejects empty lists, missing sources, negative values, and too many items', () => {
    expect(() => calculateRestaurantLabelTotals({ items: [] })).toThrow();
    expect(() => calculateRestaurantLabelTotals({ items: [{ ...item, sourceReference: '' }] })).toThrow();
    expect(() => calculateRestaurantLabelTotals({ items: [{ ...item, fatGramsPerServing: -1 }] })).toThrow();
    expect(() => calculateRestaurantLabelTotals({ items: Array.from({ length: 13 }, (_, i) => ({ ...item, itemName: `item ${i}` })) })).toThrow();
  });
});

describe('Tool 237 — intra-workout product-label arithmetic', () => {
  const input = {
    productName: 'User-entered drink',
    sourceReference: 'Packaging label',
    servingVolumeMl: 500,
    servingsConsumed: 1.5,
    caloriesPerServing: 120,
    proteinGramsPerServing: 0,
    carbohydrateGramsPerServing: 30,
    fatGramsPerServing: 0,
  };

  it('scales only user-entered label values and volume', () => {
    const result = calculateIntraWorkoutLabelTotals(input);
    expect(result.resultType).toBe('CALCULATED');
    expect(result.inputClassification).toBe('USER_PROVIDED');
    expect(result.calculatedTotals).toEqual({ volumeMl: 750, calories: 180, proteinGrams: 0, carbohydrateGrams: 45, fatGrams: 0 });
    expect(result.limitations.join(' ')).toContain('does not determine an optimal drink');
  });

  it('rejects missing sources, zero servings, and non-finite values', () => {
    expect(() => calculateIntraWorkoutLabelTotals({ ...input, sourceReference: '' })).toThrow();
    expect(() => calculateIntraWorkoutLabelTotals({ ...input, servingsConsumed: 0 })).toThrow();
    expect(() => calculateIntraWorkoutLabelTotals({ ...input, caloriesPerServing: Number.POSITIVE_INFINITY })).toThrow();
  });
});

describe('Tool 238 — fiber observation record without inference', () => {
  const input = { exercise: 'Squat', testMethod: 'User-described test', observedResult: '8 repetitions', sourceReference: 'Training log' };

  it('records the observation and explicitly returns NOT_AVAILABLE for a fiber score', () => {
    const result = recordFiberObservation(input);
    expect(result.resultType).toBe('USER_PROVIDED');
    expect(result.entry).toMatchObject(input);
    expect(result.score).toMatchObject({ status: 'NOT_AVAILABLE', reasonCode: 'NO_VALIDATED_FIBER_TYPE_MODEL' });
    expect(result.limitations.join(' ')).toContain('No fiber-type percentage');
  });

  it('rejects a missing exercise, method, or observation', () => {
    expect(() => recordFiberObservation({ ...input, exercise: '' })).toThrow();
    expect(() => recordFiberObservation({ ...input, testMethod: '' })).toThrow();
    expect(() => recordFiberObservation({ ...input, observedResult: '' })).toThrow();
  });
});

describe('Tool 239 — peptide product-label reference only', () => {
  const input = {
    productName: 'Product name as printed',
    manufacturer: 'Manufacturer as printed',
    sourceReference: 'Current package leaflet reference',
    note: 'Review with pharmacist',
  };

  it('records source metadata and never returns a preparation calculation', () => {
    const result = recordPeptideLabelReference(input);
    expect(result.resultType).toBe('USER_PROVIDED');
    expect(result.calculation).toMatchObject({ status: 'NOT_AVAILABLE', reasonCode: 'NO_VERIFIED_PRODUCT_INSTRUCTIONS' });
    expect(result.limitations.join(' ')).toContain('No solvent, volume, concentration, dose');
  });

  it('requires a source reference and rejects calculator-like extra fields', () => {
    expect(() => recordPeptideLabelReference({ ...input, sourceReference: '' })).toThrow();
    expect(() => recordPeptideLabelReference({ ...input, solventMl: 2 })).toThrow();
  });
});

describe('Tool 240 — sample-specific measured density arithmetic', () => {
  const input = {
    massGrams: 2.5,
    measuredVolumeMl: 1.25,
    measurementMethod: 'recorded_measurement' as const,
    sourceReference: 'User measurement record',
  };

  it('calculates mass divided by measured volume and preserves measurement provenance', () => {
    const result = calculateMeasuredDensity(input);
    expect(result.resultType).toBe('CALCULATED');
    expect(result.density).toEqual({ value: 2, unit: 'g/mL' });
    expect(result.measurement.sourceReference).toBe(input.sourceReference);
    expect(result.limitations.join(' ')).toContain('No substance reference values');
  });

  it('rejects zero, negative, non-finite, and unreferenced measurements', () => {
    expect(() => calculateMeasuredDensity({ ...input, massGrams: 0 })).toThrow();
    expect(() => calculateMeasuredDensity({ ...input, measuredVolumeMl: 0 })).toThrow();
    expect(() => calculateMeasuredDensity({ ...input, massGrams: Number.NaN })).toThrow();
    expect(() => calculateMeasuredDensity({ ...input, sourceReference: '' })).toThrow();
  });
});
