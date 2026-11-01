import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language } from '@/shared/types/types';
import Tool146EmergencyWarningSignsChecklist from './tool-146-emergency-warning-signs-checklist';
import { EMERGENCY_WARNING_RULES } from '@/lib/tools/engines/tool-146-emergency-warning-signs-checklist.v6';

function renderWithHeaderLanguage(language: Language) {
  const renderTree = (current: Language) => (
    <PreferencesContext.Provider value={{ language: current, unitSystem: 'metric', isRTL: current === Language.AR } as PreferencesContextProps}>
      <Tool146EmergencyWarningSignsChecklist />
    </PreferencesContext.Provider>
  );
  const view = render(renderTree(language));
  return { ...view, setHeaderLanguage: (current: Language) => view.rerender(renderTree(current)) };
}

describe('Tool 146 bilingual emergency checklist interface', () => {
  afterEach(() => cleanup());

  it('starts in Arabic RTL, identifies the Arabic wording as a tool translation, and shows no unverified phone number', () => {
    renderWithHeaderLanguage(Language.AR);
    expect(screen.getByRole('main')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByText(/ليست ترجمة رسمية من ACEP/)).toBeInTheDocument();
    expect(screen.getByText(/NOT_AVAILABLE/)).toBeInTheDocument();
    expect(document.querySelectorAll('a[href^="tel:"]')).toHaveLength(0);
  });

  it('shows urgent escalation after one explicit adult yes even while other answers remain incomplete', () => {
    renderWithHeaderLanguage(Language.AR);
    fireEvent.click(screen.getByLabelText('بالغ'));
    const firstFlag = EMERGENCY_WARNING_RULES.flags.adult[0];
    fireEvent.click(screen.getByLabelText(`${firstFlag.labelAr}: نعم`));
    expect(screen.getByRole('alert')).toHaveTextContent(/لا تنتظر إكمال القائمة أو نتيجة الأداة/);
    fireEvent.click(screen.getByRole('button', { name: 'راجع الإجابات' }));
    expect(screen.getAllByText(/PARTIAL/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/اتصل بخدمات الطوارئ المحلية أو اطلب رعاية طبية عاجلة الآن/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(firstFlag.labelAr).length).toBeGreaterThan(0);
  });

  it('shows NO_MATCH without a safe/clearance statement when every adult item is no', () => {
    renderWithHeaderLanguage(Language.AR);
    fireEvent.click(screen.getByLabelText('بالغ'));
    for (const flag of EMERGENCY_WARNING_RULES.flags.adult) fireEvent.click(screen.getByLabelText(`${flag.labelAr}: لا`));
    fireEvent.click(screen.getByRole('button', { name: 'راجع الإجابات' }));
    expect(screen.getAllByText(/NO_MATCH/).length).toBeGreaterThan(0);
    expect(screen.getByText(/هذا لا يثبت أن الحالة آمنة ولا يستبعد وجود طارئ/)).toBeInTheDocument();
    expect(screen.queryByText('أنت بخير')).not.toBeInTheDocument();
    expect(screen.queryByText('لا يوجد خطر')).not.toBeInTheDocument();
  });

  it('requires answers and keeps unsure responses in PARTIAL state', () => {
    renderWithHeaderLanguage(Language.AR);
    fireEvent.click(screen.getByLabelText('بالغ'));
    expect(screen.getByText(/PARTIAL/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'راجع الإجابات' })).toBeEnabled();
    fireEvent.click(screen.getByLabelText(`${EMERGENCY_WARNING_RULES.flags.adult[0].labelAr}: غير متأكد`));
    fireEvent.click(screen.getByRole('button', { name: 'راجع الإجابات' }));
    expect(screen.getAllByText(/PARTIAL/).length).toBeGreaterThan(0);
  });

  it('switches to English LTR and shows the source and review date', () => {
    const view = renderWithHeaderLanguage(Language.AR);
    view.setHeaderLanguage(Language.EN);
    expect(screen.getByRole('main')).toHaveAttribute('dir', 'ltr');
    expect(screen.getByText('Emergency Warning Signs Checklist')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /American College of Emergency Physicians/ })).toHaveAttribute('href', EMERGENCY_WARNING_RULES.sources[0].url);
    expect(screen.getByText(/Reviewed:/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'EN' })).not.toBeInTheDocument();
  });
});
