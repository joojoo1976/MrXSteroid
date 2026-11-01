import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language } from '@/shared/types/types';
import Tool034 from './tool-034-compound-clearance';

afterEach(() => cleanup());

function renderTool(language: Language, unitSystem: 'metric' | 'imperial' = 'metric') {
  return render(
    <PreferencesContext.Provider value={{ language, unitSystem, isRTL: language === Language.AR } as PreferencesContextProps}>
      <Tool034 />
    </PreferencesContext.Provider>,
  );
}

describe('Tool 034 fractional-decay UI', () => {
  it('starts empty and states that the threshold has no medical meaning', () => {
    renderTool(Language.AR);
    expect(screen.getByRole('main')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByText(/حد حسابي اعتباطي وليست معياراً طبياً/)).toBeInTheDocument();
    expect(screen.getByText(/أكمل الحقول بقيم صالحة/)).toBeInTheDocument();
    expect(screen.queryByText('تاريخ التصفية')).not.toBeInTheDocument();
  });

  it('calculates only after explicit source-backed inputs and follows the global language setting', () => {
    const view = renderTool(Language.AR);
    fireEvent.change(screen.getByLabelText('اسم توضيحي للسيناريو أو المركب'), { target: { value: 'Example label' } });
    fireEvent.change(screen.getByLabelText('نصف العمر الذي أدخله المستخدم (أيام)'), { target: { value: '4.5' } });
    fireEvent.change(screen.getByLabelText(/مصدر قيمة نصف العمر/), { target: { value: 'Source name or URL' } });
    fireEvent.change(screen.getByLabelText('تاريخ بدء الحساب المرجعي'), { target: { value: '2026-01-01' } });
    fireEvent.change(screen.getByLabelText('الحساب حتى تاريخ'), { target: { value: '2026-01-31' } });

    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText(/Source name or URL/)).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.tagName === 'OUTPUT')).toHaveTextContent('0.98%');

    view.rerender(
      <PreferencesContext.Provider value={{ language: Language.EN, unitSystem: 'imperial', isRTL: false } as PreferencesContextProps}>
        <Tool034 />
      </PreferencesContext.Provider>,
    );
    expect(screen.getByRole('heading', { name: 'Single-dose Fractional Decay Scenario' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('dir', 'ltr');
    expect(screen.getByDisplayValue('4.5')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Source name or URL')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /English|عربي|Metric|Imperial|اللغة|القياس/i })).not.toBeInTheDocument();
  });
});
