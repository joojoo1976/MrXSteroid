/**
 * Next.js configuration.
 * - React 19 (App Router default).
 * - Path alias @/* → project root (matches the canonical tree).
 */
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    // Required for Docker multi-stage production builds (Dockerfile runner stage).
    // Set DOCKER_BUILD=1 in your docker-compose.yml build args to enable.
    output: process.env.DOCKER_BUILD === '1' ? 'standalone' : undefined,
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
