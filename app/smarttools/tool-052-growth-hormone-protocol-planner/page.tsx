/* eslint-disable react-refresh/only-export-components */

import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat legacy href - 301 to hierarchical canonical. */
export default function LegacyTool052GrowthHormoneProtocolPlannerRedirectPage() {
  permanentRedirect(toHierarchicalHref('tool-052-growth-hormone-protocol-planner') ?? '/smarttools');
}
