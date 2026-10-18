/**
 * Tool-036 V4 — preview shell tests (gate C4, coherence scenario S1).
 *
 * S1 asks: when the user changes one declared input, do EVERY dependent
 * surfaces update together in the same act — weekly total, per-shot dose,
 * per-shot volume, the volume-zone guard, and the preference findings?
 * The shell owns no logic of its own, so the answer must be yes by
 * construction; this test pins it.
 *
 * Note: vitest.setup.ts replaces window.localStorage with no-op vi.fn()
 * stubs (for older suites). A real in-memory implementation is installed
 * here so persistence behaviour is genuinely exercised.
 */
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import Tool036V4Shell from './tool-036-v4-shell';
import { buildEnvelope } from '@/lib/tools/tool-036-v4/state/envelope';
import { applyAction, initialState } from '@/lib/tools/tool-036-v4/state/reducer';

const STORAGE_KEY = 'mrx.tool-036-v4.state';

/** A source state with one recorded event on dorso-l — used for export fixtures. */
function initialStateAr() {
  return applyAction(
    initialState('ar', 'Asia/Riyadh'),
    {
      type: 'event/add',
      event: {
        occurredAt: '2026-10-18T08:00:00+03:00',
        siteId: 'dorso-l',
        volumeMl: 1,
        doseMg: 125,
        compoundIds: ['testosterone-enanthate'],
      },
    },
    { now: '2026-10-18T10:00:00+03:00', idGen: () => 'evt-import-1' },
  );
}

/** Same wall-time format the shell's datetime-local input uses. */
function toInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function installMemoryStorage(): Map<string, string> {
  const map = new Map<string, string>();
  const impl = {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, String(v)),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    get length() {
      return map.size;
    },
    key: (i: number) => [...map.keys()][i] ?? null,
  };
  Object.defineProperty(window, 'localStorage', { value: impl, writable: true, configurable: true });
  return map;
}

let storageMap: Map<string, string>;

beforeEach(() => {
  storageMap = installMemoryStorage();
});

afterEach(() => {
  cleanup();
});

async function renderLoaded() {
  const result = render(<Tool036V4Shell />);
  await waitFor(() =>
    expect(screen.queryByTestId('ack-button') ?? screen.queryByTestId('weekly-mg')).toBeTruthy(),
  );
  if (screen.queryByTestId('ack-button')) {
    fireEvent.click(screen.getByTestId('ack-button'));
  }
  await waitFor(() => expect(screen.getByTestId('weekly-mg')).toBeTruthy());
  return result;
}

describe('V4 shell — coherence scenario S1', () => {
  it('one dose change updates weekly total, shot dose, volume and zone guard together', async () => {
    const { container } = await renderLoaded();

    // Declared default: 250 mg/wk, 2 injections, 250 mg/mL.
    expect(screen.getByTestId('weekly-mg').textContent).toContain('250');
    expect(screen.getAllByTestId('shot-dose')[0].textContent).toContain('125');
    expect(screen.getAllByTestId('shot-volume')[0].textContent).toContain('0.5');
    expect(container.querySelectorAll('[data-zone="yellow"]')).toHaveLength(0);
    expect(screen.getByTestId('no-findings')).toBeTruthy();

    // A single declared change — 2000 mg/wk => 1000 mg per shot => 4 mL.
    fireEvent.change(screen.getByLabelText('الجرعة الأسبوعية'), { target: { value: '2000' } });

    expect(screen.getByTestId('weekly-mg').textContent).toContain('2000');
    expect(screen.getAllByTestId('shot-dose')[0].textContent).toContain('1000');
    expect(screen.getAllByTestId('shot-volume')[0].textContent).toContain('4');
    // The guard re-evaluated in the same act: 4 mL is beyond the routine band.
    expect(container.querySelectorAll('[data-zone="yellow"]').length).toBeGreaterThan(0);
    // The preference surface is derived from the same state — still coherent.
    expect(screen.getByTestId('no-findings')).toBeTruthy();
  });

  it('the change reaches persisted storage in the same interaction', async () => {
    await renderLoaded();
    fireEvent.change(screen.getByLabelText('الجرعة الأسبوعية'), { target: { value: '900' } });
    const stored = JSON.parse(storageMap.get(STORAGE_KEY)!);
    expect(stored.schemaVersion).toBe(2);
    expect(stored.plan.compounds[0].weeklyDoseMg).toBe(900);
  });

  it('a reload restores the persisted plan (continuity through the UI)', async () => {
    await renderLoaded();
    fireEvent.change(screen.getByLabelText('الجرعة الأسبوعية'), { target: { value: '900' } });
    cleanup();
    await renderLoaded();
    expect(screen.getByTestId('weekly-mg').textContent).toContain('900');
  });
});

