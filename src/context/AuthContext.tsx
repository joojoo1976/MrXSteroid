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
    const [user, setUser] = useState<User | MockUser | null>(null);
    const [session, setSession] = useState<Session | MockSession | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if Supabase is properly configured
        const isSupabaseConfigured = process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY;
        
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
            // Use mock auth service when Supabase is not configured
            const mockUser = mockAuthService.getCurrentUser();
            const mockSession = mockAuthService.getCurrentSession();
            
            setUser(mockUser);
            setSession(mockSession);
            setLoading(false);
            
            // Listen for mock auth changes
            const handleAuthChange = () => {
                const mockUser = mockAuthService.getCurrentUser();
                const mockSession = mockAuthService.getCurrentSession();
                
                setUser(mockUser);
                setSession(mockSession);
            };
            
            // In a real implementation, we would set up event listeners
            // For now, we'll just update the state when the component mounts
        }
    }, []);

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
