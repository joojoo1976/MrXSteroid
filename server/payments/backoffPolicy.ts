/**
 * =============================================================================
 *  BACKOFF WINDOW POLICY - Phase 8 shared policy (spec 11/13 canonical)
 *  =============================================================================
 *
 *  Phase 7 shipped the reconciliation runner with its OWN inline backoff (it
 *  defined `delayForAttempt` and the default base/cap/max constants at the
 *  top of `reconciliationRunner.ts`). The webhook/fulfillment path ALSO
 *  carries its own exponential-delay copy used by the N-1 late-arrival guard
 *  (`canApplyWebhookToIntent`). Two copies, same spec => drift risk.
 *
 *  Phase 8 consolidates BOTH onto a single, pure, testable module. The
 *  canonical policy (spec 11 Phase 7 defaults, now frozen here):
 *
 *      baseMinutes = 5                     (delay = base * 2^(attempt-1))
 *      capMinutes  = 480  (8h)            absolute single-window ceiling
 *      maxAttempts = 12                    terminal per-intent cap (spec 13)
 *      jitterRatio = 0.40  (+/-40%)        applied on top of each window
 *
 *  All functions are PURE and deterministic given an injected `now`/seed,
 *  so unit tests assert exact windows without wall-clock flakiness.
 * =============================================================================
 */

/** Immutable reconciliation backoff policy (single source of truth). */
export interface BackoffWindowPolicy {
    baseMinutes: number;
    capMinutes: number;
    maxAttempts: number;
    jitterRatio: number;
}

/**
 * Canonical Phase 7/8 policy — every module MUST import THIS constant instead
 * of re-declaring its own `5 / 480 / 12` numbers inline.
 */
export const RECONCILIATION_POLICY: BackoffWindowPolicy = {
    baseMinutes: 5,
    capMinutes: 480,
    maxAttempts: 12,
    jitterRatio: 0.4,
};

/** A single computed do-not-poll-before window for one attempt ordinal. */
export interface NextAttemptWindow {
    /** UTC instant before which NO provider poll may run (inclusive). */
    nextAttemptAt: Date;
    /** Raw exponential delay in minutes (pre-jitter). */
    delayMinutes: number;
    /** Fully computed window in minutes (raw + jitter, capped). */
    windowMinutes: number;
    /** 1-based attempt ordinal this window describes. */
    attempt: number;
    /** True when this is the FINAL eligible attempt (attempt >= maxAttempts). */
    isFinal: boolean;
}

/** clamp to [0,1] (defensive; injected seeds from tests may be out of range). */
export function clamp01(value: number): number {
    if (!Number.isFinite(value)) return 0.5;
    return Math.min(0.999999, Math.max(0, value));
}

/**
 * Pure exponential delay for a 1-based attempt ordinal.
 *   delay = min(base * 2^(attempt-1), cap)
 * Backwards-compatible with Phase 7's inline `delayForAttempt`.
 */
export function delayForAttempt(
    attempt: number,
    baseMinutes: number = RECONCILIATION_POLICY.baseMinutes,
    capMinutes: number = RECONCILIATION_POLICY.capMinutes
): number {
    const ordinal = Math.max(1, Math.floor(attempt));
    const raw = baseMinutes * Math.pow(2, ordinal - 1);
    return Math.min(raw, capMinutes);
}

/**
 * Deterministic jitter pull in MINUTES for a (1-based) attempt ordinal.
 * Seed ∈ [0,1) (injectable) maps to a uniform offset in [-1,1] * jitterRatio.
 */
export function jitterMinutesForAttempt(
    attempt: number,
    seed: number,
    jitterRatio: number = RECONCILIATION_POLICY.jitterRatio
): number {
    const raw = delayForAttempt(attempt); // uses canonical base/cap
    const offset = (clamp01(seed) * 2 - 1) * raw * jitterRatio;
    return Number.isFinite(offset) ? offset : 0;
}

/**
 * The COMPLETE next-attempt window for a 1-based attempt ordinal.
 *
 *   windowMinutes = min( delayForAttempt(...) + jitter, capMinutes )
 *   nextAttemptAt = now + windowMinutes
 *
 * Pure + deterministic when `now`/`seed` are injected. Attempt ordinal uses
 * the intents' 1-based `reconciliation_attempts + 1` (next ordinal to run).
 */
export function computeNextAttemptWindow(
    attempt: number,
    now: Date = new Date(),
    seed: number = Math.random(),
    baseMinutes: number = RECONCILIATION_POLICY.baseMinutes,
    capMinutes: number = RECONCILIATION_POLICY.capMinutes
): NextAttemptWindow {
    const raw = delayForAttempt(attempt, baseMinutes, capMinutes);
    const jitter = jitterMinutesForAttempt(attempt, seed, RECONCILIATION_POLICY.jitterRatio);
    const windowMinutes = Math.max(0, Math.min(raw + jitter, capMinutes));
    const nextAttemptAt = new Date(now.getTime() + windowMinutes * 60_000);
    return {
        nextAttemptAt,
        delayMinutes: raw,
        windowMinutes,
        attempt,
        isFinal: Math.floor(attempt) >= RECONCILIATION_POLICY.maxAttempts,
    };
}

/**
 * Number of attempts still available (0 = terminal, no further polls).
 */
export function attemptsRemaining(
    attemptsUsed: number,
    maxAttempts: number = RECONCILIATION_POLICY.maxAttempts
): number {
    const used = Number.isFinite(attemptsUsed) && attemptsUsed > 0 ? Math.floor(attemptsUsed) : 0;
    return Math.max(0, maxAttempts - used);
}

/**
 * True when a stored `next_attempt_at` (UTC) is absent or already passed —
 * i.e. the intent is NOT inside its backoff window and may be polled again.
 */
export function isWindowOpen(nextAttemptAt: string | null | undefined, now: Date = new Date()): boolean {
    if (!nextAttemptAt) return true;
    const at = new Date(nextAttemptAt);
    if (Number.isNaN(at.getTime())) return true; // unparseable -> open (cannot deadlock)
    return at.getTime() <= now.getTime();
}
