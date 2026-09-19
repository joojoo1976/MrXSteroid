"use client";
import { useState, useEffect, useCallback } from "react";
import type { AffiliateProfile, Referral } from "../types/affiliate.types";
import { supabase } from "../../../lib/supabaseClient";

interface LedgerEntry {
    id: string;
    transaction_type: string;
    amount: number;
    currency: string;
    created_at: string;
    description?: string;
}

interface UseAffiliateReturn {
    enrolled: boolean;
    affiliate: AffiliateProfile | null;
    referrals: Referral[];
    totalReferrals: number;
    page: number;
    setPage: (p: number) => void;
    totalPages: number;
    ledger: LedgerEntry[];
    loading: boolean;
    enrolling: boolean;
    error: string | null;
    enroll: () => Promise<void>;
    refetch: () => void;
}

async function apiFetch(path: string, options?: RequestInit) {
    const res = await fetch(path, options);
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "API error " + res.status);
    }
    return res.json();
}

async function resolveAuthToken(explicitToken?: string): Promise<string | undefined> {
    if (explicitToken) return explicitToken;
    try {
        const { data } = await supabase.auth.getSession();
        return data.session?.access_token ?? undefined;
    } catch {
        return undefined;
    }
}

export function useAffiliate(token?: string): UseAffiliateReturn {
    const [enrolled, setEnrolled] = useState(false);
    const [affiliate, setAffiliate] = useState<AffiliateProfile | null>(null);
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [totalReferrals, setTotalReferrals] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [ledger, setLedger] = useState<LedgerEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tick, setTick] = useState(0);

    const limit = 10;

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const authToken = await resolveAuthToken(token);
            if (!authToken) {
                setLoading(false);
                return;
            }

            const headers: HeadersInit = { Authorization: "Bearer " + authToken };
            const [meData, refData, statsData] = await Promise.all([
                apiFetch("/api/affiliate/me", { headers }),
                apiFetch(`/api/affiliate/referrals?page=${page}&limit=${limit}`, { headers }).catch(() => ({
                    referrals: [],
                    total: 0,
                    totalPages: 1,
                })),
                apiFetch("/api/affiliate/stats?page=1&limit=50", { headers }).catch(() => ({ stats: [] })),
            ]);

            setEnrolled(meData.enrolled ?? false);
            setAffiliate(meData.affiliate ?? null);
            setReferrals(refData.referrals ?? []);
            setTotalReferrals(refData.total ?? 0);
            setTotalPages(refData.totalPages ?? 1);
            setLedger(statsData.stats ?? []);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load affiliate data");
        } finally {
            setLoading(false);
        }
    }, [token, page, tick]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const enroll = useCallback(async () => {
        setEnrolling(true);
        setError(null);
        try {
            const authToken = await resolveAuthToken(token);
            if (!authToken) throw new Error("Please log in to enroll");
            const headers: HeadersInit = { Authorization: "Bearer " + authToken };
            await apiFetch("/api/affiliate/create", { method: "POST", headers });
            setTick(t => t + 1);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to enroll");
        } finally {
            setEnrolling(false);
        }
    }, [token]);

    return {
        enrolled,
        affiliate,
        referrals,
        totalReferrals,
        page,
        setPage,
        totalPages,
        ledger,
        loading,
        enrolling,
        error,
        enroll,
        refetch: () => setTick(t => t + 1),
    };
}