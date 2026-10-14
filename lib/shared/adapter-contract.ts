// lib/shared/adapter-contract.ts
/**
 * lib/shared/adapter-contract.ts
 * Unified Adapter Contract for SmartTools
 * Layer 3 — Persistence & AI Adapter Pattern
 */

import { ToolOutput, UnitSystem, Locale, AccessTier, SnapshotType } from '@/lib/tools/contracts';
import { ToolSchema } from './schema-contract';
import { BilingualResult } from './result-contract';

/**
 * Engine input/output types for the adapter
 */
export interface EngineInput {
  [key: string]: unknown;
}

export interface EngineOutput {
  [key: string]: unknown;
}

/**
 * Adapter configuration - connects engine, schema, and output builder
 */
export interface ToolAdapterConfig<
  Input,
  Output,
  EngineInput,
  EngineOutput
> {
  /** Unique tool identifier */
  toolSlug: string;
  
  /** Pure engine computation function */
  engineFn: (input: EngineInput) => EngineOutput;
  
  /** Input validation schema */
  schema: ToolSchema<Input>;
  
  /** Transform user input to engine input format */
  transformInput: (input: Input) => EngineInput;
  
  /** Build standardized ToolOutput from engine result */
  buildOutput: (engineResult: EngineOutput, input: Input) => ToolOutput<Output>;
  
  /** Optional: Build AI context from tool output */
  buildAiContext?: (output: ToolOutput<Output>) => AiToolContext<Output>;
}

/**
 * AI context for LLM integration
 */
export interface AiToolContext<Output> {
  toolId: string;
  toolSlug: string;
  calculatedAt: string;
  locale: Locale;
  unitSystem: UnitSystem;
  accessTier: AccessTier;
  snapshotType: SnapshotType;
  provenanceLine: string;
  findings: Array<{
    code: string;
    labelAr: string;
    labelEn: string;
    severity: 'info' | 'monitor' | 'important';
  }>;
  values: Output;
}

/**
 * Creates a standardized tool adapter
 */
export function createToolAdapter<
  Input,
  Output,
  EngineInput,
  EngineOutput
>(config: ToolAdapterConfig<Input, Output, EngineInput, EngineOutput>) {
  
  const { toolSlug, engineFn, schema, transformInput, buildOutput, buildAiContext } = config;
  
  /**
   * Validate and parse input
   */
  const parseInput = (raw: unknown) => schema.tryParse(raw);
  
  /**
   * Compute engine result from validated input
   */
  const compute = (input: Input): EngineOutput => {
    const engineInput = transformInput(input);
    return engineFn(engineInput);
  };
  
  /**
   * Build standardized ToolOutput
   */
  const build = (engineResult: EngineOutput, input: Input): ToolOutput<Output> => 
    buildOutput(engineResult, input);
  
  /**
   * Full pipeline: validate → compute → build output
   */
  const execute = (rawInput: unknown) => {
    const parseResult = parseInput(rawInput);
    if (!parseResult.ok) {
      return { ok: false as const, error: parseResult.error };
    }
    
    try {
      const engineResult = compute(parseResult.data);
      const output = build(engineResult, parseResult.data);
      return { ok: true as const, output };
    } catch (error) {
      return { 
        ok: false as const, 
        error: error instanceof Error ? error : new Error('Unknown error') 
      };
    }
  };
  
  /**
   * Build AI context if configured
   */
  const buildContext = (output: ToolOutput<Output>): AiToolContext<Output> | null => {
    if (!buildAiContext) return null;
    return buildAiContext(output);
  };
  
  return {
    toolSlug,
    parseInput,
    compute,
    build,
    execute,
    buildContext,
  };
}

/**
 * Type for the adapter instance
 */
export type ToolAdapter<
  Input,
  Output,
  EngineInput,
  EngineOutput
> = ReturnType<typeof createToolAdapter<Input, Output, EngineInput, EngineOutput>>;