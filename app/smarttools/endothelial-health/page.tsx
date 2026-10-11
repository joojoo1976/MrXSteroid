import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat route - 301 to hierarchical canonical /smarttools/[category]/endothelial-health. */
export default function LegacyTool078EndothelialHealthRedirectPage() {
  permanentRedirect(toHierarchicalHref('endothelial-health') ?? '/smarttools');
}
