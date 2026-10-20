// components/tools/recharts-lazy-components.dom.test.tsx
// ═══════════════════════════════════════════════════════════════════════════
//  G-08 follow-up — the four tools whose chart moved behind `next/dynamic`
//  must still RENDER. The chart is deferred (ssr:false), so this suite asserts
//  the page chrome/shell renders and the chart placeholder mounts without
//  throwing; the chart library itself is intentionally absent from first load.
//
//  Runs in the dedicated `jsdom` vitest project (`.dom.test.tsx` suffix).
// ═══════════════════════════════════════════════════════════════════════════
import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import MultiEsterPKToolComponent from './multi-ester-pharmacokinetics';
import HptaRecoveryToolComponent from './hpta-recovery';
import AromatizationRiskToolComponent from './aromatization-risk';
import PctTimingToolComponent from './pct-timing';

afterEach(() => {
    cleanup();
});

beforeAll(() => {
    // Recharts' ResponsiveContainer measures on mount; jsdom has no layout.
    if (typeof global.ResizeObserver === 'undefined') {
        global.ResizeObserver = class {
            observe() {}
            unobserve() {}
            disconnect() {}
        } as unknown as typeof ResizeObserver;
    }
});

const CASES = [
    ['multi-ester-pharmacokinetics', MultiEsterPKToolComponent, /حفظ في لوحة القيادة الحيوية/],
    ['hpta-recovery', HptaRecoveryToolComponent, /حفظ في لوحة القيادة الحيوية/],
    ['aromatization-risk', AromatizationRiskToolComponent, /حفظ في لوحة القيادة الحيوية/],
    ['pct-timing', PctTimingToolComponent, /حفظ الخطة في لوحة القيادة الحيوية/],
] as const;

describe('G-08 — deferred-chart tools still render their shell', () => {
    it.each(CASES)('%s renders an h1 and RTL wrapper without throwing', (_name, Component) => {
        const { container } = render(<Component />);
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
        expect(container.firstChild).toHaveAttribute('dir', 'rtl');
    });

    it.each(CASES)('%s keeps its Save-to-Bio-Dashboard action', (_name, Component, label) => {
        render(<Component />);
        expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    });
});
