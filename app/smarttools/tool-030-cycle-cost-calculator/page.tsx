import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat legacy href - 301 to hierarchical canonical. */
export default function LegacyTool030CycleCostCalculatorRedirectPage() {
  permanentRedirect(toHierarchicalHref('tool-030-cycle-cost-calculator') ?? '/smarttools');
}
