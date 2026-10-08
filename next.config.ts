import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    // Allow build to pass despite ESLint warnings (warnings are not errors)
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Required for Docker multi-stage production builds (Dockerfile runner stage).
    // Set DOCKER_BUILD=1 in your docker-compose.yml build args to enable.
    output: process.env.DOCKER_BUILD === '1' ? 'standalone' : undefined,
    // SmartTools SPEC §1.4 — legacy top-level calculator URLs → 301 (permanent)
    // to the canonical hierarchical SmartTools routes. Active tools are NOT
    // touched: these sources existed only as convenience aliases.
    async redirects() {
        return [
            { source: '/macro', destination: '/smarttools/nutrition/tool-013-macro-optimizer', permanent: true },
            { source: '/bodyfat', destination: '/smarttools/body-composition/tool-011-progress-tracker', permanent: true },
            { source: '/injection', destination: '/smarttools/injection-formulation/tool-009-injection-site-rotator', permanent: true },
            { source: '/halflife', destination: '/smarttools/pharmacokinetics/tool-016-half-life-calculator', permanent: true },
            { source: '/lab', destination: '/smarttools/medical-monitoring/tool-024-bloodwork-interpreter', permanent: true },
            { source: '/genetic', destination: '/smarttools/training-recovery/tool-020-genetic-potential', permanent: true },
            { source: '/cycle', destination: '/smarttools/cycle-management/tool-010-compound-stack-builder', permanent: true },
            { source: '/master-calculator', destination: '/smarttools/cycle-management/tool-010-compound-stack-builder', permanent: true },
            { source: '/TransformationTimeline', destination: '/smarttools/body-composition/tool-011-progress-tracker', permanent: true },
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
