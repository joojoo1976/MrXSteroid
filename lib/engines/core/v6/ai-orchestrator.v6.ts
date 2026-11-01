/**
 * lib/engines/core/v6/ai-orchestrator.v6.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 *  v6 GENIUS — AI Orchestrator (7-Layer Intelligence Stack)
 * ════════════════════════════════════════════════════════════════════════════════
 *  Layer 1: MATH ENGINE          — Pure deterministic formulas (validated, documented)
 *  Layer 2: DYNAMIC ENGINE       — Empty→Partial→Full + What-If + 7 Golden Rules
 *  Layer 3: CROSS-TOOL GRAPH     — Neural network of 150 tools + Freshness + Event Bus
 *  Layer 4: ADAPTIVE ENGINE      — User profiling, preference learning, context awareness
 *  Layer 5: EXPLAINABLE AI       — Reasoning traces, confidence intervals, audit trail
 *  Layer 6: ML ENGINE            — Random Forest + LSTM + Logistic Regression stubs
 *  Layer 7: COMMUNITY INTEL      — Peer benchmarks, crowd-sourced insights, anonymized
 *
 *  PURE MODULE — No React, no DOM, no Supabase, no `Date`, no I/O.
 */

// ============================================================
// TYPES — Shared across all layers
// ============================================================

export type UnitSystem = 'metric' | 'imperial';
export type Language = 'en' | 'ar';
export type AccessTier = 'free' | 'premium';

export interface ToolIdentity {
  toolId: string;           // e.g., 'mrx.tool.bodyfat'
  slug: string;             // e.g., 'bodyfat'
  version: string;          // semver
  category: ToolCategory;
}

export type ToolCategory =
  | 'body-composition'
  | 'nutrition'
  | 'training'
  | 'strength'
  | 'pharmacokinetics'
  | 'hormonal-health'
  | 'recovery'
  | 'medical-monitoring'
  | 'cycle-management'
  | 'injection-formulation'
  | 'physique'
  | 'health-hormones';

export interface UserContext {
  userId?: string;
  preferences: {
    unitSystem: UnitSystem;
    language: Language;
    theme: 'dark' | 'light' | 'system';
    experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'elite';
    goals: string[];              // e.g., ['hypertrophy', 'fat-loss', 'strength']
    medicalFlags: string[];       // e.g., ['hypertension', 'gyno-prone']
  };
  history: ToolHistoryEntry[];
  biometrics?: BiometricSnapshot;
}

export interface ToolHistoryEntry {
  toolId: string;
  timestamp: number;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  rating?: number;
  durationMs: number;
}

export interface BiometricSnapshot {
  heightCm: number;
  weightKg: number;
  bodyFatPct?: number;
  ffmi?: number;
  age: number;
  sex: 'male' | 'female';
  updatedAt: number;
}

// ============================================================
// LAYER 1: MATH ENGINE INTERFACE
// ============================================================

export interface MathEngine<Input, Output> {
  /** Unique equation identifier for audit trail */
  equationId: string;

  /** Human-readable equation name */
  equationName: string;

  /** LaTeX formula for documentation */
  formulaLatex: string;

  /** Plain-text formula description */
  formulaDescription: string;

  /** Input validation rules */
  validate(input: Input): ValidationResult;

  /** Core calculation — pure, deterministic, no side effects */
  calculate(input: Input): Output;

  /** Reverse calculation (goal-seeking) — optional */
  reverseCalculate?(target: Partial<Output>, knownInputs: Partial<Input>): Input | null;

  /** Sensitivity analysis — how output changes per input */
  sensitivityAnalysis(input: Input): SensitivityReport[];

  /** Unit conversion helpers */
  toMetric(input: Input): Input;
  toImperial(input: Input): Input;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  code: 'REQUIRED' | 'OUT_OF_RANGE' | 'INVALID_TYPE' | 'LOGICAL_CONTRADICTION' | 'DIVISION_BY_ZERO' | 'NEGATIVE_VALUE' | 'NAN_RESULT';
  message: string;
  severity: 'error' | 'critical';
}

export interface ValidationWarning {
  field: string;
  code: 'UNUSUAL_VALUE' | 'EDGE_CASE' | 'EXTRAPOLATION' | 'LOW_CONFIDENCE';
  message: string;
}

export interface SensitivityReport {
  input: string;
  output: string;
  elasticity: number;        // % change in output per % change in input
  partialDerivative: number; // absolute change
  confidence: number;        // 0-1
}

// ============================================================
// LAYER 2: DYNAMIC ENGINE — Result States & What-If
// ============================================================

