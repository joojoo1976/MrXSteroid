import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat legacy href - 301 to hierarchical canonical. */
export default function LegacyTool023TrtOptimizationRedirectPage() {
  permanentRedirect(toHierarchicalHref('tool-023-trt-optimization') ?? '/smarttools');
}
