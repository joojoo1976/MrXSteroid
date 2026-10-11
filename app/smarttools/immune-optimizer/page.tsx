import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat route - 301 to hierarchical canonical /smarttools/[category]/immune-optimizer. */
export default function LegacyTool073ImmuneOptimizerRedirectPage() {
  permanentRedirect(toHierarchicalHref('immune-optimizer') ?? '/smarttools');
}
