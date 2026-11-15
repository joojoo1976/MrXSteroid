import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { withToolPreferences } from './tool-preferences.test-utils';

vi.mock('@/lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline')>();
  return { ...actual, runLiverEnzymeTracker: vi.fn(actual.runLiverEnzymeTracker) };
});

import Tool039 from './tool-039-liver-enzyme-tracker';
import { runLiverEnzymeTracker } from '@/lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline';
import { TOOL_039_HIGHLIGHT_EVENT } from '@/lib/tools/r6/tool-039-liver-enzyme-tracker-visual';

const runSpy = vi.mocked(runLiverEnzymeTracker);

afterEach(() => {
  cleanup();
  runSpy.mockClear();
});

async function renderWithResult(locale: 'ar' | 'en' = 'en') {
  const view = render(withToolPreferences(<Tool039 />, locale, 'metric'));
  fireEvent.click(screen.getByRole('button', { name: locale === 'ar' ? /إضافة قراءة/ : /Add reading/ }));
  fireEvent.change(screen.getByLabelText(locale === 'ar' ? 'القيمة 1' : 'Value 1'), { target: { value: '112' } });
  fireEvent.change(screen.getByLabelText(locale === 'ar' ? 'تاريخ سحب العينة 1' : 'Draw date 1'), { target: { value: '2026-02-01' } });
  const oralLabel = locale === 'ar' ? 'يتناول ستيرويدات فموية' : 'On oral steroids';
  const tudcaLabel = locale === 'ar' ? 'يستخدم TUDCA' : 'Using TUDCA';
  const oral = document.querySelector(`[aria-label="${oralLabel}"]`) as HTMLElement | null;
  const tudca = document.querySelector(`[aria-label="${tudcaLabel}"]`) as HTMLElement | null;
  fireEvent.click(within(oral as HTMLElement).getByRole('button', { name: locale === 'ar' ? 'نعم' : 'Yes' }));
  fireEvent.click(within(tudca as HTMLElement).getByRole('button', { name: locale === 'ar' ? 'لا' : 'No' }));
  fireEvent.change(screen.getByLabelText(locale === 'ar' ? 'مشروبات كحولية في الأسبوع' : 'Alcohol drinks per week'), { target: { value: '0' } });
  await waitFor(() => expect(runSpy).toHaveBeenCalled(), { timeout: 5000 });
  // The two-way highlight link (SPEC 7.2) travels through a window event whose
  // listener is registered by the GENIUS-12 component's effect. Wait for that
  // component to be on the page AND for its effect to have run, so the event is
  // never dispatched into a listener that does not exist yet.
  await waitFor(() => {
    expect(document.querySelector('[data-r6-highlight-target="primary-result"]')).not.toBeNull();
  }, { timeout: 5000 });
  await act(async () => {
    await Promise.resolve();
  });
  return view;
}

