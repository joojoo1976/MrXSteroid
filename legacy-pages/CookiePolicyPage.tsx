'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cookie, Settings, ShieldCheck, PieChart } from 'lucide-react';
import { Page, ContentStrings } from '@/shared/types/types';
import { usePreferences } from '../context/PreferencesContext';
import DynamicBrandLogo from '../shared/ui/DynamicBrandLogo';

interface CookiePolicyPageProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

const CookiePolicyPage: React.FC<CookiePolicyPageProps> = ({ content }) => {
    const { isRTL } = usePreferences();
    const categories = [
        {
            title: isRTL ? "ملفات ضرورية" : "Essential Cookies",
            desc: isRTL ? "مطلوبة لتشغيل الموقع، مثل معالجة الدخول وحماية الحسابات." : "Required for site operation, such as processing login and account protection.",
            icon: ShieldCheck
        },
        {
            title: isRTL ? "ملفات تحليلية" : "Analytical Cookies",
            desc: isRTL ? "تساعدنا على فهم كيفية تفاعل المستخدمين مع الموقع لتحسين التجربة." : "Help us understand how users interact with the site to improve the experience.",
            icon: PieChart
        },
        {
            title: isRTL ? "ملفات التفضيلات" : "Preference Cookies",
            desc: isRTL ? "تستخدم لتذكر تفضيلاتك مثل اللغة المختارة ونوع العملة." : "Used to remember your preferences such as selected language and currency type.",
            icon: Settings
        }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
            >
                <div className="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto text-gold-500 mb-6 border border-gold-500/20 shadow-[0_0_30px_-5px_rgba(234,179,8,0.3)]">
                    <Cookie className="w-10 h-10" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                    {content.cookiePolicyTitle}
                </h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">
                    {isRTL ? "كيف نستخدم ملفات تعريف الارتباط" : "How We Use Cookies"}
                </p>
            </motion.div>

            <section className="p-10 rounded-[3rem] bg-zinc-900 border border-zinc-800 space-y-8">
                <div className="space-y-6 text-zinc-400 text-lg leading-relaxed">
                    <p>
                        {isRTL
                            ? <>نحن نستخدم ملفات تعريف الارتباط (Cookies) لتحسين أداء منصة <DynamicBrandLogo inline variant="full" /> وضمان تجربة تسوق آمنة وسلسة. هذه الملفات لا تقوم بجمع أي معلومات شخصية حساسة دون موافقتك الصريحة.</>
                            : <>We use cookies to improve the performance of the <DynamicBrandLogo inline variant="full" /> platform and ensure a safe and smooth shopping experience. These files do not collect any sensitive personal information without your explicit consent.</>}
                    </p>
                </div>

                <div className="grid gap-6">
                    {categories.map((cat, idx) => (
                        <div key={idx} className="flex gap-6 p-6 rounded-2xl bg-zinc-950 border border-zinc-900 items-center">
                            <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center text-gold-500 shrink-0">
                                <cat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-black text-white uppercase tracking-tight">{cat.title}</h4>
                                <p className="text-zinc-500 text-sm">{cat.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <div className="p-10 rounded-[3rem] bg-gold-500/5 border border-gold-500/10 text-center">
                <h3 className="text-xl font-bold mb-4">{isRTL ? "إدارة الخصوصية" : "Privacy Management"}</h3>
                <p className="text-zinc-500 max-w-2xl mx-auto">
                    {isRTL
                        ? "يمكنك تعديل إعدادات ملفات الارتباط من خلال متصفحك أو عبر نافذة الموافقة التي تظهر عند زيارتك الأولى للموقع."
                        : "You can modify cookie settings through your browser or via the consent window that appears upon your first visit to the site."}
                </p>
            </div>
        </div>
    );
};

export default CookiePolicyPage;
