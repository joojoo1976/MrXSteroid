import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat legacy href - 301 to hierarchical canonical. */
export default function LegacyTool029SideEffectEarlyWarningRedirectPage() {
  permanentRedirect(toHierarchicalHref('tool-029-side-effect-early-warning') ?? '/smarttools');
}
