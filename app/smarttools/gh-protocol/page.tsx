import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat route - 301 to hierarchical canonical. */
export default function LegacyTool052GhProtocolRedirectPage() {
  permanentRedirect(toHierarchicalHref('gh-protocol') ?? '/smarttools');
}
