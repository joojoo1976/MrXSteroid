/**
 * Tool #036 SUPREME V3 — dark-OS dashboard contract.
 * The feature flag was removed on commit b913b104: V3 is the unconditional
 * surface for this route, so no test stubs NEXT_PUBLIC_FT_TOOL036_SUPREME_V2.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Tool036InjectionSchedule from './tool-036-injection-schedule';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('tool-036 SUPREME V3 dark-OS dashboard', () => {
  it('renders the V3 shell with the live weekly mg metric', () => {
    render(<Tool036InjectionSchedule />);
    expect(screen.getByTestId('v3-shell')).toBeTruthy();
    expect(screen.getByTestId('v3-title').textContent).toMatch(/CHRONO-INJECT/i);
    const mg = screen.getByTestId('weekly-mg').textContent ?? '';
    expect(mg).toMatch(/\d+\s*mg/);
  });

  it('renders a next-injection countdown', () => {
    render(<Tool036InjectionSchedule />);
    expect(screen.getByTestId('next-injection').textContent).toMatch(/\d/);
  });

  it('renders the 2D SVG body map with all 8 sites and >=44px targets', () => {
    const { container } = render(<Tool036InjectionSchedule />);
    expect(screen.getByTestId('body-map').tagName.toLowerCase()).toBe('svg');
    const sites = screen.getAllByTestId(/^bodysite-/);
    expect(sites).toHaveLength(8);
    const targets = container.querySelectorAll('g[data-testid^="bodysite-"] rect');
    expect(targets).toHaveLength(8);
    targets.forEach((r) => {
      expect(Number(r.getAttribute('width'))).toBeGreaterThanOrEqual(44);
      expect(Number(r.getAttribute('height'))).toBeGreaterThanOrEqual(44);
    });
  });

  it('exposes a volume-guard badge and its evidence tooltip', () => {
    render(<Tool036InjectionSchedule />);
    const badge = screen.getByTestId('volume-badge');
    expect(['green', 'yellow', 'red']).toContain(badge.getAttribute('data-zone'));
    expect(screen.getByTestId('volume-tooltip').tagName.toLowerCase()).toBe('details');
    expect((screen.getByTestId('volume-tooltip').textContent ?? '').length).toBeGreaterThan(10);
  });

  it('averages the last 5 comfort scores and reports the healing window', () => {
    render(<Tool036InjectionSchedule />);
    fireEvent.change(screen.getByTestId('pain-input'), { target: { value: '8' } });
    fireEvent.click(screen.getByTestId('pain-add'));
    expect(screen.getByTestId('pain-average').textContent).toBe('8.00');
    fireEvent.change(screen.getByTestId('pain-input'), { target: { value: '2' } });
    fireEvent.click(screen.getByTestId('pain-add'));
    expect(screen.getByTestId('pain-average').textContent).toBe('5.00');
    expect(screen.getByTestId('healing-state').textContent).toMatch(/7|14/);
  });

  it('mounts the lazy weekly calendar inside its placeholder', () => {
    render(<Tool036InjectionSchedule />);
    expect(screen.getByTestId('v3-calendar')).toBeTruthy();
  });

  it('lists this week in the Gantt and the auto rotation order', () => {
    render(<Tool036InjectionSchedule />);
    expect(screen.getByTestId('gantt-week')).toBeTruthy();
    const rotation = screen.getByTestId('rotation-plan').textContent ?? '';
    expect(rotation).toContain('dorso-l');
    expect(rotation).toContain('ventro-l');
  });

  it('exports to PDF through window.print only (no PDF library)', () => {
    const print = vi.fn();
    Object.defineProperty(window, 'print', { value: print, configurable: true });
    render(<Tool036InjectionSchedule />);
    fireEvent.click(screen.getByTestId('pdf-export'));
    expect(print).toHaveBeenCalledTimes(1);
  });
});
