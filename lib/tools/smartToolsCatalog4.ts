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
import { SMART_TOOLS_CATALOG_11 } from './smartToolsCatalog11';
import { SMART_TOOLS_CATALOG_12 } from './smartToolsCatalog12';
import { SMART_TOOLS_CATALOG_13 } from './smartToolsCatalog13';
import { SMART_TOOLS_CATALOG_14 } from './smartToolsCatalog14';
import { SMART_TOOLS_CATALOG_15 } from './smartToolsCatalog15';
import { SMART_TOOLS_CATALOG_16 } from './smartToolsCatalog16';
import { SMART_TOOLS_CATALOG_17 } from './smartToolsCatalog17';
import { SMART_TOOLS_CATALOG_18 } from './smartToolsCatalog18';
import { SMART_TOOLS_CATALOG_19 } from './smartToolsCatalog19';
import { SMART_TOOLS_CATALOG_20 } from './smartToolsCatalog20';
import { SMART_TOOLS_CATALOG_21 } from './smartToolsCatalog21';
import { SMART_TOOLS_CATALOG_22 } from './smartToolsCatalog22';
import { SMART_TOOLS_CATALOG_23 } from './smartToolsCatalog23';
import { SMART_TOOLS_CATALOG_24 } from './smartToolsCatalog24';
import { SMART_TOOLS_CATALOG_25 } from './smartToolsCatalog25';
import { SMART_TOOLS_CATALOG_26 } from './smartToolsCatalog26';
import { SMART_TOOLS_CATALOG_27 } from './smartToolsCatalog27';
import { SMART_TOOLS_CATALOG_28 } from './smartToolsCatalog28';
import { SMART_TOOLS_CATALOG_29 } from './smartToolsCatalog29';
import { SMART_TOOLS_CATALOG_30 } from './smartToolsCatalog30';

export const SMART_TOOLS_CATALOG_4: readonly SmartToolEntry[] = [
  { toolId: 'mrx.tool.016-half-life', slug: 'tool-016-half-life-calculator', href: '/smarttools/pharmacokinetics/tool-016-half-life-calculator', order: 300, titleEn: 'Half-Life Calculator', titleAr: 'حاسبة نصف العمر', descriptionEn: 'Multi-compound clearance optimizer', descriptionAr: 'محسن تطهير المركبات المتعددة', icon: 'Timer', accessTier: 'free', componentPath: '@/components/tools/tool-016-half-life-calculator', enginePath: 'lib/tools/engines/tool-016-half-life-calculator', schemaPath: 'lib/tools/schemas/tool-016-half-life-calculator', bookContext: { chapterAr: 'الفصل 4: الحرائك الدوائية', chapterEn: 'Chapter 4: Pharmacokinetics', topicAr: 'حساب نصف العمر وتطهير المركبات', topicEn: 'Half-Life Calculation and Compound Clearance' } },
  { toolId: 'mrx.tool.017-drug-interaction', slug: 'tool-017-drug-interaction', href: '/smarttools/medical-monitoring/tool-017-drug-interaction', order: 320, titleEn: 'Drug Interaction Checker', titleAr: 'فاحص تفاعلات المركبات', descriptionEn: 'Compound and medication screening', descriptionAr: 'فحص تفاعلات المركبات والأدوية', icon: 'Beaker', accessTier: 'free', componentPath: '@/components/tools/tool-017-drug-interaction', enginePath: 'lib/tools/engines/tool-017-drug-interaction', schemaPath: 'lib/tools/schemas/tool-017-drug-interaction', bookContext: { chapterAr: 'الفصل 7: التفاعلات الدوائية', chapterEn: 'Chapter 7: Drug Interactions', topicAr: 'فحص تفاعلات المركبات والأدوية', topicEn: 'Compound and Medication Interaction Screening' } },
  { toolId: 'mrx.tool.018-hpta-recovery-monitor', slug: 'tool-018-hpta-recovery', href: '/smarttools/hormonal-health/tool-018-hpta-recovery', order: 340, titleEn: 'HPTA Recovery Monitor', titleAr: 'مراقب استعادة HPTA', descriptionEn: 'Track LH/FSH/testosterone recovery', descriptionAr: 'تتبع استعادة الهرمونات LH/FSH/التستوستيرون', icon: 'Dna', accessTier: 'free', componentPath: '@/components/tools/tool-018-hpta-recovery', enginePath: 'lib/tools/engines/tool-018-hpta-recovery', schemaPath: 'lib/tools/schemas/tool-018-hpta-recovery', bookContext: { chapterAr: 'الفصل 6: استعادة المحور', chapterEn: 'Chapter 6: HPTA Recovery', topicAr: 'مراقبة استعادة LH/FSH/التستوستيرون', topicEn: 'Tracking LH/FSH/Testosterone Recovery' } },
  { toolId: 'mrx.tool.019-cardio-monitor', slug: 'tool-019-cardio-monitor', href: '/smarttools/medical-monitoring/tool-019-cardio-monitor', order: 350, titleEn: 'Cardio Monitor', titleAr: 'مراقب القلب والدهون', descriptionEn: 'BP and lipid risk monitor', descriptionAr: 'متابعة ضغط الدم ومخاطر الدهون', icon: 'Scale', accessTier: 'free', componentPath: '@/components/tools/tool-019-cardio-monitor', enginePath: 'lib/tools/engines/tool-019-cardio-monitor', schemaPath: 'lib/tools/schemas/tool-019-cardio-monitor', bookContext: { chapterAr: 'الفصل 16: صحة القلب', chapterEn: 'Chapter 16: Cardiovascular Health', topicAr: 'متابعة ضغط الدم ومخاطر الدهون', topicEn: 'Blood Pressure and Lipid Risk Monitoring' } },
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
  return [...SMART_TOOLS_CATALOG, ...SMART_TOOLS_CATALOG_2, ...SMART_TOOLS_CATALOG_3, ...SMART_TOOLS_CATALOG_4, ...SMART_TOOLS_CATALOG_5, ...catalog6, ...SMART_TOOLS_CATALOG_7, ...SMART_TOOLS_CATALOG_8, ...SMART_TOOLS_CATALOG_9, ...SMART_TOOLS_CATALOG_10, ...SMART_TOOLS_CATALOG_11, ...SMART_TOOLS_CATALOG_12, ...SMART_TOOLS_CATALOG_13, ...SMART_TOOLS_CATALOG_14, ...SMART_TOOLS_CATALOG_15, ...SMART_TOOLS_CATALOG_16, ...SMART_TOOLS_CATALOG_17, ...SMART_TOOLS_CATALOG_18, ...SMART_TOOLS_CATALOG_19, ...SMART_TOOLS_CATALOG_20, ...SMART_TOOLS_CATALOG_21, ...SMART_TOOLS_CATALOG_22, ...SMART_TOOLS_CATALOG_23, ...SMART_TOOLS_CATALOG_24, ...SMART_TOOLS_CATALOG_25, ...SMART_TOOLS_CATALOG_26, ...SMART_TOOLS_CATALOG_27, ...SMART_TOOLS_CATALOG_28, ...SMART_TOOLS_CATALOG_29, ...SMART_TOOLS_CATALOG_30].sort((a, b) => a.order - b.order);
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

export { SMART_TOOLS_CATALOG_14 } from './smartToolsCatalog14';




















