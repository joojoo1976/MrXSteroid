'use client';

/**
 * components/tools/lab.tsx
 *
 * Lab Analyzer — a single, clean React component (no merge artifacts).
 *
 * · locale toggle (ar/en) with full RTL/LTR support
 * · simple layered metabolic-risk scoring from lab inputs
 * · persists the latest result to the user's dashboard via Supabase
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePreferences } from '../../context/PreferencesContext';
import { useAuth } from '../../context/AuthContext';
import { Page } from '@/shared/types/types';
import { getTool } from '../../lib/tools/registry';
import { supabase } from '../../shared/lib/supabase';

export default function Lab() {
    const { isRTL: _isRTL } = usePreferences();
    const { user } = useAuth();
    const tool = getTool(Page.LAB);

    const [locale, setLocale] = useState<'ar' | 'en'>('ar');
    const isAr = locale === 'ar';

    // ── Inputs ────────────────────────────────────────────────
    const [totalT, setTotalT] = useState(600);
    const [shbg, setShbg] = useState(30);
    const [e2, setE2] = useState(35);
    const [prolactin, setProlactin] = useState(8);

    const [result, setResult] = useState<{ score: number; tier: string } | null>(null);
    const [saveStatus, setSaveStatus] = useState('');

    // ── Dynamic System: live telemetry (Supabase, graceful) ────
    const [_adminStats, setAdminStats] = useState<{ stats: { pending: number; total: number; revenue: number }; pendingRows: number; revenueRows: number } | null>(null);
    const [_analyticsData, setAnalyticsData] = useState<unknown[] | null>(null);
    const [_paymentLast, setPaymentLast] = useState<{ id: string; amount: number; status: string; created_at: string } | null>(null);
    const [_fraudRates, setFraudRates] = useState<{ pending: number; blocked: number; approved: number } | null>(null);

    useEffect(() => {
        if (!user) return;
        let mounted = true;
        const fetchLiveData = async () => {
            try {
                const { data, error } = await supabase
                    .from('payment_intents')
                    .select('status, amount')
                    .eq('user_id', user.id);
                if (!error && mounted && Array.isArray(data)) {
                    const rows = data as Array<{ status: string | null; amount: number | null }>;
                    const total = rows.length;
                    const pending = rows.filter(
                        (r) => String(r?.status ?? '').toLowerCase() === 'pending'
                    ).length;
                    const revenue = rows.reduce(
                        (sum, r) => sum + (Number(r?.amount) || 0),
                        0
                    );
                    setAdminStats({
                        stats: { pending, total, revenue },
                        pendingRows: pending,
                        revenueRows: rows.length,
                    });
                }

                const { data: analytics, error: e2 } = await supabase
                    .from('payment_intents')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(5);
                if (!e2 && mounted) setAnalyticsData(analytics as unknown[]);

                const { data: lastPay, error: e3 } = await supabase
                    .from('payment_intents')
                    .select('id, amount, status, created_at')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();
                if (!e3 && mounted && lastPay)
                    setPaymentLast(lastPay as { id: string; amount: number; status: string; created_at: string });

                const { data: fraud, error: e4 } = await supabase
                    .from('fraud_observations')
                    .select('verdict, count')
                    .order('created_at', { ascending: false })
                    .limit(100);
                if (!e4 && mounted && Array.isArray(fraud)) {
                    const rates = { pending: 0, blocked: 0, approved: 0 };
                    (fraud as Array<{ verdict?: string | null; count?: number | null }>).forEach((o) => {
                        const v = String(o?.verdict ?? '').toUpperCase();
                        const c = Number(o?.count) || 1;
                        if (v === 'BLOCK') rates.blocked += c;
                        else if (v === 'APPROVE') rates.approved += c;
                        else rates.pending += c;
                    });
                    setFraudRates(rates);
                }
            } catch {
                // Graceful — panels stay empty until data is available.
            }
        };
        fetchLiveData();
        return () => {
            mounted = false;
        };
    }, [user]);

    const calculate = () => {
        const freeTIndex = shbg > 0 ? (totalT / shbg) * 1.6 : 0;
        const e2Factor = Math.max(0, Math.min(20, Math.round(e2 / 10)));
        const prolactinFactor = prolactin > 15 ? 5 : 0;
        let score = Math.round(40 + freeTIndex - e2Factor - prolactinFactor);
        score = Math.max(0, Math.min(100, score));
        setResult({
            score,
            tier: score >= 90 ? 'optimal' : score >= 70 ? 'elevated' : 'watch',
        });
    };

    const save = async () => {
        if (!result || !user) return;
        const { error } = await supabase.from('user_dashboard_data').insert({
            key: 'lab-last-result',
            value: {
                result,
                calculatedAt: new Date().toISOString(),
                recordedAt: new Date().toISOString(),
            },
        });
        setSaveStatus(
            error
                ? isAr
                    ? 'فشل الحفظ — حاول مرة أخرى.'
                    : 'Save failed — try again.'
                : isAr
                  ? 'تم الحفظ في لوحة القيادة الحية!'
                  : 'Saved to Live Dashboard!'
        );
    };

    return (
        <motion.div
            dir={isAr ? 'rtl' : 'ltr'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-screen pt-28 pb-20 px-4 bg-black text-white"
        >
            <div className="max-w-4xl mx-auto bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-black">
                            {isAr ? tool?.titleAr : tool?.titleEn}
                        </h1>
                        <p className="text-sm text-zinc-400">
                            {isAr
                                ? 'أداة تحليل نتائج المختبرات لتقييم المخاطر الأيضية الأساسية.'
                                : 'Basic metabolic risk assessment from lab results.'}
                        </p>
                    </div>
                    <button
                        onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-bold"
                    >
                        {isAr ? 'English' : 'عربي'}
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <label className="block">
                        <span className="text-xs font-bold text-zinc-400">
                            {isAr ? 'إجمالي التستوستيرون' : 'Total Testosterone'} (ng/dL)
                        </span>
                        <input
                            type="number"
                            value={totalT}
                            onChange={(e) => setTotalT(Number(e.target.value))}
                            className="mt-1 w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-gold-500"
                        />
                    </label>
                    <label className="block">
                        <span className="text-xs font-bold text-zinc-400">SHBG (nmol/L)</span>
                        <input
                            type="number"
                            value={shbg}
                            onChange={(e) => setShbg(Number(e.target.value))}
                            className="mt-1 w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-gold-500"
                        />
                    </label>
                    <label className="block">
                        <span className="text-xs font-bold text-zinc-400">
                            {isAr ? 'إستراديول' : 'Estradiol'} (pg/mL)
                        </span>
                        <input
                            type="number"
                            value={e2}
                            onChange={(e) => setE2(Number(e.target.value))}
                            className="mt-1 w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-gold-500"
                        />
                    </label>
                    <label className="block">
                        <span className="text-xs font-bold text-zinc-400">
                            {isAr ? 'برولاكتين' : 'Prolactin'} (ng/mL)
                        </span>
                        <input
                            type="number"
                            value={prolactin}
                            onChange={(e) => setProlactin(Number(e.target.value))}
                            className="mt-1 w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-gold-500"
                        />
                    </label>
                </div>

                <button
                    onClick={calculate}
                    className="w-full md:w-auto mt-4 px-6 py-2.5 rounded-xl bg-gold-500 text-black font-bold text-sm hover:bg-gold-400 transition-colors"
                >
                    {isAr ? 'احسب' : 'Calculate'}
                </button>

                {result && (
                    <div className="mt-4 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800">
                        <h3 className="text-xs font-bold text-zinc-400">
                            {isAr ? 'النتيجة' : 'Result'}
                        </h3>
                        <p className="text-3xl font-black text-white">
                            {result.score}
                            <span className="text-sm text-zinc-500 ml-2">/100 · {result.tier}</span>
                        </p>
                    </div>
                )}

                <div className="flex justify-end items-center gap-2 mt-4">
                    <button
                        onClick={save}
                        disabled={!result}
                        className="px-4 py-2 rounded-xl bg-emerald-500/90 text-black font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {isAr ? 'حفظ' : 'Save'}
                    </button>
                </div>
                {saveStatus && <p className="text-xs text-zinc-500 mt-2">{saveStatus}</p>}

                <div className="mt-4 p-4 rounded-xl border border-red-500/30 bg-red-500/5">
                    <p className="text-xs text-red-400 leading-relaxed">
                        {isAr
                            ? 'تنبيه: الأداة للاستخدام التعليمي فقط وليست بديلاً عن الاستشارة الطبية.'
                            : 'Warning: This tool is for educational use only, not a substitute for medical advice.'}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
