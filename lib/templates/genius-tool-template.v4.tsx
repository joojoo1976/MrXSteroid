/**
 * lib/templates/genius-tool-template.v4.tsx
 * ═══════════════════════════════════════════════════════════════════════════════
 *  V4.0 — Genius Tool Template V2 (Evolved)
 * ════════════════════════════════════════════════════════════════════════════════
 *  Domain-agnostic reusable presentation and integration layer.
 *  Supports V4.0 Dynamic Input/Output contracts, AI Capability interface,
 *  Safety/Escalation presentation, progressive disclosure, RTL/LTR, accessibility.
 *
 *  Does NOT contain tool-specific formulas or calculations.
 *  Does NOT force all tools to use all capabilities.
 *
 *  'use client' — React component
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import type {
  ToolResultEnvelopeV4,
  FieldState,
  InputCompleteness,
  ResultStatus,
  ResultType,
  UncertaintyRecord,
  SafetyWarningV4,
  AICapabilityProfile,
  AICapability,
  AIStatus,
  RiskTier,
  StorageState,
  ProposedNextAction,
} from '@/lib/engines/core/v4/contracts.v4';
import { validateToolResultEnvelope } from '@/lib/engines/core/v4/runtime.v4';

// ============================================================
// §1. Types — V4 Template Props
// ============================================================

export type GeniusToolStatusV4 = 'idle' | 'partial' | 'ready' | 'error' | 'degraded';

export interface GeniusToolWarningV4 {
  id: string;
  level: 'info' | 'low' | 'medium' | 'high' | 'critical';
  message: string;
  code?: string;
  action?: string;
}

export interface GeniusToolFieldV4 {
  fieldId: string;
  labelKey: string;
  value: unknown;
  state: FieldState;
  required: boolean;
  unit?: string;
  helpText?: string;
  onChange?: (value: unknown) => void;
}

export interface GeniusToolExplanationLevel {
  level: 'beginner' | 'standard' | 'expert';
  content: React.ReactNode;
}

export interface GeniusToolTemplateV4Props {
  // Identity
  toolId: string;
  title: string;
  description?: string;
  locale?: 'ar' | 'en';
  direction?: 'rtl' | 'ltr';
  unitSystem?: 'metric' | 'imperial';
  theme?: 'light' | 'dark';

  // Status
  status?: GeniusToolStatusV4;
  inputCompleteness?: InputCompleteness;

  // V4 Result Envelope (optional — tool may not use V4 envelope yet)
  resultEnvelope?: ToolResultEnvelopeV4<unknown, unknown> | null;

  // Dynamic Inputs
  fields?: GeniusToolFieldV4[];

  // Content Slots
  inputs?: React.ReactNode;
  results?: React.ReactNode;
  explanation?: React.ReactNode;
  explanationLevels?: GeniusToolExplanationLevel[];
  scenarios?: React.ReactNode;
  children?: React.ReactNode;

  // Warnings & Errors
  warnings?: GeniusToolWarningV4[];
  errors?: string[];

  // AI Capability
  aiProfile?: AICapabilityProfile | null;
  aiStatus?: AIStatus;

  // Safety
  safetyWarnings?: SafetyWarningV4[];
  riskTier?: RiskTier;
  requiresHumanReview?: boolean;

  // Progressive Disclosure
  showAdvanced?: boolean;
  onToggleAdvanced?: () => void;

  // Accessibility
  ariaLabel?: string;
  ariaDescription?: string;
}

// ============================================================
// §2. Component — V4 Template
// ============================================================

export function GeniusToolTemplateV4({
  toolId,
  title,
  description,
  locale = 'en',
  direction = 'ltr',
  unitSystem = 'metric',
  theme = 'light',
  status = 'idle',
  inputCompleteness,
  resultEnvelope = null,
  fields = [],
  inputs,
  results,
  explanation,
  explanationLevels,
  scenarios,
  children,
  warnings = [],
  errors = [],
  aiProfile = null,
  aiStatus = 'NOT_CONFIGURED',
  safetyWarnings = [],
  riskTier,
  requiresHumanReview = false,
  showAdvanced = false,
  onToggleAdvanced,
  ariaLabel,
  ariaDescription,
}: GeniusToolTemplateV4Props) {
  const isRtl = direction === 'rtl';
  const [explanationLevel, setExplanationLevel] = useState<'beginner' | 'standard' | 'expert'>('standard');

  // Validate result envelope if present
  const envelopeValidation = useMemo(() => {
    if (!resultEnvelope) return null;
    return validateToolResultEnvelope(resultEnvelope);
  }, [resultEnvelope]);

  // Determine if envelope is valid
  const envelopeValid = envelopeValidation?.valid ?? true;

  // Filter AI capabilities based on profile
  const permittedAICapabilities = aiProfile?.permittedCapabilities ?? [];
  const isAIEnabled = aiStatus === 'ENABLED' && permittedAICapabilities.length > 0;

  // Determine status display
  const statusDisplay = status === 'degraded' ? 'degraded' : status;

  // Determine explanation content based on level
  const currentExplanation = explanationLevels?.find(l => l.level === explanationLevel)?.content ?? explanation;

  // AI status display
  const aiStatusDisplay = aiStatus === 'ENABLED' ? 'AI Active' :
    aiStatus === 'DEGRADED' ? 'AI Degraded' :
    aiStatus === 'NOT_CONFIGURED' ? 'AI Not Configured' :
    aiStatus === 'SUSPENDED' ? 'AI Suspended' : 'AI Disabled';

  return (
    <section
      data-tool-id={toolId}
      data-locale={locale}
      data-unit-system={unitSystem}
      data-theme={theme}
      data-status={statusDisplay}
      data-risk-tier={riskTier ?? 'none'}
      data-ai-status={aiStatus}
      dir={isRtl ? 'rtl' : 'ltr'}
      className="genius-tool-template-v4"
      aria-label={ariaLabel ?? title}
      aria-describedby={ariaDescription}
    >
      {/* Header */}
      <header className="genius-tool-template-v4__header">
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </header>

      {/* Status & Completeness */}
      <div className="genius-tool-template-v4__status" role="status" aria-live="polite">
        <span data-status={statusDisplay}>{statusDisplay}</span>
        {inputCompleteness && (
          <span data-completeness={inputCompleteness} className="genius-tool-template-v4__completeness">
            {inputCompleteness}
          </span>
        )}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="genius-tool-template-v4__errors" role="alert">
          {errors.map((error, index) => (
            <p key={`error-${index}`}>{error}</p>
          ))}
        </div>
      )}

      {/* Warnings (legacy) */}
      {warnings.length > 0 && (
        <div className="genius-tool-template-v4__warnings" role="note">
          {warnings.map((warning) => (
            <p key={warning.id} data-warning-level={warning.level}>
              {warning.message}
            </p>
          ))}
        </div>
      )}

      {/* Safety Warnings (V4) */}
      {safetyWarnings.length > 0 && (
        <div className="genius-tool-template-v4__safety-warnings" role="alert">
          {safetyWarnings.map((warning) => (
            <div key={warning.warningId} data-safety-level={warning.level} data-safety-severity={warning.severity}>
              <p className="genius-tool-template-v4__safety-code">{warning.code}</p>
              <p className="genius-tool-template-v4__safety-message">{warning.message}</p>
              {warning.action && <p className="genius-tool-template-v4__safety-action">{warning.action}</p>}
              {warning.reason && <p className="genius-tool-template-v4__safety-reason">{warning.reason}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Envelope Validation Error */}
      {resultEnvelope && !envelopeValid && (
        <div className="genius-tool-template-v4__envelope-error" role="alert">
          <p>Result envelope validation failed:</p>
          {envelopeValidation?.errors.map((err, i) => (
            <p key={i}>{err.field}: {err.message}</p>
          ))}
        </div>
      )}

      {/* Human Review Required */}
      {requiresHumanReview && (
        <div className="genius-tool-template-v4__human-review" role="alert">
          <p>Human review required before proceeding.</p>
        </div>
      )}

      {/* Dynamic Fields */}
      {fields.length > 0 && (
        <div className="genius-tool-template-v4__fields">
          {fields.map((field) => (
            <div key={field.fieldId} className="genius-tool-template-v4__field" data-field-state={field.state}>
              <label htmlFor={field.fieldId}>
                {field.labelKey}
                {field.required && <span aria-hidden="true"> *</span>}
              </label>
              {field.unit && <span className="genius-tool-template-v4__field-unit">{field.unit}</span>}
              {field.helpText && <span className="genius-tool-template-v4__field-help">{field.helpText}</span>}
              <span className="genius-tool-template-v4__field-state" data-state={field.state}>
                {field.state}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Inputs Slot */}
      {inputs && <div className="genius-tool-template-v4__inputs">{inputs}</div>}

      {/* Results Slot */}
      {results && <div className="genius-tool-template-v4__results">{results}</div>}

      {/* Result Envelope Display */}
      {resultEnvelope && envelopeValid && (
        <div className="genius-tool-template-v4__envelope">
          <div className="genius-tool-template-v4__envelope-meta">
            <span data-result-type={resultEnvelope.resultType}>{resultEnvelope.resultType}</span>
            <span data-result-status={resultEnvelope.status}>{resultEnvelope.status}</span>
          </div>
          {resultEnvelope.uncertainty && (
            <div className="genius-tool-template-v4__uncertainty">
              <span data-uncertainty-level={resultEnvelope.uncertainty.level}>
                {resultEnvelope.uncertainty.level}
              </span>
              {resultEnvelope.uncertainty.limitations.length > 0 && (
                <ul>
                  {resultEnvelope.uncertainty.limitations.map((lim, i) => (
                    <li key={i}>{lim}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {resultEnvelope.nextActions.length > 0 && (
            <div className="genius-tool-template-v4__next-actions">
              {resultEnvelope.nextActions.map((action) => (
                <button key={action.actionId} data-action-type={action.type} data-priority={action.priority}>
                  {action.labelKey}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Explanation Level Selector */}
      {explanationLevels && explanationLevels.length > 0 && (
        <div className="genius-tool-template-v4__explanation-levels">
          <button
            onClick={() => setExplanationLevel('beginner')}
            data-active={explanationLevel === 'beginner'}
            aria-pressed={explanationLevel === 'beginner'}
          >
            Beginner
          </button>
          <button
            onClick={() => setExplanationLevel('standard')}
            data-active={explanationLevel === 'standard'}
            aria-pressed={explanationLevel === 'standard'}
          >
            Standard
          </button>
          <button
            onClick={() => setExplanationLevel('expert')}
            data-active={explanationLevel === 'expert'}
            aria-pressed={explanationLevel === 'expert'}
          >
            Expert
          </button>
        </div>
      )}

      {/* Explanation Slot */}
      {(explanation || currentExplanation) && (
        <div className="genius-tool-template-v4__explanation">
          {currentExplanation ?? explanation}
        </div>
      )}

      {/* Scenarios Slot */}
      {scenarios && <div className="genius-tool-template-v4__scenarios">{scenarios}</div>}

      {/* AI Status */}
      {aiProfile && (
        <div className="genius-tool-template-v4__ai-status" data-ai-status={aiStatus}>
          <span>{aiStatusDisplay}</span>
          {isAIEnabled && permittedAICapabilities.length > 0 && (
            <ul className="genius-tool-template-v4__ai-capabilities">
              {permittedAICapabilities.map((cap) => (
                <li key={cap}>{cap}</li>
              ))}
            </ul>
          )}
          {!isAIEnabled && (
            <p className="genius-tool-template-v4__ai-unavailable">
              AI assistance is {aiStatus === 'NOT_CONFIGURED' ? 'not configured' : aiStatus.toLowerCase()}.
            </p>
          )}
        </div>
      )}

      {/* Progressive Disclosure Toggle */}
      {onToggleAdvanced && (
        <button
          onClick={onToggleAdvanced}
          className="genius-tool-template-v4__toggle-advanced"
          aria-expanded={showAdvanced}
        >
          {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
        </button>
      )}

      {/* Advanced Content */}
      {showAdvanced && children && (
        <div className="genius-tool-template-v4__advanced">{children}</div>
      )}

      {/* Children (when not using progressive disclosure) */}
      {!onToggleAdvanced && children && (
        <div className="genius-tool-template-v4__children">{children}</div>
      )}
    </section>
  );
}

export default GeniusToolTemplateV4;

// ============================================================
// §3. Backward-Compatible Re-export of V3 Template
// ============================================================

export { GeniusToolTemplate } from './genius-tool-template';
export type { GeniusToolTemplateProps, GeniusToolWarning, GeniusToolStatus } from './genius-tool-template';