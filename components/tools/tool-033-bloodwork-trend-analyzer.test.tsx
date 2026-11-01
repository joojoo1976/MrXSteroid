import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language } from '@/shared/types/types';
import Tool033 from './tool-033-bloodwork-trend-analyzer';

afterEach(() => cleanup());

function renderTool(language: Language) {
  return render(
    <PreferencesContext.Provider value={{
      language,
      unitSystem: 'metric',
      isRTL: language === Language.AR,
    } as PreferencesContextProps}>
      <Tool033 />
    </PreferencesContext.Provider>,
  );
}

describe('Tool 033 descriptive trend UI', () => {
  it('starts without fabricated lab readings or reference-range judgments', () => {
    renderTool(Language.AR);
    expect(screen.getByRole('main')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByText(/لا تستخدم الأداة نطاقات مرجعية/)).toBeInTheDocument();
    expect(screen.getByText(/أضف قراءة مكتملة واحدة على الأقل/)).toBeInTheDocument();
    expect(screen.queryByText(/ضمن النطاق|تغير سريع/)).not.toBeInTheDocument();
  });

  it('uses header language and shows only a descriptive result for entered values', () => {
    const view = renderTool(Language.AR);
    const add = screen.getByRole('button', { name: /إضافة قراءة/ });
    fireEvent.click(add);
    const marker = screen.getByLabelText('المؤشر');
    fireEvent.change(marker, { target: { value: 'Total T' } });
    fireEvent.change(screen.getByLabelText('القيمة'), { target: { value: '400' } });
    fireEvent.change(screen.getByLabelText('الوحدة'), { target: { value: 'ng/dL' } });
    fireEvent.change(screen.getByLabelText('تاريخ سحب العينة'), { target: { value: '2026-01-01' } });
    expect(screen.getByText(/لا توجد تواريخ مختلفة كافية/)).toBeInTheDocument();

    view.rerender(
      <PreferencesContext.Provider value={{ language: Language.EN, unitSystem: 'imperial', isRTL: false } as PreferencesContextProps}>
        <Tool033 />
      </PreferencesContext.Provider>,
    );
    expect(screen.getByRole('heading', { name: 'Lab Reading Trend Summary' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('dir', 'ltr');
    expect(screen.getByDisplayValue('400')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /English|عربي|Metric|Imperial|اللغة|القياس/i })).not.toBeInTheDocument();
  });
});
