import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat route - 301 to hierarchical canonical /smarttools/[category]/androgenic-balance. */
export default function LegacyTool058AndrogenicBalanceRedirectPage() {
  permanentRedirect(toHierarchicalHref('androgenic-balance') ?? '/smarttools');
}
