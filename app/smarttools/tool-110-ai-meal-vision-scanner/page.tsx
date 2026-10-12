import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat legacy href - 301 to hierarchical canonical. */
export default function FlatRedirectTool110() {
  permanentRedirect(toHierarchicalHref('tool-110-ai-meal-vision-scanner') ?? '/smarttools');
}
