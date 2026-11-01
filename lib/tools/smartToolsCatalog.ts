/**
 * lib/tools/smartToolsCatalog.ts
 * Central catalog for user-facing Smart Tools.
 * Single source of truth consumed by the Hub page.
 */

export interface SmartToolEntry {
  toolId: string;
  slug: string;
  href: string;
  order: number;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  icon: string;
  accessTier: 'free' | 'premium';
  componentPath: string;
  enginePath: string;
  schemaPath: string;
  bookContext?: {
    chapterAr: string;
    chapterEn: string;
    topicAr: string;
    topicEn: string;
  };
  /**
   * Lifecycle of the entry (SmartTools merge policy / SPEC roadmap).
   * - 'implemented' (default when omitted): component/engine/schema/route exist
   *   on disk and the tool is user-facing in the Hub.
   * - 'planned': baseline roadmap entry preserved from the 100-tool catalog
   *   without an on-disk implementation yet — validated for identity/titles/tier
   *   but excluded from the Hub, sitemap, static params and filesystem checks
   *   until its implementation lands (never rendered as a card → no dead links).
   */
  status?: 'implemented' | 'planned';
}

export const SMART_TOOLS_CATALOG: readonly SmartToolEntry[] = [
  // Legacy tools #1-9 (preserved from original stack, stackStatus: 'legacy')
  { toolId: 'mrx.tool.macro', slug: 'macro', href: '/smarttools/nutrition/macro', order: 10, titleEn: 'Adaptive Macro Calculator', titleAr: 'حاسبة الماكروز التكيفية', descriptionEn: 'Deterministic Macro v6 calculation using documented adult equations and explicit assumptions', descriptionAr: 'حسابات ماكرو v6 حتمية بمعادلات موثقة للبالغين وافتراضات معلنة', icon: 'UtensilsCrossed', accessTier: 'free', componentPath: '@/components/tools/macro-pilot', enginePath: 'lib/tools/engines/macro.v6', schemaPath: 'lib/tools/schemas/macro.v6', bookContext: { chapterAr: 'الفصل 1: أساسيات التغذية', chapterEn: 'Chapter 1: Nutrition Fundamentals', topicAr: 'حساب الماكروز التكيفي وفق معادلات v6', topicEn: 'Adaptive Macro Calculation with v6 equations' } },
  { toolId: 'mrx.tool.bodyfat', slug: 'bodyfat', href: '/smarttools/body-composition/bodyfat', order: 20, titleEn: 'FFMI & Body Fat Analyzer', titleAr: 'محلل الكتلة الخالية من الدهون ونسبة الدهون', descriptionEn: 'FFMI and body fat percentage calculator', descriptionAr: 'حاسبة FFMI ونسبة الدهون في الجسم', icon: 'Scale', accessTier: 'free', componentPath: '@/components/tools/bodyfat', enginePath: 'lib/tools/engines/bodyfat', schemaPath: 'lib/tools/schemas/bodyfat', bookContext: { chapterAr: 'الفصل 2: تكوين الجسم', chapterEn: 'Chapter 2: Body Composition', topicAr: 'قياس وتحليل نسبة الدهون وFFMI', topicEn: 'Body Fat & FFMI Measurement & Analysis' } },
  { toolId: 'mrx.tool.injection', slug: 'injection', href: '/smarttools/injection-formulation/injection', order: 30, titleEn: 'Interactive Injection Map', titleAr: 'خريطة الحقن التفاعلية', descriptionEn: 'Visual injection site guide with rotation planner', descriptionAr: 'دليل مرئي لمواقع الحقن مع مخطط التدوير', icon: 'Syringe', accessTier: 'free', componentPath: '@/components/tools/injection', enginePath: 'lib/tools/engines/injection', schemaPath: 'lib/tools/schemas/injection', bookContext: { chapterAr: 'الفصل 9: الحقن', chapterEn: 'Chapter 9: Injection', topicAr: 'مواقع الحقن الآمنة وتدويرها', topicEn: 'Safe Injection Sites & Rotation' } },
  { toolId: 'mrx.tool.halflife', slug: 'halflife', href: '/smarttools/pharmacokinetics/halflife', order: 40, titleEn: 'Half-Life Simulator', titleAr: 'محاكي نصف العمر', descriptionEn: 'Compound half-life visualization and accumulation', descriptionAr: 'تصور نصف العمر وتراكم المركبات', icon: 'Timer', accessTier: 'free', componentPath: '@/components/tools/halflife', enginePath: 'lib/tools/engines/halflife', schemaPath: 'lib/tools/schemas/halflife', bookContext: { chapterAr: 'الفصل 4: الحرائك الدوائية', chapterEn: 'Chapter 4: Pharmacokinetics', topicAr: 'محاكاة نصف العمر والتراكم', topicEn: 'Half-Life Simulation & Accumulation' } },
  { toolId: 'mrx.tool.lab', slug: 'lab', href: '/smarttools/medical-monitoring/lab', order: 50, titleEn: 'Smart Lab Reference', titleAr: 'المرجع الذكي للتحاليل', descriptionEn: 'Bloodwork reference ranges with contextual interpretation', descriptionAr: 'نطاقات مرجعية للتحاليل مع تفسير سياقي', icon: 'Beaker', accessTier: 'free', componentPath: '@/components/tools/lab', enginePath: 'lib/tools/engines/lab', schemaPath: 'lib/tools/schemas/lab', bookContext: { chapterAr: 'الفصل 7: قراءة التحاليل', chapterEn: 'Chapter 7: Bloodwork Interpretation', topicAr: 'مرجع التحاليل الذكي والتفسير', topicEn: 'Smart Lab Reference & Interpretation' } },
  { toolId: 'mrx.tool.genetic', slug: 'genetic', href: '/smarttools/training-recovery/genetic', order: 60, titleEn: 'Genetic Potential Calculator', titleAr: 'حاسبة الإمكانات الوراثية', descriptionEn: 'Muscle-building genetic potential estimator', descriptionAr: 'مقدر الإمكانات الوراثية لبناء العضلات', icon: 'Dna', accessTier: 'free', componentPath: '@/components/tools/genetic', enginePath: 'lib/tools/engines/genetic', schemaPath: 'lib/tools/schemas/genetic', bookContext: { chapterAr: 'الفصل 17: الإمكانات الوراثية', chapterEn: 'Chapter 17: Genetic Potential', topicAr: 'تقدير الإمكانات الوراثية للعضلات', topicEn: 'Genetic Muscle Potential Estimation' } },
  { toolId: 'mrx.tool.cycle', slug: 'cycle', href: '/smarttools/cycle-management/cycle', order: 70, titleEn: 'Cycle Architect', titleAr: 'مهندس الدورة', descriptionEn: 'Comprehensive cycle planning and optimization', descriptionAr: 'تخطيط وتحسين الدورات الشامل', icon: 'Layers', accessTier: 'premium', componentPath: '@/components/tools/cycle', enginePath: 'lib/tools/engines/cycle', schemaPath: 'lib/tools/schemas/cycle', bookContext: { chapterAr: 'الفصل 20: تخطيط الدورات', chapterEn: 'Chapter 20: Cycle Planning', topicAr: 'هندسة وتصميم الدورات', topicEn: 'Cycle Architecture & Design' } },
  { toolId: 'mrx.tool.timeline', slug: 'timeline', href: '/smarttools/training-recovery/timeline', order: 80, titleEn: 'Transformation Timeline', titleAr: 'الجدول الزمني للتحول', descriptionEn: 'Visual transformation journey planner', descriptionAr: 'مخطط رحلة التحول المرئي', icon: 'Timer', accessTier: 'free', componentPath: '@/components/tools/timeline', enginePath: 'lib/tools/engines/timeline', schemaPath: 'lib/tools/schemas/timeline', bookContext: { chapterAr: 'الفصل 21: الجدول الزمني', chapterEn: 'Chapter 21: Timeline', topicAr: 'تخطيط الجدول الزمني للتحول', topicEn: 'Transformation Timeline Planning' } },
  { toolId: 'mrx.tool.master-calculator', slug: 'master-calculator', href: '/smarttools/nutrition/master-calculator', order: 90, titleEn: 'Master Calculator', titleAr: 'الحاسبة الشاملة', descriptionEn: 'All-in-one nutrition and cycle calculator', descriptionAr: 'حاسبة شاملة للتغذية والدورات', icon: 'Calculator', accessTier: 'free', componentPath: '@/components/tools/master-calculator', enginePath: 'lib/tools/engines/master-calculator', schemaPath: 'lib/tools/schemas/master-calculator', bookContext: { chapterAr: 'الفصل 1: الأدوات الشاملة', chapterEn: 'Chapter 1: Comprehensive Tools', topicAr: 'الحاسبة الرئيسية الموحدة', topicEn: 'Unified Master Calculator' } },

  // Special layered tools
  { toolId: 'mrx.tool.multi-ester-pharmacokinetics', slug: 'multi-ester-pharmacokinetics', href: '/smarttools/pharmacokinetics/multi-ester-pharmacokinetics', order: 100, titleEn: 'Multi-Ester PK Simulator', titleAr: 'محاكي تراكم الإسترات', descriptionEn: 'Multi-ester serum accumulation simulator', descriptionAr: 'محاكي تراكم الإسترات', icon: 'Beaker', accessTier: 'free', componentPath: '@/components/tools/multi-ester-pharmacokinetics', enginePath: 'lib/tools/engines/multi-ester-pharmacokinetics', schemaPath: 'lib/tools/schemas/multi-ester-pharmacokinetics', bookContext: { chapterAr: 'الفصل 4: الحرائك الدوائية', chapterEn: 'Chapter 4: Pharmacokinetics', topicAr: 'تراكم الإسترات المتعددة ومحاكاة نصف العمر', topicEn: 'Multi-Ester Accumulation and Half-Life Simulation' } },
  { toolId: 'mrx.tool.hpta-recovery', slug: 'hpta-recovery', href: '/smarttools/hormonal-health/hpta-recovery', order: 110, titleEn: 'HPTA Recovery Modeler', titleAr: 'محاكي استعادة HPTA', descriptionEn: 'HPTA suppression and recovery modeler', descriptionAr: 'محاكي تثبيط واستعادة HPTA', icon: 'Dna', accessTier: 'free', componentPath: '@/components/tools/hpta-recovery', enginePath: 'lib/tools/engines/hpta-recovery', schemaPath: 'lib/tools/schemas/hpta-recovery', bookContext: { chapterAr: 'الفصل 6: استعادة المحور', chapterEn: 'Chapter 6: HPTA Recovery', topicAr: 'نمذجة تثبيط واستعادة المحور النخاعي-الخصوي', topicEn: 'HPTA Suppression and Recovery Modeling' } },
];
