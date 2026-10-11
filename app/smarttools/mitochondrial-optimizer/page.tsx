import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat route - 301 to hierarchical canonical /smarttools/[category]/mitochondrial-optimizer. */
export default function LegacyTool080MitochondrialOptimizerRedirectPage() {
  permanentRedirect(toHierarchicalHref('mitochondrial-optimizer') ?? '/smarttools');
}
