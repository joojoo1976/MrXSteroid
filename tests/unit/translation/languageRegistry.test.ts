/**
 * T1 Foundation — language registry (spec §19–§25) and request contracts
 * (spec §33, §36–§40).
 *
 * Registry is INDEPENDENT of shared/types/types.ts by adopted decision D-09:
 * `ContentStrings` and `Language` are untouched, so this suite also asserts
 * that the registry does not depend on them.
 */
import { describe, it, expect } from 'vitest';
import {
    getLanguage,
    isRuntimeTranslatable,
    isCanonical,
    isRtl,
    getRuntimeLanguages,
    getVerifiedRuntimeTargets,
    getAllLanguages,
    validateTargetLanguage,
    assertEnglishSource,
    type RegistryLanguage,
} from '../../../server/translation/languages';
import {
    TRANSLATION_ENGINE_VERSION,
    TRANSLATION_GLOSSARY_VERSION,
    RUNTIME_SOURCE_LANGUAGE,
    MAX_SOURCE_CHARS,
    MAX_BATCH_SIZE,
    TRANSLATION_SURFACES,
    normalizeSourceLanguage,
    validateTranslationRequest,
    TranslationRequestSchema,
} from '../../../server/translation/contracts';
import {
    GoogleAdvancedTranslationProvider,
    buildTranslateTextRequest,
    buildSupportedLanguagesRequest,
    createGoogleProviderFromEnv,
    GOOGLE_GENERAL_NMT_MODEL,
    GOOGLE_MAX_CONTENTS,
    GOOGLE_MAX_CODEPOINTS_PER_CONTENT,
    type GoogleAdvancedConfig,
} from '../../../server/translation/googleProvider';

