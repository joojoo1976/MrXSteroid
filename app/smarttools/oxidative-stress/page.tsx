import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat route - 301 to hierarchical canonical /smarttools/[category]/oxidative-stress. */
export default function LegacyTool070OxidativeStressRedirectPage() {
  permanentRedirect(toHierarchicalHref('oxidative-stress') ?? '/smarttools');
}
