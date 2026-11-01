import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

export default function FlatTool150Redirect() {
  permanentRedirect(toHierarchicalHref('tool-150-ai-performance-command-center') ?? '/smarttools');
}