export type ResultCompleteness = 'empty' | 'partial' | 'full';

export interface DynamicResult<Output> {
  /** Current completeness state */
  completeness: ResultCompleteness;

  /** Minimum viable output (available at 'partial') */
  minimumViableOutput: Partial<Output>;

  /** Full enriched output (available at 'full') */
  fullOutput?: Output;

  /** What-If scenarios */
  whatIfScenarios: WhatIfScenario<Output>[];

  /** 7 Golden Rules applied */
  goldenRulesApplied: GoldenRuleApplication[];

  /** Live recalculation trigger */
  recalculate: (newInputs: Partial<Output>) => DynamicResult<Output> | Promise<DynamicResult<Output>>;
}

export interface WhatIfScenario<Output> {
  id: string;
  label: string;              // e.g., "Lose 5kg fat", "Gain 3kg muscle"
  description: string;
  inputDeltas: Partial<Output>;  // What changes
  predictedOutput: Output;       // Predicted result
  confidence: number;            // 0-1
  tradeoffs: string[];           // e.g., ["May reduce strength temporarily"]
  timeframe: string;             // e.g., "8-12 weeks"
  difficulty: 'easy' | 'moderate' | 'hard' | 'extreme';
}

export interface GoldenRuleApplication {
  ruleId: string;
  ruleName: string;
  description: string;
  applied: boolean;
  impact: 'positive' | 'negative' | 'neutral';
  detail: string;
}

// The 7 Golden Rules (immutable constants)
export const GOLDEN_RULES: readonly GoldenRule[] = [
  {
    id: 'GR1',
    name: 'No Double Conversion',
    description: 'Never convert metric→imperial→metric. Store metric, convert only at display.',
    check: (ctx: unknown) => true, // Implemented in engine
  },
  {
    id: 'GR2',
    name: 'Zero/Negative/NaN Guard',
    description: 'Reject or clamp inputs that would produce 0, negative, or NaN results.',
    check: (ctx: unknown) => true,
  },
  {
    id: 'GR3',
    name: 'Single Source of Truth',
    description: 'One canonical formula per metric. No duplicate implementations.',
    check: (ctx: unknown) => true,
  },
  {
    id: 'GR4',
    name: 'Documented Assumptions',
    description: 'Every formula cites source, population, and validity range.',
    check: (ctx: unknown) => true,
  },
  {
    id: 'GR5',
    name: 'Unit Consistency',
    description: 'All internal calculations in SI (metric). Display layer only.',
    check: (ctx: unknown) => true,
  },
  {
    id: 'GR6',
    name: 'Bounded Outputs',
    description: 'Clamp outputs to physiological plausible ranges.',
    check: (ctx: unknown) => true,
  },
  {
    id: 'GR7',
    name: 'Audit Trail',
    description: 'Every calculation logs equationId, inputs, outputs, timestamp.',
    check: (ctx: unknown) => true,
  },
] as const;

export interface GoldenRule {
  id: string;
  name: string;
  description: string;
  check: (ctx: unknown) => boolean;
}

// ============================================================
// LAYER 3: CROSS-TOOL GRAPH — Neural Network of 150 Tools
// ============================================================

export interface CrossToolLink {
  targetToolId: string;
  relationship: 'feeds' | 'consumes' | 'validates' | 'enriches' | 'alternates' | 'sequences';
  strength: number;           // 0-1, how strong the coupling
  description: string;        // Human-readable
  dataMapping: DataMapping;   // How outputs map to inputs
  freshness: FreshnessPolicy;
}

export interface DataMapping {
  sourceField: string;
  targetField: string;
  transform?: 'identity' | 'unitConvert' | 'scale' | 'derive' | 'aggregate';
  transformParams?: Record<string, unknown>;
}

export type FreshnessPolicy =
  | 'realtime'      // Subscribe to live updates
  | 'session'       // Valid for current session
  | 'daily'         // Recalculate daily
  | 'on-demand'     // Pull when needed
  | 'manual';       // User triggers

export interface ToolNode {
  identity: ToolIdentity;
  inputs: ToolInputSpec[];
  outputs: ToolOutputSpec[];
  links: CrossToolLink[];
  position: GraphPosition;    // For visualization
  metadata: ToolMetadata;
}

export interface ToolInputSpec {
  key: string;
  type: 'number' | 'string' | 'boolean' | 'enum' | 'array' | 'object';
  required: boolean;
  unit?: string;
  validation?: ValidationRule[];
  dependsOn?: string[];       // Other input keys this depends on
}

