/**
 * lib/tools/categories.ts — PART 1: category registry (SPEC 3.1).
 */
import type { SmartToolEntry } from './smartToolsCatalog';
import { getCatalogTools, getPublishedCatalogTools } from './smartToolsCatalog4';

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
  'tool-031-cycle-length-optimizer': 'cycle-management',
  'tool-032-advanced-pct-planner': 'hormonal-health',
  'tool-033-bloodwork-trend-analyzer': 'medical-monitoring',
  'tool-034-compound-clearance': 'pharmacokinetics',
  'tool-035-hormone-conversion': 'pharmacokinetics',
  'tool-036-injection-schedule': 'injection-formulation',
  'tool-037-side-effect-probability': 'medical-monitoring',
  'tool-038-stack-compatibility': 'cycle-management',
  'tool-039-liver-enzyme-tracker': 'medical-monitoring',
  'tool-040-lipid-profile-optimizer': 'medical-monitoring',

  'tool-041-hematocrit-monitor': 'medical-monitoring',
  'tool-042-estrogen-management': 'hormonal-health',
  'tool-043-prolactin-management': 'hormonal-health',
  'tool-044-dht-side-effects': 'medical-monitoring',
  'tool-045-cycle-break-planner': 'cycle-management',

  'tool-046-trt-lifetime': 'hormonal-health',
  'tool-047-fertility-preservation': 'hormonal-health',
  'tool-048-cardiovascular-risk': 'medical-monitoring',
  'tool-049-bone-density': 'medical-monitoring',
  'tool-050-mental-health': 'medical-monitoring',
  // Roadmap #051-#150 — function-based category distribution (SPEC §5).
  'tool-051-peptide-dosage-calculator': 'injection-formulation',
  'tool-052-growth-hormone-protocol-planner': 'hormonal-health',
  'tool-053-insulin-conversion-calculator': 'hormonal-health',
  'tool-054-glucose-tracker': 'medical-monitoring',
  'tool-055-insulin-sensitivity-optimizer': 'medical-monitoring',
  'tool-056-mini-pct-calculator': 'cycle-management',
  'tool-057-free-testosterone-manager': 'hormonal-health',
  'tool-058-androgenic-balance-calculator': 'hormonal-health',
  'tool-059-androgen-receptor-optimizer': 'hormonal-health',
  'tool-060-5-alpha-conversion-calculator': 'pharmacokinetics',
  'tool-061-hair-loss-tracker': 'medical-monitoring',
  'tool-062-prostate-health-manager': 'medical-monitoring',
  'tool-063-testicular-suppression-calculator': 'hormonal-health',
  'tool-064-sperm-production-optimizer': 'reproductive-wellbeing',
  'tool-065-aromatase-conversion-calculator': 'pharmacokinetics',
  'tool-066-estrogen-sensitivity-manager': 'hormonal-health',
  'tool-067-estrogen-balance-calculator': 'hormonal-health',
  'tool-068-gynecomastia-tracker': 'medical-monitoring',
  'tool-069-detoxification-optimizer': 'medical-monitoring',
  'tool-070-oxidative-stress-calculator': 'medical-monitoring',
  'tool-071-antioxidant-manager': 'medical-monitoring',
  'tool-072-systemic-inflammation-calculator': 'medical-monitoring',
  'tool-073-immune-system-optimizer': 'medical-monitoring',
  'tool-074-blood-pressure-tracker': 'medical-monitoring',
  'tool-075-arterial-health-manager': 'medical-monitoring',
  'tool-076-blood-viscosity-calculator': 'medical-monitoring',
  'tool-077-nitric-oxide-optimizer': 'medical-monitoring',
  'tool-078-endothelial-health-manager': 'medical-monitoring',
  'tool-079-fat-metabolism-calculator': 'body-composition',
  'tool-080-mitochondrial-optimizer': 'medical-monitoring',
  'tool-081-cellular-aging-calculator': 'medical-monitoring',
  'tool-082-telomere-manager': 'medical-monitoring',
  'tool-083-anti-aging-inflammation-calculator': 'medical-monitoring',
  'tool-084-cognitive-enhancer': 'medical-monitoring',
  'tool-085-sleep-quality-manager': 'medical-monitoring',
  'tool-086-cortisol-stress-calculator': 'hormonal-health',
  'tool-087-mood-optimizer': 'medical-monitoring',
  'tool-088-dopamine-tracker': 'medical-monitoring',
  'tool-089-serotonin-manager': 'medical-monitoring',
  'tool-090-female-hormone-balance-calculator': 'hormonal-health',
  'tool-091-female-health-optimizer': 'hormonal-health',
  'tool-092-female-dosage-calculator': 'hormonal-health',
  'tool-093-menstrual-cycle-manager': 'reproductive-wellbeing',
  'tool-094-pregnancy-risk-calculator': 'reproductive-wellbeing',
  'tool-095-skin-health-optimizer': 'medical-monitoring',
  'tool-096-hair-nail-tracker': 'medical-monitoring',
  'tool-097-hydration-balance-calculator': 'nutrition',
  'tool-098-sodium-potassium-manager': 'nutrition',
  'tool-099-digestive-health-optimizer': 'nutrition',
  'tool-100-comprehensive-report-generator': 'platform-ai',
  'tool-101-sarm-to-aas-transition-bridge-predictor': 'cycle-management',
  'tool-102-subcutaneous-vs-intramuscular-pk-modeler': 'pharmacokinetics',
  'tool-103-renal-function-hydration-index': 'medical-monitoring',
  'tool-104-thyroid-metabolic-rate-dynamics': 'hormonal-health',
  'tool-105-ai-health-data-fusion-hub': 'platform-ai',
  'tool-106-glycogen-supercompensation-water-modeler': 'nutrition',
  'tool-107-contest-prep-peak-week-manipulator': 'cycle-management',
  'tool-108-ai-body-composition-vision-engine': 'body-composition',
  'tool-109-competition-readiness-posing-os': 'cycle-management',
  'tool-110-ai-meal-vision-scanner': 'nutrition',
  'tool-111-smart-food-macro-substitution-engine': 'nutrition',
  'tool-112-food-quality-micronutrient-diversity-score': 'nutrition',
  'tool-113-ai-grocery-basket-meal-cost-optimizer': 'nutrition',
  'tool-114-restaurant-macro-navigator': 'nutrition',
  'tool-115-supplement-evidence-bio-stack-navigator': 'nutrition',
  'tool-116-nutrition-gap-fasting-window-optimizer': 'nutrition',
  'tool-117-intra-workout-nutrient-volumizer': 'nutrition',
  'tool-118-cns-recovery-score': 'training-recovery',
  'tool-119-training-volume-hypertrophy-index': 'training-recovery',
  'tool-120-progressive-overload-predictor': 'training-recovery',
  'tool-121-muscle-group-recovery-modeler': 'training-recovery',
  'tool-122-rpe-rir-1rm-velocity-modeler': 'training-recovery',
  'tool-123-joint-stress-connective-tissue-index': 'training-recovery',
  'tool-124-deload-frequency-fatigue-modeler': 'training-recovery',
  'tool-125-fiber-type-mechanical-tension-score': 'training-recovery',
  'tool-126-neuromuscular-explosiveness-modeler': 'training-recovery',
  'tool-127-ai-daily-readiness-explainer': 'training-recovery',
  'tool-128-training-load-acute-chronic-ratio': 'training-recovery',
  'tool-129-ai-adaptive-training-planner': 'training-recovery',
  'tool-130-ai-plateau-detective': 'training-recovery',
  'tool-131-transformation-forecast-trajectory-engine': 'body-composition',
  'tool-132-ai-pose-form-coach': 'training-recovery',
  'tool-133-rep-tempo-velocity-loss-analyzer': 'training-recovery',
  'tool-134-mobility-movement-symmetry-screen': 'training-recovery',
  'tool-135-exercise-substitution-ai': 'training-recovery',
  'tool-136-physique-golden-ratio-score': 'body-composition',
  'tool-137-peptide-hormone-reconstitution-calculator': 'injection-formulation',
  'tool-138-raw-powder-density-oil-formulation-engine': 'injection-formulation',
  'tool-139-solvent-emulsifier-ratio-calculator': 'injection-formulation',
  'tool-140-dosage-unit-conversion-engine': 'pharmacokinetics',
  'tool-141-carrier-oil-viscosity-syringe-pressure': 'injection-formulation',
  'tool-142-compound-purity-active-yield-estimator': 'injection-formulation',
  'tool-143-storage-stability-thermal-degradation-estimator': 'injection-formulation',
  'tool-144-homebrew-chemistry-calculator': 'injection-formulation',
  'tool-145-habit-intelligence-consistency-coach': 'platform-ai',
  'tool-146-ai-safety-gate-emergency-protocol': 'platform-ai',
  'tool-147-scientific-evidence-explorer': 'platform-ai',
  'tool-148-personal-fitness-memory-layer': 'platform-ai',
  'tool-149-physique-trajectory-simulator': 'body-composition',
  'tool-150-ai-performance-command-center': 'platform-ai',

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

/** Published (non-'planned') tools of a category — used by user-facing
 * generators (category page, sitemap) so planned roadmap entries never leak. */
export function getPublishedToolsByCategory(category: SmartToolCategory): SmartToolEntry[] {
  return getPublishedCatalogTools().filter((t) => TOOL_CATEGORY[t.slug] === category);
}

/** URL canonique hiérarchique : /smarttools/<category>/<tool-slug> (ou null). */export function toHierarchicalHref(slugOrHref: string): string | null {
  const slug = slugOrHref.replace(/^\/smarttools\//, '').replace(/^\//, '');
  const cat = TOOL_CATEGORY[slug];
  return cat ? `/smarttools/${cat}/${slug}` : null;
}

export function isCategory(slug: string): slug is SmartToolCategory {
  return (SMART_TOOL_CATEGORY_SLUGS as readonly string[]).includes(slug);
}
