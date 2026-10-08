import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat legacy href - 301 to hierarchical canonical. */
export default function LegacyTool016LibidoCalculatorRedirectPage() {
  permanentRedirect(toHierarchicalHref('tool-016-libido-calculator') ?? '/smarttools');
}
