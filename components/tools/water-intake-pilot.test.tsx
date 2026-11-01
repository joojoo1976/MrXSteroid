import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import WaterIntakePilotTool from './water-intake-pilot';
import { withToolPreferences } from './tool-preferences.test-utils';

afterEach(() => cleanup());

describe('WaterIntakePilotTool', () => {
  it('calculates liters and milliliters from weight and activity', () => {
    render(withToolPreferences(<WaterIntakePilotTool />, 'en', 'metric'));
    fireEvent.change(screen.getByTestId('water-weight'), { target: { value: '70' } });
    fireEvent.click(screen.getByTestId('water-calculate'));
    expect(screen.getByTestId('water-result').textContent).toContain('2.5 L/day (2500 mL)');
    fireEvent.change(screen.getByTestId('water-activity'), { target: { value: '1.4' } });
    fireEvent.click(screen.getByTestId('water-calculate'));
    expect(screen.getByTestId('water-result').textContent).toContain('2.55 L/day');
  });

  it('converts pounds and validates empty weight', () => {
    render(withToolPreferences(<WaterIntakePilotTool />, 'en', 'imperial'));
    fireEvent.change(screen.getByTestId('water-weight'), { target: { value: '154.3236' } });
    fireEvent.click(screen.getByTestId('water-calculate'));
    expect(screen.getByTestId('water-result').textContent).toContain('2.5 L/day');
    fireEvent.change(screen.getByTestId('water-weight'), { target: { value: '' } });
    fireEvent.click(screen.getByTestId('water-calculate'));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByTestId('water-result')).not.toBeInTheDocument();
  });
});
