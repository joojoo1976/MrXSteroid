/* eslint-disable react-refresh/only-export-components */

import type { Metadata } from "next";

// H4 (owner-approved): this surface must never be indexed. The page is a
// client component and cannot export metadata itself, so the noindex signal
// comes from this server layout — the established in-repo pattern
// (see app/profile/affiliate/layout.tsx). The page stays crawlable (no
// robots.txt Disallow) so Google can see the noindex meta.
export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}