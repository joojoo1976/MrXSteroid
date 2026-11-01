import type { SmartToolEntry } from './smartToolsCatalog';

/** V7 catalog continuation for 246, 247, 250, and 252. Sensitive/source-dependent entries remain unpublished pending their review gates. */
export const SMART_TOOLS_CATALOG_13: readonly SmartToolEntry[] = [
  {
    toolId: 'mrx.tool.248-safety-gate-emergency-protocol', slug: 'tool-248-safety-gate-emergency-protocol', href: '/smarttools/ai-behavior/tool-248-safety-gate-emergency-protocol', order: 2480, status: 'implemented',
    titleEn: 'Emergency Warning Checklist', titleAr: 'قائمة إشارات الطوارئ', descriptionEn: 'Fixed ACEP/MedlinePlus warning-sign checklist with explicit age and answer selection; no diagnosis or safety clearance.', descriptionAr: 'قائمة ثابتة لإشارات ACEP وMedlinePlus باختيار العمر والإجابة صراحةً دون تشخيص أو ضمان أمان.', icon: 'ShieldAlert', accessTier: 'free', componentPath: '@/components/tools/tool-248-safety-gate-emergency-protocol', enginePath: 'lib/tools/engines/tool-248-safety-gate.v7', schemaPath: 'lib/tools/schemas/tool-248-safety-gate.v7',
  },
  {
    toolId: 'mrx.tool.249-scientific-evidence-explorer', slug: 'tool-249-scientific-evidence-explorer', href: '/smarttools/ai-behavior/tool-249-scientific-evidence-explorer', order: 2490, status: 'implemented',
    titleEn: 'Scientific Evidence Explorer', titleAr: 'مستكشف الأدلة العلمية', descriptionEn: 'Queries PubMed through a separately identified NCBI contract and displays returned citation fields only; no quality score or recommendation.', descriptionAr: 'يستعلم PubMed بعقد NCBI مستقل ويعرض حقول الاستشهاد فقط دون تقييم جودة أو توصية.', icon: 'BookOpen', accessTier: 'free', componentPath: '@/components/tools/tool-249-scientific-evidence-explorer', enginePath: 'lib/tools/engines/tool-249-evidence-explorer.v7', schemaPath: 'lib/tools/schemas/tool-249-evidence-explorer.v7',
  },
  {
    toolId: 'mrx.tool.251-physique-trajectory-simulator', slug: 'tool-251-physique-trajectory-simulator', href: '/smarttools/ai-behavior/tool-251-physique-trajectory-simulator', order: 2510, status: 'implemented',
    titleEn: 'Physique Scenario Simulator', titleAr: 'محاكي سيناريوهات المسار الجسدي', descriptionEn: 'Calculates up to three user-selected constant-rate arithmetic scenarios; not a prediction or recommendation.', descriptionAr: 'يحسب حتى ثلاثة سيناريوهات حسابية بمعدلات يحددها المستخدم؛ ليس تنبؤاً أو توصية.', icon: 'LineChart', accessTier: 'free', componentPath: '@/components/tools/tool-251-physique-trajectory-simulator', enginePath: 'lib/tools/engines/tool-251-physique-trajectory.v7', schemaPath: 'lib/tools/schemas/tool-251-physique-trajectory.v7',
  },
  {
    toolId: 'mrx.tool.246-homebrew-chemistry', slug: 'tool-246-homebrew-chemistry',
    href: '/smarttools/homebrew-chemistry/tool-246-homebrew-chemistry', order: 2460, status: 'implemented',
    titleEn: 'Chemistry Observation Log', titleAr: 'سجل ملاحظات الكيمياء',
    descriptionEn: 'Records a user note only; no chemistry calculation, laboratory result, synthesis, or preparation instructions.',
    descriptionAr: 'يسجل ملاحظة المستخدم فقط دون حساب كيميائي أو نتيجة مختبرية أو تعليمات تصنيع أو تحضير.',
    icon: 'NotebookPen', accessTier: 'free', componentPath: '@/components/tools/tool-246-homebrew-chemistry',
    enginePath: 'lib/tools/engines/tool-246-homebrew-chemistry.v7', schemaPath: 'lib/tools/schemas/tool-246-homebrew-chemistry.v7',
  },
  {
    toolId: 'mrx.tool.247-habit-intelligence-coach', slug: 'tool-247-habit-intelligence-coach',
    href: '/smarttools/ai-behavior/tool-247-habit-intelligence-coach', order: 2470, status: 'implemented',
    titleEn: 'Habit Check-in Log', titleAr: 'سجل متابعة العادات',
    descriptionEn: 'Records a habit and a user-selected completion state; no adherence score, prediction, or coaching recommendation.',
    descriptionAr: 'يسجل العادة وحالة إتمام يحددها المستخدم دون درجة التزام أو تنبؤ أو توصية تدريبية.',
    icon: 'CheckSquare', accessTier: 'free', componentPath: '@/components/tools/tool-247-habit-intelligence-coach',
    enginePath: 'lib/tools/engines/tool-247-habit-coach.v7', schemaPath: 'lib/tools/schemas/tool-247-habit-intelligence-coach.v7',
  },
  {
    toolId: 'mrx.tool.250-personal-fitness-memory-layer', slug: 'tool-250-personal-fitness-memory-layer',
    href: '/smarttools/ai-behavior/tool-250-personal-fitness-memory-layer', order: 2500, status: 'implemented',
    titleEn: 'Session-Only Fitness Notes', titleAr: 'ملاحظات لياقة مؤقتة للجلسة',
    descriptionEn: 'User-selected notes held only in the current page session; no persistence, synchronization, or cross-tool import.',
    descriptionAr: 'ملاحظات يختارها المستخدم وتبقى مؤقتاً في حالة الصفحة دون تخزين دائم أو مزامنة أو استيراد بين الأدوات.',
    icon: 'NotebookPen', accessTier: 'free', componentPath: '@/components/tools/tool-250-personal-fitness-memory-layer',
    enginePath: 'lib/tools/engines/tool-250-memory-layer.v7', schemaPath: 'lib/tools/schemas/tool-250-personal-fitness-memory-layer.v7',
  },
  {
    toolId: 'mrx.tool.252-command-center', slug: 'tool-252-command-center',
    href: '/smarttools/ai-behavior/tool-252-command-center', order: 2520, status: 'implemented',
    titleEn: 'Manual Context Board', titleAr: 'لوحة السياق اليدوية',
    descriptionEn: 'Displays only entries explicitly selected and entered by the user, including their supplied source, unit, date, and status.',
    descriptionAr: 'يعرض فقط المدخلات التي يختارها المستخدم ويدخلها، مع المصدر والوحدة والتاريخ والحالة التي يقدمها.',
    icon: 'PanelsTopLeft', accessTier: 'free', componentPath: '@/components/tools/tool-252-command-center',
    enginePath: 'lib/tools/engines/tool-252-command-center.v7', schemaPath: 'lib/tools/schemas/tool-252-command-center.v7',
  },
];
