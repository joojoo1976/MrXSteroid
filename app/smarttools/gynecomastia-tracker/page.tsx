import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat route - 301 to hierarchical canonical /smarttools/[category]/gynecomastia-tracker. */
export default function LegacyTool068GynecomastiaTrackerRedirectPage() {
  permanentRedirect(toHierarchicalHref('gynecomastia-tracker') ?? '/smarttools');
}
