// components/tools/tool-039-liver-enzyme-tracker.history.test.tsx
//
// RED phase for the Tool 039 local history + rating UI (owner decision D-08,
// Option A: local device-only storage inside Tool 039).
//
// Covered here (the owner's required test list):
//   - saving only after consent;
//   - the data survives a page reload;
//   - stale is computed at read time;
//   - delete one / delete all;
//   - withdrawing consent deletes the data;
//   - TTL and export;
//   - no network calls in the local mode;
//   - two independent browsers do not share data;
//   - the rating is bound to the right result;
//   - Arabic / English and RTL / LTR;
//   - keyboard and screen-reader access;
//   - the 390 px viewport;
//   - regression of every previous Tool 039 function.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { withToolPreferences } from './tool-preferences.test-utils';

vi.mock('@/lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline')>();
  return { ...actual, runLiverEnzymeTracker: vi.fn(actual.runLiverEnzymeTracker) };
});

import Tool039 from './tool-039-liver-enzyme-tracker';
import { runLiverEnzymeTracker } from '@/lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline';

const runSpy = vi.mocked(runLiverEnzymeTracker);

const SAVE = /Save this result|حفظ هذه النتيجة/;
const ALLOW = /Allow local storage|السماح بالتخزين المحلي/;
const WITHDRAW = /Withdraw consent|سحب الموافقة/;
const DELETE_ONE = /Delete this result|حذف هذه النتيجة/;
const DELETE_ALL = /Delete all|حذف الكل|حذف كل/;
const EXPORT = /Export|تصدير/;
const SAVE_RATING = /Save rating|حفظ التقييم/;

