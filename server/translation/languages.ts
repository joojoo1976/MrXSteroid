/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  server/translation/languages.ts — T1 Foundation
 *
 *  TWO DISTINCT CONCERNS, DELIBERATELY KEPT APART (spec §19, §20, §22, §23):
 *
 *    1. APPLICATION language registry — this file.
 *       Which languages the product is willing to present, what each is called,
 *       its text direction, and which countries imply it. This is product
 *       policy, fully known at build time.
 *
 *    2. PROVIDER capability (§23).
 *       Whether the configured vendor can actually serve a given target RIGHT
 *       NOW. That is a runtime fact about a third-party service, not product
 *       policy, and this module cannot know it.
 *
 *  Why the split matters: a hardcoded `providerSupport: true` in a registry is
 *  a claim about Google's API made by a file that has never spoken to Google.
 *  It silently rots the moment Google adds, retires, or region-restricts a
 *  language pair, and it makes an outage look like a working feature. So every
 *  entry below is `unverified` by construction, and the ONLY function that
 *  answers "can we offer this right now" intersects both concerns:
 *
 *      getVerifiedRuntimeTargets(providerVerifiedTargets)
 *
 *  Capability is supplied by the provider, which discovers it from the vendor
 *  API (googleProvider.ts uses the v3 GetSupportedLanguages method). It is
 *  passed in as an explicit set; it is never inferred from the registry.
 *
 *  §7/§8 — canonical languages (en, ar) are never runtime targets. Arabic is
 *  human-authored, not machine output, so `runtimeTranslatable` is false for it
 *  and the target validator rejects it before any provider call.
 *
 *  D-09: this registry is standalone. It does NOT import shared/types/types.ts,
 *  and shared/types/types.ts is NOT modified — the legacy `Language` enum and
 *  `ContentStrings` are untouched.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * §23 — what we actually know about a vendor's ability to serve a target.
 * The registry never advances this on its own; only a provider response does.
 */
export type ProviderCapability = 'unverified' | 'supported' | 'unsupported';

export type RegistryLanguage = {
    /** ISO-639-1 base code, e.g. 'fr'. */
    code: string;
    displayName: string;
    nativeName: string;
    /** §20 — product kill-switch, independent of provider capability. */
    enabled: boolean;
    /** §7/§8 — may this language ever be machine-translated into? */
    runtimeTranslatable: boolean;
    /** §21 — human-authored canonical language (en, ar). */
    canonical: boolean;
    /** §3 — English is the sole permitted runtime source. */
    runtimeSource: boolean;
    /** §25 — right-to-left script. */
    rtl: boolean;
    countryMappings: readonly string[];
    /**
     * §23 — vendor capability. Uniformly 'unverified' here by design; this
     * module has no channel to the vendor. Only a provider may set a real value.
     */
    providerCapability: ProviderCapability;
    priority: number;
};

/** Application runtime scope. Six languages — T1 does not expand this. */
const RUNTIME_LANGUAGES: readonly RegistryLanguage[] = [
    {
        code: 'fr',
        displayName: 'French',
        nativeName: 'Français',
        enabled: true,
        runtimeTranslatable: true,
        canonical: false,
        runtimeSource: false,
        rtl: false,
        countryMappings: ['FR', 'BE', 'CH', 'CA'],
        providerCapability: 'unverified',
        priority: 1,
    },
    {
        code: 'de',
        displayName: 'German',
        nativeName: 'Deutsch',
        enabled: true,
        runtimeTranslatable: true,
        canonical: false,
        runtimeSource: false,
        rtl: false,
        countryMappings: ['DE', 'AT', 'CH'],
        providerCapability: 'unverified',
        priority: 2,
    },
    {
        code: 'es',
        displayName: 'Spanish',
        nativeName: 'Español',
        enabled: true,
        runtimeTranslatable: true,
        canonical: false,
        runtimeSource: false,
        rtl: false,
        countryMappings: ['ES', 'MX', 'AR', 'CO'],
        providerCapability: 'unverified',
        priority: 3,
    },
    {
        code: 'tr',
        displayName: 'Turkish',
        nativeName: 'Türkçe',
        enabled: true,
        runtimeTranslatable: true,
        canonical: false,
        runtimeSource: false,
        rtl: false,
        countryMappings: ['TR'],
        providerCapability: 'unverified',
        priority: 4,
    },
    {
        code: 'it',
        displayName: 'Italian',
        nativeName: 'Italiano',
        enabled: true,
        runtimeTranslatable: true,
        canonical: false,
        runtimeSource: false,
        rtl: false,
        countryMappings: ['IT', 'CH'],
        providerCapability: 'unverified',
        priority: 5,
    },
    {
        code: 'pt',
        displayName: 'Portuguese',
        nativeName: 'Português',
        enabled: true,
        runtimeTranslatable: true,
        canonical: false,
        runtimeSource: false,
        rtl: false,
        countryMappings: ['PT', 'BR'],
        providerCapability: 'unverified',
        priority: 6,
    },
] as const;

