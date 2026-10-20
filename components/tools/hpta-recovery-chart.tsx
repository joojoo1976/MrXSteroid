'use client';

/**
 * components/tools/hpta-recovery-chart.tsx
 * ═══════════════════════════════════════════════════════════════════════════
 *  G-08 — `recharts` is isolated in its OWN module for Tool #003.
 *
 *  See `multi-ester-pharmacokinetics-chart.tsx` for the full rationale. Short
 *  version: the SmartTools catch-all route folds every statically-reachable
 *  tool into one graph, so a module-scope `recharts` import made the library
 *  ship in the first load of unrelated tools (including Tool-036).
 *
 *  The parent lazy-mounts this module with `next/dynamic(..., { ssr: false })`.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import React from 'react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
} from 'recharts';

/** One row of `result.timeline`. */
export interface HptaRecoveryChartPoint {
    week: number;
    suppression: number;
    endoTesto: number;
    lh: number;
}

export interface HptaRecoveryChartProps {
    data: HptaRecoveryChartPoint[];
    isRtl: boolean;
    /** Renders a percentage as "x.x% · <testosterone unit>". */
    formatTesto: (pct: number) => string;
}

export default function HptaRecoveryChart({ data, isRtl, formatTesto }: HptaRecoveryChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="week" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={[0, 100]} />
                <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#475569', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: number | string, name: string) => {
                        const n = typeof val === 'number' ? val : Number(val);
                        if (name === 'endoTesto' || name === 'lh') {
                            return [`${n.toFixed(1)}% · ${formatTesto(n)}`, name === 'endoTesto' ? (isRtl ? 'التستوستيرون الداخلي' : 'Endogenous T') : (isRtl ? 'هرمون LH' : 'LH')];
                        }
                        return [`${n.toFixed(1)}%`, isRtl ? 'نسبة التثبيط' : 'Suppression'];
                    }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="suppression" name={isRtl ? 'نسبة التثبيط' : 'Suppression'} stroke="#ef4444" fillOpacity={0.15} fill="#ef4444" strokeWidth={2.5} />
                <Area type="monotone" dataKey="endoTesto" name={isRtl ? 'التستوستيرون الداخلي' : 'Endogenous T'} stroke="#10b981" fillOpacity={0.25} fill="#10b981" strokeWidth={2} />
                <Area type="monotone" dataKey="lh" name={isRtl ? 'هرمون LH' : 'LH'} stroke="#06b6d4" fillOpacity={0.1} fill="#06b6d4" strokeWidth={1.5} strokeDasharray="4 2" />
            </AreaChart>
        </ResponsiveContainer>
    );
}
