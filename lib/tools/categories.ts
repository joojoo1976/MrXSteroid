/**
 * lib/tools/categories.ts — PART 1: category registry (SPEC 3.1).
 */
import type { SmartToolEntry } from './smartToolsCatalog';
import { getCatalogTools } from './smartToolsCatalog4';

export const SMART_TOOL_CATEGORY_SLUGS = [
  'nutrition',
  'body-composition',
  'pharmacokinetics',
  'hormonal-health',
  'medical-monitoring',
  'injection-formulation',
  'cycle-management',
  'training-recovery',
  'reproductive-wellbeing',
  'platform-ai',
] as const;

export type SmartToolCategory = (typeof SMART_TOOL_CATEGORY_SLUGS)[number];

export interface SmartToolCategoryDefinition {
  slug: SmartToolCategory;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon?: string;
  order: number;
  safetyLevel?: 'general' | 'health' | 'high-risk';
}

export const SMART_TOOL_CATEGORIES: readonly SmartToolCategoryDefinition[] = [
  { slug: 'nutrition', nameAr: 'التغذية والسعرات', nameEn: 'Nutrition & Calories', descriptionAr: 'السعرات والماكروز وتخطيط التغذية', descriptionEn: 'Calories, macros and meal planning', icon: 'Apple', order: 10, safetyLevel: 'general' },
  { slug: 'body-composition', nameAr: 'تركيب الجسم', nameEn: 'Body Composition', descriptionAr: 'الوزن والدهون واحتباس الماء', descriptionEn: 'Weight, body-fat and water retention', icon: 'Scale', order: 20, safetyLevel: 'general' },
  { slug: 'pharmacokinetics', nameAr: 'الحركية الدوائية ونصف العمر', nameEn: 'Pharmacokinetics & Half-Life', descriptionAr: 'الإسترات ونصف العمر وتوقيت المركبات', descriptionEn: 'Esters, half-lives and compound timing', icon: 'Timer', order: 30, safetyLevel: 'general' },
  { slug: 'hormonal-health', nameAr: 'الصحة الهرمونية', nameEn: 'Hormonal Health', descriptionAr: 'الإستروجين والبرولاكتين وHPTA وTRT', descriptionEn: 'Estrogen, prolactin, HPTA and TRT', icon: 'Activity', order: 40, safetyLevel: 'health' },
  { slug: 'medical-monitoring', nameAr: 'المراقبة الطبية والسلامة', nameEn: 'Medical Monitoring & Safety', descriptionAr: 'الفحوصات والقلب والتفاعلات والآثار الجانبية', descriptionEn: 'Bloodwork, cardio, interactions and side effects', icon: 'ShieldCheck', order: 50, safetyLevel: 'health' },
  { slug: 'injection-formulation', nameAr: 'الحقن والتركيبات', nameEn: 'Injection & Formulation', descriptionAr: 'مواقع الحقن والأحجام وتقليل الألم', descriptionEn: 'Injection sites, volumes and pain reduction', icon: 'Syringe', order: 60, safetyLevel: 'health' },
  { slug: 'cycle-management', nameAr: 'إدارة الدورات', nameEn: 'Cycle Management', descriptionAr: 'بناء الستاك وتوقيت PCT والتكاليف', descriptionEn: 'Stack building, PCT timing and cycle costs', icon: 'Layers', order: 70, safetyLevel: 'general' },
  { slug: 'training-recovery', nameAr: 'التدريب والاستشفاء', nameEn: 'Training & Recovery', descriptionAr: 'الإمكانات الوراثية والتقدم والتعافي', descriptionEn: 'Genetic potential, progress and recovery', icon: 'Dumbbell', order: 80, safetyLevel: 'general' },
  { slug: 'reproductive-wellbeing', nameAr: 'الصحة الإنجابية', nameEn: 'Reproductive Wellbeing', descriptionAr: 'بروتوكولات HCG وSERM والخصوبة', descriptionEn: 'HCG/SERM protocols and fertility', icon: 'Heart', order: 90, safetyLevel: 'health' },
  { slug: 'platform-ai', nameAr: 'أدوات المنصة والذكاء الاصطناعي', nameEn: 'Platform & AI Tools', descriptionAr: 'أدوات المنصة القادمة والتكاملات الذكية', descriptionEn: 'Upcoming platform and AI integrations', icon: 'Sparkles', order: 100, safetyLevel: 'general' },
];

