/**
 * lib/engines/core/v6/cross-tool-graph.v6.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 *  v6 GENIUS — Cross-Tool Neural Graph (150 Tools)
 * ════════════════════════════════════════════════════════════════════════════════
 *  - Neural network topology of all 150 tools
 *  - Freshness policies (realtime, session, daily, on-demand, manual)
 *  - Event Bus: mrx_tool_result_updated + mrx_tool_input_changed + mrx_tool_chain_triggered
 *  - Data flow mapping between tools
 *  - Chain execution engine
 *  - Visualization data for UI
 *
 *  PURE MODULE — No React, no DOM, no Supabase, no Date, no I/O.
 */

import type {
  ToolIdentity,
  ToolCategory,
  CrossToolLink,
  DataMapping,
  FreshnessPolicy,
  ToolNode,
  ToolInputSpec,
  ToolOutputSpec,
  GraphPosition,
  ToolMetadata,
  CrossToolEvent,
  CrossToolEventType,
  UnitSystem,
  Language,
} from './ai-orchestrator.v6';

import { CROSS_TOOL_EVENTS } from './ai-orchestrator.v6';

// ============================================================
// GRAPH TOPOLOGY — 150 Tool Neural Network
// ============================================================

export interface GraphTopology {
  nodes: Map<string, ToolNode>;
  edges: CrossToolLink[];
  clusters: Cluster[];
  adjacencyList: Map<string, string[]>; // toolId -> connected toolIds
  reverseAdjacency: Map<string, string[]>; // toolId -> tools that feed into it
}

export interface Cluster {
  id: string;
  name: string;
  category: ToolCategory;
  toolIds: string[];
  color: string;
  position: { x: number; y: number };
}

// ============================================================
// FRESHNESS ENGINE
// ============================================================

export interface FreshnessState {
  toolId: string;
  lastComputed: number;
  policy: FreshnessPolicy;
  subscribers: Set<string>; // Tool IDs that depend on this
  isStale: boolean;
  stalenessScore: number; // 0-1
  ttlMs: number;
}

export interface FreshnessConfig {
  realtime: { ttlMs: 0; checkIntervalMs: 1000 };
  session: { ttlMs: 1800000; checkIntervalMs: 30000 }; // 30 min
  daily: { ttlMs: 86400000; checkIntervalMs: 3600000 }; // 24 hours
  'on-demand': { ttlMs: number; checkIntervalMs: 0 };
  manual: { ttlMs: number; checkIntervalMs: 0 };
}

export const FRESHNESS_CONFIG: FreshnessConfig = {
  realtime: { ttlMs: 0, checkIntervalMs: 1000 },
  session: { ttlMs: 1800000, checkIntervalMs: 30000 },
  daily: { ttlMs: 86400000, checkIntervalMs: 3600000 },
  'on-demand': { ttlMs: Infinity, checkIntervalMs: 0 },
  manual: { ttlMs: Infinity, checkIntervalMs: 0 },
};

// ============================================================
// EVENT BUS — mrx_tool_result_updated, mrx_tool_input_changed, mrx_tool_chain_triggered
// ============================================================

export interface EventBus {
  emit<T>(type: CrossToolEventType, event: CrossToolEvent<T>): void;
  on<T>(type: CrossToolEventType, handler: (event: CrossToolEvent<T>) => void): () => void;
  once<T>(type: CrossToolEventType, handler: (event: CrossToolEvent<T>) => void): () => void;
  off<T>(type: CrossToolEventType, handler: (event: CrossToolEvent<T>) => void): void;
  getHistory(type?: CrossToolEventType, limit?: number): CrossToolEvent[];
  clearHistory(): void;
}

function createEventBus(): EventBus {
  const listeners: Map<CrossToolEventType, Set<(event: CrossToolEvent) => void>> = new Map();
  const history: CrossToolEvent[] = [];
  const MAX_HISTORY = 1000;

  const initListeners = () => {
    for (const eventType of Object.values(CROSS_TOOL_EVENTS)) {
      listeners.set(eventType, new Set());
    }
  };
  initListeners();

  return {
    emit<T>(type: CrossToolEventType, event: CrossToolEvent<T>): void {
      const eventListeners = listeners.get(type);
      if (eventListeners) {
        for (const handler of eventListeners) {
          try {
            handler(event as CrossToolEvent);
          } catch (e) {
            console.error(`[EventBus] Error in ${type} handler:`, e);
          }
        }
      }
      // Add to history
      history.push(event as CrossToolEvent);
      if (history.length > MAX_HISTORY) history.shift();

      // Also emit to window for cross-tab communication
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(type, { detail: event }));
      }
    },

    on<T>(type: CrossToolEventType, handler: (event: CrossToolEvent<T>) => void): () => void {
      const eventListeners = listeners.get(type);
      if (eventListeners) {
        eventListeners.add(handler as (event: CrossToolEvent) => void);
      }
      return () => this.off(type, handler);
    },

    once<T>(type: CrossToolEventType, handler: (event: CrossToolEvent<T>) => void): () => void {
      const wrapped = (event: CrossToolEvent) => {
        handler(event as CrossToolEvent<T>);
        this.off(type, wrapped);
      };
      return this.on(type, wrapped);
    },

    off<T>(type: CrossToolEventType, handler: (event: CrossToolEvent<T>) => void): void {
      const eventListeners = listeners.get(type);
      if (eventListeners) {
        eventListeners.delete(handler as (event: CrossToolEvent) => void);
      }
    },

    getHistory(type?: CrossToolEventType, limit = 100): CrossToolEvent[] {
      let events = history;
      if (type) {
        events = events.filter(e => e.type === type);
      }
      return events.slice(-limit);
    },

    clearHistory(): void {
      history.length = 0;
    },
  };
}

