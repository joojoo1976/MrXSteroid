import { describe, it, expect } from 'vitest';
import { buildPlanSnapshot, type PlanLine } from '../../features/calculator/lib/planSnapshot';

describe('planSnapshot — buildPlanSnapshot', () => {
    const rows: PlanLine[] = [
        { label: 'Weight', value: '80 kg' },
        { label: 'Ideal Weight', value: '78.9 kg' },
        { label: 'Daily Deficit', value: '660 kcal' },
    ];

    it('includes the title and a rules separator', () => {
        const out = buildPlanSnapshot('Live Prediction Engine', rows);
        expect(out).toContain('Live Prediction Engine');
        expect(out).toContain('─');
    });

    it('aligns labels with the │ separator', () => {
        const out = buildPlanSnapshot('Title', rows);
        const lines = out.split('\n').slice(2, -1);
        const labelWidth = Math.max(14, ...rows.map((r) => r.label.length));
        expect(lines[0]).toBe('Weight'.padEnd(labelWidth) + ' │ 80 kg');
        expect(lines[1]).toBe('Ideal Weight'.padEnd(labelWidth) + ' │ 78.9 kg');
        expect(lines[2]).toBe('Daily Deficit'.padEnd(labelWidth) + ' │ 660 kcal');
    });

    it('keeps label/value pairs intact (values are not truncated)', () => {
        const out = buildPlanSnapshot('Title', rows);
        expect(out).toContain('660 kcal');
        expect(out).toContain('78.9 kg');
    });

    it('is deterministic', () => {
        const a = buildPlanSnapshot('Title', rows);
        const b = buildPlanSnapshot('Title', rows);
        expect(a).toBe(b);
    });
});
