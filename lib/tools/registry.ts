/**
 * lib/tools/registry.ts
 * Registry for 30 Smart Tools
 */
import { Page } from '@/shared/types/types';
import {
    ACCESS_TIERS,
    ToolContractError,
    createToolOutput,
    type AccessTier,
    type SeoLinks,
    type ToolLink,
    type ToolOutput,
    type ToolOutputParams,
} from './contracts';

export type StackStatus = 'legacy' | 'layered';

export interface ToolDefinition {
    toolId: string;
    slug: string;
    version: string;
    page: Page;
    href: string;
    titleAr: string;
    titleEn: string;
    accessTier: AccessTier;
    order: number;
    stackStatus: StackStatus;
}

export const TOOL_REGISTRY: readonly ToolDefinition[] = [
{ toolId: 'mrx.tool.macro', slug: 'macro', version: '1.0.0', page: Page.MACRO, href: '/macro', titleAr: 'حاسبة الماكروز المتقدمة', titleEn: 'Advanced Macro Calculator', accessTier: 'free', order: 10, stackStatus: 'legacy' },
  { toolId: 'mrx.tool.bodyfat', slug: 'bodyfat', version: '1.0.0', page: Page.BODYFAT, href: '/bodyfat', titleAr: 'حاسبة نسبة الدهون', titleEn: 'Body Fat Calculator', accessTier: 'free', order: 20, stackStatus: 'legacy' },
  { toolId: 'mrx.tool.injection', slug: 'injection', version: '1.0.0', page: Page.INJECTION, href: '/injection', titleAr: 'خريطة الحقن التفاعلية', titleEn: 'Interactive Injection Map', accessTier: 'free', order: 30, stackStatus: 'legacy' },
  { toolId: 'mrx.tool.halflife', slug: 'halflife', version: '1.0.0', page: Page.HALFLIFE, href: '/halflife', titleAr: 'محاكي نصف العمر', titleEn: 'Half-Life Simulator', accessTier: 'free', order: 40, stackStatus: 'legacy' },
  { toolId: 'mrx.tool.lab', slug: 'lab', version: '1.0.0', page: Page.LAB, href: '/lab', titleAr: 'المرجع الذكي للتحاليل', titleEn: 'Smart Lab Reference', accessTier: 'free', order: 50, stackStatus: 'legacy' },
  { toolId: 'mrx.tool.genetic', slug: 'genetic', version: '1.0.0', page: Page.GENETIC, href: '/genetic', titleAr: 'حاسبة الإمكانات الوراثية', titleEn: 'Genetic Potential Calculator', accessTier: 'free', order: 60, stackStatus: 'legacy' },
  { toolId: 'mrx.tool.cycle', slug: 'cycle', version: '1.0.0', page: Page.CYCLE_ARCHITECT, href: '/cycle', titleAr: 'مهندس الدورة', titleEn: 'Cycle Architect', accessTier: 'premium', order: 70, stackStatus: 'legacy' },
  { toolId: 'mrx.tool.timeline', slug: 'timeline', version: '1.0.0', page: Page.TIMELINE, href: '/smarttools/timeline', titleAr: 'الجدول الزمني للتحول', titleEn: 'Transformation Timeline', accessTier: 'free', order: 80, stackStatus: 'layered' },
  { toolId: 'mrx.tool.master-calculator', slug: 'master-calculator', version: '1.0.0', page: Page.MASTER_CALCULATOR, href: '/master-calculator', titleAr: 'الحاسبة الشاملة', titleEn: 'Master Calculator', accessTier: 'free', order: 90, stackStatus: 'legacy' },
  { toolId: 'mrx.tool.multi-ester-pharmacokinetics', slug: 'multi-ester-pharmacokinetics', version: '1.0.0', page: Page.MULTI_ESTER_PK, href: '/smarttools/multi-ester-pharmacokinetics', titleAr: 'محاكي تراكم الإسترات', titleEn: 'Multi-Ester PK Simulator', accessTier: 'premium', order: 45, stackStatus: 'layered' },
  { toolId: 'mrx.tool.hpta-recovery', slug: 'hpta-recovery', version: '1.0.0', page: Page.HPTA_RECOVERY, href: '/smarttools/hpta-recovery', titleAr: 'محاكي التثبيط المحوري واستعادة HPTA', titleEn: 'HPTA Suppression & Recovery Modeler', accessTier: 'free', order: 46, stackStatus: 'layered' },
  { toolId: 'mrx.tool.aromatization-risk', slug: 'aromatization-risk', version: '1.0.0', page: Page.AROMATIZATION_RISK, href: '/smarttools/aromatization-risk', titleAr: 'محاكي مخاطر الأروماتزة والاستراديول', titleEn: 'Aromatization Risk & E2 Management Modeler', accessTier: 'free', order: 45.5, stackStatus: 'layered' },
  { toolId: 'mrx.tool.pct-timing', slug: 'pct-timing', version: '1.0.0', page: Page.PCT_TIMING, href: '/smarttools/pct-timing', titleAr: 'محرك توقيت PCT والتطهير', titleEn: 'PCT Timing & Compound Washout Engine', accessTier: 'free', order: 47, stackStatus: 'layered' },
  { toolId: 'mrx.tool.hcg-serm-protocol', slug: 'hcg-serm-protocol', version: '1.0.0', page: Page.HCG_SERM_PROTOCOL, href: '/smarttools/hcg-serm-protocol', titleAr: 'بروتوكول HCG وSERM', titleEn: 'HCG & SERM Protocol', accessTier: 'free', order: 140, stackStatus: 'layered' },
  { toolId: 'mrx.tool.006-estrogen-prolactin', slug: 'tool-006-estrogen-prolactin', version: '1.0.0', page: Page.ESTROGEN_PROLACTIN, href: '/smarttools/tool-006-estrogen-prolactin', titleAr: 'التحكم في الإستروجين والبرولاكتين', titleEn: 'Estrogen & Prolactin Control', accessTier: 'free', order: 200, stackStatus: 'layered' },
  { toolId: 'mrx.tool.007-bloodwork-analyzer', slug: 'tool-007-bloodwork-analyzer', version: '1.0.0', page: Page.BLOODWORK_ANALYZER, href: '/smarttools/tool-007-bloodwork-analyzer', titleAr: 'محلل الفحوصات', titleEn: 'Bloodwork Analyzer', accessTier: 'free', order: 210, stackStatus: 'layered' },
  { toolId: 'mrx.tool.008-side-effect-tracker', slug: 'tool-008-side-effect-tracker', version: '1.0.0', page: Page.SIDE_EFFECT_TRACKER, href: '/smarttools/tool-008-side-effect-tracker', titleAr: 'متتبع الآثار الجانبية', titleEn: 'Side Effect Tracker', accessTier: 'free', order: 220, stackStatus: 'layered' },
  { toolId: 'mrx.tool.009-injection-site-rotator', slug: 'tool-009-injection-site-rotator', version: '1.0.0', page: Page.INJECTION_SITE_ROTATOR, href: '/smarttools/tool-009-injection-site-rotator', titleAr: 'مدور مواقع الحقن', titleEn: 'Injection Site Rotator', accessTier: 'free', order: 230, stackStatus: 'layered' },
  { toolId: 'mrx.tool.010-compound-stack-builder', slug: 'tool-010-compound-stack-builder', version: '1.0.0', page: Page.COMPOUND_STACK_BUILDER, href: '/smarttools/tool-010-compound-stack-builder', titleAr: 'بناء حزمة المركبات', titleEn: 'Compound Stack Builder', accessTier: 'free', order: 240, stackStatus: 'layered' },
  { toolId: 'mrx.tool.011-progress-tracker', slug: 'tool-011-progress-tracker', version: '1.0.0', page: Page.PROGRESS_TRACKER, href: '/smarttools/tool-011-progress-tracker', titleAr: 'متتبع التقدم', titleEn: 'Progress Tracker', accessTier: 'free', order: 250, stackStatus: 'layered' },
  { toolId: 'mrx.tool.012-calorie-adjuster', slug: 'tool-012-calorie-adjuster', version: '1.0.0', page: Page.CALORIE_ADJUSTER, href: '/smarttools/tool-012-calorie-adjuster', titleAr: 'معدل السعرات', titleEn: 'Calorie Adjuster', accessTier: 'free', order: 260, stackStatus: 'layered' },
  { toolId: 'mrx.tool.013-macro-optimizer', slug: 'tool-013-macro-optimizer', version: '1.0.0', page: Page.MACRO_OPTIMIZER, href: '/smarttools/tool-013-macro-optimizer', titleAr: 'محسن الماكروز', titleEn: 'Macro Optimizer', accessTier: 'free', order: 270, stackStatus: 'layered' },
  { toolId: 'mrx.tool.014-water-retention', slug: 'tool-014-water-retention', version: '1.0.0', page: Page.WATER_RETENTION, href: '/smarttools/tool-014-water-retention', titleAr: 'مقيم احتباس الماء', titleEn: 'Water Retention Assessor', accessTier: 'free', order: 280, stackStatus: 'layered' },
  { toolId: 'mrx.tool.015-shbg-modulator', slug: 'tool-015-shbg-modulator', version: '1.0.0', page: Page.SHBG_MODULATOR, href: '/smarttools/tool-015-shbg-modulator', titleAr: 'منظم SHBG', titleEn: 'SHBG Modulator', accessTier: 'free', order: 290, stackStatus: 'layered' },
{ toolId: 'mrx.tool.016-half-life-calculator', slug: 'tool-016-half-life-calculator', version: '1.0.0', page: Page.HALF_LIFE_CALCULATOR, href: '/smarttools/tool-016-half-life-calculator', titleAr: 'حاسبة نصف العمر', titleEn: 'Half-Life Calculator', accessTier: 'free', order: 300, stackStatus: 'layered' },
  { toolId: 'mrx.tool.017-drug-interaction', slug: 'tool-017-drug-interaction', version: '1.0.0', page: Page.DRUG_INTERACTION, href: '/smarttools/tool-017-drug-interaction', titleAr: 'فاحص تفاعلات المركبات', titleEn: 'Drug Interaction Checker', accessTier: 'free', order: 320, stackStatus: 'layered' },
  { toolId: 'mrx.tool.018-hpta-recovery', slug: 'tool-018-hpta-recovery', version: '1.0.0', page: Page.HPTA_RECOVERY_MONITOR, href: '/smarttools/tool-018-hpta-recovery', titleAr: 'مراقب استعادة HPTA', titleEn: 'HPTA Recovery Monitor', accessTier: 'free', order: 340, stackStatus: 'layered' },
  { toolId: 'mrx.tool.019-cardio-monitor', slug: 'tool-019-cardio-monitor', version: '1.0.0', page: Page.CARDIO_MONITOR, href: '/smarttools/tool-019-cardio-monitor', titleAr: 'مراقب القلب والدهون', titleEn: 'Cardio Monitor', accessTier: 'free', order: 350, stackStatus: 'layered' },
  { toolId: 'mrx.tool.020-genetic-potential', slug: 'tool-020-genetic-potential', version: '1.0.0', page: Page.GENETIC_POTENTIAL, href: '/smarttools/tool-020-genetic-potential', titleAr: 'حاسبة القدرة الوراثية', titleEn: 'Genetic Potential Calculator', accessTier: 'free', order: 360, stackStatus: 'layered' },
  { toolId: 'mrx.tool.021-peptide-protocol', slug: 'tool-021-peptide-protocol', version: '1.0.0', page: Page.PEPTIDE_PROTOCOL, href: '/smarttools/tool-021-peptide-protocol', titleAr: 'مخطط بروتوكول الببتيد', titleEn: 'Peptide Protocol Planner', accessTier: 'free', order: 370, stackStatus: 'layered' },
  { toolId: 'mrx.tool.022-half-life-stacker', slug: 'tool-022-half-life-stacker', version: '1.0.0', page: Page.HALF_LIFE_STACKER, href: '/smarttools/tool-022-half-life-stacker', titleAr: 'مركب نصف العمر', titleEn: 'Half-Life Stacker', accessTier: 'free', order: 380, stackStatus: 'layered' },
  { toolId: 'mrx.tool.023-trt-optimization', slug: 'tool-023-trt-optimization', version: '1.0.0', page: Page.TRT_OPTIMIZATION, href: '/smarttools/tool-023-trt-optimization', titleAr: 'تحسين TRT', titleEn: 'TRT Optimization', accessTier: 'free', order: 390, stackStatus: 'layered' },
  { toolId: 'mrx.tool.024-bloodwork-interpreter', slug: 'tool-024-bloodwork-interpreter', version: '1.0.0', page: Page.BLOODWORK_INTERPRETER, href: '/smarttools/tool-024-bloodwork-interpreter', titleAr: 'مفسر الفحوصات', titleEn: 'Bloodwork Interpreter', accessTier: 'free', order: 400, stackStatus: 'layered' },
  { toolId: 'mrx.tool.025-drug-interaction-pro', slug: 'tool-025-drug-interaction-pro', version: '1.0.0', page: Page.DRUG_INTERACTION_PRO, href: '/smarttools/tool-025-drug-interaction-pro', titleAr: 'فاحص التفاعلات الاحترافي', titleEn: 'Drug Interaction Pro', accessTier: 'free', order: 410, stackStatus: 'layered' },
  { toolId: 'mrx.tool.026-injection-pain', slug: 'tool-026-injection-pain', version: '1.0.0', page: Page.INJECTION_PAIN, href: '/smarttools/tool-026-injection-pain', titleAr: 'مقلل ألم الحقن', titleEn: 'Injection Pain Minimizer', accessTier: 'free', order: 420, stackStatus: 'layered' },
  { toolId: 'mrx.tool.027-ester-conversion', slug: 'tool-027-ester-conversion', version: '1.0.0', page: Page.ESTER_CONVERSION, href: '/smarttools/tool-027-ester-conversion', titleAr: 'تحويل الإستر', titleEn: 'Ester Conversion', accessTier: 'free', order: 430, stackStatus: 'layered' },
  { toolId: 'mrx.tool.028-stacking-synergy', slug: 'tool-028-stacking-synergy', version: '1.0.0', page: Page.STACKING_SYNERGY, href: '/smarttools/tool-028-stacking-synergy', titleAr: 'تآزر الحزم', titleEn: 'Stacking Synergy', accessTier: 'free', order: 440, stackStatus: 'layered' },
  { toolId: 'mrx.tool.029-side-effect-early-warning', slug: 'tool-029-side-effect-early-warning', version: '1.0.0', page: Page.SIDE_EFFECT_EARLY_WARNING, href: '/smarttools/tool-029-side-effect-early-warning', titleAr: 'الإنذار المبكر', titleEn: 'Side Effect Early Warning', accessTier: 'free', order: 450, stackStatus: 'layered' },
  { toolId: 'mrx.tool.030-cycle-cost-calculator', slug: 'tool-030-cycle-cost-calculator', version: '1.0.0', page: Page.CYCLE_COST_CALCULATOR, href: '/smarttools/tool-030-cycle-cost-calculator', titleAr: 'حاسبة تكلفة الدورة', titleEn: 'Cycle Cost Calculator', accessTier: 'free', order: 460, stackStatus: 'layered' },
  { toolId: 'mrx.tool.031-cycle-length-optimizer', slug: 'tool-031-cycle-length-optimizer', version: '1.0.0', page: Page.CYCLE_LENGTH_OPTIMIZER, href: '/smarttools/tool-031-cycle-length-optimizer', titleAr: 'محسّن مدة الدورة', titleEn: 'Cycle Length Optimizer', accessTier: 'free', order: 470, stackStatus: 'layered' },
  { toolId: 'mrx.tool.032-advanced-pct-planner', slug: 'tool-032-advanced-pct-planner', version: '1.0.0', page: Page.ADVANCED_PCT_PLANNER, href: '/smarttools/tool-032-advanced-pct-planner', titleAr: 'مخطط PCT المتقدم', titleEn: 'Advanced PCT Planner', accessTier: 'free', order: 480, stackStatus: 'layered' },
  { toolId: 'mrx.tool.033-bloodwork-trend-analyzer', slug: 'tool-033-bloodwork-trend-analyzer', version: '1.0.0', page: Page.BLOODWORK_TREND_ANALYZER, href: '/smarttools/tool-033-bloodwork-trend-analyzer', titleAr: 'محلل اتجاهات التحاليل', titleEn: 'Bloodwork Trend Analyzer', accessTier: 'free', order: 490, stackStatus: 'layered' },
  { toolId: 'mrx.tool.034-compound-clearance', slug: 'tool-034-compound-clearance', version: '1.0.0', page: Page.COMPOUND_CLEARANCE, href: '/smarttools/tool-034-compound-clearance', titleAr: 'حاسبة تصفية المركبات', titleEn: 'Compound Clearance Calculator', accessTier: 'free', order: 500, stackStatus: 'layered' },
  { toolId: 'mrx.tool.036-injection-schedule', slug: 'tool-036-injection-schedule', version: '1.0.0', page: Page.INJECTION_SCHEDULE, href: '/smarttools/tool-036-injection-schedule', titleAr: 'مخطط جدول الحقن', titleEn: 'Injection Schedule Planner', accessTier: 'free', order: 520, stackStatus: 'layered' },
  { toolId: 'mrx.tool.037-side-effect-probability', slug: 'tool-037-side-effect-probability', version: '1.0.0', page: Page.SIDE_EFFECT_PROBABILITY, href: '/smarttools/tool-037-side-effect-probability', titleAr: 'حاسبة احتمالية الأعراض', titleEn: 'Side Effect Probability Calculator', accessTier: 'free', order: 530, stackStatus: 'layered' },
  { toolId: 'mrx.tool.038-stack-compatibility', slug: 'tool-038-stack-compatibility', version: '1.0.0', page: Page.STACK_COMPATIBILITY, href: '/smarttools/tool-038-stack-compatibility', titleAr: 'مدقق توافق الستاك', titleEn: 'Stack Compatibility Checker', accessTier: 'free', order: 540, stackStatus: 'layered' },
  { toolId: 'mrx.tool.039-liver-enzyme-tracker', slug: 'tool-039-liver-enzyme-tracker', version: '1.0.0', page: Page.LIVER_ENZYME_TRACKER, href: '/smarttools/tool-039-liver-enzyme-tracker', titleAr: 'متتبع إنزيمات الكبد', titleEn: 'Liver Enzyme Tracker', accessTier: 'free', order: 550, stackStatus: 'layered' },
  { toolId: 'mrx.tool.040-lipid-profile-optimizer', slug: 'tool-040-lipid-profile-optimizer', version: '1.0.0', page: Page.LIPID_PROFILE_OPTIMIZER, href: '/smarttools/tool-040-lipid-profile-optimizer', titleAr: 'محسّن ملف الدهون', titleEn: 'Lipid Profile Optimizer', accessTier: 'free', order: 560, stackStatus: 'layered' },
  { toolId: 'mrx.tool.035-hormone-conversion', slug: 'tool-035-hormone-conversion', version: '1.0.0', page: Page.HORMONE_CONVERSION, href: '/smarttools/tool-035-hormone-conversion', titleAr: 'حاسبة تحويل الهرمونات', titleEn: 'Hormone Conversion Calculator', accessTier: 'free', order: 510, stackStatus: 'layered' },
  { toolId: 'mrx.tool.041-hematocrit-monitor', slug: 'tool-041-hematocrit-monitor', version: '1.0.0', page: Page.HEMATOCRIT_MONITOR, href: '/smarttools/tool-041-hematocrit-monitor', titleAr: 'متتبع الهيماتوكريت', titleEn: 'Hematocrit Monitor', accessTier: 'free', order: 570, stackStatus: 'layered' },
  { toolId: 'mrx.tool.042-estrogen-management', slug: 'tool-042-estrogen-management', version: '1.0.0', page: Page.ESTROGEN_MANAGEMENT, href: '/smarttools/tool-042-estrogen-management', titleAr: 'إدارة الإستروجين الاحترافية', titleEn: 'Estrogen Management Pro', accessTier: 'free', order: 580, stackStatus: 'layered' },
  { toolId: 'mrx.tool.043-prolactin-management', slug: 'tool-043-prolactin-management', version: '1.0.0', page: Page.PROLACTIN_MANAGEMENT, href: '/smarttools/tool-043-prolactin-management', titleAr: 'إدارة البرولاكتين', titleEn: 'Prolactin Management Pro', accessTier: 'free', order: 590, stackStatus: 'layered' },
  { toolId: 'mrx.tool.044-dht-side-effects', slug: 'tool-044-dht-side-effects', version: '1.0.0', page: Page.DHT_SIDE_EFFECTS, href: '/smarttools/tool-044-dht-side-effects', titleAr: 'متنبئ آثار DHT', titleEn: 'DHT Side Effect Predictor', accessTier: 'free', order: 600, stackStatus: 'layered' },
  { toolId: 'mrx.tool.045-cycle-break-planner', slug: 'tool-045-cycle-break-planner', version: '1.0.0', page: Page.CYCLE_BREAK_PLANNER, href: '/smarttools/tool-045-cycle-break-planner', titleAr: 'مخطط فترة الراحة بين الدورات', titleEn: 'Cycle Break Planner', accessTier: 'free', order: 610, stackStatus: 'layered' },
  { toolId: 'mrx.tool.046-trt-lifetime', slug: 'tool-046-trt-lifetime', version: '1.0.0', page: Page.TRT_LIFETIME, href: '/smarttools/tool-046-trt-lifetime', titleAr: 'حاسبة عمر TRT', titleEn: 'TRT Lifetime Calculator', accessTier: 'free', order: 620, stackStatus: 'layered' },
  { toolId: 'mrx.tool.047-fertility-preservation', slug: 'tool-047-fertility-preservation', version: '1.0.0', page: Page.FERTILITY_PRESERVATION, href: '/smarttools/tool-047-fertility-preservation', titleAr: 'دليل الحفاظ على الخصوبة', titleEn: 'Fertility Preservation Guide', accessTier: 'free', order: 630, stackStatus: 'layered' },
  { toolId: 'mrx.tool.048-cardiovascular-risk', slug: 'tool-048-cardiovascular-risk', version: '1.0.0', page: Page.CARDIOVASCULAR_RISK, href: '/smarttools/tool-048-cardiovascular-risk', titleAr: 'مقيّم خطر القلب', titleEn: 'Cardiovascular Risk Assessor', accessTier: 'free', order: 640, stackStatus: 'layered' },
  { toolId: 'mrx.tool.049-bone-density', slug: 'tool-049-bone-density', version: '1.0.0', page: Page.BONE_DENSITY, href: '/smarttools/tool-049-bone-density', titleAr: 'محسّن كثافة العظام', titleEn: 'Bone Density Optimizer', accessTier: 'free', order: 650, stackStatus: 'layered' },
  { toolId: 'mrx.tool.050-mental-health', slug: 'tool-050-mental-health', version: '1.0.0', page: Page.MENTAL_HEALTH, href: '/smarttools/tool-050-mental-health', titleAr: 'مراقب الصحة النفسية', titleEn: 'Mental Health Monitor', accessTier: 'free', order: 660, stackStatus: 'layered' },
  { toolId: 'mrx.tool.051-peptide-dosage-calculator', slug: 'tool-051-peptide-dosage-calculator', version: '1.0.0', page: Page.PEPTIDE_DOSAGE_CALCULATOR, href: '/smarttools/tool-051-peptide-dosage-calculator', titleAr: 'حاسبة جرعة الببتيدات', titleEn: 'Peptide Dosage Calculator', accessTier: 'free', order: 670, stackStatus: 'layered' },
  { toolId: 'mrx.tool.052-growth-hormone-protocol-planner', slug: 'tool-052-growth-hormone-protocol-planner', version: '1.0.0', page: Page.GROWTH_HORMONE_PROTOCOL_PLANNER, href: '/smarttools/tool-052-growth-hormone-protocol-planner', titleAr: 'مخطط بروتوكول GH', titleEn: 'Growth Hormone Protocol Planner', accessTier: 'free', order: 680, stackStatus: 'layered' },
  { toolId: 'mrx.tool.053-insulin-conversion-calculator', slug: 'tool-053-insulin-conversion-calculator', version: '1.0.0', page: Page.INSULIN_CONVERSION_CALCULATOR, href: '/smarttools/tool-053-insulin-conversion-calculator', titleAr: 'حاسبة تحويل الأنسولين', titleEn: 'Insulin Conversion Calculator', accessTier: 'free', order: 690, stackStatus: 'layered' },
  { toolId: 'mrx.tool.054-glucose-tracker', slug: 'tool-054-glucose-tracker', version: '1.0.0', page: Page.GLUCOSE_TRACKER, href: '/smarttools/tool-054-glucose-tracker', titleAr: 'متتبع الجلوكوز', titleEn: 'Glucose Tracker', accessTier: 'free', order: 700, stackStatus: 'layered' },
  { toolId: 'mrx.tool.055-insulin-sensitivity-optimizer', slug: 'tool-055-insulin-sensitivity-optimizer', version: '1.0.0', page: Page.INSULIN_SENSITIVITY_OPTIMIZER, href: '/smarttools/tool-055-insulin-sensitivity-optimizer', titleAr: 'محسّن حساسية الأنسولين', titleEn: 'Insulin Sensitivity Optimizer', accessTier: 'free', order: 710, stackStatus: 'layered' },
  { toolId: 'mrx.tool.056-mini-pct-calculator', slug: 'tool-056-mini-pct-calculator', version: '1.0.0', page: Page.MINI_PCT_CALCULATOR, href: '/smarttools/tool-056-mini-pct-calculator', titleAr: 'حاسبة الـ PCT المصغّرة', titleEn: 'Mini PCT Calculator', accessTier: 'free', order: 720, stackStatus: 'layered' },
  { toolId: 'mrx.tool.057-free-testosterone-manager', slug: 'tool-057-free-testosterone-manager', version: '1.0.0', page: Page.FREE_TESTOSTERONE_MANAGER, href: '/smarttools/tool-057-free-testosterone-manager', titleAr: 'مدير التستوستيرون الحر', titleEn: 'Free Testosterone Manager', accessTier: 'free', order: 730, stackStatus: 'layered' },
  { toolId: 'mrx.tool.058-androgenic-balance-calculator', slug: 'tool-058-androgenic-balance-calculator', version: '1.0.0', page: Page.ANDROGENIC_BALANCE_CALCULATOR, href: '/smarttools/tool-058-androgenic-balance-calculator', titleAr: 'حاسبة التوازن الأندروجيني', titleEn: 'Androgenic Balance Calculator', accessTier: 'free', order: 740, stackStatus: 'layered' },
  { toolId: 'mrx.tool.059-androgen-receptor-optimizer', slug: 'tool-059-androgen-receptor-optimizer', version: '1.0.0', page: Page.ANDROGEN_RECEPTOR_OPTIMIZER, href: '/smarttools/tool-059-androgen-receptor-optimizer', titleAr: 'محسّن مستقبلات الأندروجين', titleEn: 'Androgen Receptor Optimizer', accessTier: 'free', order: 750, stackStatus: 'layered' },
  { toolId: 'mrx.tool.060-5-alpha-conversion-calculator', slug: 'tool-060-5-alpha-conversion-calculator', version: '1.0.0', page: Page.FIVE_ALPHA_CONVERSION_CALCULATOR, href: '/smarttools/tool-060-5-alpha-conversion-calculator', titleAr: 'حاسبة التحويل 5-ألفا', titleEn: '5-Alpha Conversion Calculator', accessTier: 'free', order: 760, stackStatus: 'layered' },
  { toolId: 'mrx.tool.061-hair-loss-tracker', slug: 'tool-061-hair-loss-tracker', version: '1.0.0', page: Page.HAIR_LOSS_TRACKER, href: '/smarttools/tool-061-hair-loss-tracker', titleAr: 'متتبع تساقط الشعر', titleEn: 'Hair Loss Tracker', accessTier: 'free', order: 770, stackStatus: 'layered' },
  { toolId: 'mrx.tool.062-prostate-health-manager', slug: 'tool-062-prostate-health-manager', version: '1.0.0', page: Page.PROSTATE_HEALTH_MANAGER, href: '/smarttools/tool-062-prostate-health-manager', titleAr: 'مدير صحة البروستاتا', titleEn: 'Prostate Health Manager', accessTier: 'free', order: 780, stackStatus: 'layered' },
  { toolId: 'mrx.tool.063-testicular-suppression-calculator', slug: 'tool-063-testicular-suppression-calculator', version: '1.0.0', page: Page.TESTICULAR_SUPPRESSION_CALCULATOR, href: '/smarttools/tool-063-testicular-suppression-calculator', titleAr: 'حاسبة قمع الخصية', titleEn: 'Testicular Suppression Calculator', accessTier: 'free', order: 790, stackStatus: 'layered' },
  { toolId: 'mrx.tool.064-sperm-production-optimizer', slug: 'tool-064-sperm-production-optimizer', version: '1.0.0', page: Page.SPERM_PRODUCTION_OPTIMIZER, href: '/smarttools/tool-064-sperm-production-optimizer', titleAr: 'محسّن إنتاج الحيوانات المنوية', titleEn: 'Sperm Production Optimizer', accessTier: 'free', order: 800, stackStatus: 'layered' },
  { toolId: 'mrx.tool.065-aromatase-conversion-calculator', slug: 'tool-065-aromatase-conversion-calculator', version: '1.0.0', page: Page.AROMATASE_CONVERSION_CALCULATOR, href: '/smarttools/tool-065-aromatase-conversion-calculator', titleAr: 'حاسبة التحويل الأروماتي', titleEn: 'Aromatase Conversion Calculator', accessTier: 'free', order: 810, stackStatus: 'layered' },
  { toolId: 'mrx.tool.066-estrogen-sensitivity-manager', slug: 'tool-066-estrogen-sensitivity-manager', version: '1.0.0', page: Page.ESTROGEN_SENSITIVITY_MANAGER, href: '/smarttools/tool-066-estrogen-sensitivity-manager', titleAr: 'مدير حساسية الإستروجين', titleEn: 'Estrogen Sensitivity Manager', accessTier: 'free', order: 820, stackStatus: 'layered' },
  { toolId: 'mrx.tool.067-estrogen-balance-calculator', slug: 'tool-067-estrogen-balance-calculator', version: '1.0.0', page: Page.ESTROGEN_BALANCE_CALCULATOR, href: '/smarttools/tool-067-estrogen-balance-calculator', titleAr: 'حاسبة التوازن الإستروجيني', titleEn: 'Estrogen Balance Calculator', accessTier: 'free', order: 830, stackStatus: 'layered' },
  { toolId: 'mrx.tool.068-gynecomastia-tracker', slug: 'tool-068-gynecomastia-tracker', version: '1.0.0', page: Page.GYNECOMASTIA_TRACKER, href: '/smarttools/tool-068-gynecomastia-tracker', titleAr: 'متتبع التثدي', titleEn: 'Gynecomastia Tracker', accessTier: 'free', order: 840, stackStatus: 'layered' },
  { toolId: 'mrx.tool.069-detoxification-optimizer', slug: 'tool-069-detoxification-optimizer', version: '1.0.0', page: Page.DETOXIFICATION_OPTIMIZER, href: '/smarttools/tool-069-detoxification-optimizer', titleAr: 'محسّن إزالة السموم', titleEn: 'Detoxification Optimizer', accessTier: 'free', order: 850, stackStatus: 'layered' },
  { toolId: 'mrx.tool.070-oxidative-stress-calculator', slug: 'tool-070-oxidative-stress-calculator', version: '1.0.0', page: Page.OXIDATIVE_STRESS_CALCULATOR, href: '/smarttools/tool-070-oxidative-stress-calculator', titleAr: 'حاسبة الإجهاد التأكسدي', titleEn: 'Oxidative Stress Calculator', accessTier: 'free', order: 860, stackStatus: 'layered' },
  { toolId: 'mrx.tool.071-antioxidant-manager', slug: 'tool-071-antioxidant-manager', version: '1.0.0', page: Page.ANTIOXIDANT_MANAGER, href: '/smarttools/tool-071-antioxidant-manager', titleAr: 'مدير مضادات الأكسدة', titleEn: 'Antioxidant Manager', accessTier: 'free', order: 870, stackStatus: 'layered' },
  { toolId: 'mrx.tool.072-systemic-inflammation-calculator', slug: 'tool-072-systemic-inflammation-calculator', version: '1.0.0', page: Page.SYSTEMIC_INFLAMMATION_CALCULATOR, href: '/smarttools/tool-072-systemic-inflammation-calculator', titleAr: 'حاسبة الالتهاب الجهازي', titleEn: 'Systemic Inflammation Calculator', accessTier: 'free', order: 880, stackStatus: 'layered' },
  { toolId: 'mrx.tool.073-immune-system-optimizer', slug: 'tool-073-immune-system-optimizer', version: '1.0.0', page: Page.IMMUNE_SYSTEM_OPTIMIZER, href: '/smarttools/tool-073-immune-system-optimizer', titleAr: 'محسّن المناعة', titleEn: 'Immune System Optimizer', accessTier: 'free', order: 890, stackStatus: 'layered' },
  { toolId: 'mrx.tool.074-blood-pressure-tracker', slug: 'tool-074-blood-pressure-tracker', version: '1.0.0', page: Page.BLOOD_PRESSURE_TRACKER, href: '/smarttools/tool-074-blood-pressure-tracker', titleAr: 'متتبع ضغط الدم', titleEn: 'Blood Pressure Tracker', accessTier: 'free', order: 900, stackStatus: 'layered' },
  { toolId: 'mrx.tool.075-arterial-health-manager', slug: 'tool-075-arterial-health-manager', version: '1.0.0', page: Page.ARTERIAL_HEALTH_MANAGER, href: '/smarttools/tool-075-arterial-health-manager', titleAr: 'مدير صحة الشرايين', titleEn: 'Arterial Health Manager', accessTier: 'free', order: 910, stackStatus: 'layered' },
  { toolId: 'mrx.tool.076-blood-viscosity-calculator', slug: 'tool-076-blood-viscosity-calculator', version: '1.0.0', page: Page.BLOOD_VISCOSITY_CALCULATOR, href: '/smarttools/tool-076-blood-viscosity-calculator', titleAr: 'حاسبة لزوجة الدم', titleEn: 'Blood Viscosity Calculator', accessTier: 'free', order: 920, stackStatus: 'layered' },
  { toolId: 'mrx.tool.077-nitric-oxide-optimizer', slug: 'tool-077-nitric-oxide-optimizer', version: '1.0.0', page: Page.NITRIC_OXIDE_OPTIMIZER, href: '/smarttools/tool-077-nitric-oxide-optimizer', titleAr: 'محسّن أكسيد النيتريك', titleEn: 'Nitric Oxide Optimizer', accessTier: 'free', order: 930, stackStatus: 'layered' },
  { toolId: 'mrx.tool.078-endothelial-health-manager', slug: 'tool-078-endothelial-health-manager', version: '1.0.0', page: Page.ENDOTHELIAL_HEALTH_MANAGER, href: '/smarttools/tool-078-endothelial-health-manager', titleAr: 'مدير صحة البطانة الغشائية', titleEn: 'Endothelial Health Manager', accessTier: 'free', order: 940, stackStatus: 'layered' },
  { toolId: 'mrx.tool.079-fat-metabolism-calculator', slug: 'tool-079-fat-metabolism-calculator', version: '1.0.0', page: Page.FAT_METABOLISM_CALCULATOR, href: '/smarttools/tool-079-fat-metabolism-calculator', titleAr: 'حاسبة التمثيل الغذائي للدهون', titleEn: 'Fat Metabolism Calculator', accessTier: 'free', order: 950, stackStatus: 'layered' },
  { toolId: 'mrx.tool.080-mitochondrial-optimizer', slug: 'tool-080-mitochondrial-optimizer', version: '1.0.0', page: Page.MITOCHONDRIAL_OPTIMIZER, href: '/smarttools/tool-080-mitochondrial-optimizer', titleAr: 'محسّن الميتوكوندريا', titleEn: 'Mitochondrial Optimizer', accessTier: 'free', order: 960, stackStatus: 'layered' },
  { toolId: 'mrx.tool.081-cellular-aging-calculator', slug: 'tool-081-cellular-aging-calculator', version: '1.0.0', page: Page.CELLULAR_AGING_CALCULATOR, href: '/smarttools/tool-081-cellular-aging-calculator', titleAr: 'حاسبة شيخوخة الخلايا', titleEn: 'Cellular Aging Calculator', accessTier: 'free', order: 970, stackStatus: 'layered' },
  { toolId: 'mrx.tool.082-telomere-manager', slug: 'tool-082-telomere-manager', version: '1.0.0', page: Page.TELOMERE_MANAGER, href: '/smarttools/tool-082-telomere-manager', titleAr: 'مدير التيلوميرات', titleEn: 'Telomere Manager', accessTier: 'free', order: 980, stackStatus: 'layered' },
  { toolId: 'mrx.tool.083-anti-aging-inflammation-calculator', slug: 'tool-083-anti-aging-inflammation-calculator', version: '1.0.0', page: Page.ANTI_AGING_INFLAMMATION_CALCULATOR, href: '/smarttools/tool-083-anti-aging-inflammation-calculator', titleAr: 'حاسبة الالتهاب المضاد للشيخوخة', titleEn: 'Anti-Aging Inflammation Calculator', accessTier: 'free', order: 990, stackStatus: 'layered' },
  { toolId: 'mrx.tool.084-cognitive-enhancer', slug: 'tool-084-cognitive-enhancer', version: '1.0.0', page: Page.COGNITIVE_ENHANCER, href: '/smarttools/tool-084-cognitive-enhancer', titleAr: 'محسّن الإدراك', titleEn: 'Cognitive Enhancer', accessTier: 'free', order: 1000, stackStatus: 'layered' },
  { toolId: 'mrx.tool.085-sleep-quality-manager', slug: 'tool-085-sleep-quality-manager', version: '1.0.0', page: Page.SLEEP_QUALITY_MANAGER, href: '/smarttools/tool-085-sleep-quality-manager', titleAr: 'مدير النوم', titleEn: 'Sleep Quality Manager', accessTier: 'free', order: 1010, stackStatus: 'layered' },
  { toolId: 'mrx.tool.086-cortisol-stress-calculator', slug: 'tool-086-cortisol-stress-calculator', version: '1.0.0', page: Page.CORTISOL_STRESS_CALCULATOR, href: '/smarttools/tool-086-cortisol-stress-calculator', titleAr: 'حاسبة التوتر والكورتيزول', titleEn: 'Cortisol Stress Calculator', accessTier: 'free', order: 1020, stackStatus: 'layered' },
  { toolId: 'mrx.tool.087-mood-optimizer', slug: 'tool-087-mood-optimizer', version: '1.0.0', page: Page.MOOD_OPTIMIZER, href: '/smarttools/tool-087-mood-optimizer', titleAr: 'محسّن المزاج', titleEn: 'Mood Optimizer', accessTier: 'free', order: 1030, stackStatus: 'layered' },
  { toolId: 'mrx.tool.088-dopamine-tracker', slug: 'tool-088-dopamine-tracker', version: '1.0.0', page: Page.DOPAMINE_TRACKER, href: '/smarttools/tool-088-dopamine-tracker', titleAr: 'متتبع الدوبامين', titleEn: 'Dopamine Tracker', accessTier: 'free', order: 1040, stackStatus: 'layered' },
  { toolId: 'mrx.tool.089-serotonin-manager', slug: 'tool-089-serotonin-manager', version: '1.0.0', page: Page.SEROTONIN_MANAGER, href: '/smarttools/tool-089-serotonin-manager', titleAr: 'مدير السيروتونين', titleEn: 'Serotonin Manager', accessTier: 'free', order: 1050, stackStatus: 'layered' },
  { toolId: 'mrx.tool.090-female-hormone-balance-calculator', slug: 'tool-090-female-hormone-balance-calculator', version: '1.0.0', page: Page.FEMALE_HORMONE_BALANCE_CALCULATOR, href: '/smarttools/tool-090-female-hormone-balance-calculator', titleAr: 'حاسبة التوازن الهرموني الأنثوي', titleEn: 'Female Hormone Balance Calculator', accessTier: 'free', order: 1060, stackStatus: 'layered' },
  { toolId: 'mrx.tool.091-female-health-optimizer', slug: 'tool-091-female-health-optimizer', version: '1.0.0', page: Page.FEMALE_HEALTH_OPTIMIZER, href: '/smarttools/tool-091-female-health-optimizer', titleAr: 'محسّن الصحة الأنثوية', titleEn: 'Female Health Optimizer', accessTier: 'free', order: 1070, stackStatus: 'layered' },
  { toolId: 'mrx.tool.092-female-dosage-calculator', slug: 'tool-092-female-dosage-calculator', version: '1.0.0', page: Page.FEMALE_DOSAGE_CALCULATOR, href: '/smarttools/tool-092-female-dosage-calculator', titleAr: 'حاسبة جرعة الإناث', titleEn: 'Female Dosage Calculator', accessTier: 'free', order: 1080, stackStatus: 'layered' },
  { toolId: 'mrx.tool.093-menstrual-cycle-manager', slug: 'tool-093-menstrual-cycle-manager', version: '1.0.0', page: Page.MENSTRUAL_CYCLE_MANAGER, href: '/smarttools/tool-093-menstrual-cycle-manager', titleAr: 'مدير الدورة الشهرية', titleEn: 'Menstrual Cycle Manager', accessTier: 'free', order: 1090, stackStatus: 'layered' },
  { toolId: 'mrx.tool.094-pregnancy-risk-calculator', slug: 'tool-094-pregnancy-risk-calculator', version: '1.0.0', page: Page.PREGNANCY_RISK_CALCULATOR, href: '/smarttools/tool-094-pregnancy-risk-calculator', titleAr: 'حاسبة خطر الحمل', titleEn: 'Pregnancy Risk Calculator', accessTier: 'free', order: 1100, stackStatus: 'layered' },
  { toolId: 'mrx.tool.095-skin-health-optimizer', slug: 'tool-095-skin-health-optimizer', version: '1.0.0', page: Page.SKIN_HEALTH_OPTIMIZER, href: '/smarttools/tool-095-skin-health-optimizer', titleAr: 'محسّن صحة الجلد', titleEn: 'Skin Health Optimizer', accessTier: 'free', order: 1110, stackStatus: 'layered' },
  { toolId: 'mrx.tool.096-hair-nail-tracker', slug: 'tool-096-hair-nail-tracker', version: '1.0.0', page: Page.HAIR_NAIL_TRACKER, href: '/smarttools/tool-096-hair-nail-tracker', titleAr: 'متتبع الشعر والأظافر', titleEn: 'Hair & Nail Tracker', accessTier: 'free', order: 1120, stackStatus: 'layered' },
  { toolId: 'mrx.tool.097-hydration-balance-calculator', slug: 'tool-097-hydration-balance-calculator', version: '1.0.0', page: Page.HYDRATION_BALANCE_CALCULATOR, href: '/smarttools/tool-097-hydration-balance-calculator', titleAr: 'حاسبة التوازن المائي', titleEn: 'Hydration Balance Calculator', accessTier: 'free', order: 1130, stackStatus: 'layered' },
  { toolId: 'mrx.tool.098-sodium-potassium-manager', slug: 'tool-098-sodium-potassium-manager', version: '1.0.0', page: Page.SODIUM_POTASSIUM_MANAGER, href: '/smarttools/tool-098-sodium-potassium-manager', titleAr: 'مدير الصوديوم والبوتاسيوم', titleEn: 'Sodium-Potassium Manager', accessTier: 'free', order: 1140, stackStatus: 'layered' },
  { toolId: 'mrx.tool.099-digestive-health-optimizer', slug: 'tool-099-digestive-health-optimizer', version: '1.0.0', page: Page.DIGESTIVE_HEALTH_OPTIMIZER, href: '/smarttools/tool-099-digestive-health-optimizer', titleAr: 'محسّن الهضم', titleEn: 'Digestive Health Optimizer', accessTier: 'free', order: 1150, stackStatus: 'layered' },
  { toolId: 'mrx.tool.100-comprehensive-report-generator', slug: 'tool-100-comprehensive-report-generator', version: '1.0.0', page: Page.COMPREHENSIVE_REPORT_GENERATOR, href: '/smarttools/tool-100-comprehensive-report-generator', titleAr: 'التقرير الشامل', titleEn: 'Comprehensive Report Generator', accessTier: 'free', order: 1160, stackStatus: 'layered' },
  { toolId: 'mrx.tool.101-sarm-to-aas-transition-bridge-predictor', slug: 'tool-101-sarm-to-aas-transition-bridge-predictor', version: '1.0.0', page: Page.SARM_TO_AAS_TRANSITION, href: '/smarttools/tool-101-sarm-to-aas-transition-bridge-predictor', titleAr: 'حاسبة الانتقال الذكي بين SARMs والستيرويدات', titleEn: 'SARM-to-AAS Transition & Bridge Predictor', accessTier: 'free', order: 1170, stackStatus: 'layered' },
  { toolId: 'mrx.tool.102-subcutaneous-vs-intramuscular-pk-modeler', slug: 'tool-102-subcutaneous-vs-intramuscular-pk-modeler', version: '1.0.0', page: Page.SUBCUTANEOUS_VS_INTRAMUSCULAR, href: '/smarttools/tool-102-subcutaneous-vs-intramuscular-pk-modeler', titleAr: 'حاسبة مقارنة الحقن العضلي وتحت الجلد', titleEn: 'Subcutaneous vs. Intramuscular PK Modeler', accessTier: 'free', order: 1180, stackStatus: 'layered' },
  { toolId: 'mrx.tool.103-renal-function-hydration-index', slug: 'tool-103-renal-function-hydration-index', version: '1.0.0', page: Page.RENAL_FUNCTION_HYDRATION, href: '/smarttools/tool-103-renal-function-hydration-index', titleAr: 'مؤشر وظائف الكلى والترطيب المتقدم', titleEn: 'Renal Function & Hydration Index', accessTier: 'free', order: 1190, stackStatus: 'layered' },
  { toolId: 'mrx.tool.104-thyroid-metabolic-rate-dynamics', slug: 'tool-104-thyroid-metabolic-rate-dynamics', version: '1.0.0', page: Page.THYROID_METABOLIC_RATE, href: '/smarttools/tool-104-thyroid-metabolic-rate-dynamics', titleAr: 'حاسبة ديناميكيات الغدة الدرقية ومعدل الأيض', titleEn: 'Thyroid Function & Metabolic Rate Dynamics', accessTier: 'free', order: 1200, stackStatus: 'layered' },
  { toolId: 'mrx.tool.105-ai-health-data-fusion-hub', slug: 'tool-105-ai-health-data-fusion-hub', version: '1.0.0', page: Page.AI_HEALTH_DATA_FUSION, href: '/smarttools/tool-105-ai-health-data-fusion-hub', titleAr: 'مركز دمج بيانات الصحة الذكي (FHIR)', titleEn: 'AI Health Data Fusion Hub & Timeline', accessTier: 'free', order: 1210, stackStatus: 'layered' },
  { toolId: 'mrx.tool.106-glycogen-supercompensation-water-modeler', slug: 'tool-106-glycogen-supercompensation-water-modeler', version: '1.0.0', page: Page.GLYCOGEN_SUPERCOMPENSATION_WATER, href: '/smarttools/tool-106-glycogen-supercompensation-water-modeler', titleAr: 'حاسبة التحميل النشوي الفائق', titleEn: 'Glycogen Supercompensation & Water Retention Modeler', accessTier: 'free', order: 1220, stackStatus: 'layered' },
  { toolId: 'mrx.tool.107-contest-prep-peak-week-manipulator', slug: 'tool-107-contest-prep-peak-week-manipulator', version: '1.0.0', page: Page.CONTEST_PREP_PEAK_WEEK, href: '/smarttools/tool-107-contest-prep-peak-week-manipulator', titleAr: 'حاسبة أسبوع الذروة قبل البطولة', titleEn: 'Contest Prep Peak-Week Manipulator', accessTier: 'free', order: 1230, stackStatus: 'layered' },
  { toolId: 'mrx.tool.108-ai-body-composition-vision-engine', slug: 'tool-108-ai-body-composition-vision-engine', version: '1.0.0', page: Page.AI_BODY_COMPOSITION_VISION, href: '/smarttools/tool-108-ai-body-composition-vision-engine', titleAr: 'محرك التحليل البصري الذكي لتكوين الجسد', titleEn: 'AI Body Composition Vision Engine', accessTier: 'free', order: 1240, stackStatus: 'layered' },
  { toolId: 'mrx.tool.109-competition-readiness-posing-os', slug: 'tool-109-competition-readiness-posing-os', version: '1.0.0', page: Page.COMPETITION_READINESS_POSING, href: '/smarttools/tool-109-competition-readiness-posing-os', titleAr: 'نظام الاستعداد للبطولات والاستعراض', titleEn: 'Competition Readiness & Stage Posing OS', accessTier: 'free', order: 1250, stackStatus: 'layered' },
  { toolId: 'mrx.tool.110-ai-meal-vision-scanner', slug: 'tool-110-ai-meal-vision-scanner', version: '1.0.0', page: Page.AI_MEAL_VISION_SCANNER, href: '/smarttools/tool-110-ai-meal-vision-scanner', titleAr: 'ماسح الوجبات الذكي بالرؤية الحاسوبية', titleEn: 'AI Meal Vision Scanner & Portion Estimator', accessTier: 'free', order: 1260, stackStatus: 'layered' },
];
// ─────────────────────────────────────────────────────────────────────────────
// Registry integrity + resolution (contract: lib/tools/registry.test.ts)
// ─────────────────────────────────────────────────────────────────────────────

