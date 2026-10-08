import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat legacy href - 301 to hierarchical canonical. */
export default function LegacyTool008SideEffectTrackerRedirectPage() {
  permanentRedirect(toHierarchicalHref('tool-008-side-effect-tracker') ?? '/smarttools');
}
