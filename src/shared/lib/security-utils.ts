/**
 * Security Utilities for Mr. X Steroid
 * Provides input sanitization, validation, encryption, and hashing functions
 */

import CryptoJS from 'crypto-js';

/**
 * Sanitize input string to prevent XSS attacks
 */
export function sanitizeInput(input: any): any {
    if (input === null || input === undefined) return input;
    if (typeof input !== 'string') return input;

    // Remove script tags and their content
    let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    // Remove event handlers (including surrounding whitespace to avoid trailing space in tag)
    sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
    // Remove javascript: protocol and everything after it up to the closing quote
    sanitized = sanitized.replace(/javascript\s*:[^"']*/gi, '');

    return sanitized;
}

/**
 * Validate email format
 */
export function validateEmail(email: any): boolean {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: any): boolean {
    if (!password || typeof password !== 'string') return false;
    const minLength = /.{8,}/;
    const hasUpper = /[A-Z]/;
    const hasLower = /[a-z]/;
    const hasNumber = /[0-9]/;
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/;

    return (
        minLength.test(password) &&
        hasUpper.test(password) &&
        hasLower.test(password) &&
        hasNumber.test(password) &&
        hasSpecial.test(password)
    );
}

/**
 * Validate transaction ID format
 */
export function validateTransactionId(id: any): boolean {
    if (!id || typeof id !== 'string') return false;
    // Allow alphanumeric with underscores and hyphens, must start with a letter prefix
    const txnRegex = /^[a-zA-Z][a-zA-Z0-9_-]+$/;
    return txnRegex.test(id);
}

/**
 * Encrypt data using AES
 */
export function encryptData(data: string, key: string): string {
    if (!key || key.length < 16) {
        throw new Error('Encryption key must be at least 16 characters long');
    }
    return CryptoJS.AES.encrypt(data, key).toString();
}

/**
 * Decrypt data using AES
 */
export function decryptData(encryptedData: string, key: string): string {
    if (!key || key.length < 16) {
        throw new Error('Decryption key must be at least 16 characters long');
    }
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, key);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (!decrypted) {
            throw new Error('Decryption failed - wrong key or corrupted data');
        }
        return decrypted;
    } catch {
        throw new Error('Decryption failed - wrong key or corrupted data');
    }
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
    if (length <= 0) return '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomWords = CryptoJS.lib.WordArray.random(length);
    const bytes = randomWords.toString(CryptoJS.enc.Hex);
    let result = '';
    for (let i = 0; i < length; i++) {
        const index = parseInt(bytes.substring(i * 2, i * 2 + 2), 16) % chars.length;
        result += chars[index];
    }
    return result;
}

/**
 * Hash a password using SHA256
 */
export async function hashPassword(password: any): Promise<string> {
    if (password === null || password === undefined || typeof password !== 'string') {
        throw new Error('Password must be a non-empty string');
    }
    // Generate a salt
    const salt = CryptoJS.lib.WordArray.random(16).toString();
    const hash = CryptoJS.SHA256(salt + password).toString();
    return `${salt}:${hash}`;
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: any, hashedPassword: any): Promise<boolean> {
    if (!password || typeof password !== 'string') return false;
    if (!hashedPassword || typeof hashedPassword !== 'string') return false;

    const parts = hashedPassword.split(':');
    if (parts.length !== 2) return false;

    const [salt, originalHash] = parts;
    const hash = CryptoJS.SHA256(salt + password).toString();
    return hash === originalHash;
}
