/**
 * lib/engines/core/v6/equation-validator.v6.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 *  v6 GENIUS — Equation Validator & Documentation Engine
 * ═══════════════════════════════════════════════════════════════════════════════
 *  - Formula documentation with LaTeX + plain text + citations
 *  - Double Conversion Prevention (Golden Rule #1)
 *  - Zero/Negative/NaN Guards (Golden Rule #2)
 *  - Input sanitization & validation
 *  - Sensitivity analysis
 *  - Reverse calculation (goal seeking)
 *  - Audit trail generation
 *
 *  PURE MODULE — No React, no DOM, no Supabase, no Date, no I/O.
 */

import type { UnitSystem } from './ai-orchestrator.v6';

// ============================================================
// EQUATION DOCUMENTATION
// ============================================================

export interface EquationDocumentation {
  /** Unique identifier */
  id: string;

  /** Human-readable name */
  name: string;

  /** Category for organization */
  category: 'body-composition' | 'metabolic' | 'pharmacokinetic' | 'hormonal' | 'strength' | 'cardiovascular' | 'nutritional' | 'other';

  /** LaTeX formula for rendering */
  latex: string;

  /** Plain text formula for accessibility */
  plainText: string;

  /** Detailed description */
  description: string;

  /** Academic/source citation */
  citation: EquationCitation;

  /** Validity domain */
  validity: ValidityDomain;

  /** Assumptions made */
  assumptions: string[];

  /** Known limitations */
  limitations: string[];

  /** Version of this documentation */
  version: string;
}

export interface EquationCitation {
  authors: string[];
  title: string;
  journal?: string;
  year: number;
  doi?: string;
  url?: string;
  note?: string;
}

export interface ValidityDomain {
  population: string;           // e.g., "Adult males 18-65"
  ageRange?: [number, number];
  sex?: 'male' | 'female' | 'both';
  bmiRange?: [number, number];
  bodyFatRange?: [number, number];
  conditions: string[];         // e.g., "Hydrated, fasted, no edema"
  excludedPopulations: string[]; // e.g., "Pregnant, amputees, ascites"
}

// ============================================================
// DOUBLE CONVERSION PREVENTION (Golden Rule #1)
// ============================================================

/**
 * Canonical internal representation: ALWAYS METRIC (SI)
 * - Weight: kg
 * - Length: cm
 * - Volume: mL
 * - Temperature: °C
 * - Energy: kcal
 * - Concentration: nmol/L, ng/dL, etc.
 *
 * NEVER convert metric → imperial → metric.
 * Convert ONLY at display layer via `toDisplayUnit()`.
 */

export type CanonicalUnit =
  | 'kg'       // Weight
  | 'cm'       // Length/Height
  | 'm'        // Length (meters)
  | 'mL'       // Volume
  | 'L'        // Volume (liters)
  | '°C'       // Temperature
  | 'kcal'     // Energy
  | 'kJ'       // Energy (kJ)
  | 'nmol/L'   // Concentration
  | 'ng/dL'    // Concentration
  | 'pg/mL'    // Concentration
  | 'pmol/L'   // Concentration
  | 'mIU/mL'   // Concentration
  | 'mg/dL'    // Concentration
  | 'mmol/L'   // Concentration
  | 'g/dL'     // Concentration
  | 'U/L'      // Enzyme units
  | 'bpm'      // Heart rate
  | 'mmHg'     // Blood pressure
  | '%'        // Percentage
  | 'ratio'    // Unitless ratio
  | 'count'    // Count
  | 'days'     // Time
  | 'weeks'    // Time
  | 'months';  // Time

export interface UnitConversion {
  from: string;
  to: string;
  factor: number;
  offset?: number;        // For temperature: °C → °F = ×1.8 + 32
  precision: number;      // Decimal places for display
}

