import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';
export default function FlatRedirect() {
  permanentRedirect(toHierarchicalHref('tool-136-physique-golden-ratio-score') ?? '/smarttools');
}
