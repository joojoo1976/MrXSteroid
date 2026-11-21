// lib/shared/iam-config.ts
// Slice E — IAM and Secrets Foundation (application-level contract only).
//
// Scope (G-R6.1-1): define server-only secret access boundaries and provider
// capability/configuration states, and validate configuration shape WITHOUT
// accessing, creating, rotating or revealing any production credentials.
//
// OUT OF SCOPE for this slice (separate owner decision, not implemented here):
//   - activating any paid AI or external provider
//   - reading secret values from environment or a vault
//   - production credential changes
//
// This module is pure TypeScript: it inspects configuration SHAPE only. It never
// reads secret values, so it is safe to import during SSR and in unit tests.
export type ProviderId = string;

export interface ProviderCapability {
  readonly id: ProviderId;
  readonly name: string;
  /** The provider's code is present and loadable. */
  readonly configured: boolean;
  /** The owner has explicitly enabled the provider (paid providers require separate authorization). */
  readonly enabled: boolean;
}

export interface IamConfig {
  readonly providers: readonly ProviderCapability[];
  /** Secret keys that must be present in the environment for configured providers. */
  readonly requiredSecrets: readonly string[];
}

export interface IamConfigResultOk {
  readonly ok: true;
  readonly config: IamConfig;
}
export interface IamConfigResultFail {
  readonly ok: false;
  readonly reason: 'shape' | 'missing-secret';
  readonly detail?: string;
}
export type IamConfigResult = IamConfigResultOk | IamConfigResultFail;

/**
 * Validate the IAM configuration SHAPE only. Secret values are never read.
 */
export function validateIamConfig(raw: unknown): IamConfigResult {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, reason: 'shape' };
  }
  const c = raw as Partial<IamConfig>;
  if (!Array.isArray(c.providers)) {
    return { ok: false, reason: 'shape', detail: 'providers must be an array' };
  }
  for (const p of c.providers) {
    if (!p || typeof p !== 'object') {
      return { ok: false, reason: 'shape', detail: 'each provider must be an object' };
    }
    if (typeof (p as ProviderCapability).id !== 'string' || !(p as ProviderCapability).id.trim().length) {
      return { ok: false, reason: 'shape', detail: 'provider.id is required' };
    }
    if (typeof (p as ProviderCapability).configured !== 'boolean') {
      return { ok: false, reason: 'shape', detail: 'provider.configured must be a boolean' };
    }
    if (typeof (p as ProviderCapability).enabled !== 'boolean') {
      return { ok: false, reason: 'shape', detail: 'provider.enabled must be a boolean' };
    }
    // A provider cannot be enabled without being configured (fail-closed).
    if ((p as ProviderCapability).enabled && !(p as ProviderCapability).configured) {
      return { ok: false, reason: 'shape', detail: 'provider.enabled requires configured=true' };
    }
  }
  if (!Array.isArray(c.requiredSecrets) || c.requiredSecrets.some((s) => typeof s !== 'string')) {
    return { ok: false, reason: 'shape', detail: 'requiredSecrets must be an array of strings' };
  }
  return { ok: true, config: c as IamConfig };
}

/**
 * Report required secret keys that are absent from the supplied environment
 * key set. Secret VALUES are never read; only key presence is compared.
 */
export function missingRequiredSecrets(
  config: IamConfig,
  envKeys: readonly string[],
): string[] {
  const present = new Set(envKeys);
  return config.requiredSecrets.filter((key) => !present.has(key));
}

/** True when a provider is both configured and explicitly enabled. */
export function isProviderEnabled(config: IamConfig, providerId: ProviderId): boolean {
  return config.providers.some(
    (p) => p.id === providerId && p.configured && p.enabled,
  );
}

/** True when no provider is enabled (safe default before owner authorization). */
export function areAllProvidersDisabled(config: IamConfig): boolean {
  return config.providers.every((p) => !p.enabled);
}
