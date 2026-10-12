import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat legacy href - 301 to hierarchical canonical. */
export default function FlatRedirectTool106() {
  permanentRedirect(toHierarchicalHref('tool-106-glycogen-supercompensation-water-modeler') ?? '/smarttools');
}
