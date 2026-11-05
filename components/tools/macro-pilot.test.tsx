import { afterEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import MacroPilotTool from '@/components/tools/macro-pilot';

afterEach(() => cleanup());

function renderWithHeaderPreferences(
  language: 'en' | 'ar' = 'en',
  unitSystem: 'metric' | 'imperial' = 'metric',
  theme: Theme = Theme.LIGHT,
) {
  const renderAt = (
    nextLanguage: 'en' | 'ar',
    nextUnitSystem: 'metric' | 'imperial',
    nextTheme: Theme,
  ) => (
    <PreferencesContext.Provider value={{
      language: nextLanguage === 'ar' ? Language.AR : Language.EN,
      unitSystem: nextUnitSystem,
      theme: nextTheme,
      isRTL: nextLanguage === 'ar',
    } as PreferencesContextProps}>
      <MacroPilotTool />
    </PreferencesContext.Provider>
  );
  const view = render(renderAt(language, unitSystem, theme));
  return {
    ...view,
    setHeaderPreferences: (
      nextLanguage: 'en' | 'ar',
      nextUnitSystem: 'metric' | 'imperial',
      nextTheme: Theme = theme,
    ) => {
      view.rerender(renderAt(nextLanguage, nextUnitSystem, nextTheme));
    },
  };
}

function completeRequiredInputs() {
  fireEvent.change(screen.getByLabelText('Age (years)'), { target: { value: '30' } });
  fireEvent.change(screen.getByLabelText('Sex used by the BMR equation'), { target: { value: 'male' } });
  fireEvent.change(screen.getByLabelText('Height (cm)'), { target: { value: '175' } });
  fireEvent.change(screen.getByLabelText('Weight (kg)'), { target: { value: '75' } });
  fireEvent.change(screen.getByLabelText('Activity factor (1.2–1.9)'), { target: { value: '1.55' } });
  fireEvent.change(screen.getByLabelText('Calculation phase'), { target: { value: 'maintenance' } });
}

describe('MacroPilotTool integration', () => {
  it('starts without hidden numeric defaults and reports incomplete required fields', async () => {
    renderWithHeaderPreferences();
    expect((screen.getByLabelText('Age (years)') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Weight (kg)') as HTMLInputElement).value).toBe('');
    await waitFor(() => expect(screen.getByText('Enter the required values to begin.')).toBeInTheDocument());
    expect(screen.getByTestId('macro-status')).toHaveTextContent('Inputs incomplete');
    expect(screen.queryByTestId('macro-result')).not.toBeInTheDocument();
  });

  it('uses global header controls instead of rendering local language or unit controls', () => {
    renderWithHeaderPreferences();
    expect(screen.queryByLabelText('Language')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Display units')).not.toBeInTheDocument();
  });

  it('follows the global light, dark, and resolved system theme without adding a local control', async () => {
    const originalResolvedTheme = document.documentElement.getAttribute('data-resolved-theme');
    document.documentElement.setAttribute('data-resolved-theme', 'dark');
    const view = renderWithHeaderPreferences('en', 'metric', Theme.DARK);
    const tool = document.querySelector('[data-tool-id="mrx.tool.macro"]')!;
    try {
      expect(tool).toHaveAttribute('data-theme', 'dark');
      view.setHeaderPreferences('en', 'metric', Theme.LIGHT);
      expect(tool).toHaveAttribute('data-theme', 'light');

      view.setHeaderPreferences('en', 'metric', Theme.SYSTEM);
      await waitFor(() => expect(tool).toHaveAttribute('data-theme', 'dark'));
      expect(screen.queryByLabelText(/theme/i)).not.toBeInTheDocument();

      document.documentElement.setAttribute('data-resolved-theme', 'light');
      window.dispatchEvent(new CustomEvent('mrx_theme_change', { detail: { mode: 'system', resolved: 'light' } }));
      await waitFor(() => expect(tool).toHaveAttribute('data-theme', 'light'));
    } finally {
      if (originalResolvedTheme === null) document.documentElement.removeAttribute('data-resolved-theme');
      else document.documentElement.setAttribute('data-resolved-theme', originalResolvedTheme);
    }
  });

  it('calculates the full result only after all six required values are entered', async () => {
    renderWithHeaderPreferences();
    completeRequiredInputs();
    await waitFor(() => expect(screen.getByTestId('macro-result')).toBeInTheDocument());
    expect(screen.getByTestId('macro-status')).toHaveTextContent('Calculation complete');
    expect(screen.getByTestId('macro-result').textContent).toMatch(/Target calories: \d+ kcal/);
    expect(screen.getByTestId('macro-result-type').textContent).toBe('Result type: CALCULATED');
    expect(screen.getByTestId('macro-distribution').textContent).toContain('Protein: 165 g · 660 kcal · 25%');
    expect(screen.getByTestId('macro-distribution').textContent).toContain('Carbohydrates: 340 g · 1360 kcal · 52%');
    expect(screen.getByTestId('macro-energy-balance').textContent).toContain('Macro energy total: 2632 kcal · Target: 2633 kcal · Difference: -1 kcal');
    expect(screen.getByText('Percentages are rounded independently and may not total exactly 100%.')).toBeInTheDocument();
    expect(screen.getByText(/deterministic calculation, not a prediction/i)).toBeInTheDocument();
    expect(screen.getByText('Calculated comparison scenarios')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Original Mifflin–St Jeor study (PubMed)' })).toHaveAttribute('href', 'https://pubmed.ncbi.nlm.nih.gov/2305711/');
  });

  it('discloses equation age extrapolation in English and Arabic', async () => {
    const view = renderWithHeaderPreferences();
    completeRequiredInputs();
    fireEvent.change(screen.getByLabelText('Age (years)'), { target: { value: '79' } });

    expect(await screen.findByText(/source study included healthy adults aged 19–78/)).toBeInTheDocument();
    view.setHeaderPreferences('ar', 'metric');
    expect(await screen.findByText(/اشتملت دراسة معادلة ميفلين-سانت جيور على بالغين أصحاء أعمارهم 19–78 سنة/)).toBeInTheDocument();
  });

  it('rejects ages below the adult derivation sample in English and Arabic', async () => {
    const view = renderWithHeaderPreferences();
    completeRequiredInputs();
    fireEvent.change(screen.getByLabelText('Age (years)'), { target: { value: '18' } });
    expect(await screen.findByText('Age must be between 19 and 100 years.')).toBeInTheDocument();
    expect(screen.getByTestId('macro-status')).toHaveTextContent('Calculation unavailable');
    expect(screen.queryByTestId('macro-result')).not.toBeInTheDocument();

    view.setHeaderPreferences('ar', 'metric');
    expect(await screen.findByText('يجب أن يكون العمر بين 19 و100 سنة.')).toBeInTheDocument();
    expect(screen.getByTestId('macro-status')).toHaveTextContent('تعذر الحساب');
    expect(screen.queryByTestId('macro-result')).not.toBeInTheDocument();
  });

  it('shows an infeasible comparison as unavailable without suppressing the valid base result', async () => {
    const view = renderWithHeaderPreferences();
    completeRequiredInputs();
    fireEvent.change(screen.getByLabelText('Age (years)'), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText('Height (cm)'), { target: { value: '250' } });
    fireEvent.change(screen.getByLabelText('Weight (kg)'), { target: { value: '300' } });
    fireEvent.change(screen.getByLabelText('Activity factor (1.2–1.9)'), { target: { value: '1.2' } });

    await waitFor(() => expect(screen.getByTestId('macro-result')).toBeInTheDocument());
    expect(screen.getByTestId('macro-result-type')).toHaveTextContent('CALCULATED');
    expect(screen.getByText(/Switch to Cut phase: Not available:/)).toBeInTheDocument();
    expect(screen.getByText(/Switch to Cut phase: Not available:/)).toHaveTextContent('NOT_AVAILABLE');
    expect(screen.getByText(/Switch to Bulk phase: Target calories:/)).toBeInTheDocument();

    view.setHeaderPreferences('ar', 'metric');
    expect(await screen.findByText(/غير متاح: لا تنتج هذه المدخلات توزيعاً غير سالب/)).toBeInTheDocument();
  });

  it('supports a bounded weight what-if calculation', async () => {
    renderWithHeaderPreferences();
    completeRequiredInputs();
    const slider = await screen.findByRole('slider', { name: 'Weight what-if (kg)' });
    fireEvent.change(slider, { target: { value: '80' } });
    await waitFor(() => expect(screen.getByTestId('macro-what-if')).toBeInTheDocument());
    expect(screen.getByTestId('macro-what-if').textContent).toMatch(/Scenario result/);
  });

  it('exposes bounded activity-factor and TDEE what-if scenarios through the UI', async () => {
    renderWithHeaderPreferences();
    completeRequiredInputs();
    await screen.findByTestId('macro-result');

    fireEvent.change(screen.getByLabelText('What-if dimension'), { target: { value: 'activityLevel' } });
    const activitySlider = screen.getByRole('slider', { name: 'Activity factor' });
    expect(activitySlider).toHaveAttribute('min', '1.2');
    expect(activitySlider).toHaveAttribute('max', '1.9');
    fireEvent.change(activitySlider, { target: { value: '1.8' } });
    await waitFor(() => expect(screen.getByTestId('macro-what-if')).toHaveTextContent('Target calories: 3058 kcal'));

    fireEvent.change(screen.getByLabelText('What-if dimension'), { target: { value: 'tdee' } });
    const tdeeSlider = screen.getByRole('slider', { name: 'TDEE (kcal/day)' });
    expect(Number((tdeeSlider as HTMLInputElement).min)).toBe(2039);
    expect(Number((tdeeSlider as HTMLInputElement).max)).toBe(3228);
    fireEvent.change(tdeeSlider, { target: { value: '2700' } });
    await waitFor(() => expect(screen.getByTestId('macro-what-if')).toHaveTextContent('Target calories: 2700 kcal'));
  });

  it('localizes the What-If dimension controls in Arabic', async () => {
    const view = renderWithHeaderPreferences();
    completeRequiredInputs();
    await screen.findByTestId('macro-result');
    view.setHeaderPreferences('ar', 'metric');
    expect(screen.getByLabelText('بُعد السيناريو الافتراضي')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('بُعد السيناريو الافتراضي'), { target: { value: 'activityLevel' } });
    expect(screen.getByRole('slider', { name: 'معامل النشاط' })).toBeInTheDocument();
  });

  it('converts global header unit changes at the UI boundary without changing canonical math', async () => {
    const view = renderWithHeaderPreferences();
    completeRequiredInputs();
    await screen.findByTestId('macro-result');
    const metricResult = screen.getByTestId('macro-result').textContent;

    view.setHeaderPreferences('en', 'imperial');
    expect((screen.getByLabelText('Weight (lb)') as HTMLInputElement).value).toBe('165.3');
    expect((screen.getByLabelText('Height (in)') as HTMLInputElement).value).toBe('68.9');
    expect(screen.getByTestId('macro-result').textContent).toBe(metricResult);
    expect(screen.getByText(/22\.0 lb lower weight/)).toBeInTheDocument();

    const whatIfSlider = screen.getByRole('slider', { name: 'Weight what-if (lb)' });
    fireEvent.change(whatIfSlider, { target: { value: '180' } });
    await waitFor(() => expect(screen.getByTestId('macro-what-if').textContent).toContain('Protein: 180 g'));

    fireEvent.change(screen.getByLabelText('Weight (lb)'), { target: { value: '176.4' } });
    await waitFor(() => expect(screen.getByTestId('macro-result').textContent).toContain('Protein: 176 g'));
    view.setHeaderPreferences('en', 'metric');
    expect((screen.getByLabelText('Weight (kg)') as HTMLInputElement).value).toBe('80');
  });

  it('renders Arabic and RTL when the global language preference is Arabic', async () => {
    const view = renderWithHeaderPreferences();
    view.setHeaderPreferences('ar', 'metric');
    await waitFor(() => expect(screen.getByLabelText('الوزن (كجم)')).toBeInTheDocument());
    expect(screen.getByText('حاسبة الماكروز V6')).toBeInTheDocument();
    expect(document.querySelector('[data-tool-id="mrx.tool.macro"]')).toHaveAttribute('dir', 'rtl');
  });

  it('localizes macro distribution and rounding details using global language preference', async () => {
    const view = renderWithHeaderPreferences();
    completeRequiredInputs();
    await screen.findByTestId('macro-result');
    view.setHeaderPreferences('ar', 'metric');
    expect(screen.getByRole('heading', { name: 'توزيع الطاقة حسب المغذيات الكبرى' })).toBeInTheDocument();
    expect(screen.getByTestId('macro-result-type').textContent).toBe('نوع النتيجة: محسوبة حتميًا (CALCULATED)');
    expect(screen.getByTestId('macro-distribution').textContent).toContain('البروتين: 165 g · 660 kcal · 25%');
    expect(screen.getByTestId('macro-energy-balance').textContent).toContain('مجموع طاقة الماكروز: 2632 سعرة · الهدف: 2633 سعرة · الفرق: -1 سعرة');
    expect(screen.getByText('تُقرّب النسب كلٌّ على حدة، لذلك قد لا يساوي مجموعها 100٪ تماماً.')).toBeInTheDocument();
  });

  it('localizes numeric sensitivity details without changing the calculated factor', async () => {
    const view = renderWithHeaderPreferences();
    completeRequiredInputs();
    await screen.findByTestId('macro-result');
    view.setHeaderPreferences('ar', 'metric');
    expect(await screen.findAllByText(/الوزن: يؤدي تغير محلي|الطول: يؤدي تغير محلي|العمر: يؤدي تغير محلي|معامل النشاط: يؤدي تغير محلي/)).toHaveLength(3);
    expect(screen.queryByText(/A local \+1% change/)).not.toBeInTheDocument();
  });

  it('reports invalid supplied values without rendering NaN or Infinity', async () => {
    const view = renderWithHeaderPreferences();
    fireEvent.change(screen.getByLabelText('Weight (kg)'), { target: { value: '0' } });
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert')).toHaveTextContent('Weight is outside the supported range.');
    expect(screen.queryByTestId('macro-result')).not.toBeInTheDocument();
    expect(screen.getByRole('alert').textContent ?? '').not.toMatch(/NaN|Infinity/);

    view.setHeaderPreferences('ar', 'metric');
    expect(await screen.findByRole('alert')).toHaveTextContent('الوزن خارج النطاق المدعوم.');
  });
});
