import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { replaceBrandWithHtml } from '../../shared/lib/logic';

describe('Logic Functions Test Suite', () => {
    describe('replaceBrandWithHtml', () => {
        it('should replace brand names with HTML spans', () => {
            const input = 'This is Mr. X-Steroid and Mr. X';
            const result = replaceBrandWithHtml(input);
            
            expect(result).toContain('<span');
            expect(result).toContain('Mr. X-Steroid');
            expect(result).toContain('Mr. X');
        });

        it('should handle Arabic brand names', () => {
            const input = 'هذا مستر إكس-ستيرويد ومستر إكس';
            const result = replaceBrandWithHtml(input);
            
            expect(result).toContain('<span');
            expect(result).toContain('مستر إكس-ستيرويد');
            expect(result).toContain('مستر إكس');
        });

        it('should handle mixed Arabic and English', () => {
            const input = 'Mr. X-Steroid ومستر إكس';
            const result = replaceBrandWithHtml(input);
            
            expect(result).toContain('Mr. X-Steroid');
            expect(result).toContain('مستر إكس');
        });

        it('should return original text if no brand found', () => {
            const input = 'This text has no brand';
            const result = replaceBrandWithHtml(input);
            
            expect(result).toBe(input);
        });

        it('should handle empty string', () => {
            const input = '';
            const result = replaceBrandWithHtml(input);
            
            expect(result).toBe('');
        });

        it('should handle null/undefined', () => {
            // @ts-ignore - Testing invalid input
            expect(replaceBrandWithHtml(null)).toBeNull();
            // @ts-ignore - Testing invalid input
            expect(replaceBrandWithHtml(undefined)).toBeUndefined();
        });
    });
});