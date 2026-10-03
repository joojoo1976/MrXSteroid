/**
 * server/seo/destinationVerification.ts
 * ============================================================================
 * Real destination-URL verification (spec §22).
 * ============================================================================
 * THE GAP THIS FILLS
 * ------------------
 * `SeoKeyword.destinationVerified` existed as a TYPE but nothing ever set it.
 * A destination was therefore either absent or copied blindly from whatever the
 * mapper suggested — nothing ever confirmed the page actually exists.
 *
 * §22 requires an HONEST answer per keyword:
 *     page exists      -> destination_verified = true
 *     page missing     -> destination_verified = false
 *     could not check  -> destination_verified stays null (UNVERIFIED)
 *
 * THREE states, not two, and that is the whole point. "We did not check" is not
 * the same claim as "we checked and it does not exist", and a boolean cannot
 * express both.
 *
 * SAFETY
 * ------
 * Only OUR OWN origin is ever fetched. Verifying a destination must never
 * become an outbound crawler pointed at arbitrary hosts, so a path that resolves
 * off-origin is refused rather than fetched.
 */

import { ProviderRunner } from './sources/providerRunner';

export type DestinationVerification =
    /** The page responded 2xx. */
    | 'verified'
    /** The page responded 4xx/5xx — it does not exist as far as we can tell. */
    | 'missing'
    /** No check was performed. Distinct from `missing`. */
    | 'unverified';

export interface DestinationCheckResult {
    path: string;
    url: string;
    verification: DestinationVerification;
    /** HTTP status when one was received, else null. */
    status: number | null;
    error?: string;
}

export interface VerifyDestinationsOptions {
    /** Our own origin, e.g. `https://mrxsteroid.com`. */
    siteOrigin: string;
    fetchImpl?: typeof fetch;
    runner?: ProviderRunner;
}

/**
 * True when `path` stays on our own origin.
 *
 * `//evil.com/x` and `https://evil.com/x` are both refused: they would leave the
 * site and turn a verification step into an outbound request to a third party.
 */
export function isSameOriginPath(path: string, siteOrigin: string): boolean {
    if (typeof path !== 'string') return false;
    const p = path.trim();
    if (!p.startsWith('/')) return false;
    // A protocol-relative URL starts with `//` and would escape the origin.
    if (p.startsWith('//')) return false;
    if (p.includes('..')) return false;
    if (/\s/.test(p)) return false;
    return true;
}

function classifyStatus(status: number): DestinationVerification {
    return status >= 200 && status < 300 ? 'verified' : 'missing';
}

/**
 * Verify a batch of destination paths against the real site.
 *
 * Never throws: an unreachable origin yields `unverified` per path rather than
 * aborting, because an unverified link must not block a weekly run.
 */
export async function verifyDestinations(
    paths: readonly string[],
    options: VerifyDestinationsOptions
): Promise<DestinationCheckResult[]> {
    const origin = options.siteOrigin.replace(/\/$/, '');
    const fetchImpl = options.fetchImpl ?? globalThis.fetch;
    const runner =
        options.runner ??
        new ProviderRunner({
            // A 404 is a definitive answer, not a transient failure, so it must
            // not be retried three times per keyword.
            policy: { maxAttempts: 1, baseDelayMs: 100, maxDelayMs: 1000, timeoutMs: 10_000 },
        });

    const results: DestinationCheckResult[] = [];

    // One dedupe: the same path is checked once, then shared.
    const unique = [...new Set(paths)];

    for (const path of unique) {
        if (!isSameOriginPath(path, origin)) {
            // Off-origin or malformed: refused WITHOUT a network call.
            results.push({
                path,
                url: '',
                verification: 'unverified',
                status: null,
                error: 'refused: path does not resolve to this site origin',
            });
            continue;
        }

        const url = `${origin}${path.startsWith('/') ? path : `/${path}`}`;
        const run = await runner.run('destination_verify', async () => {
            const res = await fetchImpl(url, {
                method: 'GET',
                redirect: 'manual',
                headers: { 'user-agent': 'MrXSteroid-SEO/1.0 (destination verification)' },
            });
            return res.status;
        });

        if (!run.ok) {
            results.push({
                path,
                url,
                // We did not learn whether it exists. NOT the same as `missing`.
                verification: 'unverified',
                status: null,
                error: run.error,
            });
            continue;
        }

        results.push({
            path,
            url,
            verification: classifyStatus(run.value as number),
            status: run.value as number,
        });
    }

    return results;
}

/**
 * Roll results up into the per-row flag the reports and API need.
 *
 * `null` means unverified — a value that must never be coerced to `false`,
 * because that would assert "the page is missing" when we simply did not look.
 */
export function toVerifiedFlag(v: DestinationVerification): boolean | null {
    if (v === 'verified') return true;
    if (v === 'missing') return false;
    return null;
}

/** Summary for the destination-coverage report. */
export function summariseVerification(
    results: readonly DestinationCheckResult[]
): { verified: number; missing: number; unverified: number; total: number } {
    let verified = 0;
    let missing = 0;
    let unverified = 0;
    for (const r of results) {
        if (r.verification === 'verified') verified += 1;
        else if (r.verification === 'missing') missing += 1;
        else unverified += 1;
    }
    return { verified, missing, unverified, total: results.length };
}