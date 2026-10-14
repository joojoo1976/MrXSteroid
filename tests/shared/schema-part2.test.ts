// tests/shared/schema-part2.test.ts
/**
 * Schema Contract Integration Tests - Part 2
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { SchemaFields, BilingualErrors } from '@/lib/shared/schema-contract';

describe('Schema Contract Integration Tests - Part 2', () => {
  describe('SchemaFields', () => {
    describe('finiteNumber', () => {
      it('accepts valid finite numbers', () => {
        const field = SchemaFields.finiteNumber(0, 1000, 'الجرعة', 'dose');
        const schema = z.object({ dose: field });
        
        expect(() => schema.parse({ dose: 300 })).not.toThrow();
        expect(() => schema.parse({ dose: 0 })).not.toThrow();
        expect(() => schema.parse({ dose: 1000 })).not.toThrow();
      });

      it('rejects NaN and Infinity', () => {
        const field = SchemaFields.finiteNumber(0, 1000, 'الجرعة', 'dose');
        const schema = z.object({ dose: field });
        
        expect(() => schema.parse({ dose: NaN })).toThrow();
        expect(() => schema.parse({ dose: Infinity })).toThrow();
        expect(() => schema.parse({ dose: -Infinity })).toThrow();
      });

      it('uses Arabic error messages', () => {
        const field = SchemaFields.finiteNumber(0, 1000, 'الجرعة', 'dose');
        const schema = z.object({ dose: field });
        
        try {
          schema.parse({ dose: NaN });
        } catch (e) {
          expect((e as any).issues[0].message).toContain('رقم');
        }
      });
    });

    describe('percentage', () => {
      it('accepts valid percentages', () => {
        const field = SchemaFields.percentage('نسبة الدهون', 'bodyFat');
        const schema = z.object({ fat: field });
        
        expect(() => schema.parse({ fat: 0 })).not.toThrow();
        expect(() => schema.parse({ fat: 50 })).not.toThrow();
        expect(() => schema.parse({ fat: 100 })).not.toThrow();
      });

      it('rejects values below 0', () => {
        const field = SchemaFields.percentage('نسبة الدهون', 'bodyFat');
        const schema = z.object({ fat: field });
        
        expect(() => schema.parse({ fat: -1 })).toThrow();
      });

      it('rejects values above 100', () => {
        const field = SchemaFields.percentage('نسبة الدهون', 'bodyFat');
        const schema = z.object({ fat: field });
        
        expect(() => schema.parse({ fat: 101 })).toThrow();
      });
    });

    describe('enum', () => {
      it('accepts valid enum values', () => {
        const field = SchemaFields.enum(['testosterone', 'nandrolone'], 'المركب', 'compound');
        const schema = z.object({ compound: field });
        
        expect(() => schema.parse({ compound: 'testosterone' })).not.toThrow();
        expect(() => schema.parse({ compound: 'nandrolone' })).not.toThrow();
      });

      it('rejects invalid enum values with Arabic error', () => {
        const field = SchemaFields.enum(['testosterone', 'nandrolone'], 'المركب', 'compound');
        const schema = z.object({ compound: field });
        
        try {
          schema.parse({ compound: 'invalid' });
        } catch (e) {
          expect((e as any).issues[0].message).toContain('القيم المسموحة');
        }
      });
    });

    describe('strictObject', () => {
      it('rejects extra properties', () => {
        const schema = SchemaFields.strictObject({
          name: z.string(),
          age: z.number(),
        });
        
        expect(() => schema.parse({ name: 'Test', age: 25, extra: 'not allowed' })).toThrow();
      });

      it('accepts valid properties', () => {
        const schema = SchemaFields.strictObject({
          name: z.string(),
          age: z.number(),
        });
        
        expect(() => schema.parse({ name: 'Test', age: 25 })).not.toThrow();
      });
    });
  });

  describe('BilingualErrors', () => {
    it('required returns Arabic and English', () => {
      const errors = BilingualErrors.required('الاسم', 'name');
      expect(errors.ar).toBe('الاسم مطلوب');
      expect(errors.en).toBe('name is required');
    });

    it('invalidType returns Arabic and English', () => {
      const errors = BilingualErrors.invalidType('العمر', 'age', 'رقم', 'number');
      expect(errors.ar).toBe('العمر يجب أن يكون رقم');
      expect(errors.en).toBe('age must be number');
    });

    it('outOfRange returns Arabic and English', () => {
      const errors = BilingualErrors.outOfRange('الجرعة', 'dose', 0, 1000);
      expect(errors.ar).toBe('الجرعة يجب أن يكون بين 0 و 1000');
      expect(errors.en).toBe('dose must be between 0 and 1000');
    });
  });
});