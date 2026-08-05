import { describe, it, expect, vi } from 'vitest';
import {
    sanitizeInput,
    validateEmail,
    validatePassword,
    validateTransactionId,
    encryptData,
    decryptData,
    generateSecureToken,
    hashPassword,
    verifyPassword
} from '@/shared/lib/security-utils';

// Mock crypto for testing
vi.mock('crypto', async () => {
    const actual = await vi.importActual('crypto');
    return {
        ...actual,
        randomBytes: vi.fn(() => Buffer.from('mocked-random-bytes')),
        createHash: vi.fn(() => ({
            update: vi.fn().mockReturnThis(),
            digest: vi.fn().mockReturnValue(Buffer.from('mocked-hash'))
        })),
        createCipheriv: vi.fn(() => ({
            update: vi.fn().mockReturnThis(),
            final: vi.fn().mockReturnValue(Buffer.from('encrypted-data')),
            setEncoding: vi.fn()
        })),
        createDecipheriv: vi.fn(() => ({
            update: vi.fn().mockReturnThis(),
            final: vi.fn().mockReturnValue(Buffer.from('decrypted-data'))
        }))
    };
});

describe('Security Utilities Test Suite', () => {
    describe('sanitizeInput', () => {
        it('should remove script tags', () => {
            const input = '<script>alert("xss")</script>Hello';
            const result = sanitizeInput(input);
            expect(result).toBe('Hello');
        });

        it('should remove onclick handlers', () => {
            const input = '<div onclick="alert()">Click me</div>';
            const result = sanitizeInput(input);
            expect(result).toBe('<div>Click me</div>');
        });

        it('should remove javascript protocol', () => {
            const input = '<a href="javascript:alert()">Link</a>';
            const result = sanitizeInput(input);
            expect(result).toBe('<a href="">Link</a>');
        });

        it('should handle nested malicious content', () => {
            const input = '<div><script>evil()</script>nested<div onclick="xss()">content</div></div>';
            const result = sanitizeInput(input);
            expect(result).toBe('<div>nested<div>content</div></div>');
        });

        it('should preserve safe HTML', () => {
            const input = '<p>This is <strong>safe</strong> content</p>';
            const result = sanitizeInput(input);
            expect(result).toBe('<p>This is <strong>safe</strong> content</p>');
        });

        it('should handle empty string', () => {
            const result = sanitizeInput('');
            expect(result).toBe('');
        });

        it('should handle null/undefined', () => {
            expect(sanitizeInput(null)).toBeNull();
            expect(sanitizeInput(undefined)).toBeUndefined();
        });
    });

    describe('validateEmail', () => {
        it('should return true for valid emails', () => {
            expect(validateEmail('test@example.com')).toBe(true);
            expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
            expect(validateEmail('user_name@example.org')).toBe(true);
            expect(validateEmail('user-name@example.io')).toBe(true);
        });

        it('should return false for invalid emails', () => {
            expect(validateEmail('invalid')).toBe(false);
            expect(validateEmail('invalid@')).toBe(false);
            expect(validateEmail('@invalid')).toBe(false);
            expect(validateEmail('')).toBe(false);
            expect(validateEmail('user@domain')).toBe(false);
            expect(validateEmail('user@.com')).toBe(false);
            expect(validateEmail('user@domain.')).toBe(false);
        });

        it('should handle special cases', () => {
            expect(validateEmail(null)).toBe(false);
            expect(validateEmail(undefined)).toBe(false);
            expect(validateEmail(123)).toBe(false);
        });
    });

    describe('validatePassword', () => {
        it('should return true for strong passwords', () => {
            expect(validatePassword('StrongPass123!')).toBe(true);
            expect(validatePassword('Another$trong22')).toBe(true);
            expect(validatePassword('Complex_Pass9!')).toBe(true);
        });

        it('should return false for weak passwords', () => {
            expect(validatePassword('weak')).toBe(false); // Too short
            expect(validatePassword('nouppercase123!')).toBe(false); // No uppercase
            expect(validatePassword('NOLOWERCASE123!')).toBe(false); // No lowercase
            expect(validatePassword('NoNumbers!')).toBe(false); // No numbers
            expect(validatePassword('NoSpecialChars123')).toBe(false); // No special chars
            expect(validatePassword('')).toBe(false);
        });

        it('should validate password length', () => {
            expect(validatePassword('Aa1!')).toBe(false); // Too short
            expect(validatePassword('Aa1!12345678')).toBe(true); // Long enough
        });

        it('should handle special cases', () => {
            expect(validatePassword(null)).toBe(false);
            expect(validatePassword(undefined)).toBe(false);
            expect(validatePassword(123)).toBe(false);
        });
    });

    describe('validateTransactionId', () => {
        it('should return true for valid transaction IDs', () => {
            expect(validateTransactionId('txn_1234567890')).toBe(true);
            expect(validateTransactionId('pay_AbcDef123')).toBe(true);
            expect(validateTransactionId('ch_123ABC456def')).toBe(true);
        });

        it('should return false for invalid transaction IDs', () => {
            expect(validateTransactionId('')).toBe(false);
            expect(validateTransactionId('123')).toBe(false); // Too short
            expect(validateTransactionId('txn_123!@#')).toBe(false); // Invalid characters
            expect(validateTransactionId('spaces not allowed')).toBe(false); // Contains spaces
            expect(validateTransactionId('special<char>')).toBe(false); // Special chars
        });

        it('should handle special cases', () => {
            expect(validateTransactionId(null)).toBe(false);
            expect(validateTransactionId(undefined)).toBe(false);
            expect(validateTransactionId(123)).toBe(false);
        });
    });

    describe('encryptData', () => {
        it('should encrypt data successfully', () => {
            const data = 'sensitive data';
            const key = 'encryption-key-32-characters-long!';

            const result = encryptData(data, key);

            expect(result).toBeDefined();
            expect(typeof result).toBe('string');
        });

        it('should return different encrypted values for same input', () => {
            const data = 'test data';
            const key = 'encryption-key-32-characters-long!';

            const encrypted1 = encryptData(data, key);
            const encrypted2 = encryptData(data, key);

            // With proper IV, encrypted values should be different
            expect(encrypted1).not.toBe(encrypted2);
        });

        it('should handle empty data', () => {
            const key = 'encryption-key-32-characters-long!';
            const result = encryptData('', key);

            expect(result).toBeDefined();
        });

        it('should handle special cases', () => {
            expect(() => encryptData('data', '')).toThrow();
            expect(() => encryptData('data', 'short')).toThrow();
        });
    });

    describe('decryptData', () => {
        it('should decrypt data successfully', () => {
            const data = 'sensitive data';
            const key = 'encryption-key-32-characters-long!';

            const encrypted = encryptData(data, key);
            const decrypted = decryptData(encrypted, key);

            expect(decrypted).toBe(data);
        });

        it('should handle decryption errors', () => {
            const invalidEncrypted = 'invalid-encrypted-data';
            const key = 'encryption-key-32-characters-long!';

            expect(() => decryptData(invalidEncrypted, key)).toThrow();
        });

        it('should fail with wrong key', () => {
            const data = 'test data';
            const key1 = 'encryption-key-32-characters-long!';
            const key2 = 'different-key-32-characters-long!';

            const encrypted = encryptData(data, key1);

            // Decryption with wrong key should fail
            expect(() => decryptData(encrypted, key2)).toThrow();
        });
    });

    describe('generateSecureToken', () => {
        it('should generate a token of specified length', () => {
            const token = generateSecureToken(32);
            expect(token).toHaveLength(32);
        });

        it('should generate different tokens on each call', () => {
            const token1 = generateSecureToken(32);
            const token2 = generateSecureToken(32);

            expect(token1).not.toBe(token2);
        });

        it('should handle default length', () => {
            const token = generateSecureToken(); // Uses default length
            expect(token).toBeDefined();
            expect(token.length).toBeGreaterThan(0);
        });

        it('should handle zero length', () => {
            const token = generateSecureToken(0);
            expect(token).toBe('');
        });
    });

    describe('hashPassword', () => {
        it('should hash password successfully', async () => {
            const password = 'TestPassword123!';

            const hashed = await hashPassword(password);

            expect(hashed).toBeDefined();
            expect(typeof hashed).toBe('string');
            expect(hashed).not.toBe(password); // Should be different from original
        });

        it('should create different hashes for same password', async () => {
            const password = 'TestPassword123!';

            const hash1 = await hashPassword(password);
            const hash2 = await hashPassword(password);

            expect(hash1).not.toBe(hash2); // Salts should make them different
        });

        it('should handle empty password', async () => {
            const hashed = await hashPassword('');

            expect(hashed).toBeDefined();
        });

        it('should handle special cases', async () => {
            await expect(hashPassword(null)).rejects.toThrow();
            await expect(hashPassword(undefined)).rejects.toThrow();
        });
    });

    describe('verifyPassword', () => {
        it('should verify correct password', async () => {
            const password = 'TestPassword123!';
            const hashed = await hashPassword(password);

            const isValid = await verifyPassword(password, hashed);

            expect(isValid).toBe(true);
        });

        it('should reject incorrect password', async () => {
            const password = 'TestPassword123!';
            const wrongPassword = 'WrongPassword456@';
            const hashed = await hashPassword(password);

            const isValid = await verifyPassword(wrongPassword, hashed);

            expect(isValid).toBe(false);
        });

        it('should handle special cases', async () => {
            expect(await verifyPassword('password', null)).toBe(false);
            expect(await verifyPassword(null, 'hash')).toBe(false);
            expect(await verifyPassword(undefined, 'hash')).toBe(false);
        });
    });
});