describe('Tool 039 visual layer — illustration, charts, tooltips and accessibility', () => {
  it('renders the explanatory illustration in the EMPTY state, before any reading is entered', () => {
    // Regression test for the owner-reported defect "the new illustration is not
    // visible": the visual section used to be rendered only when the pipeline
    // had produced a FULL result, so the first thing a visitor saw on the page
    // had no diagram at all.
    render(withToolPreferences(<Tool039 />, 'en', 'metric'));

    expect(document.querySelector('[data-r6-visual="tool-039"]')).not.toBeNull();
    expect(document.querySelector('[data-r6-illustration="tool-039"]')).not.toBeNull();
    expect(document.querySelector('[data-r6-illustration-text="tool-039"]')).not.toBeNull();
    expect(document.querySelector('[data-r6-illustration-mobile="tool-039"]')).not.toBeNull();
    expect(screen.getAllByText('How a liver-enzyme result is produced').length).toBeGreaterThan(0);

    // The five steps are present as real text in every variant.
    for (const step of ['You enter the lab readings', 'The tool validates the input', 'The engine compares with the reference limit', 'Status and safety flags are derived', 'Next steps are shown']) {
      expect(screen.getAllByText(new RegExp(step)).length).toBeGreaterThan(0);
    }
  });

  it('keeps the data-driven charts behind a real result and never fabricates values', () => {
    render(withToolPreferences(<Tool039 />, 'en', 'metric'));

    // No result yet -> no bar, no table, no invented number.
    expect(document.querySelector('[data-r6-bar]')).toBeNull();
    expect(document.querySelector('[data-r6-table="tool-039"]')).toBeNull();
    expect(document.querySelector('[data-r6-chart="line"]')).toBeNull();
    // ... but the explanation is still there.
    expect(document.querySelector('[data-r6-illustration="tool-039"]')).not.toBeNull();
  });

  it('prints each step number once in the textual equivalent of the diagram', () => {
    render(withToolPreferences(<Tool039 />, 'en', 'metric'));

    const text = document.querySelector('[data-r6-illustration-text="tool-039"]');
    const items = Array.from(text?.querySelectorAll('li') ?? []);
    expect(items).toHaveLength(5);
    // The step titles already carry their own number ("1. ... "), so the list
    // marker must not add a second one.
    expect(items[0].textContent?.trim().startsWith('1. 1.')).toBe(false);
    expect(items[0].textContent?.trim()).toMatch(/^1\.\s*You enter the lab readings/);
  });

  it('updates the charts when the input changes and never loops', async () => {
    await renderWithResult();
    expect(document.querySelector('[data-r6-bar="ALT"]')?.textContent).toContain('112 U/L');
    const callsAfterFirstResult = runSpy.mock.calls.length;

    // Change the value: the chart must follow the new pipeline output.
    fireEvent.change(screen.getByLabelText('Value 1'), { target: { value: '280' } });
    await waitFor(() => expect(document.querySelector('[data-r6-bar="ALT"]')?.textContent).toContain('280 U/L'), { timeout: 5000 });
    expect(document.querySelector('[data-r6-table="tool-039"] table')?.textContent).toContain('280');

    // No runaway loop: the number of pipeline calls stays bounded.
    expect(runSpy.mock.calls.length).toBeLessThan(callsAfterFirstResult + 12);
  });

  it('renders the same five steps as readable HTML text for a phone (mobile stack)', async () => {
    await renderWithResult();

    const mobile = document.querySelector('[data-r6-illustration-mobile="tool-039"]');
    expect(mobile).not.toBeNull();
    const items = Array.from(mobile?.querySelectorAll('li') ?? []);
    expect(items).toHaveLength(5);

    // The phone stack carries the same five steps as the desktop SVG.
    const svgTitles = Array.from(document.querySelectorAll('[data-r6-illustration="tool-039"] text'))
      .map((node) => node.textContent?.trim())
      .filter((value): value is string => Boolean(value) && value.startsWith('1.') || Boolean(value));
    expect(svgTitles.length).toBeGreaterThan(0);

    for (const item of items) {
      const title = item.querySelector('p');
      const body = item.querySelectorAll('p')[1];
      expect(title?.textContent?.trim().length ?? 0).toBeGreaterThan(5);
      expect(body?.textContent?.trim().length ?? 0).toBeGreaterThan(10);
      // Legible phone type sizes are declared, not scaled down by an SVG.
      expect(title?.className).toContain('text-[13px]');
      expect(body?.className).toContain('text-[12px]');
      // The step is keyboard reachable and announces its full meaning.
      const control = item.querySelector('[data-r6-diagram-step]');
      expect(control?.getAttribute('tabindex')).toBe('0');
      expect(control?.getAttribute('aria-label')?.length ?? 0).toBeGreaterThan(20);
    }
  });

  it('keeps the phone step interactive: focus opens the tooltip and links to the result box', async () => {
    await renderWithResult();

    const mobileStep = document.querySelector('[data-r6-diagram-step="step-5"]') as HTMLElement;
    expect(mobileStep).not.toBeNull();

    mobileStep.focus();
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip.textContent).toContain('Next steps are shown');

    const primary = document.querySelector('[data-r6-highlight-target="primary-result"]');
    await waitFor(() => expect(primary?.className).toContain('r6-highlighted'));
  });

  it('renders an explanatory illustration with a title, a caption and a text equivalent', async () => {
    await renderWithResult();

    const illustration = document.querySelector('[data-r6-illustration="tool-039"]');
    expect(illustration).not.toBeNull();
    expect(illustration?.getAttribute('role')).toBe('img');
    expect(illustration?.getAttribute('aria-labelledby')).toBe('liver-illustration-title');
    expect(illustration?.getAttribute('aria-describedby')).toBe('liver-illustration-desc');

    expect(screen.getByText('Illustrative diagram — it is not a scan, a measurement, a lab report or a diagnosis.')).toBeInTheDocument();
    expect(screen.getAllByText('How a liver-enzyme result is produced').length).toBeGreaterThan(0);

    // Textual equivalent of the diagram (same content, no SVG-only information).
    const textEquivalent = document.querySelector('[data-r6-illustration-text="tool-039"]');
    expect(textEquivalent?.textContent).toContain('You enter the lab readings');
    expect(textEquivalent?.textContent).toContain('The engine compares with the reference limit');
  });

  it('renders a bar/gauge per marker with the value, unit, reference limit and status', async () => {
    await renderWithResult();

    const bar = document.querySelector('[data-r6-bar="ALT"]');
    expect(bar).not.toBeNull();
    expect(bar?.textContent).toContain('ALT');
    expect(bar?.textContent).toContain('112 U/L');
    expect(bar?.textContent).toContain('2.00× ULN');
    expect(bar?.getAttribute('aria-label')).toContain('112 U/L');
    expect(bar?.getAttribute('aria-label')).toContain('2.00× ULN');
  });

  it('renders a dated line chart only when two dated readings of the same marker exist', async () => {
    const { unmount } = await renderWithResult();
    // Only one dated reading so far -> an honest empty state, not invented points.
    expect(document.querySelector('[data-r6-chart-empty="true"]')).not.toBeNull();
    expect(document.querySelector('[data-r6-chart="line"]')).toBeNull();
    unmount();

    await renderWithResult();
    // A second dated reading of the same marker produces a real line chart.
    fireEvent.click(screen.getByRole('button', { name: /Add reading/ }));
    fireEvent.change(screen.getByLabelText('Value 2'), { target: { value: '90' } });
    fireEvent.change(screen.getByLabelText('Draw date 2'), { target: { value: '2026-01-01' } });
    await waitFor(() => expect(document.querySelector('[data-r6-chart="line"]')).not.toBeNull(), { timeout: 5000 });

    const chart = document.querySelector('[data-r6-chart="line"]');
    expect(chart?.getAttribute('role')).toBe('img');
    expect(chart?.getAttribute('aria-label')).toContain('Line chart');
    expect(document.querySelectorAll('[data-r6-point]').length).toBe(2);
  });

  it('shows a text legend and a data table equal to the chart values (no colour-only meaning)', async () => {
    await renderWithResult();

    expect(document.querySelector('[data-r6-legend="tool-039"]')?.textContent).toContain('Legend');
    const table = document.querySelector('[data-r6-table="tool-039"] table');
    expect(table).not.toBeNull();
    expect(table?.textContent).toContain('ALT');
    expect(table?.textContent).toContain('112');
    expect(table?.textContent).toContain('56 U/L');
    expect(table?.textContent).toContain('2.00×');
  });

  it('documents why there is no pie/donut chart', async () => {
    await renderWithResult();
    const decision = document.querySelector('[data-r6-pie-decision="tool-039"]');
    expect(decision?.textContent).toContain('not parts of a common whole');
    expect(decision?.textContent).toContain('bar/gauge');
  });

  it('opens an element-specific tooltip on hover and closes it on mouse leave', async () => {
    await renderWithResult();
    const bar = document.querySelector('[data-r6-bar="ALT"]') as HTMLElement;

    fireEvent.mouseEnter(bar);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip.textContent).toContain('ALT');
    expect(tooltip.textContent).toContain('112');
    expect(tooltip.textContent).toContain('U/L');
    expect(tooltip.textContent).toContain('2.00× ULN');
    expect(tooltip.textContent).toContain('Meaning');
    expect(tooltip.textContent).toContain('Method');
    expect(tooltip.textContent).toContain('Source');

    fireEvent.mouseLeave(bar);
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  });

  it('gives different elements different tooltip content', async () => {
    await renderWithResult();
    const bar = document.querySelector('[data-r6-bar="ALT"]') as HTMLElement;
    fireEvent.mouseEnter(bar);
    const first = (await screen.findByRole('tooltip')).textContent ?? '';

    const illustrationNode = document.querySelector('[data-r6-illustration-node="step-1"]') as HTMLElement;
    fireEvent.mouseEnter(illustrationNode);
    const second = (await screen.findByRole('tooltip')).textContent ?? '';
    expect(second).not.toBe(first);
    expect(second).toContain('You enter the lab readings');
  });

  it('opens the tooltip on keyboard focus and closes it on Escape', async () => {
    await renderWithResult();
    const bar = document.querySelector('[data-r6-bar="ALT"]') as HTMLElement;

    bar.focus();
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  });

  it('supports keyboard activation (Enter) and an explicit accessible close action', async () => {
    await renderWithResult();
    const point = document.querySelector('[data-r6-illustration-node="step-1"]') as HTMLElement;

    fireEvent.keyDown(point, { key: 'Enter' });
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();

    const close = within(tooltip).getByRole('button', { name: 'Close the explanation' });
    fireEvent.click(close);
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  });

  it('supports touch/pointer activation without depending on hover', async () => {
    await renderWithResult();
    const bar = document.querySelector('[data-r6-bar="ALT"]') as HTMLElement;

    fireEvent.pointerDown(bar);
    fireEvent.click(bar);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip.textContent).toContain('112');

    // A second tap dismisses it.
    fireEvent.click(bar);
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  });

  it('keeps the tooltip inside the viewport', async () => {
    await renderWithResult();
    const bar = document.querySelector('[data-r6-bar="ALT"]') as HTMLElement;
    bar.getBoundingClientRect = () => ({
      left: 380, top: 700, right: 500, bottom: 740, width: 120, height: 40,
      x: 380, y: 700, toJSON: () => ({}),
    } as DOMRect);
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 420 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 760 });

    fireEvent.mouseEnter(bar);
    const tooltip = await screen.findByRole('tooltip');
    const left = Number((tooltip.style.left ?? '0').replace('px', ''));
    const top = Number((tooltip.style.top ?? '0').replace('px', ''));
    expect(left).toBeGreaterThanOrEqual(8);
    expect(left + 320).toBeLessThanOrEqual(420);
    expect(top).toBeGreaterThanOrEqual(8);
    expect(top).toBeLessThanOrEqual(760);
  });

  it('links the illustration node and the primary result box in both directions', async () => {
    await renderWithResult();
    const node = document.querySelector('[data-r6-illustration-node="step-5"]') as HTMLElement;
    const primary = document.querySelector('[data-r6-highlight-target="primary-result"]');

    expect(primary).not.toBeNull();
    fireEvent.focus(node);
    await waitFor(() => expect(primary?.className).toContain('r6-highlighted'));

    // Reverse direction: focusing the result box highlights the diagram node.
    fireEvent.focus(primary as HTMLElement);
    await waitFor(() => expect(node.getAttribute('class')).toContain('r6-highlighted'));
  });

  it('exposes accessible names, descriptions and a text alternative for every visual', async () => {
    await renderWithResult();

    const illustration = document.querySelector('[data-r6-illustration="tool-039"]');
    expect(illustration?.getAttribute('aria-labelledby')).toBeTruthy();
    expect(illustration?.getAttribute('aria-describedby')).toBeTruthy();
    expect(document.getElementById('liver-illustration-title')).not.toBeNull();
    expect(document.getElementById('liver-illustration-desc')).not.toBeNull();

    // Every bar is focusable and carries its own label (nothing is hover-only).
    for (const bar of Array.from(document.querySelectorAll('[data-r6-bar]'))) {
      expect(bar.getAttribute('aria-label')).toBeTruthy();
      expect(bar.tagName.toLowerCase()).toBe('button');
    }

    // The table is the textual equivalent of the charts.
    expect(document.querySelector('[data-r6-table="tool-039"] table caption')).not.toBeNull();
  });

  it('localizes every visual label and flips the direction with the locale', async () => {
    await renderWithResult('ar');
    const main = document.querySelector('main');
    expect(main?.getAttribute('dir')).toBe('rtl');
    expect(screen.getByText('شرح بصري ومخططات للبيانات')).toBeInTheDocument();
    expect(screen.getByText('مخطط توضيحي — ليس صورة مسح ولا قياسًا ولا تقرير مختبر ولا تشخيصًا.')).toBeInTheDocument();
    expect(document.querySelector('[data-r6-legend="tool-039"]')?.textContent).toContain('المفتاح');
  });

  it('keeps the visual layer free of fixed widths that would break a 390 px viewport', async () => {
    await renderWithResult();
    const section = document.querySelector('[data-r6-visual="tool-039"]') as HTMLElement;
    expect(section).not.toBeNull();

    const fixedWidths = Array.from(section.querySelectorAll('*')).filter((element) => {
      const style = (element as HTMLElement).style;
      return style && /^\d{3,}px$/.test(style.width);
    });
    expect(fixedWidths).toHaveLength(0);

    // The tooltip width is capped relative to the viewport, not fixed.
    // (jsdom's CSS parser drops `min()/calc()` values, so the cap is asserted
    // on the component source while the position itself is asserted above.)
    const bar = document.querySelector('[data-r6-bar="ALT"]') as HTMLElement;
    fireEvent.mouseEnter(bar);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip.getAttribute('style')).toContain('left');
    expect(tooltip.getAttribute('style')).toContain('top');
    const source = readFileSync(join(process.cwd(), 'components', 'tools', 'tool-039-liver-enzyme-tracker.visual.tsx'), 'utf8');
    expect(source).toContain('100vw');
  });

  it('disables non-essential motion when the user prefers reduced motion', async () => {
    await renderWithResult();
    const styles = Array.from(document.querySelectorAll('style'))
      .map((node) => node.textContent ?? '')
      .join('\n');
    expect(styles).toContain('prefers-reduced-motion: reduce');
    expect(styles).toContain("animation: none !important");
  });
});
