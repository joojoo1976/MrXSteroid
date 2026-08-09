'use client';

/**
 * Pure, deterministic builder for the shareable plan snapshot.
 * Renders a monospace-friendly "label │ value" block so the copied text
 * stays readable in chat, notes and tickets regardless of directionality.
 */

export interface PlanLine {
    label: string;
    value: string;
}

export const PLAN_RULE_CHAR = '─';

export const buildPlanSnapshot = (title: string, rows: PlanLine[]): string => {
    const safeRows = rows.map((r) => ({
        label: String(r?.label ?? ''),
        value: String(r?.value ?? ''),
    }));
    const labelWidth = Math.max(14, ...safeRows.map((r) => r.label.length));
    const rule = PLAN_RULE_CHAR.repeat(labelWidth + 26);
    const body = safeRows
        .map((r) => `${r.label.padEnd(labelWidth)} │ ${r.value}`)
        .join('\n');
    return `${title}\n${rule}\n${body}\n${rule}`;
};
