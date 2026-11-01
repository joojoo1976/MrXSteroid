import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language } from '@/shared/types/types';
import Tool145 from './tool-145-habit-intelligence-consistency-coach';

afterEach(() => cleanup());

function renderWithHeaderLanguage(language: Language) {
  return render(
    <PreferencesContext.Provider value={{
      language,
      unitSystem: 'metric',
      isRTL: language === Language.AR,
    } as PreferencesContextProps}>
      <Tool145 />
    </PreferencesContext.Provider>,
  );
}

describe('Tool 145 weekly habit UI', () => {
  it('requires a habit name, calculates from explicit daily marks and clears stale results', () => {
    render(<Tool145 />);
    const calculate = screen.getByRole('button', { name: 'احسب ملخص الأسبوع' });
    expect(calculate).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText('اكتب اسم العادة'), { target: { value: 'مشي' } });
    fireEvent.click(screen.getByLabelText(/السبت · مشي/));
    fireEvent.click(screen.getByLabelText(/الأحد · مشي/));
    fireEvent.click(calculate);
    expect(screen.getByText(/29% \(2\/7\)/)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/السبت · مشي/));
    expect(screen.queryByText(/29% \(2\/7\)/)).not.toBeInTheDocument();
  });

  it('follows the global language change without losing entered habit data or adding local preference buttons', () => {
    const view = renderWithHeaderLanguage(Language.AR);
    const habitName = screen.getByPlaceholderText('اكتب اسم العادة');
    fireEvent.change(habitName, { target: { value: 'مشي' } });
    fireEvent.click(screen.getByLabelText(/السبت · مشي/));

    view.rerender(
      <PreferencesContext.Provider value={{
        language: Language.EN,
        unitSystem: 'imperial',
        isRTL: false,
      } as PreferencesContextProps}>
        <Tool145 />
      </PreferencesContext.Provider>,
    );

    expect(screen.getByRole('main')).toHaveAttribute('dir', 'ltr');
    expect(screen.getByRole('heading', { name: 'Weekly Habit Consistency Tracker' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter a habit name')).toHaveValue('مشي');
    expect(screen.getByLabelText(/Sat · مشي/)).toBeChecked();
    expect(screen.queryByRole('button', { name: /English|العربية|Metric|Imperial|اللغة|القياس/i })).not.toBeInTheDocument();
  });
});
