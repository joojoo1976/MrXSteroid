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
  { toolId: 'mrx.tool.multi-ester-pharmacokinetics', slug: 'multi-ester-pharmacokinetics', version: '1.0.0', page: Page.MULTI_ESTER_PK, href: '/smarttools/multi-ester-pharmacokinetics', titleAr: 'محاكي تراكم الإسترات', titleEn: 'Multi-Ester PK Simulator', accessTier: 'free', order: 50, stackStatus: 'layered' },
  { toolId: 'mrx.tool.hpta-recovery', slug: 'hpta-recovery', version: '1.0.0', page: Page.HPTA_RECOVERY, href: '/smarttools/hpta-recovery', titleAr: 'محاكي استعادة HPTA', titleEn: 'HPTA Recovery Modeler', accessTier: 'free', order: 60, stackStatus: 'layered' },
  { toolId: 'mrx.tool.aromatization-risk', slug: 'aromatization-risk', version: '1.0.0', page: Page.AROMATIZATION_RISK, href: '/smarttools/aromatization-risk', titleAr: 'خطر الأروماتة', titleEn: 'Aromatization Risk', accessTier: 'free', order: 120, stackStatus: 'layered' },
  { toolId: 'mrx.tool.pct-timing', slug: 'pct-timing', version: '1.0.0', page: Page.PCT_TIMING, href: '/smarttools/pct-timing', titleAr: 'محرك توقيت PCT', titleEn: 'PCT Timing Engine', accessTier: 'free', order: 130, stackStatus: 'layered' },
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
  { toolId: 'mrx.tool.046-trt-lifetime', slug: 'trt-lifetime', version: '1.0.0', page: Page.TRT_LIFETIME, href: '/smarttools/trt-lifetime', titleAr: 'حاسبة مسار TRT طويل المدى', titleEn: 'TRT Lifetime Calculator', accessTier: 'free', order: 500, stackStatus: 'layered' },
  { toolId: 'mrx.tool.047-fertility-preservation', slug: 'fertility-preservation', version: '1.0.0', page: Page.FERTILITY_PRESERVATION, href: '/smarttools/fertility-preservation', titleAr: 'دليل الحفاظ على الخصوبة', titleEn: 'Fertility Preservation Guide', accessTier: 'free', order: 510, stackStatus: 'layered' },
  { toolId: 'mrx.tool.048-cardiovascular-risk', slug: 'cardiovascular-risk', version: '1.0.0', page: Page.CARDIOVASCULAR_RISK, href: '/smarttools/cardiovascular-risk', titleAr: 'مقيّم خطر القلب والأوعية', titleEn: 'Cardiovascular Risk Assessor', accessTier: 'free', order: 520, stackStatus: 'layered' },
  { toolId: 'mrx.tool.049-bone-density-optimizer', slug: 'bone-density-optimizer', version: '1.0.0', page: Page.BONE_DENSITY_OPTIMIZER, href: '/smarttools/bone-density-optimizer', titleAr: 'محسّن كثافة العظام', titleEn: 'Bone Density Optimizer', accessTier: 'free', order: 530, stackStatus: 'layered' },
  { toolId: 'mrx.tool.050-mental-health-monitor', slug: 'mental-health-monitor', version: '1.0.0', page: Page.MENTAL_HEALTH_MONITOR, href: '/smarttools/mental-health-monitor', titleAr: 'مراقب الصحة النفسية', titleEn: 'Mental Health Monitor', accessTier: 'free', order: 540, stackStatus: 'layered' },
  { toolId: 'mrx.tool.051-peptide-dosage', slug: 'peptide-dosage', version: '1.0.0', page: Page.PEPTIDE_DOSAGE, href: '/smarttools/peptide-dosage', titleAr: 'حاسبة تركيز الببتيد', titleEn: 'Peptide Dosage Calculator', accessTier: 'free', order: 550, stackStatus: 'layered' },
  { toolId: 'mrx.tool.052-gh-protocol', slug: 'gh-protocol', version: '1.0.0', page: Page.GH_PROTOCOL, href: '/smarttools/gh-protocol', titleAr: 'مخطط بروتوكول هرمون النمو', titleEn: 'Growth Hormone Protocol Planner', accessTier: 'free', order: 560, stackStatus: 'layered' },
  { toolId: 'mrx.tool.053-insulin-conversion', slug: 'insulin-conversion', version: '1.0.0', page: Page.INSULIN_CONVERSION, href: '/smarttools/insulin-conversion', titleAr: 'حاسبة تحويل الأنسولين', titleEn: 'Insulin Conversion Calculator', accessTier: 'free', order: 570, stackStatus: 'layered' },
  { toolId: 'mrx.tool.054-glucose-tracker', slug: 'glucose-tracker', version: '1.0.0', page: Page.GLUCOSE_TRACKER, href: '/smarttools/glucose-tracker', titleAr: 'متتبع الجلوكوز', titleEn: 'Glucose Tracker', accessTier: 'free', order: 580, stackStatus: 'layered' },
  { toolId: 'mrx.tool.055-insulin-sensitivity', slug: 'insulin-sensitivity', version: '1.0.0', page: Page.INSULIN_SENSITIVITY, href: '/smarttools/insulin-sensitivity', titleAr: 'محسّن حساسية الأنسولين', titleEn: 'Insulin Sensitivity Optimizer', accessTier: 'free', order: 590, stackStatus: 'layered' },
  { toolId: 'mrx.tool.056-mini-pct', slug: 'mini-pct', version: '1.0.0', page: Page.MINI_PCT, href: '/smarttools/mini-pct', titleAr: 'حاسبة PCT المصغرة', titleEn: 'Mini PCT Calculator', accessTier: 'free', order: 600, stackStatus: 'layered' },
  { toolId: 'mrx.tool.057-free-testosterone', slug: 'free-testosterone', version: '1.0.0', page: Page.FREE_TESTOSTERONE, href: '/smarttools/free-testosterone', titleAr: 'مدير التستوستيرون الحر', titleEn: 'Free Testosterone Manager', accessTier: 'free', order: 610, stackStatus: 'layered' },
  { toolId: 'mrx.tool.058-androgenic-balance', slug: 'androgenic-balance', version: '1.0.0', page: Page.ANDROGENIC_BALANCE, href: '/smarttools/androgenic-balance', titleAr: 'حاسبة التوازن الأندروجيني', titleEn: 'Androgenic Balance Calculator', accessTier: 'free', order: 620, stackStatus: 'layered' },
  { toolId: 'mrx.tool.059-androgen-receptor', slug: 'androgen-receptor', version: '1.0.0', page: Page.ANDROGEN_RECEPTOR, href: '/smarttools/androgen-receptor', titleAr: 'محسّن مستقبلات الأندروجين', titleEn: 'Androgen Receptor Optimizer', accessTier: 'free', order: 630, stackStatus: 'layered' },
  { toolId: 'mrx.tool.060-five-alpha-conversion', slug: 'five-alpha-conversion', version: '1.0.0', page: Page.FIVE_ALPHA_CONVERSION, href: '/smarttools/five-alpha-conversion', titleAr: 'حاسبة تحويل 5-ألفا', titleEn: '5-Alpha Conversion Calculator', accessTier: 'free', order: 640, stackStatus: 'layered' },
  { toolId: 'mrx.tool.061-hair-loss-tracker', slug: 'hair-loss-tracker', version: '1.0.0', page: Page.HAIR_LOSS_TRACKER, href: '/smarttools/hair-loss-tracker', titleAr: 'متتبع تساقط الشعر', titleEn: 'Hair Loss Tracker', accessTier: 'free', order: 650, stackStatus: 'layered' },
  { toolId: 'mrx.tool.062-prostate-health', slug: 'prostate-health', version: '1.0.0', page: Page.PROSTATE_HEALTH, href: '/smarttools/prostate-health', titleAr: 'مدير صحة البروستاتا', titleEn: 'Prostate Health Manager', accessTier: 'free', order: 660, stackStatus: 'layered' },
  { toolId: 'mrx.tool.063-testicular-suppression', slug: 'testicular-suppression', version: '1.0.0', page: Page.TESTICULAR_SUPPRESSION, href: '/smarttools/testicular-suppression', titleAr: 'حاسبة التثبيط الخصوي', titleEn: 'Testicular Suppression Calculator', accessTier: 'free', order: 670, stackStatus: 'layered' },
  { toolId: 'mrx.tool.064-sperm-production', slug: 'sperm-production', version: '1.0.0', page: Page.SPERM_PRODUCTION, href: '/smarttools/sperm-production', titleAr: 'محسّن إنتاج الحيوانات المنوية', titleEn: 'Sperm Production Optimizer', accessTier: 'free', order: 680, stackStatus: 'layered' },
  { toolId: 'mrx.tool.065-aromatase-conversion', slug: 'aromatase-conversion', version: '1.0.0', page: Page.AROMATASE_CONVERSION, href: '/smarttools/aromatase-conversion', titleAr: 'حاسبة تحويل الأروماتاز', titleEn: 'Aromatase Conversion Calculator', accessTier: 'free', order: 690, stackStatus: 'layered' },
  { toolId: 'mrx.tool.066-estrogen-sensitivity', slug: 'estrogen-sensitivity', version: '1.0.0', page: Page.ESTROGEN_SENSITIVITY, href: '/smarttools/estrogen-sensitivity', titleAr: 'مدير حساسية الإستروجين', titleEn: 'Estrogen Sensitivity Manager', accessTier: 'free', order: 700, stackStatus: 'layered' },
  { toolId: 'mrx.tool.067-estrogen-balance', slug: 'estrogen-balance', version: '1.0.0', page: Page.ESTROGEN_BALANCE, href: '/smarttools/estrogen-balance', titleAr: 'حاسبة توازن الإستروجين', titleEn: 'Estrogen Balance Calculator', accessTier: 'free', order: 710, stackStatus: 'layered' },
  { toolId: 'mrx.tool.068-gynecomastia-tracker', slug: 'gynecomastia-tracker', version: '1.0.0', page: Page.GYNECOMASTIA_TRACKER, href: '/smarttools/gynecomastia-tracker', titleAr: 'متتبع التثدي', titleEn: 'Gynecomastia Tracker', accessTier: 'free', order: 720, stackStatus: 'layered' },
  { toolId: 'mrx.tool.069-detox-optimizer', slug: 'detox-optimizer', version: '1.0.0', page: Page.DETOX_OPTIMIZER, href: '/smarttools/detox-optimizer', titleAr: 'محسّن إزالة السموم', titleEn: 'Detoxification Optimizer', accessTier: 'free', order: 730, stackStatus: 'layered' },
  { toolId: 'mrx.tool.070-oxidative-stress', slug: 'oxidative-stress', version: '1.0.0', page: Page.OXIDATIVE_STRESS, href: '/smarttools/oxidative-stress', titleAr: 'حاسبة الإجهاد التأكسدي', titleEn: 'Oxidative Stress Calculator', accessTier: 'free', order: 740, stackStatus: 'layered' },
  { toolId: 'mrx.tool.071-antioxidant-manager', slug: 'antioxidant-manager', version: '1.0.0', page: Page.ANTIOXIDANT_MANAGER, href: '/smarttools/antioxidant-manager', titleAr: 'مدير مضادات الأكسدة', titleEn: 'Antioxidant Manager', accessTier: 'free', order: 750, stackStatus: 'layered' },
  { toolId: 'mrx.tool.072-inflammation-calculator', slug: 'inflammation-calculator', version: '1.0.0', page: Page.INFLAMMATION_CALCULATOR, href: '/smarttools/inflammation-calculator', titleAr: 'حاسبة الالتهاب الجهازي', titleEn: 'Systemic Inflammation Calculator', accessTier: 'free', order: 760, stackStatus: 'layered' },
  { toolId: 'mrx.tool.073-immune-optimizer', slug: 'immune-optimizer', version: '1.0.0', page: Page.IMMUNE_OPTIMIZER, href: '/smarttools/immune-optimizer', titleAr: 'محسّن الجهاز المناعي', titleEn: 'Immune System Optimizer', accessTier: 'free', order: 770, stackStatus: 'layered' },
  { toolId: 'mrx.tool.074-blood-pressure-tracker', slug: 'blood-pressure-tracker', version: '1.0.0', page: Page.BLOOD_PRESSURE_TRACKER, href: '/smarttools/blood-pressure-tracker', titleAr: 'متتبع ضغط الدم', titleEn: 'Blood Pressure Tracker', accessTier: 'free', order: 780, stackStatus: 'layered' },
  { toolId: 'mrx.tool.075-arterial-health', slug: 'arterial-health', version: '1.0.0', page: Page.ARTERIAL_HEALTH, href: '/smarttools/arterial-health', titleAr: 'مدير صحة الشرايين', titleEn: 'Arterial Health Manager', accessTier: 'free', order: 790, stackStatus: 'layered' },
  { toolId: 'mrx.tool.076-blood-viscosity', slug: 'blood-viscosity', version: '1.0.0', page: Page.BLOOD_VISCOSITY, href: '/smarttools/blood-viscosity', titleAr: 'حاسبة لزوجة الدم', titleEn: 'Blood Viscosity Calculator', accessTier: 'free', order: 800, stackStatus: 'layered' },
  { toolId: 'mrx.tool.077-nitric-oxide', slug: 'nitric-oxide', version: '1.0.0', page: Page.NITRIC_OXIDE, href: '/smarttools/nitric-oxide', titleAr: 'محسّن أكسيد النيتريك', titleEn: 'Nitric Oxide Optimizer', accessTier: 'free', order: 810, stackStatus: 'layered' },
  { toolId: 'mrx.tool.078-endothelial-health', slug: 'endothelial-health', version: '1.0.0', page: Page.ENDOTHELIAL_HEALTH, href: '/smarttools/endothelial-health', titleAr: 'مدير صحة البطانة', titleEn: 'Endothelial Health Manager', accessTier: 'free', order: 820, stackStatus: 'layered' },
  { toolId: 'mrx.tool.079-fat-metabolism', slug: 'fat-metabolism', version: '1.0.0', page: Page.FAT_METABOLISM, href: '/smarttools/fat-metabolism', titleAr: 'حاسبة استقلاب الدهون', titleEn: 'Fat Metabolism Calculator', accessTier: 'free', order: 830, stackStatus: 'layered' },
  { toolId: 'mrx.tool.080-mitochondrial-optimizer', slug: 'mitochondrial-optimizer', version: '1.0.0', page: Page.MITOCHONDRIAL_OPTIMIZER, href: '/smarttools/mitochondrial-optimizer', titleAr: 'محسّن الميتوكوندريا', titleEn: 'Mitochondrial Optimizer', accessTier: 'free', order: 840, stackStatus: 'layered' },
];
// Helper functions for tool lookup
export function getTool(slug: string): ToolDefinition | undefined {
  return TOOL_REGISTRY.find(t => t.slug === slug);
}