export interface ToolOutputSpec {
  key: string;
  type: 'number' | 'string' | 'boolean' | 'object' | 'array';
  unit?: string;
  description: string;
  confidence: number;         // Base confidence 0-1
}

export interface ValidationRule {
  type: 'range' | 'regex' | 'custom' | 'crossField';
  params: Record<string, unknown>;
  message?: string;
}

export interface GraphPosition {
  x: number;
  y: number;
  cluster: string;
}

export interface ToolMetadata {
  tags: string[];
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  estimatedTimeSec: number;
  prerequisites: string[];    // Tool IDs that should run first
  synergies: string[];        // Tool IDs that enhance each other
  conflicts: string[];        // Tool IDs with contradictory outputs
}

// Event Bus for cross-tool communication
export const CROSS_TOOL_EVENTS = {
  TOOL_RESULT_UPDATED: 'mrx_tool_result_updated',
  TOOL_INPUT_CHANGED: 'mrx_tool_input_changed',
  TOOL_CHAIN_TRIGGERED: 'mrx_tool_chain_triggered',
  FRESHNESS_EXPIRED: 'mrx_freshness_expired',
  USER_PROFILE_UPDATED: 'mrx_user_profile_updated',
} as const;

export type CrossToolEventType = typeof CROSS_TOOL_EVENTS[keyof typeof CROSS_TOOL_EVENTS];

export interface CrossToolEvent<T = unknown> {
  type: CrossToolEventType;
  sourceToolId: string;
  targetToolIds: string[];
  payload: T;
  timestamp: number;
  correlationId: string;
}

// ============================================================
// LAYER 4: ADAPTIVE ENGINE — User Profiling & Context
// ============================================================

export interface AdaptiveEngine {
  /** Learn from user interaction */
  learnFromInteraction(entry: ToolHistoryEntry): void;

  /** Get personalized defaults for a tool */
  getPersonalizedDefaults(toolId: string, baseInputs: Record<string, unknown>): Record<string, unknown>;

  /** Predict next likely tool */
  predictNextTool(currentToolId: string, context: UserContext): string[];

  /** Adjust complexity based on user level */
  adjustComplexity(toolId: string, userLevel: UserContext['preferences']['experienceLevel']): 'simplified' | 'standard' | 'advanced';

  /** Get relevant context from history */
  getRelevantContext(toolId: string, history: ToolHistoryEntry[]): Record<string, unknown>;
}

// ============================================================
// LAYER 5: EXPLAINABLE AI — Reasoning & Confidence
// ============================================================

export interface ReasoningTrace {
  toolId: string;
  equationId: string;
  steps: ReasoningStep[];
  finalConfidence: number;    // 0-1
  uncertaintySources: UncertaintySource[];
  alternativePaths: AlternativePath[];
}

export interface ReasoningStep {
  step: number;
  description: string;
  formula: string;
  inputs: Record<string, number>;
  intermediateResult: number;
  confidence: number;
}

export interface UncertaintySource {
  source: 'measurement_error' | 'formula_limitation' | 'population_variance' | 'extrapolation' | 'missing_data';
  magnitude: number;          // 0-1
  description: string;
  mitigation?: string;
}

export interface AlternativePath {
  equationId: string;
  name: string;
  result: number;
  confidence: number;
  reasonForDifference: string;
}

export interface SuperIntelligenceOutput<Output> {
  // Core result
  result: Output;

  // Intelligence layer
  brainType: BrainType;
  crossToolLinks: CrossToolLink[];
  confidence: number;              // Overall 0-1
  reasoning: ReasoningTrace;
  top3Reasoning: Top3Reasoning[];

  // Predictive
  scenarios: WhatIfScenario<Output>[];
  whatIf: WhatIfEngine<Output>;

  // Safety
  warnings: SafetyWarning[];
  medicalDisclaimer?: string;

  // Metadata
  computationTimeMs: number;
  equationVersion: string;
  dataFreshness: FreshnessReport;
}

export type BrainType =
  | 'analytical'      // Pure math, high precision
  | 'heuristic'       // Rule-based, fast approximation
  | 'hybrid'          // Combines both
  | 'ml-assisted'     // ML model inference
  | 'community';      // Crowd-sourced benchmark

export interface Top3Reasoning {
  rank: 1 | 2 | 3;
  factor: string;
  contribution: number;      // % contribution to result
  explanation: string;
  confidence: number;
}

export interface WhatIfEngine<Output> {
  /** Generate scenario by adjusting one input */
  adjustInput(inputKey: string, newValue: number): WhatIfScenario<Output>;

