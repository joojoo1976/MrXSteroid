import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat legacy href - 301 to hierarchical canonical. */
export default function LegacyTool010CompoundStackBuilderRedirectPage() {
  permanentRedirect(toHierarchicalHref('tool-010-compound-stack-builder') ?? '/smarttools');
}
