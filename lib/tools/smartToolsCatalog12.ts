import type { SmartToolEntry } from './smartToolsCatalog';

/** V7 catalog continuation for tools 241–245; identities and registered routes are preserved. */
export const SMART_TOOLS_CATALOG_12: readonly SmartToolEntry[] = [
  {
    toolId: 'mrx.tool.241-solvent-ratio', slug: 'tool-241-solvent-ratio',
    href: '/smarttools/homebrew-chemistry/tool-241-solvent-ratio', order: 2410, status: 'implemented',
    titleEn: 'Generic Mathematical Ratio Calculator', titleAr: 'حاسبة نسبة رياضية عامة',
    descriptionEn: 'Divides two abstract user-provided numbers; no solvent, mixing, concentration, or preparation guidance.',
    descriptionAr: 'يقسم عددين مجردين يدخلهما المستخدم دون إرشادات للمذيبات أو الخلط أو التركيز أو التحضير.',
    icon: 'Calculator', accessTier: 'free', componentPath: '@/components/tools/tool-241-solvent-ratio',
    enginePath: 'lib/tools/engines/tool-241-solvent-ratio.v7', schemaPath: 'lib/tools/schemas/tool-241-solvent-ratio.v7',
  },
  {
    toolId: 'mrx.tool.242-dosage-unit-conversion-engine', slug: 'tool-242-dosage-unit-conversion-engine',
    href: '/smarttools/homebrew-chemistry/tool-242-dosage-unit-conversion-engine', order: 2420, status: 'implemented',
    titleEn: 'General Measurement Unit Converter', titleAr: 'محول وحدات القياس العامة',
    descriptionEn: 'Converts a finite whitelist of compatible mass, volume, length, pressure, and temperature units.',
    descriptionAr: 'يحوّل وحدات محددة ومتوافقة للكتلة والحجم والطول والضغط ودرجة الحرارة.',
    icon: 'Ruler', accessTier: 'free', componentPath: '@/components/tools/tool-242-dosage-unit-conversion-engine',
    enginePath: 'lib/tools/engines/tool-242-unit-conversion.v7', schemaPath: 'lib/tools/schemas/tool-242-dosage-unit-conversion-engine.v7',
  },
  {
    toolId: 'mrx.tool.243-carrier-oil-viscosity-estimator', slug: 'tool-243-carrier-oil-viscosity-estimator',
    href: '/smarttools/homebrew-chemistry/tool-243-carrier-oil-viscosity-estimator', order: 2430, status: 'implemented',
    titleEn: 'Carrier Oil Observation Log', titleAr: 'سجل ملاحظات الزيت الناقل',
    descriptionEn: 'Records a user note only; does not estimate viscosity, rank oils, or advise on formulations.',
    descriptionAr: 'يسجل ملاحظة المستخدم فقط دون تقدير اللزوجة أو ترتيب الزيوت أو تقديم نصائح للتركيبات.',
    icon: 'NotebookPen', accessTier: 'free', componentPath: '@/components/tools/tool-243-carrier-oil-viscosity-estimator',
    enginePath: 'lib/tools/engines/tool-243-carrier-oil.v7', schemaPath: 'lib/tools/schemas/tool-243-carrier-oil-viscosity-estimator.v7',
  },
  {
    toolId: 'mrx.tool.244-purity-yield-estimator', slug: 'tool-244-purity-yield-estimator',
    href: '/smarttools/homebrew-chemistry/tool-244-purity-yield-estimator', order: 2440, status: 'implemented',
    titleEn: 'Generic Input/Output Ratio Calculator', titleAr: 'حاسبة نسبة المدخل إلى الناتج',
    descriptionEn: 'Calculates output divided by input for user-defined values assumed to share units; no purity or chemical-yield claim.',
    descriptionAr: 'يحسب الناتج مقسوماً على المدخل مع افتراض تطابق الوحدات، دون ادعاء نقاء أو مردود كيميائي.',
    icon: 'Percent', accessTier: 'free', componentPath: '@/components/tools/tool-244-purity-yield-estimator',
    enginePath: 'lib/tools/engines/tool-244-purity-yield.v7', schemaPath: 'lib/tools/schemas/tool-244-purity-yield-estimator.v7',
  },
  {
    toolId: 'mrx.tool.245-storage-stability-estimator', slug: 'tool-245-storage-stability-estimator',
    href: '/smarttools/homebrew-chemistry/tool-245-storage-stability-estimator', order: 2450, status: 'implemented',
    titleEn: 'Storage Observation Log', titleAr: 'سجل ملاحظات التخزين',
    descriptionEn: 'Records a user note only; does not assess stability, shelf life, sterility, or product safety.',
    descriptionAr: 'يسجل ملاحظة المستخدم فقط دون تقييم الثبات أو مدة الصلاحية أو التعقيم أو سلامة المنتج.',
    icon: 'NotebookPen', accessTier: 'free', componentPath: '@/components/tools/tool-245-storage-stability-estimator',
    enginePath: 'lib/tools/engines/tool-245-storage-stability.v7', schemaPath: 'lib/tools/schemas/tool-245-storage-stability-estimator.v7',
  },
];
