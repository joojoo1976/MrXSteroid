import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { R6PieChart } from '@/components/tools/r6/R6PieChart';
import { getPhase2Manifest } from '@/lib/tools/r6/phase2-manifest';

describe('R6PieChart', () => {
  it('renders NOT_APPLICABLE for non-composition domains', () => {
    const m = getPhase2Manifest('tool-019-cardio-monitor', 'medical-monitoring');
    const { container } = render(<R6PieChart manifest={m} locale="en" />);
    expect(container.querySelector('[data-chart]')?.getAttribute('data-chart')).toBe('none');
    expect(container.textContent).toContain('NOT_APPLICABLE');
  });

  it('renders pie placeholder for nutrition domains without inventing data', () => {
    const m = getPhase2Manifest('macro', 'nutrition');
    const { container } = render(<R6PieChart manifest={m} locale="en" />);
    expect(container.querySelector('[data-chart]')?.getAttribute('data-chart')).toBe('pie3');
    expect(container.textContent).not.toContain('50%');
  });
});
