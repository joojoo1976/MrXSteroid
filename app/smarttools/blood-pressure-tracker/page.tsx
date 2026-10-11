import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat route - 301 to hierarchical canonical /smarttools/[category]/blood-pressure-tracker. */
export default function LegacyTool074BloodPressureTrackerRedirectPage() {
  permanentRedirect(toHierarchicalHref('blood-pressure-tracker') ?? '/smarttools');
}
