import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat route - 301 to hierarchical canonical /smarttools/[category]/arterial-health. */
export default function LegacyTool075ArterialHealthRedirectPage() {
  permanentRedirect(toHierarchicalHref('arterial-health') ?? '/smarttools');
}