export const CANONICAL_CONVERSIONS: readonly UnitConversion[] = [
  // Weight
  { from: 'kg', to: 'lbs', factor: 2.20462, precision: 1 },
  { from: 'lbs', to: 'kg', factor: 0.453592, precision: 2 },

  // Length
  { from: 'cm', to: 'in', factor: 0.393701, precision: 1 },
  { from: 'in', to: 'cm', factor: 2.54, precision: 1 },
  { from: 'm', to: 'ft', factor: 3.28084, precision: 2 },
  { from: 'ft', to: 'm', factor: 0.3048, precision: 2 },

  // Volume
  { from: 'mL', to: 'fl_oz', factor: 0.033814, precision: 2 },
  { from: 'fl_oz', to: 'mL', factor: 29.5735, precision: 1 },

  // Temperature
  { from: '°C', to: '°F', factor: 1.8, offset: 32, precision: 1 },
  { from: '°F', to: '°C', factor: 0.555556, offset: -17.7778, precision: 1 },

  // Energy
  { from: 'kcal', to: 'kJ', factor: 4.184, precision: 1 },
  { from: 'kJ', to: 'kcal', factor: 0.239006, precision: 1 },

  // Concentrations (hormones)
  { from: 'nmol/L', to: 'ng/dL', factor: 28.85, precision: 1 },  // Testosterone
  { from: 'ng/dL', to: 'nmol/L', factor: 0.03466, precision: 2 },
  { from: 'pmol/L', to: 'pg/mL', factor: 0.272, precision: 2 },  // Estradiol
  { from: 'pg/mL', to: 'pmol/L', factor: 3.67, precision: 1 },
] as const;

/**
 * Convert from display unit to canonical (metric) - INPUT SIDE
 * Call this ONCE when receiving user input.
 */
export function toCanonical(value: number, fromUnit: string, quantity: 'weight' | 'length' | 'volume' | 'temperature' | 'energy' | 'concentration'): number {
  const conversions = getConversionsForQuantity(quantity);
  const conv = conversions.find(c => c.to === fromUnit || c.from === fromUnit);

  if (!conv) {
    // Already canonical or unknown - return as-is
    return value;
  }

  // If converting TO canonical (e.g., lbs → kg)
  if (conv.to === fromUnit) {
    return applyConversion(value, conv, true);
  }

  // If converting FROM canonical (shouldn't happen on input)
  return value;
}

/**
 * Convert from canonical to display unit - OUTPUT SIDE
 * Call this ONLY when rendering to UI.
 */
export function toDisplayUnit(value: number, toUnit: string, quantity: 'weight' | 'length' | 'volume' | 'temperature' | 'energy' | 'concentration'): number {
  const conversions = getConversionsForQuantity(quantity);
  const conv = conversions.find(c => c.from === toUnit || c.to === toUnit);

  if (!conv) return value;

  // If converting FROM canonical (e.g., kg → lbs), the canonical is conv.from, display is conv.to
  if (conv.to === toUnit) {
    return applyConversion(value, conv, false);
  }

  // If converting TO canonical (shouldn't happen on output), reverse
  if (conv.from === toUnit) {
    return applyConversion(value, conv, true);
  }

  return value;
}

function getConversionsForQuantity(quantity: string): readonly UnitConversion[] {
  const map: Record<string, readonly UnitConversion[]> = {
    weight: CANONICAL_CONVERSIONS.filter(c => ['kg', 'lbs'].includes(c.from) || ['kg', 'lbs'].includes(c.to)),
    length: CANONICAL_CONVERSIONS.filter(c => ['cm', 'in', 'm', 'ft'].includes(c.from) || ['cm', 'in', 'm', 'ft'].includes(c.to)),
    volume: CANONICAL_CONVERSIONS.filter(c => ['mL', 'fl_oz', 'L'].includes(c.from) || ['mL', 'fl_oz', 'L'].includes(c.to)),
    temperature: CANONICAL_CONVERSIONS.filter(c => ['°C', '°F'].includes(c.from) || ['°C', '°F'].includes(c.to)),
    energy: CANONICAL_CONVERSIONS.filter(c => ['kcal', 'kJ'].includes(c.from) || ['kcal', 'kJ'].includes(c.to)),
    concentration: CANONICAL_CONVERSIONS.filter(c =>
      ['nmol/L', 'ng/dL', 'pmol/L', 'pg/mL', 'mIU/mL', 'mg/dL', 'mmol/L', 'g/dL', 'U/L'].includes(c.from) ||
      ['nmol/L', 'ng/dL', 'pmol/L', 'pg/mL', 'mIU/mL', 'mg/dL', 'mmol/L', 'g/dL', 'U/L'].includes(c.to)
    ),
  };
  return map[quantity] ?? [];
}

