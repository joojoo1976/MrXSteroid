import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Tool126Neuromuscular from './tool-126-neuromuscular-explosiveness-modeler';
import Tool127DailyReadiness from './tool-127-ai-daily-readiness-explainer';
import Tool128Acwr from './tool-128-training-load-acute-chronic-ratio';
import Tool129AdaptivePlanner from './tool-129-ai-adaptive-training-planner';
import Tool130PlateauDetective from './tool-130-ai-plateau-detective';
import { withToolPreferences } from './tool-preferences.test-utils';

describe('SmartTools 126–130 Tool 111 parity controls', () => {
  afterEach(() => cleanup());

  it('validates body mass, calculates through its adapter and clears output when language changes', () => {
    const view = render(withToolPreferences(<Tool126Neuromuscular />, 'en', 'metric'));
    expect(screen.getByRole('button', { name: 'Calculate' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Body weight (kg)'), { target: { value: '70' } });
    fireEvent.change(screen.getByLabelText('One-rep max (kg)'), { target: { value: '70' } });
    view.rerender(withToolPreferences(<Tool126Neuromuscular />, 'en', 'imperial'));
    expect((screen.getByLabelText('Body weight (lb)') as HTMLInputElement).value).toBe('154.3');
    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }));
    expect(screen.getByText('Results summary')).toBeInTheDocument();
    expect(screen.getByText('50/100')).toBeInTheDocument();
    view.rerender(withToolPreferences(<Tool126Neuromuscular />, 'ar', 'imperial'));
    expect(screen.getByText('ملخص النتائج')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'EN' })).not.toBeInTheDocument();
  });

  it('requires readiness markers and displays canonical output after explicit calculation', () => {
    render(withToolPreferences(<Tool127DailyReadiness />, 'en', 'metric'));
    expect(screen.getByRole('button', { name: 'Calculate' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Sleep (hours)'), { target: { value: '8' } });
    fireEvent.change(screen.getByLabelText('Stress level (1–10)'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('Soreness (1–10)'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }));
    expect(screen.getByText('Results summary')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('does not create sample ACWR sessions and clears output after session edits', () => {
    render(withToolPreferences(<Tool128Acwr />, 'en', 'metric'));
    expect(screen.getByRole('button', { name: 'Calculate' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Session date'), { target: { value: '2026-10-24' } });
    fireEvent.change(screen.getByLabelText('Session load (use one consistent scale)'), { target: { value: '45' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }));
    expect(screen.getByText('Results summary')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Session load (use one consistent scale)'), { target: { value: '50' } });
    expect(screen.queryByText('Results summary')).not.toBeInTheDocument();
  });

  it('requires equipment and shows the experience-aware outline', () => {
    render(withToolPreferences(<Tool129AdaptivePlanner />, 'en', 'metric'));
    expect(screen.getByRole('button', { name: 'Create outline' })).toBeDisabled();
    fireEvent.click(screen.getByLabelText('Barbell'));
    fireEvent.change(screen.getByLabelText('Experience'), { target: { value: 'advanced' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create outline' }));
    expect(screen.getByText('Results summary')).toBeInTheDocument();
    expect(screen.getByText(/Specialized focus/)).toBeInTheDocument();
  });

  it('uses structured trend inputs and exposes a deterministic rule signal', () => {
    const view = render(withToolPreferences(<Tool130PlateauDetective />, 'en', 'metric'));
    expect(screen.getByRole('button', { name: 'Analyze trend' })).toBeDisabled();
    const rows = [
      ['2026-10-03', '80'], ['2026-10-10', '80.5'], ['2026-10-17', '81'], ['2026-10-24', '81.5'],
    ];
    for (let index = 1; index < rows.length; index += 1) fireEvent.click(screen.getByRole('button', { name: 'Add data point' }));
    rows.forEach(([date, weight], index) => {
      fireEvent.change(screen.getAllByLabelText('Date')[index], { target: { value: date } });
      fireEvent.change(screen.getAllByLabelText('Body weight (kg)')[index], { target: { value: weight } });
    });
    view.rerender(withToolPreferences(<Tool130PlateauDetective />, 'en', 'imperial'));
    fireEvent.click(screen.getByRole('button', { name: 'Analyze trend' }));
    expect(screen.getByText('Results summary')).toBeInTheDocument();
    expect(screen.getByText(/not calibrated confidence/)).toBeInTheDocument();
    expect(screen.getByText('not detected')).toBeInTheDocument();
  });
});
