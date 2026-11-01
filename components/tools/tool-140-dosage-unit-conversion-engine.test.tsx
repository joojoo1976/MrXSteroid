import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language } from '@/shared/types/types';
import Tool140 from './tool-140-dosage-unit-conversion-engine';

afterEach(() => cleanup());

function withHeaderLanguage(language: Language) {
  return <PreferencesContext.Provider value={{
    language,
    unitSystem: 'metric',
    isRTL: language === Language.AR,
  } as PreferencesContextProps}>
    <Tool140 />
  </PreferencesContext.Provider>;
}

describe('Tool 140 lab result unit converter', () => {
  it('converts explicitly, displays source and clears stale output on input change', () => {
    render(<Tool140 />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: 'حوّل النتيجة' }));
    expect(screen.getByText(/5.55 mmol\/L/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Labcorp SI Unit Conversion Table' })).toHaveAttribute('href', 'https://www.labcorp.com/test-menu/resources/si-unit-conversion-table');
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '120' } });
    expect(screen.queryByText(/5.55 mmol\/L/)).not.toBeInTheDocument();
  });

  it('rejects negative values and reset clears the input', () => {
    render(<Tool140 />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '-2' } });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'إعادة الضبط' }));
    expect(screen.getByRole('spinbutton')).toHaveValue(null);
  });

  it('follows the global language preference and preserves its explicit conversion input', () => {
    const view = render(withHeaderLanguage(Language.AR));
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '100' } });
    view.rerender(withHeaderLanguage(Language.EN));

    expect(screen.getByRole('main')).toHaveAttribute('dir', 'ltr');
    expect(screen.getByRole('heading', { name: 'Lab Result Unit Converter' })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toHaveValue(100);
    expect(screen.queryByRole('button', { name: /English|العربية|Metric|Imperial|اللغة|القياس/i })).not.toBeInTheDocument();
  });
});
