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
  type MedicalRule,
  type PlanCompound,
  type Tool036Action,
} from '@/lib/tools/tool-036-v4/contracts';
import { applyAction, initialState } from '@/lib/tools/tool-036-v4/state/reducer';
import { loadState, saveState, deleteAllData } from '@/lib/tools/tool-036-v4/state/storage';
import { buildEnvelope } from '@/lib/tools/tool-036-v4/state/envelope';
import { parseImport } from '@/lib/tools/tool-036-v4/state/import';
import { buildFhirBundle } from '@/lib/tools/tool-036-v4/state/fhir';
import { compileProposal } from '@/lib/tools/tool-036-v4/engine/proposal';
import { checkRotation } from '@/lib/tools/tool-036-v4/engine/rotation-check';
import { siteRecencyFromEvents } from '@/lib/tools/tool-036-v4/engine/recency';
import { buildDriftReport } from '@/lib/tools/tool-036-v4/engine/drift';
import { fmt, dirFor } from '@/lib/tools/tool-036-v4/i18n';
import type { CopyDict, CopyKey, UiLocale } from '@/lib/tools/tool-036-v4/i18n';

/**
 * Planning horizon, in weeks. The approved design fixes a FULL 12-week horizon
 * (`review-v4-design-ar.md` P3: «خطة الأفق الكامل (12 أسبوعًا)») — the earlier
 * 4-week preview value was an unapproved shortening and is superseded here.
 * Exported so tests and callers assert the horizon rather than the literal.
 */
export const PREVIEW_WEEKS = 12;

/**
 * Cadence of the live re-judgement tick. A scheduled slot is judged once its
 * +24h window has closed, so the report must refresh on its own while the page
 * stays open — a stale "not judged yet" line would be a lie of omission. The
 * interval is deliberately shorter than the granularity anyone can perceive at
 * a day-scale window, and it is cleared on unmount (tested).
 */
export const CLOCK_TICK_MS = 30_000;

/** Volume zones map to copy keys; the wording itself lives in the dictionary. */
const ZONE_COPY_KEY: Record<Zone, CopyKey> = {
  green: 'zoneGreen',
  yellow: 'zoneYellow',
  red: 'zoneRed',
};

type DriftStatus = 'matched' | 'late' | 'missed' | 'extra' | 'site-changed';
const DRIFT_STATUS_COPY_KEY: Record<DriftStatus, CopyKey> = {
  matched: 'statusMatched',
  late: 'statusLate',
  missed: 'statusMissed',
  extra: 'statusExtra',
  'site-changed': 'statusSiteChanged',
};

/**
 * The site's own name in the active language. The V3 registry (read-only reuse)
 * already carries both `labelEn` and `labelAr`, so no second table is kept here.
 */
function siteLabel(locale: UiLocale, siteId: string): string {
  const site = BODY_SITES.find((s) => s.siteId === siteId);
  if (!site) return siteId;
  return locale === 'ar' ? site.labelAr : site.labelEn;
}

/**
 * A resolved message that survives a language switch: either a dictionary key
 * or a bilingual pair (imports already carry `messageEn`/`messageAr`).
 */
type LocaleMessage = CopyKey | { en: string; ar: string };

/** A notice with its interpolation values, localised at render time. */
interface Notice {
  key: CopyKey;
  vars?: Record<string, string | number>;
}

/** Browser-local wall-time for a datetime-local input (converted to absolute on submit). */
function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

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

function formatInTz(iso: string, tz: string, locale: UiLocale): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en-US', {
    timeZone: tz,
    calendar: 'gregory',
    // Latin digits in both languages: the numbers here are measurements, and
    // mixed numeral systems would make the report harder to scan, not easier.
    numberingSystem: 'latn',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

/**
 * Resolve a `LocaleMessage` for the active language. `dict` is the copy the
 * route resolved on the server and passed down (bundle gate: the dictionaries
 * are data, so they are not part of this route's client entry chunk).
 */
function resolveMessage(dict: CopyDict, locale: UiLocale, message: LocaleMessage): string {
  return typeof message === 'string' ? dict[locale][message] : message[locale];
}

