import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import ProteinNeedsPilotTool from './protein-needs-pilot';
import { withToolPreferences } from './tool-preferences.test-utils';

afterEach(() => cleanup());

function renderTool(locale: 'ar' | 'en' = 'en', unitSystem: 'metric' | 'imperial' = 'metric') {
  return render(withToolPreferences(<ProteinNeedsPilotTool />, locale, unitSystem));
}

async function enterWeight(weight: string) {
  fireEvent.change(screen.getByTestId('protein-weight'), { target: { value: weight } });
  await screen.findByTestId('protein-result');
}

describe('protein input-driven scenarios and advice', () => {
  it('shows maintain, bulk and cut values recalculated by the engine', async () => {
    renderTool();
    await enterWeight('70');

    expect(screen.getByTestId('protein-scenario-maintain')).toHaveTextContent('113');
    expect(screen.getByTestId('protein-scenario-bulk')).toHaveTextContent('141');
    expect(screen.getByTestId('protein-scenario-cut')).toHaveTextContent('156');
    expect(screen.getByTestId('protein-scenario-maintain')).toHaveAttribute(
      'data-selected',
      'true'
    );
    expect(screen.getByTestId('protein-interpretation')).toHaveTextContent(/113/);
    expect(screen.getByTestId('protein-interpretation')).toHaveTextContent(/141/);
    expect(screen.getByTestId('protein-interpretation')).toHaveTextContent(/156/);
  });

  it('changes the recommendation when the selected goal changes', async () => {
    renderTool();
    await enterWeight('70');

    expect(screen.getByTestId('protein-advice')).toHaveTextContent(/across meals/i);

    fireEvent.change(screen.getByTestId('protein-goal'), { target: { value: 'cut' } });

    await waitFor(() =>
      expect(screen.getByTestId('protein-advice')).toHaveTextContent(/deficit/i)
    );
    expect(screen.getByTestId('protein-scenario-cut')).toHaveAttribute(
      'data-selected',
      'true'
    );
  });

  it('shows the individual-advice caution and no scenarios before a valid result', () => {
    renderTool();
    expect(screen.getByTestId('protein-caution')).toHaveTextContent(/kidney/i);
    expect(screen.queryByTestId('protein-scenarios')).toBeNull();
  });

  it('localizes the scenario headings in Arabic', async () => {
    renderTool('ar');
    await enterWeight('70');
    expect(screen.getByText('مقارنة الأهداف عند وزنك ونشاطك الحاليين')).toBeInTheDocument();
  });

  it('shows the user weight in the active display units, rounded, never the raw canonical value', async () => {
    renderTool('en', 'imperial');
    fireEvent.change(screen.getByTestId('protein-weight'), { target: { value: '154.3' } });
    await screen.findByTestId('protein-result');

    const interpretation = screen.getByTestId('protein-interpretation').textContent ?? '';
    expect(interpretation).toContain('154.3 lb');
    expect(interpretation).not.toContain('69.989302691');
  });
});
