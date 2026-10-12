import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat legacy href - 301 to hierarchical canonical. */
export default function FlatRedirectTool109() {
  permanentRedirect(toHierarchicalHref('tool-109-competition-readiness-posing-os') ?? '/smarttools');
}
