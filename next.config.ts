/**
 * Next.js configuration.
 * - React 19 (App Router default).
 * - Path alias @/* → project root (matches the canonical tree).
 */
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    async rewrites() {
        return [
            {
                source: '/transformationtimeline',
                destination: '/TransformationTimeline',
            },
            {
                source: '/transformation-timeline',
                destination: '/TransformationTimeline',
            },
        ];
    },
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Cache-Control', value: 'no-store' },
                ],
            },
        ];
    },
};

export default nextConfig;
