/**
 * lib/tools/toolRegistry150.ts — SPEC §7, §8, §49, §50
 * ═══════════════════════════════════════════════════════════════════════════
 *  The single source of truth for the *planned/registered* SmartTools #31–#150.
 *
 *  This registry records identity (id, slug, canonical category, AR/EN names)
 *  and the separated status model of §49. It is deliberately separate from the
 *  *implemented* catalogue (`smartToolsCatalog*.ts`) so that:
 *    - a planned tool never renders a calculator (§7, §24, §49);
 *    - the implemented catalogue stays exactly what is proven to work.
 *
 *  Canonical URL for every tool: /smarttools/{category}/{slug}
 * ═══════════════════════════════════════════════════════════════════════════
 */
import type { SmartToolCategory } from './categories';
import {
  DEFAULT_ACCESS_POLICY,
  DEFAULT_REVIEW_STATUS,
  type AccessPolicy,
  type AvailabilityStatus,
  type DevelopmentStatus,
  type PublicationStatus,
  type ReviewStatus,
  type RiskLevel,
} from './toolStatus';

export interface RegisteredTool {
  id: number;
  slug: string;
  category: SmartToolCategory;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  riskLevel: RiskLevel;
  developmentStatus: DevelopmentStatus;
  publicationStatus: PublicationStatus;
  availabilityStatus: AvailabilityStatus;
  accessPolicy: AccessPolicy;
  reviewStatus: ReviewStatus;
  /** SPEC §7.11 restricted concept — never framed as safe/usable production. */
  restricted: boolean;
  relatedIds: number[];
}

/**
 * Compact seed table for #31–#150.
 * [id, category, slug, titleEn, titleAr, riskLevel, restricted]
 * Category assignment follows §8, and §50 for #31–#49. Where §8 leaves a gap
 * (e.g. #80, #82–#89, #95–#96) the primary category is chosen by function and
 * documented in TRACEABILITY_MATRIX.md.
 */
export type RawTool = readonly [
  number,
  SmartToolCategory,
  string,
  string,
  string,
  RiskLevel,
  boolean,
];