export class ToolRegistryError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ToolRegistryError';
    }
}

/**
 * Canonical identity: `mrx.tool.` + slug with the redundant `tool-` prefix
 * stripped (`tool-006-estrogen-prolactin` → `mrx.tool.006-estrogen-prolactin`).
 * Keeps registry IDs byte-identical to the smartToolsCatalog identities used
 * for persisted state (merge policy § identity); legacy slugs map 1:1.
 */
function canonicalToolId(slug: string): string {
    return `mrx.tool.${slug.replace(/^tool-/, '')}`;
}

/** `/ar/macro/` → `macro`. Locale prefixes and slashes are stripped. */
export function normalizeSlug(input: string | null | undefined): string | null {
    if (!input || typeof input !== 'string') return null;
    const stripped = input
        .trim()
        .replace(/^(?:\/(?:ar|en))(?=\/|$)/i, '')
        .replace(/^\/+/, '')
        .replace(/\/+$/, '');
    if (!stripped) return null;
    return stripped.toLowerCase();
}

/** Registry in deterministic chain order (explicit `order`, never array index). */
export function orderedTools(): ToolDefinition[] {
    return [...TOOL_REGISTRY].sort((a, b) => a.order - b.order);
}

/** Fail-fast registry integrity check — executed on import and re-run in tests. */
export function validateRegistry(tools: readonly ToolDefinition[] = TOOL_REGISTRY): true {
    if (tools.length === 0) throw new ToolRegistryError('tool registry is empty');
    const seen = { toolId: new Set<string>(), slug: new Set<string>(), href: new Set<string>(), order: new Set<number>() };
    for (const t of tools) {
        if (t.toolId !== canonicalToolId(t.slug)) {
            throw new ToolRegistryError(`toolId "${t.toolId}" must equal "${canonicalToolId(t.slug)}"`);
        }
        if (!ACCESS_TIERS.includes(t.accessTier)) {
            throw new ToolRegistryError(`tool "${t.slug}" has invalid accessTier "${String(t.accessTier)}"`);
        }
        if (!/^\d+\.\d+\.\d+$/.test(t.version)) {
            throw new ToolRegistryError(`tool "${t.slug}" version "${t.version}" must be semver (x.y.z)`);
        }
        if (!t.href.startsWith('/') || t.href.length < 2) {
            throw new ToolRegistryError(`tool "${t.slug}" href "${t.href}" must be an absolute app path`);
        }
        if (!t.titleAr || !t.titleEn) {
            throw new ToolRegistryError(`tool "${t.slug}" requires both titleAr and titleEn`);
        }
        if (seen.toolId.has(t.toolId)) throw new ToolRegistryError(`duplicate toolId "${t.toolId}"`);
        if (seen.slug.has(t.slug)) throw new ToolRegistryError(`duplicate slug "${t.slug}"`);
        if (seen.href.has(t.href)) throw new ToolRegistryError(`duplicate href "${t.href}"`);
        if (seen.order.has(t.order)) throw new ToolRegistryError(`duplicate order ${t.order} (chain order must be unique)`);
        seen.toolId.add(t.toolId);
        seen.slug.add(t.slug);
        seen.href.add(t.href);
        seen.order.add(t.order);
    }
    return true;
}

