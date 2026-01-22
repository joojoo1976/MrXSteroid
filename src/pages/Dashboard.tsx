import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Page } from '../types';
import { usePreferences } from '../context/PreferencesContext';

interface DashboardProps {
    navigateTo: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ navigateTo }) => {
    const { isRTL } = usePreferences();
    const { user, loading, signOut } = useAuth();

    // Protection Logic
    useEffect(() => {
        if (!loading && !user) {
            navigateTo(Page.LOGIN);
        }
    }, [user, loading, navigateTo]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gold-500">
                <div className="animate-spin text-4xl">⚙️</div>
            </div>
        );
    }

    if (!user) return null; // Will redirect via useEffect

    const handleLogout = async () => {
        await signOut();
        navigateTo(Page.HOME);
    };

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 container mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8 shadow-xl">
                <div className="flex justify-between items-center mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-gold-500">Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-zinc-50 dark:bg-black rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
                        <h2 className="text-xl font-semibold mb-4 text-zinc-700 dark:text-zinc-300">Profile Information</h2>
                        <div className="space-y-3">
                            <div>
                                <span className="text-sm text-zinc-500 block">Email</span>
                                <span className="text-lg font-medium">{user.email || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-sm text-zinc-500 block">Phone</span>
                                <span className="text-lg font-medium">{user.phone || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-sm text-zinc-500 block">User ID</span>
                                <span className="font-mono text-xs text-zinc-400 bg-zinc-200 dark:bg-zinc-800 p-1 rounded inline-block">
                                    {user.id}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-50 dark:bg-black rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
                        <h2 className="text-xl font-semibold mb-4 text-zinc-700 dark:text-zinc-300">Account Status</h2>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="font-medium">Active</span>
                        </div>
                        <p className="text-zinc-500 text-sm">
                            Welcome to the inner circle. Access your specialized tools and reports from the navigation menu.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
