'use client';

import { useState, useEffect, useCallback } from 'react';
import { InvoiceItem, UserSubscriptionInfo } from '../types/billing.types';
import { BillingService } from '../services/billing.service';
import { supabase } from '@/shared/lib/supabase';
import { toast } from 'sonner';

export function useUserInvoices(userId?: string | null, isRTL: boolean = true) {
    const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
    const [subscription, setSubscription] = useState<UserSubscriptionInfo | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const loadData = useCallback(async (showToast: boolean = false) => {
        if (!userId) {
            setInvoices([]);
            setSubscription(null);
            setLoading(false);
            return;
        }

        try {
            if (showToast) setRefreshing(true);
            else setLoading(true);

            const [userInvoices, userSub] = await Promise.all([
                BillingService.getUserInvoices(userId),
                BillingService.getUserSubscription(userId)
            ]);

            setInvoices(userInvoices);
            setSubscription(userSub);

            if (showToast) {
                toast.success(isRTL ? 'تم تحديث بيانات الفواتير' : 'Billing data refreshed');
            }
        } catch (err) {
            console.error('[useUserInvoices] Error:', err);
            if (showToast) {
                toast.error(isRTL ? 'فشل تحديث البيانات' : 'Failed to refresh billing data');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [userId, isRTL]);

    useEffect(() => {
        loadData(false);

        // Real-time subscription to invoices table
        if (!userId) return;

        const channel = supabase
            .channel(`user-invoices-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'invoices',
                    filter: `user_id=eq.${userId}`
                },
                () => {
                    loadData(false);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, loadData]);

    return {
        invoices,
        subscription,
        loading,
        refreshing,
        refresh: () => loadData(true)
    };
}
