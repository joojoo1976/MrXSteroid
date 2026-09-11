/**
 * server/dashboard/dashboardService.ts
 * Supabase integration service for User & Admin Dashboard state persistence.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface UserDashboardData {
    id: string;
    userId: string;
    pinnedTools: string[];
    customGoals: {
        targetWeight?: number | null;
        targetBodyFat?: number | null;
        currentPhase?: string;
    };
    savedNotes: string;
    themePreference: string;
    currencyPreference: string;
    lastActiveAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface AdminDashboardMetricsData {
    id: string;
    metricDate: string;
    metricType: 'daily_summary' | 'weekly_summary' | 'monthly_summary' | 'realtime_snapshot';
    totalRevenueUsd: number;
    totalRevenueEgp: number;
    successfulInvoices: number;
    pendingInvoices: number;
    failedInvoices: number;
    activeSubscribers: number;
    activeAffiliates: number;
    seoActiveKeywords: number;
    seoAvgScore: number;
    metricsPayload: Record<string, unknown>;
    createdAt: string;
}

function getSupabaseAdmin(): SupabaseClient | null {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/**
 * Fetch or initialize dashboard preferences for a specific user
 */
export async function getUserDashboardData(
    userId: string,
    client: SupabaseClient | null = getSupabaseAdmin()
): Promise<UserDashboardData | null> {
    if (!userId || !client) return null;

    try {
        const { data, error } = await client
            .from('user_dashboard_data')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) {
            console.warn('[DashboardService] Error fetching user dashboard:', error.message);
            return null;
        }

        if (data) {
            return {
                id: data.id,
                userId: data.user_id,
                pinnedTools: data.pinned_tools || ['macro', 'bodyfat', 'injection', 'halflife'],
                customGoals: data.custom_goals || {},
                savedNotes: data.saved_notes || '',
                themePreference: data.theme_preference || 'dark',
                currencyPreference: data.currency_preference || 'USD',
                lastActiveAt: data.last_active_at,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
            };
        }

        // Initialize default row if not exists
        const defaultPayload = {
            user_id: userId,
            pinned_tools: ['macro', 'bodyfat', 'injection', 'halflife'],
            custom_goals: { targetWeight: null, targetBodyFat: null, currentPhase: 'cutting' },
            saved_notes: '',
            theme_preference: 'dark',
            currency_preference: 'USD',
            last_active_at: new Date().toISOString(),
        };

        const { data: created, error: insertError } = await client
            .from('user_dashboard_data')
            .insert(defaultPayload)
            .select('*')
            .single();

        if (insertError || !created) {
            console.warn('[DashboardService] Error creating default dashboard data:', insertError?.message);
            return null;
        }

        return {
            id: created.id,
            userId: created.user_id,
            pinnedTools: created.pinned_tools,
            customGoals: created.custom_goals,
            savedNotes: created.saved_notes,
            themePreference: created.theme_preference,
            currencyPreference: created.currency_preference,
            lastActiveAt: created.last_active_at,
            createdAt: created.created_at,
            updatedAt: created.updated_at,
        };
    } catch (e) {
        console.error('[DashboardService] Failed to load user dashboard data:', e);
        return null;
    }
}

/**
 * Update user dashboard preferences or notes
 */
export async function updateUserDashboardData(
    userId: string,
    patch: Partial<{
        pinnedTools: string[];
        customGoals: Record<string, unknown>;
        savedNotes: string;
        themePreference: string;
        currencyPreference: string;
    }>,
    client: SupabaseClient | null = getSupabaseAdmin()
): Promise<boolean> {
    if (!userId || !client) return false;

    try {
        const updatePayload: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
            last_active_at: new Date().toISOString(),
        };

        if (patch.pinnedTools !== undefined) updatePayload.pinned_tools = patch.pinnedTools;
        if (patch.customGoals !== undefined) updatePayload.custom_goals = patch.customGoals;
        if (patch.savedNotes !== undefined) updatePayload.saved_notes = patch.savedNotes;
        if (patch.themePreference !== undefined) updatePayload.theme_preference = patch.themePreference;
        if (patch.currencyPreference !== undefined) updatePayload.currency_preference = patch.currencyPreference;

        const { error } = await client
            .from('user_dashboard_data')
            .upsert({ user_id: userId, ...updatePayload }, { onConflict: 'user_id' });

        return !error;
    } catch (e) {
        console.error('[DashboardService] Update error:', e);
        return false;
    }
}

