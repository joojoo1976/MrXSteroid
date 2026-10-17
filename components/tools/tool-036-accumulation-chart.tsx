'use client';
/**
 * Tool #036 — LEVEL 3 accumulation chart.
 *
 * Deliberately isolated in its OWN module so that `recharts` lands in a separate
 * dynamic chunk and NEVER enters First Load JS. It is only ever reached through
 * next/dynamic(() => import(...), { ssr:false }) after an IntersectionObserver
 * sentinel scrolls into view (see LazyAccumulationChart in the parent file).
 *
 * Pure presentation — receives a plain JSON series from the pure engine.
 */
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { ChartPoint } from '@/lib/tools/engines/tool-036-injection-schedule';

export default function Tool036AccumulationChart({
  data,
  label,
}: {
  data: ChartPoint[];
  label: string;
}) {
  const steady = data.find((p) => p.steadyStateReached);
  return (
    <div className="h-56 w-full" dir="ltr" data-testid="accumulation-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 14, bottom: 4, left: -16 }}>
          <XAxis dataKey="weekIndex" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          {steady && (
            <ReferenceLine x={steady.weekIndex} stroke="#f59e0b" strokeDasharray="4 4" />
          )}
          <Line
            type="monotone"
            dataKey="level"
            name={label}
            stroke="#a3e635"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
