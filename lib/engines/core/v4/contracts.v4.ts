/**
 * lib/engines/core/v4/contracts.v4.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 *  V4.0 — Canonical Dynamic Contracts (Architecture Foundation)
 * ════════════════════════════════════════════════════════════════════════════════
 *  Implements the 12 architecture layers defined in V4.0 SPEC Part II:
 *  1. Dynamic Input Contract
 *  2. Canonical Dynamic Output Contract
 *  3. AI Capability Contract
 *  4. Safety & Escalation Contract
 *  5. Context & UserContext Integration
 *  6. Validation & Completeness Engine
 *  7. Reasoning & Explanation Layer
 *  8. What-If & Sensitivity Layer
 *  9. Confidence & Evidence Layer
 *  10. Audit & Monitoring Layer
 *  11. Cross-Tool Result Contract
 *  12. Schema Versioning & Backward Compatibility
 *
 *  PURE MODULE — no React, no DOM, no Supabase, no I/O, no Date.
 *  All timestamps are injected by the caller.
 *
 *  Version: 4.0.0
 *  Contract Version: 4.0
 */

// ============================================================
// §1. Contract Version & Schema Versioning
// ============================================================

export const CONTRACT_VERSION = '4.0' as const;
export const SCHEMA_VERSION = '4.0.0' as const;
export const ENGINE_VERSION = '4.0.0' as const;

export type ContractVersion = typeof CONTRACT_VERSION;
export type SchemaVersion = string; // semver

// ============================================================
// §2. Primitive Unions (V4.0 canonical)
// ============================================================

export type Locale = 'ar' | 'en';
export type UnitSystem = 'metric' | 'imperial';
export type AccessTier = 'free' | 'premium';

export const LOCALES = ['ar', 'en'] as const;
export const UNIT_SYSTEMS = ['metric', 'imperial'] as const;
export const ACCESS_TIERS = ['free', 'premium'] as const;

// ============================================================
// §3. Dynamic Input Contract (SPEC §4)
// ============================================================

export type FieldState = 'MISSING' | 'INVALID' | 'VALID' | 'ESTIMATED' | 'NOT_REQUIRED';
export type Provenance = 'USER_ENTERED' | 'IMPORTED' | 'CROSS_TOOL' | 'ESTIMATED' | 'SYSTEM_DERIVED';
export type DataType = 'number' | 'integer' | 'string' | 'enum' | 'boolean' | 'date' | 'object' | 'file_ref';
export type SensitivityClass = 'public' | 'internal' | 'personal' | 'sensitive' | 'highly_sensitive';
export type DataClassification = 'PUBLIC' | 'INTERNAL' | 'PERSONAL' | 'SENSITIVE' | 'HIGHLY_SENSITIVE';

export interface FieldDefinition {
  fieldId: string;
  labelKey: string;
  dataType: DataType;
  required: boolean;
  unit?: string;
  acceptedUnits?: string[];
  canonicalUnit?: string;
  constraints?: FieldConstraints;
  fieldState: FieldState;
  provenance: Provenance;
  observedAt?: string;
  recordedAt?: string;
  freshnessPolicyId?: string;
  consentScope?: string;
  sensitivityClass: SensitivityClass;
  normalizationVersion?: string;
}

export interface FieldConstraints {
  min?: number;
  max?: number;
  enumValues?: string[];
  format?: string;
  precision?: number;
  crossFieldRules?: CrossFieldRule[];
}

