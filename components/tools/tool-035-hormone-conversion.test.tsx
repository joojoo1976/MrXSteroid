import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language } from '@/shared/types/types';
import Tool035 from './tool-035-hormone-conversion';

afterEach(() => cleanup());

function renderTool(language: Language, unitSystem: 'metric' | 'imperial' = 'metric') {
  return render(
    <PreferencesContext.Provider value={{ language, unitSystem, isRTL: language === Language.AR } as PreferencesContextProps}>
      <Tool035 />
    </PreferencesContext.Provider>,
  );
}

describe('Tool 035 hormone unit converter UI', () => {
  it('starts without fabricated hormone results or medication suggestions', () => {
    renderTool(Language.AR);
    expect(screen.getByRole('main')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByText(/لا تقدّر مستويات الهرمونات ولا تفسر النتيجة/)).toBeInTheDocument();
    expect(screen.getByText(/أدخل القيمة والوحدة المطابقة/)).toBeInTheDocument();
    expect(screen.queryByText(/مثبط الأروماتاز المقترح|حالة الإستراديول/)).not.toBeInTheDocument();
  });

  it('converts an explicitly entered lab value and follows header language preference', () => {
    const view = renderTool(Language.AR);
    fireEvent.change(screen.getByLabelText('قيمة النتيجة المخبرية'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('تاريخ النتيجة'), { target: { value: '2026-10-25' } });
    fireEvent.change(screen.getByLabelText(/اسم المختبر أو مصدر التقرير/), { target: { value: 'Lab report' } });
    expect(screen.getByText('100 ng/dL = 3.4674 nmol/L')).toBeInTheDocument();
    expect(screen.getByText(/Lab report/)).toBeInTheDocument();

    view.rerender(
      <PreferencesContext.Provider value={{ language: Language.EN, unitSystem: 'imperial', isRTL: false } as PreferencesContextProps}>
        <Tool035 />
      </PreferencesContext.Provider>,
    );
    expect(screen.getByRole('heading', { name: 'Testosterone and Estradiol Unit Converter' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('dir', 'ltr');
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Lab report')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /English|عربي|Metric|Imperial|اللغة|القياس/i })).not.toBeInTheDocument();
  });
});
