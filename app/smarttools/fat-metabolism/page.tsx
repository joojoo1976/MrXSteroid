import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat route - 301 to hierarchical canonical /smarttools/[category]/fat-metabolism. */
export default function LegacyTool079FatMetabolismRedirectPage() {
  permanentRedirect(toHierarchicalHref('fat-metabolism') ?? '/smarttools');
}
