import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { withToolPreferences } from './tool-preferences.test-utils';
import Tool074BloodPressureTracker from './tool-074-blood-pressure-tracker';

vi.mock('@/lib/tools/adapters/toolLogAdapter', () => ({
  AUTO_DRAFT_DEBOUNCE_MS: 60_000,
  buildAiContext: vi.fn(() => null),
  clearDraft: vi.fn(),
  commitDashboardSnapshot: vi.fn(),
  loadDraft: vi.fn(() => null),
  saveDraft: vi.fn(),
}));

describe('Tool 074 source-backed severe-range follow-up', () => {
  it('shows bilingual English category and conditional guidance for a severe reading', () => {
    const { container } = render(withToolPreferences(<Tool074BloodPressureTracker />, 'en', 'metric'));
    fireEvent.change(screen.getByLabelText(/Systolic Blood Pressure/), { target: { value: '181' } });
    fireEvent.change(screen.getByLabelText(/Diastolic Blood Pressure/), { target: { value: '121' } });

    expect(screen.getByText('Severe range')).toBeInTheDocument();
    expect(screen.getByText(/wait at least one minute and repeat/)).toBeInTheDocument();
    expect(screen.getByText(/call local emergency services now/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Source: American Heart Association (2025)' })).toHaveAttribute('href', expect.stringContaining('heart.org'));
    expect(container.firstElementChild).toHaveAttribute('dir', 'ltr');
  });

  it('uses Arabic copy and RTL without showing a false emergency finding', () => {
    const { container } = render(withToolPreferences(<Tool074BloodPressureTracker />, 'ar', 'metric'));
    fireEvent.change(screen.getByLabelText(/ضغط الدم الانقباضي/), { target: { value: '181' } });
    fireEvent.change(screen.getByLabelText(/ضغط الدم الانبساطي/), { target: { value: '121' } });

    expect(screen.getByText('نطاق شديد الارتفاع')).toBeInTheDocument();
    expect(screen.getByText(/انتظر دقيقة على الأقل ثم أعد القياس/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'المصدر: جمعية القلب الأمريكية (2025)' })).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute('dir', 'rtl');
    expect(screen.queryByText('تنبيه طارئ لضغط الدم')).not.toBeInTheDocument();
  });
});
