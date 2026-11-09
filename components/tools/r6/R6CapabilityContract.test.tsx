import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { R6CapabilityContract } from '@/components/tools/r6/R6CapabilityContract';
import { getPhase2Manifest } from '@/lib/tools/r6/phase2-manifest';

describe('R6CapabilityContract', () => {
  it('renders all seven parts + evidence chip', () => {
    const manifest = getPhase2Manifest('tool-019-cardio-monitor', 'medical-monitoring');
    const { container } = render(<R6CapabilityContract manifest={manifest} locale="en" />);
    const text = container.textContent ?? '';
    for (const label of ['CAN', 'CANNOT', 'SOURCES', 'WHY', 'COST', 'STOP', 'RESTORE']) {
      expect(text).toContain(label);
    }
    expect(container.querySelector('[data-evidence]')?.getAttribute('data-evidence')).toBe('E3');
  });
});
