import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat route - 301 to hierarchical canonical /smarttools/[category]/trt-lifetime. */
export default function LegacyTool046TrtLifetimeRedirectPage() {
  permanentRedirect(toHierarchicalHref('trt-lifetime') ?? '/smarttools');
}
