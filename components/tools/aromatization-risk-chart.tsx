'use client';

/**
 * components/tools/aromatization-risk-chart.tsx
 * ═══════════════════════════════════════════════════════════════════════════
 *  G-08 — `recharts` is isolated in its OWN module for Tool #002.
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
    ReferenceLine,
} from 'recharts';

/** One row of `result.timeline` (already converted to the active unit system). */
export interface AromatizationRiskChartPoint {
    week: number;
    e2: number;
    riskZone: string;
    phase: string;
}

export interface AromatizationRiskChartProps {
    data: AromatizationRiskChartPoint[];
    isRtl: boolean;
    /** Renders a pg/mL reading in the active unit system. */
    formatE2: (pgml: number) => string;
    /** Conversion divisor so the tooltip re-renders in metric. */
    pmolPerPgml: number;
    unitSystem: 'metric' | 'imperial';
    refHigh: number;
    criticalRef: number;
}

export default function AromatizationRiskChart({
    data,
    isRtl,
    formatE2,
    pmolPerPgml,
    unitSystem,
    refHigh,
    criticalRef,
}: AromatizationRiskChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="week" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={[0, criticalRef + 40]} />
                <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#475569', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: number | string) => {
                        const n = typeof val === 'number' ? val : Number(val);
                        return [formatE2(unitSystem === 'metric' ? n : n / pmolPerPgml), isRtl ? 'الاستراديول' : 'E2'];
                    }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <ReferenceLine y={refHigh} stroke="#10b981" strokeDasharray="5 3" label={{ value: `${isRtl ? 'أقصى طبيعي' : 'Optimal High'} ${refHigh}`, fontSize: 9, fill: '#10b981' }} />
                <ReferenceLine y={criticalRef} stroke="#ef4444" strokeDasharray="5 3" label={{ value: `${isRtl ? 'حرج' : 'Critical'} ${criticalRef}`, fontSize: 9, fill: '#ef4444' }} />
                <Area type="monotone" dataKey="e2" name={isRtl ? 'الاستراديول (E2)' : 'Estradiol (E2)'} stroke="#ec4899" fillOpacity={0.25} fill="#ec4899" strokeWidth={2.5} />
            </AreaChart>
        </ResponsiveContainer>
    );
}
