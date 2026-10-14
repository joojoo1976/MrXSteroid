// tests/shared/schema.test.ts
/**
 * Schema Contract Integration Tests
 * Tests for lib/shared/schema-contract.ts
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  createToolSchema,
  SchemaFields,
  BilingualErrors,
  ToolSchema,
} from '@/lib/shared/schema-contract';

describe('Schema Contract Integration Tests', () => {
  describe('createToolSchema', () => {
    it('creates a valid tool schema with parse and tryParse', () => {
      const schema = z.object({
        name: z.string().min(1),
        age: z.number().int().min(0).max(150),
      });

      const toolSchema = createToolSchema(schema);
      expect(toolSchema).toHaveProperty('schema');
      expect(toolSchema).toHaveProperty('parse');
      expect(toolSchema).toHaveProperty('tryParse');
    });

    it('parse throws on invalid input', () => {
      const schema = z.object({ age: z.number().int().min(0).max(150) });
      const toolSchema = createToolSchema(schema);
      
      expect(() => toolSchema.parse({ age: -5 })).toThrow();
      expect(() => toolSchema.parse({ age: 'text' })).toThrow();
    });

    it('tryParse returns ok: true for valid input', () => {
      const schema = z.object({ name: z.string().min(1) });
      const toolSchema = createToolSchema(schema);
      
      const result = toolSchema.tryParse({ name: 'Test' });
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.name).toBe('Test');
    });

    it('tryParse returns ok: false for invalid input', () => {
      const schema = z.object({ age: z.number().int().min(0).max(150) });
      const toolSchema = createToolSchema(schema);
      
      const result = toolSchema.tryParse({ age: -5 });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBeInstanceOf(Error);
    });
  });

  describe('SchemaFields', () => {
    describe('positiveInt', () => {
      it('accepts valid positive integers within range', () => {
        const field = SchemaFields.positiveInt(1, 100, 'العمر', 'age');
        const schema = z.object({ age: field });
        
        expect(() => schema.parse({ age: 25 })).not.toThrow();
        expect(() => schema.parse({ age: 1 })).not.toThrow();
        expect(() => schema.parse({ age: 100 })).not.toThrow();
      });

      it('rejects values below minimum', () => {
        const field = SchemaFields.positiveInt(18, 100, 'العمر', 'age');
        const schema = z.object({ age: field });
        
        expect(() => schema.parse({ age: 17 })).toThrow();
        expect(() => schema.parse({ age: 0 })).toThrow();
        expect(() => schema.parse({ age: -5 })).toThrow();
      });

      it('rejects values above maximum', () => {
        const field = SchemaFields.positiveInt(18, 65, 'العمر', 'age');
        const schema = z.object({ age: field });
        
        expect(() => schema.parse({ age: 66 })).toThrow();
        expect(() => schema.parse({ age: 100 })).toThrow();
      });

      it('rejects non-integers', () => {
        const field = SchemaFields.positiveInt(1, 100, 'العمر', 'age');
        const schema = z.object({ age: field });
        
        expect(() => schema.parse({ age: 25.5 })).toThrow();
        expect(() => schema.parse({ age: '25' })).toThrow();
      });

      it('uses Arabic error messages for min/max', () => {
        const field = SchemaFields.positiveInt(18, 65, 'العمر', 'age');
        const schema = z.object({ age: field });
        
        try {
          schema.parse({ age: 17 });
        } catch (e) {
          expect((e as any).issues[0].message).toContain('على الأقل');
        }
      });
    });
  });