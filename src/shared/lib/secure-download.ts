import { supabase } from './supabase';

/**
 * Securely downloads a paid e-book through the serverless endpoint.
 * The endpoint verifies the Supabase session + has_paid entitlement
 * server-side before streaming the protected PDF from private/books.
 */
export const downloadSecureBook = async (
    file: 'en' | 'ar'
): Promise<{ ok: boolean; error?: 'auth' | 'subscription' | 'server' | 'network' }> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
        return { ok: false, error: 'auth' };
    }

    try {
        const res = await fetch(`/api/download?file=${file}`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!res.ok) {
            if (res.status === 401) return { ok: false, error: 'auth' };
            if (res.status === 403) return { ok: false, error: 'subscription' };
            return { ok: false, error: 'server' };
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file === 'ar' ? 'MrXSteroid_Book_AR.pdf' : 'MrXSteroid_Book_EN.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return { ok: true };
    } catch (err) {
        console.error('[secure-download] Failed:', err);
        return { ok: false, error: 'network' };
    }
};