export interface CrossFieldRule {
  ruleId: string;
  dependsOn: string[];
  condition: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface InputSnapshot<TInput> {
  values: TInput;
  fieldStates: Record<string, FieldState>;
  provenance: Record<string, Provenance>;
  completeness: InputCompleteness;
  observedAt?: string;
  recordedAt: string;
  version: string;
}

export type InputCompleteness =
  | 'SUFFICIENT_FOR_BASIC_RESULT'
  | 'SUFFICIENT_WITH_LIMITATIONS'
  | 'INCOMPLETE'
  | 'INSUFFICIENT_FOR_SAFE_RESULT';

// ============================================================
// §4. Canonical Dynamic Output Contract (SPEC §5)
// ============================================================

export type ResultStatus = 'VALID' | 'PARTIAL' | 'INVALID' | 'NOT_AVAILABLE' | 'DEGRADED';
export type ResultType =
  | 'CALCULATED'
  | 'RULE_BASED'
  | 'STATISTICAL_ESTIMATE'
  | 'MODEL_PREDICTION'
  | 'CROSS_TOOL_DERIVED'
  | 'NOT_AVAILABLE';

export type UncertaintyLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'INSUFFICIENT_EVIDENCE' | 'NOT_ASSESSED';

export interface UncertaintyRecord {
  level: UncertaintyLevel;
  basis: string[];
  affectedOutputs: string[];
  whatWouldReduceIt: string[];
  limitations: string[];
}

export interface ProvenanceRecord {
  source: string;
  recordedAt: string;
  timezone: string;
  unit: string;
  originalUnit?: string;
  measurementMethod?: string;
  deviceId?: string;
  confidence: number | null;
  dataQuality: 'high' | 'medium' | 'low' | 'not_assessed';
  referenceRange?: { low?: number; high?: number; unit: string; source?: string };
}

export interface AssumptionRecord {
  assumptionId: string;
  description: string;
  type: 'model' | 'formula' | 'population' | 'domain' | 'user_declared';
  impact: string;
  version: string;
}

export interface EvidenceReference {
  evidenceId: string;
  sourceType: 'formula' | 'rule' | 'study' | 'documentation' | 'user_input' | 'cross_tool';
  title: string;
  url?: string;
  publishedAt?: string;
  reviewedAt?: string;
  applicability: string;
  limitations: string[];
  version: string;
}

export interface ResultValidity {
  status: 'CURRENT' | 'STALE' | 'INVALIDATED' | 'NOT_ASSESSED';
  validUntil?: string;
  invalidationTriggers: string[];
  freshnessPolicyId?: string;
  policyVersion?: string;
}

export interface ContextReference {
  contextId: string;
  source: string;
  type: string;
  freshness: string;
  usedInCalculation: boolean;
}

export interface ProposedNextAction {
  actionId: string;
  type: 'calculate' | 'navigate' | 'input' | 'review' | 'escalate';
  labelKey: string;
  targetToolId?: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

export interface ToolResultEnvelopeV4<TInput, TResult> {
  contractVersion: ContractVersion;
  schemaVersion: SchemaVersion;
  toolId: string;
  canonicalSlug: string;
  engineVersion: string;
  calculationId: string;
  status: ResultStatus;
  inputSnapshot: InputSnapshot<TInput>;
  result: TResult | null;
  resultType: ResultType;
  provenance: ProvenanceRecord[];
  units: Record<string, string>;
  assumptions: AssumptionRecord[];
  evidence: EvidenceReference[];
  uncertainty: UncertaintyRecord;
  warnings: SafetyWarningV4[];
  validity: ResultValidity;
  privacyClass: DataClassification;
  contextUsed: ContextReference[];
  nextActions: ProposedNextAction[];
  auditRef?: string;
  createdAt: string;
}

// ============================================================
// §5. Safety Warning (V4.0)
// ============================================================

export interface SafetyWarningV4 {
  warningId: string;
  level: 'info' | 'caution' | 'warning' | 'critical';
  code: string;
  message: string;
  action?: string;
  relatedTools?: string[];
  trigger: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
}

// ============================================================
// §6. AI Capability Contract (SPEC §8)
// ============================================================

export type AIStatus = 'DISABLED' | 'NOT_CONFIGURED' | 'ENABLED' | 'DEGRADED' | 'SUSPENDED';

export type AICapability =
  | 'INPUT_UNDERSTANDING'
  | 'MISSING_DATA_COACH'
  | 'UNIT_FORMAT_ASSIST'
  | 'CONTEXT_RESOLUTION_ASSIST'
  | 'SMART_VALIDATION_ASSIST'
  | 'SCENARIO_GENERATION_ASSIST'
  | 'SENSITIVITY_EXPLANATION'
  | 'EVIDENCE_AWARE_EXPLANATION'
  | 'SAFETY_ESCALATION_ASSIST'
  | 'NEXT_STEP_RECOMMENDATION';

export type RiskClass = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ActionPermission = 'read' | 'propose' | 'execute';

export interface AICapabilityProfile {
  toolId: string;
  profileVersion: string;
  aiStatus: AIStatus;
  permittedCapabilities: AICapability[];
  prohibitedCapabilities: AICapability[];
  allowedInputClasses: DataClassification[];
  excludedInputClasses: DataClassification[];
  approvedContextSources: string[];
  outputSchema: string; // schema ID reference
  allowedTools: string[];
  actionPermissions: ActionPermission[];
  riskClass: RiskClass;
  evidenceMinimum: string;
  humanReviewRules: string[];
  modelPolicy: ModelPolicy | null;
  budget: AIBudget;
  fallbackPolicy: FallbackPolicy;
  evaluationProfile: EvaluationProfile;
  stopConditions: string[];
  auditPolicy: AuditPolicy;
}

export interface ModelPolicy {
  provider: string;
  modelId: string;
  modelVersion: string;
  maxTokens: number;
  temperature: number;
  approvedAt: string;
  approvedBy: string;
}

export interface AIBudget {
  maxCallsPerSession: number;
  maxTokensPerCall: number;
  maxCostPerSession: number;
  maxRetries: number;
  timeoutMs: number;
  maxConcurrency: number;
}

export interface FallbackPolicy {
  onUnavailable: 'continue_deterministic' | 'degrade' | 'block';
  onInvalidOutput: 'discard_and_retry' | 'discard_and_fallback' | 'block';
  onTimeout: 'retry' | 'fallback' | 'block';
  onBudgetExceeded: 'stop' | 'degrade';
}

export interface EvaluationProfile {
  goldenTestCount: number;
  adversarialTestCount: number;
  qualityThreshold: number;
  lastEvaluationDate?: string;
  evaluationResult?: 'PASS' | 'FAIL' | 'PARTIAL' | 'NOT_RUN';
}

export interface AuditPolicy {
  logInputs: boolean;
  logOutputs: boolean;
  redactSensitive: boolean;
  retentionDays: number;
  accessibleBy: string[];
}

// ============================================================
// §7. Safety & Escalation Contract (SPEC §9)
// ============================================================

export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SafetyContract {
  toolId: string;
  version: string;
  domain: string;
  intendedUse: string;
  notFor: string[];
  riskClasses: RiskTier[];
  sensitiveInputs: string[];
  prohibitedOutputs: string[];
  inputGuards: InputGuard[];
  outputGuards: OutputGuard[];
  permissionModel: PermissionModel;
  humanEscalation: HumanEscalation;
  failClosedRules: string[];
  auditRequirements: string[];
  userFacingExplanation: string;
}

export interface InputGuard {
  guardId: string;
  type: 'required' | 'range' | 'enum' | 'cross_field' | 'provenance' | 'freshness' | 'contradiction';
  field: string;
  condition: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface OutputGuard {
  guardId: string;
  type: 'schema' | 'evidence' | 'sensitive_filter' | 'numeric' | 'result_constraint';
  field: string;
  condition: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface PermissionModel {
  allowedActors: string[];
  resourceScopes: string[];
  read: boolean;
  write: boolean;
  propose: boolean;
  execute: boolean;
}

export interface HumanEscalation {
  triggerConditions: string[];
  approverRoles: string[];
  evidenceShown: string[];
  onRejection: 'block' | 'degrade' | 'continue_with_warning';
  onTimeout: 'block' | 'degrade' | 'continue_with_warning';
  timeoutMs: number;
}

// ============================================================
// §8. UserContext & Context Engine (SPEC §5, §12)
// ============================================================

export interface UserContextV4 {
  userId?: string;
  sessionId?: string;
  preferences: UserPreferencesV4;
  history: ToolHistoryEntryV4[];
  biometrics?: BiometricSnapshotV4;
  consentScopes: string[];
  declaredGoals: string[];
  declaredConstraints: string[];
}

export interface UserPreferencesV4 {
  unitSystem: UnitSystem;
  language: Locale;
  theme: 'dark' | 'light' | 'system';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  currency?: string;
  voiceEnabled?: boolean;
  aiSuggestionsEnabled?: boolean;
}

export interface ToolHistoryEntryV4 {
  toolId: string;
  timestamp: string; // ISO-8601
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  rating?: number;
  durationMs: number;
  schemaVersion: string;
}

export interface BiometricSnapshotV4 {
  heightCm: number;
  weightKg: number;
  bodyFatPct?: number;
  ffmi?: number;
  age: number;
  sex: 'male' | 'female';
  updatedAt: string; // ISO-8601
  source: string;
}

// ============================================================
// §9. Cross-Tool Result Contract (SPEC §11)
// ============================================================

export interface CrossToolLinkV4 {
  sourceToolId: string;
  targetToolId: string;
  relationship: 'feeds' | 'consumes' | 'validates' | 'enriches' | 'alternates' | 'sequences';
  strength: number; // 0-1
  description: string;
  dataMapping: {
    sourceField: string;
    targetField: string;
    transform: 'identity' | 'unitConvert' | 'scale' | 'derive' | 'aggregate' | 'map' | 'filter';
    transformParams?: Record<string, unknown>;
  };
  freshnessPolicyId: string;
  validity: ResultValidity;
}

export type FreshnessPolicyType = 'realtime' | 'session' | 'daily' | 'on-demand' | 'manual';

// ============================================================
// §10. Audit & Monitoring Layer (SPEC §12.3)
// ============================================================

export interface AuditRecord {
  auditId: string;
  timestamp: string; // ISO-8601
  actorRef: string; // pseudonymous user/session ref
  toolId: string;
  engineVersion: string;
  contractVersion: ContractVersion;
  schemaVersion: SchemaVersion;
  action: string;
  capability?: AICapability;
  riskTier: RiskTier;
  authorizationResult: 'allowed' | 'denied' | 'escalated' | 'not_applicable';
  approvalRef?: string;
  inputValidationOutcome: 'pass' | 'fail' | 'partial';
  outputValidationOutcome: 'pass' | 'fail' | 'partial';
  dataSourceRefs: string[];
  freshnessStatus: string;
  modelRef?: string; // provider/model/version if used
  usageMetadata?: { tokens?: number; latencyMs?: number; cost?: number };
  executionOutcome: 'success' | 'failure' | 'degraded' | 'blocked';
  errorCategory?: string;
  timingMs: number;
  retryCount: number;
  correlationId: string;
  redactedContext: Record<string, unknown>;
}

// ============================================================
// §11. Storage States (SPEC §12.2)
// ============================================================

export type StorageState = 'LOCAL_ONLY' | 'PENDING_SYNC' | 'SYNCED_CONFIRMED' | 'SYNC_FAILED' | 'NOT_SAVED';

export interface StorageStatus {
  state: StorageState;
  lastSyncAttempt?: string; // ISO-8601
  lastSyncSuccess?: string; // ISO-8601
  retryCount: number;
  errorMessage?: string;
  conflictDetected: boolean;
}

// ============================================================
// §12. Tool Capability Registry
// ============================================================

export interface ToolCapabilityProfile {
  toolId: string;
  canonicalSlug: string;
  version: string;
  category: string;
  accessTier: AccessTier;
  capabilities: ToolCapability[];
  aiProfile: AICapabilityProfile | null;
  safetyContract: SafetyContract;
  crossToolLinks: CrossToolLinkV4[];
  inputSchema: FieldDefinition[];
  outputSchema: string; // schema ID reference
  freshnessPolicies: FreshnessPolicyType[];
  storageState: StorageState;
  auditEnabled: boolean;
  evidenceMinimum: string;
  humanReviewRequired: boolean;
}

export type ToolCapability =
  | 'CALCULATION'
  | 'VALIDATION'
  | 'CONTEXT_RESOLUTION'
  | 'PREDICTION'
  | 'DECISION'
  | 'EXPLANATION'
  | 'EVIDENCE'
  | 'SAFETY'
  | 'PERSONALIZATION'
  | 'EVALUATION'
  | 'PERSISTENCE'
  | 'EXPORT'
  | 'CROSS_TOOL'
  | 'AI_ASSIST';

// ============================================================
// §13. Backward Compatibility
// ============================================================

export interface CompatibilityRule {
  ruleId: string;
  description: string;
  appliesTo: string[]; // tool IDs or '*' for all
  fromVersion: string;
  toVersion: string;
  breaking: boolean;
  migrationRequired: boolean;
  testRequired: boolean;
}

export const V4_COMPATIBILITY_RULES: CompatibilityRule[] = [
  {
    ruleId: 'V4-COMPAT-001',
    description: 'V4 contracts are additive; existing v6 engines retain their identity and behavior',
    appliesTo: ['*'],
    fromVersion: '6.0.0',
    toVersion: '4.0.0',
    breaking: false,
    migrationRequired: false,
    testRequired: true,
  },
  {
    ruleId: 'V4-COMPAT-002',
    description: 'Macro v6 engine is protected; no formula changes without owner approval',
    appliesTo: ['mrx.tool.macro'],
    fromVersion: '6.0.0',
    toVersion: '4.0.0',
    breaking: false,
    migrationRequired: false,
    testRequired: true,
  },
  {
    ruleId: 'V4-COMPAT-003',
    description: 'Existing tool routes, IDs, and slugs are preserved',
    appliesTo: ['*'],
    fromVersion: '6.0.0',
    toVersion: '4.0.0',
    breaking: false,
    migrationRequired: false,
    testRequired: false,
  },
  {
    ruleId: 'V4-COMPAT-004',
    description: 'Existing Supabase tables are reused; no new tables without approval',
    appliesTo: ['*'],
    fromVersion: '6.0.0',
    toVersion: '4.0.0',
    breaking: false,
    migrationRequired: false,
    testRequired: true,
  },
];

// All types are already exported via `export interface` and `export type` above.
// No additional re-export needed.

// Constants are already exported via `export const` above.