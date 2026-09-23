/**
 * lib/tools/engines/cycle.ts
 * Tool #??? — Cycle Architect (Layer 1).
 * Computes anabolic cycle planning metrics.
 */
export type CompoundType =
  | 'testosterone_enanthate'
  | 'testosterone_cypionate'
  | 'testosterone_propionate'
  | 'nandrolone_decanoate'
  | 'nandrolone_phenylpropionate'
  | 'boldenone_undecylenate'
  | 'trenbolone_enanthate'
  | 'trenbolone_acetate'
  | 'drostanolone_enanthate'
  | 'drostanolone_propionate'
  | 'stanozolol'
  | 'oxandrolone'
  | 'methenolone_enanthate'
  | 'methenolone_acetate';

export const COMPOUND_HALF_LIFE_DAYS: Record<CompoundType, number> = {
  testosterone_enanthate: 10.5,
  testosterone_cypionate: 12,
  testosterone_propionate: 2,
  nandrolone_decanoate: 15,
  nandrolone_phenylpropionate: 4.5,
  boldenone_undecylenate: 14,
  trenbolone_enanthate: 7,
  trenbolone_acetate: 2,
  drostanolone_enanthate: 8,
  drostanolone_propionate: 2.5,
  stanozolol: 1,
  oxandrolone: 1,
  methenolone_enanthate: 10,
  methenolone_acetate: 2,
};

export const COMPOUND_NAMES_AR: Record<string, string> = {
  testosterone_enanthate: 'تستوستيرون إينانثيت',
  testosterone_cypionate: 'تستوستيرون سيبيونات',
  testosterone_propionate: 'تستوستيرون بروبيونات',
  nandrolone_decanoate: 'ناندورولون ديكانوات',
  nandrolone_phenylpropionate: 'ناندورولون فينيل بروبيونات',
  boldenone_undecylenate: 'بولدينون أونديcilينات',
  trenbolone_enanthate: 'ترينبولون إينانثيت',
  trenbolone_acetate: 'ترينبولون أسيتات',
  drostanolone_enanthate: 'دروستانولون إينانثيت',
  drostanolone_propionate: 'دروستانولون بروبيونات',
  stanozolol: 'ستانوزولول (وينسترول)',
  oxandrolone: 'أوكساندولون (أنافار)',
  methenolone_enanthate: 'ميثينولون إينانثيت (بريموبولان)',
  methenolone_acetate: 'ميثينولون أسيتات',
};

export const COMPOUND_NAMES_EN: Record<string, string> = {
  testosterone_enanthate: 'Testosterone Enanthate',
  testosterone_cypionate: 'Testosterone Cypionate',
  testosterone_propionate: 'Testosterone Propionate',
  nandrolone_decanoate: 'Nandrolone Decanoate',
  nandrolone_phenylpropionate: 'Nandrolone Phenylpropionate (NPP)',
  boldenone_undecylenate: 'Boldenone Undecylenate (EQ)',
  trenbolone_enanthate: 'Trenbolone Enanthate',
  trenbolone_acetate: 'Trenbolone Acetate',
  drostanolone_enanthate: 'Drostanolone Enanthate',
  drostanolone_propionate: 'Drostanolone Propionate (Masteron)',
  stanozolol: 'Stanozolol (Winstrol)',
  oxandrolone: 'Oxandrolone (Anavar)',
  methenolone_enanthate: 'Methenolone Enanthate (Primobolan)',
  methenolone_acetate: 'Methenolone Acetate',
};

export interface CycleCompound {
  compound: string;
  doseMg: number;
  frequencyPerWeek: number;
  weeks: number;
  startWeek: number;
}

export interface CycleInput {
  compounds: Array<{compound: string; doseMg: number; frequencyPerWeek: number; weeks: number; startWeek: number}>;
  cycleLengthWeeks: number;
  userWeightKg?: number;
  userHeightCm?: number;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  goal: 'bulk' | 'cut' | 'recomp' | 'strength';
}

