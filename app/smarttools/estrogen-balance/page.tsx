import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat route - 301 to hierarchical canonical /smarttools/[category]/estrogen-balance. */
export default function LegacyTool067EstrogenBalanceRedirectPage() {
  permanentRedirect(toHierarchicalHref('estrogen-balance') ?? '/smarttools');
}