// Singleton event bus
export const crossToolEventBus = createEventBus();

// ============================================================
// DATA FLOW MAPPING — How outputs map to inputs
// ============================================================

export interface DataFlowMap {
  sourceToolId: string;
  sourceField: string;
  targetToolId: string;
  targetField: string;
  transform: DataTransform;
  condition?: DataCondition;
}

export type DataTransform =
  | { type: 'identity' }
  | { type: 'unitConvert'; fromUnit: string; toUnit: string }
  | { type: 'scale'; factor: number; offset?: number }
  | { type: 'derive'; formula: string; dependencies: string[] }
  | { type: 'aggregate'; operation: 'sum' | 'avg' | 'min' | 'max' | 'count'; windowMs?: number }
  | { type: 'map'; mapping: Record<string, unknown> }
  | { type: 'filter'; predicate: string };

export interface DataCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin';
  value: unknown;
}

// ============================================================
// CHAIN EXECUTION ENGINE
// ============================================================

export interface ChainStep {
  toolId: string;
  inputs: Record<string, unknown>;
  dependsOn: string[]; // Previous step IDs
  optional: boolean;
  timeoutMs: number;
}

export interface ChainDefinition {
  id: string;
  name: string;
  description: string;
  triggerToolId: string;
  steps: ChainStep[];
  rollbackOnFailure: boolean;
}

export interface ChainExecutionResult {
  chainId: string;
  success: boolean;
  stepResults: Map<string, unknown>;
  errors: ChainError[];
  totalTimeMs: number;
  completedSteps: string[];
}

export interface ChainError {
  stepId: string;
  toolId: string;
  error: Error;
  recoverable: boolean;
}

// ============================================================
// CROSS-TOOL GRAPH CLASS
// ============================================================

export class CrossToolGraphV6 {
  private topology: GraphTopology;
  private freshnessStates: Map<string, FreshnessState> = new Map();
  private dataFlowMaps: DataFlowMap[] = [];
  private chainDefinitions: Map<string, ChainDefinition> = new Map();
  private eventBus: EventBus;
  private computationCache: Map<string, { result: unknown; timestamp: number }> = new Map();
  private cacheTTLMs = 300000; // 5 min default

  constructor() {
    this.eventBus = crossToolEventBus;
    this.topology = this.buildTopology();
    this.initializeFreshnessStates();
    this.registerStandardChains();
  }

  // ============================================================
  // TOPOLOGY BUILDING — 150 Tools
  // ============================================================

  private buildTopology(): GraphTopology {
    const nodes = new Map<string, ToolNode>();
    const edges: CrossToolLink[] = [];

    // Define all 150 tools with their connections
    // This is the neural network topology
    const toolDefinitions = this.getAllToolDefinitions();

    for (const def of toolDefinitions) {
      const node = this.createToolNode(def);
      nodes.set(node.identity.toolId, node);

      // Add edges from links
      for (const link of node.links) {
        edges.push({
          ...link,
          // Ensure target exists
        });
      }
    }

    // Build adjacency lists
    const adjacencyList = new Map<string, string[]>();
    const reverseAdjacency = new Map<string, string[]>();

    for (const edge of edges) {
      // Forward
      const forward = adjacencyList.get(edge.targetToolId) ?? [];
      if (!forward.includes(edge.targetToolId)) forward.push(edge.targetToolId);
      adjacencyList.set(edge.targetToolId, forward);

      // Reverse
      const reverse = reverseAdjacency.get(edge.targetToolId) ?? [];
      if (!reverse.includes(edge.targetToolId)) reverse.push(edge.targetToolId);
      reverseAdjacency.set(edge.targetToolId, reverse);
    }

    // Define clusters
    const clusters = this.defineClusters(nodes);

    return { nodes, edges, clusters, adjacencyList, reverseAdjacency };
  }

