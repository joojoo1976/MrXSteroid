/**
 * Tool #036 v2 — feature-flag gating safety test (P1).
 * Contract: NEXT_PUBLIC_FT_TOOL036_SUPREME_V2 defaults OFF => the v1 UI renders unchanged
 * (zero-risk rollback). Flag ON => LEVEL 1 (CHRONO-INJECT OS) renders.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function loadComponent(flag: string) {
  vi.stubEnv('NEXT_PUBLIC_FT_TOOL036_SUPREME_V2', flag);
  vi.resetModules();
  const mod = await import('./tool-036-injection-schedule');
  return mod.default;
}

describe('tool-036 feature-flag gating (P1 safety)', () => {
  it('flag OFF renders the v1 UI (no CHRONO-INJECT shell)', async () => {
    const C = await loadComponent('false');
    render(React.createElement(C));
    expect(screen.queryByText(/CHRONO-INJECT OS/)).toBeNull();
  });

  it('flag unset defaults to the v1 UI', async () => {
    const C = await loadComponent('');
    render(React.createElement(C));
    expect(screen.queryByText(/CHRONO-INJECT OS/)).toBeNull();
  });

  it('flag ON renders LEVEL 1 (CHRONO-INJECT OS)', async () => {
    const C = await loadComponent('true');
    render(React.createElement(C));
    expect(screen.getByText(/CHRONO-INJECT OS/)).toBeTruthy();
  });
});

describe('tool-036 LEVEL 2 + LEVEL 3 (flag ON, behind OFF-by-default flag)', () => {
  async function renderSupreme() {
    const C = await loadComponent('true');
    return render(React.createElement(C));
  }

  it('renders the three tabs [Core][Sites][Comfort]', async () => {
    await renderSupreme();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getByTestId('tab-core')).toBeTruthy();
    expect(screen.getByTestId('tab-sites')).toBeTruthy();
    expect(screen.getByTestId('tab-comfort')).toBeTruthy();
  });

  it('Sites tab shows a 2D SVG body map with 8 sites and >=44px tap targets', async () => {
    const { container } = await renderSupreme();
    fireEvent.click(screen.getByTestId('tab-sites'));
    expect(screen.getByTestId('body-map').tagName.toLowerCase()).toBe('svg');
    expect(screen.getAllByTestId(/^bodysite-/)).toHaveLength(8);
    const rects = container.querySelectorAll('g[data-testid^="bodysite-"] rect');
    expect(rects).toHaveLength(8);
    rects.forEach((r) => {
      expect(Number(r.getAttribute('width'))).toBeGreaterThanOrEqual(44);
      expect(Number(r.getAttribute('height'))).toBeGreaterThanOrEqual(44);
    });
  });

  it('Sites tab shows a 12-week rotation table', async () => {
    await renderSupreme();
    fireEvent.click(screen.getByTestId('tab-sites'));
    expect(screen.getByTestId('rotation-table')).toBeTruthy();
    expect(screen.getAllByTestId('rotation-row')).toHaveLength(12);
  });

  it('Sites tab shows the Gantt with mobile up/down arrows (no dnd-kit)', async () => {
    await renderSupreme();
    fireEvent.click(screen.getByTestId('tab-sites'));
    const up = screen.getAllByTestId(/^gantt-up-/);
    const down = screen.getAllByTestId(/^gantt-down-/);
    expect(up.length).toBeGreaterThan(0);
    expect(down.length).toBe(up.length);
    expect(up[0].textContent).toBe('↑');
    expect(down[0].textContent).toBe('↓');
  });

  it('Comfort tab logger: average of last 5 + healing window (7d / 14d)', async () => {
    await renderSupreme();
    fireEvent.click(screen.getByTestId('tab-comfort'));

    // healing: default 7 days => minimum-met, not yet optimal
    expect(screen.getByTestId('healing-state').textContent).toMatch(/meets the minimum/);
    fireEvent.change(screen.getByTestId('days-since'), { target: { value: '3' } });
    expect(screen.getByTestId('healing-state').textContent).toMatch(/wait at least 7 days/);
    fireEvent.change(screen.getByTestId('days-since'), { target: { value: '14' } });
    expect(screen.getByTestId('healing-state').textContent).toMatch(/optimal/);

    // logger: 8 then 2 => average 5.00
    fireEvent.change(screen.getByTestId('pain-input'), { target: { value: '8' } });
    fireEvent.click(screen.getByTestId('pain-add'));
    expect(screen.getByTestId('pain-average').textContent).toBe('8.00');
    fireEvent.change(screen.getByTestId('pain-input'), { target: { value: '2' } });
    fireEvent.click(screen.getByTestId('pain-add'));
    expect(screen.getByTestId('pain-average').textContent).toBe('5.00');
  });

  it('Comfort tab shows an Evidence Drawer with confidence-labelled evidence', async () => {
    await renderSupreme();
    fireEvent.click(screen.getByTestId('tab-comfort'));
    const drawer = screen.getByTestId('evidence-drawer');
    expect(drawer.tagName.toLowerCase()).toBe('details');
    expect(drawer.textContent).toMatch(/B0[124]/);
  });

  it('Accumulation chart is lazy: sentinel + skeleton, recharts not mounted', async () => {
    await renderSupreme();
    fireEvent.click(screen.getByTestId('tab-comfort'));
    expect(screen.getByTestId('chart-sentinel')).toBeTruthy();
    expect(screen.getByTestId('chart-skeleton')).toBeTruthy();
    expect(screen.getByTestId('chart-load')).toBeTruthy();
    // The heavy chunk must NOT be mounted until the observer/button fires.
    expect(screen.queryByTestId('accumulation-chart')).toBeNull();
  });

  it('AR is advertised as Coming Soon (zero AR library)', async () => {
    await renderSupreme();
    expect(screen.getByTestId('ar-badge').textContent).toMatch(/Coming Soon/);
  });
});
