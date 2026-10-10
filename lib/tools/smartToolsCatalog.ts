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
  { toolId: 'mrx.tool.multi-ester-pharmacokinetics', slug: 'multi-ester-pharmacokinetics', href: '/smarttools/multi-ester-pharmacokinetics', order: 50, titleEn: 'Multi-Ester PK Simulator', titleAr: 'محاكي تراكم الإسترات', descriptionEn: 'Multi-ester serum accumulation simulator', descriptionAr: 'محاكي تراكم الإسترات', icon: 'Beaker', accessTier: 'free', componentPath: '@/components/tools/multi-ester-pharmacokinetics', enginePath: 'lib/tools/engines/multi-ester-pharmacokinetics', schemaPath: 'lib/tools/schemas/multi-ester-pharmacokinetics', bookContext: { chapterAr: 'الفصل 4: الحرائك الدوائية', chapterEn: 'Chapter 4: Pharmacokinetics', topicAr: 'تراكم الإسترات المتعددة ومحاكاة نصف العمر', topicEn: 'Multi-Ester Accumulation and Half-Life Simulation' } },
  { toolId: 'mrx.tool.hpta-recovery', slug: 'hpta-recovery', href: '/smarttools/hpta-recovery', order: 60, titleEn: 'HPTA Recovery Modeler', titleAr: 'محاكي استعادة HPTA', descriptionEn: 'HPTA suppression and recovery modeler', descriptionAr: 'محاكي تثبيط واستعادة HPTA', icon: 'Dna', accessTier: 'free', componentPath: '@/components/tools/hpta-recovery', enginePath: 'lib/tools/engines/hpta-recovery', schemaPath: 'lib/tools/schemas/hpta-recovery', bookContext: { chapterAr: 'الفصل 6: استعادة المحور', chapterEn: 'Chapter 6: HPTA Recovery', topicAr: 'نمذجة تثبيط واستعادة المحور النخاعي-الخصوي', topicEn: 'HPTA Suppression and Recovery Modeling' } },
];