describe('V4 shell — decision R2 (silence is stated, never inferred)', () => {
  it('with no recorded events every site says «لا توجد بيانات استخدام مسجّلة»', async () => {
    await renderLoaded();
    expect(screen.getAllByText('لا توجد بيانات استخدام مسجّلة')).toHaveLength(8);
  });

  it('no readiness wording or healing-day inference appears anywhere', async () => {
    const { container } = await renderLoaded();
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/جاهز|الالتئام|آمن للاستخدام/);
  });
});

describe('V4 shell — drift truthfulness (scenario S2)', () => {
  it('logging an actual 7h after its slot reports «متأخر» with the declared delta', async () => {
    await renderLoaded();

    // Take a scheduled slot from the rendered proposal (the first row).
    const scheduledIso = document.querySelector('[data-testid="shot-row"]')!.getAttribute(
      'data-scheduled-at',
    )!;
    // Log an actual 7h later — beyond the 6h default tolerance, inside 24h.
    const lateAt = new Date(Date.parse(scheduledIso) + 7 * 3_600_000);
    fireEvent.change(screen.getByLabelText('موعد الحقن الفعلي'), {
      target: { value: toInputValue(lateAt) },
    });
    fireEvent.click(screen.getByText('تسجيل'));

    expect(screen.getByTestId('drift-status-late')).toBeTruthy();
    expect(screen.getByTestId('drift-delta').textContent).toContain('7');
    // The declared rules are visible next to the report — no composite score.
    const rules = screen.getByTestId('declared-rules').textContent ?? '';
    expect(rules).toContain('±24');
    expect(rules).toContain('لا توجد درجة مركّبة');
    expect(screen.getByTestId('drift-summary').textContent).toContain('متأخر: 1');
  });

  it('the log form refuses an empty/non-positive volume with an explicit message', async () => {
    await renderLoaded();
    // `min=0.01` already blocks typed zeros natively; the handler's own guard
    // covers what native validation lets through (an empty field).
    fireEvent.change(screen.getByLabelText('الحجم بالمل'), { target: { value: '' } });
    fireEvent.click(screen.getByText('تسجيل'));
    expect(screen.getByTestId('log-error').textContent).toContain('أرقامًا موجبة');
  });
});

describe('V4 shell — transfer round trip (scenario S4 via UI)', () => {
  it('an imported envelope makes a silent site state its recorded usage', async () => {
    const source = initialStateAr();
    const envelope = await buildEnvelope(source, new Date().toISOString());

    const { container } = await renderLoaded();
    // Before: dorso-l is silent (decision R2).
    expect(screen.getByTestId('no-usage-dorso-l')).toBeTruthy();

    const file = new File([JSON.stringify(envelope)], 'backup.json', {
      type: 'application/json',
    });
    fireEvent.change(screen.getByLabelText('استيراد ملف JSON'), {
      target: { files: [file] },
    });

    await waitFor(() => expect(screen.getByTestId('transfer-notice')).toBeTruthy());
    expect(screen.getByTestId('transfer-notice').textContent).toContain('تم استيراد 1');
    // The imported fact reached the usage surface: silence became a record.
    expect(screen.queryByTestId('no-usage-dorso-l')).toBeNull();
    expect(container.textContent).toContain('منذ');
  });

  it('a tampered file is rejected with its Arabic reason and changes nothing', async () => {
    const source = initialStateAr();
    const envelope = await buildEnvelope(source, new Date().toISOString());
    envelope.payload.events[0].doseMg = 999; // checksum now fails

    await renderLoaded();
    const file = new File([JSON.stringify(envelope)], 'tampered.json', {
      type: 'application/json',
    });
    fireEvent.change(screen.getByLabelText('استيراد ملف JSON'), {
      target: { files: [file] },
    });

    await waitFor(() => expect(screen.getByTestId('transfer-errors')).toBeTruthy());
    expect(screen.getByTestId('transfer-errors').textContent).toContain('بصمة التحقق');
    // Nothing changed: the site is still silent.
    expect(screen.getByTestId('no-usage-dorso-l')).toBeTruthy();
  });
});

describe('V4 shell — complete wipe leaves no key (decision D5 / R7)', () => {
  it('a full delete removes every tool key, keeps foreign keys, and no re-render resurrects it', async () => {
    storageMap.set('mrx.keep', 'belongs-to-another-tool');
    const { rerender } = await renderLoaded();

    // Record one actual so there is real health data to wipe.
    fireEvent.click(screen.getByText('تسجيل'));
    // The log form defaults to the first declared site (ventro-l); the recorded
    // fact must replace that site's silence before we wipe it.
    await waitFor(() => expect(screen.queryByTestId('no-usage-ventro-l')).toBeNull());
    expect(JSON.parse(storageMap.get(STORAGE_KEY)!).events).toHaveLength(1);

    fireEvent.click(screen.getByTestId('delete-arm'));
    fireEvent.click(screen.getByTestId('delete-confirm'));

    await waitFor(() => expect(screen.getByTestId('ack-gate')).toBeTruthy());
    expect(screen.getByTestId('delete-notice').textContent).toContain('حُذفت');

    // Not one key in the tool's namespace remains — the acknowledgment included.
    expect([...storageMap.keys()].filter((k) => k.startsWith('mrx.tool-036-v4.'))).toEqual([]);
    expect(storageMap.has(STORAGE_KEY)).toBe(false);
    // Foreign data is never touched.
    expect(storageMap.get('mrx.keep')).toBe('belongs-to-another-tool');

    // Re-rendering the still-open shell must not write the key back.
    rerender(<Tool036V4Shell />);
    await waitFor(() => expect(screen.getByTestId('ack-gate')).toBeTruthy());
    expect(storageMap.has(STORAGE_KEY)).toBe(false);
  });
});

