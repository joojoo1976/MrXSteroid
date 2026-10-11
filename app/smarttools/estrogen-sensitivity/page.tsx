import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat route - 301 to hierarchical canonical /smarttools/[category]/estrogen-sensitivity. */
export default function LegacyTool066EstrogenSensitivityRedirectPage() {
  permanentRedirect(toHierarchicalHref('estrogen-sensitivity') ?? '/smarttools');
}
