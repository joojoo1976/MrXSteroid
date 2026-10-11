import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat route - 301 to hierarchical canonical /smarttools/[category]/free-testosterone. */
export default function LegacyTool057FreeTestosteroneRedirectPage() {
  permanentRedirect(toHierarchicalHref('free-testosterone') ?? '/smarttools');
}
