import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat route - 301 to hierarchical canonical /smarttools/[category]/hair-loss-tracker. */
export default function LegacyTool061HairLossTrackerRedirectPage() {
  permanentRedirect(toHierarchicalHref('hair-loss-tracker') ?? '/smarttools');
}
