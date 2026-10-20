/**
 * components/tools/tool-036-injection-schedule.hydration.test.tsx
 * ───────────────────────────────────────────────────────────────────────────
 * G-P11 — hydration determinism for the time-dependent countdown.
 *
 * Background (measured React #418)
 * --------------------------------
 * `tool-036-injection-schedule.tsx` renders a countdown to the next shot day:
 *
 *     const [now, setNow] = useState<number>(() => Date.now());
 *     const nowMs = dayIndex * 864e5 + h * 3600e3 + m * 60e3 + s * 1e3;
 *     const countdownText = ...formatCountdown(nextInjection(nowMs, shotDays).msRemaining)
 *
 * `formatCountdown` floors to whole minutes, so the rendered text changes at
 * every minute boundary. The server rendered it at server time and the client
 * recomputed it from the client clock. When network latency straddled a minute
 * boundary the two disagreed and React reported error #418 ("text content does
 * not match"). This was observed on the Vercel Preview (network latency, real
 * wall-clock gap) and not on `next start` on the same machine (sub-millisecond
 * TTFB, same minute) — which is exactly why the earlier report appeared to
 * contradict itself.
 *
 * Why `renderToString` and not `render()`
 * ---------------------------------------
 * React Testing Library's `render()` wraps in `act()` and therefore FLUSHES the
 * mount effect (`setNow(Date.now())`) before the assertion runs, so it measures
 * the *post-mount* value, never the first paint. `renderToString` runs the real
 * server path: initial state, no effects. Comparing two `renderToString` calls
 * with clocks one minute apart is the exact "server render vs first client
 * render" comparison that hydration performs, so it is the honest instrument
 * for this defect.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { render, screen, cleanup } from '@testing-library/react';
import Tool036InjectionSchedule from './tool-036-injection-schedule';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

/** Extract the text inside `data-testid="next-injection"`. */
function firstRenderCountdown(isoInstant: string): string {
  vi.spyOn(Date, 'now').mockReturnValue(new Date(isoInstant).getTime());
  const html = renderToString(<Tool036InjectionSchedule />);
  const m = html.match(/data-testid="next-injection"[^>]*>([^<]*)</);
  return m ? m[1] : '<not-found>';
}

describe('tool-036 G-P11 — time-dependent countdown is hydration deterministic', () => {
  it('renders the same next-injection markup whenever it is rendered in the same minute', () => {
    vi.spyOn(Date, 'now').mockReturnValue(new Date('2026-10-20T12:00:10.000Z').getTime());
    const a = renderToString(<Tool036InjectionSchedule />);
    vi.restoreAllMocks();
    vi.spyOn(Date, 'now').mockReturnValue(new Date('2026-10-20T12:00:40.000Z').getTime());
    const b = renderToString(<Tool036InjectionSchedule />);
    expect(a).toBe(b);
  });

  it('does not bake the wall clock into the first render (SSR == first client render)', () => {
    // A one-minute jump between "server" and "client" must not change the
    // first-render markup: that is precisely what caused React #418.
    const before = firstRenderCountdown('2026-10-20T12:00:59.999Z');
    vi.restoreAllMocks();
    const after = firstRenderCountdown('2026-10-20T12:01:00.001Z');

    expect(before).toBe(after);
    // And the deterministic first paint must not be a live countdown value.
    expect(before).not.toMatch(/\d/);
  });

  it('still shows a real, live countdown after mount', () => {
    vi.spyOn(Date, 'now').mockReturnValue(new Date('2026-10-20T12:00:00.000Z').getTime());
    render(<Tool036InjectionSchedule />);
    // After the mount effect the value is live and contains digits.
    const text = screen.getByTestId('next-injection').textContent ?? '';
    expect(text).toMatch(/\d/);
    expect(text).not.toBe('—');
  });
});
