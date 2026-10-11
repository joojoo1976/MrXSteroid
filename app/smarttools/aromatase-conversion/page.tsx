import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat route - 301 to hierarchical canonical /smarttools/[category]/aromatase-conversion. */
export default function LegacyTool065AromataseConversionRedirectPage() {
  permanentRedirect(toHierarchicalHref('aromatase-conversion') ?? '/smarttools');
}
