import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat legacy href - 301 to hierarchical canonical. */
export default function LegacyTool035HormoneConversionRedirectPage() {
  permanentRedirect(toHierarchicalHref('tool-035-hormone-conversion') ?? '/smarttools');
}
