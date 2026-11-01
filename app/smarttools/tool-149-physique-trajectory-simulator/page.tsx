import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

export default function FlatTool149Redirect() {
  permanentRedirect(toHierarchicalHref('tool-149-physique-trajectory-simulator') ?? '/smarttools');
}
