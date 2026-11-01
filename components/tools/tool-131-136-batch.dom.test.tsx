import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Tool131TransformationScenario from './tool-131-transformation-forecast-trajectory-engine';
import Tool133RepTempoVelocityLoss from './tool-133-rep-tempo-velocity-loss-analyzer';
import Tool134MobilityScreen from './tool-134-mobility-movement-symmetry-screen';
import Tool135ExerciseSubstitution from './tool-135-exercise-substitution-ai';
import Tool136PhysiqueProportion from './tool-136-physique-golden-ratio-score';
import { withToolPreferences } from './tool-preferences.test-utils';

describe('SmartTools 131–136 Tool 111 parity controls', () => {
  afterEach(() => cleanup());

  it('calculates an explicit body-composition scenario with converted weight inputs', () => {
    const view = render(withToolPreferences(<Tool131TransformationScenario />, 'en', 'metric'));
    fireEvent.change(screen.getByLabelText('Current weight'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Current body fat (%)'), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText('Target body fat (%)'), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText('Your selected weekly change rate'), { target: { value: '0.5' } });
    view.rerender(withToolPreferences(<Tool131TransformationScenario />, 'en', 'imperial'));
    expect((screen.getByLabelText('Current weight') as HTMLInputElement).value).toBe('220.5');
    fireEvent.click(screen.getByRole('button', { name: 'Calculate scenario' }));
    expect(screen.getByText('Results summary')).toBeInTheDocument();
    expect(screen.getByText('206.8 lb')).toBeInTheDocument();
    expect(screen.getByText('This is an arithmetic scenario, not a prediction of actual outcomes.')).toBeInTheDocument();
  });

  it('requires actual set fields and withholds velocity-loss output without two readings', () => {
    render(withToolPreferences(<Tool133RepTempoVelocityLoss />, 'en', 'metric'));
    expect(screen.getByRole('button', { name: 'Analyze sets' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Reps 1'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('Load 1'), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: 'Analyze sets' }));
    expect(screen.getByText('Unavailable · enter at least two velocities')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Average velocity 1'), { target: { value: '0.8' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add set' }));
    fireEvent.change(screen.getByLabelText('Reps 2'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('Load 2'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Average velocity 2'), { target: { value: '0.64' } });
    fireEvent.click(screen.getByRole('button', { name: 'Analyze sets' }));
    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  it('blocks mobility comparison until both sides have user-entered measurements', () => {
    render(withToolPreferences(<Tool134MobilityScreen />, 'en', 'metric'));
    expect(screen.getByRole('button', { name: 'Compare values' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Left side'), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText('Right side'), { target: { value: '12' } });
    fireEvent.click(screen.getByRole('button', { name: 'Compare values' }));
    expect(screen.getByText('Review recorded difference')).toBeInTheDocument();
    expect(screen.getByText(/not a diagnosis/)).toBeInTheDocument();
  });

  it('follows the shared language preference without losing mobility values or adding local preference controls', () => {
    const view = render(withToolPreferences(<Tool134MobilityScreen />, 'ar', 'metric'));
    fireEvent.change(screen.getByLabelText('الجانب الأيسر'), { target: { value: '24' } });
    fireEvent.change(screen.getByLabelText('الجانب الأيمن'), { target: { value: '18' } });

    view.rerender(withToolPreferences(<Tool134MobilityScreen />, 'en', 'imperial'));

    expect(screen.getByRole('main')).toHaveAttribute('dir', 'ltr');
    expect(screen.getByRole('heading', { name: 'Side-to-side Movement Screen' })).toBeInTheDocument();
    expect(screen.getByLabelText('Left side')).toHaveValue(24);
    expect(screen.getByLabelText('Right side')).toHaveValue(18);
    expect(screen.queryByRole('button', { name: /English|العربية|Metric|Imperial|اللغة|القياس/i })).not.toBeInTheDocument();
  });

  it('matches exercise options to equipment and suppresses them when pain is reported', () => {
    render(withToolPreferences(<Tool135ExerciseSubstitution />, 'en', 'metric'));
    expect(screen.getByRole('button', { name: 'Show options' })).toBeDisabled();
    fireEvent.click(screen.getByLabelText('Bodyweight'));
    fireEvent.change(screen.getByLabelText('Movement pattern'), { target: { value: 'push' } });
    fireEvent.click(screen.getByRole('button', { name: 'Show options' }));
    expect(screen.getByText('Incline push-up')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('I have pain during this movement'));
    fireEvent.click(screen.getByRole('button', { name: 'Show options' }));
    expect(screen.getByText('No matching options')).toBeInTheDocument();
    expect(screen.getByText(/Do not use this rule list to train through pain/)).toBeInTheDocument();
  });

  it('shows insufficient physique data honestly and keeps ratios stable through cm/in conversion', () => {
    const view = render(withToolPreferences(<Tool136PhysiqueProportion />, 'en', 'metric'));
    expect(screen.getByRole('button', { name: 'Calculate ratios' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Calculate ratios' }));
    expect(screen.getByText(/Unavailable · waist plus one comparable measurement required/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Waist circumference (cm)'), { target: { value: '80' } });
    fireEvent.change(screen.getByLabelText('Shoulder circumference (cm)'), { target: { value: '120' } });
    view.rerender(withToolPreferences(<Tool136PhysiqueProportion />, 'en', 'imperial'));
    expect((screen.getByLabelText('Waist circumference (in)') as HTMLInputElement).value).toBe('31.5');
    fireEvent.click(screen.getByRole('button', { name: 'Calculate ratios' }));
    expect(screen.getByText('Shoulder to waist: 1.5')).toBeInTheDocument();
  });
});
