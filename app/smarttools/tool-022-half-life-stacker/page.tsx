import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat legacy href - 301 to hierarchical canonical. */
export default function LegacyTool022HalfLifeStackerRedirectPage() {
  permanentRedirect(toHierarchicalHref('tool-022-half-life-stacker') ?? '/smarttools');
}