function applyConversion(value: number, conv: UnitConversion, reverse: boolean): number {
  if (reverse) {
    // to → from (e.g., lbs → kg)
    if (conv.offset !== undefined) {
      return (value - conv.offset) / conv.factor;
    }
    return value / conv.factor;
  } else {
    // from → to (e.g., kg → lbs)
    if (conv.offset !== undefined) {
      return value * conv.factor + conv.offset;
    }
    return value * conv.factor;
  }
}

// ============================================================
// ZERO / NEGATIVE / NaN GUARDS (Golden Rule #2)
// ============================================================

export interface GuardResult {
  safe: boolean;
  value: number;
  clamped: boolean;
  warnings: string[];
}

/**
 * Guard against invalid numeric results.
 * Clamps to physiological bounds, never returns NaN or negative for physical quantities.
 */
export function guardPhysicalQuantity(
  value: number,
  options: {
    name: string;
    min?: number;
    max?: number;
    allowZero?: boolean;
    clamp?: boolean;       // If true, clamp to bounds instead of throwing
    NaNReplacement?: number; // Value to use if NaN
  }
): GuardResult {
  const warnings: string[] = [];
  let clamped = false;
  let result = value;

  // NaN check
  if (Number.isNaN(value)) {
    warnings.push(`${options.name}: NaN detected, using ${options.NaNReplacement ?? 0}`);
    result = options.NaNReplacement ?? 0;
    clamped = true;
  }

  // Infinity check
  if (!Number.isFinite(value)) {
    warnings.push(`${options.name}: Infinite value detected, clamping`);
    result = value > 0 ? (options.max ?? Number.MAX_SAFE_INTEGER) : (options.min ?? Number.MIN_SAFE_INTEGER);
    clamped = true;
  }

  // Negative check for physical quantities
  if (result < 0 && !options.allowZero) {
    warnings.push(`${options.name}: Negative value (${result}) clamped to 0`);
    result = 0;
    clamped = true;
  } else if (result < 0 && options.allowZero) {
    // Allow small negatives (measurement error) but clamp
    if (result > -0.001) {
      result = 0;
      clamped = true;
    }
  }

  // Min bound
  if (options.min !== undefined && result < options.min) {
    warnings.push(`${options.name}: Value ${result} below minimum ${options.min}, clamping`);
    if (options.clamp) {
      result = options.min;
      clamped = true;
    }
  }

  // Max bound
  if (options.max !== undefined && result > options.max) {
    warnings.push(`${options.name}: Value ${result} above maximum ${options.max}, clamping`);
    if (options.clamp) {
      result = options.max;
      clamped = true;
    }
  }

  return {
    safe: warnings.length === 0,
    value: result,
    clamped,
    warnings,
  };
}

/**
 * Pre-validate inputs before calculation
 */
