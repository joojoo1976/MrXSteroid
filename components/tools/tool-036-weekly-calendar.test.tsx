/**
 * Tool #036 V3 — weekly injection calendar (dnd-kit) contract.
 * Drag-and-drop must ALSO have explicit move buttons so touch users are covered.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Tool036WeeklyCalendar, { type CalendarDay } from './tool-036-weekly-calendar';

afterEach(() => {
  cleanup();
});

const DAYS: CalendarDay[] = [
  { dayIndex: 0, label: 'Sun', shots: [] },
  { dayIndex: 1, label: 'Mon', shots: [] },
  { dayIndex: 2, label: 'Tue', shots: [] },
  { dayIndex: 3, label: 'Wed', shots: [] },
  { dayIndex: 4, label: 'Thu', shots: [{ id: 's1', siteId: 'ventro-l', volumeMl: 3, mg: 250 }] },
  { dayIndex: 5, label: 'Fri', shots: [] },
  { dayIndex: 6, label: 'Sat', shots: [] },
];

function withDayZeroShot(): CalendarDay[] {
  return DAYS.map((d) => ({
    ...d,
    shots: d.dayIndex === 0 ? [{ id: 'edge0', siteId: 'dorso-l', volumeMl: 1, mg: 100 }] : d.shots,
  }));
}

describe('tool-036 V3 weekly calendar', () => {
  it('renders the 7 day columns', () => {
    render(<Tool036WeeklyCalendar days={DAYS} />);
    expect(screen.getByTestId('weekly-calendar')).toBeTruthy();
    for (let i = 0; i < 7; i += 1) {
      expect(screen.getByTestId(`cal-day-${i}`)).toBeTruthy();
    }
  });

  it('renders a chip per shot, labelled with its site and dose', () => {
    render(<Tool036WeeklyCalendar days={DAYS} />);
    const chip = screen.getByTestId('cal-chip-s1');
    expect(chip.textContent).toMatch(/ventro-l/i);
    expect(chip.textContent).toMatch(/250\s*mg/i);
    expect(chip.getAttribute('aria-label')).toBeTruthy();
  });

  it('moves a shot a day later and a day earlier via the touch buttons', () => {
    const onMove = vi.fn();
    render(<Tool036WeeklyCalendar days={DAYS} onMove={onMove} />);
    fireEvent.click(screen.getByTestId('cal-move-right-s1'));
    expect(onMove).toHaveBeenCalledWith('s1', 5);
    fireEvent.click(screen.getByTestId('cal-move-left-s1'));
    expect(onMove).toHaveBeenCalledWith('s1', 3);
  });

  it('caps the move buttons at the week edges', () => {
    render(<Tool036WeeklyCalendar days={withDayZeroShot()} />);
    expect(screen.queryByTestId('cal-move-left-edge0')).toBeNull();
    expect(screen.getByTestId('cal-move-right-edge0')).toBeTruthy();
  });

  it('zones an over-ceiling volume as red (above the 5 mL adult IM ceiling)', () => {
    const days = DAYS.map((d) => ({
      ...d,
      shots: d.dayIndex === 0 ? [{ id: 'big', siteId: 'deltoid-l', volumeMl: 6, mg: 100 }] : d.shots,
    }));
    render(<Tool036WeeklyCalendar days={days} />);
    expect(screen.getByTestId('cal-chip-big').getAttribute('data-zone')).toBe('red');
  });

  it('zones a modestly over-ceiling deltoid volume as yellow', () => {
    const days = DAYS.map((d) => ({
      ...d,
      shots: d.dayIndex === 0 ? [{ id: 'mid', siteId: 'deltoid-l', volumeMl: 1.5, mg: 50 }] : d.shots,
    }));
    render(<Tool036WeeklyCalendar days={days} />);
    expect(screen.getByTestId('cal-chip-mid').getAttribute('data-zone')).toBe('yellow');
  });
});