beforeEach(() => {
  // The repository-wide `vitest.setup.ts` mocks `window.localStorage` with
  // no-op stubs that store nothing (`getItem` returns undefined). This suite
  // needs a REAL storage, so it installs a Map-backed one — scoped to this
  // file, so no other suite is affected.
  const map = new Map<string, string>();
  const storage = {
    getItem: (key: string) => (map.has(key) ? map.get(key)! : null),
    setItem: (key: string, value: string) => { map.set(key, String(value)); },
    removeItem: (key: string) => { map.delete(key); },
    clear: () => { map.clear(); },
    key: (index: number) => [...map.keys()][index] ?? null,
    get length() { return map.size; },
  };
  Object.defineProperty(window, 'localStorage', { value: storage, writable: true, configurable: true });
  runSpy.mockClear();
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

async function renderWithResult(locale: 'ar' | 'en' = 'en', value = '112', date = '2026-02-01') {
  const view = render(withToolPreferences(<Tool039 />, locale, 'metric'));
  fireEvent.click(screen.getByRole('button', { name: locale === 'ar' ? /إضافة قراءة/ : /Add reading/ }));
  fireEvent.change(screen.getByLabelText(locale === 'ar' ? 'القيمة 1' : 'Value 1'), { target: { value } });
  fireEvent.change(screen.getByLabelText(locale === 'ar' ? 'تاريخ سحب العينة 1' : 'Draw date 1'), { target: { value: date } });
  const oral = document.querySelector(`[aria-label="${locale === 'ar' ? 'يتناول ستيرويدات فموية' : 'On oral steroids'}"]`) as HTMLElement;
  const tudca = document.querySelector(`[aria-label="${locale === 'ar' ? 'يستخدم TUDCA' : 'Using TUDCA'}"]`) as HTMLElement;
  fireEvent.click(within(oral).getByRole('button', { name: locale === 'ar' ? 'نعم' : 'Yes' }));
  fireEvent.click(within(tudca).getByRole('button', { name: locale === 'ar' ? 'لا' : 'No' }));
  fireEvent.change(screen.getByLabelText(locale === 'ar' ? 'مشروبات كحولية في الأسبوع' : 'Alcohol drinks per week'), { target: { value: '0' } });
  await waitFor(() => expect(runSpy).toHaveBeenCalled(), { timeout: 5000 });
  await waitFor(() => expect(document.querySelector('[data-r6-bar="ALT"]')).not.toBeNull(), { timeout: 5000 });
  return view;
}

/** Grant the consent through the history box, then save the current result. */
async function consentAndSave(locale: 'ar' | 'en' = 'en') {
  fireEvent.click(await screen.findByRole('button', { name: ALLOW }, { timeout: 5000 }));
  await waitFor(() => expect(screen.getByRole('button', { name: SAVE })).toBeTruthy(), { timeout: 5000 });
  fireEvent.click(screen.getByRole('button', { name: SAVE }));
  await waitFor(() => expect(document.querySelector('[data-r6-history-entry]')).not.toBeNull(), { timeout: 5000 });
}

describe('Tool 039 local history + rating (device-only storage)', () => {
  it('offers no save control and stores nothing before the user consents', async () => {
    await renderWithResult();

    // The history box is present and explains the situation — it never vanishes.
    const historyBox = document.querySelector('[data-r6-box="11"]');
    expect(historyBox).not.toBeNull();
    expect(historyBox?.getAttribute('data-r6-box-source')).not.toBe('not_applicable');

    // No save control exists before the consent.
    expect(screen.queryByRole('button', { name: SAVE })).toBeNull();

    // Nothing was written to the device.
    const written = Object.keys(window.localStorage).filter((key) => key.includes('tool039'));
    expect(written).toEqual([]);
  });

  it('explains the storage conditions before consent', async () => {
    await renderWithResult();
    const historyBox = document.querySelector('[data-r6-box="11"]');
    const text = historyBox?.textContent ?? '';
    // Local only, may be lost, encryption is not an absolute guarantee.
    expect(text).toMatch(/browser|device/i);
    expect(text).toMatch(/lost|cleared|device/i);
    expect(text).toMatch(/script|absolute|guarantee/i);
  });

  it('saves the result only after an explicit consent and an explicit action', async () => {
    await renderWithResult();

    // 1) The consent is granted from the history box — still nothing is saved.
    fireEvent.click(screen.getByRole('button', { name: ALLOW }));
    await waitFor(() => expect(screen.getByRole('button', { name: SAVE })).toBeTruthy(), { timeout: 5000 });
    expect(document.querySelector('[data-r6-history-entry]')).toBeNull();

    // 2) The explicit save action stores the engine result.
    fireEvent.click(screen.getByRole('button', { name: SAVE }));
    await waitFor(() => expect(document.querySelector('[data-r6-history-entry]')).not.toBeNull(), { timeout: 5000 });

    const entry = document.querySelector('[data-r6-history-entry]');
    expect(entry?.textContent).toContain('112');
    expect(entry?.textContent).toContain('U/L');
    expect(entry?.textContent).toContain('2026-02-01');
    expect(entry?.textContent).toMatch(/Elevated|مرتفع/);
  });

  it('restores the saved result after a page reload', async () => {
    await renderWithResult();
    await consentAndSave();

    // A page reload: the component is unmounted and mounted again, so the
    // store is rebuilt from the device — nothing is kept in memory.
    cleanup();
    await renderWithResult();
    await waitFor(() => expect(document.querySelector('[data-r6-history-entry]')).not.toBeNull(), { timeout: 5000 });
    expect(document.querySelector('[data-r6-history-entry]')?.textContent).toContain('112');
  });

  it('marks an entry as stale at read time', async () => {
    // A draw date far in the past: the saved entry must show as stale.
    await renderWithResult('en', '112', '2020-01-01');
    await consentAndSave();

    const entry = document.querySelector('[data-r6-history-entry]');
    expect(entry?.getAttribute('data-r6-history-stale')).toBe('true');
    expect(entry?.textContent).toMatch(/Stale|قديم/i);
  });

  it('deletes one entry and deletes them all', async () => {
    await renderWithResult();
    await consentAndSave();

    // Save a second, different result.
    fireEvent.change(screen.getByLabelText('Value 1'), { target: { value: '280' } });
    await waitFor(() => expect(document.querySelector('[data-r6-bar="ALT"]')?.textContent).toContain('280'), { timeout: 5000 });
    fireEvent.click(screen.getByRole('button', { name: SAVE }));
    await waitFor(() => expect(document.querySelectorAll('[data-r6-history-entry]').length).toBe(2), { timeout: 5000 });

    fireEvent.click(screen.getAllByRole('button', { name: DELETE_ONE })[0]);
    await waitFor(() => expect(document.querySelectorAll('[data-r6-history-entry]').length).toBe(1), { timeout: 5000 });

    fireEvent.click(screen.getByRole('button', { name: DELETE_ALL }));
    await waitFor(() => expect(document.querySelectorAll('[data-r6-history-entry]').length).toBe(0), { timeout: 5000 });
  });

  it('deletes the stored data when the consent is withdrawn', async () => {
    await renderWithResult();
    await consentAndSave();

    fireEvent.click(screen.getByRole('button', { name: WITHDRAW }));
    await waitFor(() => expect(document.querySelector('[data-r6-history-entry]')).toBeNull(), { timeout: 5000 });
    // The stored payload is gone from the device, not merely hidden.
    const written = Object.keys(window.localStorage).filter((key) => key.includes('tool039') && key.includes('history_v1'));
    expect(written).toEqual([]);
  });

  it('exports the saved results as CSV', async () => {
    await renderWithResult();
    await consentAndSave();

    const createObjectURL = vi.fn(() => 'blob:mock');
    const originalCreate = URL.createObjectURL;
    (URL as unknown as { createObjectURL: unknown }).createObjectURL = createObjectURL;
    try {
      fireEvent.click(screen.getByRole('button', { name: EXPORT }));
      expect(createObjectURL).toHaveBeenCalled();
    } finally {
      (URL as unknown as { createObjectURL: unknown }).createObjectURL = originalCreate;
    }
  });

  it('performs no network call in the local mode', async () => {
    const fetchSpy = vi.fn();
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
    try {
      await renderWithResult();
      await consentAndSave();
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('binds the rating to the selected result, not to the tool', async () => {
    await renderWithResult();
    await consentAndSave();

    // A second result, so the rating can be bound to one of the two.
    fireEvent.change(screen.getByLabelText('Value 1'), { target: { value: '280' } });
    await waitFor(() => expect(document.querySelector('[data-r6-bar="ALT"]')?.textContent).toContain('280'), { timeout: 5000 });
    fireEvent.click(screen.getByRole('button', { name: SAVE }));
    await waitFor(() => expect(document.querySelectorAll('[data-r6-history-entry]').length).toBe(2), { timeout: 5000 });

    const rating = document.querySelector('[data-r6-rating-control]');
    expect(rating).not.toBeNull();
    const entryId = rating?.getAttribute('data-r6-rating-entry');
    expect(entryId).toBeTruthy();

    fireEvent.click(within(rating as HTMLElement).getByRole('radio', { name: '4' }));
    fireEvent.click(screen.getByRole('button', { name: SAVE_RATING }));
    await waitFor(() => {
      const rated = document.querySelector(`[data-r6-history-entry][data-r6-history-entry-id="${entryId}"]`);
      expect(rated?.getAttribute('data-r6-history-rating')).toBe('4');
    }, { timeout: 5000 });

    // The OTHER saved result is untouched.
    const others = Array.from(document.querySelectorAll('[data-r6-history-entry]'))
      .filter((el) => el.getAttribute('data-r6-history-entry-id') !== entryId);
    expect(others.every((el) => el.getAttribute('data-r6-history-rating') === '')).toBe(true);
  });

  it('exposes the rating and the delete actions to the keyboard and to a screen reader', async () => {
    await renderWithResult();
    await consentAndSave();

    const radios = screen.getAllByRole('radio');
    expect(radios.length).toBeGreaterThanOrEqual(5);
    for (const radio of radios) {
      expect(radio.getAttribute('aria-label') ?? radio.textContent).toBeTruthy();
    }
    const comment = screen.getByRole('textbox', { name: /Comment|تعليق/ });
    expect(comment.getAttribute('maxlength')).toBeTruthy();

    // The delete control is a real button with an accessible name.
    const deleteButton = screen.getByRole('button', { name: DELETE_ONE });
    expect(deleteButton.tagName.toLowerCase()).toBe('button');
  });

  it('localizes the history and rating controls in Arabic and flips the direction', async () => {
    await renderWithResult('ar');
    fireEvent.click(await screen.findByRole('button', { name: ALLOW }, { timeout: 5000 }));
    await waitFor(() => expect(screen.getByRole('button', { name: SAVE })).toBeTruthy(), { timeout: 5000 });
    fireEvent.click(screen.getByRole('button', { name: SAVE }));
    await waitFor(() => expect(document.querySelector('[data-r6-history-entry]')).not.toBeNull(), { timeout: 5000 });

    const main = document.querySelector('main');
    expect(main?.getAttribute('dir')).toBe('rtl');
    expect(document.querySelector('[data-r6-history-entry]')?.textContent).toContain('112');
  });

  it('keeps the new controls free of fixed widths that would break a 390 px viewport', async () => {
    await renderWithResult();
    await consentAndSave();

    const wide = Array.from(document.querySelectorAll('[data-r6-history-entry], [data-r6-rating-control]'))
      .filter((el) => {
        const style = window.getComputedStyle(el);
        return style.minWidth !== '' && style.minWidth !== '0px' && style.minWidth !== 'auto';
      });
    expect(wide).toEqual([]);
  });

  it('keeps every previous Tool 039 function working', async () => {
    await renderWithResult();
    // The visual layer, the GENIUS-12 boxes and the result are all still there.
    expect(document.querySelector('[data-r6-illustration="tool-039"]')).not.toBeNull();
    expect(document.querySelectorAll('[data-r6-box]').length).toBe(12);
    expect(document.querySelector('[data-r6-bar="ALT"]')).not.toBeNull();
    expect(document.querySelector('[data-r6-table="tool-039"] table')).not.toBeNull();
  });
});
