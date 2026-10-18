/* eslint-disable react-refresh/only-export-components */

import type { Metadata } from 'next';
import { labsMetadata } from './metadata';

// Decision R1: this surface must never be indexed. The noindex signal comes
// from this server layout — the established in-repo pattern (see
// app/admin-analytics/layout.tsx). The page stays crawlable (no robots.txt
// Disallow) so the noindex meta is actually seen.
export const metadata: Metadata = labsMetadata;

export default function Tool036V4Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
