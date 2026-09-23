/**
 * server/auth/passwordSafety.ts — Application-level HIBP (HaveIBeenPwned)
 * leaked-password check, server-side, using the Pwned Passwords range API
 * with k-anonymity.
 *
 * Security contract:
 *  - Only the FIRST FIVE characters of the SHA-1 digest leave this server.
 *  - The password itself, its full hash, and request bodies are NEVER logged.
 *  - No email / user identifier is ever sent to HIBP.
 *  - Response statuses are limited to: 'leaked' | 'safe' | 'temporarily_unavailable'.
 *
 * This replaces (not duplicates) the client-side UX check and gives the app a
 * server-side security boundary the user cannot bypass by disabling JS. It is
 * NOT equivalent to Supabase's native leak protection: an attacker can still
 * call Supabase GoTrue directly, outside this application.
 */
import { createHash } from 'node:crypto';

export type PasswordLeakStatus = 'leaked' | 'safe' | 'temporarily_unavailable';

const HIBP_RANGE_URL = 'https://api.pwnedpasswords.com/range/';
const TIMEOUT_MS = 5000;

/**
 * Resolves the HIBP failure policy from the environment.
 * Default is CLOSED: when HIBP is unreachable, we treat the password as
 * "cannot be verified" and block the operation. `open` is an emergency
 * override available via PASSWORD_LEAK_CHECK_FAIL_MODE=open.
 */
export function passwordLeakFailMode(): 'open' | 'closed' {
    const mode = (process.env.PASSWORD_LEAK_CHECK_FAIL_MODE ?? 'closed').trim().toLowerCase();
    return mode === 'open' ? 'open' : 'closed';
}

const sha1Hex = (password: string): string =>
    createHash('sha1').update(password, 'utf8').digest('hex').toUpperCase();

/**
 * Checks a password against HIBP's range endpoint.
 * @param password - the plaintext password (never logged, never stored).
 * @param failMode - failure policy: 'closed' (default) blocks on outage.
 */
export async function checkPasswordLeaked(
    password: string,
    failMode: 'open' | 'closed' = 'closed'
): Promise<PasswordLeakStatus> {
    try {
        const hashHex = sha1Hex(password);
        const prefix = hashHex.slice(0, 5);
        const suffix = hashHex.slice(5);

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
        let res: Response;
        try {
            res = await fetch(`${HIBP_RANGE_URL}${prefix}`, {
                signal: controller.signal,
                headers: {
                    // Ask HIBP to pad the response so third parties cannot infer
                    // the exact prefix frequency (anti side-channel).
                    'Add-Padding': 'true',
                    'User-Agent': 'mrxsteroid-password-safety',
                },
            });
        } finally {
            clearTimeout(timer);
        }

        if (!res.ok) {
            return failMode === 'closed' ? 'temporarily_unavailable' : 'safe';
        }

        const text = await res.text();
        const leaked = text.split('\n').some((line) => {
            const [lineSuffix] = line.trim().split(':');
            return lineSuffix?.toUpperCase() === suffix;
        });

        return leaked ? 'leaked' : 'safe';
    } catch {
        // Fetch failure, timeout, or abort → cannot verify.
        return failMode === 'closed' ? 'temporarily_unavailable' : 'safe';
    }
}