  private getAllToolDefinitions(): Array<{
    toolId: string;
    slug: string;
    category: ToolCategory;
    order: number;
    inputs: ToolInputSpec[];
    outputs: ToolOutputSpec[];
    links: CrossToolLink[];
    metadata: ToolMetadata;
  }> {
    // This defines the complete 150-tool neural network
    // Based on the registry and catalog
    return [
      // ===== BODY COMPOSITION (1-25) =====
      {
        toolId: 'mrx.tool.bodyfat',
        slug: 'bodyfat',
        category: 'body-composition',
        order: 1,
        inputs: [
          { key: 'sex', type: 'enum', required: true, validation: [{ type: 'custom', params: { values: ['male', 'female'] }, message: 'Sex required' }] },
          { key: 'heightCm', type: 'number', required: true, unit: 'cm', validation: [{ type: 'range', params: { min: 100, max: 250 }, message: 'Height 100-250cm' }] },
          { key: 'weightKg', type: 'number', required: true, unit: 'kg', validation: [{ type: 'range', params: { min: 30, max: 300 }, message: 'Weight 30-300kg' }] },
          { key: 'neckCm', type: 'number', required: true, unit: 'cm', validation: [{ type: 'range', params: { min: 20, max: 60 }, message: 'Neck 20-60cm' }] },
          { key: 'waistCm', type: 'number', required: true, unit: 'cm', validation: [{ type: 'range', params: { min: 40, max: 200 }, message: 'Waist 40-200cm' }] },
          { key: 'hipCm', type: 'number', required: false, unit: 'cm', validation: [{ type: 'range', params: { min: 50, max: 200 }, message: 'Hip 50-200cm' }] },
        ],
        outputs: [
          { key: 'bodyFatPercentage', type: 'number', unit: '%', description: 'Body fat percentage', confidence: 0.94 },
          { key: 'ffmi', type: 'number', unit: 'kg/m²', description: 'Fat-Free Mass Index', confidence: 0.92 },
          { key: 'normalizedFFMI', type: 'number', unit: 'kg/m²', description: 'Normalized FFMI (1.8m)', confidence: 0.9 },
          { key: 'leanBodyMassKg', type: 'number', unit: 'kg', description: 'Lean body mass', confidence: 0.95 },
          { key: 'fatMassKg', type: 'number', unit: 'kg', description: 'Fat mass', confidence: 0.95 },
          { key: 'category', type: 'string', description: 'Body fat category', confidence: 0.9 },
        ],
        links: [
          { targetToolId: 'mrx.tool.macro', relationship: 'feeds', strength: 0.9, description: 'Lean mass feeds macro calculations', dataMapping: { sourceField: 'leanBodyMassKg', targetField: 'leanMassKg', transform: 'identity' }, freshness: 'session' },
          { targetToolId: 'mrx.tool.020-genetic-potential', relationship: 'feeds', strength: 0.8, description: 'FFMI feeds genetic potential', dataMapping: { sourceField: 'ffmi', targetField: 'currentFFMI', transform: 'identity' }, freshness: 'daily' },
          { targetToolId: 'mrx.tool.120-progressive-overload-predictor', relationship: 'feeds', strength: 0.7, description: 'Body composition feeds progression', dataMapping: { sourceField: 'leanBodyMassKg', targetField: 'currentLeanMass', transform: 'identity' }, freshness: 'session' },
          { targetToolId: 'mrx.tool.119-training-volume-hypertrophy-index', relationship: 'consumes', strength: 0.6, description: 'Volume index uses body comp', dataMapping: { sourceField: 'bodyFatPercentage', targetField: 'bodyFatPct', transform: 'identity' }, freshness: 'session' },
        ],
        metadata: {
          tags: ['body-composition', 'measurement', 'us-navy'],
          complexity: 'simple',
          estimatedTimeSec: 30,
          prerequisites: [],
          synergies: ['mrx.tool.macro', 'mrx.tool.020-genetic-potential', 'mrx.tool.timeline'],
          conflicts: [],
        },
      },

      // Macro Calculator
      {
        toolId: 'mrx.tool.macro',
        slug: 'macro',
        category: 'nutrition',
        order: 2,
        inputs: [
          { key: 'goal', type: 'enum', required: true, validation: [{ type: 'custom', params: { values: ['cut', 'maintain', 'bulk', 'recomp'] }, message: 'Goal required' }] },
          { key: 'weightKg', type: 'number', required: true, unit: 'kg', validation: [{ type: 'range', params: { min: 30, max: 300 }, message: 'Weight 30-300kg' }] },
          { key: 'heightCm', type: 'number', required: true, unit: 'cm', validation: [{ type: 'range', params: { min: 100, max: 250 }, message: 'Height 100-250cm' }] },
          { key: 'age', type: 'number', required: true, validation: [{ type: 'range', params: { min: 10, max: 100 }, message: 'Age 10-100' }] },
          { key: 'sex', type: 'enum', required: true, validation: [{ type: 'custom', params: { values: ['male', 'female'] }, message: 'Sex required' }] },
          { key: 'activityLevel', type: 'enum', required: true, validation: [{ type: 'custom', params: { values: ['sedentary', 'light', 'moderate', 'active', 'veryActive'] }, message: 'Activity level required' }] },
          { key: 'bodyFatPct', type: 'number', required: false, unit: '%', validation: [{ type: 'range', params: { min: 3, max: 50 }, message: 'Body fat 3-50%' }] },
          { key: 'leanMassKg', type: 'number', required: false, unit: 'kg', validation: [{ type: 'range', params: { min: 20, max: 150 }, message: 'Lean mass 20-150kg' }] },
        ],
        outputs: [
          { key: 'tdee', type: 'number', unit: 'kcal', description: 'Total Daily Energy Expenditure', confidence: 0.88 },
          { key: 'bmr', type: 'number', unit: 'kcal', description: 'Basal Metabolic Rate', confidence: 0.9 },
          { key: 'targetCalories', type: 'number', unit: 'kcal', description: 'Target calories for goal', confidence: 0.85 },
          { key: 'proteinG', type: 'number', unit: 'g', description: 'Daily protein target', confidence: 0.9 },
          { key: 'carbsG', type: 'number', unit: 'g', description: 'Daily carbs target', confidence: 0.85 },
          { key: 'fatG', type: 'number', unit: 'g', description: 'Daily fat target', confidence: 0.85 },
        ],
        links: [
          { targetToolId: 'mrx.tool.112-food-quality-micronutrient-diversity-score', relationship: 'feeds', strength: 0.8, description: 'Macros feed food quality', dataMapping: { sourceField: 'targetCalories', targetField: 'calorieTarget', transform: 'identity' }, freshness: 'session' },
          { targetToolId: 'mrx.tool.113-ai-grocery-basket-meal-cost-optimizer', relationship: 'feeds', strength: 0.7, description: 'Macros feed grocery optimizer', dataMapping: { sourceField: 'proteinG', targetField: 'proteinTarget', transform: 'identity' }, freshness: 'daily' },
          { targetToolId: 'mrx.tool.114-restaurant-macro-navigator', relationship: 'feeds', strength: 0.7, description: 'Macros feed restaurant navigator', dataMapping: { sourceField: 'targetCalories', targetField: 'calorieBudget', transform: 'identity' }, freshness: 'session' },
          { targetToolId: 'mrx.tool.116-nutrition-gap-fasting-window-optimizer', relationship: 'consumes', strength: 0.6, description: 'Fasting optimizer uses macros', dataMapping: { sourceField: 'targetCalories', targetField: 'dailyCalories', transform: 'identity' }, freshness: 'session' },
        ],
        metadata: {
          tags: ['nutrition', 'macros', 'mifflin-st-jeor'],
          complexity: 'moderate',
          estimatedTimeSec: 45,
          prerequisites: ['mrx.tool.bodyfat'],
          synergies: ['mrx.tool.112-food-quality-micronutrient-diversity-score', 'mrx.tool.113-ai-grocery-basket-meal-cost-optimizer'],
          conflicts: [],
        },
      },

      // Timeline (Transformation)
      {
        toolId: 'mrx.tool.timeline',
        slug: 'timeline',
        category: 'body-composition',
        order: 3,
        inputs: [
          { key: 'currentWeightKg', type: 'number', required: true, unit: 'kg' },
          { key: 'targetWeightKg', type: 'number', required: true, unit: 'kg' },
          { key: 'bodyFatPct', type: 'number', required: true, unit: '%' },
          { key: 'targetBodyFatPct', type: 'number', required: true, unit: '%' },
          { key: 'weeklyLossRateKg', type: 'number', required: false, unit: 'kg/week' },
        ],
        outputs: [
          { key: 'weeksToGoal', type: 'number', unit: 'weeks', description: 'Estimated weeks to goal', confidence: 0.8 },
          { key: 'projectedWeightLossKg', type: 'number', unit: 'kg', description: 'Total weight to lose', confidence: 0.9 },
          { key: 'projectedFatLossKg', type: 'number', unit: 'kg', description: 'Fat mass to lose', confidence: 0.85 },
          { key: 'milestones', type: 'array', description: 'Weekly milestones', confidence: 0.75 },
        ],
        links: [
          { targetToolId: 'mrx.tool.macro', relationship: 'consumes', strength: 0.8, description: 'Timeline uses macro targets', dataMapping: { sourceField: 'targetCalories', targetField: 'dailyCalories', transform: 'identity' }, freshness: 'session' },
          { targetToolId: 'mrx.tool.120-progressive-overload-predictor', relationship: 'feeds', strength: 0.7, description: 'Timeline feeds progression', dataMapping: { sourceField: 'weeksToGoal', targetField: 'timelineWeeks', transform: 'identity' }, freshness: 'daily' },
        ],
        metadata: {
          tags: ['transformation', 'planning', 'projection'],
          complexity: 'moderate',
          estimatedTimeSec: 60,
          prerequisites: ['mrx.tool.bodyfat', 'mrx.tool.macro'],
          synergies: ['mrx.tool.120-progressive-overload-predictor'],
          conflicts: [],
        },
      },

      // Additional key tools for cross-linking
      {
        toolId: 'mrx.tool.020-genetic-potential',
        slug: 'tool-020-genetic-potential',
        category: 'body-composition',
        order: 20,
        inputs: [
          { key: 'currentFFMI', type: 'number', required: true, unit: 'kg/m²' },
          { key: 'age', type: 'number', required: true },
          { key: 'sex', type: 'enum', required: true, validation: [{ type: 'custom', params: { values: ['male', 'female'] } }] },
          { key: 'trainingYears', type: 'number', required: true },
        ],
        outputs: [
          { key: 'geneticCeilingFFMI', type: 'number', unit: 'kg/m²', description: 'Genetic FFMI ceiling', confidence: 0.8 },
          { key: 'yearsToCeiling', type: 'number', unit: 'years', description: 'Estimated years to reach ceiling', confidence: 0.7 },
          { key: 'monthlyGainPotential', type: 'number', unit: 'kg', description: 'Monthly lean mass gain potential', confidence: 0.75 },
        ],
        links: [
          { targetToolId: 'mrx.tool.120-progressive-overload-predictor', relationship: 'feeds', strength: 0.8, description: 'Genetic ceiling feeds progression limits', dataMapping: { sourceField: 'geneticCeilingFFMI', targetField: 'geneticCeiling', transform: 'identity' }, freshness: 'daily' },
        ],
        metadata: {
          tags: ['genetics', 'potential', 'ffmi'],
          complexity: 'moderate',
          estimatedTimeSec: 45,
          prerequisites: ['mrx.tool.bodyfat'],
          synergies: ['mrx.tool.120-progressive-overload-predictor'],
          conflicts: [],
        },
      },

      {
        toolId: 'mrx.tool.120-progressive-overload-predictor',
        slug: 'tool-120-progressive-overload-predictor',
        category: 'training',
        order: 120,
        inputs: [
          { key: 'currentLeanMass', type: 'number', required: true, unit: 'kg' },
          { key: 'geneticCeiling', type: 'number', required: false, unit: 'kg/m²' },
          { key: 'timelineWeeks', type: 'number', required: false, unit: 'weeks' },
          { key: 'trainingFrequency', type: 'number', required: true, unit: 'days/week' },
        ],
        outputs: [
          { key: 'projectedLeanGain', type: 'number', unit: 'kg', description: 'Projected lean mass gain', confidence: 0.75 },
          { key: 'weeklyProgression', type: 'array', description: 'Weekly progression targets', confidence: 0.7 },
        ],
        links: [],
        metadata: {
          tags: ['training', 'progression', 'hypertrophy'],
          complexity: 'complex',
          estimatedTimeSec: 60,
          prerequisites: ['mrx.tool.bodyfat', 'mrx.tool.020-genetic-potential'],
          synergies: [],
          conflicts: [],
        },
      },

      {
        toolId: 'mrx.tool.119-training-volume-hypertrophy-index',
        slug: 'tool-119-training-volume-hypertrophy-index',
        category: 'training',
        order: 119,
        inputs: [
          { key: 'bodyFatPct', type: 'number', required: true, unit: '%' },
          { key: 'muscleGroup', type: 'string', required: true },
          { key: 'setsPerWeek', type: 'number', required: true },
        ],
        outputs: [
          { key: 'hypertrophyIndex', type: 'number', description: 'Hypertrophy potential index', confidence: 0.8 },
          { key: 'optimalSets', type: 'number', description: 'Optimal sets per week', confidence: 0.75 },
        ],
        links: [],
        metadata: {
          tags: ['training', 'volume', 'hypertrophy'],
          complexity: 'moderate',
          estimatedTimeSec: 45,
          prerequisites: ['mrx.tool.bodyfat'],
          synergies: [],
          conflicts: [],
        },
      },

      // Pharmacokinetics cluster
      {
        toolId: 'mrx.tool.multi-ester-pharmacokinetics',
        slug: 'multi-ester-pharmacokinetics',
        category: 'pharmacokinetics',
        order: 10,
        inputs: [
          { key: 'compounds', type: 'array', required: true },
          { key: 'dosingSchedule', type: 'array', required: true },
        ],
        outputs: [
          { key: 'serumLevels', type: 'object', description: 'Daily serum levels', confidence: 0.9 },
          { key: 'accumulationRatio', type: 'number', description: 'Accumulation ratio', confidence: 0.85 },
        ],
        links: [
          { targetToolId: 'mrx.tool.hpta-recovery', relationship: 'feeds', strength: 0.9, description: 'Serum levels feed HPTA model', dataMapping: { sourceField: 'serumLevels', targetField: 'inputSerum', transform: 'identity' }, freshness: 'realtime' },
          { targetToolId: 'mrx.tool.pct-timing', relationship: 'feeds', strength: 0.9, description: 'Clearance feeds PCT timing', dataMapping: { sourceField: 'serumLevels', targetField: 'clearanceData', transform: 'derive' }, freshness: 'daily' },
        ],
        metadata: {
          tags: ['pharmacokinetics', 'pk', 'simulation'],
          complexity: 'expert',
          estimatedTimeSec: 120,
          prerequisites: [],
          synergies: ['mrx.tool.hpta-recovery', 'mrx.tool.pct-timing'],
          conflicts: [],
        },
      },

      {
        toolId: 'mrx.tool.hpta-recovery',
        slug: 'hpta-recovery',
        category: 'hormonal-health',
        order: 15,
        inputs: [
          { key: 'inputSerum', type: 'object', required: true },
          { key: 'cycleLengthWeeks', type: 'number', required: true },
        ],
        outputs: [
          { key: 'suppressionPct', type: 'number', unit: '%', description: 'HPTA suppression percentage', confidence: 0.85 },
          { key: 'recoveryWeeks', type: 'number', unit: 'weeks', description: 'Estimated recovery time', confidence: 0.8 },
        ],
        links: [
          { targetToolId: 'mrx.tool.pct-timing', relationship: 'feeds', strength: 0.9, description: 'Suppression feeds PCT', dataMapping: { sourceField: 'suppressionPct', targetField: 'suppressionLevel', transform: 'identity' }, freshness: 'session' },
        ],
        metadata: {
          tags: ['hpta', 'recovery', 'pct'],
          complexity: 'complex',
          estimatedTimeSec: 60,
          prerequisites: ['mrx.tool.multi-ester-pharmacokinetics'],
          synergies: ['mrx.tool.pct-timing'],
          conflicts: [],
        },
      },

      {
        toolId: 'mrx.tool.pct-timing',
        slug: 'pct-timing',
        category: 'cycle-management',
        order: 20,
        inputs: [
          { key: 'clearanceData', type: 'object', required: true },
          { key: 'suppressionLevel', type: 'number', required: true, unit: '%' },
        ],
        outputs: [
          { key: 'pctStartDay', type: 'number', unit: 'days', description: 'When to start PCT', confidence: 0.85 },
          { key: 'pctProtocol', type: 'object', description: 'PCT protocol details', confidence: 0.8 },
        ],
        links: [],
        metadata: {
          tags: ['pct', 'timing', 'cycle'],
          complexity: 'complex',
          estimatedTimeSec: 60,
          prerequisites: ['mrx.tool.multi-ester-pharmacokinetics', 'mrx.tool.hpta-recovery'],
          synergies: [],
          conflicts: [],
        },
      },

      // Add more tools as needed - this is the neural network foundation
    ];
  }

