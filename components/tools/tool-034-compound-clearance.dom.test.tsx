import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { withToolPreferences } from './tool-preferences.test-utils';
import Tool034CompoundClearance from './tool-034-compound-clearance';

vi.mock('@/lib/tools/adapters/toolLogAdapter', () => ({
  AUTO_DRAFT_DEBOUNCE_MS: 60_000,
  buildAiContext: vi.fn(() => null),
  clearDraft: vi.fn(),
  commitDashboardSnapshot: vi.fn(),
  loadDraft: vi.fn(() => null),
  saveDraft: vi.fn(),
}));

describe('Tool 034 global header preferences and model disclosure', () => {
  it('renders the Arabic copy and RTL layout without local preference controls', () => {
    const { container } = render(withToolPreferences(<Tool034CompoundClearance />, 'ar', 'metric'));

    expect(screen.getByRole('heading', { name: 'محاكاة اضمحلال جرعة واحدة' })).toBeInTheDocument();
    expect(screen.getByText(/محاكاة رياضية فقط/)).toBeInTheDocument();
    expect(screen.getByLabelText('تقييم الحالة حتى تاريخ')).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute('dir', 'rtl');
    expect(screen.queryByRole('button', { name: /language|اللغة|English|العربية/i })).not.toBeInTheDocument();
  });

  it('renders the English copy from the global preference context', () => {
    render(withToolPreferences(<Tool034CompoundClearance />, 'en', 'imperial'));

    expect(screen.getByRole('heading', { name: 'Single-dose Decay Scenario' })).toBeInTheDocument();
    expect(screen.getByText(/Mathematical scenario only/)).toBeInTheDocument();
    expect(screen.getByLabelText('Evaluate as of')).toBeInTheDocument();
  });
});
