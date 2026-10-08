import type { SmartToolEntry } from './smartToolsCatalog';
import { SMART_TOOLS_CATALOG } from './smartToolsCatalog';
import { SMART_TOOLS_CATALOG_2 } from './smartToolsCatalog2';
import { SMART_TOOLS_CATALOG_3 } from './smartToolsCatalog3';
import { SMART_TOOLS_CATALOG_5 } from './smartToolsCatalog5';

export const SMART_TOOLS_CATALOG_4: readonly SmartToolEntry[] = [
  { toolId: 'mrx.tool.016-half-life', slug: 'tool-016-half-life-calculator', href: '/smarttools/tool-016-half-life-calculator', order: 300, titleEn: 'Half-Life Calculator', titleAr: 'حاسبة نصف العمر', descriptionEn: 'Multi-compound clearance optimizer', descriptionAr: 'محسن تطهير المركبات المتعددة', icon: 'Timer', accessTier: 'free', componentPath: '@/components/tools/tool-016-half-life-calculator', enginePath: 'lib/tools/engines/tool-016-half-life-calculator', schemaPath: 'lib/tools/schemas/tool-016-half-life-calculator' },
  { toolId: 'mrx.tool.017-drug-interaction', slug: 'tool-017-drug-interaction', href: '/smarttools/tool-017-drug-interaction', order: 320, titleEn: 'Drug Interaction Checker', titleAr: 'فاحص تفاعلات المركبات', descriptionEn: 'Compound and medication screening', descriptionAr: 'فحص تفاعلات المركبات والأدوية', icon: 'Beaker', accessTier: 'free', componentPath: '@/components/tools/tool-017-drug-interaction', enginePath: 'lib/tools/engines/tool-017-drug-interaction', schemaPath: 'lib/tools/schemas/tool-017-drug-interaction' },
  { toolId: 'mrx.tool.018-hpta-recovery-monitor', slug: 'tool-018-hpta-recovery', href: '/smarttools/tool-018-hpta-recovery', order: 340, titleEn: 'HPTA Recovery Monitor', titleAr: 'مراقب استعادة HPTA', descriptionEn: 'Track LH/FSH/testosterone recovery', descriptionAr: 'تتبع استعادة الهرمونات LH/FSH/التستوستيرون', icon: 'Dna', accessTier: 'free', componentPath: '@/components/tools/tool-018-hpta-recovery', enginePath: 'lib/tools/engines/tool-018-hpta-recovery', schemaPath: 'lib/tools/schemas/tool-018-hpta-recovery' },
  { toolId: 'mrx.tool.019-cardio-monitor', slug: 'tool-019-cardio-monitor', href: '/smarttools/tool-019-cardio-monitor', order: 350, titleEn: 'Cardio Monitor', titleAr: 'مراقب القلب والدهون', descriptionEn: 'BP and lipid risk monitor', descriptionAr: 'متابعة ضغط الدم ومخاطر الدهون', icon: 'Scale', accessTier: 'free', componentPath: '@/components/tools/tool-019-cardio-monitor', enginePath: 'lib/tools/engines/tool-019-cardio-monitor', schemaPath: 'lib/tools/schemas/tool-019-cardio-monitor' },
];

export function validateCatalog(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const hrefs = new Set<string>();
  const orders = new Set<number>();
  const all = [...catalogAll()];
  for (const t of all) {
    if (ids.has(t.toolId)) errors.push('duplicate toolId: ' + t.toolId);
    ids.add(t.toolId);
    if (slugs.has(t.slug)) errors.push('duplicate slug: ' + t.slug);
    slugs.add(t.slug);
    if (hrefs.has(t.href)) errors.push('duplicate href: ' + t.href);
    hrefs.add(t.href);
    if (orders.has(t.order)) errors.push('duplicate order: ' + t.order);
    orders.add(t.order);
    if (!t.titleAr || !t.titleEn) errors.push('missing title: ' + t.toolId);
  }
  return { ok: errors.length === 0, errors };
}

export function catalogAll(): SmartToolEntry[] {
  return [...SMART_TOOLS_CATALOG, ...SMART_TOOLS_CATALOG_2, ...SMART_TOOLS_CATALOG_3, ...SMART_TOOLS_CATALOG_4, ...SMART_TOOLS_CATALOG_5].sort((a, b) => a.order - b.order);
}

export function getCatalogTools(): SmartToolEntry[] {
  return catalogAll();
}