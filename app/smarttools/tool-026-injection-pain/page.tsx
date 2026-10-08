import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat legacy href - 301 to hierarchical canonical. */
export default function LegacyTool026InjectionPainRedirectPage() {
  permanentRedirect(toHierarchicalHref('tool-026-injection-pain') ?? '/smarttools');
}
