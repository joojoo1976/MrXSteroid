import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat legacy href - 301 to hierarchical canonical. */
export default function FlatRedirectTool108() {
  permanentRedirect(toHierarchicalHref('tool-108-ai-body-composition-vision-engine') ?? '/smarttools');
}
