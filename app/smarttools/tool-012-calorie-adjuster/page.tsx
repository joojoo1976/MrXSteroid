import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat legacy href - 301 to hierarchical canonical. */
export default function LegacyTool012CalorieAdjusterRedirectPage() {
  permanentRedirect(toHierarchicalHref('tool-012-calorie-adjuster') ?? '/smarttools');
}
