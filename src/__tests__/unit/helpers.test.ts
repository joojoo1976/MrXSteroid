import { describe, it, expect, vi } from 'vitest';
import {
    formatCurrency,
    formatDate,
    convertWeight,
    convertLength,
    debounce,
    throttle,
    isValidEmail,
    isStrongPassword
} from '@/shared/lib/utils';

describe('Helper Functions Test Suite', () => {
    describe('formatCurrency', () => {
        it('should format currency correctly in USD', () => {
            const result = formatCurrency(1234.56, 'USD');
            expect(result).toBe('$1,234.56');
        });

        it('should format currency correctly in EUR', () => {
            const result = formatCurrency(1234.56, 'EUR');
            expect(result).toBe('€1,234.56');
        });

        it('should format currency correctly in SAR', () => {
            const result = formatCurrency(1234.56, 'SAR');
            expect(result).toBe('1,234.56 ﷼');
        });

        it('should handle zero values', () => {
            const result = formatCurrency(0, 'USD');
            expect(result).toBe('$0.00');
        });

        it('should handle negative values', () => {
            const result = formatCurrency(-1234.56, 'USD');
            expect(result).toBe('-$1,234.56');
        });

        it('should handle different locales', () => {
            const result = formatCurrency(1234.56, 'EUR', 'de-DE');
            // German locale might format differently
            expect(result).toMatch(/€/); // Should still contain the currency symbol
        });
    });

    describe('formatDate', () => {
        it('should format date in standard format', () => {
            const date = new Date('2023-01-15');
            const result = formatDate(date);
            expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/); // Matches MM/DD/YYYY or DD/MM/YYYY
        });

        it('should format date in ISO format', () => {
            const date = new Date('2023-01-15');
            const result = formatDate(date, 'iso');
            expect(result).toBe('2023-01-15');
        });

        it('should format date in long format', () => {
            const date = new Date('2023-01-15');
            const result = formatDate(date, 'long');
            expect(result).toMatch(/January \d{1,2}, 2023/);
        });

        it('should handle invalid date', () => {
            const invalidDate = new Date('invalid');
            const result = formatDate(invalidDate);
            expect(result).toBe('Invalid Date');
        });

        it('should format date with Arabic locale', () => {
            const date = new Date('2023-01-15');
            const result = formatDate(date, 'standard', true); // isRTL = true
            // For Arabic, the format might be different
            expect(result).toBeDefined();
        });
    });

    describe('convertWeight', () => {
        it('should convert kg to lbs correctly', () => {
            const result = convertWeight(1, 'kg', 'lbs');
            expect(result).toBeCloseTo(2.20462, 3);
        });

        it('should convert lbs to kg correctly', () => {
            const result = convertWeight(1, 'lbs', 'kg');
            expect(result).toBeCloseTo(0.453592, 3);
        });

        it('should handle same unit conversion', () => {
            const result = convertWeight(10, 'kg', 'kg');
            expect(result).toBe(10);
        });

        it('should handle zero value', () => {
            const result = convertWeight(0, 'kg', 'lbs');
            expect(result).toBe(0);
        });

        it('should handle negative values', () => {
            const result = convertWeight(-1, 'kg', 'lbs');
            expect(result).toBeCloseTo(-2.20462, 3);
        });

        it('should handle invalid units', () => {
            expect(() => convertWeight(1, 'invalid' as any, 'kg')).toThrow();
            expect(() => convertWeight(1, 'kg', 'invalid' as any)).toThrow();
        });
    });

    describe('convertLength', () => {
        it('should convert cm to inches correctly', () => {
            const result = convertLength(1, 'cm', 'inches');
            expect(result).toBeCloseTo(0.393701, 3);
        });

        it('should convert inches to cm correctly', () => {
            const result = convertLength(1, 'inches', 'cm');
            expect(result).toBeCloseTo(2.54, 3);
        });

        it('should handle same unit conversion', () => {
            const result = convertLength(10, 'cm', 'cm');
            expect(result).toBe(10);
        });

        it('should handle zero value', () => {
            const result = convertLength(0, 'cm', 'inches');
            expect(result).toBe(0);
        });
    });

    describe('debounce', () => {
        it('should debounce function calls', () => {
            vi.useFakeTimers();

            const fn = vi.fn();
            const debouncedFn = debounce(fn, 100);

            debouncedFn();
            debouncedFn(); // This should cancel the previous call
            debouncedFn(); // This should cancel the previous call

            expect(fn).toHaveBeenCalledTimes(0); // Should not have been called yet

            vi.advanceTimersByTime(100); // Advance time past debounce delay

            expect(fn).toHaveBeenCalledTimes(1); // Should have been called once

            vi.useRealTimers();
        });

        it('should call function after debounce period', () => {
            vi.useFakeTimers();

            const fn = vi.fn();
            const debouncedFn = debounce(fn, 50);

            debouncedFn();
            vi.advanceTimersByTime(30); // Before debounce period
            expect(fn).toHaveBeenCalledTimes(0);

            vi.advanceTimersByTime(20); // Complete debounce period
            expect(fn).toHaveBeenCalledTimes(1);

            vi.useRealTimers();
        });
    });

    describe('throttle', () => {
        it('should throttle function calls', () => {
            vi.useFakeTimers();

            const fn = vi.fn();
            const throttledFn = throttle(fn, 100);

            throttledFn();
            throttledFn(); // This should be ignored
            throttledFn(); // This should be ignored

            expect(fn).toHaveBeenCalledTimes(1); // Called immediately

            vi.advanceTimersByTime(50); // Before throttle period ends
            throttledFn(); // This should be ignored
            expect(fn).toHaveBeenCalledTimes(1);

            vi.advanceTimersByTime(50); // Complete throttle period
            throttledFn(); // This should be called
            expect(fn).toHaveBeenCalledTimes(2);

            vi.useRealTimers();
        });
    });

    describe('isValidEmail', () => {
        it('should return true for valid emails', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('user.name+tag@example.co.uk')).toBe(true);
            expect(isValidEmail('user_name@example.org')).toBe(true);
        });

        it('should return false for invalid emails', () => {
            expect(isValidEmail('invalid')).toBe(false);
            expect(isValidEmail('invalid@')).toBe(false);
            expect(isValidEmail('@invalid')).toBe(false);
            expect(isValidEmail('')).toBe(false);
            expect(isValidEmail(null as any)).toBe(false);
            expect(isValidEmail(undefined as any)).toBe(false);
        });
    });

    describe('isStrongPassword', () => {
        it('should return true for strong passwords', () => {
            expect(isStrongPassword('StrongPass123!')).toBe(true);
            expect(isStrongPassword('Another$trong22')).toBe(true);
        });

        it('should return false for weak passwords', () => {
            expect(isStrongPassword('weak')).toBe(false); // Too short
            expect(isStrongPassword('nouppercase123!')).toBe(false); // No uppercase
            expect(isStrongPassword('NOLOWERCASE123!')).toBe(false); // No lowercase
            expect(isStrongPassword('NoNumbers!')).toBe(false); // No numbers
            expect(isStrongPassword('NoSpecialChars123')).toBe(false); // No special chars
            expect(isStrongPassword('')).toBe(false);
            expect(isStrongPassword(null as any)).toBe(false);
            expect(isStrongPassword(undefined as any)).toBe(false);
        });

        it('should validate password length', () => {
            expect(isStrongPassword('Aa1!')).toBe(false); // Too short
            expect(isStrongPassword('Aa1!12345')).toBe(true); // Long enough
        });
    });
});