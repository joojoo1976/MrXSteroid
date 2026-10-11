import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat route - 301 to hierarchical canonical /smarttools/[category]/blood-viscosity. */
export default function LegacyTool076BloodViscosityRedirectPage() {
  permanentRedirect(toHierarchicalHref('blood-viscosity') ?? '/smarttools');
}
