/* eslint-disable react-refresh/only-export-components */

import type { Metadata } from 'next';
import SmartToolsHeader from '@/components/layouts/SmartToolsHeader';
import GlobalFooterWrapper from '@/components/layouts/GlobalFooterWrapper';
import { labsMetadata } from './metadata';

// Decision R1: this surface must never be indexed. The noindex signal comes
// from this server layout — the established in-repo pattern (see
// app/admin-analytics/layout.tsx). The page stays crawlable (no robots.txt
// Disallow) so the noindex meta is actually seen.
//
// G-01: an unindexed page is still a page a human can land on from a shared
// link, so it wears the same chrome as every other user-facing route. The
// canonical wrappers are mounted here — never re-implemented — so the header
// and footer stay identical to the rest of the site. The `pt-24 md:pt-28`
// content offset is the same one the other layouts use to clear the fixed
// header; the tool's own title block lives inside the shell and is a plain
// `div`, so the site header remains the page's only `banner` landmark.
export const metadata: Metadata = labsMetadata;

export default function Tool036V4Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-zinc-900 dark:text-zinc-100">
      <SmartToolsHeader />
      <div className="flex-1 pt-24 md:pt-28">{children}</div>
      <GlobalFooterWrapper />
    </div>
  );
}
