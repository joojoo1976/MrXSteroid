/**
 * components/tools/macro-pilot.remediation.test.tsx
 * R3.1 UI/accessibility remediation coverage.
 *
 * These tests deliberately fail against the pre-remediation pilot CSS/markup.
 */

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PreferencesContext, type PreferencesContextProps } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import MacroPilotTool from '@/components/tools/macro-pilot';

afterEach(() => cleanup());

const cssPath = join(process.cwd(), 'components/tools/macro-pilot.module.css');
const css = readFileSync(cssPath, 'utf8');

function renderPilot(language: 'en' | 'ar' = 'en') {
  return render(
    <PreferencesContext.Provider
      value={{
        language: language === 'ar' ? Language.AR : Language.EN,
        unitSystem: 'metric',
        theme: Theme.DARK,
        isRTL: language === 'ar',
      } as PreferencesContextProps}
    >
      <MacroPilotTool />
    </PreferencesContext.Provider>
  );
}

describe('R3.1 localized status announcement', () => {
  it('exposes the localized domain status as a polite live region', async () => {
    renderPilot('en');
    const status = await screen.findByTestId('macro-status');
    expect(status).toHaveAttribute('role', 'status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('Inputs incomplete');
  });

  it('announces the Arabic localized status in the Arabic RTL shell', async () => {
    renderPilot('ar');
    const status = await screen.findByTestId('macro-status');
    expect(status).toHaveAttribute('role', 'status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('المدخلات غير مكتملة');
    expect(document.querySelector('[data-tool-id="mrx.tool.macro"]')).toHaveAttribute('dir', 'rtl');
  });

  it('does not emit raw machine-state tokens in the localized live region', async () => {
    renderPilot('en');
    const status = await screen.findByTestId('macro-status');
    expect(status.textContent ?? '').not.toMatch(/INSUFFICIENT_FOR_SAFE_RESULT|NOT_AVAILABLE|FULL_/);
  });
});

describe('R3.1 V4 CSS coverage', () => {
  it('targets the actual V4 class tree', () => {
    expect(css).toContain('.genius-tool-template-v4');
    expect(css).toContain('.genius-tool-template-v4__header');
    expect(css).toContain('.genius-tool-template-v4__inputs');
    expect(css).toContain('.genius-tool-template-v4__results');
    expect(css).toContain('.genius-tool-template-v4__status');
  });

  it('does not style the obsolete V3 shell', () => {
    expect(css).not.toMatch(/\.genius-tool-template(?:\s|__|\.|:|,|\)|\{)/);
    expect(css).not.toContain('.genius-tool-template {');
  });

  it('hides the raw V4 status token region because the localized domain status is authoritative', () => {
    expect(css).toMatch(/\.genius-tool-template-v4__status[^}]*display:\s*none/s);
  });

  it('styles V4 inputs with high-contrast dark tokens and AA-legible text', () => {
    expect(css).toMatch(/\.genius-tool-template-v4__inputs\s+(input|select)/);
    expect(css).toMatch(/background[^;}]*hsl\(var\(--background\)\)/);
    expect(css).toMatch(/color[^;}]*hsl\(var\(--foreground\)\)/);
    expect(css).toMatch(/border[^;}]*hsl\(var\(--input\)\)/);
  });

  it('provides visible keyboard focus indicators for V4 interactive controls', () => {
    expect(css).toMatch(/\.genius-tool-template-v4__inputs\s+(input|select|button):focus-visible/);
    expect(css).toContain('outline: 2px solid hsl(var(--ring))');
  });

  it('has a mobile single-column responsive rule for the actual V4 tree', () => {
    expect(css).toMatch(/@media \(max-width:\s*40rem\)/);
    expect(css).toMatch(/@media \(max-width:\s*40rem\)[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)/s);
  });

  it('has a tablet layout that collapses below desktop without overflowing', () => {
    expect(css).toMatch(/@media \(min-width:\s*40rem\) and \(max-width:\s*64rem\)/);
    expect(css).toContain('overflow-x: clip');
  });
});