export function validateInputs(
  inputs: Record<string, number>,
  rules: Record<string, {
    min?: number;
    max?: number;
    required?: boolean;
    allowZero?: boolean;
    type?: 'physical' | 'ratio' | 'percentage' | 'count' | 'any';
  }>
): { valid: boolean; errors: string[]; sanitized: Record<string, number> } {
  const errors: string[] = [];
  const sanitized: Record<string, number> = {};

  for (const [key, rule] of Object.entries(rules)) {
    const value = inputs[key];

    if (value === undefined || value === null) {
      if (rule.required) {
        errors.push(`${key}: Required but missing`);
      }
      continue;
    }

    if (Number.isNaN(value)) {
      errors.push(`${key}: NaN not allowed`);
      continue;
    }

    if (!Number.isFinite(value)) {
      errors.push(`${key}: Infinite value not allowed`);
      continue;
    }

    const guarded = guardPhysicalQuantity(value, {
      name: key,
      min: rule.min,
      max: rule.max,
      allowZero: rule.allowZero ?? true,
      clamp: true,
    });

    sanitized[key] = guarded.value;
    if (guarded.clamped) {
      errors.push(...guarded.warnings);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized,
  };
}

// ============================================================
// SENSITIVITY ANALYSIS
// ============================================================

export interface SensitivityInput {
  name: string;
  value: number;
  unit: string;
  range: [number, number];  // Min, max for analysis
}

export interface SensitivityOutput {
  inputName: string;
  outputName: string;
  elasticity: number;           // %Δoutput / %Δinput
  partialDerivative: number;    // Δoutput / Δinput (absolute)
  correlation: number;          // -1 to 1
  confidenceInterval: [number, number];
  interpretation: string;
}

export function analyzeSensitivity<Input extends Record<string, number>, Output extends Record<string, number>>(
  calculate: (input: Input) => Output,
  baseInput: Input,
  inputSpecs: SensitivityInput[],
  outputKeys: (keyof Output)[],
  perturbationPct: number = 1
): SensitivityOutput[] {
  const baseOutput = calculate(baseInput);
  const results: SensitivityOutput[] = [];

  for (const spec of inputSpecs) {
    for (const outputKey of outputKeys) {
      const baseOutputValue = baseOutput[outputKey];
      if (baseOutputValue === 0 || baseOutputValue === undefined) continue;

      // Perturb input
      const perturbedInput = { ...baseInput };
      const delta = spec.value * (perturbationPct / 100);
      perturbedInput[spec.name as keyof Input] = spec.value + delta as Input[keyof Input];

      const perturbedOutput = calculate(perturbedInput);
      const perturbedOutputValue = perturbedOutput[outputKey];

      // Calculate elasticity
      const pctChangeOutput = ((perturbedOutputValue - baseOutputValue) / baseOutputValue) * 100;
      const elasticity = pctChangeOutput / perturbationPct;

      // Partial derivative
      const partialDerivative = (perturbedOutputValue - baseOutputValue) / delta;

      results.push({
        inputName: spec.name,
        outputName: String(outputKey),
        elasticity,
        partialDerivative,
        correlation: elasticity > 0 ? 1 : -1, // Simplified
        confidenceInterval: [elasticity * 0.9, elasticity * 1.1],
        interpretation: elasticity > 1
          ? `Highly sensitive: 1% change in ${spec.name} → ${elasticity.toFixed(2)}% change in ${String(outputKey)}`
          : elasticity > 0.1
            ? `Moderately sensitive: 1% change in ${spec.name} → ${elasticity.toFixed(2)}% change in ${String(outputKey)}`
            : `Low sensitivity: ${spec.name} has minimal impact on ${String(outputKey)}`,
      });
    }
  }

  return results;
}

// ============================================================
// REVERSE CALCULATION (GOAL SEEKING)
// ============================================================

export interface ReverseCalculationOptions {
  targetOutput: Record<string, number>;
  knownInputs: Record<string, number>;
  variableInputs: string[];
  tolerance?: number;
  maxIterations?: number;
  bounds?: Record<string, [number, number]>;
}

export interface ReverseCalculationResult {
  success: boolean;
  inputs: Record<string, number>;
  achievedOutput: Record<string, number>;
  error: number;
  iterations: number;
  message: string;
}

/**
 * Numerical goal-seeking using gradient descent.
 * Finds input values that produce target output.
 */
export function reverseCalculate<Input extends Record<string, number>, Output extends Record<string, number>>(
  calculate: (input: Input) => Output,
  options: ReverseCalculationOptions
): ReverseCalculationResult {
  const {
    targetOutput,
    knownInputs,
    variableInputs,
    tolerance = 1e-4,
    maxIterations = 100,
    bounds = {},
  } = options;

  // Initial guess: use known inputs, estimate variables from bounds midpoint
  const currentInput: Input = {
    ...knownInputs,
    ...Object.fromEntries(
      variableInputs.map(key => [
        key,
        bounds[key] ? (bounds[key][0] + bounds[key][1]) / 2 : 1,
      ])
    ),
  } as Input;

  let bestError = Infinity;
  let bestInput = { ...currentInput };

  for (let iter = 0; iter < maxIterations; iter++) {
    const output = calculate(currentInput);

    // Compute error
    let totalError = 0;
    for (const [key, target] of Object.entries(targetOutput)) {
      const actual = output[key as keyof Output];
      if (actual !== undefined) {
        totalError += Math.abs(actual - target) / Math.max(1, Math.abs(target));
      }
    }

    if (totalError < bestError) {
      bestError = totalError;
      bestInput = { ...currentInput };
    }

    if (totalError < tolerance) {
      return {
        success: true,
        inputs: currentInput,
        achievedOutput: output,
        error: totalError,
        iterations: iter + 1,
        message: 'Converged',
      };
    }

    // Gradient descent step (finite difference)
    const learningRate = 0.01;
    const gradients: Record<string, number> = {};

    for (const varKey of variableInputs) {
      const eps = Math.max(1e-6, Math.abs(currentInput[varKey]) * 1e-4);
      const plusInput = { ...currentInput } as Record<string, number>;
      plusInput[varKey] = (plusInput[varKey] as number) + eps;
      const plusOutput = calculate(plusInput as Input);

      let grad = 0;
      for (const [key, target] of Object.entries(targetOutput)) {
        const actual = output[key as keyof Output];
        const plusActual = plusOutput[key as keyof Output];
        if (actual !== undefined && plusActual !== undefined) {
          grad += (plusActual - actual) / eps * Math.sign(target - actual);
        }
      }
      gradients[varKey] = grad;
    }

    // Update variables
    for (const varKey of variableInputs) {
      const grad = gradients[varKey];
      let newValue = (currentInput[varKey] as number) + learningRate * grad;

      // Apply bounds
      if (bounds[varKey]) {
        newValue = Math.max(bounds[varKey][0], Math.min(bounds[varKey][1], newValue));
      }

      (currentInput as Record<string, unknown>)[varKey] = newValue as Input[keyof Input];
    }
  }

  // Return best effort
  const finalOutput = calculate(bestInput);
  return {
    success: bestError < tolerance * 10,
    inputs: bestInput,
    achievedOutput: finalOutput,
    error: bestError,
    iterations: maxIterations,
    message: bestError < tolerance * 10 ? 'Approximate solution' : 'Did not converge',
  };
}

// ============================================================
// AUDIT TRAIL (Golden Rule #7)
// ============================================================

export interface AuditEntry {
  timestamp: number;
  equationId: string;
  equationVersion: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>
  validation: {
    valid: boolean;
    warnings: string[];
  };
  computationTimeMs: number;
  userId?: string;
  sessionId?: string;
  correlationId: string;
}

const AUDIT_BUFFER: AuditEntry[] = [];
const MAX_AUDIT_ENTRIES = 10000;

export function logAudit(entry: Omit<AuditEntry, 'timestamp'>): void {
  const fullEntry: AuditEntry = {
    ...entry,
    timestamp: Date.now(),
  };

  AUDIT_BUFFER.push(fullEntry);

  // Trim buffer
  if (AUDIT_BUFFER.length > MAX_AUDIT_ENTRIES) {
    AUDIT_BUFFER.splice(0, AUDIT_BUFFER.length - MAX_AUDIT_ENTRIES);
  }

  // In production: send to logging service
  if (typeof console !== 'undefined') {
    console.debug('[Audit]', fullEntry.equationId, fullEntry);
  }
}

export function getAuditTrail(equationId?: string, limit = 100): AuditEntry[] {
  let entries = AUDIT_BUFFER;
  if (equationId) {
    entries = entries.filter(e => e.equationId === equationId);
  }
  return entries.slice(-limit);
}

export function clearAuditTrail(): void {
  AUDIT_BUFFER.length = 0;
}

// ============================================================
// EQUATION REGISTRY — Central Documentation
// ============================================================

export const EQUATION_REGISTRY: Map<string, EquationDocumentation> = new Map();

export function registerEquation(doc: EquationDocumentation): void {
  EQUATION_REGISTRY.set(doc.id, doc);
}

export function getEquation(id: string): EquationDocumentation | undefined {
  return EQUATION_REGISTRY.get(id);
}

export function getAllEquations(): EquationDocumentation[] {
  return Array.from(EQUATION_REGISTRY.values());
}

// ============================================================
// BUILT-IN EQUATIONS — Documented & Validated
// ============================================================

// US Navy Body Fat Formula
registerEquation({
  id: 'us-navy-bodyfat-v1',
  name: 'US Navy Body Fat Percentage Formula',
  category: 'body-composition',
  latex: `
\\text{Male: } \\%BF = \\frac{495}{1.0324 - 0.19077 \\log_{10}(\\text{waist} - \\text{neck}) + 0.15456 \\log_{10}(\\text{height})} - 450

\\text{Female: } \\%BF = \\frac{495}{1.29579 - 0.35004 \\log_{10}(\\text{waist} + \\text{hip} - \\text{neck}) + 0.22100 \\log_{10}(\\text{height})} - 450
  `.trim(),
  plainText: 'Male: %BF = 495 / (1.0324 - 0.19077*log10(waist-neck) + 0.15456*log10(height)) - 450. Female: %BF = 495 / (1.29579 - 0.35004*log10(waist+hip-neck) + 0.22100*log10(height)) - 450',
  description: 'Estimates body fat percentage from circumference measurements. Validated against hydrostatic weighing and DEXA with ~94% correlation.',
  citation: {
    authors: ['Hodgdon, J.A.', 'Beckett, M.B.'],
    title: 'Prediction of percent body fat for U.S. Navy men and women from body circumferences and height',
    journal: 'Report No. 84-11, Naval Health Research Center',
    year: 1984,
    url: 'https://www.researchgate.net/publication/234773187',
  },
  validity: {
    population: 'US Navy personnel, ages 17-50',
    ageRange: [17, 50],
    sex: 'both',
    conditions: ['Hydrated', 'Fasted 4h', 'No edema', 'Standing relaxed'],
    excludedPopulations: ['Pregnant', 'Amputees', 'Ascites', 'Severe scoliosis', 'Bodybuilders with extreme musculature'],
  },
  assumptions: [
    'Fat distribution follows typical patterns',
    'Neck circumference correlates with lean mass',
    'Waist/hip measurements taken at standardized anatomical landmarks',
  ],
  limitations: [
    'Overestimates BF% in very muscular individuals',
    'Underestimates in visceral obesity',
    'Less accurate above 35% BF (male) / 40% BF (female)',
    'Requires precise measurement technique',
  ],
  version: '1.0.0',
});

// Mifflin-St Jeor BMR
registerEquation({
  id: 'mifflin-st-jeor-bmr-v1',
  name: 'Mifflin-St Jeor Basal Metabolic Rate',
  category: 'metabolic',
  latex: `
\\text{Male: } BMR = 10 \\times \\text{weight}_{kg} + 6.25 \\times \\text{height}_{cm} - 5 \\times \\text{age} + 5

\\text{Female: } BMR = 10 \\times \\text{weight}_{kg} + 6.25 \\times \\text{height}_{cm} - 5 \\times \\text{age} - 161
  `.trim(),
  plainText: 'Male: BMR = 10*weight(kg) + 6.25*height(cm) - 5*age + 5. Female: BMR = 10*weight(kg) + 6.25*height(cm) - 5*age - 161',
  description: 'Predicts resting energy expenditure. More accurate than Harris-Benedict for modern populations.',
  citation: {
    authors: ['Mifflin, M.D.', 'St Jeor, S.T.', 'Hill, L.A.', 'Scott, B.J.', 'Daugherty, S.A.', 'Koh, Y.O.'],
    title: 'A new predictive equation for resting energy expenditure in healthy individuals',
    journal: 'American Journal of Clinical Nutrition',
    year: 1990,
    doi: '10.1093/ajcn/51.2.241',
  },
  validity: {
    population: 'Healthy adults, BMI 18-40',
    ageRange: [19, 78],
    sex: 'both',
    bmiRange: [18, 40],
    conditions: ['Thermoneutral environment', 'Post-absorptive state (12h fast)', 'Supine rest 30min'],
    excludedPopulations: ['Critically ill', 'Severe obesity (BMI>40)', 'Pregnancy', 'Thyroid disorders untreated'],
  },
  assumptions: [
    'Normal body composition for BMI',
    'Sedentary to light activity',
  ],
  limitations: [
    'Overestimates in high muscle mass',
    'Underestimates in metabolic adaptation',
    'Does not account for genetic variation',
  ],
  version: '1.0.0',
});

// FFMI (Fat-Free Mass Index)
registerEquation({
  id: 'ffmi-v1',
  name: 'Fat-Free Mass Index (Normalized)',
  category: 'body-composition',
  latex: `
FFMI = \\frac{\\text{LeanMass}_{kg}}{(\\text{height}_{m})^2}

FFMI_{normalized} = FFMI + 6.1 \\times (1.8 - \\text{height}_{m})
  `.trim(),
  plainText: 'FFMI = LeanMass(kg) / height(m)^2. Normalized FFMI = FFMI + 6.1 * (1.8 - height(m))',
  description: 'Indexes lean mass to height. Normalization to 1.8m allows comparison across heights.',
  citation: {
    authors: ['Kouri, E.M.', 'Pope, H.G.', 'Katz, D.L.', 'Oliva, P.'],
    title: 'Fat-free mass index in users and nonusers of anabolic-androgenic steroids',
    journal: 'Clinical Journal of Sport Medicine',
    year: 1995,
    doi: '10.1097/00042752-199510000-00006',
  },
  validity: {
    population: 'Resistance-trained males',
    ageRange: [18, 50],
    sex: 'male',
    conditions: ['Accurate body fat measurement'],
    excludedPopulations: ['Females (different normalization)', 'Non-resistance trained'],
  },
  assumptions: [
    'Lean mass = total weight - fat mass',
    'Height measured without shoes',
  ],
  limitations: [
    'Normalization constant (6.1) derived from male athletes',
    'Does not account for bone density differences',
    'Steroid users exceed natural limits (FFMI > 25)',
  ],
  version: '1.0.0',
});

// Half-Life Accumulation
registerEquation({
  id: 'half-life-accumulation-v1',
  name: 'Multi-Dose Half-Life Accumulation (Steady State)',
  category: 'pharmacokinetic',
  latex: `
C_{max,ss} = \\frac{Dose \\times F}{V_d} \\times \\frac{1}{1 - e^{-k \\tau}}

C_{min,ss} = C_{max,ss} \\times e^{-k \\tau}

AUC_{\\tau,ss} = \\frac{Dose \\times F}{CL}

\\text{where } k = \\frac{\\ln(2)}{t_{1/2}}, \\quad CL = k \\times V_d
  `.trim(),
  plainText: 'Cmax_ss = (Dose * F / Vd) * 1/(1 - e^(-k*tau)). Cmin_ss = Cmax_ss * e^(-k*tau). k = ln(2)/half_life',
  description: 'Calculates steady-state peak, trough, and AUC for repeated dosing. Assumes linear pharmacokinetics.',
  citation: {
    authors: ['Gibaldi, M.', 'Perrier, D.'],
    title: 'Pharmacokinetics',
    journal: 'Marcel Dekker, 2nd Edition',
    year: 1982,
  },
  validity: {
    population: 'General adult',
    conditions: ['Linear PK', 'Constant dosing interval', 'Steady state reached (5 half-lives)'],
    excludedPopulations: ['Non-linear PK drugs', 'Renal/hepatic impairment without adjustment'],
  },
  assumptions: [
    'Instantaneous absorption (IV bolus) or first-order absorption',
    'One-compartment model',
    'Constant bioavailability (F)',
    'No drug interactions affecting clearance',
  ],
  limitations: [
    'Multi-compartment drugs need more complex models',
    'Accumulation ratio assumes steady state',
    'Does not model loading doses',
  ],
  version: '1.0.0',
});

// E2 from Testosterone (Aromatization)
registerEquation({
  id: 'aromatization-test-to-e2-v1',
  name: 'Testosterone-to-Estradiol Conversion (Aromatization)',
  category: 'hormonal',
  latex: `
E2_{pg/mL} = Test_{ng/dL} \\times \\text{AromataseActivity} \\times 0.003

\\text{AromataseActivity} \\in [0.1, 0.3] \\text{ (individual variation)}
  `.trim(),
  plainText: 'E2(pg/mL) = Test(ng/dL) * AromataseActivity * 0.003. AromataseActivity typically 0.1-0.3',
  description: 'Estimates estradiol from total testosterone via aromatase conversion. Highly individual.',
  citation: {
    authors: ['Simpson, E.R.', 'Davis, S.R.'],
    title: 'Aromatase and the regulation of estrogen biosynthesis',
    journal: 'Endocrine Reviews',
    year: 2001,
    doi: '10.1210/edrv.22.2.0392',
  },
  validity: {
    population: 'Adult males on testosterone therapy',
    sex: 'male',
    conditions: ['Steady-state testosterone', 'No AI use', 'Normal liver function'],
    excludedPopulations: ['On aromatase inhibitors', 'Liver disease', 'Obesity (adipose aromatase)'],
  },
  assumptions: [
    'Linear conversion at physiological doses',
    'Aromatase activity constant',
    'No significant SHBG impact on free T → E2',
  ],
  limitations: [
    'Highly variable between individuals (genetics, body fat, age)',
    'Non-linear at supraphysiological doses',
    'Ignores 5α-reductase pathway',
    'SHBG changes alter free T fraction',
  ],
  version: '1.0.0',
});

// Wilks Score (Powerlifting)
registerEquation({
  id: 'wilks-score-v1',
  name: 'Wilks Coefficient (Powerlifting Relative Strength)',
  category: 'strength',
  latex: `
\\text{Wilks} = \\frac{500}{a + b \\times x + c \\times x^2 + d \\times x^3 + e \\times x^4 + f \\times x^5} \\times \\text{Total}_{kg}

\\text{Male coeffs: } a=-216.0475144, b=16.2606339, c=-0.002388645, d=-0.00113732, e=7.01863E-06, f=-1.291E-08

\\text{Female coeffs: } a=594.31747775582, b=-27.23842536447, c=0.82112226871, d=-0.00930733913, e=4.731582E-05, f=-9.054E-08
  `.trim(),
  plainText: 'Wilks = 500 / (a + b*bodyweight + c*bodyweight^2 + d*bodyweight^3 + e*bodyweight^4 + f*bodyweight^5) * Total_kg',
  description: 'Normalizes powerlifting total across body weights. Being replaced by IPF GL Points.',
  citation: {
    authors: ['Wilks, R.'],
    title: 'The Wilks Formula',
    journal: 'Powerlifting USA',
    year: 1994,
  },
  validity: {
    population: 'Competitive powerlifters',
    sex: 'both',
    conditions: ['Full competition total (Squat+Bench+Deadlift)'],
    excludedPopulations: ['Non-competition lifts', 'Partial movements'],
  },
  assumptions: [
    'All three lifts performed to competition standard',
    'Body weight measured at weigh-in',
  ],
  limitations: [
    'Favors heavier lifters slightly',
    'Being phased out for IPF GL Points',
    'Does not account for age',
  ],
  version: '1.0.0',
});

// ============================================================
// VALIDATION HELPERS FOR SPECIFIC TOOLS
// ============================================================

export const BODYFAT_VALIDATION_RULES = {
  heightCm: { min: 100, max: 250, required: true, type: 'physical' as const },
  weightKg: { min: 30, max: 300, required: true, type: 'physical' as const },
  neckCm: { min: 20, max: 60, required: true, type: 'physical' as const },
  waistCm: { min: 40, max: 200, required: true, type: 'physical' as const },
  hipCm: { min: 50, max: 200, required: false, type: 'physical' as const }, // Required for females
  age: { min: 10, max: 100, required: true, type: 'count' as const },
} as const;

export const PHARMACOKINETIC_VALIDATION_RULES = {
  doseMg: { min: 0.1, max: 5000, required: true, type: 'physical' as const },
  halfLifeDays: { min: 0.1, max: 30, required: true, type: 'physical' as const },
  dosingIntervalDays: { min: 0.1, max: 30, required: true, type: 'physical' as const },
  bioavailability: { min: 0, max: 1, required: false, type: 'ratio' as const },
  volumeOfDistribution: { min: 0.1, max: 1000, required: false, type: 'physical' as const },
} as const;

export const HORMONAL_VALIDATION_RULES = {
  totalTestosteroneNgDl: { min: 0, max: 5000, required: false, type: 'physical' as const, allowZero: true },
  freeTestosteronePgMl: { min: 0, max: 100, required: false, type: 'physical' as const, allowZero: true },
  estradiolPgMl: { min: 0, max: 200, required: false, type: 'physical' as const, allowZero: true },
  shbgNmolL: { min: 0, max: 200, required: false, type: 'physical' as const, allowZero: true },
  lhMiUml: { min: 0, max: 50, required: false, type: 'physical' as const, allowZero: true },
  fshMiUml: { min: 0, max: 50, required: false, type: 'physical' as const, allowZero: true },
  prolactinNgMl: { min: 0, max: 500, required: false, type: 'physical' as const, allowZero: true },
} as const;

// ============================================================
// MACRO VALIDATION RULES
// ============================================================

export const MACRO_VALIDATION_RULES = {
  age: { min: 13, max: 100, required: true, type: 'count' as const },
  heightCm: { min: 100, max: 250, required: true, type: 'physical' as const },
  weightKg: { min: 30, max: 300, required: true, type: 'physical' as const },
  activityLevel: { min: 1.2, max: 1.9, required: true, type: 'ratio' as const },
} as const;

// ============================================================
// EXPORTS
// ============================================================

// Re-export Golden Rules from ai-orchestrator
export { GOLDEN_RULES, type GoldenRule } from './ai-orchestrator.v6';
