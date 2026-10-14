// tests/shared/adapter-basic.test.ts
/**
 * Adapter Contract Integration Tests - Basic
 * Tests for lib/shared/adapter-contract.ts
 */

import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import {
  createToolAdapter,
} from '@/lib/shared/adapter-contract';
import { createToolSchema } from '@/lib/shared/schema-contract';

describe('Adapter Contract Integration Tests - Basic', () => {
  interface EngineInput {
    value: number;
    multiplier: number;
  }

  interface EngineOutput {
    computed: number;
  }

  interface TestInput {
    value: number;
    multiplier: number;
  }

  interface TestOutput {
    result: number;
    metadata: string;
  }

  const testEngineFn = (input: EngineInput): EngineOutput => {
    return { computed: input.value * input.multiplier };
  };

  const testSchema = createToolSchema(
    z.object({
      value: z.number().finite().min(0).max(1000),
      multiplier: z.number().finite().min(0.1).max(10),
    })
  );

  const transformInput = (input: { value: number; multiplier: number }): EngineInput => ({
    value: input.value,
    multiplier: input.multiplier,
  });

  const buildOutput = (engineResult: { computed: number }, input: { value: number; multiplier: number }) => ({
    result: engineResult.computed,
    metadata: `computed with multiplier ${input.multiplier}`,
  });

  const config = {
    toolSlug: 'test-tool',
    engineFn: (input: { value: number; multiplier: number }) => ({ computed: input.value * input.multiplier }),
    schema: createToolSchema(z.object({
      value: z.number().finite().min(0).max(1000),
      multiplier: z.number().finite().min(0.1).max(10),
    })),
    transformInput: (input: { value: number; multiplier: number }) => ({
      value: input.value,
      multiplier: input.multiplier,
    }),
    buildOutput: (engineResult: { computed: number }, input: { value: number; multiplier: number }) => ({
      result: engineResult.computed,
      metadata: `computed with multiplier ${input.multiplier}`,
    }),
  };

  const adapter = createToolAdapter(config);

  describe('Input Validation', () => {
    it('parseInput validates valid input', () => {
      const result = adapter.parseInput({ value: 10, multiplier: 2 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.value).toBe(10);
        expect(result.data.multiplier).toBe(2);
      }
    });

    it('parseInput rejects invalid input', () => {
      const result = adapter.parseInput({ value: -1, multiplier: 2 });
      expect(result.ok).toBe(false);
    });

    it('parseInput rejects wrong types', () => {
      const result = adapter.parseInput({ value: 'ten', multiplier: 2 });
      expect(result.ok).toBe(false);
    });
  });

  describe('Engine Computation', () => {
    it('compute transforms input and calls engine', () => {
      const input = { value: 10, multiplier: 3 };
      const result = adapter.compute(input);
      expect(result).toEqual({ computed: 30 });
    });

    it('compute applies transformation correctly', () => {
      const input = { value: 5, multiplier: 0.5 };
      const result = adapter.compute(input);
      expect(result).toEqual({ computed: 2.5 });
    });

    it('compute handles edge cases', () => {
      const result = adapter.compute({ value: 0, multiplier: 100 });
      expect(result).toEqual({ computed: 0 });
    });
  });

  describe('Output Building', () => {
    it('buildOutput creates correct structure', () => {
      const engineResult = { computed: 42 };
      const input = { value: 7, multiplier: 6 };
      
      const output = adapter.buildOutput(engineResult, input);
      
      expect(output.result).toBe(42);
      expect(output.metadata).toBe('computed with multiplier 6');
    });
  });

  describe('Input-Output Mapping', () => {
    it('transformInput correctly maps user input to engine input', () => {
      const input = { value: 100, multiplier: 2 };
      const engineInput = config.transformInput(input);
      expect(engineInput).toEqual({ value: 100, multiplier: 2 });
    });

    it('buildOutput includes input metadata', () => {
      const engineResult = { computed: 100 };
      const input = { value: 50, multiplier: 2 };
      
      const output = config.buildOutput(engineResult, input);
      
      expect(output.result).toBe(100);
      expect(output.metadata).toContain('multiplier 2');
    });
  });

  describe('Engine Failure Handling', () => {
    it('gracefully handles engine throwing errors', () => {
      const failingAdapter = createToolAdapter({
        ...{
          toolSlug: 'test-tool',
          engineFn: (input: { value: number; multiplier: number }) => ({ computed: input.value * input.multiplier }),
          schema: require('@/lib/shared/schema-contract').createToolSchema(require('zod').object({
            value: require('zod').number().finite().min(0).max(1000),
            multiplier: require('zod').number().finite().min(0.1).max(10),
          })),
          transformInput: (input: { value: number; multiplier: number }) => ({ value: input.value, multiplier: input.multiplier }),
          buildOutput: (engineResult: { computed: number }, input: { value: number; multiplier: number }) => ({
            result: engineResult.computed,
            metadata: `computed with multiplier ${input.multiplier}`,
          }),
          engineFn: () => { throw new Error('Engine error'); },
        };
      
      const result = adapter.execute({ value: 10, multiplier: 2 });
      expect(result.ok).toBe(false);
    });
  });
});