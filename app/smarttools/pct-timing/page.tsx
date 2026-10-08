import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat legacy href - 301 to hierarchical canonical. */
export default function LegacyPctTimingRedirectPage() {
  permanentRedirect(toHierarchicalHref('pct-timing') ?? '/smarttools');
}
