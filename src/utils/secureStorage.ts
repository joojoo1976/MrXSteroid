import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'mrx_default_secret_key_change_in_prod';
const PREFIX = 'mrx_enc_';

/**
 * SecureStorage Utility
 * Implements client-side AES encryption for sensitive local storage items.
 * 
 * Algorithm:
 * 1. Prefix keys to identify secured items.
 * 2. Encrypt values using AES before saving.
 * 3. Decrypt values upon retrieval.
 * 4. Fail gracefully if decryption fails (tampering detected).
 */
export const SecureStorage = {
    /**
     * Encrypts and saves a value to localStorage
     * @param key The storage key
     * @param value The value to encrypt and store
     */
    setItem: (key: string, value: string): void => {
        try {
            const ciphertext = CryptoJS.AES.encrypt(value, ENCRYPTION_KEY).toString();
            localStorage.setItem(`${PREFIX}${key}`, ciphertext);
        } catch (error) {
            console.error('SecureStorage: Encryption Failed', error);
        }
    },

    /**
     * Retrieves and decrypts a value from localStorage
     * @param key The storage key
     * @returns The decrypted string or null if not found/failed
     */
    getItem: (key: string): string | null => {
        try {
            const ciphertext = localStorage.getItem(`${PREFIX}${key}`);
            if (!ciphertext) return null;

            const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
            const originalText = bytes.toString(CryptoJS.enc.Utf8);

            if (!originalText) {
                console.warn('SecureStorage: Decryption Result Empty (Possible Key Mismatch)');
                return null;
            }
            return originalText;
        } catch (error) {
            console.error('SecureStorage: Decryption Failed', error);
            return null;
        }
    },

    /**
     * Removes an item from storage
     */
    removeItem: (key: string): void => {
        localStorage.removeItem(`${PREFIX}${key}`);
    }
};