// The registry is a compile-time constant — an invalid one must never boot.
validateRegistry();

/** Resolve by slug (`macro`) or by href (`/macro`, `/ar/macro/`, `/smarttools/timeline`). */
export function getTool(slugOrHref: string): ToolDefinition | null {
    const key = normalizeSlug(slugOrHref);
    if (!key) return null;
    return orderedTools().find((t) => t.slug === key || t.href.toLowerCase() === `/${key}`) ?? null;
}

/** Resolve from the legacy `Page` enum used across `features/calculator`. */
export function getToolByPage(page: Page): ToolDefinition | null {
    return orderedTools().find((t) => t.page === page) ?? null;
}

/** Resolve from a Next.js pathname (locale prefix + trailing slash tolerant). */
export function getToolByHref(href: string): ToolDefinition | null {
    return getTool(href);
}

/** Throwing variant for engine/adapter call sites where a typo must fail loud. */
export function requireTool(slugOrHref: string): ToolDefinition {
    const tool = getTool(slugOrHref);
    if (!tool) throw new ToolRegistryError(`unknown tool "${String(slugOrHref)}" — not present in TOOL_REGISTRY`);
    return tool;
}

export function getDefaultTool(): ToolDefinition {
    return orderedTools()[0];
}

export function getToolsByTier(tier: AccessTier): ToolDefinition[] {
    return orderedTools().filter((t) => t.accessTier === tier);
}

