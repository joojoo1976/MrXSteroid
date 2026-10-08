import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat legacy href - 301 to hierarchical canonical. */
export default function LegacyTool011ProgressTrackerRedirectPage() {
  permanentRedirect(toHierarchicalHref('tool-011-progress-tracker') ?? '/smarttools');
}
