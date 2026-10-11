import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat route - 301 to hierarchical canonical /smarttools/[category]/nitric-oxide. */
export default function LegacyTool077NitricOxideRedirectPage() {
  permanentRedirect(toHierarchicalHref('nitric-oxide') ?? '/smarttools');
}
