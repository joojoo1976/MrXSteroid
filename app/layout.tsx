/**
 * Root layout — Server Component.
 * Static shell: HTML, metadata, global styles. Client providers (auth,
 * preferences, theme) mount below via <RootProviders> so the tree above the
 * client boundary stays renderable on the server.
 */
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import '../styles/globals.css';
import '../styles/legacy-theme.css';
import '../styles/chiller-font.css';
import RootProviders from './providers';

/* eslint-disable react-refresh/only-export-components -- metadata export is the sanctioned Next.js pattern */
export const metadata: Metadata = {
    title: {
        default: 'Mr. X-Steroid | The Ultimate Bodybuilding & Steroid Guide',
        template: '%s | Mr. X-Steroid',
    },
    description:
        'Discover the ultimate muscle-building guide and hormonal cycle book: a comprehensive, scientifically-backed roadmap designed with detailed tables and simple, easy-to-understand charts.',
    keywords: ['metabolic rate', 'TDEE', 'BMR', 'body fat projection', 'nutrition protocol', 'physique engineering', 'Mr. X-Steroid'],
    icons: {
        icon: [
            { url: '/favicon.ico', sizes: 'any' },
            { url: '/mrx-sticky-logo.png', type: 'image/png' },
            { url: '/icon.webp', type: 'image/webp' },
        ],
        shortcut: '/favicon.ico',
        apple: [
            { url: '/mrx-sticky-logo.png', sizes: '180x180', type: 'image/png' },
        ],
    },
    manifest: '/manifest.json',
    openGraph: {
        title: 'Mr. X-Steroid | The Ultimate Bodybuilding & Steroid Guide',
        description: 'Discover the ultimate muscle-building guide and hormonal cycle book: a comprehensive, scientifically-backed roadmap.',
        type: 'website',
        images: [
            {
                url: '/mrx-sticky-logo.png',
                width: 512,
                height: 512,
                alt: 'Mr. X-Steroid Logo',
            },
        ],
    },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    // Cookie/header-aware initial locale → the FIRST server render already
    // matches the visitor's language & unit system, eliminating the flash.
    const h = await headers();
    const lang = h.get('x-locale') === 'en' ? 'en' : 'ar';
    const units = h.get('x-units') === 'imperial' ? 'imperial' : 'metric';
    const isRTL = lang === 'ar';

    return (
        <html lang={lang} dir={isRTL ? 'rtl' : 'ltr'} suppressHydrationWarning>
            <body className="min-h-screen bg-background font-sans antialiased">
                <RootProviders initialLanguage={lang} initialUnitSystem={units}>
                    {children}
                </RootProviders>
            </body>
        </html>
    );
}
