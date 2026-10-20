/**
 * Tool-036 V4 — the single reducer (design-v4-ar.md §2/§3, decision D1).
 *
 * Every state change flows through `applyAction`. The function is pure:
 * the clock and the id source are injected via `ReducerContext`, so tests
 * can reproduce any transition exactly (gate C2.1). The produced state is
 * validated against `appStateSchema` before it is returned — an invalid
 * transition throws instead of corrupting persisted data.
 */
import { appStateSchema, type AppState, type Prefs, type PlanSpec, type Tool036Action } from '../contracts';
import { DEFAULT_ROTATION_SITES } from '@/lib/tools/engines/tool-036-injection-schedule';

export interface ReducerContext {
  /** ISO-8601 with offset — replaces any internal Date.now() usage. */
  now: string;
  idGen: () => string;
}

export const DEFAULT_PLAN: PlanSpec = {
  compounds: [
    {
      compoundId: 'testosterone-enanthate',
      weeklyDoseMg: 250,
      concentrationMgMl: 250,
      injectionsPerWeek: 2,
    },
  ],
  preferredSites: [...DEFAULT_ROTATION_SITES],
  rotationMode: 'least-recently-used',
};

export function defaultPrefs(locale: 'ar' | 'en', tz: string): Prefs {
  return { locale, tz, lateToleranceHours: 6, restPreferenceDays: 7 };
}

export function initialState(locale: 'ar' | 'en', tz: string): AppState {
  return { schemaVersion: 2, events: [], plan: DEFAULT_PLAN, prefs: defaultPrefs(locale, tz) };
}

/** Notes are normalised to NFC at the boundary so export/import compares equal. */
function normalizeNote(note: string | undefined): string | undefined {
  return note === undefined ? undefined : note.normalize('NFC');
}

function nextState(state: AppState, action: Tool036Action, ctx: ReducerContext): AppState {
  // Plain construction only — validation happens once, in applyAction, so
  // every invalid transition surfaces the same invariant error.
  switch (action.type) {
    case 'event/add': {
      const event = {
        ...action.event,
        note: normalizeNote(action.event.note),
        id: ctx.idGen(),
        createdAt: ctx.now,
        source: 'logged' as const,
      };
      return { ...state, events: [...state.events, event] };
    }
    case 'event/remove':
      return { ...state, events: state.events.filter((e) => e.id !== action.id) };
    case 'plan/replace':
      return { ...state, plan: action.plan };
    case 'prefs/update':
      return { ...state, prefs: { ...state.prefs, ...action.patch } };
    case 'ack/set':
      return { ...state, prefs: { ...state.prefs, acknowledgedAt: action.at } };
    case 'import/merge': {
      const known = new Set(state.events.map((e) => e.id));
      const added = action.events.filter((e) => !known.has(e.id));
      const events = [...state.events, ...added].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
      return {
        ...state,
        events,
        plan: action.plan ?? state.plan,
        prefs: action.locale ? { ...state.prefs, locale: action.locale } : state.prefs,
      };
    }
    case 'data/reset':
      return initialState(state.prefs.locale, state.prefs.tz);
    default: {
      const never: never = action;
      throw new Error(`unknown action: ${JSON.stringify(never)}`);
    }
  }
}

/**
 * Apply an action, validate the result, return it. Throws on any transition
 * that would produce an invalid state (invariant gate — never persist junk).
 */
export function applyAction(state: AppState, action: Tool036Action, ctx: ReducerContext): AppState {
  const next = nextState(state, action, ctx);
  const parsed = appStateSchema.safeParse(next);
  if (!parsed.success) {
    const preview = parsed.error.issues.slice(0, 3).map((i) => `${i.path.join('.')}: ${i.message}`);
    throw new Error(`state invariant violated by ${action.type}: ${preview.join(' | ')}`);
  }
  return parsed.data;
}
