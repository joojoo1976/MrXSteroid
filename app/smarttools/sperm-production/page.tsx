import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat route - 301 to hierarchical canonical /smarttools/[category]/sperm-production. */
export default function LegacyTool064SpermProductionRedirectPage() {
  permanentRedirect(toHierarchicalHref('sperm-production') ?? '/smarttools');
}
