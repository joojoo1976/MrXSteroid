/* eslint-disable react-refresh/only-export-components */

import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

/** Flat legacy href - 301 to hierarchical canonical. */
export default function LegacyTool041HematocritMonitorRedirectPage() {
  permanentRedirect(toHierarchicalHref('tool-041-hematocrit-monitor') ?? '/smarttools');
}