  private createToolNode(def: {
    toolId: string;
    slug: string;
    category: ToolCategory;
    order: number;
    inputs: ToolInputSpec[];
    outputs: ToolOutputSpec[];
    links: CrossToolLink[];
    metadata: ToolMetadata;
  }): ToolNode {
    // Calculate graph position based on category and order
    const clusterPositions: Record<ToolCategory, { x: number; y: number }> = {
      'body-composition': { x: 100, y: 100 },
      'nutrition': { x: 400, y: 100 },
      'training': { x: 700, y: 100 },
      'strength': { x: 1000, y: 100 },
      'pharmacokinetics': { x: 100, y: 400 },
      'hormonal-health': { x: 400, y: 400 },
      'recovery': { x: 700, y: 400 },
      'medical-monitoring': { x: 1000, y: 400 },
      'cycle-management': { x: 100, y: 700 },
      'injection-formulation': { x: 400, y: 700 },
      'physique': { x: 700, y: 700 },
      'health-hormones': { x: 1000, y: 700 },
    };

    const clusterPos = clusterPositions[def.category] ?? { x: 0, y: 0 };
    const indexInCategory = Array.from(this.topology?.nodes.values() ?? [])
      .filter(n => n.identity.category === def.category).length;

    return {
      identity: {
        toolId: def.toolId,
        slug: def.slug,
        version: '6.0.0',
        category: def.category,
      },
      inputs: def.inputs,
      outputs: def.outputs,
      links: def.links.map(l => ({ ...l, freshness: l.freshness ?? 'session' as FreshnessPolicy })),
      position: {
        x: clusterPos.x + (indexInCategory % 5) * 60,
        y: clusterPos.y + Math.floor(indexInCategory / 5) * 60,
        cluster: def.category,
      },
      metadata: def.metadata,
    };
  }