/** One cited rule, rendered with its full provenance (R7). */
function RuleCite({
  ruleId,
  locale,
  dict,
  rules,
}: {
  ruleId: string;
  locale: UiLocale;
  dict: CopyDict;
  rules: Readonly<Record<string, MedicalRule>>;
}) {
  const copy = dict[locale];
  const rule = rules[ruleId];
  if (!rule) return null;
  return (
    <details className="mt-1 text-xs text-zinc-500" data-testid={`rule-${ruleId}`}>
      <summary className="cursor-pointer">{copy.ruleSummary}</summary>
      <p className="mt-1">{locale === 'ar' ? rule.claimAr : rule.claimEn}</p>
      <p>
        {copy.ruleSource} {rule.source.ref} · {copy.ruleConfidence} {rule.source.confidence}
      </p>
      <p>
        {copy.ruleScope} {locale === 'ar' ? rule.applicabilityAr : rule.applicabilityEn}
      </p>
    </details>
  );
}

/**
 * The preview shell. `dict` (interface copy, both languages) and `rules` (the
 * cited-rule corpus) are resolved by the route on the server and passed down as
 * props: they are data, and keeping them out of the client entry chunk is what
 * keeps this route inside its First Load JS budget (acceptance-fixes-plan).
 * Behaviour is unchanged — both are plain serialisable objects, available
 * synchronously on the first client render, so the language toggle stays
 * instant and every citation renders without an extra request.
 */
