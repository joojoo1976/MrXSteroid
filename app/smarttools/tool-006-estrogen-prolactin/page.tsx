import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat legacy href - 301 to hierarchical canonical. */
export default function LegacyTool006EstrogenProlactinRedirectPage() {
  permanentRedirect(toHierarchicalHref('tool-006-estrogen-prolactin') ?? '/smarttools');
}
