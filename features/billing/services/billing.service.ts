/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  BILLING & INVOICING CLIENT SERVICE (Supabase & API Integration)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { supabase } from '@/shared/lib/supabase';
import { InvoiceItem, UserSubscriptionInfo, PlanTierId } from '../types/billing.types';
import { BILLING_PLANS } from '../config/pricing.config';

export class BillingService {
    /**
     * Fetch user's invoices from Supabase
     */
    public static async getUserInvoices(userId: string): Promise<InvoiceItem[]> {
        try {
            if (!userId) return [];

            const { data, error } = await supabase
                .from('invoices')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[BillingService] Failed to load invoices:', error);
                return [];
            }

            return (data || []) as InvoiceItem[];
        } catch (err) {
            console.error('[BillingService] Error fetching invoices:', err);
            return [];
        }
    }

    /**
     * Get user active subscription tier details
     */
    public static async getUserSubscription(userId: string): Promise<UserSubscriptionInfo> {
        try {
            if (!userId) {
                return { tier: 'free', status: 'inactive', planName: 'Free Tier' };
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('subscription_tier, subscription_expires_at, updated_at')
                .eq('id', userId)
                .single();

            if (error || !data) {
                return { tier: 'free', status: 'inactive', planName: 'Free Tier' };
            }

            const tier = (data.subscription_tier || 'free').toLowerCase();
            const matchingPlan = BILLING_PLANS.find(p => p.id === tier || p.baseId === tier);

            return {
                tier,
                status: tier !== 'free' ? 'active' : 'inactive',
                planName: matchingPlan ? matchingPlan.nameAr : (tier.toUpperCase() + ' Member'),
                validUntil: data.subscription_expires_at || null
            };
        } catch (err) {
            console.error('[BillingService] Error getting subscription:', err);
            return { tier: 'free', status: 'inactive', planName: 'Free Tier' };
        }
    }

    /**
     * Format currency amount based on currency code
     */
    public static formatPrice(amount: number, currency: string, isRTL: boolean = true): string {
        const curr = currency.toUpperCase();
        if (curr === 'EGP') {
            return `${amount.toLocaleString('ar-EG')} ج.م`;
        }
        if (curr === 'USD') {
            return `$${amount.toFixed(2)}`;
        }
        return `${amount.toLocaleString()} ${curr}`;
    }

    /**
     * Map plan tier ID to displayable name
     */
    public static getPlanName(tierId: string, isRTL: boolean = true): string {
        const cleanTier = tierId.replace('_plus', '') as PlanTierId;
        const plan = BILLING_PLANS.find(p => p.id === cleanTier || p.baseId === cleanTier);
        const isPlus = tierId.endsWith('_plus');

        if (!plan) return tierId;

        if (isRTL) {
            return plan.nameAr + (isPlus ? ' + تدريب خاص' : '');
        }
        return plan.nameEn + (isPlus ? ' + Coaching' : '');
    }
}
