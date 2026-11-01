// lib/shared/tool-excellence-inventory.ts
// §35.1 Tool Excellence Inventory — Wave 1

export type ToolExcellenceStatus = 'Implemented' | 'Partial' | 'Planned' | 'Placeholder' | 'BLOCKED';

export interface ToolExcellenceEntry {
  toolId: string;
  nameAr: string;
  nameEn: string;
  category: string;
  status: ToolExcellenceStatus;
  canonicalPath: string;
  engine: string | null;
  consumes: string[];
  produces: string[];
  relatedTools: string[];
  maturity: 'v6' | 'legacy' | 'none';
  evidence: string;
}

export const WAVE1_INVENTORY: ToolExcellenceEntry[] = [
  {
    toolId: 'mrx.tool.bodyfat',
    nameAr: 'حاسبة نسبة الدهون',
    nameEn: 'Body Fat Calculator',
    category: 'body-composition',
    status: 'Implemented',
    canonicalPath: 'lib/tools/engines/bodyfat.v6.ts',
    engine: 'BODYFAT_MATH_ENGINE',
    consumes: ['weight', 'height', 'measurements'],
    produces: ['bodyFatPercent', 'leanMass', 'fatMass'],
    relatedTools: ['mrx.tool.macro'],
    maturity: 'v6',
    evidence: 'bodyfat.v6.ts + bodyfat.v6.test.ts (12 tests)',
  },
  {
    toolId: 'mrx.tool.macro',
    nameAr: 'حاسبة الماكروز',
    nameEn: 'Macro Calculator',
    category: 'nutrition',
    status: 'Implemented',
    canonicalPath: 'lib/tools/engines/macro.v6.ts',
    engine: 'MACRO_MATH_ENGINE',
    consumes: ['weight', 'height', 'age', 'sex', 'activity', 'linked bodyFat'],
    produces: ['calories', 'protein', 'carbs', 'fat'],
    relatedTools: ['mrx.tool.bodyfat'],
    maturity: 'v6',
    evidence: 'macro.v6.ts + macro.v6.test.ts (46 tests); linkedData param added',
  },
  {
    toolId: 'mrx.tool.bmr-tdee',
    nameAr: 'BMR/TDEE',
    nameEn: 'BMR/TDEE',
    category: 'nutrition',
    status: 'Partial',
    canonicalPath: 'lib/tools/engines/macro.ts (subsumed)',
    engine: null,
    consumes: [],
    produces: [],
    relatedTools: ['mrx.tool.macro'],
    maturity: 'legacy',
    evidence: 'Standalone engine lib/tools/engines/bmr-tdee.v6.ts created + tests. UI wiring pending.',
  },
  {
    toolId: 'mrx.tool.bmi',
    nameAr: 'BMI',
    nameEn: 'BMI',
    category: 'body-composition',
    status: 'Implemented',
    canonicalPath: 'lib/tools/engines/bmi.v6.ts',
    engine: 'bmi.v6',
    consumes: ['weightKg', 'heightCm'],
    produces: ['bmi', 'category'],
    relatedTools: ['mrx.tool.bodyfat', 'mrx.tool.macro'],
    maturity: 'v6',
    evidence: 'Engine created + page + tests. WHO classification. Not a medical diagnosis.',
  },
  {
    toolId: 'mrx.tool.water-intake',
    nameAr: 'قياس معدل التعرق أثناء التمرين',
    nameEn: 'Exercise Sweat-Rate Measurement',
    category: 'nutrition',
    status: 'Implemented',
    canonicalPath: 'lib/tools/engines/tool-097-hydration-balance-calculator.ts',
    engine: 'tool-097',
    consumes: ['preExerciseMassKg', 'postExerciseMassKg', 'fluidConsumedL', 'urineOutputL', 'exerciseDurationMinutes'],
    produces: ['measuredSweatLossL', 'calculatedSweatRateLPerHour'],
    relatedTools: [],
    maturity: 'v6',
    evidence: 'Tool 097 UI calls the NATA-sourced measured-sweat engine; canonical route, adapter, and focused engine/UI/route tests are present. No daily fluid prescription or hydration-status inference.',
  },
  {
    toolId: 'mrx.tool.protein-needs',
    nameAr: 'Protein Needs',
    nameEn: 'Protein Needs',
    category: 'nutrition',
    status: 'Partial',
    canonicalPath: 'lib/tools/engines/macro.ts (subsumed)',
    engine: null,
    consumes: [],
    produces: [],
    relatedTools: ['mrx.tool.macro'],
    maturity: 'legacy',
    evidence: 'Standalone engine lib/tools/engines/protein-needs.v6.ts created + tests. UI wiring pending.',
  },

];

export const WAVE3_INVENTORY: ToolExcellenceEntry[] = [
  {
    toolId: 'mrx.tool.genetic',
    nameAr: 'Genetic Potential',
    nameEn: 'Genetic Potential',
    category: 'body-composition',
    status: 'Implemented',
    canonicalPath: 'lib/tools/engines/genetic-potential.v6.ts',
    engine: 'genetic-potential.v6',
    consumes: ['age', 'weight', 'height'],
    produces: ['potentialScore', 'bmi'],
    relatedTools: ['mrx.tool.bodyfat'],
    maturity: 'v6',
    evidence: 'genetic-potential.v6.ts + test (5 tests) + page',
  },
  {
    toolId: 'mrx.tool.body-composition-vision',
    nameAr: 'Body Composition Vision',
    nameEn: 'Body Composition Vision',
    category: 'body-composition',
    status: 'Implemented',
    canonicalPath: 'lib/tools/engines/body-composition-vision.v6.ts',
    engine: 'body-composition-vision.v6',
    consumes: ['height', 'neck', 'waist', 'weight'],
    produces: ['bodyFatPercent', 'leanMassKg', 'fatMassKg'],
    relatedTools: ['mrx.tool.bodyfat', 'mrx.tool.macro'],
    maturity: 'v6',
    evidence: 'body-composition-vision.v6.ts + test (4 tests) + page',
  },
];
