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
}

export const SMART_TOOLS_CATALOG: readonly SmartToolEntry[] = [
  { toolId: 'mrx.tool.multi-ester-pharmacokinetics', slug: 'multi-ester-pharmacokinetics', href: '/smarttools/multi-ester-pharmacokinetics', order: 50, titleEn: 'Multi-Ester PK Simulator', titleAr: 'محاكي تراكم الإسترات', descriptionEn: 'Multi-ester serum accumulation simulator', descriptionAr: 'محاكي تراكم الإسترات', icon: 'Beaker', accessTier: 'free', componentPath: '@/components/tools/multi-ester-pharmacokinetics', enginePath: 'lib/tools/engines/multi-ester-pharmacokinetics', schemaPath: 'lib/tools/schemas/multi-ester-pharmacokinetics' },
  { toolId: 'mrx.tool.hpta-recovery', slug: 'hpta-recovery', href: '/smarttools/hpta-recovery', order: 60, titleEn: 'HPTA Recovery Modeler', titleAr: 'محاكي استعادة HPTA', descriptionEn: 'HPTA suppression and recovery modeler', descriptionAr: 'محاكي تثبيط واستعادة HPTA', icon: 'Dna', accessTier: 'free', componentPath: '@/components/tools/hpta-recovery', enginePath: 'lib/tools/engines/hpta-recovery', schemaPath: 'lib/tools/schemas/hpta-recovery' },
];