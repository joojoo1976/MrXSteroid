/**
 * Root layout — Server Component.
 * Static shell: HTML, metadata, global styles. Client providers (auth,
 * preferences, theme) mount below via <RootProviders> so the tree above the
 * client boundary stays renderable on the server.
 */
import type { Metadata } from 'next';
import '../styles/globals.css';
import '../styles/legacy-theme.css';
import '../styles/chiller-font.css';
import RootProviders from './providers';

/* eslint-disable react-refresh/only-export-components -- metadata export is the sanctioned Next.js pattern */
export const metadata: Metadata = {
    title: 'Mr. X Steroid — Precision Metabolic BioCalc & The Protocol',
    description:
        'Body-composition modeling, adaptive macro targets and week-by-week projections. Run your bio-signal calculator, then lock the 12-week protocol.',
    keywords: ['metabolic rate', 'TDEE', 'BMR', 'body fat projection', 'nutrition protocol', 'physique engineering'],
    openGraph: {
        title: 'Mr. X Steroid — The Protocol',
        description: 'Engineer your physique with precision metabolism.',
        type: 'website',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="min-h-screen bg-background font-sans antialiased">
                <RootProviders>{children}</RootProviders>
            </body>
        </html>
    );
}