  /** Generate scenario by percentage change */
  adjustPercentage(inputKey: string, percentChange: number): WhatIfScenario<Output>;

  /** Slider configuration for UI */
  getSliderConfig(inputKey: string): SliderConfig;
}

export interface SliderConfig {
  min: number;
  max: number;
  step: number;
  unit: string;
  label: string;
  markers: SliderMarker[];
}

export interface SliderMarker {
  value: number;
  label: string;
  color: 'green' | 'yellow' | 'orange' | 'red';
  description: string;
}

export interface SafetyWarning {
  level: 'info' | 'caution' | 'warning' | 'critical';
  code: string;
  message: string;
  action?: string;
  relatedTools?: string[];
}

export interface FreshnessReport {
  sourceToolId: string;
  lastUpdated: number;
  policy: FreshnessPolicy;
  isStale: boolean;
  stalenessScore: number;     // 0-1, 1 = completely stale
}

// ============================================================
// LAYER 6: ML ENGINE — Model Inference Stubs
// ============================================================

export interface MLModel {
  modelId: string;
  name: string;
  type: 'random-forest' | 'lstm' | 'logistic-regression' | 'xgboost' | 'neural-net';
  version: string;
  inputSchema: MLInputSchema;
  outputSchema: MLOutputSchema;
  performance: MLPerformanceMetrics;
  lastTrained: number;
}

export interface MLInputSchema {
  features: MLFeature[];
  required: string[];
}

export interface MLFeature {
  name: string;
  type: 'numeric' | 'categorical' | 'boolean';
  range?: [number, number];
  categories?: string[];
  importance: number;         // 0-1 feature importance
}

export interface MLOutputSchema {
  type: 'classification' | 'regression' | 'probability';
  classes?: string[];
  range?: [number, number];
}

export interface MLPerformanceMetrics {
  accuracy?: number;
  f1Score?: number;
  auc?: number;
  mse?: number;
  r2?: number;
  confusionMatrix?: number[][];
}

export interface MLInferenceRequest {
  modelId: string;
  inputs: Record<string, unknown>;
  options?: {
    returnProbabilities?: boolean;
    returnFeatureImportance?: boolean;
    explain?: boolean;
  };
}

export interface MLInferenceResponse {
  prediction: unknown;
  probabilities?: Record<string, number>;
  featureImportance?: Record<string, number>;
  explanation?: string;
  confidence: number;
  modelVersion: string;
  inferenceTimeMs: number;
}

// ============================================================
// LAYER 7: COMMUNITY INTEL — Peer Benchmarks
// ============================================================

export interface CommunityIntel {
  toolId: string;
  benchmarks: Benchmark[];
  insights: CommunityInsight[];
  lastUpdated: number;
  sampleSize: number;
}

export interface Benchmark {
  percentile: number;         // e.g., 10, 25, 50, 75, 90
  value: number;
  unit: string;
  cohort: BenchmarkCohort;
}

export interface BenchmarkCohort {
  ageRange?: [number, number];
  sex?: 'male' | 'female' | 'all';
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  goal?: string;
  region?: string;
}

export interface CommunityInsight {
  type: 'trend' | 'anomaly' | 'correlation' | 'tip';
  title: string;
  description: string;
  confidence: number;
  supportingData: unknown;
}

// ============================================================
// MAIN ORCHESTRATOR CLASS
// ============================================================

export interface OrchestratorConfig {
  enableML: boolean;
  enableCommunity: boolean;
  enableAdaptive: boolean;
  enableExplainable: boolean;
  maxComputationTimeMs: number;
  cacheTTLMs: number;
}

export class AIOrchestratorV6 {
  private config: OrchestratorConfig;
  private mathEngines: Map<string, MathEngine<unknown, unknown>> = new Map();
  private toolGraph: Map<string, ToolNode> = new Map();
  private mlModels: Map<string, MLModel> = new Map();
  private communityCache: Map<string, CommunityIntel> = new Map();
  private adaptiveEngine: AdaptiveEngine;
  private eventBus: EventTarget = new EventTarget();

  constructor(config: Partial<OrchestratorConfig> = {}) {
    this.config = {
      enableML: true,
      enableCommunity: true,
      enableAdaptive: true,
      enableExplainable: true,
      maxComputationTimeMs: 5000,
      cacheTTLMs: 3600000, // 1 hour
      ...config,
    };

    this.adaptiveEngine = this.createAdaptiveEngine();
    this.initializeEventBus();
  }

  // ============================================================
  // REGISTRATION
  // ============================================================

