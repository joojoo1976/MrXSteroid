import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Page } from '../types';
import { usePreferences } from '../context/PreferencesContext';
import {
    ChevronDown,
    BookOpen,
    Calculator,
    FileText,
    Download,
    Lock,
    Unlock,
    Crown
} from 'lucide-react';

interface DashboardProps {
    navigateTo: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ navigateTo }) => {
    const { isRTL, content } = usePreferences();
    const { user, loading, signOut, profileData } = useAuth();

    // Check if user has paid
    const hasPaid = profileData?.has_paid || false;

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

    // Free content items - available to all logged-in users
    const freeContentItems = [
        { 
            icon: Calculator, 
            label: isRTL ? 'حاسبة السعرات' : 'Macro Calculator',
            page: Page.MACRO 
        },
        { 
            icon: Calculator, 
            label: isRTL ? 'حاسبة الدهون' : 'Body Fat Calculator',
            page: Page.BODYFAT 
        },
        { 
            icon: FileText, 
            label: isRTL ? 'خريطة الحقن' : 'Injection Map',
            page: Page.INJECTION 
        },
        { 
            icon: Calculator, 
            label: isRTL ? 'العمر النصفي' : 'Half Life Visualizer',
            page: Page.HALFLIFE 
        },
    ];

    // Paid content items - only available after payment
    const paidContentItems = [
        { 
            icon: BookOpen, 
            label: isRTL ? 'الكتاب الإلكتروني' : 'E-Book',
            downloadUrl: '/Example_MrXSteroid_Book.pdf',
            arabicUrl: '/Example_MrXSteroid_Book_Ar.pdf'
        },
        { 
            icon: FileText, 
            label: isRTL ? 'جداول متقدمة' : 'Advanced Tables',
            page: Page.MASTER_CALCULATOR 
        },
        { 
            icon: Crown, 
            label: isRTL ? 'محتوى حصري' : 'Premium Content',
            page: Page.GENETIC 
        },
    ];

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 container mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8 shadow-xl">
                <div className="flex justify-between items-center mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-gold-500">
                        {isRTL ? 'لوحة التحكم' : 'Dashboard'}
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        {isRTL ? 'تسجيل الخروج' : 'Logout'}
                    </button>
                </div>

                {/* Payment Status Banner */}
                <div className={`mb-8 p-4 rounded-lg border ${hasPaid
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                    }`}>
                    <div className="flex items-center gap-3">
                        {hasPaid ? (
                            <>
                                <Unlock className="w-6 h-6 text-green-600 dark:text-green-400" />
                                <div>
                                    <h3 className="font-semibold text-green-800 dark:text-green-300">
                                        {isRTL ? 'تم تفعيل الاشتراك' : 'Subscription Active'}
                                    </h3>
                                    <p className="text-sm text-green-600 dark:text-green-400">
                                        {isRTL ? 'لديك وصول كامل لجميع المحتويات' : 'You have full access to all content'}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <Lock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                <div>
                                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">
                                        {isRTL ? 'حساب مجاني' : 'Free Account'}
                                    </h3>
                                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                        {isRTL ? 'قم بالترقية للوصول إلى المحتوى الحصري' : 'Upgrade to access premium content'}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-zinc-50 dark:bg-black rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
                        <h2 className="text-xl font-semibold mb-4 text-zinc-700 dark:text-zinc-300">
                            {isRTL ? 'معلومات الحساب' : 'Profile Information'}
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <span className="text-sm text-zinc-500 block">
                                    {isRTL ? 'البريد الإلكتروني' : 'Email'}
                                </span>
                                <span className="text-lg font-medium">{user.email || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-sm text-zinc-500 block">
                                    {isRTL ? 'الاسم' : 'Name'}
                                </span>
                                <span className="text-lg font-medium">{profileData?.full_name || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-sm text-zinc-500 block">
                                    {isRTL ? 'حالة الاشتراك' : 'Subscription Status'}
                                </span>
                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${hasPaid
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    }`}>
                                    {hasPaid
                                        ? (isRTL ? 'مفعّل' : 'Premium')
                                        : (isRTL ? 'مجاني' : 'Free')
                                    }
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-50 dark:bg-black rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
                        <h2 className="text-xl font-semibold mb-4 text-zinc-700 dark:text-zinc-300">
                            {isRTL ? 'إحصائيات' : 'Quick Stats'}
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-500">{isRTL ? 'الأدوات المتاحة' : 'Available Tools'}</span>
                                <span className="font-bold text-gold-500">{freeContentItems.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-500">{isRTL ? 'المحتوى الحصري' : 'Premium Content'}</span>
                                <span className={`font-bold ${hasPaid ? 'text-gold-500' : 'text-zinc-400'}`}>
                                    {hasPaid ? paidContentItems.length : '🔒'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Free Content Dropdown */}
                <div className="mb-6">
                    <details className="group bg-zinc-50 dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                            <div className="flex items-center gap-3">
                                <Unlock className="w-5 h-5 text-green-500" />
                                <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                                    {isRTL ? 'المحتوى المجاني' : 'Free Content'}
                                </h3>
                            </div>
                            <ChevronDown className="w-5 h-5 text-zinc-400 group-open:rotate-180 transition-transform" />
                        </summary>
                        <div className="p-4 pt-0 border-t border-zinc-200 dark:border-zinc-800 mt-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {freeContentItems.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => navigateTo(item.page)}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-gold-500 dark:hover:border-gold-500 transition-colors text-left"
                                    >
                                        <item.icon className="w-5 h-5 text-gold-500" />
                                        <span className="text-zinc-700 dark:text-zinc-300">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </details>
                </div>

                {/* Paid Content Dropdown */}
                <div className="mb-6">
                    <details className={`group rounded-lg border ${hasPaid
                        ? 'bg-gold-50 dark:bg-gold-900/10 border-gold-200 dark:border-gold-800'
                        : 'bg-zinc-100 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700'
                        }`}>
                        <summary className={`flex items-center justify-between p-4 cursor-pointer list-none ${!hasPaid && 'pointer-events-none'}`}>
                            <div className="flex items-center gap-3">
                                {hasPaid ? (
                                    <Crown className="w-5 h-5 text-gold-500" />
                                ) : (
                                    <Lock className="w-5 h-5 text-zinc-400" />
                                )}
                                <h3 className={`text-lg font-semibold ${hasPaid
                                    ? 'text-gold-700 dark:text-gold-300'
                                    : 'text-zinc-500 dark:text-zinc-400'
                                    }`}>
                                    {isRTL ? 'المحتوى الحصري' : 'Premium Content'}
                                </h3>
                            </div>
                            {hasPaid && (
                                <ChevronDown className="w-5 h-5 text-gold-400 group-open:rotate-180 transition-transform" />
                            )}
                        </summary>
                        {hasPaid ? (
                            <div className="p-4 pt-0 border-t border-gold-200 dark:border-gold-800 mt-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {paidContentItems.map((item, index) => (
                                        item.downloadUrl ? (
                                            <a
                                                key={index}
                                                href={isRTL ? item.arabicUrl : item.downloadUrl}
                                                download
                                                className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-zinc-900 border border-gold-200 dark:border-gold-700 hover:border-gold-500 transition-colors"
                                            >
                                                <Download className="w-5 h-5 text-gold-500" />
                                                <span className="text-zinc-700 dark:text-zinc-300">{item.label}</span>
                                            </a>
                                        ) : (
                                            <button
                                                key={index}
                                                onClick={() => item.page && navigateTo(item.page)}
                                                className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-zinc-900 border border-gold-200 dark:border-gold-700 hover:border-gold-500 transition-colors text-left"
                                            >
                                                <item.icon className="w-5 h-5 text-gold-500" />
                                                <span className="text-zinc-700 dark:text-zinc-300">{item.label}</span>
                                            </button>
                                        )
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </details>

                    {!hasPaid && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-gold-500/10 to-gold-600/10 rounded-lg border border-gold-200 dark:border-gold-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-gold-700 dark:text-gold-300">
                                        {isRTL ? 'ترقية إلى Premium' : 'Upgrade to Premium'}
                                    </h4>
                                    <p className="text-sm text-gold-600 dark:text-gold-400">
                                        {isRTL ? 'احصل على وصول كامل لجميع المحتويات الحصرية' : 'Get full access to all exclusive content'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigateTo(Page.CHECKOUT)}
                                    className="bg-gold-500 hover:bg-gold-600 text-white font-bold py-2 px-4 rounded transition-colors"
                                >
                                    {isRTL ? 'اشترِ الآن' : 'Buy Now'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
