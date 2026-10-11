import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat route - 301 to hierarchical canonical. */
export default function LegacyTool055InsulinSensitivityRedirectPage() {
  permanentRedirect(toHierarchicalHref('insulin-sensitivity') ?? '/smarttools');
}
