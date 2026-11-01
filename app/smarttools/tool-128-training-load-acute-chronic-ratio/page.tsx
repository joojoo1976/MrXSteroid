import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';
export default function FlatRedirect() {
  permanentRedirect(toHierarchicalHref('tool-128-training-load-acute-chronic-ratio') ?? '/smarttools');
}
