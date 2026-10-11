import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat route - 301 to hierarchical canonical /smarttools/[category]/detox-optimizer. */
export default function LegacyTool069DetoxOptimizerRedirectPage() {
  permanentRedirect(toHierarchicalHref('detox-optimizer') ?? '/smarttools');
}
