/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  server/translation/index.ts — T1 Foundation barrel
 *
 *  Server-side only. Importing this module from a 'use client' component would
 *  pull the Google provider (and therefore its credential reads) into the
 *  browser bundle, violating spec §28 and §116.
 *
 *  Client-safe entry point for the language registry only:
 *    import { getRuntimeLanguages } from '@/server/translation/languages';
 * ═══════════════════════════════════════════════════════════════════════════
 */

export {
    TRANSLATION_ENGINE_VERSION,
    TRANSLATION_GLOSSARY_VERSION,
    RUNTIME_SOURCE_LANGUAGE,
    MAX_SOURCE_CHARS,
    MAX_BATCH_SIZE,
    TRANSLATION_SURFACES,
    TRANSLATED_ATTR,
    TRANSLATED_LANG_ATTR,
    SURFACE_ATTR,
    TranslationSurfaceSchema,
    TranslationRequestSchema,
    TranslationBatchSchema,
    normalizeSourceLanguage,
    validateTranslationRequest,
    type TranslationSurface,
    type TranslationRequest,
    type TranslationBatch,
    type TranslationContractResult,
    type TranslationContractError,
    type TranslationContractErrorCode,
} from './contracts';

export {
    TranslationProviderError,
    type ProviderIdentity,
    type ProviderTranslationInput,
    type ProviderTranslationOutput,
    type ProviderErrorCode,
    type TranslationProvider,
} from './provider';

export {
    GOOGLE_GENERAL_NMT_MODEL,
    GOOGLE_MAX_CONTENTS,
    GOOGLE_MAX_CODEPOINTS_PER_CONTENT,
    GOOGLE_MAX_TOTAL_CODEPOINTS,
    GoogleAdvancedTranslationProvider,
    createGoogleProviderFromEnv,
    buildParentResource,
    buildModelResource,
    buildTranslateTextRequest,
    buildSupportedLanguagesRequest,
    type GoogleAdvancedConfig,
    type GoogleTranslateTextBody,
} from './googleProvider';

export {
    getLanguage,
    isCanonical,
    isRtl,
    isRuntimeTranslatable,
    isEnglishSource,
    getRuntimeLanguages,
    getEnabledLanguages,
    getAllLanguages,
    getVerifiedRuntimeTargets,
    validateTargetLanguage,
    type RegistryLanguage,
    type ProviderCapability,
    type TargetLanguageValidation,
} from './languages';

export {
    TRANSLATION_RATE_LIMIT,
    TRANSLATION_CHARACTER_QUOTA,
    TRANSLATION_TARGET_QUOTA,
    checkOrigin,
    checkRateLimit,
    checkCharacterQuota,
    checkRequestSize,
    isTargetWithinAllowlist,
    listAvailableRuntimeLanguages,
    enforceTranslationSecurity,
    type TranslationSecurityVerdict,
} from './security';

export {
    TRANSLATION_CACHE_NORMALIZATION_VERSION,
    normalizeForTranslationCache,
} from './normalization';

export {
    TRANSLATION_GLOSSARY_VERSION as CURRENT_TRANSLATION_GLOSSARY_VERSION,
    TRANSLATION_GLOSSARY,
    glossaryTermsForTarget,
    validateTranslationGlossary,
    type TranslationGlossaryEntry,
    type TranslationGlossaryTerm,
} from './glossary';

export {
    SENTINEL_PATTERN,
    protectTranslationValues,
    validateAndRestoreTranslation,
    type ProtectedTranslation,
    type ProtectedValue,
    type ProtectedValueKind,
    type SentinelRestorationResult,
    type SentinelValidationError,
} from './placeholders';
export {
    TRANSLATION_SESSION_VERSION,
    issueTranslationSession,
    verifyTranslationSession,
    translationSessionSecretFromEnv,
    type TranslationSessionClaims,
    type TranslationSessionIssueInput,
    type TranslationSessionVerification,
} from './session';

export {
    normalizeTranslationRoutePath,
    classifyTranslationRoute,
    isSurfaceAllowedForRoute,
    type TranslationRouteClass,
    type TranslationRoutePolicy,
} from './policy';

export {
    MemoryTranslationBudgetStore,
    UpstashTranslationBudgetStore,
    createTranslationBudgetStore,
    createTranslationBudgetStoreFromEnv,
    type TranslationBudgetContext,
    type TranslationBudgetLimits,
    type TranslationBudgetStore,
    type TranslationBudgetVerdict,
    type TranslationAtomicRedis,
} from './budget';

export {
    MemoryTranslationRateLimiter,
    UpstashTranslationRateLimiter,
    createTranslationRateLimiter,
    createTranslationRateLimiterFromEnv,
    type TranslationRateLimiter,
    type TranslationRateLimitResult,
} from './rateLimit';

export {
    TranslationCircuitBreaker,
    DistributedTranslationCircuitBreaker,
    TranslationCircuitOpenError,
    TranslationCircuitConcurrencyError,
    createDistributedTranslationCircuitBreaker,
    MemoryTranslationCircuitStateStore,
    type TranslationCircuitStateStore,
    type CircuitState,
    type CircuitSnapshot,
    type TranslationCircuitBreakerOptions,
    type TranslationCircuitBreakerLike,
    type TranslationCircuitRedis,
} from './circuitBreaker';

export {
    noopTranslationAuditSink,
    safeTranslationAuditEvent,
    type TranslationAuditEvent,
    type TranslationAuditSink,
} from './audit';
export {
    TRANSLATION_CONFIG_DEFAULTS,
    TRANSLATION_CONFIG_MAXIMA,
    TranslationConfigError,
    loadTranslationConfig,
    type TranslationConfig,
} from './config';

export {
    TranslationStorageUnavailableError,
    withTranslationStorageTimeout,
} from './storage';
export {
    TranslationBatchItemSchema,
    TranslationRuntimeBatchSchema,
    validateTranslationBatch,
    type TranslationBatchItem,
    type TranslationRuntimeBatch,
    type TranslationBatchResultItem,
} from './batchContracts';

export {
    translateBatchRequest,
    validateBatchResponseMapping,
    type TranslationBatchRuntimeDeps,
    type TranslationBatchSuccess,
} from './batchRuntime';