export const TOOLS_31_150_RAW: readonly RawTool[] = [
  [31, 'cycle-management', 'cycle-length-optimizer', 'Cycle Length Optimizer', 'محسّن طول الدورة', 'medium', false],
  [32, 'hormonal-health', 'advanced-pct-planner', 'Advanced PCT Planner', 'مخطط PCT المتقدم', 'high', false],
  [33, 'medical-monitoring', 'bloodwork-trends', 'Bloodwork Trend Analyzer', 'محلل اتجاهات التحاليل', 'high', false],
  [34, 'pharmacokinetics', 'compound-clearance', 'Compound Clearance Calculator', 'حاسبة تصفية المركبات', 'medium', false],
  [35, 'hormonal-health', 'hormone-conversion', 'Hormone Conversion Calculator', 'حاسبة تحويل الهرمونات', 'medium', false],
  [36, 'injection-formulation', 'injection-schedule', 'Injection Schedule Planner', 'مخطط جدول الحقن', 'high', false],
  [37, 'medical-monitoring', 'side-effect-probability', 'Side Effect Probability Calculator', 'حاسبة احتمالية الآثار الجانبية', 'high', false],
  [38, 'cycle-management', 'stack-compatibility', 'Stack Compatibility Checker', 'فاحص توافق الستاك', 'medium', false],
  [39, 'medical-monitoring', 'liver-enzyme-tracker', 'Liver Enzyme Tracker', 'متتبع إنزيمات الكبد', 'high', false],
  [40, 'medical-monitoring', 'lipid-profile', 'Lipid Profile Optimizer', 'محسّن ملف الدهون', 'high', false],
  [41, 'medical-monitoring', 'hematocrit-monitor', 'Hematocrit Monitor', 'مراقب الهيماتوكريت', 'high', false],
  [42, 'hormonal-health', 'estrogen-management', 'Estrogen Management Pro', 'إدارة الإستروجين المتقدمة', 'high', false],
  [43, 'hormonal-health', 'prolactin-management', 'Prolactin Management Pro', 'إدارة البرولاكتين المتقدمة', 'high', false],
  [44, 'medical-monitoring', 'dht-side-effects', 'DHT Side Effect Predictor', 'متنبئ آثار DHT الجانبية', 'high', false],
  [45, 'cycle-management', 'cycle-break-planner', 'Cycle Break Planner', 'مخطط فترات الراحة بين الدورات', 'medium', false],
  [46, 'hormonal-health', 'trt-lifetime', 'TRT Lifetime Calculator', 'حاسبة مسار TRT طويل المدى', 'high', false],
  [47, 'reproductive-wellbeing', 'fertility-preservation', 'Fertility Preservation Guide', 'دليل الحفاظ على الخصوبة', 'high', false],
  [48, 'medical-monitoring', 'cardiovascular-risk', 'Cardiovascular Risk Assessor', 'مقيّم خطر القلب والأوعية', 'high', false],
  [49, 'medical-monitoring', 'bone-density-optimizer', 'Bone Density Optimizer', 'محسّن كثافة العظام', 'high', false],
  [50, 'medical-monitoring', 'mental-health-monitor', 'Mental Health Monitor', 'مراقب الصحة النفسية', 'high', false],
  [51, 'hormonal-health', 'peptide-dosage', 'Peptide Dosage Calculator', 'حاسبة جرعات الببتيد', 'high', false],
  [52, 'hormonal-health', 'gh-protocol', 'Growth Hormone Protocol Planner', 'مخطط بروتوكول هرمون النمو', 'high', false],
  [53, 'medical-monitoring', 'insulin-conversion', 'Insulin Conversion Calculator', 'حاسبة تحويل الأنسولين', 'high', false],
  [54, 'medical-monitoring', 'glucose-tracker', 'Glucose Tracker', 'متتبع الجلوكوز', 'high', false],
  [55, 'medical-monitoring', 'insulin-sensitivity', 'Insulin Sensitivity Optimizer', 'محسّن حساسية الأنسولين', 'high', false],
  [56, 'hormonal-health', 'mini-pct', 'Mini PCT Calculator', 'حاسبة PCT المصغرة', 'high', false],
  [57, 'hormonal-health', 'free-testosterone', 'Free Testosterone Manager', 'مدير التستوستيرون الحر', 'high', false],
  [58, 'hormonal-health', 'androgenic-balance', 'Androgenic Balance Calculator', 'حاسبة التوازن الأندروجيني', 'high', false],
  [59, 'hormonal-health', 'androgen-receptor', 'Androgen Receptor Optimizer', 'محسّن مستقبلات الأندروجين', 'high', false],
  [60, 'hormonal-health', 'five-alpha-conversion', '5-Alpha Conversion Calculator', 'حاسبة تحويل 5-ألفا', 'high', false],
  [61, 'reproductive-wellbeing', 'hair-loss-tracker', 'Hair Loss Tracker', 'متتبع تساقط الشعر', 'medium', false],
  [62, 'reproductive-wellbeing', 'prostate-health', 'Prostate Health Manager', 'مدير صحة البروستاتا', 'high', false],
  [63, 'hormonal-health', 'testicular-suppression', 'Testicular Suppression Calculator', 'حاسبة التثبيط الخصوي', 'high', false],
  [64, 'reproductive-wellbeing', 'sperm-production', 'Sperm Production Optimizer', 'محسّن إنتاج الحيوانات المنوية', 'high', false],
  [65, 'hormonal-health', 'aromatase-conversion', 'Aromatase Conversion Calculator', 'حاسبة تحويل الأروماتاز', 'high', false],
  [66, 'hormonal-health', 'estrogen-sensitivity', 'Estrogen Sensitivity Manager', 'مدير حساسية الإستروجين', 'high', false],
  [67, 'hormonal-health', 'estrogen-balance', 'Estrogen Balance Calculator', 'حاسبة توازن الإستروجين', 'high', false],
  [68, 'hormonal-health', 'gynecomastia-tracker', 'Gynecomastia Tracker', 'متتبع التثدي', 'high', false],
  [69, 'medical-monitoring', 'detox-optimizer', 'Detoxification Optimizer', 'محسّن إزالة السموم', 'medium', false],
  [70, 'medical-monitoring', 'oxidative-stress', 'Oxidative Stress Calculator', 'حاسبة الإجهاد التأكسدي', 'medium', false],
  [71, 'medical-monitoring', 'antioxidant-manager', 'Antioxidant Manager', 'مدير مضادات الأكسدة', 'low', false],
  [72, 'medical-monitoring', 'inflammation-calculator', 'Systemic Inflammation Calculator', 'حاسبة الالتهاب الجهازي', 'high', false],
  [73, 'medical-monitoring', 'immune-optimizer', 'Immune System Optimizer', 'محسّن الجهاز المناعي', 'medium', false],
  [74, 'medical-monitoring', 'blood-pressure-tracker', 'Blood Pressure Tracker', 'متتبع ضغط الدم', 'high', false],
  [75, 'medical-monitoring', 'arterial-health', 'Arterial Health Manager', 'مدير صحة الشرايين', 'high', false],
  [76, 'medical-monitoring', 'blood-viscosity', 'Blood Viscosity Calculator', 'حاسبة لزوجة الدم', 'high', false],
  [77, 'medical-monitoring', 'nitric-oxide', 'Nitric Oxide Optimizer', 'محسّن أكسيد النيتريك', 'medium', false],
  [78, 'medical-monitoring', 'endothelial-health', 'Endothelial Health Manager', 'مدير صحة البطانة', 'high', false],
  [79, 'nutrition', 'fat-metabolism', 'Fat Metabolism Calculator', 'حاسبة استقلاب الدهون', 'low', false],
  [80, 'medical-monitoring', 'mitochondrial-optimizer', 'Mitochondrial Optimizer', 'محسّن الميتوكوندريا', 'medium', false],
  [81, 'body-composition', 'cellular-aging', 'Cellular Aging Calculator', 'حاسبة الشيخوخة الخلوية', 'medium', false],
  [82, 'medical-monitoring', 'telomere-manager', 'Telomere Manager', 'مدير التيلوميرات', 'medium', false],
  [83, 'medical-monitoring', 'anti-aging-inflammation', 'Anti-Aging Inflammation Calculator', 'حاسبة الالتهاب ومكافحة الشيخوخة', 'medium', false],
  [84, 'medical-monitoring', 'cognitive-enhancer', 'Cognitive Enhancer', 'محسّن الإدراك', 'medium', false],
  [85, 'medical-monitoring', 'sleep-quality', 'Sleep Quality Manager', 'مدير جودة النوم', 'medium', false],
  [86, 'medical-monitoring', 'cortisol-stress', 'Cortisol Stress Calculator', 'حاسبة الكورتيزول والإجهاد', 'high', false],
  [87, 'medical-monitoring', 'mood-optimizer', 'Mood Optimizer', 'محسّن المزاج', 'high', false],
  [88, 'medical-monitoring', 'dopamine-tracker', 'Dopamine Tracker', 'متتبع الدوبامين', 'high', false],
  [89, 'medical-monitoring', 'serotonin-manager', 'Serotonin Manager', 'مدير السيروتونين', 'high', false],
  [90, 'hormonal-health', 'female-hormone-balance', 'Female Hormone Balance Calculator', 'حاسبة توازن الهرمونات الأنثوية', 'high', false],
  [91, 'reproductive-wellbeing', 'female-health', 'Female Health Optimizer', 'محسّن صحة المرأة', 'high', false],
  [92, 'hormonal-health', 'female-dosage', 'Female Dosage Calculator', 'حاسبة الجرعات للنساء', 'high', false],
  [93, 'reproductive-wellbeing', 'menstrual-cycle', 'Menstrual Cycle Manager', 'مدير الدورة الشهرية', 'high', false],
  [94, 'reproductive-wellbeing', 'pregnancy-risk', 'Pregnancy Risk Calculator', 'حاسبة مخاطر الحمل', 'high', false],
  [95, 'medical-monitoring', 'skin-health', 'Skin Health Optimizer', 'محسّن صحة الجلد', 'low', false],
  [96, 'medical-monitoring', 'hair-nail-tracker', 'Hair & Nail Tracker', 'متتبع الشعر والأظافر', 'low', false],
  [97, 'nutrition', 'hydration-balance', 'Hydration Balance Calculator', 'حاسبة توازن السوائل', 'low', false],
  [98, 'nutrition', 'sodium-potassium', 'Sodium-Potassium Manager', 'مدير الصوديوم والبوتاسيوم', 'medium', false],
  [99, 'nutrition', 'digestive-health', 'Digestive Health Optimizer', 'محسّن صحة الجهاز الهضمي', 'medium', false],
  [100, 'platform-ai', 'comprehensive-report', 'Comprehensive Report Generator', 'مولّد التقرير الشامل', 'medium', false],

  [101, 'pharmacokinetics', 'sarm-aas-bridge', 'SARM-to-AAS Transition & Bridge Predictor', 'متنبئ الانتقال من SARMs إلى AAS', 'high', false],
  [102, 'pharmacokinetics', 'sc-vs-im-pk', 'Subcutaneous vs. Intramuscular PK Modeler', 'نمذجة الحرائك تحت الجلد مقابل العضل', 'high', false],
  [103, 'medical-monitoring', 'renal-function', 'Renal Function & Hydration Index', 'مؤشر وظائف الكلى والترطيب', 'high', false],
  [104, 'hormonal-health', 'thyroid-metabolic', 'Thyroid Function & Metabolic Rate Dynamics', 'ديناميكية الغدة الدرقية والاستقلاب', 'high', false],
  [105, 'platform-ai', 'health-data-fusion', 'AI Health Data Fusion Hub & Timeline', 'مركز دمج بيانات الصحة والخط الزمني', 'high', false],
  [106, 'body-composition', 'glycogen-supercompensation', 'Glycogen Supercompensation & Water Retention Modeler', 'نمذجة تحميل الجليكوجين واحتباس الماء', 'medium', false],
  [107, 'body-composition', 'peak-week-manipulator', 'Contest Prep Peak-Week Manipulator', 'مخطّط أسبوع الذروة للمسابقات', 'high', false],
  [108, 'body-composition', 'body-composition-vision', 'AI Body Composition Vision Engine', 'محرك الرؤية لتكوين الجسم', 'high', false],
  [109, 'body-composition', 'competition-readiness', 'Competition Readiness & Stage Posing OS', 'جاهزية المسابقة وأداء المنصة', 'medium', false],
  [110, 'nutrition', 'meal-vision', 'AI Meal Vision Scanner & Portion Estimator', 'ماسح الوجبات بالرؤية وتقدير الحصص', 'medium', false],
  [111, 'nutrition', 'food-substitution', 'Smart Food & Macro Substitution Engine', 'محرك استبدال الأطعمة والماكروز', 'low', false],
  [112, 'nutrition', 'food-quality-score', 'Food Quality & Micronutrient Diversity Score', 'مؤشر جودة الغذاء وتنوع المغذيات', 'low', false],
  [113, 'nutrition', 'grocery-basket', 'AI Grocery Basket & Meal Cost Optimizer', 'محسّن سلة التسوق وتكلفة الوجبات', 'low', false],
  [114, 'nutrition', 'restaurant-macro', 'Restaurant Macro Navigator & Fast-Food Estimator', 'متنقل الماكروز في المطاعم', 'low', false],
  [115, 'nutrition', 'supplement-navigator', 'Supplement Evidence & Bio-Stack Navigator', 'مستكشف أدلة المكملات', 'medium', false],
  [116, 'nutrition', 'fasting-window', 'Nutrition Gap & Fasting Window Optimizer', 'محسّن فجوة التغذية ونافذة الصيام', 'medium', false],
  [117, 'nutrition', 'intra-workout', 'Intra-Workout Nutrient Volumizer & Transport Engine', 'محرك تغذية أثناء التمرين والنقل', 'low', false],
  [118, 'training-recovery', 'cns-recovery', 'CNS Recovery Score', 'مؤشر استعادة الجهاز العصبي', 'medium', false],
  [119, 'training-recovery', 'volume-load', 'Training Volume Load & Hypertrophy Index', 'حمل الحجم التدريبي ومؤشر التضخم', 'low', false],
  [120, 'training-recovery', 'progressive-overload', 'Progressive Overload & Adaptive Reserve Capacity Predictor', 'التحميل التدريجي والاحتياطي التكيفي', 'low', false],
  [121, 'training-recovery', 'muscle-recovery', 'Muscle Group Recovery Time-Course Modeler', 'نمذجة زمن استعادة المجموعات العضلية', 'low', false],
  [122, 'training-recovery', 'rpe-1rm', 'RPE / RIR to 1RM Dynamic Velocity Modeler', 'نمذجة RPE/RIR إلى 1RM', 'low', false],
  [123, 'training-recovery', 'joint-stress', 'Joint Stress & Connective Tissue Load Risk Index', 'مؤشر إجهاد المفاصل والأنسجة الضامة', 'medium', false],
  [124, 'training-recovery', 'deload-frequency', 'Deload Frequency & Fatigue Accumulation Modeler', 'نمذجة وتيرة التنزيل وتراكم الإجهاد', 'low', false],
  [125, 'training-recovery', 'fiber-type', 'Fiber Type Adaptation & Mechanical Tension Score', 'مؤشر تكيّف الألياف والشد الميكانيكي', 'low', false],
  [126, 'training-recovery', 'neuromuscular', 'Neuromuscular Performance & Explosiveness Modeler', 'نمذجة الأداء العصبي العضلي', 'low', false],

  [127, 'training-recovery', 'daily-readiness', 'AI Daily Readiness & Cause Explainer Engine', 'محرك الجاهزية اليومية وشرح الأسباب', 'medium', false],
  [128, 'training-recovery', 'acute-chronic-ratio', 'Training Load Balance & Acute-to-Chronic Ratio', 'توازن الحمل ونسبة الحاد إلى المزمن', 'low', false],
  [129, 'training-recovery', 'adaptive-program', 'AI Adaptive Training Program Planner', 'مخطط البرنامج التدريبي التكيفي', 'medium', false],
  [130, 'training-recovery', 'plateau-detective', 'AI Plateau Detective & Stagnation Analyzer', 'محلل الثبات والركود', 'medium', false],
  [131, 'body-composition', 'transformation-forecast', 'Transformation Forecast & Trajectory Engine', 'محرك توقّع التحول البدني', 'medium', false],
  [132, 'training-recovery', 'pose-form-coach', 'AI Pose & Exercise Form Coach', 'مدرب الوضعية وأداء التمرين', 'medium', false],
  [133, 'training-recovery', 'rep-tempo', 'Rep Tempo & Velocity Loss Analyzer', 'محلل وتيرة التكرار وفقد السرعة', 'low', false],
  [134, 'training-recovery', 'mobility-symmetry', 'Mobility Intelligence & Movement Symmetry Screen', 'فحص المرونة وتماثل الحركة', 'medium', false],
  [135, 'training-recovery', 'exercise-substitution', 'Exercise Substitution AI & Injury Workaround', 'استبدال التمارين وتجاوز الإصابات', 'medium', false],
  [136, 'body-composition', 'physique-proportion', 'Physique Proportion & Golden Ratio Score', 'مؤشر التناسب والنسخة الذهبية', 'low', false],
  [137, 'injection-formulation', 'peptide-reconstitution', 'Peptide & Hormone Reconstitution Calculator', 'حاسبة إعادة تحضير الببتيد والهرمونات', 'high', true],
  [138, 'injection-formulation', 'powder-density', 'Raw Powder Density & Oil Formulation Engine', 'محرك كثافة المسحوق وتكوين الزيت', 'high', true],
  [139, 'injection-formulation', 'solvent-emulsifier', 'Solvent & Emulsifier Ratio Calculator', 'حاسبة نسبة المذيبات والمستحلبات', 'high', true],
  [140, 'pharmacokinetics', 'dosage-unit-conversion', 'Dosage Unit Conversion Engine', 'محرك تحويل وحدات الجرعات', 'high', false],
  [141, 'injection-formulation', 'carrier-oil-viscosity', 'Carrier Oil Viscosity & Syringe Pressure Estimator', 'تقدير لزوجة الزيت وضغط المحقن', 'high', true],
  [142, 'injection-formulation', 'compound-purity', 'Compound Purity & Active Yield Estimator', 'تقدير النقاء والمردود الفعال', 'high', true],
  [143, 'injection-formulation', 'storage-stability', 'Storage Stability & Thermal Degradation Estimator', 'تقدير ثبات التخزين والتحلل الحراري', 'high', true],
  [144, 'injection-formulation', 'homebrew-mass-density', 'Homebrew Chemistry Mass & Density Calculator', 'حاسبة الكتلة والكثافة الكيميائية', 'high', true],
  [145, 'platform-ai', 'habit-intelligence', 'Habit Intelligence & Consistency Coach', 'مدرب العادات والالتزام', 'low', false],
  [146, 'platform-ai', 'ai-safety-gate', 'AI Safety Gate & Emergency Protocol', 'بوابة السلامة وبروتوكول الطوارئ', 'high', false],
  [147, 'platform-ai', 'evidence-explorer', 'Scientific Evidence Explorer & Citation Engine', 'مستكشف الأدلة العلمية والاستشهاد', 'medium', false],
  [148, 'platform-ai', 'fitness-memory', 'My Personal Fitness Memory Layer', 'طبقة الذاكرة الشخصية', 'medium', false],
  [149, 'body-composition', 'physique-trajectory', 'Physique Trajectory Scenario Simulator', 'محاكي مسار البنية البدنية', 'medium', false],
  [150, 'platform-ai', 'ai-command-center', 'Mr. X AI Performance Command Center', 'مركز قيادة الأداء بالذكاء الاصطناعي', 'medium', false],


];

