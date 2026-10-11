import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat route - 301 to hierarchical canonical /smarttools/[category]/antioxidant-manager. */
export default function LegacyTool071AntioxidantManagerRedirectPage() {
  permanentRedirect(toHierarchicalHref('antioxidant-manager') ?? '/smarttools');
}
