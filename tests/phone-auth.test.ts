import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../shared/lib/auth-service';

describe('authService - Phone Number Dual Login Support', () => {
    it('detects standard and international phone numbers as phone identifiers', () => {
        expect(authService.getIdentifierType('01000722050')).toBe('phone');
        expect(authService.getIdentifierType('+201000722050')).toBe('phone');
        expect(authService.getIdentifierType('00201000722050')).toBe('phone');
        expect(authService.getIdentifierType('+966500000000')).toBe('phone');
        expect(authService.getIdentifierType('0500000000')).toBe('phone');
        expect(authService.getIdentifierType('+1234567890')).toBe('phone');
        expect(authService.getIdentifierType('+20 100 072 2050')).toBe('phone');
        expect(authService.getIdentifierType('(010) 0072-2050')).toBe('phone');
    });

    it('detects Eastern Arabic numerals as valid phone identifiers', () => {
        expect(authService.getIdentifierType('٠١٠٠٠٧٢٢٠٥٠')).toBe('phone');
        expect(authService.getIdentifierType('+٢٠١٠٠٠٧٢٢٠٥٠')).toBe('phone');
        expect(authService.normalizeArabicNumerals('٠١٠٠٠٧٢٢٠٥٠')).toBe('01000722050');
    });

    it('detects email vs phone correctly', () => {
        expect(authService.getIdentifierType('user@example.com')).toBe('email');
        expect(authService.getIdentifierType('test.user+tag@domain.co.uk')).toBe('email');
        expect(authService.getIdentifierType('')).toBe('invalid');
        expect(authService.getIdentifierType('abc')).toBe('invalid');
    });

    it('normalizes and validates phone numbers properly', () => {
        expect(authService.isValidPhone('01000722050')).toBe(true);
        expect(authService.isValidPhone('+201000722050')).toBe(true);
        expect(authService.isValidPhone('٠١٠٠٠٧٢٢٠٥٠')).toBe(true);
        expect(authService.isValidPhone('123')).toBe(false); // too short
    });
});
