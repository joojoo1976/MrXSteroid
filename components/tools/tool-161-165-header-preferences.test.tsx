import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language } from '@/shared/types/types';
import Tool161 from './tool-161-peptide-protocol-planner';
import Tool162 from './tool-162-oral-cycle-planner';
import Tool163 from './tool-163-trt-optimization-engine';
import Tool164 from './tool-164-post-cycle-bloodwork-interpreter';
import Tool165 from './tool-165-drug-interaction-checker-pro';

afterEach(() => cleanup());

function provider(language: Language, child: React.ReactNode) {
  return <PreferencesContext.Provider value={{ language, unitSystem: 'imperial', isRTL: language === Language.AR } as PreferencesContextProps}>{child}</PreferencesContext.Provider>;
}

describe('Tools 161–165 bilingual, session-only UI contracts', () => {
  it('Tool 161 requires a name, displays a user note in the page, and retains it on language change', () => {
    const view = render(provider(Language.AR, <Tool161 />));
    fireEvent.click(screen.getByRole('button', { name: 'أضف إلى سجل الصفحة' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('اسم وصفي (مطلوب)'), { target: { value: 'ملاحظة' } });
    fireEvent.change(screen.getByLabelText('ملاحظة اختيارية'), { target: { value: 'تفصيل' } });
    fireEvent.click(screen.getByRole('button', { name: 'أضف إلى سجل الصفحة' }));
    view.rerender(provider(Language.EN, <Tool161 />));
    expect(screen.getByRole('main')).toHaveAttribute('dir', 'ltr');
    expect(screen.getAllByText('تفصيل')).toHaveLength(2);
    expect(screen.getByText(/not saved to your account or database/i)).toBeInTheDocument();
  });

  it('Tool 162 explains that it records a note, not a cycle plan', () => {
    render(provider(Language.EN, <Tool162 />));
    fireEvent.change(screen.getByLabelText('Descriptive name (required)'), { target: { value: 'Note A' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add to page log' }));
    expect(screen.getByText('Note A')).toBeInTheDocument();
    expect(screen.getByText(/no cycle design, liver advice, dosing, or treatment recommendation/i)).toBeInTheDocument();
  });

  it('Tool 163 blocks blank values and shows only the arithmetic difference in the user unit', () => {
    render(provider(Language.EN, <Tool163 />));
    fireEvent.click(screen.getByRole('button', { name: 'Calculate arithmetic difference' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Current value'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Comparison value'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('Same unit for both values'), { target: { value: 'user unit' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate arithmetic difference' }));
    expect(screen.getByText(/comparison value minus current value\): 3 user unit/i)).toBeInTheDocument();
    expect(screen.getByText(/no TRT optimization or medical recommendation/i)).toBeInTheDocument();
  });

  it('Tool 164 requires marker, value, and reported unit, without interpreting the result', () => {
    render(provider(Language.AR, <Tool164 />));
    fireEvent.change(screen.getByLabelText('اسم التحليل أو المؤشر'), { target: { value: 'Marker' } });
    fireEvent.change(screen.getByLabelText('القيمة كما وردت'), { target: { value: '4.2' } });
    fireEvent.change(screen.getByLabelText('الوحدة كما وردت'), { target: { value: 'u/L' } });
    fireEvent.click(screen.getByRole('button', { name: 'أضف إلى سجل الصفحة' }));
    expect(screen.getByText('4.2 u/L')).toBeInTheDocument();
    expect(screen.getByText(/لا تفسير أو مقارنة بنطاق مرجعي أو تشخيص/)).toBeInTheDocument();
    expect(screen.getByText(/لا تتحقق الأداة من المصدر أو الوحدات أو النطاقات المرجعية/)).toBeInTheDocument();
  });

  it('Tool 165 rejects empty list items instead of silently dropping them', () => {
    render(provider(Language.EN, <Tool165 />));
    fireEvent.change(screen.getByLabelText('Names as entered by the user, separated by commas'), { target: { value: 'Item A,,Item B' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add list to page log' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Names as entered by the user, separated by commas'), { target: { value: 'Item A, Item B' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add list to page log' }));
    expect(screen.getByText('Item A')).toBeInTheDocument();
    expect(screen.getByText('Item B')).toBeInTheDocument();
    expect(screen.getByText(/interactions were not analyzed/i)).toBeInTheDocument();
  });
});
