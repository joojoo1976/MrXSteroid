'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function EvaluateRiskPage() {
    return (
        <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
            <div className="w-20 h-20 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mb-6">
                <ShieldCheck className="w-10 h-10 text-gold-500" />
            </div>
            <h1 className="text-2xl font-black text-center">محرك تقييم المخاطر / Risk Engine</h1>
            <p className="text-zinc-400 text-sm font-bold text-center max-w-md mt-3">
                أداة تقييم المخاطر متاحة حالياً من داخل لوحة التحكم الإدارية.
                <br />
                Risk evaluation is available from the admin dashboard.
            </p>
            <Link
                href="/admin"
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-black text-sm font-black transition-colors"
            >
                الانتقال للوحة التحكم <ArrowRight className="w-4 h-4" />
            </Link>
        </main>
    );
}