'use client';
/**
 * Tool #039 — Liver Enzyme Tracker: local history + rating UI.
 *
 * Owner decision D-08 (2026-11-11, Option A): a limited exception to the W18
 * blocker that allows LOCAL, DEVICE-ONLY storage inside Tool 039 only. No
 * cloud sync, no session persistence, no shared storage between tools and no
 * server write of any kind.
 *
 * The rules this UI implements, in the owner's words:
 *   - nothing is saved automatically — an explicit action is required;
 *   - nothing is saved before an explicit consent;
 *   - the user is told, in the UI, that the data lives in this browser on this
 *     device, that it can be lost, and that the local encryption is not an
 *     absolute guarantee;
 *   - withdrawing the consent DELETES the stored data;
 *   - a rating is bound to one saved result, never to the tool in general;
 *   - no value or comment is ever written to the console.
 */
import React, { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from 'react';
import i18nJson from '@/i18n/tool-039-liver-enzyme-tracker.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';
import type { LiverTrackerInput, LiverTrackerResult } from '@/lib/tools/schemas/tool-039-liver-enzyme-tracker';
import {
  TOOL_039_COMMENT_MAX_LENGTH,
  historyEntryFreshness,
  type Tool039HistoryEntry,
} from '@/lib/tools/r6/tool-039-liver-enzyme-tracker-history';
import {
  createBrowserHistoryStore,
  type Tool039HistoryStore,
} from '@/lib/tools/r6/tool-039-liver-enzyme-tracker-history-store';

interface HistoryContextValue {
  store: Tool039HistoryStore;
  /** Bumped after every write so the consumers re-read the device. */
  version: number;
  refresh: () => void;
  /** False during the server render and the first client render, so the two
   *  never disagree (a hydration mismatch would be a real defect). */
  mounted: boolean;
}

const HistoryContext = createContext<HistoryContextValue | null>(null);

/**
 * False during the server render and on the first client render, so the server
 * HTML and the first client render always agree (a hydration mismatch would
 * be a real defect). `useSyncExternalStore` is the idiomatic way to express
 * "we are now on the client" without a setState inside an effect.
 */
const subscribeToNothing = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );

export function Tool039HistoryProvider({
  store,
  children,
}: {
  store?: Tool039HistoryStore;
  children: React.ReactNode;
}) {
  const resolved = useMemo(() => store ?? createBrowserHistoryStore(), [store]);
  const [version, setVersion] = useState(0);
  const mounted = useIsClient();

  const refresh = useCallback(() => setVersion((current) => current + 1), []);

  const value = useMemo<HistoryContextValue>(
    () => ({ store: resolved, version, refresh, mounted }),
    [resolved, version, refresh, mounted],
  );

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}

function useHistoryContext(): HistoryContextValue {
  const context = useContext(HistoryContext);
  if (!context) throw new Error('useHistoryContext must be used within Tool039HistoryProvider');
  return context;
}

function statusLabel(locale: 'ar' | 'en', status: string): string {
  const t = pickToolI18n(i18nJson, locale);
  if (status === 'normal') return t.status_normal;
  if (status === 'elevated') return t.status_elevated;
  if (status === 'high') return t.status_high;
  if (status === 'critical') return t.status_critical;
  return status;
}

/* ── The save action + the consent panel ────────────────────────────────── */

export function Tool039HistorySaveAction({
  locale,
  input,
  result,
}: {
  locale: 'ar' | 'en';
  input: LiverTrackerInput;
  result: LiverTrackerResult;
}) {
  const t = pickToolI18n(i18nJson, locale);
  const { store, refresh, mounted } = useHistoryContext();
  const [justSaved, setJustSaved] = useState(false);

  if (!mounted) return null;

  // Two SEPARATE steps, both required by the owner: the consent comes first
  // (it lives with the history box), and only then is the save action shown.
  // Before the consent there is no save control at all.
  if (!store.isConsented()) return null;

  const save = () => {
    const entry = store.save(input, result);
    if (entry) {
      setJustSaved(true);
      refresh();
    }
  };

  return (
    <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-950/70 p-3" data-r6-history-save>
      <button
        type="button"
        onClick={save}
        className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-100 hover:bg-zinc-700"
      >
        {t.history_save_action}
      </button>
      <p className="mt-1 text-[11px] text-zinc-500" data-r6-history-notice>
        {justSaved ? t.history_saved_notice : t.history_storage_mode}
      </p>
    </div>
  );
}

