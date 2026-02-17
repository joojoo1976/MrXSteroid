import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../shared/lib/supabase';
import { mockAuthService, MockUser, MockSession } from '../shared/lib/mock-auth-service';

interface AuthContextType {
    user: User | MockUser | null;
    session: Session | MockSession | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Check configuration once
    const isSupabaseConfigured = Boolean(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY);

    const [user, setUser] = useState<User | MockUser | null>(() => {
        if (!isSupabaseConfigured) return mockAuthService.getCurrentUser();
        return null;
    });

    const [session, setSession] = useState<Session | MockSession | null>(() => {
        if (!isSupabaseConfigured) return mockAuthService.getCurrentSession();
        return null;
    });

    const [loading, setLoading] = useState(() => isSupabaseConfigured); // If mock, not loading

    useEffect(() => {
        if (isSupabaseConfigured) {
            // Use Supabase for authentication
            supabase.auth.getSession().then(({ data: { session } }) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            });

            // Listen for changes (login, logout, token refresh)
            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            });

            return () => subscription.unsubscribe();
        } else {
            // Mock auth service listeners if any (currently none required as per original code)
            // Initial state is already set via lazy init.
        }
    }, [isSupabaseConfigured]);

    const signOut = async () => {
        // Check if Supabase is configured
        const isSupabaseConfigured = process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY;

        if (isSupabaseConfigured) {
            await supabase.auth.signOut();
        } else {
            // Use mock auth service
            await mockAuthService.signOut();
        }

        setUser(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
