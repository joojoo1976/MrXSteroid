import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat route - 301 to hierarchical canonical /smarttools/[category]/bone-density-optimizer. */
export default function LegacyTool049BoneDensityOptimizerRedirectPage() {
  permanentRedirect(toHierarchicalHref('bone-density-optimizer') ?? '/smarttools');
}
