import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat legacy href - 301 to hierarchical canonical. */
export default function FlatRedirectTool107() {
  permanentRedirect(toHierarchicalHref('tool-107-contest-prep-peak-week-manipulator') ?? '/smarttools');
}
