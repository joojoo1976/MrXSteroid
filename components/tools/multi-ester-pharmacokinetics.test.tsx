// components/tools/multi-ester-pharmacokinetics.test.tsx
// ═══════════════════════════════════════════════════════════════════════════
// Layer-5 UI coverage for tool #001 (docs/tool-stack.md, known gap #1).
// Runs in the dedicated `jsdom` vitest project only.
// ═══════════════════════════════════════════════════════════════════════════
import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import MultiEsterPKToolComponent from './multi-ester-pharmacokinetics';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';

const TOOL_SLUG = 'multi-ester-pharmacokinetics';

// RTL auto-cleanup only registers with vitest `globals: true`; this project
// runs with explicit imports, so unmount after every test.
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

describe('MultiEsterPKToolComponent (Layer 5 UI)', () => {
    it('renders the registry-backed title in Arabic RTL by default', () => {
        const { container } = render(<MultiEsterPKToolComponent />);
        const tool = requireTool(TOOL_SLUG);
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(tool.titleAr);
        expect(container.firstChild).toHaveAttribute('dir', 'rtl');
    });

    it('toggles locale AR → EN and unit system metric → imperial', () => {
        render(<MultiEsterPKToolComponent />);

        fireEvent.click(screen.getByRole('button', { name: 'English (LTR)' }));
        const tool = requireTool(TOOL_SLUG);
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(tool.titleEn);

        fireEvent.click(screen.getByRole('button', { name: 'Metric (kg)' }));
        expect(screen.getByRole('button', { name: 'Imperial (lbs)' })).toBeInTheDocument();
    });

    it('always shows the Save-to-Bio-Dashboard action and the registry prev/next footer', () => {
        render(<MultiEsterPKToolComponent />);
        const neighbors = getToolNeighbors(TOOL_SLUG);

        expect(
            screen.getByRole('button', { name: /حفظ في لوحة القيادة الحيوية/ }),
        ).toBeInTheDocument();

        const prevLink = screen.getByText(/الأداة السابقة:/).closest('a');
        const nextLink = screen.getByText(/الأداة التالية:/).closest('a');
        expect(prevLink).toHaveAttribute('rel', 'prev');
        expect(prevLink).toHaveAttribute(
            'href',
            requireTool(neighbors.prevTool.slug).href,
        );
        expect(nextLink).toHaveAttribute('rel', 'next');
        expect(nextLink).toHaveAttribute(
            'href',
            requireTool(neighbors.nextTool.slug).href,
        );
    });

    it('renders the four default injection schedule rows', () => {
        render(<MultiEsterPKToolComponent />);
        // Each row carries the ester select populated with the ester label.
        expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(4);
        expect(screen.getByText(/إعدادات البروتوكول والجدولة/)).toBeInTheDocument();
    });
});
