'use client';

/**
 * Tool-036 V4 — preview shell (design-v4-ar.md §6, gate C4, coherence S1).
 *
 * Architecture (decision D1): this component owns NO scheduling, validation
 * or healing logic. It renders the ViewModel derived from pure functions:
 *   AppState -> compileProposal / checkRotation / siteRecencyFromEvents /
 *              classifyVolumeZone (V3 engine, read-only reuse)
 * so that changing one declared input (e.g. the weekly dose) updates every
 * derived surface in the same render — that is exactly what the S1 coherence
 * test asserts.
 *
 * Decision R2 is visible here: sites without recorded events display
 * «لا توجد بيانات استخدام مسجّلة» — never readiness, never a day count
 * inferred from silence.
 *
 * Decision R5/D5: state lives in localStorage only; no network path exists
 * in this component.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BODY_SITES,
  classifyVolumeZone,
  type Zone,
} from '@/lib/tools/engines/tool-036-injection-schedule';
import {
  APP_SCHEMA_VERSION,
  type AppState,
  type InjectionEvent,
  type PlanCompound,
  type Tool036Action,
} from '@/lib/tools/tool-036-v4/contracts';
import { applyAction, initialState } from '@/lib/tools/tool-036-v4/state/reducer';
import { loadState, saveState } from '@/lib/tools/tool-036-v4/state/storage';
import { compileProposal } from '@/lib/tools/tool-036-v4/engine/proposal';
import { checkRotation } from '@/lib/tools/tool-036-v4/engine/rotation-check';
import { siteRecencyFromEvents } from '@/lib/tools/tool-036-v4/engine/recency';
import { RULE_BY_ID } from '@/lib/tools/tool-036-v4/rules/registry';

const PREVIEW_WEEKS = 4;
const NO_USAGE_LABEL = 'لا توجد بيانات استخدام مسجّلة';

const ZONE_LABEL: Record<Zone, string> = {
  green: 'روتيني',
  yellow: 'محدود الدليل',
  red: 'يتجاوز الحد الشائع',
};

const SITE_LABEL = Object.fromEntries(BODY_SITES.map((s) => [s.siteId, s.labelAr]));

function safeTz(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

function makeCtx() {
  return {
    now: new Date().toISOString(),
    idGen: () =>
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  };
}

function formatInTz(iso: string, tz: string): string {
  return new Intl.DateTimeFormat('ar', {
    timeZone: tz,
    calendar: 'gregory',
    numberingSystem: 'latn',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

/** One cited rule, rendered with its full provenance (R7). */
function RuleCite({ ruleId }: { ruleId: string }) {
  const rule = RULE_BY_ID[ruleId];
  if (!rule) return null;
  return (
    <details className="mt-1 text-xs text-zinc-500" data-testid={`rule-${ruleId}`}>
      <summary className="cursor-pointer">المصدر والثقة ونطاق التطبيق</summary>
      <p className="mt-1">{rule.claimAr}</p>
      <p>
        المصدر: {rule.source.ref} · الثقة: {rule.source.confidence}
      </p>
      <p>النطاق: {rule.applicabilityAr}</p>
    </details>
  );
}

