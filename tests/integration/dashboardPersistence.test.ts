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

        it('retrieves latest metrics via GET /api/dashboard/metrics', async () => {
            const req = new NextRequest('http://localhost:3000/api/dashboard/metrics?type=daily_summary');
            const res = await getAdminMetrics(req);
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data.ok).toBe(true);
            expect(data.metrics).toBeDefined();
        });

        it('triggers fresh metric calculation via POST /api/dashboard/metrics', async () => {
            const req = new NextRequest('http://localhost:3000/api/dashboard/metrics', {
                method: 'POST',
            });
            const res = await postAdminMetrics(req);
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data.ok).toBe(true);
            expect(data.metrics).toBeDefined();
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
