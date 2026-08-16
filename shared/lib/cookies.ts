// Cookie management utility for persistent preferences across client and SSR/edge routes

export const setPreferenceCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') return;
    try {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        const expires = `; expires=${date.toUTCString()}`;
        document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax`;
    } catch (e) {
        console.warn('Failed to set cookie preference:', e);
    }
};

export const getPreferenceCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    try {
        const nameEQ = `${name}=`;
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
    } catch (e) {
        console.warn('Failed to read cookie preference:', e);
    }
    return null;
};
