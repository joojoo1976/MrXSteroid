/**
 * Avatar Service - Centralized avatar URL resolution
 * 
 * Priority:
 * 1. OAuth provider avatar (Google, Facebook, GitHub)
 * 2. Gravatar based on email hash
 * 3. Default mystery person avatar
 */

import { md5 } from './cryptoUtils';

export interface AvatarOptions {
    /** User's email address */
    email?: string;
    /** OAuth provider name (google, facebook, github, etc.) */
    provider?: string;
    /** Avatar URL from OAuth provider or database */
    providerAvatarUrl?: string;
    /** Desired avatar size in pixels */
    size?: number;
}

/**
 * Resolves the best available avatar URL for a user.
 * 
 * @param options - Avatar resolution options
 * @returns The resolved avatar URL string
 * 
 * @example
 * // OAuth user (Google)
 * getAvatarUrl({ provider: 'google', providerAvatarUrl: 'https://lh3.googleusercontent.com/...' })
 * 
 * @example
 * // Regular email signup with Gravatar
 * getAvatarUrl({ email: 'user@example.com' })
 */
export function getAvatarUrl(options: AvatarOptions): string {
    const { email, provider, providerAvatarUrl, size = 400 } = options;

    // 1. OAuth provider avatar (Google, Facebook, GitHub, etc.)
    if (providerAvatarUrl && provider && ['google', 'facebook', 'github', 'twitter', 'apple'].includes(provider)) {
        return providerAvatarUrl;
    }

    // 2. If avatar URL exists from any source (stored in DB)
    if (providerAvatarUrl) {
        return providerAvatarUrl;
    }

    // 3. Gravatar based on email
    if (email) {
        const hash = md5(email.toLowerCase().trim());
        return `https://www.gravatar.com/avatar/${hash}?d=mp&s=${size}`;
    }

    // 4. Default mystery person fallback
    return `https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&s=${size}`;
}