export default function Tool036V4Shell({
  dict,
  rules,
}: {
  dict: CopyDict;
  rules: Readonly<Record<string, MedicalRule>>;
}) {
  const [state, setState] = useState<AppState | null>(null);
  // `now` is explicit and testable: the injected tick feeds every derived value,
  // so a window that closes while the page is open is re-judged on its own.
  const [clockIso, setClockIso] = useState(() => new Date().toISOString());
  const [storageNotice, setStorageNotice] = useState<CopyKey | null>(null);
  const [logForm, setLogForm] = useState({
    when: toLocalInputValue(new Date()),
    siteId: BODY_SITES[0].siteId,
    volume: '1',
    dose: '125',
    pain: '',
    note: '',
  });
  const [logError, setLogError] = useState<CopyKey | null>(null);
  const [transferNotice, setTransferNotice] = useState<Notice | null>(null);
  const [transferErrors, setTransferErrors] = useState<LocaleMessage[]>([]);
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState<Notice | null>(null);

  useEffect(() => {
    const loaded = loadState();
    if (loaded.ok) {
      setState(loaded.state);
      return;
    }
    if (loaded.reason === 'invalid') {
      setStorageNotice('storageInvalid');
    }
    setState(initialState('ar', safeTz()));
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setClockIso(new Date().toISOString()), CLOCK_TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    // Persist only state the user owns. A wiped (or never-acknowledged) state
    // must never be written back: otherwise the wipe's own re-render recreates
    // the key it just deleted. The acknowledgment lives inside this single
    // record, so "no acknowledgment" is exactly "nothing consented to store".
    if (state?.prefs.acknowledgedAt) saveState(state);
  }, [state]);

  const dispatch = useCallback((action: Tool036Action) => {
    setState((prev) => (prev ? applyAction(prev, action, makeCtx()) : prev));
  }, []);

  const derived = useMemo(() => {
    if (!state) return null;
    // Everything time-dependent is derived from the injected clock, so a window
    // that closes while the page is open is reflected without any interaction.
    const nowIso = clockIso;
    const proposal = compileProposal(state.plan, {
      fromIso: nowIso,
      weeks: PREVIEW_WEEKS,
      tz: state.prefs.tz,
      events: state.events,
    });
    const findings = checkRotation(state.events, proposal, state.prefs.restPreferenceDays);
    const recency = siteRecencyFromEvents(state.events, nowIso);
    const drift = buildDriftReport(proposal, state.events, state.prefs, nowIso);
    const weeklyMg = state.plan.compounds.reduce((sum, c) => sum + c.weeklyDoseMg, 0);
    return { proposal, findings, recency, drift, weeklyMg, computedAt: nowIso };
  }, [state, clockIso]);

  if (!state || !derived) {
    // The stored locale is unknown until state loads, so this first frame uses
    // the Arabic default (the tool's default language).
    return <div className="p-8 text-zinc-500">{dict.ar.loading}</div>;
  }

  // F7.5: language is a first-class, persisted preference — the single source
  // of truth. Direction derives from it, and every visible string is looked up
  // per render, so switching re-labels the entire surface in one act (and the
  // same `prefs.locale` travels in exports).
  const locale: UiLocale = state.prefs.locale;
  const dir = dirFor(locale);
  const copy = dict[locale];
  const otherLocale: UiLocale = locale === 'ar' ? 'en' : 'ar';
  const toggleLocale = () => dispatch({ type: 'prefs/update', patch: { locale: otherLocale } });

  const updateCompound = (index: number, patch: Partial<PlanCompound>) => {
    const compounds = state.plan.compounds.map((c, i) => (i === index ? { ...c, ...patch } : c));
    dispatch({ type: 'plan/replace', plan: { ...state.plan, compounds } });
  };

  const handleLogActual = (event: React.FormEvent) => {
    event.preventDefault();
    const volumeMl = Number(logForm.volume);
    const doseMg = Number(logForm.dose);
    const when = new Date(logForm.when);
    if (!Number.isFinite(volumeMl) || volumeMl <= 0 || !Number.isFinite(doseMg) || doseMg <= 0) {
      setLogError('logErrorNumbers');
      return;
    }
    if (Number.isNaN(when.getTime())) {
      setLogError('logErrorWhen');
      return;
    }
    setLogError(null);
    dispatch({
      type: 'event/add',
      event: {
        // The datetime-local value is browser-local; Date resolves it to an
        // absolute instant, so what is stored always carries an offset.
        occurredAt: when.toISOString(),
        siteId: logForm.siteId as InjectionEvent['siteId'],
        volumeMl,
        doseMg,
        compoundIds: [state.plan.compounds[0].compoundId],
        painScore: logForm.pain === '' ? undefined : Number(logForm.pain),
        note: logForm.note.trim() === '' ? undefined : logForm.note,
      },
    });
  };

  const downloadJson = (payload: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleExportEnvelope = async () => {
    const envelope = await buildEnvelope(state, new Date().toISOString());
    downloadJson(envelope, 'tool-036-v4-export.json');
    setTransferErrors([]);
    setTransferNotice({ key: 'noticeExportEnvelope' });
  };

  const handleExportFhir = async () => {
    const bundle = buildFhirBundle(state, new Date().toISOString());
    downloadJson(bundle, 'tool-036-v4-fhir-bundle.json');
    setTransferErrors([]);
    setTransferNotice({ key: 'noticeExportFhir' });
  };

  const readFileText = (file: File): Promise<string> => {
    // File.text() is the modern path; FileReader covers older DOM runtimes.
    if (typeof file.text === 'function') return file.text();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(reader.error ?? new Error('file read failed'));
      reader.readAsText(file);
    });
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    setTransferNotice(null);
    setTransferErrors([]);
    let text: string;
    try {
      text = await readFileText(file);
    } catch {
      setTransferErrors(['importReadError']);
      return;
    }
    const result = await parseImport(text, state);
    if (!result.ok) {
      setTransferErrors(result.errors.map((e) => ({ en: e.messageEn, ar: e.messageAr })));
      return;
    }
    dispatch({
      type: 'import/merge',
      events: result.envelope.payload.events,
      plan: result.envelope.payload.plan,
      locale: result.envelope.payload.locale,
    });
    setTransferNotice({
      key: 'noticeImport',
      vars: { added: result.added, skipped: result.skippedDuplicates },
    });
  };

  const handleDeleteAll = () => {
    const removed = deleteAllData();
    setState(initialState(state.prefs.locale, state.prefs.tz));
    setDeleteArmed(false);
    setDeleteNotice({ key: 'deleteNotice', vars: { count: removed } });
  };

  if (!state.prefs.acknowledgedAt) {
    return (
      <div
        dir={dir}
        lang={locale}
        className="min-h-screen bg-zinc-950 p-6 text-zinc-100 flex items-center justify-center"
      >
        <div className="max-w-xl rounded-xl border border-zinc-800 p-6" data-testid="ack-gate">
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              data-testid="locale-toggle"
              aria-label={copy.languageToggleAria}
              className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
              onClick={toggleLocale}
            >
              {dict[otherLocale].languageName}
            </button>
          </div>
          <h1 className="text-lg font-bold">{copy.ackTitle}</h1>
          <ul className="mt-3 list-disc space-y-2 pr-5 text-sm text-zinc-300">
            <li>{copy.ackBullet1}</li>
            <li>{copy.ackBullet2}</li>
            <li>{copy.ackBullet3}</li>
            <li>{copy.ackBullet4}</li>
            <li>{copy.ackBullet5}</li>
          </ul>
          <button
            type="button"
            data-testid="ack-button"
            className="mt-4 rounded bg-amber-500 px-4 py-2 font-semibold text-zinc-950"
            onClick={() => dispatch({ type: 'ack/set', at: new Date().toISOString() })}
          >
            {copy.ackAccept}
          </button>
          {deleteNotice && (
            <p className="mt-3 text-sm text-emerald-400" data-testid="delete-notice">
              {fmt(copy[deleteNotice.key], deleteNotice.vars ?? {})}
            </p>
          )}
          <RuleCite ruleId="clinical-evaluation-advisory" locale={locale} dict={dict} rules={rules} />
        </div>
      </div>
    );
  }

  return (
    <div dir={dir} lang={locale} className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold">
            {copy.previewTitle}{' '}
            <span data-testid="schema-version">v{APP_SCHEMA_VERSION}</span>
          </h1>
          <button
            type="button"
            data-testid="locale-toggle"
            aria-label={copy.languageToggleAria}
            className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
            onClick={toggleLocale}
          >
            {dict[otherLocale].languageName}
          </button>
        </div>
        <p className="mt-1 text-sm text-zinc-400">{copy.previewNotice}</p>
        {storageNotice && (
          <p className="mt-2 text-sm text-amber-400" data-testid="storage-notice">
            {copy[storageNotice]}
          </p>
        )}
      </header>

      <main className="grid gap-6 lg:grid-cols-2">
        {/* ---- Plan (intent) ---- */}
        <section aria-labelledby="plan-heading" className="rounded-xl border border-zinc-800 p-4">
          <h2 id="plan-heading" className="mb-3 font-semibold">
            {copy.planHeading}
          </h2>
          <p className="mb-3 text-xs text-zinc-500">
            {copy.weeklyTotalLabel}{' '}
            <span data-testid="weekly-mg" className="font-mono text-amber-300">
              {derived.weeklyMg} {copy.mgUnit}
            </span>{' '}
            · {copy.timeZoneLabel} {state.prefs.tz} · {copy.toleranceHoursLabel}{' '}
            {state.prefs.lateToleranceHours} · {copy.restPreferenceLabel}{' '}
            {state.prefs.restPreferenceDays} {copy.daysUnit}
          </p>
          {state.plan.compounds.map((compound, index) => (
            <div key={compound.compoundId} className="mb-3 grid grid-cols-3 gap-2">
              <label className="text-sm" htmlFor={`dose-${index}`}>
                {copy.weeklyDoseLabel}
                <input
                  id={`dose-${index}`}
                  aria-label={copy.weeklyDoseAria}
                  type="number"
                  min={1}
                  className="mt-1 w-full rounded bg-zinc-900 p-2 font-mono"
                  value={compound.weeklyDoseMg}
                  onChange={(e) => updateCompound(index, { weeklyDoseMg: Number(e.target.value) })}
                />
              </label>
              <label className="text-sm" htmlFor={`conc-${index}`}>
                {copy.concentrationLabel}
                <input
                  id={`conc-${index}`}
                  aria-label={copy.concentrationAria}
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
                {copy.injectionsPerWeekLabel}
                <select
                  id={`freq-${index}`}
                  aria-label={copy.injectionsPerWeekAria}
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
            {copy.rotationModeLabel}
            <select
              id="rotation-mode"
              aria-label={copy.rotationModeAria}
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
              <option value="least-recently-used">{copy.rotationLru}</option>
              <option value="fixed-order">{copy.rotationFixed}</option>
            </select>
          </label>
          <RuleCite ruleId="rotation-rest-preference" locale={locale} dict={dict} rules={rules} />
        </section>

        {/* ---- Proposal (plan compiled to absolute time) ---- */}
        <section aria-labelledby="proposal-heading" className="rounded-xl border border-zinc-800 p-4">
          <h2 id="proposal-heading" className="mb-3 font-semibold">
            {fmt(copy.proposalHeading, { weeks: PREVIEW_WEEKS })}
          </h2>
          <p className="mb-3 text-xs text-zinc-500" data-testid="horizon-note">
            {fmt(copy.horizonNote, { weeks: PREVIEW_WEEKS })}
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-400">
                <th className="text-start">{copy.thTime}</th>
                <th className="text-start">{copy.thSite}</th>
                <th className="text-start">{copy.thDose}</th>
                <th className="text-start">{copy.thVolume}</th>
                <th className="text-start">{copy.thZone}</th>
              </tr>
            </thead>
            <tbody>
              {derived.proposal.shots.map((shot) => {
                const { zone } = classifyVolumeZone(shot.volumeMl, shot.siteId);
                return (
                  <tr
                    key={shot.id}
                    data-testid="shot-row"
                    data-zone={zone}
                    data-scheduled-at={shot.occurredAt}
                  >
                    <td>{formatInTz(shot.occurredAt, state.prefs.tz, locale)}</td>
                    <td>{siteLabel(locale, shot.siteId)}</td>
                    <td className="font-mono" data-testid="shot-dose">
                      {shot.doseMg} {copy.mgUnit}
                    </td>
                    <td className="font-mono" data-testid="shot-volume">
                      {shot.volumeMl} {copy.mlUnit}
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
                        {copy[ZONE_COPY_KEY[zone]]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <RuleCite ruleId="volume-zone-bands" locale={locale} dict={dict} rules={rules} />
          <RuleCite ruleId="site-ceiling-table" locale={locale} dict={dict} rules={rules} />
        </section>

        {/* ---- Recorded usage (R2: facts and silence) ---- */}
        <section aria-labelledby="usage-heading" className="rounded-xl border border-zinc-800 p-4">
          <h2 id="usage-heading" className="mb-3 font-semibold">
            {copy.usageHeading}
          </h2>
          <ul className="space-y-1 text-sm">
            {BODY_SITES.map((site) => {
              const entry = derived.recency[site.siteId as keyof typeof derived.recency];
              return (
                <li key={site.siteId} className="flex justify-between">
                  <span>{siteLabel(locale, site.siteId)}</span>
                  {entry ? (
                    <span className="font-mono text-zinc-400">
                      {formatInTz(entry.lastUsedAt, state.prefs.tz, locale)}{' '}
                      {fmt(copy.sinceDays, { days: entry.daysSince })}
                    </span>
                  ) : (
                    <span className="text-zinc-600" data-testid={`no-usage-${site.siteId}`}>
                      {copy.noUsage}
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
            {fmt(copy.findingsHeading, { days: state.prefs.restPreferenceDays })}
          </h2>
          {derived.findings.length === 0 ? (
            <p className="text-sm text-zinc-400" data-testid="no-findings">
              {copy.noFindings}
            </p>
          ) : (
            <ul className="space-y-1 text-sm" data-testid="findings-list">
              {derived.findings.map((finding, index) => (
                <li key={`${finding.siteId}-${finding.atIso}-${index}`}>
                  {fmt(copy.findingLine, {
                    site: siteLabel(locale, finding.siteId),
                    gap: finding.gapDays,
                    prev: finding.prevOrigin === 'actual' ? copy.originRecorded : copy.originPlanned,
                    cur: finding.origin === 'actual' ? copy.originRecorded : copy.originPlanned,
                  })}
                </li>
              ))}
            </ul>
          )}
          <RuleCite ruleId="rotation-rest-preference" locale={locale} dict={dict} rules={rules} />
        </section>

        {/* ---- Log an actual event ---- */}
        <section aria-labelledby="log-heading" className="rounded-xl border border-zinc-800 p-4 lg:col-span-2">
          <h2 id="log-heading" className="mb-3 font-semibold">
            {copy.logHeading}
          </h2>
          <form onSubmit={handleLogActual} className="grid grid-cols-2 gap-3 md:grid-cols-6" data-testid="log-form">
            <label className="text-sm" htmlFor="log-when">
              {copy.logWhenLabel}
              <input
                id="log-when"
                aria-label={copy.logWhenAria}
                type="datetime-local"
                className="mt-1 w-full rounded bg-zinc-900 p-2 font-mono"
                value={logForm.when}
                onChange={(e) => setLogForm((f) => ({ ...f, when: e.target.value }))}
              />
            </label>
            <label className="text-sm" htmlFor="log-site">
              {copy.logSiteLabel}
              <select
                id="log-site"
                aria-label={copy.logSiteAria}
                className="mt-1 w-full rounded bg-zinc-900 p-2"
                value={logForm.siteId}
                onChange={(e) => setLogForm((f) => ({ ...f, siteId: e.target.value }))}
              >
                {BODY_SITES.map((site) => (
                  <option key={site.siteId} value={site.siteId}>
                    {locale === 'ar' ? site.labelAr : site.labelEn}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm" htmlFor="log-volume">
              {copy.logVolumeLabel}
              <input
                id="log-volume"
                aria-label={copy.logVolumeAria}
                type="number"
                step="0.01"
                min="0.01"
                className="mt-1 w-full rounded bg-zinc-900 p-2 font-mono"
                value={logForm.volume}
                onChange={(e) => setLogForm((f) => ({ ...f, volume: e.target.value }))}
              />
            </label>
            <label className="text-sm" htmlFor="log-dose">
              {copy.logDoseLabel}
              <input
                id="log-dose"
                aria-label={copy.logDoseAria}
                type="number"
                step="0.01"
                min="0.01"
                className="mt-1 w-full rounded bg-zinc-900 p-2 font-mono"
                value={logForm.dose}
                onChange={(e) => setLogForm((f) => ({ ...f, dose: e.target.value }))}
              />
            </label>
            <label className="text-sm" htmlFor="log-pain">
              {copy.logPainLabel}
              <input
                id="log-pain"
                aria-label={copy.logPainAria}
                type="number"
                min="0"
                max="10"
                className="mt-1 w-full rounded bg-zinc-900 p-2 font-mono"
                value={logForm.pain}
                onChange={(e) => setLogForm((f) => ({ ...f, pain: e.target.value }))}
              />
            </label>
            <label className="text-sm" htmlFor="log-note">
              {copy.logNoteLabel}
              <input
                id="log-note"
                aria-label={copy.logNoteAria}
                type="text"
                className="mt-1 w-full rounded bg-zinc-900 p-2"
                value={logForm.note}
                onChange={(e) => setLogForm((f) => ({ ...f, note: e.target.value }))}
              />
            </label>
            <div className="col-span-2 flex items-center gap-3 md:col-span-6">
              <button
                type="submit"
                className="rounded bg-amber-500 px-4 py-2 font-semibold text-zinc-950"
              >
                {copy.logSubmit}
              </button>
              {logError && (
                <span className="text-sm text-red-400" data-testid="log-error">
                  {copy[logError]}
                </span>
              )}
            </div>
          </form>
        </section>

        {/* ---- Plan vs Actual drift (D4/R5: itemised, never a score) ---- */}
        <section aria-labelledby="drift-heading" className="rounded-xl border border-zinc-800 p-4 lg:col-span-2">
          <h2 id="drift-heading" className="mb-3 font-semibold">
            {copy.driftHeading}
          </h2>
          <p className="mb-2 text-xs text-zinc-500" data-testid="declared-rules">
            {fmt(copy.driftDeclaredRules, { tolerance: state.prefs.lateToleranceHours })}
          </p>
          <p
            className="mb-2 text-xs text-zinc-500"
            data-testid="drift-computed-at"
            data-computed-at={derived.computedAt}
          >
            {copy.driftLastUpdated} {formatInTz(derived.computedAt, state.prefs.tz, locale)}
          </p>
          <p className="mb-3 font-mono text-sm text-zinc-300" data-testid="drift-summary">
            {fmt(copy.driftSummary, {
              matched: derived.drift.summary.matched,
              late: derived.drift.summary.late,
              missed: derived.drift.summary.missed,
              extra: derived.drift.summary.extra,
              siteChanged: derived.drift.summary.siteChanged,
            })}
          </p>
          {derived.drift.items.length === 0 ? (
            <p className="text-sm text-zinc-400" data-testid="drift-empty">
              {copy.driftEmpty}
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {derived.drift.items.map((item, index) => (
                <li
                  key={`${item.scheduledAt}-${index}`}
                  data-testid="drift-row"
                  className="border-b border-zinc-800 pb-2"
                >
                  <span
                    data-testid={`drift-status-${item.status}`}
                    className={
                      item.status === 'matched'
                        ? 'text-emerald-400'
                        : item.status === 'late' || item.status === 'site-changed'
                          ? 'text-amber-400'
                          : 'text-red-400'
                    }
                  >
                    {copy[DRIFT_STATUS_COPY_KEY[item.status]]}
                  </span>{' '}
                  {item.scheduledAt ? (
                    <>
                      {copy.driftPlanned} {formatInTz(item.scheduledAt, state.prefs.tz, locale)}
                    </>
                  ) : (
                    <>{copy.driftNoCounterpart}</>
                  )}
                  {item.actual && (
                    <>
                      {' '}
                      {copy.driftActual}{' '}
                      {formatInTz(item.actual.occurredAt, state.prefs.tz, locale)} (
                      {siteLabel(locale, item.actual.siteId)})
                    </>
                  )}
                  {item.deltaHours !== undefined && (
                    <span data-testid="drift-delta" className="font-mono">
                      {' '}
                      {fmt(copy.driftDelta, { hours: item.deltaHours })}
                    </span>
                  )}
                  <details className="mt-1 text-xs text-zinc-500">
                    <summary className="cursor-pointer">{copy.driftReasonSummary}</summary>
                    <p data-testid="drift-reason">
                      {copy.driftReason} {locale === 'ar' ? item.reasonAr : item.reasonEn}
                    </p>
                    <p>
                      {copy.driftRule} {item.ruleId}
                    </p>
                  </details>
                </li>
              ))}
            </ul>
          )}
          <RuleCite ruleId="drift-matching-tolerance" locale={locale} dict={dict} rules={rules} />
        </section>

        {/* ---- Backup & transfer (D3/R4: envelope in, envelope out; FHIR out only) ---- */}
        <section aria-labelledby="transfer-heading" className="rounded-xl border border-zinc-800 p-4 lg:col-span-2">
          <h2 id="transfer-heading" className="mb-3 font-semibold">
            {copy.transferHeading}
          </h2>
          <p className="mb-3 text-xs text-zinc-500">{copy.transferIntro}</p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="rounded bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700"
              onClick={handleExportEnvelope}
            >
              {copy.exportEnvelope}
            </button>
            <button
              type="button"
              className="rounded bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700"
              onClick={handleExportFhir}
            >
              {copy.exportFhir}
            </button>
            <label className="text-sm">
              {copy.importLabel}
              <input
                type="file"
                accept="application/json,.json"
                aria-label={copy.importAria}
                className="mt-1 block text-sm"
                onChange={handleImportFile}
              />
            </label>
          </div>
          {transferNotice && (
            <p className="mt-3 text-sm text-emerald-400" data-testid="transfer-notice">
              {fmt(copy[transferNotice.key], transferNotice.vars ?? {})}
            </p>
          )}
          {transferErrors.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm text-red-400" data-testid="transfer-errors">
              {transferErrors.map((message, index) => (
                <li key={index}>{resolveMessage(dict, locale, message)}</li>
              ))}
            </ul>
          )}
        </section>

        {/* ---- Privacy & control (D5/R7: local-only, verifiable wipe) ---- */}
        <section
          aria-labelledby="privacy-heading"
          className="rounded-xl border border-zinc-800 p-4 lg:col-span-2"
          data-testid="privacy-section"
        >
          <h2 id="privacy-heading" className="mb-3 font-semibold">
            {copy.privacyHeading}
          </h2>
          <p className="text-sm text-zinc-400">{copy.privacyBody}</p>
          <RuleCite ruleId="clinical-evaluation-advisory" locale={locale} dict={dict} rules={rules} />
          <div className="mt-4 border-t border-zinc-800 pt-3">
            <p className="text-xs text-zinc-500">{copy.deleteIntro}</p>
            {!deleteArmed ? (
              <button
                type="button"
                data-testid="delete-arm"
                className="mt-2 rounded border border-red-800 px-4 py-2 text-sm text-red-400 hover:bg-red-950"
                onClick={() => setDeleteArmed(true)}
              >
                {copy.deleteArm}
              </button>
            ) : (
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  data-testid="delete-confirm"
                  className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                  onClick={handleDeleteAll}
                >
                  {copy.deleteConfirm}
                </button>
                <button
                  type="button"
                  className="rounded bg-zinc-800 px-4 py-2 text-sm"
                  onClick={() => setDeleteArmed(false)}
                >
                  {copy.deleteCancel}
                </button>
              </div>
            )}
            {deleteNotice && (
              <p className="mt-2 text-sm text-emerald-400" data-testid="delete-notice">
                {fmt(copy[deleteNotice.key], deleteNotice.vars ?? {})}
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

/** Exported for tests: the injection-event shape the reducer accepts. */
export type { InjectionEvent };
