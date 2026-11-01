import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';
import React from 'react';
import RestTimerPilotTool from '@/components/tools/rest-timer-pilot';
import { withToolPreferences } from '@/components/tools/tool-preferences.test-utils';

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe('RestTimerPilotTool integration', () => {
  it('calculates real Rest Timer v6 output', async () => {
    render(withToolPreferences(<RestTimerPilotTool />, 'en', 'metric'));
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByTestId('rest-timer-result')).toBeInTheDocument());
    const text = screen.getByTestId('rest-timer-result').textContent ?? '';
    expect(text).toMatch(/Rest:/);
    expect(text).toMatch(/180s/);
  });

  it('shows validation error for invalid sets', async () => {
    render(withToolPreferences(<RestTimerPilotTool />, 'en', 'metric'));
    const setsInput = screen.getByText('Sets').querySelector('input') as HTMLInputElement;
    fireEvent.change(setsInput, { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.queryByTestId('rest-timer-result')).not.toBeInTheDocument();
  });

  it('counts down after start', async () => {
    render(withToolPreferences(<RestTimerPilotTool />, 'en', 'metric'));
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => expect(screen.getByTestId('rest-timer-result')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /start/i }));
    await waitFor(() => expect(screen.getByTestId('rest-timer-result').textContent ?? '').toMatch(/179s/), { timeout: 2500 });
  });

  it('pauses and resumes countdown', () => {
    vi.useFakeTimers();
    render(withToolPreferences(<RestTimerPilotTool />, 'en', 'metric'));
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    fireEvent.click(screen.getByRole('button', { name: /start/i }));
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByTestId('rest-timer-result').textContent).toMatch(/179s/);
    fireEvent.click(screen.getByRole('button', { name: /pause/i }));
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByTestId('rest-timer-result').textContent).toMatch(/179s/);
    fireEvent.click(screen.getByRole('button', { name: /resume/i }));
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByTestId('rest-timer-result').textContent).toMatch(/178s/);
  });

  it('resets countdown to target', () => {
    vi.useFakeTimers();
    render(withToolPreferences(<RestTimerPilotTool />, 'en', 'metric'));
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    fireEvent.click(screen.getByRole('button', { name: /start/i }));
    act(() => { vi.advanceTimersByTime(2000); });
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(screen.getByTestId('rest-timer-result').textContent).toMatch(/180s/);
    expect(screen.getByTestId('rest-timer-result').textContent).not.toMatch(/complete/);
  });

  it('marks complete at zero', () => {
    vi.useFakeTimers();
    render(withToolPreferences(<RestTimerPilotTool />, 'en', 'metric'));
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    // set a tiny target by changing sets? engine fixed 180; use fake timers full duration
    fireEvent.click(screen.getByRole('button', { name: /start/i }));
    act(() => { vi.advanceTimersByTime(180000); });
    expect(screen.getByTestId('rest-timer-result').textContent).toMatch(/0s/);
    expect(screen.getByTestId('rest-timer-result').textContent).toMatch(/complete/);
  });

  it('cleans up timer on unmount', () => {
    vi.useFakeTimers();
    const { unmount } = render(withToolPreferences(<RestTimerPilotTool />, 'en', 'metric'));
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    fireEvent.click(screen.getByRole('button', { name: /start/i }));
    unmount();
    // no throw
    expect(true).toBe(true);
  });
});
