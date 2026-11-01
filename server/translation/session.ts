import { createHmac, timingSafeEqual } from 'node:crypto';

/** Short-lived, server-signed translation authorization (§25–§27). */
export const TRANSLATION_SESSION_VERSION = 1;

export type TranslationSessionClaims = {
    readonly version: number;
    readonly sessionId: string;
    readonly sourceLanguage: 'en';
    readonly targetLanguage: string;
    readonly routePath: string;
    readonly routeClass: string;
    readonly surface: string;
    readonly issuedAt: number;
    readonly expiresAt: number;
    readonly maxRequests: number;
    readonly maxCharacters: number;
};

export type TranslationSessionIssueInput = {
    readonly sessionId: string;
    readonly targetLanguage: string;
    readonly routePath: string;
    readonly routeClass: string;
    readonly surface: string;
    readonly ttlMs: number;
    readonly maxRequests: number;
    readonly maxCharacters: number;
    readonly now?: number;
};

export type TranslationSessionVerification =
    | { readonly ok: true; readonly claims: TranslationSessionClaims }
    | { readonly ok: false; readonly code: 'TRANSLATION_SESSION_INVALID' | 'TRANSLATION_SESSION_EXPIRED' };

function encode(value: string): string {
    return Buffer.from(value, 'utf8').toString('base64url');
}
function decode(value: string): string {
    return Buffer.from(value, 'base64url').toString('utf8');
}
function sign(payload: string, secret: string): string {
    return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function issueTranslationSession(input: TranslationSessionIssueInput, secret: string): string {
    if (secret.length < 32) throw new Error('Translation session signing secret must contain at least 32 characters.');
    if (!Number.isFinite(input.ttlMs) || input.ttlMs <= 0) throw new Error('Translation session TTL must be positive.');
    if (!Number.isInteger(input.maxRequests) || input.maxRequests <= 0) throw new Error('Translation session request budget must be positive.');
    if (!Number.isInteger(input.maxCharacters) || input.maxCharacters <= 0) throw new Error('Translation session character budget must be positive.');
    const now = input.now ?? Date.now();
    const claims: TranslationSessionClaims = {
        version: TRANSLATION_SESSION_VERSION,
        sessionId: input.sessionId,
        sourceLanguage: 'en',
        targetLanguage: input.targetLanguage.toLowerCase().trim(),
        routePath: input.routePath,
        routeClass: input.routeClass,
        surface: input.surface,
        issuedAt: now,
        expiresAt: now + input.ttlMs,
        maxRequests: input.maxRequests,
        maxCharacters: input.maxCharacters,
    };
    const payload = encode(JSON.stringify(claims));
    return `${payload}.${sign(payload, secret)}`;
}

export function verifyTranslationSession(token: string, secret: string, now = Date.now()): TranslationSessionVerification {
    const [payload, signature, extra] = token.split('.');
    if (!payload || !signature || extra || secret.length < 32) return { ok: false, code: 'TRANSLATION_SESSION_INVALID' };
    const expected = sign(payload, secret);
    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
        return { ok: false, code: 'TRANSLATION_SESSION_INVALID' };
    }
    let claims: TranslationSessionClaims;
    try {
        claims = JSON.parse(decode(payload)) as TranslationSessionClaims;
    } catch {
        return { ok: false, code: 'TRANSLATION_SESSION_INVALID' };
    }
    if (
        claims.version !== TRANSLATION_SESSION_VERSION || claims.sourceLanguage !== 'en' ||
        typeof claims.sessionId !== 'string' || claims.sessionId === '' ||
        typeof claims.targetLanguage !== 'string' || claims.targetLanguage === '' ||
        typeof claims.routePath !== 'string' || !claims.routePath.startsWith('/') ||
        typeof claims.routeClass !== 'string' || claims.routeClass === '' ||
        typeof claims.surface !== 'string' || claims.surface === '' ||
        !Number.isSafeInteger(claims.issuedAt) || claims.issuedAt < 0 ||
        !Number.isSafeInteger(claims.expiresAt) || claims.expiresAt < 0 ||
        !Number.isInteger(claims.maxRequests) || claims.maxRequests <= 0 ||
        !Number.isInteger(claims.maxCharacters) || claims.maxCharacters <= 0
    ) return { ok: false, code: 'TRANSLATION_SESSION_INVALID' };
    if (now < claims.issuedAt || now >= claims.expiresAt || claims.expiresAt <= claims.issuedAt) return { ok: false, code: 'TRANSLATION_SESSION_EXPIRED' };
    return { ok: true, claims };
}

export function translationSessionSecretFromEnv(): string | null {
    const value = process.env.TRANSLATION_SESSION_SECRET?.trim() ?? '';
    return value.length >= 32 ? value : null;
}