export function getCategory(slug: string): SmartToolCategoryDefinition | null {
  return SMART_TOOL_CATEGORIES.find((c) => c.slug === slug) ?? null;
}

/** Rattachement outil → catégorie (slug du catalogue → slug de catégorie). */
export const TOOL_CATEGORY: Readonly<Record<string, SmartToolCategory>> = {
  'multi-ester-pharmacokinetics': 'pharmacokinetics',
  'hpta-recovery': 'hormonal-health',
  'aromatization-risk': 'hormonal-health',
  'pct-timing': 'cycle-management',
  'hcg-serm-protocol': 'reproductive-wellbeing',
  'tool-006-estrogen-prolactin': 'hormonal-health',
  'tool-007-bloodwork-analyzer': 'medical-monitoring',
  'tool-008-side-effect-tracker': 'medical-monitoring',
  'tool-009-injection-site-rotator': 'injection-formulation',
  'tool-010-compound-stack-builder': 'cycle-management',
  'tool-011-progress-tracker': 'body-composition',
  'tool-012-calorie-adjuster': 'nutrition',
  'tool-013-macro-optimizer': 'nutrition',
  'tool-014-water-retention': 'body-composition',
  'tool-015-shbg-modulator': 'hormonal-health',
  'tool-016-half-life-calculator': 'pharmacokinetics',
  'tool-017-drug-interaction': 'medical-monitoring',
  'tool-018-hpta-recovery': 'hormonal-health',
  'tool-019-cardio-monitor': 'medical-monitoring',
  'tool-020-genetic-potential': 'training-recovery',
  'tool-021-peptide-protocol': 'cycle-management',
  'tool-022-half-life-stacker': 'pharmacokinetics',
  'tool-023-trt-optimization': 'hormonal-health',
  'tool-024-bloodwork-interpreter': 'medical-monitoring',
  'tool-025-drug-interaction-pro': 'medical-monitoring',
  'tool-026-injection-pain': 'injection-formulation',
  'tool-027-ester-conversion': 'pharmacokinetics',
  'tool-028-stacking-synergy': 'cycle-management',
  'tool-029-side-effect-early-warning': 'medical-monitoring',
  'tool-030-cycle-cost-calculator': 'cycle-management',
};

/** Catégorie d'un outil (accepte slug ou href '/smarttools/<slug>'). */
export function getCategoryOfSlug(slugOrHref: string): SmartToolCategory | null {
  const slug = slugOrHref.replace(/^\/smarttools\//, '').replace(/^\//, '');
  return TOOL_CATEGORY[slug] ?? null;
}

/** Outils du catalogue appartenant à la catégorie (triés par order). */
export function getToolsByCategory(category: SmartToolCategory): SmartToolEntry[] {
  return getCatalogTools().filter((t) => TOOL_CATEGORY[t.slug] === category);
}

/** URL canonique hiérarchique : /smarttools/<category>/<tool-slug> (ou null). */
export function toHierarchicalHref(slugOrHref: string): string | null {
  const slug = slugOrHref.replace(/^\/smarttools\//, '').replace(/^\//, '');
  const cat = TOOL_CATEGORY[slug];
  return cat ? `/smarttools/${cat}/${slug}` : null;
}

export function isCategory(slug: string): slug is SmartToolCategory {
  return (SMART_TOOL_CATEGORY_SLUGS as readonly string[]).includes(slug);
}
