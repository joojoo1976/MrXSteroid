import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat route - 301 to hierarchical canonical /smarttools/[category]/inflammation-calculator. */
export default function LegacyTool072InflammationCalculatorRedirectPage() {
  permanentRedirect(toHierarchicalHref('inflammation-calculator') ?? '/smarttools');
}
