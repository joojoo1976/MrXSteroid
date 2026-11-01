import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { SmartToolsSessionContextProvider, useToolResultSharing } from '@/context/SmartToolsSessionContext';
import { Language } from '@/shared/types/types';
import type { CrossToolResultEnvelopeV7 } from '@/lib/tools/shared-data/cross-tool-result.v7';
import Tool150ManualResultsOrganizer from './tool-150-ai-performance-command-center';

function renderWithHeaderPreferences(locale: 'ar' | 'en' = 'en') {
  return render(
    <PreferencesContext.Provider value={{ language: locale === 'ar' ? Language.AR : Language.EN, unitSystem: 'metric', isRTL: locale === 'ar' } as PreferencesContextProps}>
      <Tool150ManualResultsOrganizer />
    </PreferencesContext.Provider>,
  );
}

function SeededSharedResult() {
  const sharing = useToolResultSharing('tool-150-ai-performance-command-center');
  const share = () => {
    const timestamp = new Date().toISOString();
    const envelope: CrossToolResultEnvelopeV7 = {
      schemaVersion: 1,
      resultId: 'tool149-derived-fixture',
      sourceToolId: 'tool-149-physique-trajectory-simulator',
      sourceToolVersion: '6.0.0',
      createdAt: timestamp,
      privacyClass: 'SENSITIVE',
      fields: [{ key: 'scenario_1_target_weight', value: 82, unit: 'kg', origin: 'CALCULATED', sourceLabel: 'Tool 149 scenario 1 target weight' }],
      consent: { grantedAt: timestamp, targetToolIds: [] },
    };
    sharing.shareResultWithTarget(envelope);
  };
  return <><button type="button" onClick={share}>Seed shared result</button><Tool150ManualResultsOrganizer /></>;
}

describe('Tool 150 manual results organizer UI', () => {
  afterEach(() => cleanup());

  it('uses the header language and presents no local language or measurement toggles', () => {
    renderWithHeaderPreferences('ar');
    expect(screen.getByRole('main')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('heading', { name: 'منظّم نتائج الأداء اليدوي' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'EN' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Metric' })).not.toBeInTheDocument();
  });

  it('assembles manually entered provenance and keeps the exact unit/value text', () => {
    renderWithHeaderPreferences();
    fireEvent.change(screen.getByLabelText('Metric name 1'), { target: { value: 'Waist circumference' } });
    fireEvent.change(screen.getByLabelText('Value as reported 1'), { target: { value: '80.0' } });
    fireEvent.change(screen.getByLabelText('Unit as reported 1'), { target: { value: 'cm' } });
    fireEvent.change(screen.getByLabelText('Result source or tool 1'), { target: { value: 'Tool 136' } });
    fireEvent.change(screen.getByLabelText('Result date 1'), { target: { value: '2026-10-20' } });
    fireEvent.change(screen.getByLabelText('Data status 1'), { target: { value: 'current' } });
    fireEvent.click(screen.getByRole('button', { name: 'Review manual aggregation' }));
    expect(screen.getByText('Manually assembled')).toBeInTheDocument();
    expect(screen.getByText('80.0 cm')).toBeInTheDocument();
    expect(screen.getByText('Tool 136')).toBeInTheDocument();
    expect(screen.getByText('2026-10-20')).toBeInTheDocument();
    expect(screen.getByText('Marked current by the user; not independently verified.')).toBeInTheDocument();
  });

  it('surfaces user-marked stale, unknown, and incomplete records without making them current', () => {
    renderWithHeaderPreferences();
    fireEvent.change(screen.getByLabelText('Metric name 1'), { target: { value: 'Sleep hours' } });
    fireEvent.change(screen.getByLabelText('Data status 1'), { target: { value: 'old' } });
    fireEvent.click(screen.getByRole('button', { name: 'Review manual aggregation' }));
    expect(screen.getAllByText('PARTIAL').length).toBeGreaterThan(0);
    expect(screen.getByText('Marked old by the user; freshness was not independently checked.')).toBeInTheDocument();
    expect(screen.getByText(/Missing fields:/)).toBeInTheDocument();
  });

  it('shows repeated-value conflicts and unit mismatches rather than merging them', () => {
    renderWithHeaderPreferences();
    const fill = (suffix: string, value: string, unit: string) => {
      fireEvent.change(screen.getByLabelText(`Metric name ${suffix}`), { target: { value: 'Body weight' } });
      fireEvent.change(screen.getByLabelText(`Value as reported ${suffix}`), { target: { value } });
      fireEvent.change(screen.getByLabelText(`Unit as reported ${suffix}`), { target: { value: unit } });
      fireEvent.change(screen.getByLabelText(`Result source or tool ${suffix}`), { target: { value: `Source ${suffix}` } });
      fireEvent.change(screen.getByLabelText(`Result date ${suffix}`), { target: { value: '2026-10-20' } });
      fireEvent.change(screen.getByLabelText(`Data status ${suffix}`), { target: { value: 'current' } });
    };
    fill('1', '80', 'kg');
    fireEvent.click(screen.getByRole('button', { name: 'Add result' }));
    fill('2', '176', 'lb');
    fireEvent.click(screen.getByRole('button', { name: 'Review manual aggregation' }));
    expect(screen.getByText(/different units; no numeric comparison was made/)).toBeInTheDocument();
    expect(screen.getByText(/no total, ranking, or unified recommendation/i)).toBeInTheDocument();
  });

  it('clears its in-page data when reset is chosen', () => {
    renderWithHeaderPreferences();
    fireEvent.change(screen.getByLabelText('Metric name 1'), { target: { value: 'Steps' } });
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(screen.getByText(/NOT_AVAILABLE/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Review manual aggregation' })).toBeDisabled();
  });

  it('keeps an imported calculation timestamp separate from the missing measurement date', () => {
    render(
      <PreferencesContext.Provider value={{ language: Language.EN, unitSystem: 'metric', isRTL: false } as PreferencesContextProps}>
        <SmartToolsSessionContextProvider><SeededSharedResult /></SmartToolsSessionContextProvider>
      </PreferencesContext.Provider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Seed shared result' }));
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Import selected results' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Remove this entry' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Review manual aggregation' }));
    expect(screen.getAllByText('PARTIAL').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Result date')[1].parentElement).toHaveTextContent('—');
    expect(screen.getByText('Calculated result timestamp')).toBeInTheDocument();
    expect(screen.getByText(/source did not provide a measurement date/)).toBeInTheDocument();
    expect(screen.getByText(/Missing fields: recordedOn/)).toBeInTheDocument();
  });
});
