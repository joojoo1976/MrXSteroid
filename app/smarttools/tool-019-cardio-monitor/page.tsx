import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat legacy href - 301 to hierarchical canonical. */
export default function LegacyTool019CardioMonitorRedirectPage() {
  permanentRedirect(toHierarchicalHref('tool-019-cardio-monitor') ?? '/smarttools');
}
