'use client';

import { motion } from 'framer-motion';
import { ComponentType } from 'react';
import {
    Home, Calculator, ShoppingCart, User, Shield,
    Mail, Briefcase, BookOpen, HelpCircle,
    ArrowRight, ChevronRight, Home as HomeIcon, Map, Trophy as Trophy_Icon,
} from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { Language } from '@/shared/types/types';

const AllLinksPage = () => {
    const { language: lang, isRTL } = usePreferences();

    interface LinkItem {
        label: string;
        labelAr: string;
        href: string;
        icon: ComponentType<{ className?: string }>;
    }

    interface LinkSection {
        title: string;
        titleAr: string;
        icon: ComponentType<{ className?: string }>;
        links: LinkItem[];
    }

    const sections: LinkSection[] = [
        {
            title: 'Smart Tools',
            titleAr: 'الأدوات الذكية',
            icon: Calculator,
            links: [
                { label: 'Advanced Macro Calculator', labelAr: 'حاسبة الماكروز المتطورة', href: '/macro', icon: Calculator },
                { label: 'Body Fat Calculator', labelAr: 'حاسبة نسبة الدهون الجسمية', href: '/bodyfat', icon: Calculator },
                { label: 'Interactive Injection Map', labelAr: 'خريطة الحقن التفاعلية', href: '/injection', icon: Calculator },
                { label: 'Half-Life Simulator', labelAr: 'محاكي نصف العمر', href: '/halflife', icon: Calculator },
                { label: 'Smart Lab Reference', labelAr: 'المرجع الذكي للتحاليل', href: '/lab', icon: Calculator },
                { label: 'Genetic Potential Calculator', labelAr: 'حاسبة الإمكانات الوراثية', href: '/genetic', icon: Calculator },
                { label: 'Cycle Schedule Sync', labelAr: 'مزامنة جدول الكورس', href: '/cycle', icon: Calculator },
            ],
        },
        {
            title: 'Premium Resources',
            titleAr: 'الموارد الحصرية',
            icon: Trophy_Icon,
            links: [
                { label: 'Transformation Timeline', labelAr: 'الجدول الزمني للتحول', href: '/timeline', icon: Trophy_Icon },
                { label: 'Cycle Architect', labelAr: 'مهندس الدورة', href: '/cycle', icon: Trophy_Icon },
                { label: 'Master Calculator', labelAr: 'الحاسبة الرئيسية', href: '/master-calculator', icon: Trophy_Icon },
            ],
        },
        {
            title: 'Main Pages',
            titleAr: 'الصفحات الرئيسية',
            icon: Home,
            links: [
                { label: 'Home', labelAr: 'الرئيسية', href: '/', icon: Home },
                { label: 'About Us', labelAr: 'من نحن', href: '/about', icon: Home },
                { label: 'Sitemap', labelAr: 'خريطة الموقع', href: '/sitemap', icon: Map },
                { label: 'Smart Landing', labelAr: 'الصفحة الذكية', href: '/smart-landing', icon: Home },
                { label: 'Shop / Checkout', labelAr: 'المتجر', href: '/checkout', icon: ShoppingCart },
            ],
        },
        {
            title: 'Account & Auth',
            titleAr: 'الحساب',
            icon: User,
            links: [
                { label: 'Login', labelAr: 'تسجيل الدخول', href: '/login', icon: User },
                { label: 'Sign Up', labelAr: 'إنشاء حساب', href: '/signup', icon: User },
                { label: 'Reset Password', labelAr: 'إعادة تعيين كلمة المرور', href: '/reset-password', icon: User },
                { label: 'Dashboard', labelAr: 'لوحة التحكم', href: '/dashboard', icon: User },
                { label: 'Profile', labelAr: 'الملف الشخصي', href: '/profile', icon: User },
            ],
        },
        {
            title: 'Support & Info',
            titleAr: 'الدعم والمعلومات',
            icon: HelpCircle,
            links: [
                { label: 'Contact', labelAr: 'تواصل معنا', href: '/contact', icon: Mail },
                { label: 'Support', labelAr: 'الدعم الفني', href: '/support', icon: HelpCircle },
                { label: 'FAQ', labelAr: 'الأسئلة الشائعة', href: '/faq', icon: HelpCircle },
                { label: 'Blog', labelAr: 'المدونة', href: '/blog', icon: BookOpen },
                { label: 'Careers', labelAr: 'الوظائف', href: '/careers', icon: Briefcase },
            ],
        },
        {
            title: 'Legal & Policies',
            titleAr: 'القانونية والسياسات',
            icon: Shield,
            links: [
                { label: 'Medical Disclaimer', labelAr: 'إخلاء المسؤولية الطبية', href: '/disclaimer', icon: Shield },
                { label: 'Medical Disclaimer Page', labelAr: 'صفحة إخلاء المسؤولية الطبية', href: '/medical-disclaimer', icon: Shield },
                { label: 'Privacy Policy', labelAr: 'سياسة الخصوصية', href: '/privacy', icon: Shield },
                { label: 'Terms of Service', labelAr: 'شروط الخدمة', href: '/terms', icon: Shield },
                { label: 'Refund Policy', labelAr: 'سياسة الاسترداد', href: '/refund', icon: Shield },
                { label: 'Shipping Policy', labelAr: 'سياسة الشحن', href: '/shipping', icon: Shield },
                { label: 'Return Policy', labelAr: 'سياسة الإرجاع', href: '/returns', icon: Shield },
                { label: 'Cookie Policy', labelAr: 'سياسة ملفات تعريف الارتباط', href: '/cookies', icon: Shield },
                { label: 'Accessibility', labelAr: 'الوصول', href: '/accessibility', icon: Shield },
                { label: 'GDPR', labelAr: 'اللائحة العامة لحماية البيانات', href: '/gdpr', icon: Shield },
                { label: 'CCPA', labelAr: 'قانون خصوصية المستهلك', href: '/ccpa', icon: Shield },
            ],
        },
    ];

    const title = lang === Language.AR ? 'جميع روابط المشروع' : 'All Project Links';
    const subtitle = lang === Language.AR
        ? 'دليل شامل لجميع صفحات وأدوات المشروع'
        : 'A comprehensive guide to all pages and tools of the project';
    const homeLabel = lang === Language.AR ? 'الرئيسية' : 'Home';
    const aiBadge = lang === Language.AR ? 'دليل كامل' : 'Complete Directory';

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-6xl mx-auto">
                    {/* Breadcrumbs */}
                    <nav className="mb-6 flex items-center gap-2 text-xs text-zinc-500">
                        <a href="/" className="flex items-center gap-1.5 hover:text-gold-500 transition-colors">
                            <HomeIcon className="w-3.5 h-3.5" />
                            <span>{homeLabel}</span>
                        </a>
                        <ChevronRight className={`w-3 h-3 ${isRTL ? 'rotate-180' : ''}`} />
                        <span className="text-gold-500 font-bold">{title}</span>
                    </nav>

                    {/* Header */}
                    <div className="text-center mb-10 md:mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-600 dark:text-gold-400 text-xs font-black uppercase tracking-widest mb-4">
                                <Map className="w-3.5 h-3.5" />
                                {aiBadge}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white mb-3">
                                {title}
                            </h1>
                            <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
                                {subtitle}
                            </p>
                        </motion.div>
                    </div>

                    {/* Sections Grid */}
                    <div className="space-y-12">
                        {sections.map((section, idx) => {
                            const SectionIcon = section.icon;
                            return (
                                <motion.div
                                    key={section.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-600 dark:text-gold-400">
                                            <SectionIcon className="w-5 h-5" />
                                        </div>
                                        <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                                            {lang === Language.AR ? section.titleAr : section.title}
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {section.links.map((link) => {
                                            const LinkIcon = link.icon;
                                            return (
                                                <a
                                                    key={link.href}
                                                    href={link.href}
                                                    className="group flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 hover:border-gold-500/50 hover:shadow-lg transition-all duration-300"
                                                >
                                                    <div className="w-9 h-9 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-600 dark:text-gold-400 group-hover:scale-110 transition-transform shrink-0">
                                                        <LinkIcon className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-sm font-bold text-zinc-900 dark:text-white flex-1">
                                                        {lang === Language.AR ? link.labelAr : link.label}
                                                    </span>
                                                    <ArrowRight className={`w-4 h-4 text-zinc-400 group-hover:text-gold-500 group-hover:translate-x-1 transition-all ${isRTL ? 'rotate-180' : ''}`} />
                                                </a>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Bottom CTA */}
                    <div className="mt-12 text-center">
                        <p className="text-zinc-500 dark:text-zinc-500 text-sm">
                            {lang === Language.AR
                                ? 'جميع الروابط متوافقة بالكامل مع العربية والإنجليزية'
                                : 'All links fully compatible in Arabic & English'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllLinksPage;
