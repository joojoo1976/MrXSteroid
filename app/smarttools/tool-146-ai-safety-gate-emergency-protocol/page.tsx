import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

export default function FlatTool146Redirect() {
  permanentRedirect(toHierarchicalHref('tool-146-ai-safety-gate-emergency-protocol') ?? '/smarttools');
}