export default function Tool036V4Shell() {
  const [state, setState] = useState<AppState | null>(null);
  const [storageNotice, setStorageNotice] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadState();
    if (loaded.ok) {
      setState(loaded.state);
      return;
    }
    if (loaded.reason === 'invalid') {
      setStorageNotice('البيانات المخزنة غير صالحة — بدأنا بحالة جديدة.');
    }
    setState(initialState('ar', safeTz()));
  }, []);

  useEffect(() => {
    if (state) saveState(state);
  }, [state]);

  const dispatch = useCallback((action: Tool036Action) => {
    setState((prev) => (prev ? applyAction(prev, action, makeCtx()) : prev));
  }, []);

  const derived = useMemo(() => {
    if (!state) return null;
    const nowIso = new Date().toISOString();
    const proposal = compileProposal(state.plan, {
      fromIso: nowIso,
      weeks: PREVIEW_WEEKS,
      tz: state.prefs.tz,
      events: state.events,
    });
    const findings = checkRotation(state.events, proposal, state.prefs.restPreferenceDays);
    const recency = siteRecencyFromEvents(state.events, nowIso);
    const weeklyMg = state.plan.compounds.reduce((sum, c) => sum + c.weeklyDoseMg, 0);
    return { proposal, findings, recency, weeklyMg };
  }, [state]);

  if (!state || !derived) {
    return <div className="p-8 text-zinc-500">جارٍ تحميل المعاينة…</div>;
  }

  const updateCompound = (index: number, patch: Partial<PlanCompound>) => {
    const compounds = state.plan.compounds.map((c, i) => (i === index ? { ...c, ...patch } : c));
    dispatch({ type: 'plan/replace', plan: { ...state.plan, compounds } });
  };

  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-bold">
          Tool-036 V4 — معاينة تجريبية <span data-testid="schema-version">v{APP_SCHEMA_VERSION}</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          معاينة غير مفهرسة خارج الكتالوج. ليست استشارة طبية، ولا تشخيصًا ولا توصية جرعات. كل ادعاء
          صحّي هنا مربوط بمصدره ودرجة ثقته ونطاق تطبيقه.
        </p>
        {storageNotice && (
          <p className="mt-2 text-sm text-amber-400" data-testid="storage-notice">
            {storageNotice}
          </p>
        )}
      </header>

      <main className="grid gap-6 lg:grid-cols-2">
        {/* ---- Plan (intent) ---- */}
        <section aria-labelledby="plan-heading" className="rounded-xl border border-zinc-800 p-4">
          <h2 id="plan-heading" className="mb-3 font-semibold">
            الخطة (النية)
          </h2>
          <p className="mb-3 text-xs text-zinc-500">
            إجمالي الجرعة الأسبوعية:{' '}
            <span data-testid="weekly-mg" className="font-mono text-amber-300">
              {derived.weeklyMg} مجم
            </span>{' '}
            · المنطقة الزمنية: {state.prefs.tz} · ساعات التسامح:{' '}
            {state.prefs.lateToleranceHours} · تفضيل الراحة: {state.prefs.restPreferenceDays} أيام
          </p>
          {state.plan.compounds.map((compound, index) => (
            <div key={compound.compoundId} className="mb-3 grid grid-cols-3 gap-2">
              <label className="text-sm" htmlFor={`dose-${index}`}>
                الجرعة الأسبوعية (مجم)
                <input
                  id={`dose-${index}`}
                  aria-label="الجرعة الأسبوعية"
                  type="number"
                  min={1}
                  className="mt-1 w-full rounded bg-zinc-900 p-2 font-mono"
                  value={compound.weeklyDoseMg}
                  onChange={(e) => updateCompound(index, { weeklyDoseMg: Number(e.target.value) })}
                />
              </label>
              <label className="text-sm" htmlFor={`conc-${index}`}>
                التركيز (مجم/مل)
                <input
                  id={`conc-${index}`}
                  aria-label="التركيز"
                  type="number"
                  min={1}
                  className="mt-1 w-full rounded bg-zinc-900 p-2 font-mono"
                  value={compound.concentrationMgMl}
                  onChange={(e) =>
                    updateCompound(index, { concentrationMgMl: Number(e.target.value) })
                  }
                />
              </label>
              <label className="text-sm" htmlFor={`freq-${index}`}>
                عدد الحقن أسبوعيًا
                <select
                  id={`freq-${index}`}
                  aria-label="عدد الحقن أسبوعيًا"
                  className="mt-1 w-full rounded bg-zinc-900 p-2"
                  value={compound.injectionsPerWeek}
                  onChange={(e) =>
                    updateCompound(index, { injectionsPerWeek: Number(e.target.value) })
                  }
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ))}
          <label className="text-sm" htmlFor="rotation-mode">
            نمط تدوير المواقع (تنظيم جدولي فقط — ليس حكمًا طبيًا)
            <select
              id="rotation-mode"
              aria-label="نمط تدوير المواقع"
              className="mt-1 w-full rounded bg-zinc-900 p-2"
              value={state.plan.rotationMode}
              onChange={(e) =>
                dispatch({
                  type: 'plan/replace',
                  plan: {
                    ...state.plan,
                    rotationMode: e.target.value as AppState['plan']['rotationMode'],
                  },
                })
              }
            >
              <option value="least-recently-used">الأقل استخدامًا حديثًا</option>
              <option value="fixed-order">ترتيب ثابت</option>
            </select>
          </label>
          <RuleCite ruleId="rotation-rest-preference" />
        </section>

        {/* ---- Proposal (plan compiled to absolute time) ---- */}
        <section aria-labelledby="proposal-heading" className="rounded-xl border border-zinc-800 p-4">
          <h2 id="proposal-heading" className="mb-3 font-semibold">
            الجدول المقترح ({PREVIEW_WEEKS} أسابيع)
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-400">
                <th className="text-right">الموعد</th>
                <th className="text-right">الموقع</th>
                <th className="text-right">الجرعة</th>
                <th className="text-right">الحجم</th>
                <th className="text-right">المنطقة</th>
              </tr>
            </thead>
            <tbody>
              {derived.proposal.shots.map((shot) => {
                const { zone } = classifyVolumeZone(shot.volumeMl, shot.siteId);
                return (
                  <tr key={shot.id} data-testid="shot-row" data-zone={zone}>
                    <td>{formatInTz(shot.occurredAt, state.prefs.tz)}</td>
                    <td>{SITE_LABEL[shot.siteId]}</td>
                    <td className="font-mono" data-testid="shot-dose">
                      {shot.doseMg} مجم
                    </td>
                    <td className="font-mono" data-testid="shot-volume">
                      {shot.volumeMl} مل
                    </td>
                    <td>
                      <span
                        data-zone={zone}
                        className={
                          zone === 'green'
                            ? 'text-emerald-400'
                            : zone === 'yellow'
                              ? 'text-amber-400'
                              : 'text-red-400'
                        }
                      >
                        {ZONE_LABEL[zone]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <RuleCite ruleId="volume-zone-bands" />
          <RuleCite ruleId="site-ceiling-table" />
        </section>

        {/* ---- Recorded usage (R2: facts and silence) ---- */}
        <section aria-labelledby="usage-heading" className="rounded-xl border border-zinc-800 p-4">
          <h2 id="usage-heading" className="mb-3 font-semibold">
            سجل استخدام المواقع (وقائع مسجّلة فقط)
          </h2>
          <ul className="space-y-1 text-sm">
            {BODY_SITES.map((site) => {
              const entry = derived.recency[site.siteId as keyof typeof derived.recency];
              return (
                <li key={site.siteId} className="flex justify-between">
                  <span>{site.labelAr}</span>
                  {entry ? (
                    <span className="font-mono text-zinc-400">
                      {formatInTz(entry.lastUsedAt, state.prefs.tz)} — منذ {entry.daysSince} يوم
                    </span>
                  ) : (
                    <span className="text-zinc-600" data-testid={`no-usage-${site.siteId}`}>
                      {NO_USAGE_LABEL}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* ---- Preference findings (R3) ---- */}
        <section aria-labelledby="findings-heading" className="rounded-xl border border-zinc-800 p-4">
          <h2 id="findings-heading" className="mb-3 font-semibold">
            تفضيل الراحة الشخصي ({state.prefs.restPreferenceDays} أيام)
          </h2>
          {derived.findings.length === 0 ? (
            <p className="text-sm text-zinc-400" data-testid="no-findings">
              لا توجد تجاوزات للتفضيل في هذه النافذة.
            </p>
          ) : (
            <ul className="space-y-1 text-sm" data-testid="findings-list">
              {derived.findings.map((finding, index) => (
                <li key={`${finding.siteId}-${finding.atIso}-${index}`}>
                  {SITE_LABEL[finding.siteId]}: فرق {finding.gapDays} أيام (
                  {finding.prevOrigin === 'actual' ? 'مسجّل' : 'مخطط'} ←{' '}
                  {finding.origin === 'actual' ? 'مسجّل' : 'مخطط'}) — تجاوز تفضيل شخصي، ليس تحذيرًا
                  طبيًا
                </li>
              ))}
            </ul>
          )}
          <RuleCite ruleId="rotation-rest-preference" />
        </section>
      </main>
    </div>
  );
}

/** Exported for tests: the injection-event shape the reducer accepts. */
export type { InjectionEvent };