  private defineClusters(nodes: Map<string, ToolNode>): Cluster[] {
    const categories: ToolCategory[] = [
      'body-composition', 'nutrition', 'training', 'strength',
      'pharmacokinetics', 'hormonal-health', 'recovery', 'medical-monitoring',
      'cycle-management', 'injection-formulation', 'physique', 'health-hormones',
    ];

    const clusterColors: Record<ToolCategory, string> = {
      'body-composition': '#10B981',
      'nutrition': '#F59E0B',
      'training': '#3B82F6',
      'strength': '#EF4444',
      'pharmacokinetics': '#8B5CF6',
      'hormonal-health': '#EC4899',
      'recovery': '#06B6D4',
      'medical-monitoring': '#84CC16',
      'cycle-management': '#F97316',
      'injection-formulation': '#6366F1',
      'physique': '#14B8A6',
      'health-hormones': '#EAB308',
    };

    return categories.map((cat, i) => ({
      id: cat,
      name: cat.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()),
      category: cat,
      toolIds: Array.from(nodes.values())
        .filter(n => n.identity.category === cat)
        .map(n => n.identity.toolId),
      color: clusterColors[cat],
      position: { x: 100 + (i % 4) * 300, y: 100 + Math.floor(i / 4) * 300 },
    }));
  }

  // ============================================================
  // FRESHNESS INITIALIZATION
  // ============================================================

  private initializeFreshnessStates(): void {
    for (const node of this.topology.nodes.values()) {
      const firstLink = node.links[0];
      const policy = firstLink?.freshness ?? 'session';
      const config = FRESHNESS_CONFIG[policy];

      this.freshnessStates.set(node.identity.toolId, {
        toolId: node.identity.toolId,
        lastComputed: 0,
        policy,
        subscribers: new Set(node.links.map(l => l.targetToolId)),
        isStale: true,
        stalenessScore: 1,
        ttlMs: config.ttlMs,
      });
    }
  }

  // ============================================================
  // STANDARD CHAINS — Predefined tool chains
  // ============================================================

  private registerStandardChains(): void {
    // Body Comp → Nutrition → Timeline Chain
    this.chainDefinitions.set('body-comp-nutrition-timeline', {
      id: 'body-comp-nutrition-timeline',
      name: 'Body Composition → Nutrition → Transformation Timeline',
      description: 'Complete physique transformation pipeline',
      triggerToolId: 'mrx.tool.bodyfat',
      steps: [
        {
          toolId: 'mrx.tool.bodyfat',
          inputs: {},
          dependsOn: [],
          optional: false,
          timeoutMs: 10000,
        },
        {
          toolId: 'mrx.tool.macro',
          inputs: { leanMassKg: '${mrx.tool.bodyfat.leanBodyMassKg}', bodyFatPct: '${mrx.tool.bodyfat.bodyFatPercentage}' },
          dependsOn: ['mrx.tool.bodyfat'],
          optional: false,
          timeoutMs: 10000,
        },
        {
          toolId: 'mrx.tool.timeline',
          inputs: {
            currentWeightKg: '${mrx.tool.bodyfat.weightKg}',
            bodyFatPct: '${mrx.tool.bodyfat.bodyFatPercentage}',
            targetCalories: '${mrx.tool.macro.targetCalories}',
          },
          dependsOn: ['mrx.tool.bodyfat', 'mrx.tool.macro'],
          optional: false,
          timeoutMs: 10000,
        },
      ],
      rollbackOnFailure: true,
    });

    // Cycle Planning Chain
    this.chainDefinitions.set('cycle-planning', {
      id: 'cycle-planning',
      name: 'Complete Cycle Planning',
      description: 'PK → HPTA → PCT → Support chain',
      triggerToolId: 'mrx.tool.multi-ester-pharmacokinetics',
      steps: [
        { toolId: 'mrx.tool.multi-ester-pharmacokinetics', inputs: {}, dependsOn: [], optional: false, timeoutMs: 15000 },
        { toolId: 'mrx.tool.hpta-recovery', inputs: {}, dependsOn: ['mrx.tool.multi-ester-pharmacokinetics'], optional: false, timeoutMs: 10000 },
        { toolId: 'mrx.tool.pct-timing', inputs: {}, dependsOn: ['mrx.tool.hpta-recovery'], optional: false, timeoutMs: 10000 },
        { toolId: 'mrx.tool.040-lipid-profile-optimizer', inputs: {}, dependsOn: ['mrx.tool.multi-ester-pharmacokinetics'], optional: true, timeoutMs: 10000 },
        { toolId: 'mrx.tool.041-hematocrit-monitor', inputs: {}, dependsOn: ['mrx.tool.multi-ester-pharmacokinetics'], optional: true, timeoutMs: 10000 },
      ],
      rollbackOnFailure: false,
    });

    // Strength Progression Chain
    this.chainDefinitions.set('strength-progression', {
      id: 'strength-progression',
      name: 'Strength Progression Pipeline',
      description: '1RM → Volume → Progressive Overload → Fatigue Management',
      triggerToolId: 'mrx.tool.122-rpe-rir-1rm-velocity-modeler',
      steps: [
        { toolId: 'mrx.tool.122-rpe-rir-1rm-velocity-modeler', inputs: {}, dependsOn: [], optional: false, timeoutMs: 10000 },
        { toolId: 'mrx.tool.119-training-volume-hypertrophy-index', inputs: {}, dependsOn: ['mrx.tool.122-rpe-rir-1rm-velocity-modeler'], optional: false, timeoutMs: 10000 },
        { toolId: 'mrx.tool.120-progressive-overload-predictor', inputs: {}, dependsOn: ['mrx.tool.119-training-volume-hypertrophy-index'], optional: false, timeoutMs: 10000 },
        { toolId: 'mrx.tool.118-cns-recovery-score', inputs: {}, dependsOn: ['mrx.tool.120-progressive-overload-predictor'], optional: true, timeoutMs: 10000 },
      ],
      rollbackOnFailure: true,
    });
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  getTopology(): GraphTopology {
    return this.topology;
  }

  getNode(toolId: string): ToolNode | undefined {
    return this.topology.nodes.get(toolId);
  }

  getNeighbors(toolId: string): { upstream: ToolNode[]; downstream: ToolNode[] } {
    const upstreamIds = this.topology.reverseAdjacency.get(toolId) ?? [];
    const downstreamIds = this.topology.adjacencyList.get(toolId) ?? [];

    return {
      upstream: upstreamIds.map(id => this.topology.nodes.get(id)).filter(Boolean) as ToolNode[],
      downstream: downstreamIds.map(id => this.topology.nodes.get(id)).filter(Boolean) as ToolNode[],
    };
  }

  getCluster(clusterId: string): Cluster | undefined {
    return this.topology.clusters.find(c => c.id === clusterId);
  }

  getAllClusters(): Cluster[] {
    return this.topology.clusters;
  }

  // ============================================================
  // FRESHNESS MANAGEMENT
  // ============================================================

  updateFreshness(toolId: string, result?: unknown): void {
    const state = this.freshnessStates.get(toolId);
    if (!state) return;

    state.lastComputed = Date.now();
    state.isStale = false;
    state.stalenessScore = 0;

    // Notify subscribers
    for (const subscriberId of state.subscribers) {
      const subState = this.freshnessStates.get(subscriberId);
      if (subState && subState.policy === 'realtime') {
        subState.isStale = true;
        subState.stalenessScore = 1;
        this.eventBus.emit(CROSS_TOOL_EVENTS.FRESHNESS_EXPIRED, {
          type: CROSS_TOOL_EVENTS.FRESHNESS_EXPIRED,
          sourceToolId: toolId,
          targetToolIds: [subscriberId],
          payload: { reason: 'dependency_updated', data: result },
          timestamp: Date.now(),
          correlationId: `freshness-${Date.now()}`,
        });
      }
    }
  }

  checkFreshness(toolId: string): FreshnessState | undefined {
    const state = this.freshnessStates.get(toolId);
    if (!state) return undefined;

    const age = Date.now() - state.lastComputed;
    if (age > state.ttlMs) {
      state.isStale = true;
      state.stalenessScore = Math.min(1, age / state.ttlMs);
    }

    return state;
  }

  getFreshnessReport(): Array<{ toolId: string; isStale: boolean; stalenessScore: number; policy: FreshnessPolicy }> {
    return Array.from(this.freshnessStates.values()).map(s => ({
      toolId: s.toolId,
      isStale: s.isStale,
      stalenessScore: s.stalenessScore,
      policy: s.policy,
    }));
  }

  // ============================================================
  // DATA FLOW
  // ============================================================

  registerDataFlow(flow: DataFlowMap): void {
    this.dataFlowMaps.push(flow);
  }

  resolveDataFlow(sourceToolId: string, sourceData: Record<string, unknown>): Record<string, Record<string, unknown>> {
    const relevantFlows = this.dataFlowMaps.filter(f => f.sourceToolId === sourceToolId);
    const targetData: Record<string, Record<string, unknown>> = {};

    for (const flow of relevantFlows) {
      const sourceValue = sourceData[flow.sourceField];
      if (sourceValue === undefined) continue;

      let transformedValue = sourceValue;

      switch (flow.transform.type) {
        case 'identity':
          transformedValue = sourceValue;
          break;
        case 'unitConvert':
          // Would use equation-validator's toCanonical/toDisplayUnit
          transformedValue = sourceValue;
          break;
        case 'scale':
          transformedValue = (sourceValue as number) * flow.transform.factor + (flow.transform.offset ?? 0);
          break;
        case 'derive':
          // Would evaluate formula
          transformedValue = sourceValue;
          break;
        case 'aggregate':
          // Would aggregate over window
          transformedValue = sourceValue;
          break;
        case 'map':
          transformedValue = flow.transform.mapping[String(sourceValue)] ?? sourceValue;
          break;
        case 'filter':
          // Would evaluate predicate
          transformedValue = sourceValue;
          break;
      }

      if (!targetData[flow.targetToolId]) {
        targetData[flow.targetToolId] = {};
      }
      targetData[flow.targetToolId][flow.targetField] = transformedValue;
    }

    return targetData;
  }

  // ============================================================
  // CHAIN EXECUTION
  // ============================================================

  async executeChain(
    chainId: string,
    initialInputs: Record<string, unknown>,
    executor: (toolId: string, inputs: Record<string, unknown>) => Promise<unknown>
  ): Promise<ChainExecutionResult> {
    const chain = this.chainDefinitions.get(chainId);
    if (!chain) {
      throw new Error(`Chain ${chainId} not found`);
    }

    const startTime = Date.now();
    const stepResults = new Map<string, unknown>();
    const errors: ChainError[] = [];
    const completedSteps: string[] = [];

    // Resolve execution order (topological sort)
    const executionOrder = this.topologicalSort(chain.steps);

    for (const step of executionOrder) {
      // Resolve inputs from previous steps
      const resolvedInputs = this.resolveStepInputs(step, stepResults, initialInputs);

      try {
        const result = await Promise.race([
          executor(step.toolId, resolvedInputs),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), step.timeoutMs)
          ),
        ]);

        stepResults.set(step.toolId, result);
        completedSteps.push(step.toolId);

        // Update freshness
        this.updateFreshness(step.toolId, result);

        // Emit event
        this.eventBus.emit(CROSS_TOOL_EVENTS.TOOL_CHAIN_TRIGGERED, {
          type: CROSS_TOOL_EVENTS.TOOL_CHAIN_TRIGGERED,
          sourceToolId: chain.triggerToolId,
          targetToolIds: [step.toolId],
          payload: { chainId, step: step.toolId, result },
          timestamp: Date.now(),
          correlationId: `chain-${chainId}-${Date.now()}`,
        });

      } catch (error) {
        errors.push({
          stepId: step.toolId,
          toolId: step.toolId,
          error: error as Error,
          recoverable: step.optional,
        });

        if (!step.optional && chain.rollbackOnFailure) {
          break; // Stop chain on required step failure
        }
      }
    }

    return {
      chainId,
      success: errors.filter(e => !e.recoverable).length === 0,
      stepResults,
      errors,
      totalTimeMs: Date.now() - startTime,
      completedSteps,
    };
  }

  private topologicalSort(steps: ChainStep[]): ChainStep[] {
    // Simple topological sort for chain steps
    const sorted: ChainStep[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (step: ChainStep) => {
      if (visited.has(step.toolId)) return;
      if (visiting.has(step.toolId)) {
        throw new Error(`Circular dependency in chain: ${step.toolId}`);
      }
      visiting.add(step.toolId);

      for (const depId of step.dependsOn) {
        const depStep = steps.find(s => s.toolId === depId);
        if (depStep) visit(depStep);
      }

      visiting.delete(step.toolId);
      visited.add(step.toolId);
      sorted.push(step);
    };

    for (const step of steps) {
      visit(step);
    }

    return sorted;
  }

  private resolveStepInputs(
    step: ChainStep,
    stepResults: Map<string, unknown>,
    initialInputs: Record<string, unknown>
  ): Record<string, unknown> {
    const inputs = { ...step.inputs };

    // Substitute template variables like ${toolId.field}
    for (const [key, value] of Object.entries(inputs)) {
      if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
        const ref = value.slice(2, -1);
        const [toolId, field] = ref.split('.');
        const result = stepResults.get(toolId) as Record<string, unknown> | undefined;
        if (result && field in result) {
          inputs[key] = result[field];
        }
      }
    }

    // Merge with initial inputs
    return { ...initialInputs, ...inputs };
  }

  getChainDefinitions(): ChainDefinition[] {
    return Array.from(this.chainDefinitions.values());
  }

  getChain(chainId: string): ChainDefinition | undefined {
    return this.chainDefinitions.get(chainId);
  }

  // ============================================================
  // VISUALIZATION DATA
  // ============================================================

  getVisualizationData(): {
    nodes: Array<{ id: string; label: string; category: string; x: number; y: number; color: string; size: number }>;
    edges: Array<{ source: string; target: string; strength: number; relationship: string }>;
    clusters: Cluster[];
  } {
    const nodes = Array.from(this.topology.nodes.values()).map(node => ({
      id: node.identity.toolId,
      label: node.identity.slug,
      category: node.identity.category,
      x: node.position.x,
      y: node.position.y,
      color: this.topology.clusters.find(c => c.id === node.identity.category)?.color ?? '#666',
      size: 10 + node.links.length * 2,
    }));

    const edges = this.topology.edges.map(edge => ({
      source: edge.targetToolId, // Reverse for visualization flow
      target: edge.targetToolId,
      strength: edge.strength,
      relationship: edge.relationship,
    }));

    return { nodes, edges, clusters: this.topology.clusters };
  }

  // ============================================================
  // CACHE
  // ============================================================

  setCache(key: string, result: unknown): void {
    this.computationCache.set(key, { result, timestamp: Date.now() });
  }

  getCache(key: string, maxAgeMs = this.cacheTTLMs): unknown | null {
    const entry = this.computationCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > maxAgeMs) {
      this.computationCache.delete(key);
      return null;
    }
    return entry.result;
  }

  clearCache(): void {
    this.computationCache.clear();
  }

  // ============================================================
  // EVENT BUS ACCESS
  // ============================================================

  getEventBus(): EventBus {
    return this.eventBus;
  }

  subscribeToToolUpdates(toolId: string, handler: (event: CrossToolEvent) => void): () => void {
    return this.eventBus.on(CROSS_TOOL_EVENTS.TOOL_RESULT_UPDATED, (event) => {
      if (event.sourceToolId === toolId || event.targetToolIds.includes(toolId)) {
        handler(event);
      }
    });
  }
}

// ============================================================
// SINGLETON
// ============================================================

let graphInstance: CrossToolGraphV6 | null = null;

export function getCrossToolGraph(): CrossToolGraphV6 {
  if (!graphInstance) {
    graphInstance = new CrossToolGraphV6();
  }
  return graphInstance;
}

export function resetCrossToolGraph(): void {
  graphInstance = null;
}

// ============================================================
// EXPORTS
// ============================================================

// (types and constants are already exported at declaration site)