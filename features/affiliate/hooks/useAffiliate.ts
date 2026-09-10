"use client";
import { useState, useEffect, useCallback } from "react";
import type { AffiliateProfile, Referral } from "../types/affiliate.types";

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
    ledger: LedgerEntry[];
    loading: boolean;
    enrolling: boolean;
    error: string | null;
    enroll: () => Promise<void>;
    refetch: () => void;
}

async function apiFetch(path: string, options?: RequestInit) {
    const res = await fetch(path, options);
    if (!res.ok) throw new Error("API error " + res.status);
    return res.json();
}

export function useAffiliate(token?: string): UseAffiliateReturn {
    const [enrolled, setEnrolled] = useState(false);
    const [affiliate, setAffiliate] = useState<AffiliateProfile | null>(null);
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [totalReferrals, setTotalReferrals] = useState(0);
    const [ledger, setLedger] = useState<LedgerEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tick, setTick] = useState(0);

    const headers: HeadersInit = token ? { Authorization: "Bearer " + token } : {};

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [meData, refData, statsData] = await Promise.all([
                apiFetch("/api/affiliate/me", { headers }),
                apiFetch("/api/affiliate/referrals?limit=20", { headers }).catch(() => ({ referrals: [], total: 0 })),
                apiFetch("/api/affiliate/stats", { headers }).catch(() => ({ stats: [] })),
            ]);
            setEnrolled(meData.enrolled ?? false);
            setAffiliate(meData.affiliate ?? null);
            setReferrals(refData.referrals ?? []);
            setTotalReferrals(refData.total ?? 0);
            setLedger(statsData.stats ?? []);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load affiliate data");
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, tick]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const enroll = useCallback(async () => {
        setEnrolling(true);
        setError(null);
        try {
            await apiFetch("/api/affiliate/create", { method: "POST", headers });
            setTick(t => t + 1);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to enroll");
        } finally {
            setEnrolling(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    return { enrolled, affiliate, referrals, totalReferrals, ledger, loading, enrolling, error, enroll, refetch: () => setTick(t => t + 1) };
}