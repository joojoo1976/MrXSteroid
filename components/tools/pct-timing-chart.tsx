'use client';

/**
 * components/tools/pct-timing-chart.tsx
 * ═══════════════════════════════════════════════════════════════════════════
 *  G-08 — `recharts` is isolated in its OWN module for Tool #004.
 *
 *  See `multi-ester-pharmacokinetics-chart.tsx` for the full rationale. Short
 *  version: the SmartTools catch-all route folds every statically-reachable
 *  tool into one graph, so a module-scope `recharts` import made the library
 *  ship in the first load of unrelated tools (including Tool-036).
 *
 *  The parent lazy-mounts this module with `next/dynamic(..., { ssr: false })`.
 *  Both tabs (daily clearance curve + weekly rebound) live here so switching
 *  tabs never re-fetches the library.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import React from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
    ReferenceLine,
    Area,
    ComposedChart,
} from 'recharts';

/** One row of `result.dailyWashout` (already truncated to 42 days by the parent). */
export interface PctTimingDailyPoint {
    day: string;
    dayNum: number;
    date: string;
    serumPct: number;
    serumNgDl: number;
    threshold: number;
    zone: string;
}

/** One row of `result.timeline`. */
export interface PctTimingWeeklyPoint {
    week: string;
    weekNum: number;
    serum: number;
    endoTesto: number;
    phase: string;
}

export interface PctTimingChartProps {
    activeTab: 'daily_curve' | 'weekly_rebound';
    dailyChartData: PctTimingDailyPoint[];
    weeklyChartData: PctTimingWeeklyPoint[];
    isRtl: boolean;
    /** Renders a percentage as "x.x% (<testosterone unit>)". */
    formatTesto: (pct: number) => string;
    clearanceThresholdPct: number;
    hptaThresholdNgDl: number;
    washoutDays: number;
    pctStartWeek: number;
}

export default function PctTimingChart({
    activeTab,
    dailyChartData,
    weeklyChartData,
    isRtl,
    formatTesto,
    clearanceThresholdPct,
    hptaThresholdNgDl,
    washoutDays,
    pctStartWeek,
}: PctTimingChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'daily_curve' ? (
                <ComposedChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="clearanceGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                            <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#020617',
                            borderColor: '#334155',
                            borderRadius: '12px',
                            fontSize: '12px',
                        }}
                        formatter={(val: number | string, name: string) => {
                            const n = Number(val);
                            if (name === 'serumPct') {
                                return [`${n.toFixed(1)}%`, isRtl ? 'الحمل الهرموني المتبقي' : 'Residual Load'];
                            }
                            return [val, name];
                        }}
                    />
                    <ReferenceLine
                        y={clearanceThresholdPct}
                        stroke="#10b981"
                        strokeDasharray="4 4"
                        strokeWidth={2}
                        label={{
                            value: isRtl ? `عتبة التثبيط (${hptaThresholdNgDl} ng/dL)` : `Threshold Gate (${hptaThresholdNgDl} ng/dL)`,
                            fontSize: 10,
                            fill: '#10b981',
                            position: 'insideBottomRight',
                        }}
                    />
                    <ReferenceLine
                        x={`D+${washoutDays}`}
                        stroke="#a855f7"
                        strokeWidth={2}
                        label={{
                            value: isRtl ? 'بدء PCT' : 'PCT Launch',
                            fontSize: 10,
                            fill: '#a855f7',
                            position: 'top',
                        }}
                    />
                    <Area type="monotone" dataKey="serumPct" stroke="#f59e0b" fill="url(#clearanceGrad)" strokeWidth={2.5} name="serumPct" />
                </ComposedChart>
            ) : (
                <LineChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="week" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#020617',
                            borderColor: '#334155',
                            borderRadius: '12px',
                            fontSize: '12px',
                        }}
                        formatter={(val: number | string, name: string) => {
                            const n = Number(val);
                            if (name === 'endoTesto') {
                                return [`${n.toFixed(1)}% (${formatTesto(n)})`, isRtl ? 'التستوستيرون الداخلي' : 'Endogenous T'];
                            }
                            return [`${n.toFixed(1)}%`, isRtl ? 'المركب الخارجي' : 'Exogenous Serum'];
                        }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <ReferenceLine x={`W${pctStartWeek}`} stroke="#a855f7" strokeDasharray="4 4" label={{ value: 'PCT Start', fontSize: 10, fill: '#a855f7' }} />
                    <Line type="monotone" dataKey="serum" name={isRtl ? 'المركب الخارجي' : 'Exogenous Serum'} stroke="#f59e0b" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="endoTesto" name={isRtl ? 'التستوستيرون الداخلي' : 'Endogenous T'} stroke="#10b981" strokeWidth={2.5} dot={false} />
                </LineChart>
            )}
        </ResponsiveContainer>
    );
}
