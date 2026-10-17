/**
 * Tool #036 v2 — feature-flag gating safety test (P1).
 * Contract: NEXT_PUBLIC_FT_TOOL036_SUPREME_V2 defaults OFF => the v1 UI renders unchanged
 * (zero-risk rollback). Flag ON => LEVEL 1 (CHRONO-INJECT OS) renders.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

afterEach(() => {
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
