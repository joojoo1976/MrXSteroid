// lib/shared/engine-contract.ts
/**
 * lib/shared/engine-contract.ts
 * Unified Engine Contract for SmartTools
 * Layer 1 — Pure computation engine interface
 */

import { z } from 'zod';

export interface EngineContract<Input, Output> {
  /** Pure computation function - no side effects, no I/O */
  compute: (input: Input) => Output;
  
  /** Input validation using Zod */
  validate: (input: unknown) => 
    | { ok: true; data: Input }
    | { ok: false; error: z.ZodError };
  
  /** Engine metadata for documentation and debugging */
  metadata: {
    name: string;
    version: string;
    description: string;
    inputSchema: z.ZodSchema<Input>;
    outputShape: string; // TypeScript type as string for documentation
  };
}

/**
 * Creates a validated engine contract
 */
export function createEngineContract<Input, Output>(
  compute: (input: Input) => Output,
  inputSchema: z.ZodSchema<Input>,
  metadata: {
    name: string;
    version: string;
    description: string;
  }
): EngineContract<Input, Output> {
  return {
    compute,
    validate: (input: unknown) => {
      const result = inputSchema.safeParse(input);
      return result.success
        ? { ok: true, data: result.data }
        : { ok: false, error: result.error };
    },
    metadata: {
      ...metadata,
      inputSchema,
      outputShape: 'See EngineOutput type',
    },
  };
}