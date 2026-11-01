import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Legacy vision route - 301 to canonical hierarchical route. */
export default function LegacyBodyCompositionVisionRedirect() {
  permanentRedirect(toHierarchicalHref('tool-108-ai-body-composition-vision-engine') ?? '/smarttools');
}
