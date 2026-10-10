import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat legacy href - 301 to hierarchical canonical. */
export default function LegacyTool033BloodworkTrendAnalyzerRedirectPage() {
  permanentRedirect(toHierarchicalHref('tool-033-bloodwork-trend-analyzer') ?? '/smarttools');
}
