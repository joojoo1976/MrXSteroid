import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat route - 301 to hierarchical canonical /smarttools/[category]/mental-health-monitor. */
export default function LegacyTool050MentalHealthMonitorRedirectPage() {
  permanentRedirect(toHierarchicalHref('mental-health-monitor') ?? '/smarttools');
}