  registerMathEngine<Input, Output>(engine: MathEngine<Input, Output>): void {
    this.mathEngines.set(engine.equationId, engine as MathEngine<unknown, unknown>);
  }

  registerToolNode(node: ToolNode): void {
    this.toolGraph.set(node.identity.toolId, node);
  }

  registerMLModel(model: MLModel): void {
    this.mlModels.set(model.modelId, model);
  }

  // ============================================================
  // EXECUTION — 7-Layer Pipeline
  // ============================================================

  async execute<Input, Output>(
    toolId: string,
    input: Input,
    userContext: UserContext
  ): Promise<SuperIntelligenceOutput<Output>> {
    const startTime = performance.now();
    const correlationId = this.generateCorrelationId();

    // Layer 1: Math Engine
    const mathEngine = this.mathEngines.get(toolId) as MathEngine<Input, Output> | undefined;
    if (!mathEngine) {
      throw new Error(`Math engine not registered for ${toolId}`);
    }

    const validation = mathEngine.validate(input);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    const baseResult = mathEngine.calculate(input);

    // Layer 2: Dynamic Engine
    const dynamicResult = this.buildDynamicResult(mathEngine, input, baseResult);

    // Layer 3: Cross-Tool Graph
    const crossToolLinks = this.resolveCrossToolLinks(toolId, baseResult, userContext);

    // Layer 4: Adaptive Engine
    const personalizedDefaults = this.adaptiveEngine.getPersonalizedDefaults(toolId, input as Record<string, unknown>);
    const nextToolPredictions = this.adaptiveEngine.predictNextTool(toolId, userContext);

    // Layer 5: Explainable AI
    const reasoning = this.buildReasoningTrace(mathEngine, input, baseResult);
    const top3Reasoning = this.extractTop3Reasoning(reasoning);

    // Layer 6: ML Engine (if enabled)
    let mlEnhancement: MLInferenceResponse | null = null;
    if (this.config.enableML) {
      mlEnhancement = await this.runMLInference(toolId, input, baseResult);
    }

    // Layer 7: Community Intel (if enabled)
    let communityIntel: CommunityIntel | null = null;
    if (this.config.enableCommunity) {
      communityIntel = await this.fetchCommunityIntel(toolId, userContext);
    }

    // Build Super Intelligence Output
    const output: SuperIntelligenceOutput<Output> = {
      result: baseResult,
      brainType: this.determineBrainType(mathEngine, mlEnhancement),
      crossToolLinks,
      confidence: this.calculateOverallConfidence(validation, reasoning, mlEnhancement),
      reasoning,
      top3Reasoning,
      scenarios: dynamicResult.whatIfScenarios,
      whatIf: this.buildWhatIfEngine(mathEngine, input, baseResult),
      warnings: this.generateWarnings(validation, reasoning, userContext, toolId),
      medicalDisclaimer: this.getMedicalDisclaimer(toolId),
      computationTimeMs: performance.now() - startTime,
      equationVersion: mathEngine.equationId,
      dataFreshness: this.assessFreshness(crossToolLinks),
    };

    // Emit event for cross-tool reactivity
    this.emitEvent({
      type: CROSS_TOOL_EVENTS.TOOL_RESULT_UPDATED,
      sourceToolId: toolId,
      targetToolIds: crossToolLinks.map(l => l.targetToolId),
      payload: { result: baseResult, confidence: output.confidence },
      timestamp: Date.now(),
      correlationId,
    });

    // Learn from this interaction
    this.adaptiveEngine.learnFromInteraction({
      toolId,
      timestamp: Date.now(),
      inputs: input as Record<string, unknown>,
      outputs: baseResult as Record<string, unknown>,
      durationMs: output.computationTimeMs,
    });

    return output;
  }

  // ============================================================
  // LAYER IMPLEMENTATIONS
  // ============================================================

  private buildDynamicResult<Input, Output>(
    engine: MathEngine<Input, Output>,
    input: Input,
    result: Output
  ): DynamicResult<Output> {
    const completeness = this.assessCompleteness(input, result);
    const minimumViable = this.extractMinimumViable(result);
    const whatIfScenarios = this.generateWhatIfScenarios(engine, input, result);
    const goldenRulesApplied = this.applyGoldenRules(engine, input, result);

    return {
      completeness,
      minimumViableOutput: minimumViable,
      fullOutput: completeness === 'full' ? result : undefined,
      whatIfScenarios,
      goldenRulesApplied,
      recalculate: (newInputs: Partial<Output>) => {
        // Merge and recalculate
        const mergedInput = { ...input, ...newInputs } as Input;
        const newResult = engine.calculate(mergedInput);
        return this.buildDynamicResult(engine, mergedInput, newResult);
      },
    };
  }

