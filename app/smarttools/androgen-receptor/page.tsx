import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat route - 301 to hierarchical canonical /smarttools/[category]/androgen-receptor. */
export default function LegacyTool059AndrogenReceptorRedirectPage() {
  permanentRedirect(toHierarchicalHref('androgen-receptor') ?? '/smarttools');
}
