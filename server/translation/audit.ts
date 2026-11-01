/** Minimal, metadata-only operational event for the T1 translation boundary. */
export type TranslationAuditEvent = {
    readonly event: 'session_issued' | 'request_allowed' | 'request_rejected' | 'provider_failure' | 'circuit_open';
    readonly code?: string;
    readonly routeClass?: string;
    readonly surface?: string;
    readonly targetLanguage?: string;
    readonly characters?: number;
};

export type TranslationAuditSink = (event: TranslationAuditEvent) => void;

export const noopTranslationAuditSink: TranslationAuditSink = () => undefined;

/**
 * Explicit allowlist serialization. There is no field for source text, token,
 * credential, IP, email or another private value.
 */
export function safeTranslationAuditEvent(event: TranslationAuditEvent): TranslationAuditEvent {
    return {
        event: event.event,
        ...(event.code ? { code: event.code.slice(0, 80) } : {}),
        ...(event.routeClass ? { routeClass: event.routeClass.slice(0, 80) } : {}),
        ...(event.surface ? { surface: event.surface.slice(0, 80) } : {}),
        ...(event.targetLanguage ? { targetLanguage: event.targetLanguage.slice(0, 16) } : {}),
        ...(Number.isFinite(event.characters) ? { characters: Math.max(0, Math.trunc(event.characters!)) } : {}),
    };
}