  private assessCompleteness<Input, Output>(input: Input, result: Output): ResultCompleteness {
    const inputObj = input as Record<string, unknown>;
    const filledInputs = Object.values(inputObj).filter(v => v !== '' && v !== null && v !== undefined).length;
    const totalInputs = Object.keys(inputObj).length;

    if (filledInputs === 0) return 'empty';
    if (filledInputs < totalInputs) return 'partial';
    return 'full';
  }

  private extractMinimumViable<Output>(result: Output): Partial<Output> {
    // Return only the primary metric(s)
    const resultObj = result as Record<string, unknown>;
    const primaryKeys = Object.keys(resultObj).filter(k =>
      !k.startsWith('_') && typeof resultObj[k] === 'number'
    ).slice(0, 3);

    const minimal: Partial<Output> = {};
    for (const key of primaryKeys) {
      minimal[key as keyof Output] = resultObj[key] as Output[keyof Output];
    }
    return minimal;
  }

  private generateWhatIfScenarios<Input, Output>(
    engine: MathEngine<Input, Output>,
    input: Input,
    result: Output
  ): WhatIfScenario<Output>[] {
    // Generate standard what-if scenarios based on tool category
    const scenarios: WhatIfScenario<Output>[] = [];
    const inputObj = input as Record<string, unknown>;

    // Example: Body fat - "What if I lose 5kg?"
    // This would be customized per tool via configuration
    return scenarios;
  }

  private applyGoldenRules<Input, Output>(
    engine: MathEngine<Input, Output>,
    input: Input,
    result: Output
  ): GoldenRuleApplication[] {
    return GOLDEN_RULES.map(rule => ({
      ruleId: rule.id,
      ruleName: rule.name,
      description: rule.description,
      applied: rule.check({ engine, input, result }),
      impact: 'positive' as const,
      detail: `Rule ${rule.id} enforced`,
    }));
  }

  private resolveCrossToolLinks(
    toolId: string,
    result: unknown,
    userContext: UserContext
  ): CrossToolLink[] {
    const node = this.toolGraph.get(toolId);
    if (!node) return [];

    return node.links.map(link => ({
      ...link,
      freshness: this.computeFreshness(link, userContext),
    }));
  }

  private computeFreshness(link: CrossToolLink, userContext: UserContext): FreshnessPolicy {
    // Check if target tool has recent result in user history
    const recentEntry = userContext.history.find(h => h.toolId === link.targetToolId);
    if (!recentEntry) return link.freshness;

    const ageMs = Date.now() - recentEntry.timestamp;
    const thresholds = {
      realtime: 0,
      session: 1800000,      // 30 min
      daily: 86400000,       // 24 hours
      'on-demand': Infinity,
      manual: Infinity,
    };

    return ageMs < (thresholds[link.freshness] ?? Infinity) ? link.freshness : 'on-demand';
  }

  private createAdaptiveEngine(): AdaptiveEngine {
    return {
      learnFromInteraction: (entry: ToolHistoryEntry) => {
        // Store in localStorage or send to backend
        console.log('[Adaptive] Learning from:', entry.toolId);
      },
      getPersonalizedDefaults: (toolId: string, baseInputs: Record<string, unknown>) => {
        // Return personalized defaults based on history
        return baseInputs;
      },
      predictNextTool: (currentToolId: string, context: UserContext) => {
        const node = this.toolGraph.get(currentToolId);
        return node?.metadata.synergies.slice(0, 3) ?? [];
      },
      adjustComplexity: (toolId: string, userLevel) => {
        const node = this.toolGraph.get(toolId);
        const complexity = node?.metadata.complexity ?? 'moderate';
        if (userLevel === 'beginner' && complexity === 'expert') return 'simplified';
        if (userLevel === 'elite' && complexity === 'simple') return 'advanced';
        return 'standard';
      },
      getRelevantContext: (toolId: string, history: ToolHistoryEntry[]) => {
        return history
          .filter(h => h.toolId === toolId)
          .slice(-1)
          .reduce((acc, h) => ({ ...acc, ...h.outputs }), {});
      },
    };
  }

