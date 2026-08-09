'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Map, Zap, ShieldAlert, Home, User } from 'lucide-react';
import { Page, ContentStrings } from '@/shared/types/types';
import { usePreferences } from '../context/PreferencesContext';
import DynamicBrandLogo from '../shared/ui/DynamicBrandLogo';

interface SitemapPageProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

const SitemapPage: React.FC<SitemapPageProps> = ({ content, navigateTo }) => {
    const { isRTL } = usePreferences();
    const sections = [
        {
            title: isRTL ? "الصفحات الرئيسية" : "Main Pages",
            icon: Home,
            links: [
                { label: isRTL ? "الرئيسية" : "Home", page: Page.HOME },
                { label: isRTL ? "من نحن" : "About Us", page: Page.ABOUT },
                { label: isRTL ? "المتجر" : "Shop / Checkout", page: Page.CHECKOUT },
            ]
        },
        {
            title: isRTL ? "أدوات المحترفين" : "Pro Tools",
            icon: Zap,
            links: [
                { label: content.nav?.macro || "Macro Calculator", page: Page.MACRO },
                { label: content.nav?.injection || "Injection Map", page: Page.INJECTION },
                { label: content.nav?.halflife || "Half-Life Visualizer", page: Page.HALFLIFE },
                { label: content.nav?.lab || "Lab Reference", page: Page.LAB },
                { label: content.nav?.genetic || "Genetic Potential", page: Page.GENETIC },
                { label: content.nav?.cycle || "Cycle Architect", page: Page.CYCLE_ARCHITECT },
            ]
        },
        {
            title: isRTL ? "الحساب الشخصي" : "Account",
            icon: User,
            links: [
                { label: isRTL ? "تسجيل الدخول" : "Login", page: Page.LOGIN },
                { label: isRTL ? "إنشاء حساب" : "Sign Up", page: Page.SIGNUP },
                { label: isRTL ? "لوحة التحكم" : "Dashboard", page: Page.DASHBOARD },
            ]
        },
        {
            title: isRTL ? "القانونية والسياسات" : "Legal & Policies",
            icon: ShieldAlert,
            links: [
                { label: isRTL ? "إخلاء المسؤولية الطبية" : "Medical Disclaimer", page: Page.MEDICAL_DISCLAIMER },
                { label: isRTL ? "سياسة الخصوصية" : "Privacy Policy", action: 'privacy' },
                { label: isRTL ? "شروط الخدمة" : "Terms of Service", action: 'terms' },
            ]
        }
    ];

    return (
        <div className="space-y-12 pb-20">
            <div className="flex items-center gap-6 mb-12">
                <div className="w-16 h-16 rounded-[1.5rem] bg-gold-500/20 flex items-center justify-center text-gold-500 shadow-xl">
                    <Map className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                        {isRTL ? "خريطة الموقع" : "Sitemap"}
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">
                        {isRTL ? "جميع الأقسام والأدوات في مكان واحد" : "All sections and tools in one place"}
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {sections.map((section, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-3 text-gold-500">
                            <section.icon className="w-6 h-6" />
                            <h3 className="text-xl font-black uppercase tracking-tight">{section.title}</h3>
                        </div>
                        <ul className="space-y-4 border-s-2 border-zinc-800 ms-3 ps-6">
                            {section.links.map((link, lIdx) => (
                                <li key={lIdx}>
                                    <button
                                        onClick={() => link.page ? navigateTo(link.page as Page) : null}
                                        className="text-zinc-400 hover:text-white transition-colors text-lg font-medium flex items-center group"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 me-3 group-hover:bg-gold-500 transition-colors" />
                                        {link.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                ))}
            </div>

            {/* SEO Text */}
            <div className="mt-20 p-10 rounded-[2.5rem] bg-zinc-900/50 border border-zinc-800">
                <p className="text-zinc-500 text-sm leading-relaxed max-w-4xl italic">
                    {isRTL
                        ? <>تساعد خريطة الموقع محركات البحث على فهم هيكلية موقع <DynamicBrandLogo inline variant="full" /> بشكل أفضل، مما يضمن وصول المحتوى العلمي والبروتوكولات للأشخاص الذين يبحثون عنها بدقة.</>
                        : <>The sitemap helps search engines better understand the structure of <DynamicBrandLogo inline variant="full" />, ensuring that scientific content and protocols reach the people looking for them accurately.</>}
                </p>
            </div>
        </div>
    );
};

export default SitemapPage;
