import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat legacy href - 301 to hierarchical canonical. */
export default function LegacyTool007BloodworkAnalyzerRedirectPage() {
  permanentRedirect(toHierarchicalHref('tool-007-bloodwork-analyzer') ?? '/smarttools');
}