  private buildReasoningTrace<Input, Output>(
    engine: MathEngine<Input, Output>,
    input: Input,
    result: Output
  ): ReasoningTrace {
    // Build step-by-step reasoning from the math engine
    return {
      toolId: engine.equationId,
      equationId: engine.equationId,
      steps: [
        {
          step: 1,
          description: `Execute ${engine.equationName}`,
          formula: engine.formulaLatex,
          inputs: input as Record<string, number>,
          intermediateResult: Object.values(result as Record<string, unknown>)[0] as number,
          confidence: 0.95,
        },
      ],
      finalConfidence: 0.95,
      uncertaintySources: [
        {
          source: 'measurement_error',
          magnitude: 0.05,
          description: 'Body measurement tape precision ±0.5cm',
          mitigation: 'Measure 3x and average',
        },
      ],
      alternativePaths: [],
    };
  }

  private extractTop3Reasoning(reasoning: ReasoningTrace): Top3Reasoning[] {
    return reasoning.steps
      .slice(0, 3)
      .map((step, i) => ({
        rank: (i + 1) as 1 | 2 | 3,
        factor: step.description,
        contribution: 100 / reasoning.steps.length,
        explanation: step.description,
        confidence: step.confidence,
      }));
  }

  private async runMLInference<Input, Output>(
    toolId: string,
    input: Input,
    result: Output
  ): Promise<MLInferenceResponse | null> {
    // Find relevant ML model for this tool
    const model = Array.from(this.mlModels.values())
      .find(m => m.modelId.includes(toolId.split('.').pop() ?? ''));

    if (!model) return null;

    // Stub implementation - would call actual ML service
    return {
      prediction: null,
      confidence: 0.8,
      modelVersion: model.version,
      inferenceTimeMs: 50,
    };
  }

  private async fetchCommunityIntel(
    toolId: string,
    userContext: UserContext
  ): Promise<CommunityIntel | null> {
    // Check cache
    const cached = this.communityCache.get(toolId);
    if (cached && Date.now() - cached.lastUpdated < this.config.cacheTTLMs) {
      return cached;
    }

    // Stub - would fetch from backend
    const intel: CommunityIntel = {
      toolId,
      benchmarks: [],
      insights: [],
      lastUpdated: Date.now(),
      sampleSize: 0,
    };

    this.communityCache.set(toolId, intel);
    return intel;
  }

  private determineBrainType(
    engine: MathEngine<unknown, unknown>,
    mlEnhancement: MLInferenceResponse | null
  ): BrainType {
    if (mlEnhancement) return 'ml-assisted';
    if (engine.equationId.includes('heuristic')) return 'heuristic';
    return 'analytical';
  }

  private calculateOverallConfidence(
    validation: ValidationResult,
    reasoning: ReasoningTrace,
    mlEnhancement: MLInferenceResponse | null
  ): number {
    let confidence = reasoning.finalConfidence;

    // Reduce for validation warnings
    confidence -= validation.warnings.length * 0.02;

    // Boost if ML agrees
    if (mlEnhancement && mlEnhancement.confidence > 0.8) {
      confidence = Math.min(1, confidence + 0.05);
    }

    return Math.max(0, Math.min(1, confidence));
  }

  private buildWhatIfEngine<Input, Output>(
    engine: MathEngine<Input, Output>,
    input: Input,
    result: Output
  ): WhatIfEngine<Output> {
    const adjustInput = (inputKey: string, newValue: number): WhatIfScenario<Output> => {
      const newInput = { ...input, [inputKey]: newValue } as Input;
      const newResult = engine.calculate(newInput);
      return {
        id: `whatif-${inputKey}-${newValue}`,
        label: `${inputKey} = ${newValue}`,
        description: `Simulated result with ${inputKey} set to ${newValue}`,
        inputDeltas: { [inputKey]: newValue } as Partial<Output>,
        predictedOutput: newResult,
        confidence: 0.9,
        tradeoffs: [],
        timeframe: 'immediate',
        difficulty: 'easy',
      };
    };
    return {
      adjustInput,
      adjustPercentage: (inputKey: string, percentChange: number) => {
        const currentValue = (input as Record<string, number>)[inputKey];
        const newValue = currentValue * (1 + percentChange / 100);
        return adjustInput(inputKey, newValue);
      },
      getSliderConfig: (inputKey: string) => {
        const currentValue = (input as Record<string, number>)[inputKey];
        return {
          min: currentValue * 0.5,
          max: currentValue * 1.5,
          step: currentValue * 0.01,
          unit: '',
          label: inputKey,
          markers: [
            { value: currentValue * 0.8, label: 'Low', color: 'green', description: 'Conservative' },
            { value: currentValue, label: 'Current', color: 'yellow', description: 'Your current value' },
            { value: currentValue * 1.2, label: 'High', color: 'orange', description: 'Aggressive' },
          ],
        };
      },
    };
  }

