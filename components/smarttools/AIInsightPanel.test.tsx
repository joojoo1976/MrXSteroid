import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import AIInsightPanel from './AIInsightPanel';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function withPreferences(children: React.ReactNode) {
  const value = {
    language: Language.EN,
    unitSystem: 'metric',
    theme: Theme.DARK,
    status: 'IDLE',
    isAutoDetected: false,
    locale: 'en',
    currency: 'USD',
    formatPrice: (price: number) => `$${price}`,
    setLanguage: () => undefined,
    setUnitSystem: () => undefined,
    setTheme: () => undefined,
    t: (key: string) => key,
    content: {} as unknown,
    isRTL: false,
    refreshDetection: async () => undefined,
  } as PreferencesContextProps;
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

describe('AIInsightPanel result privacy', () => {
  it('does not send findings until the user opts in, then labels deterministic output honestly', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, configured: false }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, source: 'deterministic', explanation: 'Grounded summary.', disclaimer: 'Informational only.' }) });
    vi.stubGlobal('fetch', fetchMock);

    render(withPreferences(<AIInsightPanel
      toolSlug="tool-149-physique-trajectory-simulator"
      provenanceLine="manual; kg"
      findings={[{ code: 'SCENARIO_1', labelAr: 'الوزن', labelEn: 'Weight', value: '82 kg', severity: 'info' }]}
    />));

    expect(screen.getByRole('button', { name: 'Explain this tool' })).toBeEnabled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Explain my results' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const request = fetchMock.mock.calls[1][1] as RequestInit;
    const body = JSON.parse(String(request.body)) as { context?: { findings?: Array<{ value: string }> } };
    expect(body.context?.findings?.[0].value).toBe('82 kg');
    expect(await screen.findByText(/deterministic explanation; no live model used/i)).toBeInTheDocument();
  });

  it('supports a user question while keeping available results out of the request until consent', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, configured: true }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, source: 'deterministic', explanation: 'The tool compares the entered values.', disclaimer: 'Informational only.' }) });
    vi.stubGlobal('fetch', fetchMock);

    render(withPreferences(<AIInsightPanel
      toolSlug="tool-144-homebrew-chemistry-calculator"
      provenanceLine="manual measurements"
      findings={[{ code: 'DENSITY', labelAr: 'الكثافة', labelEn: 'Density', value: '1 g/mL', severity: 'info' }]}
    />));

    fireEvent.change(await screen.findByLabelText(/Ask about the tool/i), { target: { value: 'How is density used?' } });
    const askButton = screen.getByRole('button', { name: 'Ask assistant' });
    expect(askButton).toBeDisabled();
    fireEvent.click(screen.getByText(/I agree to send my question text/i).previousElementSibling as HTMLInputElement);
    expect(askButton).toBeEnabled();
    fireEvent.click(askButton);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const request = fetchMock.mock.calls[1][1] as RequestInit;
    const body = JSON.parse(String(request.body)) as { question?: string; context?: unknown };
    expect(body.question).toBe('How is density used?');
    expect(body.context).toBeUndefined();
    expect(await screen.findByText('The tool compares the entered values.')).toBeInTheDocument();
  });

  it('revokes question consent when the user edits the question', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, configured: true }) }));
    render(withPreferences(<AIInsightPanel toolSlug="tool-144-homebrew-chemistry-calculator" />));
    const question = await screen.findByLabelText(/Ask about the tool/i);
    fireEvent.change(question, { target: { value: 'What does this tool calculate?' } });
    fireEvent.click(screen.getByText(/I agree to send my question text/i).previousElementSibling as HTMLInputElement);
    expect(screen.getByRole('button', { name: 'Ask assistant' })).toBeEnabled();

    fireEvent.change(question, { target: { value: 'What are its limits?' } });
    expect(screen.getByRole('button', { name: 'Ask assistant' })).toBeDisabled();
  });

  it('does not present free-form questions as AI when no live provider is configured', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, configured: false }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, source: 'deterministic', explanation: 'Tool description.', disclaimer: 'Informational only.' }) });
    vi.stubGlobal('fetch', fetchMock);

    render(withPreferences(<AIInsightPanel toolSlug="tool-144-homebrew-chemistry-calculator" />));

    expect(await screen.findByText(/Free-form questions require a live model provider/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Ask about this tool/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Explain this tool' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(await screen.findByText(/deterministic explanation; no live model used/i)).toBeInTheDocument();
  });
});