export function toToolLink(tool: ToolDefinition): ToolLink {
  return {
    slug: tool.slug,
    titleAr: tool.titleAr,
    titleEn: tool.titleEn,
  };
}

/**
 * Circular neighbour pair for the prev/next footer links (SEO §7).
 * The chain wraps around — no tool can ever render a dead link — and an
 * unregistered slug throws `ToolRegistryError` instead of a silent fallback.
 */
export function getToolNeighbors(slugOrHref: string): SeoLinks {
    const chain = orderedTools();
    const index = chain.findIndex((t) => t.slug === requireTool(slugOrHref).slug);
    const prevTool = chain[(index - 1 + chain.length) % chain.length];
    const nextTool = chain[(index + 1) % chain.length];
    return { prevTool: toToolLink(prevTool), nextTool: toToolLink(nextTool) };
}

/** Accepts a `ToolDefinition` (adapters) or a slug/href string (tests, callers). */
export function buildSeoLinks(tool: ToolDefinition): SeoLinks;
export function buildSeoLinks(slugOrHref: string): SeoLinks;
export function buildSeoLinks(input: string | ToolDefinition): SeoLinks {
    return getToolNeighbors(typeof input === 'string' ? input : input.slug);
}

/** Envelope params with registry-injected identity fields (tuple form of `buildToolOutput`). */
export type RegistryToolOutputParams<T> = Omit<
    ToolOutputParams<T>,
    'toolId' | 'toolSlug' | 'accessTier' | 'seoLinks'
