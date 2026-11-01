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
{ toolId: 'mrx.tool.macro', slug: 'macro', version: '1.0.0', page: Page.MACRO, href: '/smarttools/nutrition/macro', titleAr: 'حاسبة الماكروز المتقدمة', titleEn: 'Advanced Macro Calculator', accessTier: 'free', order: 10, stackStatus: 'legacy' },
  { toolId: 'mrx.tool.bodyfat', slug: 'bodyfat', version: '1.0.0', page: Page.BODYFAT, href: '/smarttools/body-composition/bodyfat', titleAr: 'حاسبة نسبة الدهون', titleEn: 'Body Fat Calculator', accessTier: 'free', order: 20, stackStatus: 'legacy' },
  { toolId: 'mrx.tool.injection', slug: 'injection', version: '1.0.0', page: Page.INJECTION, href: '/smarttools/injection-formulation/injection', titleAr: 'خريطة الحقن التفاعلية', titleEn: 'Interactive Injection Map', accessTier: 'free', order: 30, stackStatus: 'legacy' },
  { toolId: 'mrx.tool.halflife', slug: 'halflife', version: '1.0.0', page: Page.HALFLIFE, href: '/smarttools/pharmacokinetics/halflife', titleAr: 'محاكي نصف العمر', titleEn: 'Half-Life Simulator', accessTier: 'free', order: 40, stackStatus: 'legacy' },
  { toolId: 'mrx.tool.lab', slug: 'lab', version: '1.0.0', page: Page.LAB, href: '/smarttools/medical-monitoring/lab', titleAr: 'المرجع الذكي للتحاليل', titleEn: 'Smart Lab Reference', accessTier: 'free', order: 50, stackStatus: 'legacy' },
  { toolId: 'mrx.tool.genetic', slug: 'genetic', version: '1.0.0', page: Page.GENETIC, href: '/smarttools/training-recovery/genetic', titleAr: 'حاسبة الإمكانات الوراثية', titleEn: 'Genetic Potential Calculator', accessTier: 'free', order: 60, stackStatus: 'legacy' },
  { toolId: 'mrx.tool.cycle', slug: 'cycle', version: '1.0.0', page: Page.CYCLE_ARCHITECT, href: '/smarttools/cycle-management/cycle', titleAr: 'مهندس الدورة', titleEn: 'Cycle Architect', accessTier: 'premium', order: 70, stackStatus: 'legacy' },
  { toolId: 'mrx.tool.timeline', slug: 'timeline', version: '1.0.0', page: Page.TIMELINE, href: '/smarttools/training-recovery/timeline', titleAr: 'الجدول الزمني للتحول', titleEn: 'Transformation Timeline', accessTier: 'free', order: 80, stackStatus: 'layered' },
  { toolId: 'mrx.tool.master-calculator', slug: 'master-calculator', version: '1.0.0', page: Page.MASTER_CALCULATOR, href: '/smarttools/nutrition/master-calculator', titleAr: 'الحاسبة الشاملة', titleEn: 'Master Calculator', accessTier: 'free', order: 90, stackStatus: 'legacy' },
  { toolId: 'mrx.tool.multi-ester-pharmacokinetics', slug: 'multi-ester-pharmacokinetics', version: '1.0.0', page: Page.MULTI_ESTER_PK, href: '/smarttools/pharmacokinetics/multi-ester-pharmacokinetics', titleAr: 'محاكي تراكم الإسترات', titleEn: 'Multi-Ester PK Simulator', accessTier: 'premium', order: 45, stackStatus: 'layered' },
  { toolId: 'mrx.tool.hpta-recovery', slug: 'hpta-recovery', version: '1.0.0', page: Page.HPTA_RECOVERY, href: '/smarttools/hormonal-health/hpta-recovery', titleAr: 'محاكي التثبيط المحوري واستعادة HPTA', titleEn: 'HPTA Suppression & Recovery Modeler', accessTier: 'free', order: 46, stackStatus: 'layered' },
{ toolId: 'mrx.tool.aromatization-risk', slug: 'aromatization-risk', version: '1.0.0', page: Page.AROMATIZATION_RISK, href: '/smarttools/hormonal-health/aromatization-risk', titleAr: 'سيناريو حسابي افتراضي للأروماتزة والاستراديول', titleEn: 'Unvalidated Aromatization Scenario Model', accessTier: 'free', order: 45.5, stackStatus: 'layered' },
  { toolId: 'mrx.tool.pct-timing', slug: 'pct-timing', version: '1.0.0', page: Page.PCT_TIMING, href: '/smarttools/cycle-management/pct-timing', titleAr: 'محرك توقيت PCT والتطهير', titleEn: 'PCT Timing & Compound Washout Engine', accessTier: 'free', order: 47, stackStatus: 'layered' },
  { toolId: 'mrx.tool.hcg-serm-protocol', slug: 'hcg-serm-protocol', version: '1.0.0', page: Page.HCG_SERM_PROTOCOL, href: '/smarttools/reproductive-wellbeing/hcg-serm-protocol', titleAr: 'بروتوكول HCG وSERM', titleEn: 'HCG & SERM Protocol', accessTier: 'free', order: 140, stackStatus: 'layered' },
  { toolId: 'mrx.tool.006-estrogen-prolactin', slug: 'tool-006-estrogen-prolactin', version: '1.0.0', page: Page.ESTROGEN_PROLACTIN, href: '/smarttools/hormonal-health/tool-006-estrogen-prolactin', titleAr: 'سجل قيم الإستروجين والبرولاكتين', titleEn: 'Estradiol & Prolactin Record', accessTier: 'free', order: 200, stackStatus: 'layered' },
  { toolId: 'mrx.tool.007-bloodwork-analyzer', slug: 'tool-007-bloodwork-analyzer', version: '1.0.0', page: Page.BLOODWORK_ANALYZER, href: '/smarttools/medical-monitoring/tool-007-bloodwork-analyzer', titleAr: 'سجل نتائج التحاليل', titleEn: 'Bloodwork Record Log', accessTier: 'free', order: 210, stackStatus: 'layered' },
  { toolId: 'mrx.tool.008-side-effect-tracker', slug: 'tool-008-side-effect-tracker', version: '1.0.0', page: Page.SIDE_EFFECT_TRACKER, href: '/smarttools/medical-monitoring/tool-008-side-effect-tracker', titleAr: 'متتبع الآثار الجانبية', titleEn: 'Side Effect Tracker', accessTier: 'free', order: 220, stackStatus: 'layered' },
  { toolId: 'mrx.tool.009-injection-site-rotator', slug: 'tool-009-injection-site-rotator', version: '1.0.0', page: Page.INJECTION_SITE_ROTATOR, href: '/smarttools/injection-formulation/tool-009-injection-site-rotator', titleAr: 'سجل مواقع الحقن', titleEn: 'Injection Site History Log', accessTier: 'free', order: 230, stackStatus: 'layered' },
  { toolId: 'mrx.tool.010-compound-stack-builder', slug: 'tool-010-compound-stack-builder', version: '1.0.0', page: Page.COMPOUND_STACK_BUILDER, href: '/smarttools/cycle-management/tool-010-compound-stack-builder', titleAr: 'بناء حزمة المركبات', titleEn: 'Compound Stack Builder', accessTier: 'free', order: 240, stackStatus: 'layered' },
  { toolId: 'mrx.tool.011-progress-tracker', slug: 'tool-011-progress-tracker', version: '1.0.0', page: Page.PROGRESS_TRACKER, href: '/smarttools/body-composition/tool-011-progress-tracker', titleAr: 'متتبع التقدم', titleEn: 'Progress Tracker', accessTier: 'free', order: 250, stackStatus: 'layered' },
  { toolId: 'mrx.tool.012-calorie-adjuster', slug: 'tool-012-calorie-adjuster', version: '1.0.0', page: Page.CALORIE_ADJUSTER, href: '/smarttools/nutrition/tool-012-calorie-adjuster', titleAr: 'معدل السعرات', titleEn: 'Calorie Adjuster', accessTier: 'free', order: 260, stackStatus: 'layered' },
  { toolId: 'mrx.tool.013-macro-optimizer', slug: 'tool-013-macro-optimizer', version: '1.0.0', page: Page.MACRO_OPTIMIZER, href: '/smarttools/nutrition/tool-013-macro-optimizer', titleAr: 'محسن الماكروز', titleEn: 'Macro Optimizer', accessTier: 'free', order: 270, stackStatus: 'layered' },
  { toolId: 'mrx.tool.014-water-retention', slug: 'tool-014-water-retention', version: '1.0.0', page: Page.WATER_RETENTION, href: '/smarttools/body-composition/tool-014-water-retention', titleAr: 'مقيم احتباس الماء', titleEn: 'Water Retention Assessor', accessTier: 'free', order: 280, stackStatus: 'layered' },
  { toolId: 'mrx.tool.015-shbg-modulator', slug: 'tool-015-shbg-modulator', version: '1.0.0', page: Page.SHBG_MODULATOR, href: '/smarttools/hormonal-health/tool-015-shbg-modulator', titleAr: 'منظم SHBG', titleEn: 'SHBG Modulator', accessTier: 'free', order: 290, stackStatus: 'layered' },
{ toolId: 'mrx.tool.016-half-life-calculator', slug: 'tool-016-half-life-calculator', version: '1.0.0', page: Page.HALF_LIFE_CALCULATOR, href: '/smarttools/pharmacokinetics/tool-016-half-life-calculator', titleAr: 'حاسبة نصف العمر', titleEn: 'Half-Life Calculator', accessTier: 'free', order: 300, stackStatus: 'layered' },
  { toolId: 'mrx.tool.017-drug-interaction', slug: 'tool-017-drug-interaction', version: '1.0.0', page: Page.DRUG_INTERACTION, href: '/smarttools/medical-monitoring/tool-017-drug-interaction', titleAr: 'فاحص تفاعلات المركبات', titleEn: 'Drug Interaction Checker', accessTier: 'free', order: 320, stackStatus: 'layered' },
  { toolId: 'mrx.tool.018-hpta-recovery', slug: 'tool-018-hpta-recovery', version: '1.0.0', page: Page.HPTA_RECOVERY_MONITOR, href: '/smarttools/hormonal-health/tool-018-hpta-recovery', titleAr: 'مراقب استعادة HPTA', titleEn: 'HPTA Recovery Monitor', accessTier: 'free', order: 340, stackStatus: 'layered' },
  { toolId: 'mrx.tool.019-cardio-monitor', slug: 'tool-019-cardio-monitor', version: '1.0.0', page: Page.CARDIO_MONITOR, href: '/smarttools/medical-monitoring/tool-019-cardio-monitor', titleAr: 'مراقب القلب والدهون', titleEn: 'Cardio Monitor', accessTier: 'free', order: 350, stackStatus: 'layered' },
  { toolId: 'mrx.tool.020-genetic-potential', slug: 'tool-020-genetic-potential', version: '1.0.0', page: Page.GENETIC_POTENTIAL, href: '/smarttools/training-recovery/tool-020-genetic-potential', titleAr: 'حاسبة القدرة الوراثية', titleEn: 'Genetic Potential Calculator', accessTier: 'free', order: 360, stackStatus: 'layered' },
  { toolId: 'mrx.tool.021-peptide-protocol', slug: 'tool-021-peptide-protocol', version: '1.0.0', page: Page.PEPTIDE_PROTOCOL, href: '/smarttools/cycle-management/tool-021-peptide-protocol', titleAr: 'مخطط بروتوكول الببتيد', titleEn: 'Peptide Protocol Planner', accessTier: 'free', order: 370, stackStatus: 'layered' },
  { toolId: 'mrx.tool.022-half-life-stacker', slug: 'tool-022-half-life-stacker', version: '1.0.0', page: Page.HALF_LIFE_STACKER, href: '/smarttools/pharmacokinetics/tool-022-half-life-stacker', titleAr: 'مركب نصف العمر', titleEn: 'Half-Life Stacker', accessTier: 'free', order: 380, stackStatus: 'layered' },
  { toolId: 'mrx.tool.023-trt-optimization', slug: 'tool-023-trt-optimization', version: '1.0.0', page: Page.TRT_OPTIMIZATION, href: '/smarttools/hormonal-health/tool-023-trt-optimization', titleAr: 'تحسين TRT', titleEn: 'TRT Optimization', accessTier: 'free', order: 390, stackStatus: 'layered' },
  { toolId: 'mrx.tool.024-bloodwork-interpreter', slug: 'tool-024-bloodwork-interpreter', version: '1.0.0', page: Page.BLOODWORK_INTERPRETER, href: '/smarttools/medical-monitoring/tool-024-bloodwork-interpreter', titleAr: 'مقارنة نطاقات التحاليل المُدخلة', titleEn: 'Lab Reference Interval Comparison', accessTier: 'free', order: 400, stackStatus: 'layered' },
  { toolId: 'mrx.tool.025-drug-interaction-pro', slug: 'tool-025-drug-interaction-pro', version: '1.0.0', page: Page.DRUG_INTERACTION_PRO, href: '/smarttools/medical-monitoring/tool-025-drug-interaction-pro', titleAr: 'قائمة مؤقتة للأدوية والمركّبات', titleEn: 'Medication & Compound Session List', accessTier: 'free', order: 410, stackStatus: 'layered' },
  { toolId: 'mrx.tool.026-injection-pain', slug: 'tool-026-injection-pain', version: '1.0.0', page: Page.INJECTION_PAIN, href: '/smarttools/injection-formulation/tool-026-injection-pain', titleAr: 'سجل تجربة الحقن', titleEn: 'Injection Experience Log', accessTier: 'free', order: 420, stackStatus: 'layered' },
  { toolId: 'mrx.tool.027-ester-conversion', slug: 'tool-027-ester-conversion', version: '1.0.0', page: Page.ESTER_CONVERSION, href: '/smarttools/pharmacokinetics/tool-027-ester-conversion', titleAr: 'حاسبة الكتلة المولية التي يدخلها المستخدم', titleEn: 'User-Provided Molar Mass Calculator', accessTier: 'free', order: 430, stackStatus: 'layered' },
  { toolId: 'mrx.tool.028-stacking-synergy', slug: 'tool-028-stacking-synergy', version: '1.0.0', page: Page.STACKING_SYNERGY, href: '/smarttools/cycle-management/tool-028-stacking-synergy', titleAr: 'ورقة مقارنة السيناريوهات والمركّبات', titleEn: 'Compound Scenario Comparison Worksheet', accessTier: 'free', order: 440, stackStatus: 'layered' },
  { toolId: 'mrx.tool.029-side-effect-early-warning', slug: 'tool-029-side-effect-early-warning', version: '1.0.0', page: Page.SIDE_EFFECT_EARLY_WARNING, href: '/smarttools/medical-monitoring/tool-029-side-effect-early-warning', titleAr: 'ملخص القياسات الشخصية', titleEn: 'Personal Measurement Summary', accessTier: 'free', order: 450, stackStatus: 'layered' },
  { toolId: 'mrx.tool.030-cycle-cost-calculator', slug: 'tool-030-cycle-cost-calculator', version: '1.0.0', page: Page.CYCLE_COST_CALCULATOR, href: '/smarttools/cycle-management/tool-030-cycle-cost-calculator', titleAr: 'حاسبة تكلفة الدورة', titleEn: 'Cycle Cost Calculator', accessTier: 'free', order: 460, stackStatus: 'layered' },
  { toolId: 'mrx.tool.031-cycle-length-optimizer', slug: 'tool-031-cycle-length-optimizer', version: '1.0.0', page: Page.CYCLE_LENGTH_OPTIMIZER, href: '/smarttools/cycle-management/tool-031-cycle-length-optimizer', titleAr: 'محسّن مدة الدورة', titleEn: 'Cycle Length Optimizer', accessTier: 'free', order: 470, stackStatus: 'layered' },
  { toolId: 'mrx.tool.032-advanced-pct-planner', slug: 'tool-032-advanced-pct-planner', version: '1.0.0', page: Page.ADVANCED_PCT_PLANNER, href: '/smarttools/hormonal-health/tool-032-advanced-pct-planner', titleAr: 'مخطط PCT المتقدم', titleEn: 'Advanced PCT Planner', accessTier: 'free', order: 480, stackStatus: 'layered' },
  { toolId: 'mrx.tool.033-bloodwork-trend-analyzer', slug: 'tool-033-bloodwork-trend-analyzer', version: '1.0.0', page: Page.BLOODWORK_TREND_ANALYZER, href: '/smarttools/medical-monitoring/tool-033-bloodwork-trend-analyzer', titleAr: 'ملخص اتجاه قراءات التحاليل', titleEn: 'Lab Reading Trend Summary', accessTier: 'free', order: 490, stackStatus: 'layered' },
  { toolId: 'mrx.tool.034-compound-clearance', slug: 'tool-034-compound-clearance', version: '1.0.0', page: Page.COMPOUND_CLEARANCE, href: '/smarttools/pharmacokinetics/tool-034-compound-clearance', titleAr: 'محاكاة اضمحلال نسبة جرعة مفردة', titleEn: 'Single-dose Fractional Decay Scenario', accessTier: 'free', order: 500, stackStatus: 'layered' },
  { toolId: 'mrx.tool.036-injection-schedule', slug: 'tool-036-injection-schedule', version: '1.0.0', page: Page.INJECTION_SCHEDULE, href: '/smarttools/injection-formulation/tool-036-injection-schedule', titleAr: 'مخطط جدول الحقن', titleEn: 'Injection Schedule Planner', accessTier: 'free', order: 520, stackStatus: 'layered' },
  { toolId: 'mrx.tool.037-side-effect-probability', slug: 'tool-037-side-effect-probability', version: '1.0.0', page: Page.SIDE_EFFECT_PROBABILITY, href: '/smarttools/medical-monitoring/tool-037-side-effect-probability', titleAr: 'حاسبة احتمالية الأعراض', titleEn: 'Side Effect Probability Calculator', accessTier: 'free', order: 530, stackStatus: 'layered' },
  { toolId: 'mrx.tool.038-stack-compatibility', slug: 'tool-038-stack-compatibility', version: '1.0.0', page: Page.STACK_COMPATIBILITY, href: '/smarttools/cycle-management/tool-038-stack-compatibility', titleAr: 'مدقق توافق الستاك', titleEn: 'Stack Compatibility Checker', accessTier: 'free', order: 540, stackStatus: 'layered' },
  { toolId: 'mrx.tool.039-liver-enzyme-tracker', slug: 'tool-039-liver-enzyme-tracker', version: '1.0.0', page: Page.LIVER_ENZYME_TRACKER, href: '/smarttools/medical-monitoring/tool-039-liver-enzyme-tracker', titleAr: 'متتبع إنزيمات الكبد', titleEn: 'Liver Enzyme Tracker', accessTier: 'free', order: 550, stackStatus: 'layered' },
  { toolId: 'mrx.tool.040-lipid-profile-optimizer', slug: 'tool-040-lipid-profile-optimizer', version: '1.0.0', page: Page.LIPID_PROFILE_OPTIMIZER, href: '/smarttools/medical-monitoring/tool-040-lipid-profile-optimizer', titleAr: 'محسّن ملف الدهون', titleEn: 'Lipid Profile Optimizer', accessTier: 'free', order: 560, stackStatus: 'layered' },
  { toolId: 'mrx.tool.035-hormone-conversion', slug: 'tool-035-hormone-conversion', version: '1.0.0', page: Page.HORMONE_CONVERSION, href: '/smarttools/pharmacokinetics/tool-035-hormone-conversion', titleAr: 'محول وحدات التستوستيرون والإستراديول', titleEn: 'Testosterone and Estradiol Unit Converter', accessTier: 'free', order: 510, stackStatus: 'layered' },
  { toolId: 'mrx.tool.041-hematocrit-monitor', slug: 'tool-041-hematocrit-monitor', version: '1.0.0', page: Page.HEMATOCRIT_MONITOR, href: '/smarttools/medical-monitoring/tool-041-hematocrit-monitor', titleAr: 'متتبع الهيماتوكريت', titleEn: 'Hematocrit Monitor', accessTier: 'free', order: 570, stackStatus: 'layered' },
  { toolId: 'mrx.tool.042-estrogen-management', slug: 'tool-042-estrogen-management', version: '1.0.0', page: Page.ESTROGEN_MANAGEMENT, href: '/smarttools/hormonal-health/tool-042-estrogen-management', titleAr: 'إدارة الإستروجين الاحترافية', titleEn: 'Estrogen Management Pro', accessTier: 'free', order: 580, stackStatus: 'layered' },
  { toolId: 'mrx.tool.043-prolactin-management', slug: 'tool-043-prolactin-management', version: '1.0.0', page: Page.PROLACTIN_MANAGEMENT, href: '/smarttools/hormonal-health/tool-043-prolactin-management', titleAr: 'إدارة البرولاكتين', titleEn: 'Prolactin Management Pro', accessTier: 'free', order: 590, stackStatus: 'layered' },
  { toolId: 'mrx.tool.044-dht-side-effects', slug: 'tool-044-dht-side-effects', version: '1.0.0', page: Page.DHT_SIDE_EFFECTS, href: '/smarttools/medical-monitoring/tool-044-dht-side-effects', titleAr: 'متنبئ آثار DHT', titleEn: 'DHT Side Effect Predictor', accessTier: 'free', order: 600, stackStatus: 'layered' },
  { toolId: 'mrx.tool.045-cycle-break-planner', slug: 'tool-045-cycle-break-planner', version: '1.0.0', page: Page.CYCLE_BREAK_PLANNER, href: '/smarttools/cycle-management/tool-045-cycle-break-planner', titleAr: 'مخطط فترة الراحة بين الدورات', titleEn: 'Cycle Break Planner', accessTier: 'free', order: 610, stackStatus: 'layered' },
  { toolId: 'mrx.tool.046-trt-lifetime', slug: 'tool-046-trt-lifetime', version: '1.0.0', page: Page.TRT_LIFETIME, href: '/smarttools/hormonal-health/tool-046-trt-lifetime', titleAr: 'حاسبة عمر TRT', titleEn: 'TRT Lifetime Calculator', accessTier: 'free', order: 620, stackStatus: 'layered' },
  { toolId: 'mrx.tool.047-fertility-preservation', slug: 'tool-047-fertility-preservation', version: '1.0.0', page: Page.FERTILITY_PRESERVATION, href: '/smarttools/hormonal-health/tool-047-fertility-preservation', titleAr: 'دليل الحفاظ على الخصوبة', titleEn: 'Fertility Preservation Guide', accessTier: 'free', order: 630, stackStatus: 'layered' },
  { toolId: 'mrx.tool.048-cardiovascular-risk', slug: 'tool-048-cardiovascular-risk', version: '1.0.0', page: Page.CARDIOVASCULAR_RISK, href: '/smarttools/medical-monitoring/tool-048-cardiovascular-risk', titleAr: 'مقيّم خطر القلب', titleEn: 'Cardiovascular Risk Assessor', accessTier: 'free', order: 640, stackStatus: 'layered' },
  { toolId: 'mrx.tool.049-bone-density', slug: 'tool-049-bone-density', version: '1.0.0', page: Page.BONE_DENSITY, href: '/smarttools/medical-monitoring/tool-049-bone-density', titleAr: 'محسّن كثافة العظام', titleEn: 'Bone Density Optimizer', accessTier: 'free', order: 650, stackStatus: 'layered' },
  { toolId: 'mrx.tool.050-mental-health', slug: 'tool-050-mental-health', version: '1.0.0', page: Page.MENTAL_HEALTH, href: '/smarttools/medical-monitoring/tool-050-mental-health', titleAr: 'مراقب الصحة النفسية', titleEn: 'Mental Health Monitor', accessTier: 'free', order: 660, stackStatus: 'layered' },
  { toolId: 'mrx.tool.051-peptide-dosage-calculator', slug: 'tool-051-peptide-dosage-calculator', version: '1.0.0', page: Page.PEPTIDE_DOSAGE_CALCULATOR, href: '/smarttools/injection-formulation/tool-051-peptide-dosage-calculator', titleAr: 'حاسبة جرعة الببتيدات', titleEn: 'Peptide Dosage Calculator', accessTier: 'free', order: 670, stackStatus: 'layered' },
  { toolId: 'mrx.tool.052-growth-hormone-protocol-planner', slug: 'tool-052-growth-hormone-protocol-planner', version: '1.0.0', page: Page.GROWTH_HORMONE_PROTOCOL_PLANNER, href: '/smarttools/hormonal-health/tool-052-growth-hormone-protocol-planner', titleAr: 'مخطط بروتوكول GH', titleEn: 'Growth Hormone Protocol Planner', accessTier: 'free', order: 680, stackStatus: 'layered' },
  { toolId: 'mrx.tool.053-insulin-conversion-calculator', slug: 'tool-053-insulin-conversion-calculator', version: '1.0.0', page: Page.INSULIN_CONVERSION_CALCULATOR, href: '/smarttools/hormonal-health/tool-053-insulin-conversion-calculator', titleAr: 'حاسبة تحويل الأنسولين', titleEn: 'Insulin Conversion Calculator', accessTier: 'free', order: 690, stackStatus: 'layered' },
  { toolId: 'mrx.tool.054-glucose-tracker', slug: 'tool-054-glucose-tracker', version: '1.0.0', page: Page.GLUCOSE_TRACKER, href: '/smarttools/medical-monitoring/tool-054-glucose-tracker', titleAr: 'متتبع الجلوكوز', titleEn: 'Glucose Tracker', accessTier: 'free', order: 700, stackStatus: 'layered' },
  { toolId: 'mrx.tool.055-insulin-sensitivity-optimizer', slug: 'tool-055-insulin-sensitivity-optimizer', version: '1.0.0', page: Page.INSULIN_SENSITIVITY_OPTIMIZER, href: '/smarttools/medical-monitoring/tool-055-insulin-sensitivity-optimizer', titleAr: 'محسّن حساسية الأنسولين', titleEn: 'Insulin Sensitivity Optimizer', accessTier: 'free', order: 710, stackStatus: 'layered' },
  { toolId: 'mrx.tool.056-mini-pct-calculator', slug: 'tool-056-mini-pct-calculator', version: '1.0.0', page: Page.MINI_PCT_CALCULATOR, href: '/smarttools/cycle-management/tool-056-mini-pct-calculator', titleAr: 'حاسبة الـ PCT المصغّرة', titleEn: 'Mini PCT Calculator', accessTier: 'free', order: 720, stackStatus: 'layered' },
  { toolId: 'mrx.tool.057-free-testosterone-manager', slug: 'tool-057-free-testosterone-manager', version: '1.0.0', page: Page.FREE_TESTOSTERONE_MANAGER, href: '/smarttools/hormonal-health/tool-057-free-testosterone-manager', titleAr: 'مدير التستوستيرون الحر', titleEn: 'Free Testosterone Manager', accessTier: 'free', order: 730, stackStatus: 'layered' },
  { toolId: 'mrx.tool.058-androgenic-balance-calculator', slug: 'tool-058-androgenic-balance-calculator', version: '1.0.0', page: Page.ANDROGENIC_BALANCE_CALCULATOR, href: '/smarttools/hormonal-health/tool-058-androgenic-balance-calculator', titleAr: 'حاسبة التوازن الأندروجيني', titleEn: 'Androgenic Balance Calculator', accessTier: 'free', order: 740, stackStatus: 'layered' },
  { toolId: 'mrx.tool.059-androgen-receptor-optimizer', slug: 'tool-059-androgen-receptor-optimizer', version: '1.0.0', page: Page.ANDROGEN_RECEPTOR_OPTIMIZER, href: '/smarttools/hormonal-health/tool-059-androgen-receptor-optimizer', titleAr: 'محسّن مستقبلات الأندروجين', titleEn: 'Androgen Receptor Optimizer', accessTier: 'free', order: 750, stackStatus: 'layered' },
  { toolId: 'mrx.tool.060-5-alpha-conversion-calculator', slug: 'tool-060-5-alpha-conversion-calculator', version: '1.0.0', page: Page.FIVE_ALPHA_CONVERSION_CALCULATOR, href: '/smarttools/pharmacokinetics/tool-060-5-alpha-conversion-calculator', titleAr: 'حاسبة التحويل 5-ألفا', titleEn: '5-Alpha Conversion Calculator', accessTier: 'free', order: 760, stackStatus: 'layered' },
  { toolId: 'mrx.tool.061-hair-loss-tracker', slug: 'tool-061-hair-loss-tracker', version: '1.0.0', page: Page.HAIR_LOSS_TRACKER, href: '/smarttools/medical-monitoring/tool-061-hair-loss-tracker', titleAr: 'متتبع تساقط الشعر', titleEn: 'Hair Loss Tracker', accessTier: 'free', order: 770, stackStatus: 'layered' },
  { toolId: 'mrx.tool.062-prostate-health-manager', slug: 'tool-062-prostate-health-manager', version: '1.0.0', page: Page.PROSTATE_HEALTH_MANAGER, href: '/smarttools/medical-monitoring/tool-062-prostate-health-manager', titleAr: 'مدير صحة البروستاتا', titleEn: 'Prostate Health Manager', accessTier: 'free', order: 780, stackStatus: 'layered' },
  { toolId: 'mrx.tool.063-testicular-suppression-calculator', slug: 'tool-063-testicular-suppression-calculator', version: '1.0.0', page: Page.TESTICULAR_SUPPRESSION_CALCULATOR, href: '/smarttools/hormonal-health/tool-063-testicular-suppression-calculator', titleAr: 'حاسبة قمع الخصية', titleEn: 'Testicular Suppression Calculator', accessTier: 'free', order: 790, stackStatus: 'layered' },
  { toolId: 'mrx.tool.064-sperm-production-optimizer', slug: 'tool-064-sperm-production-optimizer', version: '1.0.0', page: Page.SPERM_PRODUCTION_OPTIMIZER, href: '/smarttools/reproductive-wellbeing/tool-064-sperm-production-optimizer', titleAr: 'محسّن إنتاج الحيوانات المنوية', titleEn: 'Sperm Production Optimizer', accessTier: 'free', order: 800, stackStatus: 'layered' },
  { toolId: 'mrx.tool.065-aromatase-conversion-calculator', slug: 'tool-065-aromatase-conversion-calculator', version: '1.0.0', page: Page.AROMATASE_CONVERSION_CALCULATOR, href: '/smarttools/pharmacokinetics/tool-065-aromatase-conversion-calculator', titleAr: 'حاسبة التحويل الأروماتي', titleEn: 'Aromatase Conversion Calculator', accessTier: 'free', order: 810, stackStatus: 'layered' },
  { toolId: 'mrx.tool.066-estrogen-sensitivity-manager', slug: 'tool-066-estrogen-sensitivity-manager', version: '1.0.0', page: Page.ESTROGEN_SENSITIVITY_MANAGER, href: '/smarttools/hormonal-health/tool-066-estrogen-sensitivity-manager', titleAr: 'مدير حساسية الإستروجين', titleEn: 'Estrogen Sensitivity Manager', accessTier: 'free', order: 820, stackStatus: 'layered' },
  { toolId: 'mrx.tool.067-estrogen-balance-calculator', slug: 'tool-067-estrogen-balance-calculator', version: '1.0.0', page: Page.ESTROGEN_BALANCE_CALCULATOR, href: '/smarttools/hormonal-health/tool-067-estrogen-balance-calculator', titleAr: 'حاسبة التوازن الإستروجيني', titleEn: 'Estrogen Balance Calculator', accessTier: 'free', order: 830, stackStatus: 'layered' },
  { toolId: 'mrx.tool.068-gynecomastia-tracker', slug: 'tool-068-gynecomastia-tracker', version: '1.0.0', page: Page.GYNECOMASTIA_TRACKER, href: '/smarttools/medical-monitoring/tool-068-gynecomastia-tracker', titleAr: 'متتبع التثدي', titleEn: 'Gynecomastia Tracker', accessTier: 'free', order: 840, stackStatus: 'layered' },
  { toolId: 'mrx.tool.069-detoxification-optimizer', slug: 'tool-069-detoxification-optimizer', version: '1.0.0', page: Page.DETOXIFICATION_OPTIMIZER, href: '/smarttools/medical-monitoring/tool-069-detoxification-optimizer', titleAr: 'محسّن إزالة السموم', titleEn: 'Detoxification Optimizer', accessTier: 'free', order: 850, stackStatus: 'layered' },
  { toolId: 'mrx.tool.070-oxidative-stress-calculator', slug: 'tool-070-oxidative-stress-calculator', version: '1.0.0', page: Page.OXIDATIVE_STRESS_CALCULATOR, href: '/smarttools/medical-monitoring/tool-070-oxidative-stress-calculator', titleAr: 'حاسبة الإجهاد التأكسدي', titleEn: 'Oxidative Stress Calculator', accessTier: 'free', order: 860, stackStatus: 'layered' },
  { toolId: 'mrx.tool.071-antioxidant-manager', slug: 'tool-071-antioxidant-manager', version: '1.0.0', page: Page.ANTIOXIDANT_MANAGER, href: '/smarttools/medical-monitoring/tool-071-antioxidant-manager', titleAr: 'مدير مضادات الأكسدة', titleEn: 'Antioxidant Manager', accessTier: 'free', order: 870, stackStatus: 'layered' },
  { toolId: 'mrx.tool.072-systemic-inflammation-calculator', slug: 'tool-072-systemic-inflammation-calculator', version: '1.0.0', page: Page.SYSTEMIC_INFLAMMATION_CALCULATOR, href: '/smarttools/medical-monitoring/tool-072-systemic-inflammation-calculator', titleAr: 'حاسبة الالتهاب الجهازي', titleEn: 'Systemic Inflammation Calculator', accessTier: 'free', order: 880, stackStatus: 'layered' },
  { toolId: 'mrx.tool.073-immune-system-optimizer', slug: 'tool-073-immune-system-optimizer', version: '1.0.0', page: Page.IMMUNE_SYSTEM_OPTIMIZER, href: '/smarttools/medical-monitoring/tool-073-immune-system-optimizer', titleAr: 'محسّن المناعة', titleEn: 'Immune System Optimizer', accessTier: 'free', order: 890, stackStatus: 'layered' },
  { toolId: 'mrx.tool.074-blood-pressure-tracker', slug: 'tool-074-blood-pressure-tracker', version: '1.0.0', page: Page.BLOOD_PRESSURE_TRACKER, href: '/smarttools/medical-monitoring/tool-074-blood-pressure-tracker', titleAr: 'متتبع ضغط الدم', titleEn: 'Blood Pressure Tracker', accessTier: 'free', order: 900, stackStatus: 'layered' },
  { toolId: 'mrx.tool.075-arterial-health-manager', slug: 'tool-075-arterial-health-manager', version: '1.0.0', page: Page.ARTERIAL_HEALTH_MANAGER, href: '/smarttools/medical-monitoring/tool-075-arterial-health-manager', titleAr: 'مدير صحة الشرايين', titleEn: 'Arterial Health Manager', accessTier: 'free', order: 910, stackStatus: 'layered' },
  { toolId: 'mrx.tool.076-blood-viscosity-calculator', slug: 'tool-076-blood-viscosity-calculator', version: '1.0.0', page: Page.BLOOD_VISCOSITY_CALCULATOR, href: '/smarttools/medical-monitoring/tool-076-blood-viscosity-calculator', titleAr: 'حاسبة لزوجة الدم', titleEn: 'Blood Viscosity Calculator', accessTier: 'free', order: 920, stackStatus: 'layered' },
  { toolId: 'mrx.tool.077-nitric-oxide-optimizer', slug: 'tool-077-nitric-oxide-optimizer', version: '1.0.0', page: Page.NITRIC_OXIDE_OPTIMIZER, href: '/smarttools/medical-monitoring/tool-077-nitric-oxide-optimizer', titleAr: 'محسّن أكسيد النيتريك', titleEn: 'Nitric Oxide Optimizer', accessTier: 'free', order: 930, stackStatus: 'layered' },
  { toolId: 'mrx.tool.078-endothelial-health-manager', slug: 'tool-078-endothelial-health-manager', version: '1.0.0', page: Page.ENDOTHELIAL_HEALTH_MANAGER, href: '/smarttools/medical-monitoring/tool-078-endothelial-health-manager', titleAr: 'مدير صحة البطانة الغشائية', titleEn: 'Endothelial Health Manager', accessTier: 'free', order: 940, stackStatus: 'layered' },
  { toolId: 'mrx.tool.079-fat-metabolism-calculator', slug: 'tool-079-fat-metabolism-calculator', version: '1.0.0', page: Page.FAT_METABOLISM_CALCULATOR, href: '/smarttools/body-composition/tool-079-fat-metabolism-calculator', titleAr: 'حاسبة التمثيل الغذائي للدهون', titleEn: 'Fat Metabolism Calculator', accessTier: 'free', order: 950, stackStatus: 'layered' },
  { toolId: 'mrx.tool.080-mitochondrial-optimizer', slug: 'tool-080-mitochondrial-optimizer', version: '1.0.0', page: Page.MITOCHONDRIAL_OPTIMIZER, href: '/smarttools/medical-monitoring/tool-080-mitochondrial-optimizer', titleAr: 'محسّن الميتوكوندريا', titleEn: 'Mitochondrial Optimizer', accessTier: 'free', order: 960, stackStatus: 'layered' },
  { toolId: 'mrx.tool.081-cellular-aging-calculator', slug: 'tool-081-cellular-aging-calculator', version: '1.0.0', page: Page.CELLULAR_AGING_CALCULATOR, href: '/smarttools/medical-monitoring/tool-081-cellular-aging-calculator', titleAr: 'حاسبة شيخوخة الخلايا', titleEn: 'Cellular Aging Calculator', accessTier: 'free', order: 970, stackStatus: 'layered' },
  { toolId: 'mrx.tool.082-telomere-manager', slug: 'tool-082-telomere-manager', version: '1.0.0', page: Page.TELOMERE_MANAGER, href: '/smarttools/medical-monitoring/tool-082-telomere-manager', titleAr: 'مدير التيلوميرات', titleEn: 'Telomere Manager', accessTier: 'free', order: 980, stackStatus: 'layered' },
  { toolId: 'mrx.tool.083-anti-aging-inflammation-calculator', slug: 'tool-083-anti-aging-inflammation-calculator', version: '1.0.0', page: Page.ANTI_AGING_INFLAMMATION_CALCULATOR, href: '/smarttools/medical-monitoring/tool-083-anti-aging-inflammation-calculator', titleAr: 'حاسبة الالتهاب المضاد للشيخوخة', titleEn: 'Anti-Aging Inflammation Calculator', accessTier: 'free', order: 990, stackStatus: 'layered' },
  { toolId: 'mrx.tool.084-cognitive-enhancer', slug: 'tool-084-cognitive-enhancer', version: '1.0.0', page: Page.COGNITIVE_ENHANCER, href: '/smarttools/medical-monitoring/tool-084-cognitive-enhancer', titleAr: 'محسّن الإدراك', titleEn: 'Cognitive Enhancer', accessTier: 'free', order: 1000, stackStatus: 'layered' },
  { toolId: 'mrx.tool.085-sleep-quality-manager', slug: 'tool-085-sleep-quality-manager', version: '1.0.0', page: Page.SLEEP_QUALITY_MANAGER, href: '/smarttools/medical-monitoring/tool-085-sleep-quality-manager', titleAr: 'مدير النوم', titleEn: 'Sleep Quality Manager', accessTier: 'free', order: 1010, stackStatus: 'layered' },
  { toolId: 'mrx.tool.086-cortisol-stress-calculator', slug: 'tool-086-cortisol-stress-calculator', version: '1.0.0', page: Page.CORTISOL_STRESS_CALCULATOR, href: '/smarttools/hormonal-health/tool-086-cortisol-stress-calculator', titleAr: 'حاسبة التوتر والكورتيزول', titleEn: 'Cortisol Stress Calculator', accessTier: 'free', order: 1020, stackStatus: 'layered' },
  { toolId: 'mrx.tool.087-mood-optimizer', slug: 'tool-087-mood-optimizer', version: '1.0.0', page: Page.MOOD_OPTIMIZER, href: '/smarttools/medical-monitoring/tool-087-mood-optimizer', titleAr: 'محسّن المزاج', titleEn: 'Mood Optimizer', accessTier: 'free', order: 1030, stackStatus: 'layered' },
  { toolId: 'mrx.tool.088-dopamine-tracker', slug: 'tool-088-dopamine-tracker', version: '1.0.0', page: Page.DOPAMINE_TRACKER, href: '/smarttools/medical-monitoring/tool-088-dopamine-tracker', titleAr: 'متتبع الدوبامين', titleEn: 'Dopamine Tracker', accessTier: 'free', order: 1040, stackStatus: 'layered' },
  { toolId: 'mrx.tool.089-serotonin-manager', slug: 'tool-089-serotonin-manager', version: '1.0.0', page: Page.SEROTONIN_MANAGER, href: '/smarttools/medical-monitoring/tool-089-serotonin-manager', titleAr: 'مدير السيروتونين', titleEn: 'Serotonin Manager', accessTier: 'free', order: 1050, stackStatus: 'layered' },
  { toolId: 'mrx.tool.090-female-hormone-balance-calculator', slug: 'tool-090-female-hormone-balance-calculator', version: '1.0.0', page: Page.FEMALE_HORMONE_BALANCE_CALCULATOR, href: '/smarttools/hormonal-health/tool-090-female-hormone-balance-calculator', titleAr: 'حاسبة التوازن الهرموني الأنثوي', titleEn: 'Female Hormone Balance Calculator', accessTier: 'free', order: 1060, stackStatus: 'layered' },
  { toolId: 'mrx.tool.091-female-health-optimizer', slug: 'tool-091-female-health-optimizer', version: '1.0.0', page: Page.FEMALE_HEALTH_OPTIMIZER, href: '/smarttools/hormonal-health/tool-091-female-health-optimizer', titleAr: 'سجل ملاحظات الصحة الأنثوية', titleEn: 'Female Health Observation Log', accessTier: 'free', order: 1070, stackStatus: 'layered' },
  { toolId: 'mrx.tool.092-female-dosage-calculator', slug: 'tool-092-female-dosage-calculator', version: '1.0.0', page: Page.FEMALE_DOSAGE_CALCULATOR, href: '/smarttools/hormonal-health/tool-092-female-dosage-calculator', titleAr: 'مراجعة أدلة جرعات الأندروجينات للنساء', titleEn: 'Female Androgen Dose Evidence Check', accessTier: 'free', order: 1080, stackStatus: 'layered' },
  { toolId: 'mrx.tool.093-menstrual-cycle-manager', slug: 'tool-093-menstrual-cycle-manager', version: '1.0.0', page: Page.MENSTRUAL_CYCLE_MANAGER, href: '/smarttools/reproductive-wellbeing/tool-093-menstrual-cycle-manager', titleAr: 'سجل تقويم الدورة الشهرية', titleEn: 'Menstrual Cycle Calendar Log', accessTier: 'free', order: 1090, stackStatus: 'layered' },
  { toolId: 'mrx.tool.094-pregnancy-risk-calculator', slug: 'tool-094-pregnancy-risk-calculator', version: '1.0.0', page: Page.PREGNANCY_RISK_CALCULATOR, href: '/smarttools/reproductive-wellbeing/tool-094-pregnancy-risk-calculator', titleAr: 'معلومات التعرض والدواء مع الحمل', titleEn: 'Pregnancy Exposure Information', accessTier: 'free', order: 1100, stackStatus: 'layered' },
  { toolId: 'mrx.tool.095-skin-health-optimizer', slug: 'tool-095-skin-health-optimizer', version: '1.0.0', page: Page.SKIN_HEALTH_OPTIMIZER, href: '/smarttools/medical-monitoring/tool-095-skin-health-optimizer', titleAr: 'سجل ملاحظات الجلد', titleEn: 'Skin Observation Log', accessTier: 'free', order: 1110, stackStatus: 'layered' },
  { toolId: 'mrx.tool.096-hair-nail-tracker', slug: 'tool-096-hair-nail-tracker', version: '1.0.0', page: Page.HAIR_NAIL_TRACKER, href: '/smarttools/medical-monitoring/tool-096-hair-nail-tracker', titleAr: 'سجل ملاحظات الشعر والأظافر', titleEn: 'Hair & Nail Observation Log', accessTier: 'free', order: 1120, stackStatus: 'layered' },
  { toolId: 'mrx.tool.097-hydration-balance-calculator', slug: 'tool-097-hydration-balance-calculator', version: '1.0.0', page: Page.HYDRATION_BALANCE_CALCULATOR, href: '/smarttools/nutrition/tool-097-hydration-balance-calculator', titleAr: 'قياس معدل التعرق أثناء التمرين', titleEn: 'Exercise Sweat-Rate Measurement', accessTier: 'free', order: 1130, stackStatus: 'layered' },
  { toolId: 'mrx.tool.098-sodium-potassium-manager', slug: 'tool-098-sodium-potassium-manager', version: '1.0.0', page: Page.SODIUM_POTASSIUM_MANAGER, href: '/smarttools/nutrition/tool-098-sodium-potassium-manager', titleAr: 'حاسبة نسبة الصوديوم إلى البوتاسيوم', titleEn: 'Sodium-to-Potassium Ratio Calculator', accessTier: 'free', order: 1140, stackStatus: 'layered' },
  { toolId: 'mrx.tool.099-digestive-health-optimizer', slug: 'tool-099-digestive-health-optimizer', version: '1.0.0', page: Page.DIGESTIVE_HEALTH_OPTIMIZER, href: '/smarttools/nutrition/tool-099-digestive-health-optimizer', titleAr: 'سجل الملاحظات الهضمية', titleEn: 'Digestive Observation Log', accessTier: 'free', order: 1150, stackStatus: 'layered' },
  { toolId: 'mrx.tool.100-comprehensive-report-generator', slug: 'tool-100-comprehensive-report-generator', version: '1.0.0', page: Page.COMPREHENSIVE_REPORT_GENERATOR, href: '/smarttools/platform-ai/tool-100-comprehensive-report-generator', titleAr: 'التقرير الشامل', titleEn: 'Comprehensive Report Generator', accessTier: 'free', order: 1160, stackStatus: 'layered' },
  { toolId: 'mrx.tool.101-sarm-to-aas-transition-bridge-predictor', slug: 'tool-101-sarm-to-aas-transition-bridge-predictor', version: '1.0.0', page: Page.SARM_TO_AAS_TRANSITION, href: '/smarttools/cycle-management/tool-101-sarm-to-aas-transition-bridge-predictor', titleAr: 'حاسبة الانتقال الذكي بين SARMs والستيرويدات', titleEn: 'SARM-to-AAS Transition & Bridge Predictor', accessTier: 'free', order: 1170, stackStatus: 'layered' },
  { toolId: 'mrx.tool.102-subcutaneous-vs-intramuscular-pk-modeler', slug: 'tool-102-subcutaneous-vs-intramuscular-pk-modeler', version: '1.0.0', page: Page.SUBCUTANEOUS_VS_INTRAMUSCULAR, href: '/smarttools/pharmacokinetics/tool-102-subcutaneous-vs-intramuscular-pk-modeler', titleAr: 'حاسبة مقارنة الحقن العضلي وتحت الجلد', titleEn: 'Subcutaneous vs. Intramuscular PK Modeler', accessTier: 'free', order: 1180, stackStatus: 'layered' },
  { toolId: 'mrx.tool.103-renal-function-hydration-index', slug: 'tool-103-renal-function-hydration-index', version: '1.0.0', page: Page.RENAL_FUNCTION_HYDRATION, href: '/smarttools/medical-monitoring/tool-103-renal-function-hydration-index', titleAr: 'مؤشر وظائف الكلى والترطيب المتقدم', titleEn: 'Renal Function & Hydration Index', accessTier: 'free', order: 1190, stackStatus: 'layered' },
  { toolId: 'mrx.tool.104-thyroid-metabolic-rate-dynamics', slug: 'tool-104-thyroid-metabolic-rate-dynamics', version: '1.0.0', page: Page.THYROID_METABOLIC_RATE, href: '/smarttools/hormonal-health/tool-104-thyroid-metabolic-rate-dynamics', titleAr: 'حاسبة ديناميكيات الغدة الدرقية ومعدل الأيض', titleEn: 'Thyroid Function & Metabolic Rate Dynamics', accessTier: 'free', order: 1200, stackStatus: 'layered' },
  { toolId: 'mrx.tool.105-ai-health-data-fusion-hub', slug: 'tool-105-ai-health-data-fusion-hub', version: '1.0.0', page: Page.AI_HEALTH_DATA_FUSION, href: '/smarttools/platform-ai/tool-105-ai-health-data-fusion-hub', titleAr: 'مركز دمج بيانات الصحة الذكي (FHIR)', titleEn: 'AI Health Data Fusion Hub & Timeline', accessTier: 'free', order: 1210, stackStatus: 'layered' },
  { toolId: 'mrx.tool.106-glycogen-supercompensation-water-modeler', slug: 'tool-106-glycogen-supercompensation-water-modeler', version: '1.0.0', page: Page.GLYCOGEN_SUPERCOMPENSATION_WATER, href: '/smarttools/nutrition/tool-106-glycogen-supercompensation-water-modeler', titleAr: 'حاسبة التحميل النشوي الفائق', titleEn: 'Glycogen Supercompensation & Water Retention Modeler', accessTier: 'free', order: 1220, stackStatus: 'layered' },
  { toolId: 'mrx.tool.107-contest-prep-peak-week-manipulator', slug: 'tool-107-contest-prep-peak-week-manipulator', version: '1.0.0', page: Page.CONTEST_PREP_PEAK_WEEK, href: '/smarttools/cycle-management/tool-107-contest-prep-peak-week-manipulator', titleAr: 'حاسبة أسبوع الذروة قبل البطولة', titleEn: 'Contest Prep Peak-Week Manipulator', accessTier: 'free', order: 1230, stackStatus: 'layered' },
  { toolId: 'mrx.tool.108-ai-body-composition-vision-engine', slug: 'tool-108-ai-body-composition-vision-engine', version: '1.0.0', page: Page.AI_BODY_COMPOSITION_VISION, href: '/smarttools/body-composition/tool-108-ai-body-composition-vision-engine', titleAr: 'محرك التحليل البصري الذكي لتكوين الجسد', titleEn: 'AI Body Composition Vision Engine', accessTier: 'free', order: 1240, stackStatus: 'layered' },
  { toolId: 'mrx.tool.109-competition-readiness-posing-os', slug: 'tool-109-competition-readiness-posing-os', version: '1.0.0', page: Page.COMPETITION_READINESS_POSING, href: '/smarttools/cycle-management/tool-109-competition-readiness-posing-os', titleAr: 'نظام الاستعداد للبطولات والاستعراض', titleEn: 'Competition Readiness & Stage Posing OS', accessTier: 'free', order: 1250, stackStatus: 'layered' },
  { toolId: 'mrx.tool.110-ai-meal-vision-scanner', slug: 'tool-110-ai-meal-vision-scanner', version: '1.0.0', page: Page.AI_MEAL_VISION_SCANNER, href: '/smarttools/nutrition/tool-110-ai-meal-vision-scanner', titleAr: 'ماسح الوجبات الذكي بالرؤية الحاسوبية', titleEn: 'AI Meal Vision Scanner & Portion Estimator', accessTier: 'free', order: 1260, stackStatus: 'layered' },
  { toolId: 'mrx.tool.111-smart-food-macro-substitution', slug: 'tool-111-smart-food-macro-substitution', version: '1.0.0', page: Page.SMART_FOOD_MACRO_SUBSTITUTION, href: '/smarttools/nutrition/tool-111-smart-food-macro-substitution', titleAr: 'محرك استبدال الطعام الذكي بالمكرويات', titleEn: 'Smart Food & Macro Substitution Engine', accessTier: 'free', order: 1270, stackStatus: 'layered' },
  { toolId: 'mrx.tool.112-food-quality-micronutrient-diversity-score', slug: 'tool-112-food-quality-micronutrient-diversity-score', version: '1.0.0', page: Page.FOOD_QUALITY_MICRONUTRIENT_DIVERSITY, href: '/smarttools/nutrition/tool-112-food-quality-micronutrient-diversity-score', titleAr: 'مؤشر جودة الغذاء وتنوع المغذيات الدقيقة', titleEn: 'Food Quality & Micronutrient Diversity Score', accessTier: 'free', order: 1280, stackStatus: 'layered' },
  { toolId: 'mrx.tool.113-ai-grocery-basket-meal-cost-optimizer', slug: 'tool-113-ai-grocery-basket-meal-cost-optimizer', version: '1.0.0', page: Page.AI_GROCERY_BASKET_MEAL_COST, href: '/smarttools/nutrition/tool-113-ai-grocery-basket-meal-cost-optimizer', titleAr: 'مجمّع سلة التسوق الذكية', titleEn: 'AI Grocery Basket & Meal Cost Optimizer', accessTier: 'free', order: 1290, stackStatus: 'layered' },
  { toolId: 'mrx.tool.114-restaurant-macro-navigator', slug: 'tool-114-restaurant-macro-navigator', version: '1.0.0', page: Page.RESTAURANT_MACRO_NAVIGATOR, href: '/smarttools/nutrition/tool-114-restaurant-macro-navigator', titleAr: 'دليل الماكروز للمطاعم والوجبات السريعة', titleEn: 'Restaurant Macro Navigator & Fast-Food Estimator', accessTier: 'free', order: 1300, stackStatus: 'layered' },
  { toolId: 'mrx.tool.115-supplement-evidence-bio-stack-navigator', slug: 'tool-115-supplement-evidence-bio-stack-navigator', version: '1.0.0', page: Page.SUPPLEMENT_EVIDENCE_BIO_STACK, href: '/smarttools/nutrition/tool-115-supplement-evidence-bio-stack-navigator', titleAr: 'المرجع العلمي للمكملات وتفاعلاتها', titleEn: 'Supplement Evidence & Bio-Stack Navigator', accessTier: 'free', order: 1310, stackStatus: 'layered' },
  { toolId: 'mrx.tool.116-nutrition-gap-fasting-window-optimizer', slug: 'tool-116-nutrition-gap-fasting-window-optimizer', version: '1.0.0', page: Page.NUTRITION_GAP_FASTING_WINDOW, href: '/smarttools/nutrition/tool-116-nutrition-gap-fasting-window-optimizer', titleAr: 'كاشف الفجوات الغذائية ومنظم الصيام المتقطع', titleEn: 'Nutrition Gap & Fasting Window Optimizer', accessTier: 'free', order: 1320, stackStatus: 'layered' },
  { toolId: 'mrx.tool.117-intra-workout-nutrient-volumizer', slug: 'tool-117-intra-workout-nutrient-volumizer', version: '1.0.0', page: Page.INTRA_WORKOUT_NUTRIENT_VOLUMIZER, href: '/smarttools/nutrition/tool-117-intra-workout-nutrient-volumizer', titleAr: 'محرك المغذيات أثناء التدريب', titleEn: 'Intra-Workout Nutrient Volumizer & Transport Engine', accessTier: 'free', order: 1330, stackStatus: 'layered' },
  { toolId: 'mrx.tool.118-cns-recovery-score', slug: 'tool-118-cns-recovery-score', version: '1.0.0', page: Page.CNS_RECOVERY_SCORE, href: '/smarttools/training-recovery/tool-118-cns-recovery-score', titleAr: 'مؤشر استشفاء الجهاز العصبي المركزي', titleEn: 'CNS Recovery Score', accessTier: 'free', order: 1331, stackStatus: 'layered' },
  { toolId: 'mrx.tool.119-training-volume-hypertrophy-index', slug: 'tool-119-training-volume-hypertrophy-index', version: '1.0.0', page: Page.TRAINING_VOLUME_HYPERTROPHY_INDEX, href: '/smarttools/training-recovery/tool-119-training-volume-hypertrophy-index', titleAr: 'مؤشر حجم التدريب والتضخم العضلي', titleEn: 'Training Volume Load & Hypertrophy Index', accessTier: 'free', order: 1332, stackStatus: 'layered' },
  { toolId: 'mrx.tool.120-progressive-overload-predictor', slug: 'tool-120-progressive-overload-predictor', version: '1.0.0', page: Page.PROGRESSIVE_OVERLOAD_PREDICTOR, href: '/smarttools/training-recovery/tool-120-progressive-overload-predictor', titleAr: 'حاسبة التحميل التدريجي والاحتياطي التكيفي', titleEn: 'Progressive Overload & Adaptive Reserve Capacity Predictor', accessTier: 'free', order: 1333, stackStatus: 'layered' },
  { toolId: 'mrx.tool.121-muscle-group-recovery-modeler', slug: 'tool-121-muscle-group-recovery-modeler', version: '1.0.0', page: Page.MUSCLE_GROUP_RECOVERY_MODELER, href: '/smarttools/training-recovery/tool-121-muscle-group-recovery-modeler', titleAr: 'محاكي زمن استشفاء المجموعات العضلية', titleEn: 'Muscle Group Recovery Time-Course Modeler', accessTier: 'free', order: 1334, stackStatus: 'layered' },
  { toolId: 'mrx.tool.122-rpe-rir-1rm-velocity-modeler', slug: 'tool-122-rpe-rir-1rm-velocity-modeler', version: '1.0.0', page: Page.RPE_RIR_1RM_VELOCITY_MODELER, href: '/smarttools/training-recovery/tool-122-rpe-rir-1rm-velocity-modeler', titleAr: 'حاسبة الوزن الأقصى الديناميكية', titleEn: 'RPE / RIR to 1RM Dynamic Velocity Modeler', accessTier: 'free', order: 1335, stackStatus: 'layered' },
  { toolId: 'mrx.tool.123-joint-stress-connective-tissue-index', slug: 'tool-123-joint-stress-connective-tissue-index', version: '1.0.0', page: Page.JOINT_STRESS_CONNECTIVE_TISSUE_INDEX, href: '/smarttools/training-recovery/tool-123-joint-stress-connective-tissue-index', titleAr: 'مؤشر إجهاد المفاصل والأنسجة الرابطة', titleEn: 'Joint Stress & Connective Tissue Load Risk Index', accessTier: 'free', order: 1336, stackStatus: 'layered' },
  { toolId: 'mrx.tool.124-deload-frequency-fatigue-modeler', slug: 'tool-124-deload-frequency-fatigue-modeler', version: '1.0.0', page: Page.DELOAD_FREQUENCY_FATIGUE_MODELER, href: '/smarttools/training-recovery/tool-124-deload-frequency-fatigue-modeler', titleAr: 'حاسبة توقيت أسبوع التفريغ', titleEn: 'Deload Frequency & Fatigue Accumulation Modeler', accessTier: 'free', order: 1337, stackStatus: 'layered' },
  { toolId: 'mrx.tool.125-fiber-type-mechanical-tension-score', slug: 'tool-125-fiber-type-mechanical-tension-score', version: '1.0.0', page: Page.FIBER_TYPE_MECHANICAL_TENSION_SCORE, href: '/smarttools/training-recovery/tool-125-fiber-type-mechanical-tension-score', titleAr: 'حاسبة استهداف أنواع الألياف العضلية', titleEn: 'Fiber Type Adaptation & Mechanical Tension Score', accessTier: 'free', order: 1338, stackStatus: 'layered' },
  { toolId: 'mrx.tool.126-neuromuscular-explosiveness-modeler', slug: 'tool-126-neuromuscular-explosiveness-modeler', version: '1.0.0', page: Page.NEUROMUSCULAR_EXPLOSIVENESS_MODELER, href: '/smarttools/training-recovery/tool-126-neuromuscular-explosiveness-modeler', titleAr: 'حاسبة الأداء العصبي العضلي والانفجارية', titleEn: 'Neuromuscular Performance & Explosiveness Modeler', accessTier: 'free', order: 1338.1, stackStatus: 'layered' },
  { toolId: 'mrx.tool.127-ai-daily-readiness-explainer', slug: 'tool-127-ai-daily-readiness-explainer', version: '1.0.0', page: Page.AI_DAILY_READINESS_EXPLAINER, href: '/smarttools/training-recovery/tool-127-ai-daily-readiness-explainer', titleAr: 'محرك الجاهزية اليومية وتفسير الأسباب', titleEn: 'Daily Readiness & Cause Explainer', accessTier: 'free', order: 1338.2, stackStatus: 'layered' },
  { toolId: 'mrx.tool.128-training-load-acute-chronic-ratio', slug: 'tool-128-training-load-acute-chronic-ratio', version: '1.0.0', page: Page.TRAINING_LOAD_ACUTE_CHRONIC_RATIO, href: '/smarttools/training-recovery/tool-128-training-load-acute-chronic-ratio', titleAr: 'حاسبة التوازن بين الحمل الحاد والتراكمي', titleEn: 'Training Load Balance & Acute-to-Chronic Ratio', accessTier: 'free', order: 1338.3, stackStatus: 'layered' },
  { toolId: 'mrx.tool.129-ai-adaptive-training-planner', slug: 'tool-129-ai-adaptive-training-planner', version: '1.0.0', page: Page.AI_ADAPTIVE_TRAINING_PLANNER, href: '/smarttools/training-recovery/tool-129-ai-adaptive-training-planner', titleAr: 'مصمم البرامج التدريبية التكيفي', titleEn: 'Adaptive Training Program Planner', accessTier: 'free', order: 1338.4, stackStatus: 'layered' },
  { toolId: 'mrx.tool.130-ai-plateau-detective', slug: 'tool-130-ai-plateau-detective', version: '1.0.0', page: Page.AI_PLATEAU_DETECTIVE, href: '/smarttools/training-recovery/tool-130-ai-plateau-detective', titleAr: 'المحقق الإرشادي لكشف ثبات التقدم', titleEn: 'Plateau Signal Heuristic', accessTier: 'free', order: 1338.5, stackStatus: 'layered' },
  { toolId: 'mrx.tool.131-transformation-forecast-trajectory-engine', slug: 'tool-131-transformation-forecast-trajectory-engine', version: '1.0.0', page: Page.TRANSFORMATION_FORECAST_TRAJECTORY, href: '/smarttools/body-composition/tool-131-transformation-forecast-trajectory-engine', titleAr: 'سيناريو مسار التحول الجسدي', titleEn: 'Body Transformation Scenario', accessTier: 'free', order: 1338.6, stackStatus: 'layered' },
  { toolId: 'mrx.tool.148-personal-fitness-memory-layer', slug: 'tool-148-personal-fitness-memory-layer', version: '1.0.0', page: Page.PERSONAL_FITNESS_MEMORY_LAYER, href: '/smarttools/platform-ai/tool-148-personal-fitness-memory-layer', titleAr: 'سياق اللياقة المؤقت للجلسة', titleEn: 'Session-only Personal Fitness Context', accessTier: 'free', order: 1338.62, stackStatus: 'layered' },
  { toolId: 'mrx.tool.149-physique-trajectory-simulator', slug: 'tool-149-physique-trajectory-simulator', version: '1.0.0', page: Page.PHYSIQUE_TRAJECTORY_SIMULATOR, href: '/smarttools/body-composition/tool-149-physique-trajectory-simulator', titleAr: 'محاكي سيناريوهات المسار الجسدي', titleEn: 'Physique Trajectory Scenario Simulator', accessTier: 'free', order: 1338.65, stackStatus: 'layered' },
  { toolId: 'mrx.tool.133-rep-tempo-velocity-loss-analyzer', slug: 'tool-133-rep-tempo-velocity-loss-analyzer', version: '1.0.0', page: Page.REP_TEMPO_VELOCITY_LOSS_ANALYZER, href: '/smarttools/training-recovery/tool-133-rep-tempo-velocity-loss-analyzer', titleAr: 'تحليل السرعة والإيقاع بين المجموعات', titleEn: 'Between-set Velocity & Tempo Analysis', accessTier: 'free', order: 1338.7, stackStatus: 'layered' },
  { toolId: 'mrx.tool.134-mobility-movement-symmetry-screen', slug: 'tool-134-mobility-movement-symmetry-screen', version: '1.0.0', page: Page.MOBILITY_MOVEMENT_SYMMETRY_SCREEN, href: '/smarttools/training-recovery/tool-134-mobility-movement-symmetry-screen', titleAr: 'فحص مقارنة الحركة بين الجانبين', titleEn: 'Side-to-side Movement Screen', accessTier: 'free', order: 1338.8, stackStatus: 'layered' },
  { toolId: 'mrx.tool.135-exercise-substitution-ai', slug: 'tool-135-exercise-substitution-ai', version: '1.0.0', page: Page.EXERCISE_SUBSTITUTION_AI, href: '/smarttools/training-recovery/tool-135-exercise-substitution-ai', titleAr: 'خيارات بديلة لحركة التمرين', titleEn: 'Movement Substitution Options', accessTier: 'free', order: 1338.9, stackStatus: 'layered' },
  { toolId: 'mrx.tool.136-physique-golden-ratio-score', slug: 'tool-136-physique-golden-ratio-score', version: '1.0.0', page: Page.PHYSIQUE_GOLDEN_RATIO_SCORE, href: '/smarttools/body-composition/tool-136-physique-golden-ratio-score', titleAr: 'مقارنة نسب محيطات القوام', titleEn: 'Physique Circumference Ratio Comparison', accessTier: 'free', order: 1339, stackStatus: 'layered' },
  { toolId: 'mrx.tool.140-dosage-unit-conversion-engine', slug: 'tool-140-dosage-unit-conversion-engine', version: '1.0.0', page: Page.DOSAGE_UNIT_CONVERSION_ENGINE, href: '/smarttools/pharmacokinetics/tool-140-dosage-unit-conversion-engine', titleAr: 'محول وحدات نتائج المختبر', titleEn: 'Lab Result Unit Converter', accessTier: 'free', order: 1339.1, stackStatus: 'layered' },
  { toolId: 'mrx.tool.145-habit-intelligence-consistency-coach', slug: 'tool-145-habit-intelligence-consistency-coach', version: '1.0.0', page: Page.HABIT_INTELLIGENCE_CONSISTENCY_COACH, href: '/smarttools/platform-ai/tool-145-habit-intelligence-consistency-coach', titleAr: 'متابعة الالتزام بالعادات الأسبوعية', titleEn: 'Weekly Habit Consistency Tracker', accessTier: 'free', order: 1339.2, stackStatus: 'layered' },
  { toolId: 'mrx.tool.146-ai-safety-gate-emergency-protocol', slug: 'tool-146-ai-safety-gate-emergency-protocol', version: '1.0.0', page: Page.EMERGENCY_WARNING_SIGNS_CHECKLIST, href: '/smarttools/platform-ai/tool-146-ai-safety-gate-emergency-protocol', titleAr: 'قائمة إشارات الطوارئ', titleEn: 'Emergency Warning Signs Checklist', accessTier: 'free', order: 1339.25, stackStatus: 'layered' },
  { toolId: 'mrx.tool.147-scientific-evidence-explorer', slug: 'tool-147-scientific-evidence-explorer', version: '1.0.0', page: Page.SCIENTIFIC_EVIDENCE_EXPLORER, href: '/smarttools/platform-ai/tool-147-scientific-evidence-explorer', titleAr: 'مستكشف الأدلة العلمية والبحث عن المراجع', titleEn: 'Scientific Evidence Explorer & Citation Search', accessTier: 'free', order: 1339.26, stackStatus: 'layered' },
  { toolId: 'mrx.tool.150-ai-performance-command-center', slug: 'tool-150-ai-performance-command-center', version: '1.0.0', page: Page.MANUAL_PERFORMANCE_RESULTS_ORGANIZER, href: '/smarttools/platform-ai/tool-150-ai-performance-command-center', titleAr: 'منظّم نتائج الأداء اليدوي', titleEn: 'Manual Performance Results Organizer', accessTier: 'free', order: 1339.5, stackStatus: 'layered' },
  { toolId: 'mrx.tool.151-accumulation-half-life-simulator', slug: 'tool-151-accumulation-half-life-simulator', version: '7.0.0', page: Page.V7_ACCUMULATION_HALF_LIFE_SIMULATOR, href: '/smarttools/pharmacokinetics/tool-151-accumulation-half-life-simulator', titleAr: 'محاكي تراكم نصف العمر', titleEn: 'Accumulation Half-Life Simulator', accessTier: 'free', order: 1380, stackStatus: 'layered' },
  { toolId: 'mrx.tool.152-side-effect-tracker', slug: 'tool-152-side-effect-tracker', version: '7.0.0', page: Page.V7_SIDE_EFFECT_TRACKER, href: '/smarttools/reproductive-wellbeing/tool-152-side-effect-tracker', titleAr: 'سجل الملاحظات الجسدية', titleEn: 'Side-Effect Observation Log', accessTier: 'free', order: 1381, stackStatus: 'layered' },
  { toolId: 'mrx.tool.153-injection-site-rotator', slug: 'tool-153-injection-site-rotator', version: '7.0.0', page: Page.V7_INJECTION_SITE_ROTATOR, href: '/smarttools/pharmacokinetics/tool-153-injection-site-rotator', titleAr: 'سجل مواقع الحقن', titleEn: 'Injection Site Observation Log', accessTier: 'free', order: 1382, stackStatus: 'layered' },
  { toolId: 'mrx.tool.154-compound-stack-builder', slug: 'tool-154-compound-stack-builder', version: '7.0.0', page: Page.V7_COMPOUND_STACK_BUILDER, href: '/smarttools/pharmacokinetics/tool-154-compound-stack-builder', titleAr: 'سجل المركبات', titleEn: 'Compound Observation Record', accessTier: 'free', order: 1383, stackStatus: 'layered' },
  { toolId: 'mrx.tool.156-water-retention', slug: 'tool-156-water-retention', version: '7.0.0', page: Page.V7_WATER_RETENTION, href: '/smarttools/pharmacokinetics/tool-156-water-retention', titleAr: 'حاسبة ملاحظة الوزن', titleEn: 'Water Weight Observation', accessTier: 'free', order: 1400, stackStatus: 'layered' },
  { toolId: 'mrx.tool.157-multi-compound-half-life', slug: 'tool-157-multi-compound-half-life', version: '7.0.0', page: Page.V7_MULTI_COMPOUND_HALF_LIFE, href: '/smarttools/pharmacokinetics/tool-157-multi-compound-half-life', titleAr: 'حاسبة أعمار النصف المتعددة', titleEn: 'Multi-Compound Half-Life Calculator', accessTier: 'free', order: 1401, stackStatus: 'layered' },
  { toolId: 'mrx.tool.158-volume-measurement', slug: 'tool-158-volume-measurement', version: '7.0.0', page: Page.V7_VOLUME_MEASUREMENT, href: '/smarttools/pharmacokinetics/tool-158-volume-measurement', titleAr: 'قياس نسبة الحجم', titleEn: 'Volume Measurement Ratio', accessTier: 'free', order: 1402, stackStatus: 'layered' },
  { toolId: 'mrx.tool.159-compound-half-life-stacker', slug: 'tool-159-compound-half-life-stacker', version: '7.0.0', page: Page.V7_HALF_LIFE_STACKER, href: '/smarttools/pharmacokinetics/tool-159-compound-half-life-stacker', titleAr: 'سيناريو تلاشي أعمار النصف', titleEn: 'Half-Life Decay Scenario', accessTier: 'free', order: 1403, stackStatus: 'layered' },
  { toolId: 'mrx.tool.160-genetic-potential', slug: 'tool-160-genetic-potential', version: '7.0.0', page: Page.V7_GENETIC_POTENTIAL, href: '/smarttools/body-composition/tool-160-genetic-potential', titleAr: 'مؤشر قياسات توضيحي', titleEn: 'Illustrative Measurement Index', accessTier: 'free', order: 1404, stackStatus: 'layered' },
  { toolId: 'mrx.tool.161-peptide-protocol-planner', slug: 'tool-161-peptide-protocol-planner', version: '7.0.0', page: Page.V7_PEPTIDE_PROTOCOL, href: '/smarttools/pharmacokinetics/tool-161-peptide-protocol-planner', titleAr: 'سجل ملاحظات الببتيدات', titleEn: 'Peptide Note Record', accessTier: 'free', order: 1410, stackStatus: 'layered' },
  { toolId: 'mrx.tool.162-oral-cycle-planner', slug: 'tool-162-oral-cycle-planner', version: '7.0.0', page: Page.V7_ORAL_CYCLE, href: '/smarttools/pharmacokinetics/tool-162-oral-cycle-planner', titleAr: 'سجل ملاحظات الدورة الفموية', titleEn: 'Oral Cycle Note Record', accessTier: 'free', order: 1411, stackStatus: 'layered' },
  { toolId: 'mrx.tool.163-trt-optimization-engine', slug: 'tool-163-trt-optimization-engine', version: '7.0.0', page: Page.V7_TRT_COMPARISON, href: '/smarttools/pharmacokinetics/tool-163-trt-optimization-engine', titleAr: 'مقارنة قيم هرمونية', titleEn: 'Value Comparison', accessTier: 'free', order: 1412, stackStatus: 'layered' },
  { toolId: 'mrx.tool.164-post-cycle-bloodwork-interpreter', slug: 'tool-164-post-cycle-bloodwork-interpreter', version: '7.0.0', page: Page.V7_LAB_OBSERVATION, href: '/smarttools/pharmacokinetics/tool-164-post-cycle-bloodwork-interpreter', titleAr: 'سجل التحاليل', titleEn: 'Lab Observation Record', accessTier: 'free', order: 1413, stackStatus: 'layered' },
  { toolId: 'mrx.tool.165-drug-interaction-checker-pro', slug: 'tool-165-drug-interaction-checker-pro', version: '7.0.0', page: Page.V7_INTERACTION_RECORD, href: '/smarttools/pharmacokinetics/tool-165-drug-interaction-checker-pro', titleAr: 'سجل المواد المدخلة', titleEn: 'Interaction Item Record', accessTier: 'free', order: 1414, stackStatus: 'layered' },
  { toolId: 'mrx.tool.166-injection-pain-minimizer', slug: 'tool-166-injection-pain-minimizer', version: '7.0.0', page: Page.V7_PAIN_NOTE, href: '/smarttools/pharmacokinetics/tool-166-injection-pain-minimizer', titleAr: 'سجل ملاحظة الألم', titleEn: 'Pain Note Record', accessTier: 'free', order: 1420, stackStatus: 'layered' },
  { toolId: 'mrx.tool.167-ester-conversion', slug: 'tool-167-ester-conversion', version: '7.0.0', page: Page.V7_ESTER_CONVERSION, href: '/smarttools/pharmacokinetics/tool-167-ester-conversion', titleAr: 'تحويل وحدات عام', titleEn: 'Generic Unit Conversion', accessTier: 'free', order: 1421, stackStatus: 'layered' },
  { toolId: 'mrx.tool.168-compound-stacking-synergy', slug: 'tool-168-compound-stacking-synergy', version: '7.0.0', page: Page.V7_SYNERGY_RECORD, href: '/smarttools/pharmacokinetics/tool-168-compound-stacking-synergy', titleAr: 'سجل العناصر', titleEn: 'Item List Record', accessTier: 'free', order: 1422, stackStatus: 'layered' },
  { toolId: 'mrx.tool.169-side-effect-early-warning', slug: 'tool-169-side-effect-early-warning', version: '7.0.0', page: Page.V7_EARLY_WARNING, href: '/smarttools/pharmacokinetics/tool-169-side-effect-early-warning', titleAr: 'فحص إشارات مختارة', titleEn: 'Explicit Signal Checklist', accessTier: 'free', order: 1423, stackStatus: 'layered' },
  { toolId: 'mrx.tool.170-cycle-cost', slug: 'tool-170-cycle-cost', version: '7.0.0', page: Page.V7_CYCLE_COST, href: '/smarttools/pharmacokinetics/tool-170-cycle-cost', titleAr: 'جمع التكلفة', titleEn: 'Cost Sum Calculator', accessTier: 'free', order: 1424, stackStatus: 'layered' },
  { toolId: 'mrx.tool.171-cycle-length-optimizer', slug: 'tool-171-cycle-length-optimizer', version: '7.0.0', page: Page.V7_CYCLE_INTERVAL, href: '/smarttools/pharmacokinetics/tool-171-cycle-length-optimizer', titleAr: 'سجل الفترة', titleEn: 'Interval Record', accessTier: 'free', order: 1430, stackStatus: 'layered' },
  { toolId: 'mrx.tool.172-bloodwork-trend-analyzer', slug: 'tool-172-bloodwork-trend-analyzer', version: '7.0.0', page: Page.V7_BLOODWORK_TREND, href: '/smarttools/pharmacokinetics/tool-172-bloodwork-trend-analyzer', titleAr: 'فرق القيم', titleEn: 'Value Delta', accessTier: 'free', order: 1431, stackStatus: 'layered' },
  { toolId: 'mrx.tool.173-compound-clearance', slug: 'tool-173-compound-clearance', version: '7.0.0', page: Page.V7_CLEARANCE_SCENARIO, href: '/smarttools/pharmacokinetics/tool-173-compound-clearance', titleAr: 'سيناريو الاضمحلال', titleEn: 'Decay Scenario', accessTier: 'free', order: 1432, stackStatus: 'layered' },
  { toolId: 'mrx.tool.174-hormone-conversion', slug: 'tool-174-hormone-conversion', version: '7.0.0', page: Page.V7_HORMONE_CONVERSION, href: '/smarttools/pharmacokinetics/tool-174-hormone-conversion', titleAr: 'تحويل وحدات', titleEn: 'Unit Conversion', accessTier: 'free', order: 1433, stackStatus: 'layered' },
  { toolId: 'mrx.tool.175-injection-schedule-planner', slug: 'tool-175-injection-schedule-planner', version: '7.0.0', page: Page.V7_SCHEDULE_RECORD, href: '/smarttools/pharmacokinetics/tool-175-injection-schedule-planner', titleAr: 'سجل التواريخ', titleEn: 'Date Record', accessTier: 'free', order: 1434, stackStatus: 'layered' },
  { toolId: 'mrx.tool.176-side-effect-probability', slug: 'tool-176-side-effect-probability', version: '7.0.0', page: Page.V7_PROBABILITY_NOTE, href: '/smarttools/pharmacokinetics/tool-176-side-effect-probability', titleAr: 'سجل ملاحظة الأعراض', titleEn: 'Symptom Note Record', accessTier: 'free', order: 1440, stackStatus: 'layered' },
  { toolId: 'mrx.tool.177-stack-compatibility-checker', slug: 'tool-177-stack-compatibility-checker', version: '7.0.0', page: Page.V7_COMPATIBILITY_RECORD, href: '/smarttools/pharmacokinetics/tool-177-stack-compatibility-checker', titleAr: 'سجل قائمة العناصر', titleEn: 'Compatibility Item Record', accessTier: 'free', order: 1441, stackStatus: 'layered' },
  { toolId: 'mrx.tool.178-dht-side-effect-predictor', slug: 'tool-178-dht-side-effect-predictor', version: '7.0.0', page: Page.V7_DHT_OBSERVATION, href: '/smarttools/reproductive-wellbeing/tool-178-dht-side-effect-predictor', titleAr: 'سجل ملاحظة DHT', titleEn: 'DHT Observation Record', accessTier: 'free', order: 1442, stackStatus: 'layered' },
  { toolId: 'mrx.tool.179-cycle-break-planner', slug: 'tool-179-cycle-break-planner', version: '7.0.0', page: Page.V7_BREAK_DATES, href: '/smarttools/reproductive-wellbeing/tool-179-cycle-break-planner', titleAr: 'سجل تواريخ الراحة', titleEn: 'Break Date Record', accessTier: 'free', order: 1443, stackStatus: 'layered' },
  { toolId: 'mrx.tool.180-trt-lifetime', slug: 'tool-180-trt-lifetime', version: '7.0.0', page: Page.V7_LIFETIME_NOTE, href: '/smarttools/reproductive-wellbeing/tool-180-trt-lifetime', titleAr: 'سجل ملاحظة TRT', titleEn: 'TRT Note Record', accessTier: 'free', order: 1444, stackStatus: 'layered' },
  { toolId: 'mrx.tool.181-fertility-preservation-guide', slug: 'tool-181-fertility-preservation-guide', version: '7.0.0', page: Page.V7_FERTILITY_NOTE, href: '/smarttools/reproductive-wellbeing/tool-181-fertility-preservation-guide', titleAr: 'سجل ملاحظة الخصوبة', titleEn: 'Fertility Note Record', accessTier: 'free', order: 1450, stackStatus: 'layered' },
  { toolId: 'mrx.tool.182-cardiovascular-risk-assessor', slug: 'tool-182-cardiovascular-risk-assessor', version: '7.0.0', page: Page.V7_CARDIO_NOTE, href: '/smarttools/medical-monitoring/tool-182-cardiovascular-risk-assessor', titleAr: 'سجل ملاحظة قلبية', titleEn: 'Cardiovascular Note Record', accessTier: 'free', order: 1451, stackStatus: 'layered' },
  { toolId: 'mrx.tool.183-bone-density-optimizer', slug: 'tool-183-bone-density-optimizer', version: '7.0.0', page: Page.V7_BONE_NOTE, href: '/smarttools/medical-monitoring/tool-183-bone-density-optimizer', titleAr: 'سجل ملاحظة العظام', titleEn: 'Bone Note Record', accessTier: 'free', order: 1452, stackStatus: 'layered' },
  { toolId: 'mrx.tool.184-mental-health-monitor', slug: 'tool-184-mental-health-monitor', version: '7.0.0', page: Page.V7_MOOD_NOTE, href: '/smarttools/medical-monitoring/tool-184-mental-health-monitor', titleAr: 'سجل المزاج', titleEn: 'Mood Note Record', accessTier: 'free', order: 1453, stackStatus: 'layered' },
  { toolId: 'mrx.tool.185-peptide-dosage', slug: 'tool-185-peptide-dosage', version: '7.0.0', page: Page.V7_PEPTIDE_ARITHMETIC, href: '/smarttools/pharmacokinetics/tool-185-peptide-dosage', titleAr: 'حساب كمية عام', titleEn: 'Generic Amount Arithmetic', accessTier: 'free', order: 1454, stackStatus: 'layered' },
  { toolId: 'mrx.tool.186-growth-hormone-protocol-planner', slug: 'tool-186-growth-hormone-protocol-planner', version: '7.0.0', page: Page.V7_GH_NOTE, href: '/smarttools/medical-monitoring/tool-186-growth-hormone-protocol-planner', titleAr: 'سجل ملاحظة GH', titleEn: 'GH Note Record', accessTier: 'free', order: 1460, stackStatus: 'layered' },
  { toolId: 'mrx.tool.187-insulin-conversion', slug: 'tool-187-insulin-conversion', version: '7.0.0', page: Page.V7_INSULIN_ARITHMETIC, href: '/smarttools/medical-monitoring/tool-187-insulin-conversion', titleAr: 'حساب وحدات عام', titleEn: 'Generic Unit Arithmetic', accessTier: 'free', order: 1461, stackStatus: 'layered' },
  { toolId: 'mrx.tool.188-glucose-tracker', slug: 'tool-188-glucose-tracker', version: '7.0.0', page: Page.V7_GLUCOSE_LOG, href: '/smarttools/medical-monitoring/tool-188-glucose-tracker', titleAr: 'سجل الجلوكوز', titleEn: 'Glucose Observation Log', accessTier: 'free', order: 1462, stackStatus: 'layered' },
  { toolId: 'mrx.tool.189-androgenic-balance', slug: 'tool-189-androgenic-balance', version: '7.0.0', page: Page.V7_ANDROGEN_NOTE, href: '/smarttools/pharmacokinetics/tool-189-androgenic-balance', titleAr: 'سجل العناصر الأندروجينية', titleEn: 'Androgen Item Record', accessTier: 'free', order: 1463, stackStatus: 'layered' },
  { toolId: 'mrx.tool.190-androgen-receptor-optimizer', slug: 'tool-190-androgen-receptor-optimizer', version: '7.0.0', page: Page.V7_RECEPTOR_NOTE, href: '/smarttools/pharmacokinetics/tool-190-androgen-receptor-optimizer', titleAr: 'سجل ملاحظة المستقبلات', titleEn: 'Receptor Note Record', accessTier: 'free', order: 1464, stackStatus: 'layered' },
  { toolId: 'mrx.tool.191-5-alpha-conversion', slug: 'tool-191-5-alpha-conversion', version: '7.0.0', page: Page.V7_ALPHA_ARITHMETIC, href: '/smarttools/pharmacokinetics/tool-191-5-alpha-conversion', titleAr: 'تحويل وحدات عام', titleEn: 'Generic Unit Arithmetic', accessTier: 'free', order: 1470, stackStatus: 'layered' },
  { toolId: 'mrx.tool.192-hair-loss-tracker', slug: 'tool-192-hair-loss-tracker', version: '7.0.0', page: Page.V7_HAIR_LOG, href: '/smarttools/reproductive-wellbeing/tool-192-hair-loss-tracker', titleAr: 'سجل ملاحظة الشعر', titleEn: 'Hair Observation Log', accessTier: 'free', order: 1471, stackStatus: 'layered' },
  { toolId: 'mrx.tool.193-prostate-health-manager', slug: 'tool-193-prostate-health-manager', version: '7.0.0', page: Page.V7_PROSTATE_LOG, href: '/smarttools/medical-monitoring/tool-193-prostate-health-manager', titleAr: 'سجل بيانات البروستاتا', titleEn: 'Prostate Data Record', accessTier: 'free', order: 1472, stackStatus: 'layered' },
  { toolId: 'mrx.tool.194-testicular-suppression', slug: 'tool-194-testicular-suppression', version: '7.0.0', page: Page.V7_SUPPRESSION_NOTE, href: '/smarttools/reproductive-wellbeing/tool-194-testicular-suppression', titleAr: 'سجل ملاحظة القمع', titleEn: 'Suppression Note Record', accessTier: 'free', order: 1473, stackStatus: 'layered' },
  { toolId: 'mrx.tool.195-sperm-production-optimizer', slug: 'tool-195-sperm-production-optimizer', version: '7.0.0', page: Page.V7_SPERM_NOTE, href: '/smarttools/reproductive-wellbeing/tool-195-sperm-production-optimizer', titleAr: 'سجل ملاحظة الخصوبة', titleEn: 'Fertility Note Record', accessTier: 'free', order: 1474, stackStatus: 'layered' },
  { toolId: 'mrx.tool.196-estrogen-sensitivity-manager', slug: 'tool-196-estrogen-sensitivity-manager', version: '7.0.0', page: Page.V7_ESTROGEN_NOTE, href: '/smarttools/reproductive-wellbeing/tool-196-estrogen-sensitivity-manager', titleAr: 'سجل ملاحظة الإستروجين', titleEn: 'Estrogen Note Record', accessTier: 'free', order: 1480, stackStatus: 'layered' },
  { toolId: 'mrx.tool.197-gynecomastia-tracker', slug: 'tool-197-gynecomastia-tracker', version: '7.0.0', page: Page.V7_GYNO_LOG, href: '/smarttools/reproductive-wellbeing/tool-197-gynecomastia-tracker', titleAr: 'سجل ملاحظة التثدي', titleEn: 'Observation Log', accessTier: 'free', order: 1481, stackStatus: 'layered' },
  { toolId: 'mrx.tool.198-detoxification-optimizer', slug: 'tool-198-detoxification-optimizer', version: '7.0.0', page: Page.V7_DETOX_NOTE, href: '/smarttools/medical-monitoring/tool-198-detoxification-optimizer', titleAr: 'سجل ملاحظة', titleEn: 'Note Record', accessTier: 'free', order: 1482, stackStatus: 'layered' },
  { toolId: 'mrx.tool.199-oxidative-stress', slug: 'tool-199-oxidative-stress', version: '7.0.0', page: Page.V7_OXIDATIVE_LOG, href: '/smarttools/medical-monitoring/tool-199-oxidative-stress', titleAr: 'سجل قيمة', titleEn: 'Value Record', accessTier: 'free', order: 1483, stackStatus: 'layered' },
  { toolId: 'mrx.tool.200-antioxidant-manager', slug: 'tool-200-antioxidant-manager', version: '7.0.0', page: Page.V7_ANTIOXIDANT_LOG, href: '/smarttools/medical-monitoring/tool-200-antioxidant-manager', titleAr: 'سجل العناصر', titleEn: 'Item Record', accessTier: 'free', order: 1484, stackStatus: 'layered' },
  { toolId: 'mrx.tool.201-systemic-inflammation', slug: 'tool-201-systemic-inflammation', version: '7.0.0', page: Page.V7_INFLAMMATION_NOTE, href: '/smarttools/medical-monitoring/tool-201-systemic-inflammation', titleAr: 'سجل ملاحظة الالتهاب', titleEn: 'Inflammation Note Record', accessTier: 'free', order: 1490, stackStatus: 'layered' },
  { toolId: 'mrx.tool.202-immune-system-optimizer', slug: 'tool-202-immune-system-optimizer', version: '7.0.0', page: Page.V7_IMMUNE_NOTE, href: '/smarttools/medical-monitoring/tool-202-immune-system-optimizer', titleAr: 'سجل ملاحظة المناعة', titleEn: 'Immune Note Record', accessTier: 'free', order: 1491, stackStatus: 'layered' },
  { toolId: 'mrx.tool.203-arterial-health-manager', slug: 'tool-203-arterial-health-manager', version: '7.0.0', page: Page.V7_ARTERIAL_NOTE, href: '/smarttools/medical-monitoring/tool-203-arterial-health-manager', titleAr: 'سجل ملاحظة الشرايين', titleEn: 'Arterial Note Record', accessTier: 'free', order: 1492, stackStatus: 'layered' },
  { toolId: 'mrx.tool.204-blood-viscosity', slug: 'tool-204-blood-viscosity', version: '7.0.0', page: Page.V7_VISCOSITY_LOG, href: '/smarttools/medical-monitoring/tool-204-blood-viscosity', titleAr: 'سجل قيمة اللزوجة', titleEn: 'Viscosity Value Record', accessTier: 'free', order: 1493, stackStatus: 'layered' },
  { toolId: 'mrx.tool.205-nitric-oxide-optimizer', slug: 'tool-205-nitric-oxide-optimizer', version: '7.0.0', page: Page.V7_NITRIC_NOTE, href: '/smarttools/medical-monitoring/tool-205-nitric-oxide-optimizer', titleAr: 'سجل ملاحظة أكسيد النيتريك', titleEn: 'Nitric Oxide Note Record', accessTier: 'free', order: 1494, stackStatus: 'layered' },
  { toolId: 'mrx.tool.206-endothelial-health-manager', slug: 'tool-206-endothelial-health-manager', version: '7.0.0', page: Page.V7_ENDOTHELIAL_NOTE, href: '/smarttools/medical-monitoring/tool-206-endothelial-health-manager', titleAr: 'سجل ملاحظة وعائية', titleEn: 'Endothelial Note Record', accessTier: 'free', order: 1500, stackStatus: 'layered' },
  { toolId: 'mrx.tool.207-fat-metabolism', slug: 'tool-207-fat-metabolism', version: '7.0.0', page: Page.V7_FAT_VALUE, href: '/smarttools/medical-monitoring/tool-207-fat-metabolism', titleAr: 'سجل قيمة الأيض', titleEn: 'Metabolism Value Record', accessTier: 'free', order: 1501, stackStatus: 'layered' },
  { toolId: 'mrx.tool.208-mitochondrial-optimizer', slug: 'tool-208-mitochondrial-optimizer', version: '7.0.0', page: Page.V7_MITO_NOTE, href: '/smarttools/medical-monitoring/tool-208-mitochondrial-optimizer', titleAr: 'سجل ملاحظة الميتوكوندريا', titleEn: 'Mitochondrial Note Record', accessTier: 'free', order: 1502, stackStatus: 'layered' },
  { toolId: 'mrx.tool.209-cellular-aging', slug: 'tool-209-cellular-aging', version: '7.0.0', page: Page.V7_AGING_VALUE, href: '/smarttools/medical-monitoring/tool-209-cellular-aging', titleAr: 'سجل قيمة الخلايا', titleEn: 'Cellular Value Record', accessTier: 'free', order: 1503, stackStatus: 'layered' },
  { toolId: 'mrx.tool.210-telomere-manager', slug: 'tool-210-telomere-manager', version: '7.0.0', page: Page.V7_TELOMERE_NOTE, href: '/smarttools/medical-monitoring/tool-210-telomere-manager', titleAr: 'سجل ملاحظة التيلوميرات', titleEn: 'Telomere Note Record', accessTier: 'free', order: 1504, stackStatus: 'layered' },
  { toolId: 'mrx.tool.211-anti-aging-inflammation', slug: 'tool-211-anti-aging-inflammation', version: '7.0.0', page: Page.V7_ANTI_AGING_NOTE, href: '/smarttools/medical-monitoring/tool-211-anti-aging-inflammation', titleAr: 'سجل ملاحظة الشيخوخة', titleEn: 'Anti-Aging Note Record', accessTier: 'free', order: 1510, stackStatus: 'layered' },
  { toolId: 'mrx.tool.212-cognitive-enhancer', slug: 'tool-212-cognitive-enhancer', version: '7.0.0', page: Page.V7_COGNITIVE_NOTE, href: '/smarttools/medical-monitoring/tool-212-cognitive-enhancer', titleAr: 'سجل ملاحظة الإدراك', titleEn: 'Cognitive Note Record', accessTier: 'free', order: 1511, stackStatus: 'layered' },
  { toolId: 'mrx.tool.213-cortisol-stress', slug: 'tool-213-cortisol-stress', version: '7.0.0', page: Page.V7_CORTISOL_NOTE, href: '/smarttools/medical-monitoring/tool-213-cortisol-stress', titleAr: 'سجل ملاحظة التوتر', titleEn: 'Stress Note Record', accessTier: 'free', order: 1512, stackStatus: 'layered' },
  { toolId: 'mrx.tool.214-mood-optimizer', slug: 'tool-214-mood-optimizer', version: '7.0.0', page: Page.V7_MOOD_RECORD, href: '/smarttools/medical-monitoring/tool-214-mood-optimizer', titleAr: 'سجل المزاج', titleEn: 'Mood Record', accessTier: 'free', order: 1513, stackStatus: 'layered' },
  { toolId: 'mrx.tool.215-dopamine-tracker', slug: 'tool-215-dopamine-tracker', version: '7.0.0', page: Page.V7_DOPAMINE_RECORD, href: '/smarttools/medical-monitoring/tool-215-dopamine-tracker', titleAr: 'سجل ملاحظة الدوبامين', titleEn: 'Dopamine Note Record', accessTier: 'free', order: 1514, stackStatus: 'layered' },
  { toolId: 'mrx.tool.216-serotonin-manager', slug: 'tool-216-serotonin-manager', version: '7.0.0', page: Page.V7_SEROTONIN_NOTE, href: '/smarttools/medical-monitoring/tool-216-serotonin-manager', titleAr: 'سجل ملاحظة السيروتونين', titleEn: 'Serotonin Note Record', accessTier: 'free', order: 1520, stackStatus: 'layered' },
  { toolId: 'mrx.tool.217-female-hormone-balance', slug: 'tool-217-female-hormone-balance', version: '7.0.0', page: Page.V7_FEMALE_BALANCE, href: '/smarttools/reproductive-wellbeing/tool-217-female-hormone-balance', titleAr: 'سجل توازن هرموني', titleEn: 'Hormone Note Record', accessTier: 'free', order: 1521, stackStatus: 'layered' },
  { toolId: 'mrx.tool.218-female-health-optimizer', slug: 'tool-218-female-health-optimizer', version: '7.0.0', page: Page.V7_FEMALE_HEALTH, href: '/smarttools/reproductive-wellbeing/tool-218-female-health-optimizer', titleAr: 'سجل ملاحظة صحية', titleEn: 'Health Note Record', accessTier: 'free', order: 1522, stackStatus: 'layered' },
  { toolId: 'mrx.tool.219-female-dosage', slug: 'tool-219-female-dosage', version: '7.0.0', page: Page.V7_FEMALE_ARITHMETIC, href: '/smarttools/measurement-conversion/tool-219-female-dosage', titleAr: 'حساب كمية عام', titleEn: 'Generic Arithmetic', accessTier: 'free', order: 1523, stackStatus: 'layered' },
  { toolId: 'mrx.tool.220-menstrual-cycle-manager', slug: 'tool-220-menstrual-cycle-manager', version: '7.0.0', page: Page.V7_MENSTRUAL_RECORD, href: '/smarttools/reproductive-wellbeing/tool-220-menstrual-cycle-manager', titleAr: 'سجل التاريخ', titleEn: 'Date Record', accessTier: 'free', order: 1524, stackStatus: 'layered' },
  { toolId: 'mrx.tool.221-pregnancy-risk', slug: 'tool-221-pregnancy-risk', version: '7.0.0', page: Page.V7_PREGNANCY_NOTE, href: '/smarttools/reproductive-wellbeing/tool-221-pregnancy-risk', titleAr: 'سجل ملاحظة الحمل', titleEn: 'Pregnancy Note Record', accessTier: 'free', order: 1530, stackStatus: 'layered' },
  { toolId: 'mrx.tool.222-skin-health-optimizer', slug: 'tool-222-skin-health-optimizer', version: '7.0.0', page: Page.V7_SKIN_NOTE, href: '/smarttools/medical-monitoring/tool-222-skin-health-optimizer', titleAr: 'سجل ملاحظة الجلد', titleEn: 'Skin Note Record', accessTier: 'free', order: 1531, stackStatus: 'layered' },
  { toolId: 'mrx.tool.223-hair-nail-tracker', slug: 'tool-223-hair-nail-tracker', version: '7.0.0', page: Page.V7_HAIR_NAIL_LOG, href: '/smarttools/medical-monitoring/tool-223-hair-nail-tracker', titleAr: 'سجل الشعر والأظافر', titleEn: 'Hair and Nail Log', accessTier: 'free', order: 1532, stackStatus: 'layered' },
  { toolId: 'mrx.tool.224-digestive-health-optimizer', slug: 'tool-224-digestive-health-optimizer', version: '7.0.0', page: Page.V7_DIGESTIVE_NOTE, href: '/smarttools/medical-monitoring/tool-224-digestive-health-optimizer', titleAr: 'سجل ملاحظة الهضم', titleEn: 'Digestive Note Record', accessTier: 'free', order: 1533, stackStatus: 'layered' },
  { toolId: 'mrx.tool.225-comprehensive-report-generator', slug: 'tool-225-comprehensive-report-generator', version: '7.0.0', page: Page.V7_REPORT_AGGREGATOR, href: '/smarttools/ai-nutrition-vision/tool-225-comprehensive-report-generator', titleAr: 'تجميع المدخلات', titleEn: 'User Entry Aggregator', accessTier: 'free', order: 1534, stackStatus: 'layered' },
  { toolId: 'mrx.tool.226-sarm-to-aas-transition-predictor', slug: 'tool-226-sarm-to-aas-transition-predictor', version: '7.0.0', page: Page.V7_SARM_NOTE, href: '/smarttools/pharmacokinetics/tool-226-sarm-to-aas-transition-predictor', titleAr: 'سجل ملاحظة الانتقال', titleEn: 'Transition Note Record', accessTier: 'free', order: 1540, stackStatus: 'layered' },
  { toolId: 'mrx.tool.227-subq-vs-im-pk-modeler', slug: 'tool-227-subq-vs-im-pk-modeler', version: '7.0.0', page: Page.V7_ROUTE_NOTE, href: '/smarttools/pharmacokinetics/tool-227-subq-vs-im-pk-modeler', titleAr: 'سجل ملاحظة المسار', titleEn: 'Route Note Record', accessTier: 'free', order: 1541, stackStatus: 'layered' },
  { toolId: 'mrx.tool.228-health-data-fusion-hub', slug: 'tool-228-health-data-fusion-hub', version: '7.0.0', page: Page.V7_FUSION_RECORD, href: '/smarttools/ai-nutrition-vision/tool-228-health-data-fusion-hub', titleAr: 'سجل البيانات', titleEn: 'Data Record', accessTier: 'free', order: 1542, stackStatus: 'layered' },
  { toolId: 'mrx.tool.229-glycogen-supercompensation-modeler', slug: 'tool-229-glycogen-supercompensation-modeler', version: '7.0.0', page: Page.V7_GLYCOGEN_NOTE, href: '/smarttools/contest-prep/tool-229-glycogen-supercompensation-modeler', titleAr: 'سجل ملاحظة الكربوهيدرات', titleEn: 'Carbohydrate Note Record', accessTier: 'free', order: 1543, stackStatus: 'layered' },
  { toolId: 'mrx.tool.230-peak-week-manipulator', slug: 'tool-230-peak-week-manipulator', version: '7.0.0', page: Page.V7_PEAK_NOTE, href: '/smarttools/contest-prep/tool-230-peak-week-manipulator', titleAr: 'سجل ملاحظة أسبوع الذروة', titleEn: 'Peak Week Note Record', accessTier: 'free', order: 1544, stackStatus: 'layered' },
  { toolId: 'mrx.tool.231-body-composition-vision-engine', slug: 'tool-231-body-composition-vision-engine', version: '7.0.0', page: Page.V7_BODY_REFERENCE, href: '/smarttools/ai-nutrition-vision/tool-231-body-composition-vision-engine', titleAr: 'سجل مرجع صورة', titleEn: 'Body Reference Record', accessTier: 'free', order: 1550, stackStatus: 'layered' },
  { toolId: 'mrx.tool.232-meal-vision-scanner', slug: 'tool-232-meal-vision-scanner', version: '7.0.0', page: Page.V7_MEAL_REFERENCE, href: '/smarttools/ai-nutrition-vision/tool-232-meal-vision-scanner', titleAr: 'سجل وصف الوجبة', titleEn: 'Meal Description Record', accessTier: 'free', order: 1551, stackStatus: 'layered' },
  { toolId: 'mrx.tool.233-food-substitution-engine', slug: 'tool-233-food-substitution-engine', version: '7.0.0', page: Page.V7_FOOD_LIST, href: '/smarttools/ai-nutrition-vision/tool-233-food-substitution-engine', titleAr: 'سجل قائمة الطعام', titleEn: 'Food List Record', accessTier: 'free', order: 1552, stackStatus: 'layered' },
  { toolId: 'mrx.tool.234-food-quality-score', slug: 'tool-234-food-quality-score', version: '7.0.0', page: Page.V7_FOOD_NOTE, href: '/smarttools/ai-nutrition-vision/tool-234-food-quality-score', titleAr: 'سجل ملاحظة الغذاء', titleEn: 'Food Note Record', accessTier: 'free', order: 1553, stackStatus: 'layered' },
  { toolId: 'mrx.tool.235-grocery-basket-optimizer', slug: 'tool-235-grocery-basket-optimizer', version: '7.0.0', page: Page.V7_BASKET_RECORD, href: '/smarttools/ai-nutrition-vision/tool-235-grocery-basket-optimizer', titleAr: 'سجل سلة الطعام', titleEn: 'Basket Record', accessTier: 'free', order: 1554, stackStatus: 'layered' },
  { toolId: 'mrx.tool.236-restaurant-macro-navigator', slug: 'tool-236-restaurant-macro-navigator', version: '7.0.0', page: Page.V7_RESTAURANT_NOTE, href: '/smarttools/ai-nutrition-vision/tool-236-restaurant-macro-navigator', titleAr: 'حاسبة بيانات ملصق وجبات المطاعم', titleEn: 'Restaurant Menu Label Calculator', accessTier: 'free', order: 1560, stackStatus: 'layered' },
  { toolId: 'mrx.tool.237-intra-workout-volumizer', slug: 'tool-237-intra-workout-volumizer', version: '7.0.0', page: Page.V7_INTRA_NOTE, href: '/smarttools/ai-nutrition-vision/tool-237-intra-workout-volumizer', titleAr: 'حاسبة ملصق منتج أثناء التدريب', titleEn: 'Intra-Workout Product Label Calculator', accessTier: 'free', order: 1561, stackStatus: 'layered' },
  { toolId: 'mrx.tool.238-fiber-type-adaptation-score', slug: 'tool-238-fiber-type-adaptation-score', version: '7.0.0', page: Page.V7_FIBER_NOTE, href: '/smarttools/contest-prep/tool-238-fiber-type-adaptation-score', titleAr: 'سجل ملاحظات الأداء المرتبطة بالألياف', titleEn: 'Fiber-Related Performance Observation Log', accessTier: 'free', order: 1562, stackStatus: 'layered' },
  { toolId: 'mrx.tool.239-peptide-reconstitution', slug: 'tool-239-peptide-reconstitution', version: '7.0.0', page: Page.V7_RECONSTITUTION_NOTE, href: '/smarttools/homebrew-chemistry/tool-239-peptide-reconstitution', titleAr: 'سجل مرجع ملصق منتج الببتيد', titleEn: 'Peptide Product Label Reference Record', accessTier: 'free', order: 1563, stackStatus: 'layered' },
  { toolId: 'mrx.tool.240-raw-powder-density-engine', slug: 'tool-240-raw-powder-density-engine', version: '7.0.0', page: Page.V7_DENSITY_ARITHMETIC, href: '/smarttools/homebrew-chemistry/tool-240-raw-powder-density-engine', titleAr: 'حاسبة كثافة عينة مقاسة', titleEn: 'Measured Sample Density Calculator', accessTier: 'free', order: 1564, stackStatus: 'layered' },
  { toolId: 'mrx.tool.246-homebrew-chemistry', slug: 'tool-246-homebrew-chemistry', version: '7.0.0', page: Page.V7_CHEMISTRY_NOTE, href: '/smarttools/homebrew-chemistry/tool-246-homebrew-chemistry', titleAr: 'سجل ملاحظات الكيمياء', titleEn: 'Chemistry Observation Log', accessTier: 'free', order: 1570, stackStatus: 'layered' },
  { toolId: 'mrx.tool.247-habit-intelligence-coach', slug: 'tool-247-habit-intelligence-coach', version: '7.0.0', page: Page.V7_HABIT_RECORD, href: '/smarttools/ai-behavior/tool-247-habit-intelligence-coach', titleAr: 'سجل متابعة العادات', titleEn: 'Habit Check-in Log', accessTier: 'free', order: 1571, stackStatus: 'layered' },
  { toolId: 'mrx.tool.248-safety-gate-emergency-protocol', slug: 'tool-248-safety-gate-emergency-protocol', version: '7.0.0', page: Page.V7_SAFETY_CHECK, href: '/smarttools/ai-behavior/tool-248-safety-gate-emergency-protocol', titleAr: 'فحص إشارات صريحة', titleEn: 'Explicit Safety Checklist', accessTier: 'free', order: 1572, stackStatus: 'layered' },
  { toolId: 'mrx.tool.249-scientific-evidence-explorer', slug: 'tool-249-scientific-evidence-explorer', version: '7.0.0', page: Page.V7_EVIDENCE_QUERY, href: '/smarttools/ai-behavior/tool-249-scientific-evidence-explorer', titleAr: 'سجل الاستعلام', titleEn: 'Query Record', accessTier: 'free', order: 1573, stackStatus: 'layered' },
  { toolId: 'mrx.tool.250-personal-fitness-memory-layer', slug: 'tool-250-personal-fitness-memory-layer', version: '7.0.0', page: Page.V7_MEMORY_RECORD, href: '/smarttools/ai-behavior/tool-250-personal-fitness-memory-layer', titleAr: 'ملاحظات لياقة مؤقتة للجلسة', titleEn: 'Session-Only Fitness Notes', accessTier: 'free', order: 1574, stackStatus: 'layered' },
  { toolId: 'mrx.tool.251-physique-trajectory-simulator', slug: 'tool-251-physique-trajectory-simulator', version: '7.0.0', page: Page.V7_SCENARIO_NOTE, href: '/smarttools/ai-behavior/tool-251-physique-trajectory-simulator', titleAr: 'سجل سيناريو', titleEn: 'Scenario Record', accessTier: 'free', order: 1575, stackStatus: 'layered' },
  { toolId: 'mrx.tool.252-command-center', slug: 'tool-252-command-center', version: '7.0.0', page: Page.V7_COMMAND_AGGREGATOR, href: '/smarttools/ai-behavior/tool-252-command-center', titleAr: 'لوحة السياق اليدوية', titleEn: 'Manual Context Board', accessTier: 'free', order: 1576, stackStatus: 'layered' },
  { toolId: 'mrx.tool.241-solvent-ratio', slug: 'tool-241-solvent-ratio', version: '7.0.0', page: Page.V7_SOLVENT_ARITHMETIC, href: '/smarttools/homebrew-chemistry/tool-241-solvent-ratio', titleAr: 'حاسبة نسبة رياضية عامة', titleEn: 'Generic Mathematical Ratio Calculator', accessTier: 'free', order: 1565, stackStatus: 'layered' },
  { toolId: 'mrx.tool.242-dosage-unit-conversion-engine', slug: 'tool-242-dosage-unit-conversion-engine', version: '7.0.0', page: Page.V7_ANALYSIS_CONVERSION, href: '/smarttools/homebrew-chemistry/tool-242-dosage-unit-conversion-engine', titleAr: 'محول وحدات القياس العامة', titleEn: 'General Measurement Unit Converter', accessTier: 'free', order: 1566, stackStatus: 'layered' },
  { toolId: 'mrx.tool.243-carrier-oil-viscosity-estimator', slug: 'tool-243-carrier-oil-viscosity-estimator', version: '7.0.0', page: Page.V7_OIL_NOTE, href: '/smarttools/homebrew-chemistry/tool-243-carrier-oil-viscosity-estimator', titleAr: 'سجل ملاحظات الزيت الناقل', titleEn: 'Carrier Oil Observation Log', accessTier: 'free', order: 1567, stackStatus: 'layered' },
  { toolId: 'mrx.tool.244-purity-yield-estimator', slug: 'tool-244-purity-yield-estimator', version: '7.0.0', page: Page.V7_YIELD_ARITHMETIC, href: '/smarttools/homebrew-chemistry/tool-244-purity-yield-estimator', titleAr: 'حاسبة نسبة المدخل إلى الناتج', titleEn: 'Generic Input/Output Ratio Calculator', accessTier: 'free', order: 1568, stackStatus: 'layered' },
  { toolId: 'mrx.tool.245-storage-stability-estimator', slug: 'tool-245-storage-stability-estimator', version: '7.0.0', page: Page.V7_STORAGE_NOTE, href: '/smarttools/homebrew-chemistry/tool-245-storage-stability-estimator', titleAr: 'سجل ملاحظات التخزين', titleEn: 'Storage Observation Log', accessTier: 'free', order: 1569, stackStatus: 'layered' },
  { toolId: 'mrx.tool.155-progress-tracker', slug: 'tool-155-progress-tracker', version: '7.0.0', page: Page.V7_PROGRESS_TRACKER, href: '/smarttools/reproductive-wellbeing/tool-155-progress-tracker', titleAr: 'سجل التقدم', titleEn: 'Progress Observation Log', accessTier: 'free', order: 1390, stackStatus: 'layered' },
  { toolId: 'mrx.tool.143-storage-stability-thermal-degradation-estimator', slug: 'tool-143-storage-stability-thermal-degradation-estimator', version: '1.0.0', page: Page.STORAGE_STABILITY_THERMAL_DEGRADATION_ESTIMATOR, href: '/smarttools/injection-formulation/tool-143-storage-stability-thermal-degradation-estimator', titleAr: 'فاحص نطاق الملصق وسجل حرارة المنتج', titleEn: 'Product Storage Label & Temperature Record Checker', accessTier: 'free', order: 1339.3, stackStatus: 'layered' },
  { toolId: 'mrx.tool.144-homebrew-chemistry-calculator', slug: 'tool-144-homebrew-chemistry-calculator', version: '1.0.0', page: Page.HOMEBREW_CHEMISTRY_CALCULATOR, href: '/smarttools/measurement-conversion/tool-144-homebrew-chemistry-calculator', titleAr: 'حاسبة عامة للكتلة والحجم والكثافة', titleEn: 'General Mass, Volume & Density Calculator', accessTier: 'free', order: 1339.4, stackStatus: 'layered' },
  { toolId: 'mrx.tool.142-compound-purity-active-yield-estimator', slug: 'tool-142-compound-purity-active-yield-estimator', version: '1.0.0', page: Page.COMPOUND_PURITY_ACTIVE_YIELD_ESTIMATOR, href: '/smarttools/injection-formulation/tool-142-compound-purity-active-yield-estimator', titleAr: 'حساب الكتلة من نتيجة اختبار مدخلة', titleEn: 'Mass Arithmetic from a User-Provided Assay', accessTier: 'free', order: 1339.35, stackStatus: 'layered' },
  { toolId: 'mrx.tool.141-carrier-oil-viscosity-syringe-pressure', slug: 'tool-141-carrier-oil-viscosity-syringe-pressure', version: '1.0.0', page: Page.CARRIER_OIL_VISCOSITY_SYRINGE_PRESSURE, href: '/smarttools/injection-formulation/tool-141-carrier-oil-viscosity-syringe-pressure', titleAr: 'حاسبة هبوط الضغط النظري في أنبوب دائري', titleEn: 'Ideal Circular-Tube Pressure Drop Calculator', accessTier: 'free', order: 1339.34, stackStatus: 'layered' },
  { toolId: 'mrx.tool.bmi', slug: 'bmi', version: '1.0.0', page: Page.BMI, href: '/smarttools/body-composition/bmi', titleAr: 'مؤشر كتلة الجسم', titleEn: 'Body Mass Index (BMI)', accessTier: 'free', order: 1340, stackStatus: 'layered' },
  { toolId: 'mrx.tool.one-rep-max', slug: 'one-rep-max', version: '1.0.0', page: Page.ONE_REP_MAX, href: '/smarttools/training-recovery/one-rep-max', titleAr: 'أقصى تكرار واحد', titleEn: 'One Rep Max', accessTier: 'free', order: 1350, stackStatus: 'layered' },
  { toolId: 'mrx.tool.strength-standards', slug: 'strength-standards', version: '1.0.0', page: Page.STRENGTH_STANDARDS, href: '/smarttools/training-recovery/strength-standards', titleAr: 'معايير القوة', titleEn: 'Strength Standards', accessTier: 'free', order: 1360, stackStatus: 'layered' },
  { toolId: 'mrx.tool.rest-timer', slug: 'rest-timer', version: '1.0.0', page: Page.REST_TIMER, href: '/smarttools/training-recovery/rest-timer', titleAr: 'مؤقت الراحة', titleEn: 'Rest Timer', accessTier: 'free', order: 1370, stackStatus: 'layered' },
  { toolId: 'mrx.tool.bmr-tdee', slug: 'bmr-tdee', version: '1.0.0', page: Page.BMR_TDEE, href: '/smarttools/nutrition/bmr-tdee', titleAr: 'حاسبة معدل الأيض والاحتياج اليومي', titleEn: 'BMR / TDEE Calculator', accessTier: 'free', order: 1670, stackStatus: 'layered' },
  { toolId: 'mrx.tool.protein-needs', slug: 'protein-needs', version: '1.0.0', page: Page.PROTEIN_NEEDS, href: '/smarttools/nutrition/protein-needs', titleAr: 'تقدير احتياج البروتين', titleEn: 'Protein Needs Estimate', accessTier: 'free', order: 1680, stackStatus: 'layered' },
  { toolId: 'mrx.tool.water-intake', slug: 'water-intake', version: '1.0.0', page: Page.WATER_INTAKE, href: '/smarttools/nutrition/water-intake', titleAr: 'تقدير احتياج الماء اليومي', titleEn: 'Daily Water Intake Estimate', accessTier: 'free', order: 1690, stackStatus: 'layered' },
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
    const normalized = stripped.toLowerCase();
    // Preserve lookup compatibility for legacy flat SmartTools URLs while
    // registry hrefs point directly to category-first canonical routes.
    if (normalized.startsWith('smarttools/')) {
        const segments = normalized.split('/').filter(Boolean);
        if (segments.length >= 2) return segments[segments.length - 1];
    }
    return normalized;
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
























