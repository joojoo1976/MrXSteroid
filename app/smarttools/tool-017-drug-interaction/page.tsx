import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat legacy href - 301 to hierarchical canonical. */
export default function LegacyTool017DrugInteractionRedirectPage() {
  permanentRedirect(toHierarchicalHref('tool-017-drug-interaction') ?? '/smarttools');
}
