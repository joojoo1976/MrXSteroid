/**
 * Safe environment reader that never throws in the browser.
 * Next.js statically inlines process.env.NEXT_PUBLIC_* at build time;
 * any other key (VITE_ prefix, PAYMOB_API_KEY, etc.) is read defensively so
 * the client bundle never touches a missing `process` global.
 */
export function readEnv(key: string): string | undefined {
    if (typeof process !== 'undefined' && process.env) {
        return (process.env as Record<string, string | undefined>)[key];
    }
    return undefined;
}