/** §21 — canonical, human-authored languages. Never machine-translation targets. */
const CANONICAL_LANGUAGES: readonly RegistryLanguage[] = [
    {
        code: 'ar',
        displayName: 'Arabic',
        nativeName: 'العربية',
        enabled: true,
        runtimeTranslatable: false,
        canonical: true,
        runtimeSource: false,
        rtl: true,
        countryMappings: [
            'SA', 'EG', 'AE', 'BH', 'DJ', 'DZ', 'IQ', 'JO', 'KM', 'KW', 'LB', 'LY', 'MA', 'MR', 'OM', 'PS', 'QA', 'SD', 'SO', 'SY', 'TN', 'YE', 'EH',
        ],
        providerCapability: 'unverified',
        priority: 0,
    },
    {
        code: 'en',
        displayName: 'English',
        nativeName: 'English',
        enabled: true,
        runtimeTranslatable: false,
        canonical: true,
        runtimeSource: true,
        rtl: false,
        countryMappings: [],
        providerCapability: 'unverified',
        priority: 0,
    },
];

const REGISTRY: readonly RegistryLanguage[] = [...CANONICAL_LANGUAGES, ...RUNTIME_LANGUAGES];

const BY_CODE = new Map<string, RegistryLanguage>(REGISTRY.map((l) => [l.code, l]));

export function getLanguage(code: string): RegistryLanguage | undefined {
    return BY_CODE.get(code.toLowerCase().trim());
}

export function isCanonical(code: string): boolean {
    return !!BY_CODE.get(code.toLowerCase().trim())?.canonical;
}

export function isRtl(code: string): boolean {
    return !!BY_CODE.get(code.toLowerCase().trim())?.rtl;
}

/**
 * §20 — APPLICATION runtime scope only. This says nothing about whether a
 * vendor can serve these. Use getVerifiedRuntimeTargets() for that.
 */
export function isRuntimeTranslatable(code: string): boolean {
    const entry = BY_CODE.get(code.toLowerCase().trim());
    return !!entry && entry.enabled && entry.runtimeTranslatable && !entry.canonical;
}

/** §20 — every enabled application runtime target, ordered by priority. */
export function getRuntimeLanguages(): readonly RegistryLanguage[] {
    return RUNTIME_LANGUAGES.filter((l) => l.enabled && l.runtimeTranslatable && !l.canonical);
}

export function getEnabledLanguages(): readonly RegistryLanguage[] {
    return REGISTRY.filter((l) => l.enabled);
}

export function getAllLanguages(): readonly RegistryLanguage[] {
    return REGISTRY;
}

/**
 * §23 — the honest intersection of both concerns.
 *
 * `providerTargets` must be a set the PROVIDER verified (Google
 * GetSupportedLanguages → `supportTarget: true`). Only languages that are both
 * in application scope AND confirmed by the vendor are returned, so a language
 * is never offered that the provider would reject.
 *
 * An empty or absent set yields an empty list — fail-safe, so an unconfigured or
 * unreachable provider offers nothing rather than offering broken targets.
 */
export function getVerifiedRuntimeTargets(
    providerTargets: ReadonlySet<string> | null | undefined
): readonly RegistryLanguage[] {
    if (!providerTargets || providerTargets.size === 0) return [];
    const verified = new Set(Array.from(providerTargets, (code) => code.toLowerCase().trim()));
    return getRuntimeLanguages().filter((language) => verified.has(language.code));
}

export type TargetLanguageValidation =
    | { valid: true; language: RegistryLanguage; providerCapability: ProviderCapability }
    | { valid: false; reason: string };

/**
 * §38 — application-scope gate, applied before any provider call.
 *
 * Application policy is always enforced. Provider capability is enforced ONLY
 * when the caller supplies a verified set; with no set, capability is reported
 * as 'unverified' rather than being guessed. Callers that have a live provider
 * should pass its verified targets.
 */
export function validateTargetLanguage(
    code: string,
    providerTargets?: ReadonlySet<string> | null
): TargetLanguageValidation {
    const normalized = code.toLowerCase().trim();
    if (!normalized) return { valid: false, reason: 'empty_target' };

    const entry = BY_CODE.get(normalized);
    if (!entry) return { valid: false, reason: 'unknown_language' };
    if (entry.canonical) return { valid: false, reason: 'canonical_not_runtime_target' };
    if (!entry.enabled) return { valid: false, reason: 'disabled' };
    if (!entry.runtimeTranslatable) return { valid: false, reason: 'not_runtime_translatable' };

    if (providerTargets) {
        const verified = new Set(Array.from(providerTargets, (value) => value.toLowerCase().trim()));
        if (!verified.has(entry.code)) return { valid: false, reason: 'provider_unsupported' };
        return { valid: true, language: entry, providerCapability: 'supported' };
    }

    return { valid: true, language: entry, providerCapability: entry.providerCapability };
}

export function assertEnglishSource(source: string): void {
    if (source.toLowerCase().trim() !== 'en') {
        throw Object.assign(new Error(`Runtime translation source must be 'en', got '${source}'`), { code: 'INVALID_SOURCE' });
    }
}

/** §3 — non-throwing form of assertEnglishSource, for use in request gates. */
export function isEnglishSource(source: string | null | undefined): boolean {
    return (source ?? '').trim().toLowerCase() === 'en';
}
