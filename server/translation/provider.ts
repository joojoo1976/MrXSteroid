/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  server/translation/provider.ts — T1 Foundation
 *
 *  Translation provider abstraction (spec §26).
 *
 *  The presentation layer must never talk to a concrete vendor. It talks to
 *  this interface only. That keeps Google-specific code confined to
 *  googleProvider.ts and makes a future provider swap a registration change.
 *
 *  §26  no Google-specific calls in UI components → interface boundary
 *  §23  provider exposes whether a target language is supported
 *  §32  modelIdentifier is part of provider identity (and therefore cache identity)
 *  §35  provider errors are typed so the engine can fail open to English
 *
 *  Server-side only. Nothing in this module may be imported from a client
 *  component: the concrete provider holds credentials (§28, §116).
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { TranslationSurface } from './contracts';

/** §32 — identifies the concrete model behind a provider instance. */
export interface ProviderIdentity {
    /** Stable provider key, e.g. 'google-cloud-translation-advanced'. */
    readonly providerId: string;
    /**
     * Model identifier, e.g. 'general/nmt'. Part of cache identity (§32, §50).
     * This is a MODEL id, never an API version such as 'v3'.
     */
    readonly modelIdentifier: string;
}

/** A single unit of work handed to the provider. */
export interface ProviderTranslationInput {
    readonly sourceLanguage: string;
    readonly targetLanguage: string;
    readonly texts: readonly string[];
    readonly surface: TranslationSurface;
}

export interface ProviderTranslationOutput {
    readonly texts: readonly string[];
}

export type ProviderErrorCode =
    | 'NOT_CONFIGURED'
    | 'UNSUPPORTED_LANGUAGE'
    | 'PROVIDER_ERROR'
    | 'TIMEOUT'
    | 'RATE_LIMITED'
    | 'QUOTA_EXCEEDED';

export class TranslationProviderError extends Error {
    readonly code: ProviderErrorCode;
    readonly retryable: boolean;

    constructor(code: ProviderErrorCode, message: string, retryable = false) {
        super(message);
        this.name = 'TranslationProviderError';
        this.code = code;
        this.retryable = retryable;
    }
}

/**
 * §26 — the single contract every provider implements.
 */
export interface TranslationProvider {
    readonly identity: ProviderIdentity;

    /**
     * §23 — capability check. The selector and the engine both consult this so
     * a language is never displayed as available when the provider cannot serve it.
     */
    supportsLanguage(targetLanguage: string): boolean;

    /**
     * §27 / §36 — translate a batch. Implementations must throw
     * TranslationProviderError (never a bare Error) so §35 fail-open to English
     * can distinguish provider faults from programming faults.
     */
    translate(input: ProviderTranslationInput): Promise<ProviderTranslationOutput>;
}
