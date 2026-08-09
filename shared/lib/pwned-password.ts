/**
 * Client-side "leaked password" check against the HaveIBeenPwned Pwned
 * Passwords range API, using k-anonymity:
 *   - Only the first 5 chars of the SHA-1 hash (the "prefix") leave the
 *     browser — the full password/hash is never transmitted.
 *   - The API returns all suffixes that share that prefix; we look for ours.
 *
 * This mirrors Supabase's "Leaked Password Protection" (which is disabled on
 * this project's dashboard) with a free, dependency-free client check.
 */
export interface LeakedPasswordResult {
    leaked: boolean;
    /** true when the check could not complete (API down/timeout) */
    unavailable: boolean;
}

const API_URL = 'https://api.pwnedpasswords.com/range/';
const TIMEOUT_MS = 5000;

const sha1Hex = async (password: string): Promise<string> => {
    const data = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest('SHA-1', data);
    return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
};

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
    new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('timeout')), ms);
        promise.then(
            (v) => { clearTimeout(timer); resolve(v); },
            (e) => { clearTimeout(timer); reject(e); }
        );
    });

/**
 * Returns whether the password appears in known data breaches.
 * Fail-open: any network/API error returns `{ leaked: false, unavailable: true }`
 * so signup is never blocked by a temporary outage.
 */
export const isPasswordLeaked = async (password: string): Promise<LeakedPasswordResult> => {
    if (typeof crypto?.subtle?.digest !== 'function') {
        return { leaked: false, unavailable: true };
    }
    try {
        const hashHex = await sha1Hex(password);
        const prefix = hashHex.slice(0, 5);
        const suffix = hashHex.slice(5);

        const res = await withTimeout(fetch(`${API_URL}${prefix}`), TIMEOUT_MS);
        if (!res.ok) return { leaked: false, unavailable: true };

        const text = await res.text();
        const leaked = text.split('\n').some((line) => line.toUpperCase().startsWith(suffix));
        return { leaked, unavailable: false };
    } catch {
        return { leaked: false, unavailable: true };
    }
};
