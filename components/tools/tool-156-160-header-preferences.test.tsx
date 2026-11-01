import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language } from '@/shared/types/types';
import Tool156 from './tool-156-water-retention';
import Tool157 from './tool-157-multi-compound-half-life';
import Tool158 from './tool-158-volume-measurement';
import Tool159 from './tool-159-compound-half-life-stacker';
import Tool160 from './tool-160-genetic-potential';

afterEach(() => cleanup());

function provider(language: Language, unitSystem: 'metric' | 'imperial', child: React.ReactNode) {
  return <PreferencesContext.Provider value={{ language, unitSystem, isRTL: language === Language.AR } as PreferencesContextProps}>{child}</PreferencesContext.Provider>;
}

describe('Tools 156–160 shared header preferences and localized results', () => {
  it('Tool 156 converts weight display kg/lb while preserving the computed difference', () => {
    const view = render(provider(Language.AR, 'metric', <Tool156 />));
    fireEvent.change(screen.getByLabelText('الوزن الملاحظ (kg)'), { target: { value: '80' } });
    fireEvent.change(screen.getByLabelText('الوزن المرجعي (kg)'), { target: { value: '78' } });
    fireEvent.click(screen.getByRole('button', { name: 'احسب الفرق الوصفي' }));
    expect(screen.getByText(/2 kg/)).toBeInTheDocument();
    view.rerender(provider(Language.EN, 'imperial', <Tool156 />));
    expect(screen.getByRole('main')).toHaveAttribute('dir', 'ltr');
    expect(screen.getByLabelText('Observed weight (lb)')).toHaveValue(176.37);
    expect(screen.getByText(/4.409 lb/)).toBeInTheDocument();
  });

  it('Tool 157 blocks missing inputs and labels the half-life result as arithmetic', () => {
    render(provider(Language.EN, 'metric', <Tool157 />));
    fireEvent.click(screen.getByRole('button', { name: 'Calculate independent entry' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Descriptive name'), { target: { value: 'Sample A' } });
    fireEvent.change(screen.getByLabelText('Half-life (days)'), { target: { value: '7' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate independent entry' }));
    expect(screen.getByText(/mathematical remainder: 50%/i)).toBeInTheDocument();
    expect(screen.getByText(/Half-life arithmetic only; not a cycle, dose, or injection schedule/i)).toBeInTheDocument();
  });

  it('Tool 158 converts mL/fl oz through the header and keeps the ratio unchanged', () => {
    const view = render(provider(Language.EN, 'metric', <Tool158 />));
    fireEvent.change(screen.getByLabelText('Compared volume (mL)'), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText('Reference container volume (mL)'), { target: { value: '60' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate ratio' }));
    expect(screen.getByText(/Calculated ratio: 0.5/)).toBeInTheDocument();
    view.rerender(provider(Language.EN, 'imperial', <Tool158 />));
    expect(screen.getByLabelText('Compared volume (US fl oz)')).toHaveValue(1.0144);
    expect(screen.getByText(/Calculated ratio: 0.5/)).toBeInTheDocument();
    expect(screen.getAllByText(/does not determine a safe injection volume/i)).toHaveLength(2);
  });

  it('Tool 159 validates positive day inputs and displays the decay factor', () => {
    render(provider(Language.AR, 'imperial', <Tool159 />));
    fireEvent.change(screen.getByLabelText('نصف العمر (أيام)'), { target: { value: '7' } });
    fireEvent.change(screen.getByLabelText('الفاصل الزمني (أيام)'), { target: { value: '7' } });
    fireEvent.click(screen.getByRole('button', { name: 'احسب عامل التلاشي' }));
    expect(screen.getByText(/عامل التلاشي الحسابي: 0.5/)).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('dir', 'rtl');
  });

  it('Tool 160 preserves canonical cm values when the header switches to inches', () => {
    const view = render(provider(Language.EN, 'metric', <Tool160 />));
    fireEvent.change(screen.getByLabelText('Height (cm)'), { target: { value: '180' } });
    fireEvent.change(screen.getByLabelText('Wrist circumference (cm)'), { target: { value: '17' } });
    fireEvent.change(screen.getByLabelText('Ankle circumference (cm)'), { target: { value: '23' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate illustrative index' }));
    expect(screen.getByText(/Illustrative arithmetic index: 23.7/)).toBeInTheDocument();
    view.rerender(provider(Language.AR, 'imperial', <Tool160 />));
    expect(screen.getByLabelText('الطول (in)')).toHaveValue(70.866);
    expect(screen.getByText(/23.7/)).toBeInTheDocument();
    expect(screen.getByText(/لا يتنبأ بحد جيني/)).toBeInTheDocument();
  });
});