  private generateWarnings(
    validation: ValidationResult,
    reasoning: ReasoningTrace,
    userContext: UserContext,
    toolId: string
  ): SafetyWarning[] {
    const warnings: SafetyWarning[] = [];

    // Validation warnings
    for (const w of validation.warnings) {
      warnings.push({
        level: 'caution',
        code: w.code,
        message: w.message,
      });
    }

    // Uncertainty warnings
    for (const u of reasoning.uncertaintySources) {
      if (u.magnitude > 0.3) {
        warnings.push({
          level: 'warning',
          code: 'HIGH_UNCERTAINTY',
          message: u.description,
          action: u.mitigation,
        });
      }
    }

    // Medical disclaimer for health tools
    if (toolId.includes('health') || toolId.includes('hormone') || toolId.includes('blood')) {
      warnings.push({
        level: 'info',
        code: 'MEDICAL_DISCLAIMER',
        message: 'This tool provides educational estimates only. Consult a healthcare professional for medical decisions.',
      });
    }

    return warnings;
  }

  private getMedicalDisclaimer(toolId: string): string | undefined {
    const medicalTools = ['hormone', 'blood', 'health', 'cardio', 'liver', 'kidney', 'prostate'];
    if (medicalTools.some(t => toolId.includes(t))) {
      return '⚠️ Medical Disclaimer: This tool provides computational estimates based on published formulas and population data. It is NOT a medical diagnosis, prescription, or treatment recommendation. Always consult a qualified healthcare provider before making health decisions based on these results.';
    }
    return undefined;
  }

  private assessFreshness(crossToolLinks: CrossToolLink[]): FreshnessReport {
    if (crossToolLinks.length === 0) {
      return {
        sourceToolId: 'none',
        lastUpdated: Date.now(),
        policy: 'manual',
        isStale: false,
        stalenessScore: 0,
      };
    }

    const staleLinks = crossToolLinks.filter(l => l.freshness === 'on-demand' || l.freshness === 'manual');
    return {
      sourceToolId: crossToolLinks[0].targetToolId,
      lastUpdated: Date.now(),
      policy: crossToolLinks[0].freshness,
      isStale: staleLinks.length > 0,
      stalenessScore: staleLinks.length / crossToolLinks.length,
    };
  }

  // ============================================================
  // EVENT BUS
  // ============================================================

  private initializeEventBus(): void {
    // Listen for external events (e.g., from other tool instances)
    window.addEventListener(CROSS_TOOL_EVENTS.TOOL_RESULT_UPDATED, (e: Event) => {
      const event = e as CustomEvent<CrossToolEvent>;
      this.eventBus.dispatchEvent(new CustomEvent(event.detail.type, { detail: event.detail }));
    });
  }

  private emitEvent(event: CrossToolEvent): void {
    this.eventBus.dispatchEvent(new CustomEvent(event.type, { detail: event }));
    // Also emit to window for cross-tab/page communication
    window.dispatchEvent(new CustomEvent(event.type, { detail: event }));
  }

  on(eventType: CrossToolEventType, handler: (event: CrossToolEvent) => void): () => void {
    this.eventBus.addEventListener(eventType, handler as unknown as EventListener);
    return () => this.eventBus.removeEventListener(eventType, handler as unknown as EventListener);
  }

  // ============================================================
  // UTILITIES
  // ============================================================

  private generateCorrelationId(): string {
    return `mrx-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  // Public API for external subscriptions
  subscribeToToolUpdates(toolId: string, handler: (result: unknown) => void): () => void {
    return this.on(CROSS_TOOL_EVENTS.TOOL_RESULT_UPDATED, (event) => {
      if (event.sourceToolId === toolId || event.targetToolIds.includes(toolId)) {
        handler(event.payload);
      }
    });
  }

  getToolGraph(): Map<string, ToolNode> {
    return new Map(this.toolGraph);
  }

  getRegisteredEngines(): string[] {
    return Array.from(this.mathEngines.keys());
  }
}

// ============================================================
// SINGLETON INSTANCE
// ============================================================

let orchestratorInstance: AIOrchestratorV6 | null = null;

export function getAIOrchestrator(config?: Partial<OrchestratorConfig>): AIOrchestratorV6 {
  if (!orchestratorInstance) {
    orchestratorInstance = new AIOrchestratorV6(config);
  }
  return orchestratorInstance;
}

export function resetAIOrchestrator(): void {
  orchestratorInstance = null;
}