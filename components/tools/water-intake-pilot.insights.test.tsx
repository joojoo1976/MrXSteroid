import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import WaterIntakePilotTool from './water-intake-pilot';
import { withToolPreferences } from './tool-preferences.test-utils';

afterEach(() => cleanup());

function renderTool(locale: 'ar' | 'en' = 'en', unitSystem: 'metric' | 'imperial' = 'metric') {
  return render(withToolPreferences(<WaterIntakePilotTool />, locale, unitSystem));
}

async function enterWeight(weight: string) {
  fireEvent.change(screen.getByTestId('water-weight'), { target: { value: weight } });
  await screen.findByTestId('water-result');
}

describe('water input-driven scenarios, units and advice', () => {
  it('shows baseline, moderate and very-active values from the engine', async () => {
    renderTool();
    await enterWeight('70');

    expect(screen.getByTestId('water-scenario-1')).toHaveTextContent('2.45');
    expect(screen.getByTestId('water-scenario-1.2')).toHaveTextContent('2.5');
    expect(screen.getByTestId('water-scenario-1.4')).toHaveTextContent('2.55');
    expect(screen.getByTestId('water-scenario-1.2')).toHaveAttribute(
      'data-selected',
      'true'
    );
    expect(screen.getByTestId('water-interpretation')).toHaveTextContent(
      /not an individual requirement/i
    );
    expect(screen.getByTestId('water-caution')).toHaveTextContent(/pregnant/i);
  });

  it('adds US fluid ounces only when the Header measurement system is imperial', async () => {
    const view = renderTool('en', 'metric');
    await enterWeight('70');
    expect(screen.getByTestId('water-result')).not.toHaveTextContent(/fl oz/i);

    view.rerender(withToolPreferences(<WaterIntakePilotTool />, 'en', 'imperial'));
    await waitFor(() =>
      expect(screen.getByTestId('water-result')).toHaveTextContent(/85 US fl oz/)
    );
    expect(screen.getByTestId('water-result')).toHaveTextContent('2.5 L/day (2500 mL)');
  });

  it('does not show scenarios before a valid result', () => {
    renderTool();
    expect(screen.getByTestId('water-caution')).toBeInTheDocument();
    expect(screen.queryByTestId('water-scenarios')).toBeNull();
  });

  it('localizes the scenario headings in Arabic', async () => {
    renderTool('ar');
    await enterWeight('70');
    expect(screen.getByText('مقارنة مستويات النشاط عند وزنك الحالي')).toBeInTheDocument();
  });

  it('shows the user weight in Arabic imperial units, rounded, never the raw canonical value', async () => {
    renderTool('ar', 'imperial');
    fireEvent.change(screen.getByTestId('water-weight'), { target: { value: '154.3' } });
    await screen.findByTestId('water-result');

    const interpretation = screen.getByTestId('water-interpretation').textContent ?? '';
    expect(interpretation).toContain('154.3 رطل');
    expect(interpretation).not.toContain('69.989302691');
  });
});
