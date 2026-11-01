import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import ProteinNeedsPilotTool from './protein-needs-pilot';
import { withToolPreferences } from './tool-preferences.test-utils';

afterEach(() => cleanup());

describe('ProteinNeedsPilotTool', () => {
  it('calculates a daily target from the selected goal and activity', () => {
    render(withToolPreferences(<ProteinNeedsPilotTool />, 'en', 'metric'));
    fireEvent.change(screen.getByTestId('protein-weight'), { target: { value: '70' } });
    fireEvent.click(screen.getByTestId('protein-calculate'));
    expect(screen.getByTestId('protein-result').textContent).toContain('113');
    fireEvent.change(screen.getByTestId('protein-goal'), { target: { value: 'cut' } });
    fireEvent.click(screen.getByTestId('protein-calculate'));
    expect(screen.getByTestId('protein-result').textContent).toContain('156');
  });

  it('converts imperial weight and validates missing weight', () => {
    render(withToolPreferences(<ProteinNeedsPilotTool />, 'en', 'imperial'));
    fireEvent.change(screen.getByTestId('protein-weight'), { target: { value: '154.3236' } });
    fireEvent.click(screen.getByTestId('protein-calculate'));
    expect(screen.getByTestId('protein-result').textContent).toContain('113');
    fireEvent.change(screen.getByTestId('protein-weight'), { target: { value: '' } });
    fireEvent.click(screen.getByTestId('protein-calculate'));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByTestId('protein-result')).not.toBeInTheDocument();
  });
});
