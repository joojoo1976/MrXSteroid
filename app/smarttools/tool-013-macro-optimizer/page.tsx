import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat legacy href - 301 to hierarchical canonical. */
export default function LegacyTool013MacroOptimizerRedirectPage() {
  permanentRedirect(toHierarchicalHref('tool-013-macro-optimizer') ?? '/smarttools');
}
