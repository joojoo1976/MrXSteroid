import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { R6WhatIf } from '@/components/tools/r6/R6WhatIf';
import { getPhase2Manifest } from '@/lib/tools/r6/phase2-manifest';

describe('R6WhatIf', () => {
  it('renders NOT_AVAILABLE with reason when no engine adapter exists', () => {
    const m = getPhase2Manifest('tool-019-cardio-monitor', 'medical-monitoring');
    const { container } = render(<R6WhatIf manifest={m} locale="en" />);
    expect(container.textContent).toContain('NOT_AVAILABLE');
    expect(container.querySelector('[data-whatif]')).not.toBeNull();
  });
});
