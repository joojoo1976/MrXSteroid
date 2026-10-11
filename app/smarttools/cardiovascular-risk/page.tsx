import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat route - 301 to hierarchical canonical /smarttools/[category]/cardiovascular-risk. */
export default function LegacyTool048CardiovascularRiskRedirectPage() {
  permanentRedirect(toHierarchicalHref('cardiovascular-risk') ?? '/smarttools');
}
