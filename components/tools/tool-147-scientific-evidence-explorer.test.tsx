import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language } from '@/shared/types/types';
import Tool147 from './tool-147-scientific-evidence-explorer';

function renderWithLanguage(language: Language) {
  const tree = (currentLanguage: Language) => (
    <PreferencesContext.Provider value={{
      language: currentLanguage,
      unitSystem: 'metric',
      isRTL: currentLanguage === Language.AR,
    } as PreferencesContextProps}>
      <Tool147 />
    </PreferencesContext.Provider>
  );
  const view = render(tree(language));
  return { ...view, setLanguage: (nextLanguage: Language) => view.rerender(tree(nextLanguage)) };
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Tool 147 PubMed search interface', () => {
  it('follows the global language preference without local language or unit controls', () => {
    const view = renderWithLanguage(Language.AR);
    expect(screen.getByRole('heading', { name: 'مستكشف الأدلة العلمية والبحث عن المراجع' })).toBeInTheDocument();
    expect(screen.getByText(/تُرسل عبارة البحث إلى NCBI بعد الضغط/)).toBeInTheDocument();
    view.setLanguage(Language.EN);
    expect(screen.getByRole('heading', { name: 'Scientific Evidence Explorer & Citation Search' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'PubMed search query' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /English|العربية|Metric|Imperial|اللغة|القياس/i })).not.toBeInTheDocument();
  });

  it('submits only on user action and displays citation metadata returned by NCBI', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({
        status: 'RESULTS',
        source: 'NCBI_PUBMED',
        resultOrigin: 'EXTERNAL_SOURCE',
        query: 'exercise recovery',
        citations: [{
          pmid: '12345', title: 'Study title', authors: ['A. Researcher'], journal: 'Example Journal',
          publicationDate: '2025', doi: '10.1000/example', pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/12345/',
        }],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithLanguage(Language.EN);
    fireEvent.change(screen.getByRole('textbox', { name: 'PubMed search query' }), { target: { value: 'exercise recovery' } });
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Search PubMed' }));
    expect(await screen.findByRole('link', { name: 'Study title' })).toHaveAttribute('href', 'https://pubmed.ncbi.nlm.nih.gov/12345/');
    expect(screen.getByText(/Source: NCBI PubMed/)).toBeInTheDocument();
    expect(screen.getByText(/PMID: 12345 · DOI: 10.1000\/example/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/smarttools/tool-147', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ query: 'exercise recovery' }),
      cache: 'no-store',
    }));
  });

  it('explains a fail-closed limiter response in Arabic and reports the retry interval', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 503,
      json: async () => ({ status: 'NOT_AVAILABLE', reason: 'NCBI_LIMITER_UNAVAILABLE', retryAfter: 60 }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithLanguage(Language.AR);
    fireEvent.change(screen.getByRole('textbox', { name: 'عبارة البحث في PubMed' }), { target: { value: 'تمارين' } });
    fireEvent.click(screen.getByRole('button', { name: 'ابحث في PubMed' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/تعذر التحقق من محدد طلبات NCBI المشترك/);
    expect(screen.getByRole('alert')).toHaveTextContent(/لم يُرسل أي طلب إلى NCBI/);
    expect(screen.getByRole('alert')).toHaveTextContent(/60 ثانية/);
  });
});