describe('V4 shell — acknowledgment gate (decision D5)', () => {
  it('the tool is not usable before the acknowledgment is accepted', async () => {
    render(<Tool036V4Shell />);
    await waitFor(() => expect(screen.getByTestId('ack-gate')).toBeTruthy());
    expect(screen.queryByTestId('weekly-mg')).toBeNull();
    expect(screen.queryByTestId('log-form')).toBeNull();
    const gateText = screen.getByTestId('ack-gate').textContent ?? '';
    expect(gateText).toContain('لا تشخيص');
    expect(gateText).toContain('حذفها كاملة');
  });

  it('a first visit writes nothing before the acknowledgment is accepted', async () => {
    render(<Tool036V4Shell />);
    await waitFor(() => expect(screen.getByTestId('ack-button')).toBeTruthy());
    // No consent yet → no key in the tool's namespace at all.
    expect([...storageMap.keys()].filter((k) => k.startsWith('mrx.tool-036-v4.'))).toEqual([]);
    fireEvent.click(screen.getByTestId('ack-button'));
    await waitFor(() => expect(screen.getByTestId('weekly-mg')).toBeTruthy());
    expect(storageMap.has(STORAGE_KEY)).toBe(true);
  });

  it('accepting stores the acknowledgment locally and unlocks the tool', async () => {
    render(<Tool036V4Shell />);
    await waitFor(() => expect(screen.getByTestId('ack-button')).toBeTruthy());
    fireEvent.click(screen.getByTestId('ack-button'));
    await waitFor(() => expect(screen.getByTestId('weekly-mg')).toBeTruthy());

    const stored = JSON.parse(storageMap.get(STORAGE_KEY)!);
    expect(typeof stored.prefs.acknowledgedAt).toBe('string');
  });

  it('a later visit skips the gate (acknowledgment persisted)', async () => {
    render(<Tool036V4Shell />);
    await waitFor(() => expect(screen.getByTestId('ack-button')).toBeTruthy());
    fireEvent.click(screen.getByTestId('ack-button'));
    await waitFor(() => expect(screen.getByTestId('weekly-mg')).toBeTruthy());
    cleanup();

    render(<Tool036V4Shell />);
    await waitFor(() => expect(screen.getByTestId('weekly-mg')).toBeTruthy());
    expect(screen.queryByTestId('ack-gate')).toBeNull();
  });
});

describe('V4 shell — reliability & privacy (scenario S5)', () => {
  it('no network request fires across a full interaction cycle, including export', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const createObjectURL = vi.fn(() => 'blob:test');
    Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, configurable: true });
    Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), configurable: true });

    await renderLoaded();
    fireEvent.change(screen.getByLabelText('الجرعة الأسبوعية'), { target: { value: '400' } });
    fireEvent.click(screen.getByText('تسجيل'));
    fireEvent.click(screen.getByText('تصدير JSON (الظرف المنظّم)'));
    await waitFor(() => expect(screen.getByTestId('transfer-notice')).toBeTruthy());
    fireEvent.click(screen.getByText('تصدير FHIR (للتصدير فقط)'));
    await waitFor(() =>
      expect(screen.getByTestId('transfer-notice').textContent).toContain('FHIR'),
    );

    expect(createObjectURL).toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('the privacy section states local-only storage and verifiable deletion', async () => {
    await renderLoaded();
    const text = screen.getByTestId('privacy-section').textContent ?? '';
    expect(text).toContain('لا تُرسل إلى أي شبكة');
    expect(text).toContain('حذف كامل');
    expect(text).toContain('مفتاح واحد');
  });
});

describe('V4 shell — surface identity', () => {
  it('renders RTL Arabic with an explicit non-medical scope notice', async () => {
    const { container } = await renderLoaded();
    const root = container.querySelector('[dir="rtl"]');
    expect(root).toBeTruthy();
    expect(root!.getAttribute('lang')).toBe('ar');
    expect(container.textContent).toContain('ليست استشارة طبية');
  });

  it('every cited rule exposes source, confidence and applicability', async () => {
    const { container } = await renderLoaded();
    const cites = container.querySelectorAll('[data-testid^="rule-"]');
    expect(cites.length).toBeGreaterThan(0);
    for (const cite of cites) {
      const text = cite.textContent ?? '';
      expect(text).toContain('المصدر:');
      expect(text).toContain('الثقة:');
      expect(text).toContain('النطاق:');
    }
  });
});
