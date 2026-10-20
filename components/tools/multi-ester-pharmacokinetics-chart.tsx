'use client';

/**
 * components/tools/multi-ester-pharmacokinetics-chart.tsx
 * ═══════════════════════════════════════════════════════════════════════════
 *  G-08 — `recharts` is isolated in its OWN module for Tool #001.
 *
 *  Why this file exists: the SmartTools catch-all route
 *  (`/smarttools/[category]/[tool]`) server-resolves any published tool, so
 *  Next folds every statically-reachable client component into that one route.
 *  While `recharts` was imported at the top of `multi-ester-pharmacokinetics.tsx`
 *  the entire charting library shipped in the FIRST LOAD of every other tool.
 *
 *  The parent now mounts this module through
 *  `next/dynamic(() => import('./multi-ester-pharmacokinetics-chart'), { ssr: false })`,
 *  so `recharts` is a real async chunk fetched only when the chart renders.
 *  Same pattern Tool-036 already uses for its accumulation chart.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

/** One row of `pkResult.timeline`. */
export interface MultiEsterChartPoint {
    day: number;
    concentrationNgl: number;
    accumulatedEsterMg: number;
}

export interface MultiEsterPharmacokineticsChartProps {
    data: MultiEsterChartPoint[];
    isRtl: boolean;
}

export default function MultiEsterPharmacokineticsChart({
    data,
    isRtl,
}: MultiEsterPharmacokineticsChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#475569', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                    type="monotone"
                    dataKey="concentrationNgl"
                    name={isRtl ? 'تركيز المصل (ng/dL)' : 'Serum Concentration (ng/dL)'}
                    stroke="#84cc16"
                    strokeWidth={2.5}
                    dot={false}
                />
                <Line
                    type="monotone"
                    dataKey="accumulatedEsterMg"
                    name={isRtl ? 'مخزون النسيج (mg)' : 'Depot Active Ester (mg)'}
                    stroke="#06b6d4"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
