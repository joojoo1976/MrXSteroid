import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language } from '@/shared/types/types';
import Tool166 from './tool-166-injection-pain-minimizer';
import Tool167 from './tool-167-ester-conversion';
import Tool168 from './tool-168-compound-stacking-synergy';
import Tool169 from './tool-169-side-effect-early-warning';
import Tool170 from './tool-170-cycle-cost';

afterEach(() => cleanup());

function provider(language: Language, child: React.ReactNode) {
  return <PreferencesContext.Provider value={{ language, unitSystem: 'imperial', isRTL: language === Language.AR } as PreferencesContextProps}>{child}</PreferencesContext.Provider>;
}

describe('Tools 166–170 bilingual bounded UI', () => {
  it('Tool 166 validates and displays session-only notes without claiming treatment', () => {
    const view = render(provider(Language.AR, <Tool166 />));
    fireEvent.click(screen.getByRole('button', { name: 'أضف إلى سجل الصفحة' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('ملاحظة المستخدم'), { target: { value: 'ملاحظة وصفية' } });
    fireEvent.click(screen.getByRole('button', { name: 'أضف إلى سجل الصفحة' }));
    view.rerender(provider(Language.EN, <Tool166 />));
    expect(screen.getByRole('main')).toHaveAttribute('dir', 'ltr');
    expect(screen.getAllByText('ملاحظة وصفية')).toHaveLength(2);
    expect(screen.getByText(/not saved to your account or database/i)).toBeInTheDocument();
  });

  it('Tool 167 rejects blank input and reports factor multiplication with user unit', () => {
    render(provider(Language.EN, <Tool167 />));
    fireEvent.click(screen.getByRole('button', { name: 'Calculate result' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Input value'), { target: { value: '4' } });
    fireEvent.change(screen.getByLabelText('User-entered conversion factor'), { target: { value: '2.5' } });
    fireEvent.change(screen.getByLabelText('Output unit as specified by you'), { target: { value: 'custom unit' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate result' }));
    expect(screen.getByText(/Arithmetic result: 10 custom unit/)).toBeInTheDocument();
    expect(screen.getByText(/unit dimensions and factor source are not verified/i)).toBeInTheDocument();
  });

  it('Tool 168 rejects empty comma-separated list items', () => {
    render(provider(Language.EN, <Tool168 />));
    fireEvent.change(screen.getByLabelText('Items as entered by the user, separated by commas'), { target: { value: 'A,,B' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add list to page' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Items as entered by the user, separated by commas'), { target: { value: 'A, B' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add list to page' }));
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('Tool 169 uses explicit user selections only and never reports safety', () => {
    render(provider(Language.EN, <Tool169 />));
    fireEvent.click(screen.getByRole('button', { name: 'Review explicit selections' }));
    expect(screen.getByText('No label was explicitly selected')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add signal' }));
    fireEvent.change(screen.getByLabelText('Signal label 1'), { target: { value: 'User signal' } });
    fireEvent.click(screen.getByLabelText('Select this signal 1'));
    fireEvent.click(screen.getByRole('button', { name: 'Review explicit selections' }));
    expect(screen.getByText('One or more labels were explicitly selected')).toBeInTheDocument();
    expect(screen.getByText('User signal')).toBeInTheDocument();
    expect(screen.getByText(/does not establish safety/i)).toBeInTheDocument();
  });

  it('Tool 170 blocks incomplete cost rows and sums entered costs in a user currency', () => {
    render(provider(Language.AR, <Tool170 />));
    fireEvent.change(screen.getByLabelText('وصف البند 1'), { target: { value: 'بند أ' } });
    fireEvent.change(screen.getByLabelText('التكلفة كما أدخلتها 1'), { target: { value: '12.5' } });
    fireEvent.click(screen.getByRole('button', { name: 'أضف بنداً' }));
    fireEvent.change(screen.getByLabelText('وصف البند 2'), { target: { value: 'بند ب' } });
    fireEvent.change(screen.getByLabelText('التكلفة كما أدخلتها 2'), { target: { value: '7.5' } });
    fireEvent.change(screen.getByLabelText('رمز العملة كما أدخلته'), { target: { value: 'XYZ' } });
    fireEvent.click(screen.getByRole('button', { name: 'احسب المجموع' }));
    expect(screen.getByText(/المجموع الحسابي: 20 XYZ/)).toBeInTheDocument();
    expect(screen.getByText(/لا يتحقق من الأسعار أو العملة/)).toBeInTheDocument();
  });
});