export function getToolByPage(page: Page): ToolDefinition | undefined {
  return TOOL_REGISTRY.find(t => t.page === page);
}

export function getToolByHref(href: string): ToolDefinition | undefined {
  return TOOL_REGISTRY.find(t => t.href === href);
}

export function requireTool(slug: string): ToolDefinition {
  const tool = getTool(slug);
  if (!tool) {
    throw new Error(`Tool not found: ${slug}`);
  }
  return tool;
}

export function getDefaultTool(): ToolDefinition {
  return TOOL_REGISTRY[0];
}

export function getToolsByTier(tier: AccessTier): ToolDefinition[] {
  return TOOL_REGISTRY.filter(t => t.accessTier === tier);
}

export function toToolLink(tool: ToolDefinition): ToolLink {
  return {
    slug: tool.slug,
    titleAr: tool.titleAr,
    titleEn: tool.titleEn,
  };
}

export function getToolNeighbors(slug: string): { prevTool: ToolLink; nextTool: ToolLink } {
  const idx = TOOL_REGISTRY.findIndex(t => t.slug === slug);
  if (idx === -1) {
    // Fallback to first tool if slug not found
    return {
      prevTool: toToolLink(TOOL_REGISTRY[TOOL_REGISTRY.length - 1]),
      nextTool: toToolLink(TOOL_REGISTRY[0]),
    };
  }
  const prevTool = idx > 0 ? toToolLink(TOOL_REGISTRY[idx - 1]) : toToolLink(TOOL_REGISTRY[TOOL_REGISTRY.length - 1]);
  const nextTool = idx < TOOL_REGISTRY.length - 1 ? toToolLink(TOOL_REGISTRY[idx + 1]) : toToolLink(TOOL_REGISTRY[0]);
  return { prevTool, nextTool };
}

export function buildSeoLinks(tool: ToolDefinition): SeoLinks {
  const prevTool = tool.order > 10 
    ? toToolLink(TOOL_REGISTRY.find(t => t.order < tool.order && t.order === Math.max(...TOOL_REGISTRY.filter(t => t.order < tool.order).map(t => t.order)))!)
    : toToolLink(TOOL_REGISTRY[TOOL_REGISTRY.length - 1]);
  const nextTool = tool.order < 460 
    ? toToolLink(TOOL_REGISTRY.find(t => t.order > tool.order && t.order === Math.min(...TOOL_REGISTRY.filter(t => t.order > tool.order).map(t => t.order)))!)
    : toToolLink(TOOL_REGISTRY[0]);
  return { prevTool, nextTool };
}

export function buildToolOutput<T>(params: ToolOutputParams<T>): ToolOutput<T> {
  return createToolOutput(params);
}

// Re-export types
export type { ToolOutputParams, ToolOutput, ToolLink, SeoLinks } from './contracts';