/**
 * Tools implemented and verified within this work stream. Kept explicit so a
 * tool is never advertised as complete without passing acceptance criteria.
 * (Spec §7, §24, §49: no fake functionality.)
 */
export const IMPLEMENTED_TOOL_IDS: readonly number[] = [46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56];

function buildDescription(titleEn: string, titleAr: string, restricted: boolean): { en: string; ar: string } {
  if (restricted) {
    return {
      en: `Restricted concept — educational/safety information only, not an operational calculator (${titleEn}).`,
      ar: `مفهوم مقيّد — معلومات تعليمية/سلامية فقط، وليس حاسبة تشغيلية (${titleAr}).`,
    };
  }
  return {
    en: `Educational ${titleEn} for Mr. X-Steroid members.`,
    ar: `${titleAr} تعليمية لأعضاء Mr. X-Steroid.`,
  };
}

export const TOOL_REGISTRY_150: readonly RegisteredTool[] = TOOLS_31_150_RAW.map(
  ([id, category, slug, titleEn, titleAr, riskLevel, restricted]) => {
    const implemented = IMPLEMENTED_TOOL_IDS.includes(id);
    const desc = buildDescription(titleEn, titleAr, restricted);
    return {
      id,
      category,
      slug,
      titleEn,
      titleAr,
      descriptionEn: desc.en,
      descriptionAr: desc.ar,
      riskLevel,
      developmentStatus: implemented ? 'completed' : 'planned',
      publicationStatus: implemented ? 'published' : 'draft',
      availabilityStatus: implemented ? 'available' : 'unavailable',
      accessPolicy: riskLevel === 'high' ? 'authenticated' : DEFAULT_ACCESS_POLICY,
      reviewStatus:
        implemented && riskLevel === 'high' ? 'approved' : DEFAULT_REVIEW_STATUS,
      restricted,
      relatedIds: [],
    } satisfies RegisteredTool;
  }
);

export function getRegisteredTool(idOrSlug: number | string): RegisteredTool | undefined {
  return TOOL_REGISTRY_150.find((t) =>
    typeof idOrSlug === 'number' ? t.id === idOrSlug : t.slug === idOrSlug
  );
}

export function getRegisteredByCategory(category: SmartToolCategory): RegisteredTool[] {
  return TOOL_REGISTRY_150.filter((t) => t.category === category);
}

/** Canonical hierarchical URL for a registered tool. */
export function registeredHref(tool: RegisteredTool): string {
  return `/smarttools/${tool.category}/${tool.slug}`;
}