/* ── Box 11: the list of saved results ───────────────────────────────────── */

export function Tool039HistoryList({ locale }: { locale: 'ar' | 'en' }) {
  const t = pickToolI18n(i18nJson, locale);
  const { store, refresh, mounted } = useHistoryContext();

  if (!mounted) {
    return <p className="text-xs text-zinc-400" data-r6-history-loading="true">{t.history_storage_mode}</p>;
  }

  const consented = store.isConsented();
  const entries = store.list();

  if (!consented) {
    return (
      <div className="space-y-2 text-xs text-zinc-400" data-r6-history-consent-notice>
        <p className="font-bold text-zinc-200">{t.history_consent_title}</p>
        <p>{t.history_consent_body}</p>
        <p>{t.history_consent_loss}</p>
        <p>{t.history_consent_encryption}</p>
        <button
          type="button"
          onClick={() => {
            store.grantConsent();
            refresh();
          }}
          className="rounded border border-lime-700 bg-lime-950/60 px-2 py-1 text-[11px] font-bold text-lime-200 hover:bg-lime-900/60"
        >
          {t.history_consent_allow}
        </button>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="space-y-2 text-xs" data-r6-history-empty="true">
        <p className="text-zinc-400">{t.history_empty}</p>
        <button
          type="button"
          onClick={() => {
            store.revokeConsent();
            refresh();
          }}
          className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-[11px] font-bold text-zinc-300 hover:bg-zinc-700"
        >
          {t.history_consent_withdraw}
        </button>
      </div>
    );
  }

  const nowIso = new Date().toISOString();

  return (
    <div className="space-y-2 text-xs" data-r6-history-list>
      {entries.map((entry: Tool039HistoryEntry) => {
        const freshness = historyEntryFreshness(entry, nowIso);
        return (
          <div
            key={entry.id}
            data-r6-history-entry
            data-r6-history-entry-id={entry.id}
            data-r6-history-stale={freshness.stale ? 'true' : 'false'}
            data-r6-history-rating={entry.rating === null ? '' : String(entry.rating)}
            className="rounded border border-zinc-800 bg-zinc-950/70 p-2"
          >
            <p className="font-mono text-[11px] text-zinc-300">{entry.drawDate}</p>
            <ul className="mt-1 space-y-0.5">
              {entry.markers.map((marker) => (
                <li key={marker.marker} className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
                  <span className="font-bold text-zinc-200">{marker.marker}</span>
                  <span className="font-mono">{marker.latestValue} {marker.unit}</span>
                  <span className="font-mono">{marker.ulnMultiple.toFixed(2)}× ULN</span>
                  <span>{statusLabel(locale, marker.status)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-zinc-500">
              <span>{t.history_age_days}: {freshness.ageDays ?? '—'}</span>
              {freshness.stale && (
                <span className="rounded bg-amber-900/60 px-1.5 py-0.5 font-bold text-amber-200" data-r6-history-stale-badge="true">
                  {t.history_stale_badge}
                </span>
              )}
              {entry.rating !== null && <span data-r6-history-rating-badge="true">★ {entry.rating}</span>}
            </p>
            <button
              type="button"
              onClick={() => {
                store.remove(entry.id);
                refresh();
              }}
              className="mt-2 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-[11px] font-bold text-zinc-200 hover:bg-zinc-700"
            >
              {t.history_delete_one}
            </button>
          </div>
        );
      })}
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={() => {
            store.clear();
            refresh();
          }}
          className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-[11px] font-bold text-zinc-200 hover:bg-zinc-700"
        >
          {t.history_delete_all}
        </button>
        <button
          type="button"
          onClick={() => {
            const csv = store.exportCsv();
            if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return;
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'tool-039-liver-enzyme-tracker-history.csv';
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
          }}
          className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-[11px] font-bold text-zinc-200 hover:bg-zinc-700"
        >
          {t.history_export}
        </button>
        <button
          type="button"
          onClick={() => {
            store.revokeConsent();
            refresh();
          }}
          className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-[11px] font-bold text-zinc-300 hover:bg-zinc-700"
        >
          {t.history_consent_withdraw}
        </button>
      </div>
    </div>
  );
}

/* ── Box 12: the rating + comment, bound to ONE saved result ────────────── */

export function Tool039RatingPanel({ locale }: { locale: 'ar' | 'en' }) {
  const t = pickToolI18n(i18nJson, locale);
  const { store, refresh, mounted } = useHistoryContext();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // The draft is keyed by the entry it belongs to, so switching the selected
  // result shows that result's stored rating — no effect is needed to reset it.
  const [draft, setDraft] = useState<{ entryId: string; rating: number | null; comment: string } | null>(null);

  const entries = mounted ? store.list() : [];

  const effectiveId = selectedId && entries.some((entry) => entry.id === selectedId)
    ? selectedId
    : entries[0]?.id ?? null;
  const current = entries.find((entry) => entry.id === effectiveId) ?? null;

  const isDraft = draft !== null && draft.entryId === effectiveId;
  const rating = isDraft ? draft.rating : (current?.rating ?? null);
  const comment = isDraft ? draft.comment : (current?.comment ?? '');

  if (!mounted) return <p className="text-xs text-zinc-400" data-r6-rating-loading="true">{t.rating_none}</p>;
  if (!store.isConsented() || entries.length === 0) {
    return (
      <p className="text-xs text-zinc-400" data-r6-rating-unavailable="true">
        {store.isConsented() ? t.rating_none : t.history_consent_body}
      </p>
    );
  }

  return (
    <div className="space-y-2 text-xs" data-r6-rating-panel>
      <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.rating_title}</p>

      {entries.length > 1 && (
        <label className="block">
          <span className="text-[10px] text-zinc-500">{t.rating_choose_result}</span>
          <select
            aria-label={t.rating_choose_result}
            value={effectiveId ?? ''}
            onChange={(event) => setSelectedId(event.target.value)}
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 p-1.5 text-[11px] text-white"
          >
            {entries.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.drawDate} — {entry.markers.map((marker) => `${marker.marker} ${marker.latestValue} ${marker.unit}`).join(', ')}
              </option>
            ))}
          </select>
        </label>
      )}

      <div
        role="radiogroup"
        aria-label={t.rating_value_label}
        data-r6-rating-control
        data-r6-rating-entry={effectiveId ?? ''}
        className="flex flex-wrap gap-1"
      >
        {[1, 2, 3, 4, 5].map((value) => (
          <label key={value} className="cursor-pointer rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-[11px] font-bold text-zinc-200">
            <input
              type="radio"
              name={`r6-tool039-rating-${effectiveId ?? 'none'}`}
              value={value}
              data-r6-rating-value={String(value)}
              aria-label={String(value)}
              checked={rating === value}
              onChange={() => setDraft({ entryId: effectiveId ?? '', rating: value, comment })}
              className="me-1 accent-lime-500"
            />
            <span aria-hidden="true">{value}</span>
          </label>
        ))}
      </div>

      <label className="block">
        <span className="text-[10px] text-zinc-500">{t.rating_comment_label}</span>
        <textarea
          aria-label={t.rating_comment_label}
          placeholder={t.rating_comment_placeholder}
          maxLength={TOOL_039_COMMENT_MAX_LENGTH}
          value={comment}
          onChange={(event) => setDraft({ entryId: effectiveId ?? '', rating, comment: event.target.value })}
          rows={3}
          className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-[11px] text-white"
        />
        <span className="text-[10px] text-zinc-500">{t.rating_comment_max}</span>
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!effectiveId || rating === null}
          onClick={() => {
            if (!effectiveId) return;
            store.rate(effectiveId, rating, comment);
            setDraft(null);
            refresh();
          }}
          className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-[11px] font-bold text-zinc-200 hover:bg-zinc-700 disabled:opacity-50"
        >
          {t.rating_save}
        </button>
        <button
          type="button"
          disabled={!effectiveId}
          onClick={() => {
            if (!effectiveId) return;
            store.clearRating(effectiveId);
            setDraft(null);
            refresh();
          }}
          className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-[11px] font-bold text-zinc-200 hover:bg-zinc-700 disabled:opacity-50"
        >
          {t.rating_clear}
        </button>
      </div>
    </div>
  );
}
