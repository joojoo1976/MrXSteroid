import { describe, it, expect } from 'vitest';
import { replaceBrandWithHtml, calculateBaseAmount } from '../../shared/lib/logic';

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
            expect(replaceBrandWithHtml(null)).toBeNull();
            expect(replaceBrandWithHtml(undefined)).toBeUndefined();
        });
    });

    describe('calculateBaseAmount', () => {
        it('should return 499 EGP for Digital Protocol in Egypt', () => {
            const result = calculateBaseAmount('Egypt', 'digital', 49.99);
            expect(result.amount).toBe(499);
            expect(result.currency).toBe('EGP');
            expect(result.isEg).toBe(true);
        });

        it('should return 499 EGP for Egypt (Arabic name)', () => {
            const result = calculateBaseAmount('مصر', 'digital', 49.99);
            expect(result.amount).toBe(499);
            expect(result.currency).toBe('EGP');
        });

        it('should return 749 EGP for Bundle in Egypt', () => {
            const result = calculateBaseAmount('Egypt', 'bundle', 72.00);
            expect(result.amount).toBe(749);
            expect(result.currency).toBe('EGP');
        });

        it('should return original USD price for Global (USA)', () => {
            const result = calculateBaseAmount('USA', 'digital', 49.99);
            expect(result.amount).toBe(49.99);
            expect(result.currency).toBe('USD');
            expect(result.isEg).toBe(false);
        });

        it('should handle undefined country as Global', () => {
            const result = calculateBaseAmount(undefined, 'digital', 49.99);
            expect(result.amount).toBe(49.99);
            expect(result.isEg).toBe(false);
        });
    });
});