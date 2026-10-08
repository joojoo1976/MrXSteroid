import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat legacy href - 301 to hierarchical canonical. */
export default function LegacyTool021PeptideProtocolRedirectPage() {
  permanentRedirect(toHierarchicalHref('tool-021-peptide-protocol') ?? '/smarttools');
}
