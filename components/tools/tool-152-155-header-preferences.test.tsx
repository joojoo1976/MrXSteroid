import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language } from '@/shared/types/types';
import Tool152 from './tool-152-side-effect-tracker';
import Tool153 from './tool-153-injection-site-rotator';
import Tool154 from './tool-154-compound-stack-builder';
import Tool155 from './tool-155-progress-tracker';

afterEach(() => cleanup());

function provider(language: Language, child: React.ReactNode) {
  return <PreferencesContext.Provider value={{ language, unitSystem: 'imperial', isRTL: language === Language.AR } as PreferencesContextProps}>{child}</PreferencesContext.Provider>;
}

describe('Tools 152–155 shared header preference and session-only records', () => {
  it('Tool 152 validates required text, renders the user record, and retains it on locale change', () => {
    const view = render(provider(Language.AR, <Tool152 />));
    fireEvent.click(screen.getByRole('button', { name: 'أضف إلى سجل الصفحة' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('الملاحظة (مطلوبة)'), { target: { value: 'تغير ملحوظ' } });
    fireEvent.click(screen.getByRole('button', { name: 'أضف إلى سجل الصفحة' }));
    expect(screen.getByText('تغير ملحوظ')).toBeInTheDocument();
    view.rerender(provider(Language.EN, <Tool152 />));
    expect(screen.getByRole('main')).toHaveAttribute('dir', 'ltr');
    expect(screen.getByText('تغير ملحوظ')).toBeInTheDocument();
    expect(screen.getByText(/not saved to your account or database/i)).toBeInTheDocument();
  });

  it('Tool 153 requires a site label and only adds the description to the current page', () => {
    render(provider(Language.EN, <Tool153 />));
    fireEvent.click(screen.getByRole('button', { name: 'Add to page log' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Site label as entered'), { target: { value: 'User label' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add to page log' }));
    expect(screen.getByText('User label')).toBeInTheDocument();
    expect(screen.getByText(/not saved to your account or database/i)).toBeInTheDocument();
    expect(screen.queryByText(/recommended|rotate to/i)).not.toBeInTheDocument();
    expect(screen.getByText(/no injection instructions or safety clearance/i)).toBeInTheDocument();
  });

  it('Tool 154 records user text without claiming analysis or persistent saving', () => {
    render(provider(Language.AR, <Tool154 />));
    fireEvent.change(screen.getByLabelText('الاسم كما أدخله المستخدم'), { target: { value: 'عنصر مدخل' } });
    fireEvent.click(screen.getByRole('button', { name: 'أضف إلى سجل الصفحة' }));
    expect(screen.getByText('عنصر مدخل')).toBeInTheDocument();
    expect(screen.getByText(/لا يبني بروتوكولاً ولا يقيّم التداخلات/)).toBeInTheDocument();
    expect(screen.getByText(/لا تُحفظ في الحساب أو قاعدة البيانات/)).toBeInTheDocument();
  });

  it('Tool 155 blocks empty/non-finite values and displays value and user unit as entered', () => {
    render(provider(Language.EN, <Tool155 />));
    fireEvent.change(screen.getByLabelText('Metric name'), { target: { value: 'Measure' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add to page log' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Numeric value'), { target: { value: '72.5' } });
    fireEvent.change(screen.getByLabelText('Unit as entered (optional)'), { target: { value: 'custom units' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add to page log' }));
    expect(screen.getByText(/Measure: 72.5 custom units/)).toBeInTheDocument();
    expect(screen.getByText(/no health judgment or prediction/i)).toBeInTheDocument();
  });
});
