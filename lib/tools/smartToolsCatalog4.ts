import type { SmartToolEntry } from './smartToolsCatalog';
import { SMART_TOOLS_CATALOG } from './smartToolsCatalog';
import { SMART_TOOLS_CATALOG_2 } from './smartToolsCatalog2';
import { SMART_TOOLS_CATALOG_3 } from './smartToolsCatalog3';
import { SMART_TOOLS_CATALOG_5 } from './smartToolsCatalog5';
import { SMART_TOOLS_CATALOG_6 } from './smartToolsCatalog6';
import { SMART_TOOLS_CATALOG_7 } from './smartToolsCatalog7';
import { SMART_TOOLS_CATALOG_8 } from './smartToolsCatalog8';
import { SMART_TOOLS_CATALOG_9 } from './smartToolsCatalog9';
import { SMART_TOOLS_CATALOG_10 } from './smartToolsCatalog10';

export const SMART_TOOLS_CATALOG_4: readonly SmartToolEntry[] = [
  { toolId: 'mrx.tool.016-half-life', slug: 'tool-016-half-life-calculator', href: '/smarttools/tool-016-half-life-calculator', order: 300, titleEn: 'Half-Life Calculator', titleAr: 'حاسبة نصف العمر', descriptionEn: 'Multi-compound clearance optimizer', descriptionAr: 'محسن تطهير المركبات المتعددة', icon: 'Timer', accessTier: 'free', componentPath: '@/components/tools/tool-016-half-life-calculator', enginePath: 'lib/tools/engines/tool-016-half-life-calculator', schemaPath: 'lib/tools/schemas/tool-016-half-life-calculator', bookContext: { chapterAr: 'الفصل 4: الحرائك الدوائية', chapterEn: 'Chapter 4: Pharmacokinetics', topicAr: 'حساب نصف العمر وتطهير المركبات', topicEn: 'Half-Life Calculation and Compound Clearance' } },
  { toolId: 'mrx.tool.017-drug-interaction', slug: 'tool-017-drug-interaction', href: '/smarttools/tool-017-drug-interaction', order: 320, titleEn: 'Drug Interaction Checker', titleAr: 'فاحص تفاعلات المركبات', descriptionEn: 'Compound and medication screening', descriptionAr: 'فحص تفاعلات المركبات والأدوية', icon: 'Beaker', accessTier: 'free', componentPath: '@/components/tools/tool-017-drug-interaction', enginePath: 'lib/tools/engines/tool-017-drug-interaction', schemaPath: 'lib/tools/schemas/tool-017-drug-interaction', bookContext: { chapterAr: 'الفصل 7: التفاعلات الدوائية', chapterEn: 'Chapter 7: Drug Interactions', topicAr: 'فحص تفاعلات المركبات والأدوية', topicEn: 'Compound and Medication Interaction Screening' } },
  { toolId: 'mrx.tool.018-hpta-recovery-monitor', slug: 'tool-018-hpta-recovery', href: '/smarttools/tool-018-hpta-recovery', order: 340, titleEn: 'HPTA Recovery Monitor', titleAr: 'مراقب استعادة HPTA', descriptionEn: 'Track LH/FSH/testosterone recovery', descriptionAr: 'تتبع استعادة الهرمونات LH/FSH/التستوستيرون', icon: 'Dna', accessTier: 'free', componentPath: '@/components/tools/tool-018-hpta-recovery', enginePath: 'lib/tools/engines/tool-018-hpta-recovery', schemaPath: 'lib/tools/schemas/tool-018-hpta-recovery', bookContext: { chapterAr: 'الفصل 6: استعادة المحور', chapterEn: 'Chapter 6: HPTA Recovery', topicAr: 'مراقبة استعادة LH/FSH/التستوستيرون', topicEn: 'Tracking LH/FSH/Testosterone Recovery' } },
  { toolId: 'mrx.tool.019-cardio-monitor', slug: 'tool-019-cardio-monitor', href: '/smarttools/tool-019-cardio-monitor', order: 350, titleEn: 'Cardio Monitor', titleAr: 'مراقب القلب والدهون', descriptionEn: 'BP and lipid risk monitor', descriptionAr: 'متابعة ضغط الدم ومخاطر الدهون', icon: 'Scale', accessTier: 'free', componentPath: '@/components/tools/tool-019-cardio-monitor', enginePath: 'lib/tools/engines/tool-019-cardio-monitor', schemaPath: 'lib/tools/schemas/tool-019-cardio-monitor', bookContext: { chapterAr: 'الفصل 16: صحة القلب', chapterEn: 'Chapter 16: Cardiovascular Health', topicAr: 'متابعة ضغط الدم ومخاطر الدهون', topicEn: 'Blood Pressure and Lipid Risk Monitoring' } },
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
  // Catalog 6 carries the baseline roadmap (#031-#050, merge policy).
  // Each entry keeps its own `status`: 'planned' until its engine/schema/
  // component/route land on disk, then 'implemented' — entries are never
  // excluded here, so the validation gate can always detect a missing
  // implementation. Hub/route generators filter `planned` at their own layer.
  // Future catalogs (original #051-#100 + unique additions past #100) append here.
  const catalog6: readonly SmartToolEntry[] = [...SMART_TOOLS_CATALOG_6];
  return [...SMART_TOOLS_CATALOG, ...SMART_TOOLS_CATALOG_2, ...SMART_TOOLS_CATALOG_3, ...SMART_TOOLS_CATALOG_4, ...SMART_TOOLS_CATALOG_5, ...catalog6, ...SMART_TOOLS_CATALOG_7, ...SMART_TOOLS_CATALOG_8, ...SMART_TOOLS_CATALOG_9, ...SMART_TOOLS_CATALOG_10].sort((a, b) => a.order - b.order);
}

export function getCatalogTools(): SmartToolEntry[] {
  return catalogAll();
}

/**
 * User-visible catalog: every entry EXCEPT 'planned' roadmap items.
 * Hub, category pages, sitemap and route generators must consume THIS
 * (or getPublishedToolsByCategory) so unbuilt tools can never surface.
 */
export function getPublishedCatalogTools(): SmartToolEntry[] {
  return catalogAll().filter((t) => t.status !== 'planned');
}