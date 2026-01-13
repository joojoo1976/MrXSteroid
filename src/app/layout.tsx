import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

/* eslint-disable-next-line react-refresh/only-export-components */
export const metadata: Metadata = {
    title: {
        default: "Mr. X-Steroid | Professional Bodybuilding & Hormonal Science",
        template: "%s | Mr. X-Steroid"
    },
    description: "The complete guide to anabolic steroids, performance enhancement, and longevity by George Mourice. Science-based protocols for athletes.",
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://www.mrxsteroid.com',
        siteName: 'Mr. X-Steroid',
        images: [
            {
                url: 'https://www.mrxsteroid.com/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Mr. X-Steroid Hero',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Mr. X-Steroid',
        description: 'Professional Bodybuilding & Hormonal Science',
        images: ['https://www.mrxsteroid.com/twitter-image.jpg'],
    },
    alternates: {
        canonical: 'https://www.mrxsteroid.com',
        languages: {
            'ar-EG': 'https://www.mrxsteroid.com/ar',
        },
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                {/* Navigation Wrapper could go here */}
                {children}
                {/* Global Footer (Disclaimer) would go here */}
            </body>
        </html>
    );
}
