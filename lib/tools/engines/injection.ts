/**
 * lib/tools/engines/injection.ts
 * ════════════════════════════════════════════════════════════════════════════════
 *  Tool #3 — Interactive Injection Map (Layer 1).
 * ════════════════════════════════════════════════════════════════════════════════
 * Injection site guide with rotation planner and volume limits.
 *
 * PURE MODULE — no React, no DOM, no Supabase, no `Date`, no I/O.
 */

export type UnitSystem = 'metric' | 'imperial';

export interface InjectionSite {
  id: string;
  nameEn: string;
  nameAr: string;
  maxVolumeMl: number;
  depthMm: number;
  riskLevel: 'low' | 'medium' | 'high';
  landmarksEn: string[];
  landmarksAr: string[];
}

export interface InjectionInput {
  sites: InjectionSite[];
  lastUsedSites: string[];
  preferredSides: ('left' | 'right')[];
  unitSystem?: UnitSystem;
}

export interface InjectionOutput {
  recommendedSites: InjectionSite[];
  rotationSchedule: Array<{ siteId: string; day: number }>;
  volumeLimits: Record<string, number>;
  warnings: string[];
}

export const INJECTION_SITES: InjectionSite[] = [
  {
    id: 'glute_left',
    nameEn: 'Left Glute (Upper Outer Quadrant)',
    nameAr: 'الألية اليسرى (الربع العلوي الخارجي)',
    maxVolumeMl: 4,
    depthMm: 35,
    riskLevel: 'low',
    landmarksEn: ['Posterior superior iliac spine', 'Greater trochanter'],
    landmarksAr: ['الشوكة الحرقفية العلوية الخلفية', 'المتراس הגדול'],
  },
  {
    id: 'glute_right',
    nameEn: 'Right Glute (Upper Outer Quadrant)',
    nameAr: 'الألية اليمنى (الربع العلوي الخارجي)',
    maxVolumeMl: 4,
    depthMm: 35,
    riskLevel: 'low',
    landmarksEn: ['Posterior superior iliac spine', 'Greater trochanter'],
    landmarksAr: ['الشوكة الحرقفية العلوية الخلفية', 'المتراس الكبير'],
  },
  {
    id: 'delt_left',
    nameEn: 'Left Deltoid',
    nameAr: 'العضلة الدالية اليسرى',
    maxVolumeMl: 2,
    depthMm: 25,
    riskLevel: 'low',
    landmarksEn: ['Acromion process', 'Deltoid tuberosity'],
    landmarksAr: ['النتوء الأكمي', 'حدبة الدالية'],
  },
  {
    id: 'delt_right',
    nameEn: 'Right Deltoid',
    nameAr: 'العضلة الدالية اليمنى',
    maxVolumeMl: 2,
    depthMm: 25,
    riskLevel: 'low',
    landmarksEn: ['Acromion process', 'Deltoid tuberosity'],
    landmarksAr: ['النتوء الأكمي', 'حدبة الدالية'],
  },
  {
    id: 'vastus_lat_left',
    nameEn: 'Left Vastus Lateralis',
    nameAr: 'العضلة الوحشية الجانبية اليسرى',
    maxVolumeMl: 3,
    depthMm: 30,
    riskLevel: 'low',
    landmarksEn: ['Greater trochanter', 'Lateral femoral condyle'],
    landmarksAr: ['المتراس الكبير', 'اللهاية الفخذية الوحشية'],
  },
  {
    id: 'vastus_lat_right',
    nameEn: 'Right Vastus Lateralis',
    nameAr: 'العضلة الوحشية الجانبية اليمنى',
    maxVolumeMl: 3,
    depthMm: 30,
    riskLevel: 'low',
    landmarksEn: ['Greater trochanter', 'Lateral femoral condyle'],
    landmarksAr: ['المتراس الكبير', 'اللهاية الفخذية الوحشية'],
  },
  {
    id: 'ventroglute_left',
    nameEn: 'Left Ventrogluteal',
    nameAr: 'الموقع البطني الألوي الأيسر',
    maxVolumeMl: 4,
    depthMm: 40,
    riskLevel: 'low',
    landmarksEn: ['Anterior superior iliac spine', 'Iliac crest'],
    landmarksAr: ['الشوكة الحرقفية العلوية الأمامية', 'قمة الحرقفة'],
  },
  {
    id: 'ventroglute_right',
    nameEn: 'Right Ventrogluteal',
    nameAr: 'الموقع البطني الألوي الأيمن',
    maxVolumeMl: 4,
    depthMm: 40,
    riskLevel: 'low',
    landmarksEn: ['Anterior superior iliac spine', 'Iliac crest'],
    landmarksAr: ['الشوكة الحرقفية العلوية الأمامية', 'قمة الحرقفة'],
  },
];

export function calculateInjectionPlan(input: InjectionInput): InjectionOutput {
  const { sites, lastUsedSites, preferredSides } = input;

  // Filter available sites based on preferences
  const availableSites = sites.filter((site) => {
    const side = site.id.includes('_left') ? 'left' : 'right';
    return preferredSides.length === 0 || preferredSides.includes(side);
  });

  // Sort by last used (least recently used first)
  availableSites.sort((a, b) => {
    const aIndex = lastUsedSites.indexOf(a.id);
    const bIndex = lastUsedSites.indexOf(b.id);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return -1;
    if (bIndex === -1) return 1;
    return aIndex - bIndex;
  });

  // Create 14-day rotation schedule
  const rotationSchedule: Array<{ siteId: string; day: number }> = [];
  for (let day = 1; day <= 14; day++) {
    const site = availableSites[(day - 1) % availableSites.length];
    if (site) {
      rotationSchedule.push({ siteId: site.id, day });
    }
  }

  // Volume limits per site
  const volumeLimits: Record<string, number> = {};
  for (const site of sites) {
    volumeLimits[site.id] = site.maxVolumeMl;
  }

  // Warnings
  const warnings: string[] = [];
  if (availableSites.length < 2) {
    warnings.push('أقل من موقعين متاحين — يوصى بإضافة المزيد من المواقع للتدوير الآمن');
  }
  const usedRecently = lastUsedSites.slice(0, 3);
  if (usedRecently.length >= 2 && new Set(usedRecently).size === 1) {
    warnings.push('تم استخدام نفس الموقع مؤخراً بشكل متكرر — خطر تليف النسيج');
  }

  return {
    recommendedSites: availableSites.slice(0, 4),
    rotationSchedule,
    volumeLimits,
    warnings,
  };
}
