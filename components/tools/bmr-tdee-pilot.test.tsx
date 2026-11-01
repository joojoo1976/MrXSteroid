import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import BmrTdeePilotTool from './bmr-tdee-pilot';
import { withToolPreferences } from './tool-preferences.test-utils';

afterEach(() => cleanup());

describe('BmrTdeePilotTool', () => {
  it('calculates a result and supports Arabic RTL', () => {
    const { rerender } = render(withToolPreferences(<BmrTdeePilotTool />, 'en', 'metric'));
    fireEvent.change(screen.getByTestId('bmr-weight'), { target: { value: '70' } });
    fireEvent.change(screen.getByTestId('bmr-height'), { target: { value: '175' } });
    fireEvent.change(screen.getByTestId('bmr-age'), { target: { value: '30' } });
    fireEvent.click(screen.getByTestId('bmr-calculate'));
    expect(screen.getByTestId('bmr-result').textContent).toContain('1649');
    expect(screen.queryByRole('button', { name: 'عربي' })).not.toBeInTheDocument();
    rerender(withToolPreferences(<BmrTdeePilotTool />, 'ar', 'metric'));
    expect(document.querySelector('[data-tool-id="mrx.tool.bmr-tdee"]')?.getAttribute('dir')).toBe('rtl');
  });

  it('reports invalid or missing values and clears a previous result', () => {
    render(withToolPreferences(<BmrTdeePilotTool />, 'en', 'metric'));
    fireEvent.change(screen.getByTestId('bmr-weight'), { target: { value: '70' } });
    fireEvent.change(screen.getByTestId('bmr-height'), { target: { value: '175' } });
    fireEvent.change(screen.getByTestId('bmr-age'), { target: { value: '30' } });
    fireEvent.click(screen.getByTestId('bmr-calculate'));
    fireEvent.change(screen.getByTestId('bmr-height'), { target: { value: '' } });
    fireEvent.click(screen.getByTestId('bmr-calculate'));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByTestId('bmr-result')).not.toBeInTheDocument();
  });

  it('converts imperial weight and height before calculation', () => {
    render(withToolPreferences(<BmrTdeePilotTool />, 'en', 'imperial'));
    fireEvent.change(screen.getByTestId('bmr-weight'), { target: { value: '154.3236' } });
    fireEvent.change(screen.getByTestId('bmr-height'), { target: { value: '68.8976' } });
    fireEvent.change(screen.getByTestId('bmr-age'), { target: { value: '30' } });
    fireEvent.click(screen.getByTestId('bmr-calculate'));
    expect(screen.getByTestId('bmr-result').textContent).toContain('1649');
  });
});
