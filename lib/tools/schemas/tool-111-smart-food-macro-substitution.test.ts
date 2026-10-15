/**
 * Quick test to verify schema exports
 */
import { describe, it, expect } from 'vitest';
import { DEFAULT_TOOL_111_INPUT, Tool111InputSchema, tryParseTool111Input } from './tool-111-smart-food-macro-substitution';

describe('Schema exports', () => {
  it('DEFAULT_TOOL_111_INPUT is defined', () => {
    console.log('DEFAULT_TOOL_111_INPUT:', DEFAULT_TOOL_111_INPUT);
    expect(DEFAULT_TOOL_111_INPUT).toBeDefined();
    expect(typeof DEFAULT_TOOL_111_INPUT).toBe('object');
  });

  it('Tool111InputSchema is defined', () => {
    expect(Tool111InputSchema).toBeDefined();
  });

  it('tryParseTool111Input works', () => {
    const result = tryParseTool111Input(DEFAULT_TOOL_111_INPUT);
    console.log('Parse result:', result);
    expect(result.ok).toBe(true);
  });
});