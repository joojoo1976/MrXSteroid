import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../shared/lib/supabase';
import { mockAuthService, MockUser, MockSession } from '../shared/lib/mock-auth-service';

export interface ProfileData {
    full_name?: string;
    user_name?: string;
    avatar_url?: string;
    subscription_status?: string;
    role?: string;
    email?: string;
    has_paid?: boolean;
    plan_tier?: string;
}

interface AuthContextType {
    user: User | MockUser | null;
    session: Session | MockSession | null;
    loading: boolean;
    signOut: () => Promise<void>;
    isAuthenticated: boolean;
    profileData: ProfileData | null;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signOut: async () => { },
    isAuthenticated: false,
    profileData: null,
    refreshUser: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Check configuration once
    const isSupabaseConfigured = Boolean(import.meta.env.NEXT_PUBLIC_SUPABASE_URL && import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const [user, setUser] = useState<User | MockUser | null>(() => {
        if (!isSupabaseConfigured) return mockAuthService.getCurrentUser();
        return null;
    });

    const [session, setSession] = useState<Session | MockSession | null>(() => {
        if (!isSupabaseConfigured) return mockAuthService.getCurrentSession();
        return null;
    });

    const [loading, setLoading] = useState(() => !isSupabaseConfigured); // If mock, not loading
    const [profileData, setProfileData] = useState<ProfileData | null>(null);

    // Fetch profile data from the profiles table
    const fetchProfileData = useCallback(async (userId: string) => {
        if (!isSupabaseConfigured) return;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('full_name, user_name, avatar_url, subscription_status, role, email, has_paid, plan_tier')
                .eq('id', userId)
                .single();

            if (error) {
                console.warn('Could not fetch profile data:', error.message);
                return;
            }

            if (data) {
                setProfileData(data as ProfileData);
            }
        } catch (err) {
            console.warn('Profile fetch error:', err);
        }
    }, [isSupabaseConfigured]);

    // Refresh user session and profile data
    const refreshUser = useCallback(async () => {
        if (!isSupabaseConfigured) return;
        try {
            const { data: { session: freshSession }, error } = await supabase.auth.getSession();
            if (error) {
                console.error('Error refreshing session:', error);
                return;
            }
            setSession(freshSession);
            setUser(freshSession?.user ?? null);
            if (freshSession?.user?.id) {
                await fetchProfileData(freshSession.user.id);
            }
        } catch (err) {
            console.error('Refresh user error:', err);
        }
    }, [isSupabaseConfigured, fetchProfileData]);

    useEffect(() => {
        if (isSupabaseConfigured) {
            // Use Supabase for authentication
            supabase.auth.getSession().then(({ data: { session }, error }) => {
                if (error) {
                    console.error('Error getting session:', error);
                }
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user?.id) {
                    fetchProfileData(session.user.id);
                }
                setLoading(false);
            }).catch((err) => {
                console.error('Session initialization error:', err);
                setLoading(false);
            });

            // Listen for changes (login, logout, token refresh)
            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user?.id) {
                    fetchProfileData(session.user.id);
                } else {
                    setProfileData(null);
                }
                setLoading(false);
            });

            return () => subscription.unsubscribe();
        } else {
            // Mock auth service - no listeners needed
            setLoading(false);
        }
    }, [isSupabaseConfigured, fetchProfileData]);

    const signOut = async () => {
        try {
            // Check if Supabase is configured
            const isSupabaseConfigured = import.meta.env.NEXT_PUBLIC_SUPABASE_URL && import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
            setProfileData(null);
        }
    };

    const value = {
        user,
        session,
        loading,
        signOut,
        isAuthenticated: user !== null && session !== null,
        profileData,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
