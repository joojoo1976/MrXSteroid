import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat legacy href - 301 to hierarchical canonical. */
export default function LegacyTool032AdvancedPctPlannerRedirectPage() {
  permanentRedirect(toHierarchicalHref('tool-032-advanced-pct-planner') ?? '/smarttools');
}
