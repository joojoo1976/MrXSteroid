import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat legacy href - 301 to hierarchical canonical. */
export default function LegacyTool025DrugInteractionProRedirectPage() {
  permanentRedirect(toHierarchicalHref('tool-025-drug-interaction-pro') ?? '/smarttools');
}