/**
 * Calculate and persist an admin snapshot from live Supabase tables
 */
export async function calculateAndPersistAdminMetrics(
    metricType: 'daily_summary' | 'weekly_summary' | 'realtime_snapshot' = 'daily_summary',
    client: SupabaseClient | null = getSupabaseAdmin()
): Promise<AdminDashboardMetricsData | null> {
    if (!client) return null;

    try {
        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Invoices metrics
        const { data: invoices } = await client
            .from('invoices')
            .select('amount, currency, status, gateway');

        const allInvoices = invoices || [];
        const successful = allInvoices.filter(i => i.status === 'success');
        const pending = allInvoices.filter(i => i.status === 'pending' || i.status === 'open');
        const failed = allInvoices.filter(i => i.status === 'failed');

        const usdRevenue = successful
            .filter(i => i.currency === 'USD')
            .reduce((sum, i) => sum + Number(i.amount || 0), 0);
        const egpRevenue = successful
            .filter(i => i.currency === 'EGP')
            .reduce((sum, i) => sum + Number(i.amount || 0), 0);

        // 2. Active subscribers & affiliates
        const [subscribersRes, affiliatesRes, seoRes] = await Promise.all([
            client.from('profiles').select('id', { count: 'exact', head: true }).eq('has_paid', true),
            client.from('affiliates').select('id', { count: 'exact', head: true }).eq('status', 'active'),
            client.from('seo_keywords').select('score').eq('is_active', true),
        ]);

        const activeSubscribers = subscribersRes.count || 0;
        const activeAffiliates = affiliatesRes.count || 0;
        const activeKeywords = seoRes.data || [];
        const seoCount = activeKeywords.length;
        const seoAvg = seoCount > 0
            ? Math.round((activeKeywords.reduce((sum, k) => sum + Number(k.score || 0), 0) / seoCount) * 10) / 10
            : 0;

        const record = {
            metric_date: todayStr,
            metric_type: metricType,
            total_revenue_usd: Math.round(usdRevenue * 100) / 100,
            total_revenue_egp: Math.round(egpRevenue * 100) / 100,
            successful_invoices: successful.length,
            pending_invoices: pending.length,
            failed_invoices: failed.length,
            active_subscribers: activeSubscribers,
            active_affiliates: activeAffiliates,
            seo_active_keywords: seoCount,
            seo_avg_score: seoAvg,
            metrics_payload: {
                totalInvoices: allInvoices.length,
                calculatedAt: new Date().toISOString(),
            },
        };

        const { data: upserted, error } = await client
            .from('admin_dashboard_metrics')
            .upsert(record, { onConflict: 'metric_date,metric_type' })
            .select('*')
            .single();

        if (error || !upserted) {
            console.warn('[DashboardService] Error persisting admin metrics:', error?.message);
            return null;
        }

        return {
            id: upserted.id,
            metricDate: upserted.metric_date,
            metricType: upserted.metric_type,
            totalRevenueUsd: Number(upserted.total_revenue_usd),
            totalRevenueEgp: Number(upserted.total_revenue_egp),
            successfulInvoices: upserted.successful_invoices,
            pendingInvoices: upserted.pending_invoices,
            failedInvoices: upserted.failed_invoices,
            activeSubscribers: upserted.active_subscribers,
            activeAffiliates: upserted.active_affiliates,
            seoActiveKeywords: upserted.seo_active_keywords,
            seoAvgScore: Number(upserted.seo_avg_score),
            metricsPayload: upserted.metrics_payload || {},
            createdAt: upserted.created_at,
        };
    } catch (e) {
        console.error('[DashboardService] Failed to calculate admin metrics:', e);
        return null;
    }
}
