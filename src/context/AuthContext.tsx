import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../shared/lib/supabase';
import { mockAuthService, MockUser, MockSession } from '../shared/lib/mock-auth-service';

interface AuthContextType {
    user: User | MockUser | null;
    session: Session | MockSession | null;
    loading: boolean;
    signOut: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signOut: async () => { },
    isAuthenticated: false,
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

    const [loading, setLoading] = useState(() => !isSupabaseConfigured); // If mock, not loading

    useEffect(() => {
        if (isSupabaseConfigured) {
            // Use Supabase for authentication
            supabase.auth.getSession().then(({ data: { session }, error }) => {
                if (error) {
                    console.error('Error getting session:', error);
                }
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }).catch((err) => {
                console.error('Session initialization error:', err);
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
            // Mock auth service - no listeners needed
            setLoading(false);
        }
    }, [isSupabaseConfigured]);

    const signOut = async () => {
        try {
            // Check if Supabase is configured
            const isSupabaseConfigured = process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY;

            if (isSupabaseConfigured) {
                await supabase.auth.signOut();
            } else {
                // Use mock auth service
                await mockAuthService.signOut();
            }
        } catch (error) {
            console.error('Sign out error:', error);
        } finally {
            setUser(null);
            setSession(null);
        }
    };

    const value = {
        user,
        session,
        loading,
        signOut,
        isAuthenticated: user !== null && session !== null
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
