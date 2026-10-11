import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat route - 301 to hierarchical canonical /smarttools/[category]/five-alpha-conversion. */
export default function LegacyTool060FiveAlphaConversionRedirectPage() {
  permanentRedirect(toHierarchicalHref('five-alpha-conversion') ?? '/smarttools');
}
