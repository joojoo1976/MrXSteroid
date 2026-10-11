import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat route - 301 to hierarchical canonical /smarttools/[category]/fertility-preservation. */
export default function LegacyTool047FertilityPreservationRedirectPage() {
  permanentRedirect(toHierarchicalHref('fertility-preservation') ?? '/smarttools');
}
