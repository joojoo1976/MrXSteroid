/**
 * Pure helpers for the user dashboard.
 *
 * Everything here is derived from rows that actually exist in Supabase. No
 * placeholder metrics are produced: an empty dataset yields zeros/empty arrays
 * and the UI renders an explicit empty state.
 */

export interface DashboardHistoryRow {
    id: string;
    tool: string;
    title: string | null;
    inputs: Record<string, unknown>;
    result: Record<string, unknown>;
    created_at: string;
}

export interface DashboardSnapshot {
    savedNotes: string;
    currentPhase: string;
    updatedAt: string | null;
}

export interface WeeklyActivityBucket {
    key: string;
    label: string;
    count: number;
}

export interface ToolUsageGroup {
    tool: string;
    label: string;
    count: number;
}

export type PhaseKey = 'cutting' | 'bulking' | 'maintenance' | 'recomp';

export const PHASE_KEYS: PhaseKey[] = ['cutting', 'bulking', 'maintenance', 'recomp'];

const DAY_MS = 86_400_000;

function startOfDay(value: Date): Date {
    const next = new Date(value);
    next.setHours(0, 0, 0, 0);
    return next;
}

/** Seven calendar-day buckets ending today (oldest first). */
export function buildWeeklyActivity(
    history: DashboardHistoryRow[],
    locale = 'en',
    now: Date = new Date(),
): WeeklyActivityBucket[] {
    const formatter = new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en', { weekday: 'short' });
    const today = startOfDay(now);
    const buckets: WeeklyActivityBucket[] = [];

    for (let offset = 6; offset >= 0; offset -= 1) {
        const day = new Date(today.getTime() - offset * DAY_MS);
        buckets.push({ key: day.toISOString().slice(0, 10), label: formatter.format(day), count: 0 });
    }

    for (const row of history) {
        const parsed = new Date(row.created_at);
        if (Number.isNaN(parsed.getTime())) continue;
        const key = startOfDay(parsed).toISOString().slice(0, 10);
        const bucket = buckets.find((entry) => entry.key === key);
        if (bucket) bucket.count += 1;
    }

    return buckets;
}

/** Groups saved results by tool, most used first. */
export function groupToolUsage(history: DashboardHistoryRow[], limit = 5): ToolUsageGroup[] {
    const groups = new Map<string, ToolUsageGroup>();

    for (const row of history) {
        const tool = row.tool || 'unknown';
        const existing = groups.get(tool);
        if (existing) {
            existing.count += 1;
            continue;
        }
        groups.set(tool, {
            tool,
            label: row.title?.trim() || tool,
            count: 1,
        });
    }

    return Array.from(groups.values())
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
        .slice(0, limit);
}

export function countThisWeek(history: DashboardHistoryRow[], now: Date = new Date()): number {
    return buildWeeklyActivity(history, 'en', now).reduce((total, bucket) => total + bucket.count, 0);
}

export function countUniqueTools(history: DashboardHistoryRow[]): number {
    return new Set(history.map((row) => row.tool).filter(Boolean)).size;
}

export function getInitials(name?: string | null, email?: string | null): string {
    const source = (name || email || 'MX').trim();
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return source.slice(0, 2).toUpperCase();
}

export function formatMemberSince(createdAt?: string | null, locale = 'en'): string {
    if (!createdAt) return '—';
    const parsed = new Date(createdAt);
    if (Number.isNaN(parsed.getTime())) return '—';
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en', {
        year: 'numeric',
        month: 'short',
    }).format(parsed);
}

export function formatDateTime(value?: string | null, locale = 'en'): string {
    if (!value) return '—';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '—';
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(parsed);
}

export function phaseFromCustomGoals(customGoals: unknown): PhaseKey {
    if (customGoals && typeof customGoals === 'object' && 'currentPhase' in customGoals) {
        const candidate = (customGoals as { currentPhase?: unknown }).currentPhase;
        if (typeof candidate === 'string' && (PHASE_KEYS as string[]).includes(candidate)) {
            return candidate as PhaseKey;
        }
    }
    return 'cutting';
}

export function isNutritionOrTrainingTool(tool: string): boolean {
    return /macro|nutrition|calorie|protein|water|bodyfat|body-fat|training|cycle|workout|progress/i.test(tool);
}
