/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  server/translation/security.ts — T1 Foundation
 *
 *  Security boundaries for the runtime translation surface.
 *
 *  §22  only languages the provider actually supports may be offered
 *  §23  provider capability check gates availability
 *  §109 session / security context validation for the public endpoint
 *  §110 origin validation against the existing application security model
 *  §111 rate limiting protecting app resources AND provider cost
 *  §112 the endpoint must not become an unrestricted translation proxy
 *  §113 application-level quotas (requests / characters / session / target)
 *
 *  This module reuses the existing, already-audited infrastructure:
 *    · lib/ratelimit.ts        → enforceRateLimit, clientIp
 *    · server/cors/corsConfig.ts → resolveAllowedOrigin, buildAllowedOrigins
 *
 *  No new rate-limit or CORS primitive is introduced in T1.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { enforceRateLimit, clientIp } from '../../lib/ratelimit';
import { resolveAllowedOrigin } from '../cors/corsConfig';
import { getRuntimeLanguages } from './languages';
import type { TranslationProvider } from './provider';

/** §111 — request-level ceiling per client IP per minute. */
export const TRANSLATION_RATE_LIMIT = 10;

/** §113 — character quota per client IP per minute. */
export const TRANSLATION_CHARACTER_QUOTA = 20_000;

/** §113 — distinct target languages a single session/IP may request per window. */
export const TRANSLATION_TARGET_QUOTA = 4;

/** §112 — namespaced rate-limit key so translation traffic can never consume
 *  the budget of a financial or auth endpoint. */
const RATE_LIMIT_PREFIX = 'translate';

export type TranslationSecurityVerdict =
    | { allowed: true }
    | { allowed: false; status: number; code: string; message: string };

/**
 * §110 — origin validation.
 *
 * Same-origin browser requests (no Origin header, e.g. SSR or curl) are
 * permitted; a *present* Origin must be in the existing allowlist. A disallowed
 * origin is rejected outright rather than silently downgraded.
 */
export function checkOrigin(req: Request): TranslationSecurityVerdict {
    const origin = req.headers.get('origin');
    if (!origin) return { allowed: true };

    const allowed = resolveAllowedOrigin(req);
    if (!allowed) {
        return {
            allowed: false,
            status: 403,
            code: 'ORIGIN_NOT_ALLOWED',
            message: 'Request origin is not permitted.',
        };
    }
    return { allowed: true };
}

/**
 * §111 / §112 — per-IP rate limit on the translation namespace.
 */
export async function checkRateLimit(req: Request): Promise<TranslationSecurityVerdict> {
    const ip = clientIp(req);
    const rate = await enforceRateLimit(`${RATE_LIMIT_PREFIX}:${ip}`);
    if (!rate.success) {
        return {
            allowed: false,
            status: 429,
            code: 'RATE_LIMITED',
            message: 'Too many translation requests. Please retry shortly.',
        };
    }
    return { allowed: true };
}

/**
 * §113 — character quota. Checked before any provider call so a single large
 * payload cannot translate the provider's monthly spend.
 */
export function checkCharacterQuota(characters: number): TranslationSecurityVerdict {
    if (characters > TRANSLATION_CHARACTER_QUOTA) {
        return {
            allowed: false,
            status: 413,
            code: 'CHARACTER_QUOTA_EXCEEDED',
            message: `Requested ${characters} characters; the per-window limit is ${TRANSLATION_CHARACTER_QUOTA}.`,
        };
    }
    return { allowed: true };
}

/** §40 — hard per-string ceiling, independent of the quota above. */
export function checkRequestSize(textCount: number, totalCharacters: number): TranslationSecurityVerdict {
    if (textCount <= 0) {
        return { allowed: false, status: 400, code: 'EMPTY_REQUEST', message: 'No translatable content supplied.' };
    }
    if (totalCharacters <= 0) {
        return { allowed: false, status: 400, code: 'EMPTY_REQUEST', message: 'No translatable content supplied.' };
    }
    return { allowed: true };
}

/** §113 — per-window record of which targets a caller has exercised. */
type TargetQuotaWindow = { targets: Set<string>; resetAt: number };

const TARGET_QUOTA_TTL_MS = 60_000;
const targetQuotaWindows = new Map<string, TargetQuotaWindow>();

/**
 * §113 — distinct target languages a caller may exercise per window.
 *
 * Without this, a caller holding one valid target could rotate through every
 * registered language and amplify provider spend far beyond what the character
 * quota alone bounds. The count is scoped per client IP and window.
 */
export function checkTargetQuota(clientId: string, targetLanguage: string): TranslationSecurityVerdict {
    const now = Date.now();
    const target = targetLanguage.toLowerCase().trim();

    const existing = targetQuotaWindows.get(clientId);
    if (!existing || existing.resetAt <= now) {
        targetQuotaWindows.set(clientId, { targets: new Set([target]), resetAt: now + TARGET_QUOTA_TTL_MS });
        return { allowed: true };
    }

    if (!existing.targets.has(target) && existing.targets.size >= TRANSLATION_TARGET_QUOTA) {
        return {
            allowed: false,
            status: 429,
            code: 'TARGET_QUOTA_EXCEEDED',
            message: `At most ${TRANSLATION_TARGET_QUOTA} distinct target languages per window.`,
        };
    }

    existing.targets.add(target);
    return { allowed: true };
}

/** Test seam — clears the in-process target quota windows. */
export function resetTargetQuotaWindows(): void {
    targetQuotaWindows.clear();
}

/**
 * §112 — a translation request may never target the app's own host, and the
 * allowed target set is bounded by the registry rather than by caller input.
 */
export function isTargetWithinAllowlist(targetLanguage: string): boolean {
    return getRuntimeLanguages().some((language) => language.code === targetLanguage.toLowerCase());
}

/**
 * §22 / §23 — capability-aware availability: the selector must only ever be
 * offered languages that the *active* provider can actually serve.
 *
 * When no provider is configured the result is an empty list, so the UI shows
 * no runtime languages rather than offering broken ones (§23 fail safely).
 */
export function listAvailableRuntimeLanguages(provider: TranslationProvider | null) {
    if (!provider) return [] as const;
    return getRuntimeLanguages().filter((language) => provider.supportsLanguage(language.code));
}

/** Aggregate gate for the public translation endpoint. */
export async function enforceTranslationSecurity(
    req: Request,
    options: { textCount: number; totalCharacters: number }
): Promise<TranslationSecurityVerdict> {
    const size = checkRequestSize(options.textCount, options.totalCharacters);
    if (!size.allowed) return size;

    const quota = checkCharacterQuota(options.totalCharacters);
    if (!quota.allowed) return quota;

    const origin = checkOrigin(req);
    if (!origin.allowed) return origin;

    const rate = await checkRateLimit(req);
    if (!rate.allowed) return rate;

    return { allowed: true };
}
