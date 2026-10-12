/**
 * Tool #105 - AI Health Data Fusion Hub & Timeline
 * Layer 1: Pure TypeScript timeline-fusion model.
 *
 * SCOPE (master handoff section3, tool #105):
 * This is a LOCAL, USER-SUPPLIED health-data fusion engine. It does NOT
 * claim FHIR integration, wearable sync or any external device connection -
 * there is no such data source, adapter or test. The user manually enters
 * their own health events (labs, symptoms, medications) and EXPLICITLY
 * CONSENTS before any persistence. Health data is never sent to the AI
 * provider or any external service unless the user has both (a) enabled
 * persistence and (b) explicitly opted in; the deterministic fusion output
 * is always available without the model.
 *
 * Model
 * -----
 * Events are normalised onto a single timeline keyed by ISO date + event
 * code. Trend detection compares consecutive values of the same code and
 * flags direction + magnitude. All output is deterministic; AI is an
 * optional explanation layer on top (section11 fallback applies).
 */

export type HealthEventCategory = 'lab' | 'medication' | 'symptom' | 'blood-pressure';

/** A single user-supplied health event. `value` is numeric for labs/BP. */
export interface HealthEvent {
  /** ISO 8601 date (YYYY-MM-DD). */
  date: string;
  category: HealthEventCategory;
  /** Canonical code, e.g. 'total_testosterone', 'ldl', 'systolic_bp', 'sarm_suppression'. */
  code: string;
  /** Numeric value for lab / blood-pressure events. */
  value?: number;
  /** Free-text note for symptom / medication events. */
  note?: string;
  /** Unit string, echoed for display only. */
  unit?: string;
}

export interface TimelineEntry {
  date: string;
  category: HealthEventCategory;
  code: string;
  value?: number;
  note?: string;
  unit?: string;
}

export interface TrendInsight {
  code: string;
  category: HealthEventCategory;
  first_value: number | null;
  last_value: number | null;
  direction: 'up' | 'down' | 'flat' | 'insufficient-data';
  change_percent: number | null;
  data_point_count: number;
}

export interface HealthFusionResult {
  timeline: TimelineEntry[];
  event_count: number;
  category_counts: Record<HealthEventCategory, number>;
  trends: TrendInsight[];
  /** Explicit consent state recorded by the caller; drives persistence only. */
  consent_given: boolean;
  persistence_mode: 'local-only' | 'authenticated-sync';
  /** Privacy boundary statement, always present. */
  privacy_notice: string;
}

/** Sort events chronologically; stable for equal dates (category then code). */
export function buildTimeline(events: HealthEvent[]): TimelineEntry[] {
  return [...events]
    .map((e) => ({
      date: e.date,
      category: e.category,
      code: e.code,
      value: e.value,
      note: e.note,
      unit: e.unit,
    }))
    .sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      if (a.category !== b.category) return a.category < b.category ? -1 : 1;
      return a.code < b.code ? -1 : 1;
    });
}

/**
 * Detect directional trends per numeric code across the timeline.
 * Only codes with >=2 numeric data points produce a direction; otherwise
 * 'insufficient-data'.
 */
export function detectTrends(timeline: TimelineEntry[]): TrendInsight[] {
  const byCode = new Map<string, TimelineEntry[]>();
  for (const e of timeline) {
    if (typeof e.value !== 'number') continue;
    const list = byCode.get(e.code) ?? [];
    list.push(e);
    byCode.set(e.code, list);
  }

  const trends: TrendInsight[] = [];
  for (const [code, entries] of byCode) {
    const sorted = [...entries].sort((a, b) => (a.date < b.date ? -1 : 1));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    if (sorted.length < 2) {
      trends.push({
        code,
        category: first.category,
        first_value: first.value ?? null,
        last_value: last.value ?? null,
        direction: 'insufficient-data',
        change_percent: null,
        data_point_count: sorted.length,
      });
      continue;
    }
    const fv = first.value ?? 0;
    const lv = last.value ?? 0;
    const change = fv !== 0 ? Math.round(((lv - fv) / Math.abs(fv)) * 1000) / 10 : null;
    let direction: TrendInsight['direction'] = 'flat';
    if (lv > fv) direction = 'up';
    else if (lv < fv) direction = 'down';
    trends.push({
      code,
      category: first.category,
      first_value: fv,
      last_value: lv,
      direction,
      change_percent: change,
      data_point_count: sorted.length,
    });
  }
  return trends.sort((a, b) => (a.code < b.code ? -1 : 1));
}

export interface HealthFusionInput {
  events: HealthEvent[];
  /** User's explicit consent to persist. Defaults to false (local-only). */
  consent_given: boolean;
  /** Whether the user is authenticated for cross-device sync. */
  authenticated: boolean;
}

export function fuseHealthData(input: HealthFusionInput): HealthFusionResult {
  const timeline = buildTimeline(input.events);
  const trends = detectTrends(timeline);

  const category_counts: Record<HealthEventCategory, number> = {
    lab: 0,
    medication: 0,
    symptom: 0,
    'blood-pressure': 0,
  };
  for (const e of timeline) category_counts[e.category] += 1;

  const persistence_mode: HealthFusionResult['persistence_mode'] =
    input.consent_given && input.authenticated ? 'authenticated-sync' : 'local-only';

  return {
    timeline,
    event_count: timeline.length,
    category_counts,
    trends,
    consent_given: input.consent_given,
    persistence_mode,
    privacy_notice:
      'local_user_supplied_data_only_no_fhir_wearable_or_external_integration_no_health_data_sent_to_ai_or_external_services',
  };
}

