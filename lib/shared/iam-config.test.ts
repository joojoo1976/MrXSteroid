// lib/shared/iam-config.test.ts
// Slice E — IAM and Secrets Foundation (application-level contract only).
// Verifies config-shape validation and secret KEY presence checks. Secret
// VALUES are never read.
import { describe, it, expect } from 'vitest';
import {
  validateIamConfig,
  missingRequiredSecrets,
  isProviderEnabled,
  areAllProvidersDisabled,
  type IamConfig,
} from './iam-config';

const baseConfig: IamConfig = {
  providers: [
    { id: 'openai', name: 'OpenAI', configured: true, enabled: false },
    { id: 'anthropic', name: 'Anthropic', configured: true, enabled: true },
    { id: 'unstable', name: 'Unstable Provider', configured: false, enabled: false },
  ],
  requiredSecrets: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'],
};

describe('Slice E — validateIamConfig (shape only, secrets never read)', () => {
  it('accepts a well-formed IAM config', () => {
    const result = validateIamConfig(baseConfig);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.config.providers).toHaveLength(3);
  });

  it('rejects non-object and malformed shapes', () => {
    for (const input of [null, 'not-an-object', {}]) {
      const result = validateIamConfig(input);
      expect(result.ok).toBe(false);
      expect(result.reason).toBe('shape');
    }
  });

  it('rejects providers that is not an array', () => {
    const result = validateIamConfig({ ...baseConfig, providers: 'not-array' as never });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('shape');
  });

  it('rejects a provider without an id', () => {
    const bad = { ...baseConfig, providers: [{ ...baseConfig.providers[0], id: '' }] };
    const result = validateIamConfig(bad);
    expect(result.ok).toBe(false);
  });

  it('rejects a provider that is enabled but not configured (fail-closed)', () => {
    const bad = {
      ...baseConfig,
      providers: [{ ...baseConfig.providers[0], configured: false, enabled: true }],
    };
    const result = validateIamConfig(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.detail).toContain('configured');
  });

  it('rejects requiredSecrets that is not an array of strings', () => {
    const result = validateIamConfig({ ...baseConfig, requiredSecrets: ['key', 123] as never });
    expect(result.ok).toBe(false);
  });
});

describe('Slice E — missingRequiredSecrets (key presence only, values never read)', () => {
  it('reports absent required secret keys', () => {
    const missing = missingRequiredSecrets(baseConfig, ['OPENAI_API_KEY']);
    expect(missing).toEqual(['ANTHROPIC_API_KEY']);
  });

  it('reports nothing when all required secrets are present', () => {
    const missing = missingRequiredSecrets(baseConfig, [
      'OPENAI_API_KEY',
      'ANTHROPIC_API_KEY',
      'EXTRA_UNUSED_KEY',
    ]);
    expect(missing).toEqual([]);
  });

  it('does not read secret values (only key presence is compared)', () => {
    const env = new Map<string, string>();
    env.set('OPENAI_API_KEY', 'sk-...'); // value present but we never read it
    const missing = missingRequiredSecrets(baseConfig, Array.from(env.keys()));
    expect(missing).toEqual(['ANTHROPIC_API_KEY']);
  });
});

describe('Slice E — provider enablement (safe default: disabled unless configured+enabled)', () => {
  it('isProviderEnabled true only when configured AND enabled', () => {
    expect(isProviderEnabled(baseConfig, 'openai')).toBe(false); // configured but not enabled
    expect(isProviderEnabled(baseConfig, 'anthropic')).toBe(true); // configured + enabled
    expect(isProviderEnabled(baseConfig, 'unstable')).toBe(false); // not configured
    expect(isProviderEnabled(baseConfig, 'nonexistent')).toBe(false);
  });

  it('areAllProvidersDisabled true when no provider is enabled', () => {
    const allDisabled = {
      ...baseConfig,
      providers: baseConfig.providers.map((p) => ({ ...p, enabled: false })),
    };
    expect(areAllProvidersDisabled(allDisabled)).toBe(true);
    expect(areAllProvidersDisabled(baseConfig)).toBe(false); // anthropic enabled
  });
});