describe('T1 · language registry (§19–§25)', () => {
    it('§20 exposes the full required metadata shape on every entry', () => {
        const required: (keyof RegistryLanguage)[] = [
            'code', 'displayName', 'nativeName', 'enabled', 'runtimeTranslatable',
            'canonical', 'runtimeSource', 'rtl', 'countryMappings', 'providerCapability', 'priority',
        ];
        for (const language of getAllLanguages()) {
            for (const field of required) {
                expect(language, `${language.code}.${field}`).toHaveProperty(field);
            }
        }
    });

    it('§21 marks Arabic canonical and NOT runtime-translatable (§8)', () => {
        const ar = getLanguage('ar');
        expect(ar?.canonical).toBe(true);
        expect(ar?.runtimeTranslatable).toBe(false);
        expect(ar?.runtimeSource).toBe(false);
        expect(validateTargetLanguage('ar')).toEqual({
            valid: false,
            reason: 'canonical_not_runtime_target',
        });
    });

    it('§3/§21 marks English the sole runtime source', () => {
        const en = getLanguage('en');
        expect(en?.canonical).toBe(true);
        expect(en?.runtimeSource).toBe(true);
        expect(RUNTIME_SOURCE_LANGUAGE).toBe('en');
    });

    it('§7 never offers Arabic as a runtime translation target', () => {
        const runtime = getRuntimeLanguages().map((l) => l.code);
        expect(runtime).not.toContain('ar');
    });

    it('§19 is not the tiny hardcoded fr/de/es/it list alone', () => {
        const codes = getRuntimeLanguages().map((l) => l.code);
        expect(codes.length).toBeGreaterThan(4);
        for (const expected of ['fr', 'de', 'es', 'tr', 'it', 'pt']) {
            expect(codes).toContain(expected);
        }
    });

    it('§24 uses native naming for display', () => {
        expect(getLanguage('de')?.nativeName).toBe('Deutsch');
        expect(getLanguage('es')?.nativeName).toBe('Español');
        expect(getLanguage('fr')?.nativeName).toBe('Français');
        expect(getLanguage('it')?.nativeName).toBe('Italiano');
        expect(getLanguage('pt')?.nativeName).toBe('Português');
        expect(getLanguage('tr')?.nativeName).toBe('Türkçe');
    });

    it('§25 carries RTL metadata; Arabic canonical is RTL', () => {
        expect(isRtl('ar')).toBe(true);
        for (const language of getRuntimeLanguages()) {
            expect(typeof language.rtl).toBe('boolean');
        }
    });

    it('§38 rejects unknown / empty targets', () => {
        expect(validateTargetLanguage('')).toEqual({ valid: false, reason: 'empty_target' });
        expect(validateTargetLanguage('xx')).toEqual({ valid: false, reason: 'unknown_language' });
    });

    it('§22 only enabled + runtime-translatable languages are in app scope', () => {
        for (const code of ['fr', 'de', 'es', 'tr', 'it', 'pt']) {
            expect(isRuntimeTranslatable(code)).toBe(true);
        }
        expect(isRuntimeTranslatable('en')).toBe(false);
        expect(isRuntimeTranslatable('ar')).toBe(false);
    });

    it('§23 app scope makes NO claim about provider capability', () => {
        // Every registry entry is unverified: the registry has no channel to the
        // vendor, so it must not assert a fact about Google's API.
        for (const language of getAllLanguages()) {
            expect(language.providerCapability).toBe('unverified');
        }
        // …and there is no hardcoded boolean that could smuggle the claim back in.
        expect('providerSupport' in getLanguage('fr')!).toBe(false);
    });

    it('§23 getRuntimeLanguages is app scope, not a capability claim', () => {
        const codes = getRuntimeLanguages().map((l) => l.code);
        expect(codes).toEqual(expect.arrayContaining(['fr', 'de', 'es', 'tr', 'it', 'pt']));
        for (const language of getRuntimeLanguages()) {
            expect(language.providerCapability).toBe('unverified');
        }
    });

    it('D-09 · registry does not import the legacy Language enum', async () => {
        const { readFileSync } = await import('node:fs');
        const { fileURLToPath } = await import('node:url');
        const source = readFileSync(
            fileURLToPath(new URL('../../../server/translation/languages.ts', import.meta.url)),
            'utf8'
        );
        // D-09: the registry is standalone; shared/types/types.ts stays untouched.
        // Match real import/require statements, not the prose that names the file.
        expect(source).not.toMatch(/(from|require\()\s*['"][^'"]*shared\/types\/types/);
        // …and it imports nothing from shared/ at all.
        expect(source).not.toMatch(/(from|require\()\s*['"][^'"]*\/shared\//);
    });
});

describe('T1 · §23 provider capability is separate from app scope', () => {
    it('reports no available target when the provider has verified nothing', () => {
        expect(getVerifiedRuntimeTargets(null)).toHaveLength(0);
        expect(getVerifiedRuntimeTargets(undefined)).toHaveLength(0);
        expect(getVerifiedRuntimeTargets(new Set<string>())).toHaveLength(0);
    });

    it('offers only the intersection of app scope and verified targets', () => {
        const verified = getVerifiedRuntimeTargets(new Set(['fr', 'de', 'xx']));
        expect(verified.map((l) => l.code).sort()).toEqual(['de', 'fr']);
    });

    it('ignores a verified target that is not in application scope', () => {
        // 'ar' is canonical and must never surface, even if a vendor claimed it.
        const verified = getVerifiedRuntimeTargets(new Set(['ar', 'en', 'zh-CN']));
        expect(verified.map((l) => l.code)).toEqual([]);
    });

    it('validateTargetLanguage reports unverified when no capability set is given', () => {
        const result = validateTargetLanguage('fr');
        expect(result.valid).toBe(true);
        if (result.valid) expect(result.providerCapability).toBe('unverified');
    });

    it('validateTargetLanguage reports supported when the provider confirmed it', () => {
        const result = validateTargetLanguage('fr', new Set(['fr']));
        expect(result.valid).toBe(true);
        if (result.valid) expect(result.providerCapability).toBe('supported');
    });

    it('validateTargetLanguage rejects an unverified target once capability is known', () => {
        const result = validateTargetLanguage('fr', new Set(['de']));
        expect(result).toEqual({ valid: false, reason: 'provider_unsupported' });
    });

    it('§8 canonical rejection precedes any provider consideration', () => {
        const result = validateTargetLanguage('ar', new Set(['ar']));
        expect(result).toEqual({ valid: false, reason: 'canonical_not_runtime_target' });
    });
});

describe('T1 · contracts (§33, §36–§40)', () => {
    // §33 — sourceLanguage is part of the contract, never inferred.
    const validRequest = {
        sourceLanguage: 'en',
        targetLanguage: 'fr',
        sourceText: 'Hello world',
        surface: 'public-content',
    };

    it('§33/§34 define version identifiers', () => {
        expect(TRANSLATION_ENGINE_VERSION).toBe('v1');
        expect(TRANSLATION_GLOSSARY_VERSION).toBe('none');
    });

    it('§33 a missing sourceLanguage fails validation explicitly', () => {
        const { sourceLanguage: _omitted, ...withoutSource } = validRequest;
        const result = validateTranslationRequest(withoutSource);
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.code).toBe('MISSING_SOURCE_LANGUAGE');
        }
    });

    it('§33 the schema rejects a missing sourceLanguage on its own', () => {
        const { sourceLanguage: _omitted, ...withoutSource } = validRequest;
        expect(TranslationRequestSchema.safeParse(withoutSource).success).toBe(false);
    });

    it('§33 an empty sourceLanguage is not silently treated as English', () => {
        const result = validateTranslationRequest({ ...validRequest, sourceLanguage: '' });
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('MISSING_SOURCE_LANGUAGE');
    });

    it('§33 a whitespace-only sourceLanguage is rejected', () => {
        const result = validateTranslationRequest({ ...validRequest, sourceLanguage: '   ' });
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('MISSING_SOURCE_LANGUAGE');
    });

    it('§33 normalizeSourceLanguage has no default branch', () => {
        expect(() => normalizeSourceLanguage('')).toThrow(/required/);
        expect(() => normalizeSourceLanguage('   ')).toThrow(/required/);
        expect(() => normalizeSourceLanguage('ar')).toThrow(/must be 'en'/);
        expect(normalizeSourceLanguage('en')).toBe('en');
        expect(normalizeSourceLanguage('EN')).toBe('en');
    });

    it('§67 exposes only allowlisted surfaces', () => {
        expect(TRANSLATION_SURFACES).toContain('header');
        expect(TRANSLATION_SURFACES).toContain('faq');
        for (const forbidden of ['admin', 'payment', 'profile', 'dashboard', 'affiliate']) {
            expect(TRANSLATION_SURFACES).not.toContain(forbidden);
        }
    });

    it('§36 accepts a well-formed request and stamps versions', () => {
        const result = validateTranslationRequest(validRequest);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.value.sourceLanguage).toBe('en');
            expect(result.value.targetLanguage).toBe('fr');
            expect(result.value.engineVersion).toBe(TRANSLATION_ENGINE_VERSION);
            expect(result.value.glossaryVersion).toBe(TRANSLATION_GLOSSARY_VERSION);
            expect(result.value.providerCapability).toBe('unverified');
        }
    });

    it('§23 capability is reported as supported when the provider verified it', () => {
        const result = validateTranslationRequest(validRequest, new Set(['fr']));
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value.providerCapability).toBe('supported');
    });

    it('§23 an unverified target is refused once capability is known', () => {
        const result = validateTranslationRequest(validRequest, new Set(['de']));
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('PROVIDER_UNSUPPORTED');
    });

    it('§37 rejects any non-English runtime source', () => {
        for (const forbidden of ['ar', 'fr', 'de', 'es']) {
            const result = validateTranslationRequest({ ...validRequest, sourceLanguage: forbidden });
            expect(result.ok).toBe(false);
            if (!result.ok) expect(result.code).toBe('INVALID_SOURCE_LANGUAGE');
        }
    });

    it('§4/§5 reject a translated language as source (no chaining)', () => {
        expect(() => normalizeSourceLanguage('ar')).toThrow(/must be 'en'/);
        expect(() => assertEnglishSource('fr')).toThrow(/must be 'en'/);
    });

    it('§38 blocks canonical and unknown targets before the provider', () => {
        const arabic = validateTranslationRequest({ ...validRequest, targetLanguage: 'ar' });
        expect(arabic.ok).toBe(false);
        if (!arabic.ok) expect(arabic.code).toBe('CANONICAL_TARGET_NOT_ALLOWED');

        const unknown = validateTranslationRequest({ ...validRequest, targetLanguage: 'xx' });
        expect(unknown.ok).toBe(false);
        if (!unknown.ok) expect(unknown.code).toBe('UNKNOWN_LANGUAGE');
    });

    it('§39 rejects empty and whitespace-only content', () => {
        const empty = validateTranslationRequest({ ...validRequest, sourceText: '' });
        expect(empty.ok).toBe(false);
        if (!empty.ok) expect(empty.code).toBe('EMPTY_SOURCE_TEXT');

        const blank = validateTranslationRequest({ ...validRequest, sourceText: '   \n\t  ' });
        expect(blank.ok).toBe(false);
        if (!blank.ok) expect(blank.code).toBe('BLANK_SOURCE_TEXT');
    });

    it('§40 rejects oversized content', () => {
        const huge = validateTranslationRequest({
            ...validRequest,
            sourceText: 'x'.repeat(MAX_SOURCE_CHARS + 1),
        });
        expect(huge.ok).toBe(false);
        if (!huge.ok) expect(huge.code).toBe('SOURCE_TEXT_TOO_LONG');
    });

    it('§68 rejects a non-allowlisted surface', () => {
        const admin = validateTranslationRequest({ ...validRequest, surface: 'admin' });
        expect(admin.ok).toBe(false);
        if (!admin.ok) expect(admin.code).toBe('UNKNOWN_SURFACE');
    });

    it('§41 bounds the batch size', () => {
        expect(MAX_BATCH_SIZE).toBeGreaterThan(0);
        expect(MAX_BATCH_SIZE).toBeLessThanOrEqual(100);
    });
});

/**
 * T1 · §27 — Google Cloud Translation v3 wire contract.
 *
 * Locked against google/cloud/translate/v3/translation_service.proto and the
 * v3 REST reference. NO LIVE AUTHENTICATION WAS PERFORMED — no credential is
 * available in this environment — so these tests pin the request construction
 * against the published contract, not against a real service response.
 */
describe('T1 · Google v3 request construction (§27)', () => {
    const config: GoogleAdvancedConfig = {
        projectId: 'my-project',
        location: 'global',
        modelIdentifier: GOOGLE_GENERAL_NMT_MODEL,
        accessToken: 'test-token',
    };

    it('uses the gRPC-transcoding path, not a v2-style route', () => {
        const { url } = buildTranslateTextRequest(config, {
            sourceLanguage: 'en',
            targetLanguage: 'fr',
            texts: ['Hello'],
        });
        expect(url).toBe('https://translate.googleapis.com/v3/projects/my-project/locations/global:translateText');
    });

    it('places parent in the URL path and NOT in the body', () => {
        const { url, body } = buildTranslateTextRequest(config, {
            sourceLanguage: 'en',
            targetLanguage: 'fr',
            texts: ['Hello'],
        });
        expect(url).toContain('projects/my-project/locations/global');
        expect(url.endsWith(':translateText')).toBe(true);
        // `parent` is bound to the path; repeating it in the body is wrong.
        expect('parent' in body).toBe(false);
    });

    it('uses protobuf-JSON lowerCamelCase field names, not v2 snake_case', () => {
        const { body } = buildTranslateTextRequest(config, {
            sourceLanguage: 'en',
            targetLanguage: 'de',
            texts: ['Hello'],
        });
        expect(body.sourceLanguageCode).toBe('en');
        expect(body.targetLanguageCode).toBe('de');
        expect(body.mimeType).toBe('text/plain');
        expect(body.contents).toEqual(['Hello']);

        // The v2/Basic spelling must not appear anywhere in the serialized body.
        const serialized = JSON.stringify(body);
        expect(serialized).not.toContain('source_language_code');
        expect(serialized).not.toContain('target_language_code');
        expect(serialized).not.toContain('mime_type');
    });

    it('addresses the general model by its real resource path', () => {
        const { body } = buildTranslateTextRequest(config, {
            sourceLanguage: 'en',
            targetLanguage: 'fr',
            texts: ['Hello'],
        });
        expect(body.model).toBe('projects/my-project/locations/global/models/general/nmt');
    });

    it('rejects a bare API version as a model identifier', () => {
        for (const bogus of ['v3', 'v2', 'basic']) {
            expect(() =>
                buildTranslateTextRequest(
                    { ...config, modelIdentifier: bogus },
                    { sourceLanguage: 'en', targetLanguage: 'fr', texts: ['x'] }
                )
            ).toThrow(/API version, not a model/);
        }
    });

    it('model identity is the model id, not the API version', () => {
        expect(GOOGLE_GENERAL_NMT_MODEL).toBe('general/nmt');
        expect(GOOGLE_GENERAL_NMT_MODEL).not.toBe('v3');
    });

    it('honours a regional location in both parent and model', () => {
        const regional = { ...config, location: 'us-central1' };
        const { url, body } = buildTranslateTextRequest(regional, {
            sourceLanguage: 'en',
            targetLanguage: 'it',
            texts: ['Ciao'],
        });
        expect(url).toBe('https://translate.googleapis.com/v3/projects/my-project/locations/us-central1:translateText');
        expect(body.model).toBe('projects/my-project/locations/us-central1/models/general/nmt');
    });

    it('enforces the documented per-content and total codepoint ceilings', () => {
        expect(() =>
            buildTranslateTextRequest(config, {
                sourceLanguage: 'en',
                targetLanguage: 'fr',
                texts: ['x'.repeat(GOOGLE_MAX_CODEPOINTS_PER_CONTENT + 1)],
            })
        ).toThrow(/codepoints per content string/);

        const manyUnits = Array.from({ length: GOOGLE_MAX_CONTENTS + 1 }, () => 'x');
        expect(() =>
            buildTranslateTextRequest(config, { sourceLanguage: 'en', targetLanguage: 'fr', texts: manyUnits })
        ).toThrow(/at most 1024 content strings/);
    });

    it('builds the capability-discovery request', () => {
        const { url, method } = buildSupportedLanguagesRequest(config);
        expect(method).toBe('GET');
        expect(url).toBe('https://translate.googleapis.com/v3/projects/my-project/locations/global/supportedLanguages');
    });

    it('§23 supportsLanguage is false until the vendor has been queried', async () => {
        const provider = new GoogleAdvancedTranslationProvider(config);
        // Fails closed: an unqueried provider offers nothing.
        expect(provider.supportsLanguage('fr')).toBe(false);
    });

    it('§23 discovery reads supportTarget and normalizes codes', async () => {
        const provider = new GoogleAdvancedTranslationProvider(config);
        const originalFetch = globalThis.fetch;
        globalThis.fetch = (async () =>
            new Response(
                JSON.stringify({
                    languages: [
                        { languageCode: 'FR', supportSource: true, supportTarget: true },
                        { languageCode: 'de', supportSource: true, supportTarget: true },
                        { languageCode: 'ar', supportSource: true, supportTarget: false },
                        { languageCode: 'zh-CN', supportSource: true, supportTarget: true },
                    ],
                }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            )) as typeof fetch;
        try {
            await provider.discoverSupportedTargets();
            expect(provider.supportsLanguage('fr')).toBe(true);
            expect(provider.supportsLanguage('de')).toBe(true);
            expect(provider.supportsLanguage('zh-CN')).toBe(true);
            // supportTarget:false must not be offered.
            expect(provider.supportsLanguage('ar')).toBe(false);
            expect(provider.supportsLanguage('ja')).toBe(false);
        } finally {
            globalThis.fetch = originalFetch;
        }
    });

    it('§23 a failed discovery leaves no capability rather than throwing', async () => {
        const provider = new GoogleAdvancedTranslationProvider(config);
        const originalFetch = globalThis.fetch;
        globalThis.fetch = (async () => new Response('nope', { status: 500 })) as typeof fetch;
        try {
            const targets = await provider.discoverSupportedTargets();
            expect(targets.size).toBe(0);
            expect(provider.supportsLanguage('fr')).toBe(false);
        } finally {
            globalThis.fetch = originalFetch;
        }
    });

    it('refuses an unverified target at translate time', async () => {
        const provider = new GoogleAdvancedTranslationProvider(config);
        await expect(
            provider.translate({ sourceLanguage: 'en', targetLanguage: 'fr', texts: ['Hi'], surface: 'header' })
        ).rejects.toThrow(/has not verified target/);
    });

    it('maps a missing translatedText to a provider fault, not an empty string', async () => {
        const provider = new GoogleAdvancedTranslationProvider(config);
        const originalFetch = globalThis.fetch;
        let call = 0;
        globalThis.fetch = (async () => {
            call += 1;
            if (call === 1) {
                return new Response(JSON.stringify({ languages: [{ languageCode: 'fr', supportTarget: true }] }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            // Google omits translatedText when an individual item errors.
            return new Response(JSON.stringify({ translations: [{}] }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }) as typeof fetch;
        try {
            await provider.discoverSupportedTargets();
            await expect(
                provider.translate({ sourceLanguage: 'en', targetLanguage: 'fr', texts: ['Hi'], surface: 'header' })
            ).rejects.toThrow(/omitted translatedText/);
        } finally {
            globalThis.fetch = originalFetch;
        }
    });

    it('returns a translation once capability is verified', async () => {
        const provider = new GoogleAdvancedTranslationProvider(config);
        const originalFetch = globalThis.fetch;
        let call = 0;
        globalThis.fetch = (async () => {
            call += 1;
            if (call === 1) {
                return new Response(JSON.stringify({ languages: [{ languageCode: 'fr', supportTarget: true }] }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            return new Response(JSON.stringify({ translations: [{ translatedText: 'Bonjour' }] }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }) as typeof fetch;
        try {
            await provider.discoverSupportedTargets();
            const result = await provider.translate({
                sourceLanguage: 'en',
                targetLanguage: 'fr',
                texts: ['Hello'],
                surface: 'header',
            });
            expect(result.texts).toEqual(['Bonjour']);
        } finally {
            globalThis.fetch = originalFetch;
        }
    });

    it('§31 returns null from the env factory when unconfigured', () => {
        const saved = {
            project: process.env.GOOGLE_CLOUD_PROJECT_ID,
            creds: process.env.GOOGLE_CLOUD_TRANSLATION_CREDENTIALS,
            token: process.env.GOOGLE_CLOUD_TRANSLATION_ACCESS_TOKEN,
        };
        delete process.env.GOOGLE_CLOUD_PROJECT_ID;
        delete process.env.GOOGLE_CLOUD_TRANSLATION_CREDENTIALS;
        delete process.env.GOOGLE_CLOUD_TRANSLATION_ACCESS_TOKEN;
        try {
            expect(createGoogleProviderFromEnv()).toBeNull();
        } finally {
            if (saved.project !== undefined) process.env.GOOGLE_CLOUD_PROJECT_ID = saved.project;
            if (saved.creds !== undefined) process.env.GOOGLE_CLOUD_TRANSLATION_CREDENTIALS = saved.creds;
            if (saved.token !== undefined) process.env.GOOGLE_CLOUD_TRANSLATION_ACCESS_TOKEN = saved.token;
        }
    });
});
