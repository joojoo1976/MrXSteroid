import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { withToolPreferences } from './tool-preferences.test-utils';
import Tool246 from './tool-246-homebrew-chemistry';
import Tool247 from './tool-247-habit-intelligence-coach';
import Tool250 from './tool-250-personal-fitness-memory-layer';
import Tool252 from './tool-252-command-center';

afterEach(() => cleanup());

describe('SmartTools 246, 247, 250, and 252 bounded user interfaces', () => {
  it('246 records a note, shows validation errors, and localizes with global language', () => {
    const view = render(withToolPreferences(<Tool246 />, 'en', 'metric'));
    fireEvent.click(screen.getByRole('button', { name: 'Record note' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a note');
    fireEvent.change(screen.getByLabelText('Observation'), { target: { value: 'User note' } });
    fireEvent.click(screen.getByRole('button', { name: 'Record note' }));
    expect(screen.getByRole('status')).toHaveTextContent('User note');
    expect(screen.getByText(/No synthesis, mixing, heating/i)).toBeInTheDocument();
    view.rerender(withToolPreferences(<Tool246 />, 'ar', 'metric'));
    expect(screen.getByRole('heading', { name: 'سجل ملاحظات الكيمياء' }).closest('[dir]')).toHaveAttribute('dir', 'rtl');
  });

  it('247 records one completion check-in without implying coaching or prediction', () => {
    render(withToolPreferences(<Tool247 />, 'en', 'metric'));
    fireEvent.change(screen.getByLabelText('Habit'), { target: { value: 'Walk' } });
    fireEvent.click(screen.getByLabelText('Completed, as recorded by me'));
    fireEvent.click(screen.getByRole('button', { name: 'Record check-in' }));
    expect(screen.getByRole('status')).toHaveTextContent('Walk');
    expect(screen.getByRole('status')).toHaveTextContent('Completed');
    expect(screen.getByText(/no behavioral analysis, prediction/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /language|اللغة|metric|imperial|القياس/i })).not.toBeInTheDocument();
  });

  it('250 holds notes only in page state and clears them on request', () => {
    render(withToolPreferences(<Tool250 />, 'ar', 'metric'));
    fireEvent.change(screen.getByLabelText('ملاحظة تختارها بنفسك'), { target: { value: 'ملاحظة جلسة' } });
    fireEvent.click(screen.getByRole('button', { name: 'أضف للجلسة فقط' }));
    expect(screen.getByRole('list', { name: 'ملاحظات الجلسة' })).toHaveTextContent('ملاحظة جلسة');
    expect(screen.getByRole('status')).toHaveTextContent('1 ملاحظة مؤقتة');
    fireEvent.click(screen.getByRole('button', { name: 'امسح من الصفحة' }));
    expect(screen.getByRole('list', { name: 'ملاحظات الجلسة' })).toBeEmptyDOMElement();
    expect(screen.getByRole('status')).toHaveTextContent('0 ملاحظة مؤقتة');
  });

  it('252 marks missing provenance as partial and preserves manually supplied status', () => {
    render(withToolPreferences(<Tool252 />, 'en', 'metric'));
    fireEvent.change(screen.getByLabelText('Entry label 1'), { target: { value: 'Lab result' } });
    fireEvent.change(screen.getByLabelText('Value as entered 1'), { target: { value: '4.2' } });
    fireEvent.change(screen.getByLabelText('Unit 1'), { target: { value: 'mmol/L' } });
    fireEvent.click(screen.getByRole('button', { name: 'Review selected entries' }));
    expect(screen.getByRole('status')).toHaveTextContent('Partial data');
    expect(screen.getByRole('status')).toHaveTextContent('source, date, freshness/conflict');

    fireEvent.change(screen.getByLabelText('Source 1'), { target: { value: 'Report A' } });
    fireEvent.change(screen.getByLabelText('Recorded date 1'), { target: { value: '2026-10-20' } });
    fireEvent.change(screen.getByLabelText('Freshness/conflict, as entered 1'), { target: { value: 'conflicting' } });
    fireEvent.click(screen.getByRole('button', { name: 'Review selected entries' }));
    expect(screen.getByRole('status')).toHaveTextContent('Manual entries');
    expect(screen.getByRole('status')).toHaveTextContent('Conflicting, as entered');
    expect(screen.getByText(/user-entered and unverified/i)).toBeInTheDocument();
  });
});
