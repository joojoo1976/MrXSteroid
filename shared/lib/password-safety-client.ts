/**
 * shared/lib/password-safety-client.ts
 *
 * Client helper for the server-side leaked-password check.
 *
 * The password is sent to OUR server over HTTPS (the app's own
 * /api/auth/check-password endpoint). It is never logged, never stored, and
 * only the SHA-1 prefix leaves our server (toward HIBP).
 *
 * Fail policy: the caller must treat any status other than 'safe' as a
 * block (fail-closed default). 'temporarily_unavailable' / 'error' mean the
 * check could not be completed — do not proceed with the operation.
 */
export type PasswordSafetyClientStatus =
    | 'safe'
    | 'leaked'
    | 'temporarily_unavailable'
    | 'rate_limited'
    | 'invalid_request'
    | 'forbidden'
    | 'payload_too_large'
    | 'method_not_allowed'
    | 'error';

export interface PasswordSafetyResult {
    status: PasswordSafetyClientStatus;
}

const KNOWN_STATUSES = new Set<PasswordSafetyClientStatus>([
    'safe',
    'leaked',
    'temporarily_unavailable',
    'rate_limited',
    'invalid_request',
    'forbidden',
    'payload_too_large',
    'method_not_allowed',
]);

export async function checkPasswordServerSide(
    password: string
): Promise<PasswordSafetyResult> {
    if (!password || typeof password !== 'string') {
        return { status: 'invalid_request' };
    }
    try {
        const res = await fetch('/api/auth/check-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
            cache: 'no-store',
        });
        const payload = (await res.json().catch(() => null)) as
            | { status?: PasswordSafetyClientStatus }
            | null;
        const status = payload?.status;
        if (status && KNOWN_STATUSES.has(status)) {
            return { status };
        }
        return { status: 'error' };
    } catch {
        return { status: 'error' };
    }
}