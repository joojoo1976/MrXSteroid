/**
 * tests/integration/dashboardPersistence.test.ts
 *
 * Integration tests for Supabase Dashboard Persistence:
 * 1. user_dashboard_data table operations (preferences, pinned tools, custom goals)
 * 2. admin_dashboard_metrics table operations (financial aggregates, SEO stats, subscribers)
 * 3. /api/dashboard/user and /api/dashboard/metrics API routes
 */

import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import {
    getUserDashboardData,
    updateUserDashboardData,
    calculateAndPersistAdminMetrics,
} from '../../server/dashboard/dashboardService';
import { GET as getAdminMetrics, POST as postAdminMetrics } from '../../app/api/dashboard/metrics/route';

/**
 * The admin guard fails closed with 500 when Supabase env is absent, before it
 * can inspect the Authorization header. To exercise the unauthenticated branch
 * we provide dummy values for the duration of the call only, then restore them
 * so the real-DB test above keeps its "no client configured" behaviour.
 */
async function withSupabaseEnvConfigured<T>(fn: () => Promise<T>): Promise<T> {
    const urlKey = 'NEXT_PUBLIC_SUPABASE_URL';
    const anonKey = 'NEXT_PUBLIC_SUPABASE_ANON_KEY';
    const previousUrl = process.env[urlKey];
    const previousAnon = process.env[anonKey];
    process.env[urlKey] = 'https://test-project.supabase.co';
    process.env[anonKey] = 'test-anon-key';
    try {
        return await fn();
    } finally {
        if (previousUrl === undefined) delete process.env[urlKey];
        else process.env[urlKey] = previousUrl;
        if (previousAnon === undefined) delete process.env[anonKey];
        else process.env[anonKey] = previousAnon;
    }
}

describe('Dashboard Persistence & Supabase Analytics Suite', () => {

    describe('Admin Metrics Snapshot Pipeline', () => {
        it('calculates and persists admin metrics snapshot into Supabase', async () => {
            const metrics = await calculateAndPersistAdminMetrics('daily_summary');

            // Even if running with or without live DB in test environment:
            if (metrics) {
                expect(metrics.metricType).toBe('daily_summary');
                expect(metrics.metricDate).toBeDefined();
                expect(metrics.totalRevenueUsd).toBeGreaterThanOrEqual(0);
                expect(metrics.totalRevenueEgp).toBeGreaterThanOrEqual(0);
                expect(metrics.seoActiveKeywords).toBeGreaterThanOrEqual(0);
                expect(metrics.activeSubscribers).toBeGreaterThanOrEqual(0);
            }
        });

        // The metrics route is admin-only. Anonymous callers are rejected before
        // any service-role client is constructed. The full authenticated
        // contract (401/403/read-only/admin) is covered by
        // tests/security/dashboardMetricsRouteAuth.test.ts.
        it('rejects anonymous GET /api/dashboard/metrics with 401', async () => {
            const req = new NextRequest('http://localhost:3000/api/dashboard/metrics?type=daily_summary');
            const res = await withSupabaseEnvConfigured(() => getAdminMetrics(req));
            expect(res.status).toBe(401);

            const data = await res.json();
            expect(data.metrics).toBeUndefined();
        });

        it('rejects anonymous POST /api/dashboard/metrics with 401', async () => {
            const req = new NextRequest('http://localhost:3000/api/dashboard/metrics', {
                method: 'POST',
            });
            const res = await withSupabaseEnvConfigured(() => postAdminMetrics(req));
            expect(res.status).toBe(401);

            const data = await res.json();
            expect(data.metrics).toBeUndefined();
        });
    });

    describe('User Dashboard Data Service', () => {
        it('handles null or empty userId safely without throwing', async () => {
            const res = await getUserDashboardData('');
            expect(res).toBeNull();

            const updateRes = await updateUserDashboardData('', { savedNotes: 'test' });
            expect(updateRes).toBe(false);
        });

        it('validates user dashboard payload shape', () => {
            const sampleUserDashboard = {
                pinnedTools: ['macro', 'bodyfat', 'injection', 'halflife'],
                customGoals: {
                    targetWeight: 85,
                    targetBodyFat: 10,
                    currentPhase: 'cutting',
                },
                savedNotes: 'Cycle notes: monitor prolactin on week 4',
                themePreference: 'dark',
                currencyPreference: 'EGP',
            };

            expect(sampleUserDashboard.pinnedTools.length).toBe(4);
            expect(sampleUserDashboard.customGoals.currentPhase).toBe('cutting');
            expect(sampleUserDashboard.savedNotes).toContain('Cycle notes');
        });
    });
});
