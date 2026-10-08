import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat legacy href - 301 to hierarchical canonical. */
export default function LegacyTool009InjectionSiteRotatorRedirectPage() {
  permanentRedirect(toHierarchicalHref('tool-009-injection-site-rotator') ?? '/smarttools');
}