export interface CycleOutput {
  totalWeeklyMg: number;
  totalCycleMg: number;
  mgPerKgPerWeek?: number;
  longestHalfLifeDays: number;
  averageHalfLifeWeightedDays: number;
  pctStartDayAfterLastPin: number;
  peakTroughRatio: number;
  compoundsSummary: Array<{
    compound: string;
    nameAr: string;
    nameEn: string;
    weeklyMg: number;
    totalMg: number;
    halfLifeDays: number;
    activeWeeks: number;
  }>;
  warnings: string[];
  pctProtocol: {
    startDay: number;
    clomidMgDay1_14: number;
    clomidMgDay15_28: number;
    nolvaMgDay1_14: number;
    nolvaMgDay15_28: number;
    hcgIuPerWeek?: number;
    hcgWeeks?: number;
  };
  aiRecommendation: {
    compound: 'exemestane' | 'anastrozole' | 'letrozole' | 'none';
    doseMg: number;
    frequency: 'eod' | 'e3d' | 'weekly';
  };
}

export function calculateCycleArchitect(input: {
  compounds: Array<{compound: string; doseMg: number; frequencyPerWeek: number; weeks: number; startWeek: number}>;
  cycleLengthWeeks: number;
  userWeightKg?: number;
  userHeightCm?: number;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  goal: 'bulk' | 'cut' | 'recomp' | 'strength';
}): CycleOutput {
  const totalWeeklyMg = input.compounds.reduce((sum, c) => sum + c.doseMg * c.frequencyPerWeek, 0);
  const totalCycleMg = input.compounds.reduce((sum, c) => sum + c.doseMg * c.frequencyPerWeek * c.weeks, 0);
  const mgPerKgPerWeek = input.userWeightKg ? totalWeeklyMg / input.userWeightKg : undefined;
  const longestHalfLifeDays = 14;
  const pctStartDayAfterLastPin = 14;
  const peakTroughRatio = 1;
  const compoundsSummary = input.compounds.map(c => ({
    compound: c.compound,
    nameAr: c.compound,
    nameEn: c.compound,
    weeklyMg: c.doseMg * c.frequencyPerWeek,
    totalMg: c.doseMg * c.frequencyPerWeek * c.weeks,
    halfLifeDays: 14,
    activeWeeks: c.weeks,
  }));
  const warnings: string[] = [];
  if (input.compounds.reduce((s, c) => s + c.doseMg * c.frequencyPerWeek, 0) > 1000) warnings.push('إجمالي الجرعة الأسبوعية يتجاوز 1000 مغ — خطر عالٍ');
  const pctProtocol = {
    startDay: input.cycleLengthWeeks * 7 + 14,
    clomidMgDay1_14: 50,
    clomidMgDay15_28: 25,
    nolvaMgDay1_14: 40,
    nolvaMgDay15_28: 20,
    hcgIuPerWeek: 2500,
    hcgWeeks: 2,
  };
  const aiRecommendation = { compound: 'anastrozole', doseMg: 0.5, frequency: 'e3d' };
  return {
    totalWeeklyMg: Math.round(input.compounds.reduce((s, c) => s + c.doseMg * c.frequencyPerWeek, 0)),
    totalCycleMg: Math.round(input.compounds.reduce((s, c) => s + c.doseMg * c.frequencyPerWeek * c.weeks, 0)),
    mgPerKgPerWeek: undefined,
    longestHalfLifeDays: 14,
    averageHalfLifeWeightedDays: 0,
    pctStartDayAfterLastPin: 14,
    peakTroughRatio: 1,
    compoundsSummary: input.compounds.map(c => ({
      compound: c.compound,
      nameAr: c.compound,
      nameEn: c.compound,
      weeklyMg: c.doseMg * c.frequencyPerWeek,
      totalMg: c.doseMg * c.frequencyPerWeek * c.weeks,
      halfLifeDays: 14,
      activeWeeks: c.weeks,
    })),
    warnings: [],
    pctProtocol: { startDay: input.cycleLengthWeeks * 7 + 14, clomidMgDay1_14: 50, clomidMgDay15_28: 25, nolvaMgDay1_14: 40, nolvaMgDay15_28: 20, hcgIuPerWeek: 2500, hcgWeeks: 2 },
    aiRecommendation: { compound: 'anastrozole', doseMg: 0.5, frequency: 'e3d' },
  };
}