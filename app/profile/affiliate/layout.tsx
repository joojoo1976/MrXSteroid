import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Affiliate Dashboard — Mr. X Steroid",
    robots: { index: false, follow: false },
};

export default function AffiliateLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