>;

export function buildToolOutput<T>(slugOrHref: string, params: RegistryToolOutputParams<T>): ToolOutput<T>;
export function buildToolOutput<T>(params: ToolOutputParams<T>): ToolOutput<T>;
/**
 * Canonical `ToolOutput` builder.
 * - `(slug, params)`: identity, access tier and prev/next links are injected
 *   from the registry — a tool author can never emit an inconsistent envelope.
 * - `(params)`: full-envelope passthrough used by adapters that already
 *   resolved the tool via `requireTool` (identity fields included).
 */
export function buildToolOutput<T>(
    input: string | ToolOutputParams<T>,
    params?: RegistryToolOutputParams<T>,
): ToolOutput<T> {
    if (typeof input === 'string') {
        if (!params) {
            throw new ToolRegistryError(`buildToolOutput("${input}") requires envelope params`);
        }
        const tool = requireTool(input);
        try {
            return createToolOutput<T>({
                ...params,
                toolId: tool.toolId,
                toolSlug: tool.slug,
                accessTier: tool.accessTier,
                seoLinks: getToolNeighbors(tool.slug),
            });
        } catch (error) {
            if (error instanceof ToolContractError) {
                throw new ToolRegistryError(`tool "${tool.slug}" produced an invalid ToolOutput: ${error.message}`);
            }
            throw error;
        }
    }
    return createToolOutput<T>(input);
}

// Re-export types
export type { ToolOutputParams, ToolOutput, ToolLink, SeoLinks } from './contracts';
