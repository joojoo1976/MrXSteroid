/**
 * lib/templates/genius-tool-template.v4.test.tsx
 * V4.0 Template V2 — Tests
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import GeniusToolTemplateV4 from '@/lib/templates/genius-tool-template.v4';

afterEach(() => cleanup());

describe('GeniusToolTemplateV4', () => {
  it('renders title, status, and rtl direction', () => {
    render(
      <GeniusToolTemplateV4
        toolId="tool-111"
        title="Macro Tool"
        description="Description"
        locale="ar"
        direction="rtl"
        unitSystem="metric"
        theme="dark"
        status="ready"
      />
    );
    expect(screen.getByText('Macro Tool')).toBeInTheDocument();
    expect(screen.getByText('ready')).toBeInTheDocument();
    const section = screen.getByText('Macro Tool').closest('section');
    expect(section).toHaveAttribute('dir', 'rtl');
    expect(section).toHaveAttribute('data-locale', 'ar');
    expect(section).toHaveAttribute('data-status', 'ready');
  });

  it('renders ltr defaults and idle status', () => {
    render(<GeniusToolTemplateV4 toolId="tool-1" title="Empty Tool" />);
    const section = screen.getByText('Empty Tool').closest('section');
    expect(section).toHaveAttribute('dir', 'ltr');
    expect(section).toHaveAttribute('data-unit-system', 'metric');
    expect(section).toHaveAttribute('data-theme', 'light');
    expect(section).toHaveAttribute('data-status', 'idle');
  });

  it('renders errors and warnings', () => {
    render(
      <GeniusToolTemplateV4
        toolId="tool-2"
        title="Warning Tool"
        warnings={[{ id: 'w1', level: 'high', message: 'Warning text' }]}
        errors={['Error text']}
      />
    );
    expect(screen.getByText('Warning text')).toBeInTheDocument();
    expect(screen.getByText('Error text')).toBeInTheDocument();
  });

  it('renders safety warnings', () => {
    render(
      <GeniusToolTemplateV4
        toolId="tool-3"
        title="Safety Tool"
        safetyWarnings={[{ warningId: 'sw1', level: 'critical', code: 'TEST', message: 'Safety warning', trigger: 'test', severity: 'critical', reason: 'test reason' }]}
      />
    );
    expect(screen.getByText('Safety warning')).toBeInTheDocument();
    expect(screen.getByText('test reason')).toBeInTheDocument();
  });

  it('renders result envelope with result type', () => {
    const envelope = {
      contractVersion: '4.0' as const,
      schemaVersion: '4.0.0',
      toolId: 'mrx.tool.macro',
      canonicalSlug: 'macro',
      engineVersion: '4.0.0',
      calculationId: 'calc-1',
      status: 'VALID' as const,
      inputSnapshot: { values: {}, fieldStates: {}, provenance: {}, completeness: 'INCOMPLETE' as const, recordedAt: '2026-11-05T00:00:00Z', version: '4.0.0' },
      result: { calories: 2000 },
      resultType: 'CALCULATED' as const,
      provenance: [],
      units: { calories: 'kcal' },
      assumptions: [],
      evidence: [],
      uncertainty: { level: 'LOW' as const, basis: [], affectedOutputs: [], whatWouldReduceIt: [], limitations: [] },
      warnings: [],
      validity: { status: 'CURRENT' as const, invalidationTriggers: [] },
      privacyClass: 'PERSONAL' as const,
      contextUsed: [],
      nextActions: [],
      createdAt: '2026-11-05T00:00:00Z',
    };
    render(
      <GeniusToolTemplateV4
        toolId="tool-4"
        title="Envelope Tool"
        resultEnvelope={envelope}
      />
    );
    expect(screen.getByText('CALCULATED')).toBeInTheDocument();
    expect(screen.getByText('VALID')).toBeInTheDocument();
    expect(screen.getByText('LOW')).toBeInTheDocument();
  });

  it('renders envelope validation error for invalid envelope', () => {
    const invalidEnvelope = { contractVersion: '3.0' } as any;
    render(
      <GeniusToolTemplateV4
        toolId="tool-5"
        title="Invalid Envelope Tool"
        resultEnvelope={invalidEnvelope}
      />
    );
    expect(screen.getByText(/Result envelope validation failed/i)).toBeInTheDocument();
  });

  it('renders AI status when profile provided', () => {
    const aiProfile = {
      toolId: 'tool-6',
      profileVersion: '1.0.0',
      aiStatus: 'ENABLED' as const,
      permittedCapabilities: ['INPUT_UNDERSTANDING' as const, 'MISSING_DATA_COACH' as const],
      prohibitedCapabilities: [] as any,
      allowedInputClasses: [] as any,
      excludedInputClasses: [] as any,
      approvedContextSources: [],
      outputSchema: 'test',
      allowedTools: [],
      actionPermissions: ['read' as const],
      riskClass: 'LOW' as const,
      evidenceMinimum: 'none',
      humanReviewRules: [],
      modelPolicy: null,
      budget: { maxCallsPerSession: 10, maxTokensPerCall: 1000, maxCostPerSession: 1, maxRetries: 3, timeoutMs: 5000, maxConcurrency: 2 },
      fallbackPolicy: { onUnavailable: 'continue_deterministic' as const, onInvalidOutput: 'discard_and_fallback' as const, onTimeout: 'fallback' as const, onBudgetExceeded: 'stop' as const },
      evaluationProfile: { goldenTestCount: 0, adversarialTestCount: 0, qualityThreshold: 0.8 },
      stopConditions: [],
      auditPolicy: { logInputs: true, logOutputs: true, redactSensitive: true, retentionDays: 30, accessibleBy: ['admin'] },
    };
    render(
      <GeniusToolTemplateV4
        toolId="tool-6"
        title="AI Tool"
        aiProfile={aiProfile}
        aiStatus="ENABLED"
      />
    );
    expect(screen.getByText('AI Active')).toBeInTheDocument();
    expect(screen.getByText('INPUT_UNDERSTANDING')).toBeInTheDocument();
  });

  it('renders AI unavailable message', () => {
    const aiProfile = {
      toolId: 'tool-7',
      profileVersion: '1.0.0',
      aiStatus: 'NOT_CONFIGURED' as const,
      permittedCapabilities: [] as any,
      prohibitedCapabilities: [] as any,
      allowedInputClasses: [] as any,
      excludedInputClasses: [] as any,
      approvedContextSources: [],
      outputSchema: 'test',
      allowedTools: [],
      actionPermissions: [] as any,
      riskClass: 'LOW' as const,
      evidenceMinimum: 'none',
      humanReviewRules: [],
      modelPolicy: null,
      budget: { maxCallsPerSession: 0, maxTokensPerCall: 0, maxCostPerSession: 0, maxRetries: 0, timeoutMs: 0, maxConcurrency: 0 },
      fallbackPolicy: { onUnavailable: 'continue_deterministic' as const, onInvalidOutput: 'discard_and_fallback' as const, onTimeout: 'fallback' as const, onBudgetExceeded: 'stop' as const },
      evaluationProfile: { goldenTestCount: 0, adversarialTestCount: 0, qualityThreshold: 0.8 },
      stopConditions: [],
      auditPolicy: { logInputs: false, logOutputs: false, redactSensitive: true, retentionDays: 0, accessibleBy: [] },
    };
    render(
      <GeniusToolTemplateV4
        toolId="tool-7"
        title="No AI Tool"
        aiProfile={aiProfile}
        aiStatus="NOT_CONFIGURED"
      />
    );
    expect(screen.getByText('AI Not Configured')).toBeInTheDocument();
    expect(screen.getByText(/AI assistance is not configured/i)).toBeInTheDocument();
  });

  it('renders human review required', () => {
    render(
      <GeniusToolTemplateV4
        toolId="tool-8"
        title="Review Tool"
        requiresHumanReview={true}
      />
    );
    expect(screen.getByText(/Human review required/i)).toBeInTheDocument();
  });

  it('renders progressive disclosure toggle', () => {
    const onToggle = vi.fn();
    render(
      <GeniusToolTemplateV4
        toolId="tool-9"
        title="Advanced Tool"
        onToggleAdvanced={onToggle}
        showAdvanced={false}
      >
        <span>Advanced content</span>
      </GeniusToolTemplateV4>
    );
    const button = screen.getByText('Show Advanced');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders explanation level selector', () => {
    render(
      <GeniusToolTemplateV4
        toolId="tool-10"
        title="Explanation Tool"
        explanationLevels={[
          { level: 'beginner', content: <span>Beginner text</span> },
          { level: 'standard', content: <span>Standard text</span> },
          { level: 'expert', content: <span>Expert text</span> },
        ]}
      />
    );
    expect(screen.getByText('Beginner')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('Expert')).toBeInTheDocument();
    expect(screen.getByText('Standard text')).toBeInTheDocument();
  });

  it('renders dynamic fields', () => {
    render(
      <GeniusToolTemplateV4
        toolId="tool-11"
        title="Fields Tool"
        fields={[
          { fieldId: 'weight', labelKey: 'Weight', value: 80, state: 'VALID', required: true, unit: 'kg' },
          { fieldId: 'height', labelKey: 'Height', value: 180, state: 'MISSING', required: true, unit: 'cm' },
        ]}
      />
    );
    expect(screen.getByText('Weight')).toBeInTheDocument();
    expect(screen.getByText('Height')).toBeInTheDocument();
    expect(screen.getByText('VALID')).toBeInTheDocument();
    expect(screen.getByText('MISSING')).toBeInTheDocument();
  });

  it('renders next actions from envelope', () => {
    const envelope = {
      contractVersion: '4.0' as const,
      schemaVersion: '4.0.0',
      toolId: 'mrx.tool.macro',
      canonicalSlug: 'macro',
      engineVersion: '4.0.0',
      calculationId: 'calc-1',
      status: 'VALID' as const,
      inputSnapshot: { values: {}, fieldStates: {}, provenance: {}, completeness: 'INCOMPLETE' as const, recordedAt: '2026-11-05T00:00:00Z', version: '4.0.0' },
      result: { calories: 2000 },
      resultType: 'CALCULATED' as const,
      provenance: [],
      units: {},
      assumptions: [],
      evidence: [],
      uncertainty: { level: 'LOW' as const, basis: [], affectedOutputs: [], whatWouldReduceIt: [], limitations: [] },
      warnings: [],
      validity: { status: 'CURRENT' as const, invalidationTriggers: [] },
      privacyClass: 'PERSONAL' as const,
      contextUsed: [],
      nextActions: [{ actionId: 'a1', type: 'calculate' as const, labelKey: 'Recalculate', priority: 'high' as const, reason: 'test' }],
      createdAt: '2026-11-05T00:00:00Z',
    };
    render(
      <GeniusToolTemplateV4
        toolId="tool-12"
        title="Actions Tool"
        resultEnvelope={envelope}
      />
    );
    expect(screen.getByText('Recalculate')).toBeInTheDocument();
  });
});